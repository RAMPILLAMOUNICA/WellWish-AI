import json
import google.generativeai as genai
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from app.models.user import User
from app.models.wellbeing import Wellbeing
from app.core.config import settings
from app.services.context_builder import ContextBuilder
from app.services.decision_engine import DecisionEngine
from app.services.prompt_builder import PromptBuilder

# Cache local dict for insights
_insights_cache = {}

class InsightGenerator:
    @staticmethod
    def _generate_fallback_insights(context: Dict[str, Any], decision_analysis: Dict[str, Any], name: str) -> dict:
        """
        Rule-based generator that mocks the AI insights if Gemini API is disabled.
        """
        # Check if journal exists
        recent_journals = context.get("recent_journals", [])
        latest_journal = recent_journals[0] if recent_journals else None

        target_log = context.get("target_log")
        sleep = target_log.sleep if target_log else 8.0
        water = target_log.water if target_log else 2.0
        screen = target_log.screen_time if target_log else 4.0
        index = target_log.wellbeing_index if target_log else 70.0
        stress = target_log.stress_risk if target_log else "Moderate"

        if not target_log and latest_journal:
            # Estimate fallback index and stress from journal analysis
            j_stress = latest_journal.stress_level or 3
            index = 100 - (j_stress * 8)
            if latest_journal.sentiment == "Positive":
                index += 10
            elif latest_journal.sentiment == "Negative":
                index -= 10
            index = max(10, min(100, index))
            stress = "High" if j_stress >= 7 else "Moderate" if j_stress >= 4 else "Low"

        suggestions = []
        todays_win = "Initialized daily tracking logs successfully."
        if latest_journal and getattr(latest_journal, "primary_emotion", None):
            todays_win = f"Identified emotional baseline focus: {latest_journal.primary_emotion}."
        
        if water < 2.0:
            suggestions.append("Consume 250ml of mineralized water within the next hour to mitigate vascular fatigue.")
        else:
            todays_win = "Daily hydration targets successfully met (+22%)."
            
        if sleep < 7.0:
            suggestions.append("Aim for a 15-minute afternoon somatic rest or slide your bedtime forward by 30 minutes tonight.")
        else:
            if not latest_journal:
                todays_win = "Sleep duration and deep cycles achieved healthy baseline (+14%)."

        if latest_journal and getattr(latest_journal, "recommended_focus", None):
            suggestions.append(f"Focus on your recommended area: {latest_journal.recommended_focus.lower()}.")

        while len(suggestions) < 3:
            suggestions.append("Initiate a 2-minute box-breathing cycle to optimize HRV.")

        daily_priorities = [
            f"Drink {max(0.2, 2.5 - water):.1f}L of water to flush out fatigue and support cellular energy.",
            f"Restrict screen exposure for 10 minutes to alleviate digital eye strain.",
            f"Implement somatic breathing and {decision_analysis.get('highest_impact_action').lower() if decision_analysis.get('highest_impact_action') else 'take a physical walk'} to reset your nervous system."
        ]
        if latest_journal and getattr(latest_journal, "recommended_focus", None):
            daily_priorities.append(f"Act on journal recommendation: {latest_journal.recommended_focus}.")

        # Determine improvement and concern for fallback narrative
        biggest_improvement = "hydration routines" if water >= 2.0 else "sleep schedule" if sleep >= 7.0 else "physical mobility"
        biggest_concern = "elevated stress indicators" if stress == "High" else "prolonged screen exposure" if screen > 4.5 else "hydration deficits"
        trend_direction = "improved compared to previous checks" if context.get("recent_wb_difference", 0.0) > 0 else "declined compared to yesterday's baseline" if context.get("recent_wb_difference", 0.0) < 0 else "held steady compared to yesterday"
        rec = suggestions[0] if suggestions else "prioritize active somatic breaks"

        wellbeing_summary = (
            f"Hi {name}, your overall wellbeing balance resolves at {index}/100 today. "
            f"Your metrics show that your biggest improvement is in your {biggest_improvement}, "
            f"while {biggest_concern} remains the primary concern. "
            f"Your trend has {trend_direction} (Index Shift: {context.get('recent_wb_difference', 0.0)} pts). "
        )
        if latest_journal:
            wellbeing_summary += f"Based on your recent reflection ('{latest_journal.content[:40]}...'), you are experiencing a state of {latest_journal.primary_emotion or 'neutrality'}. "
        wellbeing_summary += f"To support your recovery today, I recommend you {rec.lower().strip('.')}."

        return {
            "wellbeing_summary": wellbeing_summary,
            "stress_risk_explanation": f"Stress forecasting index resolves as {stress}. " + decision_analysis.get("explanation"),
            "personalized_suggestions": suggestions[:3],
            "positive_reinforcement": "You successfully logged your mental indicators today. Every check-in is an act of self-care.",
            "todays_win": todays_win,
            "responsible_ai_disclaimer": "Willa AI provides wellbeing observations, not medical assessments. Consult a provider for clinical guidance.",
            "stress_trend_analysis": decision_analysis.get("explanation"),
            "wellbeing_trend_analysis": f"Wellbeing Index is responsive to metric adjustments (Shift: {context.get('recent_wb_difference')} pts).",
            "daily_priorities": daily_priorities[:5],
            "sleep_recommendations": "Maintain a cool, dark sleep sanctuary. Aim to increase sleep duration to expand recovery cycles.",
            "hydration_advice": f"Logged {water}L. Sipping water consistently optimizes cellular energy.",
            "break_reminders": "Pace screen time with somatic micro-pauses.",
            "recovery_suggestions": "Perform deep somatic breathing to activate parasympathetic states."
        }

    @classmethod
    def generate_insights(cls, db: Session, user: User, target_date: Optional[str] = None) -> dict:
        """
        Gathers context, runs decision analysis, and hits Gemini for structured insights.
        """
        # Gathers context
        context = ContextBuilder.build_wellbeing_context(db, user.id, target_date)
        
        # Guard if no data exists
        if context.get("all_checkins_count") == 0 and not context.get("recent_journals"):
            return {
                "wellbeing_summary": f"Hello {user.full_name}, your telemetry vault is currently empty.",
                "stress_risk_explanation": "Please log a daily check-in or journal entry to generate AI wellbeing analyses.",
                "personalized_suggestions": ["Log your sleep and steps index", "Connect your wearable devices", "Add a brief journal entry"],
                "positive_reinforcement": "Setting up your vault is a great step toward wellbeing awareness.",
                "todays_win": "Initialized daily tracking logs successfully.",
                "responsible_ai_disclaimer": "Observations provided for informational use only.",
                "stress_trend_analysis": "No trend data available.",
                "wellbeing_trend_analysis": "No trend data available.",
                "daily_priorities": ["Log a daily check-in", "Sync health devices", "Add a journal entry"],
                "sleep_recommendations": "Establish a consistent sleep schedule between 7-9 hours.",
                "hydration_advice": "Aim to drink at least 2.0 to 2.5 Liters of water daily.",
                "break_reminders": "Take a 5-minute break every 60 minutes of screen time.",
                "recovery_suggestions": "Balance higher stress activities with active restorative recovery."
            }

        # Check cache
        target_log = context.get("target_log")
        # Check cache
        target_log = context.get("target_log")
        target_log_id = target_log.id if target_log else None
        recent_journals = context.get("recent_journals")
        latest_journal_id = recent_journals[0].id if recent_journals else None
        
        from app.services.proactive_coaching_service import ProactiveCoachingService
        coaching = ProactiveCoachingService.detect_trends(db, user.id)

        cache_key = (user.id, target_log_id, latest_journal_id, context.get("selected_date"))
        if cache_key in _insights_cache:
            res = _insights_cache[cache_key]
            res["proactive_coaching"] = coaching
            return res

        # Decision analysis
        decision_analysis = DecisionEngine.analyze_score_change(target_log, context.get("averages_7_days"))

        # Fallback offline insights if API key is missing
        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
            insights = cls._generate_fallback_insights(context, decision_analysis, user.full_name)
            insights["proactive_coaching"] = coaching
            _insights_cache[cache_key] = insights
            return insights

        try:
            prompt = PromptBuilder.build_insights_prompt(user.full_name, context, decision_analysis, preferred_tone=user.ai_tone)
            
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-3.5-flash-lite")
            response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            resp_text = response.text.strip()
            
            if resp_text.startswith("```json"):
                resp_text = resp_text.split("```json")[1].split("```")[0].strip()
            elif resp_text.startswith("```"):
                resp_text = resp_text.split("```")[1].split("```")[0].strip()
                
            insights = json.loads(resp_text)
            insights["proactive_coaching"] = coaching
            _insights_cache[cache_key] = insights
            return insights
            
        except Exception as e:
            print("Failed to generate insights", e)
            insights = cls._generate_fallback_insights(context, decision_analysis, user.full_name)
            insights["proactive_coaching"] = coaching
            _insights_cache[cache_key] = insights
            return insights

    @staticmethod
    def generate_weekly_reflection(db: Session, user: User) -> dict:
        """
        Generates weekly reflection reports based on averages and recent check-ins.
        """
        # Query past week logs
        history = db.query(Wellbeing).filter(
            Wellbeing.user_id == user.id
        ).order_by(Wellbeing.logged_date.desc(), Wellbeing.id.desc()).limit(7).all()
        
        context = ContextBuilder.build_wellbeing_context(db, user.id)
        journals = context.get("recent_journals", [])

        if not history and not journals:
            return {
                "weekly_summary": "Your weekly telemetry log is currently empty. Start logging daily check-ins to see a synthesized weekly reflection.",
                "key_accomplishments": ["Initialize your first daily log"],
                "pacing_suggestions": ["Hydrate regularly", "Establish a consistent bedtime"],
                "encouragement": "Willa is here to support you when you log your first check-in.",
                "wellbeing_trend": "No trend data available.",
                "stress_trend": "No trend data available.",
                "sleep_consistency": "No sleep logs recorded.",
                "hydration_consistency": "No hydration logs recorded.",
                "mood_pattern": "No mood entries logged.",
                "achievements": ["Create your first log"],
                "areas_for_improvement": ["Establish logging consistency"],
                "focus_goal_next_week": "Log at least 3 check-ins next week to establish a metric baseline."
            }

        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
            avg_sleep = context.get("averages_7_days", {}).get("sleep", 8.0)
            avg_water = context.get("averages_7_days", {}).get("water", 1.8)
            avg_stress = context.get("averages_7_days", {}).get("stress", 3.0)
            avg_wb = context.get("averages_7_days", {}).get("wellbeing_index", 75.0)
            
            sleep_cons = "Consistent (averaged > 7h)" if avg_sleep >= 7.0 else "Inconsistent (averaged < 7h)"
            water_cons = "Consistent (averaged > 2L)" if avg_water >= 2.0 else "Inconsistent (averaged < 2L)"
            
            return {
                "weekly_summary": f"Reviewing your stats, you averaged {round(avg_sleep, 1)} hours of sleep. Your routines demonstrate a stable baseline focus, although daily fluctuations are normal.",
                "key_accomplishments": ["Logged your daily wellness parameters", "Maintained local data security"],
                "pacing_suggestions": ["Aim for a consistent screen cutoff time", "Pace active hours with brief standing breaks"],
                "encouragement": "Every check-in is an act of mindfulness. Keep protecting your peace.",
                "wellbeing_trend": f"Stable average of {round(avg_wb, 1)}/100 wellbeing score.",
                "stress_trend": f"Average stress level at {round(avg_stress, 1)}/10.",
                "sleep_consistency": sleep_cons,
                "hydration_consistency": water_cons,
                "mood_pattern": "Neutral mood baseline observed.",
                "achievements": ["Maintained daily logging cycles", "Tracked physical parameters"],
                "areas_for_improvement": ["Ensure hydration targets are met", "Limit excessive evening screen usage"],
                "focus_goal_next_week": "Focus on improving hydration by drinking at least 2.2L water daily next week."
            }

        try:
            logs_summary = []
            for idx, entry in enumerate(history):
                logs_summary.append(
                    f"Log {idx+1}: Wellbeing Index {entry.wellbeing_index or 70.0}/100, Mood: {entry.mood or 'N/A'}, Sleep: {entry.sleep or 'N/A'} hrs, Water: {entry.water or 'N/A'} L, Steps: {entry.steps or 'N/A'}, Screen: {entry.screen_time or 'N/A'} hrs"
                )
            logs_str = "\n".join(logs_summary)
            journals_str = "\n".join([f"- {j.content}" for j in journals])

            prompt = f"""
            You are "Willa", a warm, supportive wellbeing companion AI.
            Analyze the past week's wellbeing biometrics and journal reflections for {user.full_name}.
            
            Week's Biometrics:
            {logs_str}
            
            Recent Journals:
            {journals_str if journals_str else 'No journal entries written this week.'}
            
            Create a supportive weekly reflection report and return a JSON object with the following fields:
            1. "weekly_summary": A compassionate, 3-4 sentence overview of their physical and mental rhythm over the past week (e.g. noticing sleep trends, screen exposure, or emotional highlights).
            2. "key_accomplishments": A list of exactly 2-3 specific accomplishments observed (e.g. "Maintained consistent hydration", "Logged steps on busy days").
            3. "pacing_suggestions": A list of exactly 2-3 specific, encouraging pacing goals for the upcoming week.
            4. "encouragement": A supportive parting reflection celebrating their dedication to self-care.
            
            5. "wellbeing_trend": A description of their 7-day wellbeing index trend (e.g., whether it rose, fell, or remained stable, citing averages).
            6. "stress_trend": A description of their stress level changes over the week, noting any peaks or patterns.
            7. "sleep_consistency": An analysis of their sleep duration and quality patterns (e.g., whether bedtimes were erratic or duration fluctuated).
            8. "hydration_consistency": An analysis of their daily water logs compared to target thresholds.
            9. "mood_pattern": A description of their dominant mood state and variations.
            10. "achievements": A list of 2-3 specific Achievements/Wins observed.
            11. "areas_for_improvement": A list of 2-3 specific Areas for Improvement identified.
            12. "focus_goal_next_week": Exactly one clear, achievable focus goal for the upcoming week.
            
            Return only valid JSON.
            """

            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-3.5-flash-lite")
            response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            resp_text = response.text.strip()
            
            if resp_text.startswith("```json"):
                resp_text = resp_text.split("```json")[1].split("```")[0].strip()
            elif resp_text.startswith("```"):
                resp_text = resp_text.split("```")[1].split("```")[0].strip()
                
            data = json.loads(resp_text)
            
            # Ensure fallbacks for Pydantic model response validation
            if "achievements" not in data:
                data["achievements"] = data.get("key_accomplishments", [])
            if "areas_for_improvement" not in data:
                data["areas_for_improvement"] = data.get("pacing_suggestions", [])
            if "focus_goal_next_week" not in data:
                data["focus_goal_next_week"] = data.get("pacing_suggestions", ["Prioritize daily movement cutoffs"])[0]
            if "wellbeing_trend" not in data:
                data["wellbeing_trend"] = "Stable wellbeing index average."
            if "stress_trend" not in data:
                data["stress_trend"] = "Stable stress baseline."
            if "sleep_consistency" not in data:
                data["sleep_consistency"] = "Sleep duration holds consistent averages."
            if "hydration_consistency" not in data:
                data["hydration_consistency"] = "Hydration metrics are stable."
            if "mood_pattern" not in data:
                data["mood_pattern"] = "Balanced mood observed."
                
            return data
            
        except Exception as e:
            print("Weekly reflection failed", e)
            avg_sleep = context.get("averages_7_days", {}).get("sleep", 8.0)
            avg_water = context.get("averages_7_days", {}).get("water", 1.8)
            avg_stress = context.get("averages_7_days", {}).get("stress", 3.0)
            avg_wb = context.get("averages_7_days", {}).get("wellbeing_index", 75.0)
            
            sleep_cons = "Consistent (averaged > 7h)" if avg_sleep >= 7.0 else "Inconsistent (averaged < 7h)"
            water_cons = "Consistent (averaged > 2L)" if avg_water >= 2.0 else "Inconsistent (averaged < 2L)"

            return {
                "weekly_summary": "We encountered a minor server mismatch while generating your weekly overview, but reviewing your history shows steady progress in awareness.",
                "key_accomplishments": ["Tracked daily telemetry logs", "Logged secure reflections"],
                "pacing_suggestions": ["Prioritize regular screen pauses", "Hydrate when waking up"],
                "encouragement": "Take care of yourself today.",
                "wellbeing_trend": f"Stable average of {round(avg_wb, 1)}/100 wellbeing score.",
                "stress_trend": f"Average stress level at {round(avg_stress, 1)}/10.",
                "sleep_consistency": sleep_cons,
                "hydration_consistency": water_cons,
                "mood_pattern": "Neutral mood baseline observed.",
                "achievements": ["Maintained daily logging cycles", "Tracked physical parameters"],
                "areas_for_improvement": ["Ensure hydration targets are met", "Limit excessive evening screen usage"],
                "focus_goal_next_week": "Focus on improving hydration by drinking at least 2.2L water daily next week."
            }
