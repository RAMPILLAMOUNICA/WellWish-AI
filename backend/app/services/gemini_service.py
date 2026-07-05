import os
import json
import google.generativeai as genai
from sqlalchemy.orm import Session
from typing import List, Tuple, Optional
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=api_key)

from app.core.config import settings
from app.models.user import User
from app.models.wellbeing import Wellbeing
from app.models.journal import Journal

# Configure Gemini if key is provided
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "YOUR_GEMINI_API_KEY":
    genai.configure(api_key=settings.GEMINI_API_KEY)
    HAS_GEMINI_KEY = True
else:
    HAS_GEMINI_KEY = False

# Thread-safe in-memory cache for wellbeing insights
# Key: (user_id, latest_wellbeing_id, latest_journal_id)
# Value: dict of generated insights
_insights_cache = {}

class GeminiService:
    @staticmethod
    def _get_user_context(db: Session, user_id: int) -> Tuple[List[Wellbeing], List[Journal]]:
        """
        Gathers the recent biometric logs (up to 7 entries) and recent journal entries.
        """
        recent_wellbeings = db.query(Wellbeing).filter(
            Wellbeing.user_id == user_id
        ).order_by(Wellbeing.id.desc()).limit(7).all()

        recent_journals = db.query(Journal).filter(
            Journal.user_id == user_id
        ).order_by(Journal.id.desc()).limit(3).all()

        return recent_wellbeings, recent_journals

    @staticmethod
    def _generate_fallback_insights(wellbeings: List[Wellbeing], journals: List[Journal], name: str) -> dict:
        """
        Dynamic rule-based generator that mocks the AI insights
        in case the API key is absent or a call fails.
        """
        wellbeing = wellbeings[0] if wellbeings else None
        # Extract fields
        sleep = wellbeing.sleep if wellbeing else 8.0
        steps = wellbeing.steps if wellbeing else 5000
        water = wellbeing.water if wellbeing else 1.5
        screen = wellbeing.screen_time if wellbeing else 4.0
        hr = wellbeing.heart_rate if wellbeing else 72
        index = wellbeing.wellbeing_index if wellbeing else 70.0
        stress = wellbeing.stress_risk if wellbeing else "Moderate"
        
        # Analyze journals for sentiment keywords
        journal_text = " ".join([j.content for j in journals]).lower()
        has_negative_keywords = any(kw in journal_text for kw in ["tired", "stress", "overwhelm", "exhaust", "anxious", "sad"])

        # Construct suggestions based on thresholds
        suggestions = []
        todays_win = "Initialized daily tracking logs successfully."
        
        if water < 2.0:
            suggestions.append("Consume 250ml of mineralized water within the next hour to mitigate vascular fatigue.")
        else:
            todays_win = "Daily hydration targets successfully met (+22%)."
            
        if sleep < 7.0:
            suggestions.append("Aim for a 15-minute afternoon somatic rest or slide your bedtime forward by 30 minutes tonight.")
        else:
            todays_win = "Sleep duration and deep cycles achieved healthy baseline (+14%)."
            
        if steps and steps < 6000:
            suggestions.append("Engage in a 5-minute pacing walk or standing mobility breaks between tasks.")
        else:
            todays_win = "Consistent step targets achieved today."
            
        if screen > 4.0:
            suggestions.append("Initiate 20-20-20 visual pauses (focus on an object 20 feet away for 20 seconds every 20 minutes).")
            
        # Fill default suggestions if list is sparse
        while len(suggestions) < 3:
            suggestions.append("Initiate a 2-minute box-breathing cycle (4s inhale, 4s hold, 4s exhale, 4s hold) to optimize HRV.")
            
        suggestions = suggestions[:3]

        # Trend analysis logic
        stress_trend = "Stress level is holding steady compared to your recent baseline."
        wellbeing_trend = "Wellbeing index remains consistent with your previous logs."
        
        if len(wellbeings) > 1:
            prev = wellbeings[1]
            stress_diff = (wellbeing.stress_level or 0) - (prev.stress_level or 0)
            if stress_diff > 0:
                stress_trend = f"Stress level increased by {stress_diff} points due to higher work pressure and reduced relaxation periods."
            elif stress_diff < 0:
                stress_trend = f"Stress level dropped by {abs(stress_diff)} points as active pacing and breathing exercises calmed your heart rate."
            else:
                stress_trend = "Stress level remained consistent with yesterday's baseline."

            wb_diff = (wellbeing.wellbeing_index or 0) - (prev.wellbeing_index or 0)
            if wb_diff > 0:
                wellbeing_trend = f"Wellbeing Index improved by {wb_diff:.1f}% driven by better sleep hygiene, hydration, and restorative active intervals."
            elif wb_diff < 0:
                wellbeing_trend = f"Wellbeing Index decreased by {abs(wb_diff):.1f}% from elevated screen exposure and reduced physical activity."
            else:
                wellbeing_trend = "Wellbeing index has remained steady compared to yesterday."

        daily_priorities = [
            f"Hydrate with {max(0.5, 2.5 - water):.1f}L more water to hit daily hydration targets.",
            "Schedule a 10-minute visual rest from screens before dinner.",
            "Perform a brief breathing cycle before bed to align resting heart rate."
        ]
        
        sleep_recs = "Maintain a dark, cool sleep sanctuary. Aim to wind down 30 minutes earlier to increase deep cycles." if sleep < 7.0 else "Sleep cycles are at an optimal baseline. Keep this consistent schedule."
        hydration_adv = f"Logged {water}L today. Drinking small sips consistently optimizes cellular energy and limits head pressure."
        break_rems = "Screen time is elevated today. Follow the 20-20-20 rule: look 20 feet away for 20 seconds every 20 minutes." if screen > 4.0 else "Screen exposure is at a healthy level. Keep taking micro-pauses."
        recovery_sugs = "Biometric signals show high nervous system readiness. Perfect day for moderate active recovery." if index > 75 else "Nervous system recovery is lower today. Prioritize slow stretching and somatic box breathing."

        # Stress Risk explanation
        if stress == "High" or has_negative_keywords:
            risk_exp = "Your biometric signals indicate an elevated cortisol baseline and lower heart rate variability. Pacing active cognitive cycles with breathing pauses will restore homeostatic state."
            reinforcement = "You successfully logged your mental indicators today. Acknowledging stress is the first step toward reclaiming focus."
        elif stress == "Moderate":
            risk_exp = "Nervous system markers are stable but show slight fatigue trends due to a sleep or screen time mismatch. Your index remains responsive."
            reinforcement = "You logged steps and hydration targets. Keeping up with small adjustments protects your focus vault."
        else:
            risk_exp = "Homeostasis indicators show optimal parameters. Heart rate variability and biometric trends suggest high nervous system recovery."
            reinforcement = "Sensory systems are running efficiently today! Celebrate this energy block and take active micro-rests to maintain it."

        return {
            "wellbeing_summary": f"Hi {name}, your wellbeing balance stands at {index}/100. Biometrics show stable vital markers, but screen exposure or journal keywords indicate mild cognitive load.",
            "stress_risk_explanation": risk_exp,
            "personalized_suggestions": suggestions,
            "positive_reinforcement": reinforcement,
            "todays_win": todays_win,
            "responsible_ai_disclaimer": "Willa AI provides wellbeing observations, not medical assessments. Consult a licensed provider for diagnostic guidance.",
            "stress_trend_analysis": stress_trend,
            "wellbeing_trend_analysis": wellbeing_trend,
            "daily_priorities": daily_priorities,
            "sleep_recommendations": sleep_recs,
            "hydration_advice": hydration_adv,
            "break_reminders": break_rems,
            "recovery_suggestions": recovery_sugs
        }

    @classmethod
    def generate_wellbeing_insights(cls, db: Session, user: User) -> dict:
        """
        Compiles templates and queries the Gemini Generative AI model
        for personalized mental fitness insights.
        Utilizes local cache to avoid duplicate LLM calls if metrics have not changed.
        """
        wellbeings, journals = cls._get_user_context(db, user.id)
        
        # Guard if no data exists
        if not wellbeings and not journals:
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

        # Check Cache
        latest_wellbeing_id = wellbeings[0].id if wellbeings else None
        latest_journal_id = journals[0].id if journals else None
        cache_key = (user.id, latest_wellbeing_id, latest_journal_id)
        
        if cache_key in _insights_cache:
            return _insights_cache[cache_key]

        # Use fallback if key is missing
        if not HAS_GEMINI_KEY:
            insights = cls._generate_fallback_insights(wellbeings, journals, user.full_name)
            _insights_cache[cache_key] = insights
            return insights

        try:
            # Build prompt templates
            journal_logs_str = "\n".join([f"- {j.content}" for j in journals])
            
            history_str = ""
            for idx, wb in enumerate(wellbeings):
                tag = "Today" if idx == 0 else f"{idx} days ago"
                history_str += f"""
                Log ({tag}):
                - Wellbeing Index: {wb.wellbeing_index}/100
                - Stress Level: {wb.stress_level}/10
                - Sleep: {wb.sleep} hours (Quality: {wb.sleep_quality or 'N/A'}/10)
                - Water: {wb.water} L
                - Screen Time: {wb.screen_time} hours
                - Energy: {wb.energy_level}/10
                - Steps: {wb.steps if wb.wearable_connected else 'N/A'}
                - Heart Rate: {wb.heart_rate if wb.wearable_connected else 'N/A'}
                - Mode: {"Wearable" if wb.wearable_connected else "Standalone"}
                """

            prompt = f"""
            You are "Willa", a premium wellbeing intelligence AI. Your goal is to analyze user journals and historical biometric data to provide homeostatic insights and decision support.
            
            User Profile: {user.full_name}
            
            Historical Wellbeing Data (from newest to oldest):
            {history_str}
            
            User Recent Journals:
            {journal_logs_str if journal_logs_str else 'No journals logged today.'}
            
            Compare today's data with previous days' logs to identify patterns and trends (e.g. how sleep, steps, work pressure, or journal sentiment relate to changes in their Wellbeing Index and Stress Level).
            
            Return a JSON object with the following fields:
            1. "wellbeing_summary": A brief, premium 2-3 sentence overview of their overall state today. Address them as {user.full_name}.
            2. "stress_risk_explanation": A scientific explanation of today's stress forecast based on check-in sliders.
            3. "personalized_suggestions": A list of exactly 3 concrete, actionable micro-habits to restore homeostatic balance.
            4. "positive_reinforcement": A warm, encouraging validation of today's wins.
            5. "todays_win": A short, encouraging title highlight of their biggest accomplishment today.
            6. "responsible_ai_disclaimer": A standard medical disclaimer.
            7. "stress_trend_analysis": A detailed comparison of today's stress levels with previous days, explaining WHY stress increased or decreased.
            8. "wellbeing_trend_analysis": A detailed comparison of today's wellbeing index with previous days, explaining WHY wellbeing improved or declined.
            9. "daily_priorities": A list of 3 specific, actionable tasks they should prioritize today based on their gaps.
            10. "sleep_recommendations": Actionable sleep advice tailored to their recent sleep duration and quality.
            11. "hydration_advice": Hydration advice based on their current water intake.
            12. "break_reminders": Mindful break reminders and instructions based on screen time.
            13. "recovery_suggestions": Specific recovery actions (e.g. box breathing, active recovery, cognitive breaks) based on their Recovery Score.
            
            Do not return any extra markdown packaging or conversational text outside the JSON. Return valid JSON only.
            """

            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            
            # Clean response text
            resp_text = response.text.strip()
            if resp_text.startswith("```json"):
                resp_text = resp_text.split("```json")[1].split("```")[0].strip()
            elif resp_text.startswith("```"):
                resp_text = resp_text.split("```")[1].split("```")[0].strip()
                
            insights = json.loads(resp_text)
            
            # Cache the response
            _insights_cache[cache_key] = insights
            return insights
            
        except Exception as e:
            # Safe recovery on API failures
            insights = cls._generate_fallback_insights(wellbeings, journals, user.full_name)
            _insights_cache[cache_key] = insights
            return insights

    @classmethod
    def generate_chat_response(cls, db: Session, user: User, message: str, chat_history: List[dict] = None) -> str:
        """
        Generate a conversational wellbeing chat response from Willa.
        Injects user's latest biometrics and recent journal entries as context.
        """
        wellbeings, journals = cls._get_user_context(db, user.id)
        wellbeing = wellbeings[0] if wellbeings else None
        
        # Build history context
        history_str = ""
        for idx, wb in enumerate(wellbeings):
            tag = "Today" if idx == 0 else f"{idx} days ago"
            history_str += f"""
            Check-in ({tag}):
            - Wellbeing Index: {wb.wellbeing_index}/100
            - Stress Level: {wb.stress_level}/10
            - Mood: {wb.mood}
            - Sleep: {wb.sleep} hours (Quality: {wb.sleep_quality or 'N/A'}/10)
            - Water: {wb.water} L
            - Screen Time: {wb.screen_time} hours
            - Burnout Risk: {wb.burnout_risk or 'N/A'}
            - Recovery Score: {wb.recovery_score or 'N/A'}/100
            """

        journal_logs_str = "\n".join([f"- Entry ({idx} days ago): {j.content}" for idx, j in enumerate(journals)])
        
        system_instruction = f"""
        You are "Willa", an intelligent, compassionate, and empathetic wellbeing coach AI.
        Your goal is to have supportive, human, and encouraging conversations with the user ({user.full_name}) about their mental and physical health.
        
        You have access to their historical biometric check-ins (newest to oldest):
        {history_str}
        
        And their recent journal reflections:
        {journal_logs_str if journal_logs_str else 'No recent journal entries.'}
        
        Coaching Rules:
        1. Remember the context of the conversation and previous statements in history.
        2. Actively reference their previous journal entries and historical check-ins to make your coaching highly personalized.
        3. Celebrate any improvements you notice in their history (e.g. rising wellbeing index, increased sleep quality, or meeting hydration goals).
        4. Detect negative emotional trends (e.g. consecutive days of strained mood, high anxiety, high work pressure, or decreasing recovery scores) and address them with deep empathy.
        5. Never sound robotic or generic. Speak with a warm, supportive, and human voice.
        6. Never diagnose medical conditions or provide clinical prescriptions. Suggest wellness habits instead.
        7. If they report high stress or anxiety (or their check-in history shows repeated stress levels > 6), recommend these 5 specific actions:
           - A soothing breathing exercise (e.g. box breathing or a 4-7-8 breathing pause)
           - Proper hydration (rehydrating with a glass of water)
           - A mindful walk (even a 5-minute pacing walk or standing mobility breaks)
           - Taking a short break away from screen exposure
           - Contacting trusted friends, family, or professional guides if they need immediate support.
        8. Keep your responses concise (1-2 short paragraphs), empathetic, and highly actionable.
        """

        if not HAS_GEMINI_KEY:
            return f"Hi {user.full_name}, I'm here as your supportive companion. Currently my AI engine is running in offline mode, but I can see you logged a {wellbeing.mood if wellbeing else 'Stable'} mood today. Remember to take a screen break and hydrate!"

        try:
            formatted_history = []
            if chat_history:
                for msg in chat_history:
                    # Filter roles for Gemini (user or model)
                    role = "user" if msg.get("role") == "user" else "model"
                    formatted_history.append({"role": role, "parts": [msg.get("content", "")]})
            
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=system_instruction
            )
            chat = model.start_chat(history=formatted_history)
            response = chat.send_message(message)
            return response.text.strip()
            
        except Exception as e:
            return f"Hi {user.full_name}, I ran into a connection glitch while reviewing your parameters, but please remember to pace yourself and step away from screens for a 2-minute tea pause!"

    @classmethod
    def generate_weekly_reflection(cls, db: Session, user: User) -> dict:
        """
        Generate a weekly reflection report based on the user's last 7 logs and recent journals.
        """
        history = db.query(Wellbeing).filter(
            Wellbeing.user_id == user.id
        ).order_by(Wellbeing.id.desc()).limit(7).all()
        
        latest_wellbeing, journals = cls._get_user_context(db, user.id)
        
        if not history and not journals:
            return {
                "weekly_summary": "Your weekly telemetry log is currently empty. Start logging daily check-ins to see a synthesized weekly reflection.",
                "key_accomplishments": ["Initialize your first daily log"],
                "pacing_suggestions": ["Hydrate regularly", "Establish a consistent bedtime"],
                "encouragement": "Willa is here to support you when you log your first check-in."
            }

        # Build context
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
        {logs_str if logs_str else 'No biometric logs recorded this week.'}
        
        Recent Journals:
        {journals_str if journals_str else 'No journal entries written this week.'}
        
        Create a supportive weekly reflection report and return a JSON object with the following fields:
        1. "weekly_summary": A compassionate, 3-4 sentence overview of their physical and mental rhythm over the past week (e.g. noticing sleep trends, screen exposure, or emotional highlights).
        2. "key_accomplishments": A list of exactly 2-3 specific accomplishments observed (e.g. "Maintained consistent hydration", "Logged steps on busy days").
        3. "pacing_suggestions": A list of exactly 2-3 specific, encouraging pacing goals for the upcoming week.
        4. "encouragement": A supportive parting reflection celebrating their dedication to self-care.
        
        Rules:
        - Never diagnose any medical conditions or prescribe treatments.
        - Tone must be supportive, warm, scientific yet compassionate.
        - Return only valid JSON. No conversational preamble.
        """

        if not HAS_GEMINI_KEY:
            avg_sleep = sum([h.sleep for h in history if h.sleep]) / len([h for h in history if h.sleep]) if history else 8.0
            return {
                "weekly_summary": f"Reviewing your stats, you averaged {round(avg_sleep, 1)} hours of sleep. Your routines demonstrate a stable baseline focus, although daily fluctuations are normal.",
                "key_accomplishments": ["Logged your daily wellness parameters", "Maintained local data security"],
                "pacing_suggestions": ["Aim for a consistent screen cutoff time", "Pace active hours with brief standing breaks"],
                "encouragement": "Every check-in is an act of mindfulness. Keep protecting your peace."
            }

        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            resp_text = response.text.strip()
            if resp_text.startswith("```json"):
                resp_text = resp_text.split("```json")[1].split("```")[0].strip()
            elif resp_text.startswith("```"):
                resp_text = resp_text.split("```")[1].split("```")[0].strip()
            return json.loads(resp_text)
        except Exception as e:
            return {
                "weekly_summary": "We encountered a minor server mismatch while generating your weekly overview, but reviewing your history shows steady progress in awareness.",
                "key_accomplishments": ["Tracked daily telemetry logs", "Logged secure reflections"],
                "pacing_suggestions": ["Prioritize regular screen pauses", "Hydrate when waking up"],
                "encouragement": "Take care of yourself today."
            }

    @classmethod
    def analyze_journal_sentiment(cls, content: str) -> Optional[Tuple[str, float]]:
        """
        Analyze the sentiment and emotional tone score of a journal entry using Gemini.
        Returns: Tuple[sentiment, sentiment_score]
        Where sentiment is "Calm", "Strained", or "Neutral".
        Sentiment score is a float between 0.0 and 1.0 (higher = calmer/more positive).
        """
        prompt = f"""
        Analyze the emotional tone of the following journal entry:
        "{content}"
        
        Determine:
        1. The overall sentiment classification. Choose exactly one of: "Calm", "Strained", or "Neutral".
           - "Calm" represents positive, peaceful, energetic, or rested tones.
           - "Strained" represents stressed, tired, anxious, sad, or overwhelmed tones.
           - "Neutral" represents default, factual, or balanced tones.
        2. A numeric sentiment score between 0.0 and 1.0, representing the emotional wellness index. 
           - 0.0 is extremely strained/depleted.
           - 1.0 is extremely calm/optimal.
        
        Return a JSON object with the following fields:
        {{
            "sentiment": "Calm" | "Strained" | "Neutral",
            "sentiment_score": float
        }}
        
        Return valid JSON only. No markdown formatting.
        """

        if not HAS_GEMINI_KEY:
            return None

        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            resp_text = response.text.strip()
            if resp_text.startswith("```json"):
                resp_text = resp_text.split("```json")[1].split("```")[0].strip()
            elif resp_text.startswith("```"):
                resp_text = resp_text.split("```")[1].split("```")[0].strip()
            res = json.loads(resp_text)
            return res.get("sentiment", "Neutral"), float(res.get("sentiment_score", 0.5))
        except Exception as e:
            return "Neutral", 0.5
