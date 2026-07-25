from typing import Dict, Any, Optional

class PromptBuilder:
    @staticmethod
    def build_chat_system_instruction(user_name: str, context: Dict[str, Any], personality_alignment: Dict[str, str] = None) -> str:
        """
        Builds the unified system instruction prompt for Willa's chat.
        Injects User Profile, target date, historical averages, recent improvements,
        recent declines, journal context, and previous coaching rules.
        """
        averages_7 = context.get("averages_7_days", {})
        averages_30 = context.get("averages_30_days", {})
        target_log = context.get("target_log")
        
        # Format target day biometrics
        if target_log:
            target_log_str = f"""
            Telemetry on selected date ({context.get("selected_date")}):
            - Wellbeing Index: {target_log.wellbeing_index}/100
            - Stress Level: {target_log.stress_level}/10
            - Mood: {target_log.mood or 'N/A'}
            - Sleep: {target_log.sleep} hours (Quality: {target_log.sleep_quality or 'N/A'}/10)
            - Water: {target_log.water} L
            - Steps: {target_log.steps if target_log.wearable_connected else 'N/A'}
            - Screen Time: {target_log.screen_time} hours
            - Burnout Risk: {target_log.burnout_risk or 'N/A'}
            - Recovery Score: {target_log.recovery_score or 'N/A'}/100
            """
        else:
            target_log_str = f"No wellbeing log recorded for the selected date: {context.get('selected_date')}."

        # Format historical averages
        averages_str = f"""
        Averages over the last 7 days:
        - Wellbeing Index: {averages_7.get("wellbeing_index")}/100
        - Sleep: {averages_7.get("sleep")} hours
        - Water: {averages_7.get("water")} L
        - Stress Level: {averages_7.get("stress")}/10
        - Recovery Score: {averages_7.get("recovery_score")}/100
        - Steps: {averages_7.get("steps")}

        Averages over the last 30 days:
        - Wellbeing Index: {averages_30.get("wellbeing_index")}/100
        - Sleep: {averages_30.get("sleep")} hours
        - Water: {averages_30.get("water")} L
        - Stress Level: {averages_30.get("stress")}/10
        - Recovery Score: {averages_30.get("recovery_score")}/100
        - Steps: {averages_30.get("steps")}
        """

        # Format recent journals with structured insights (emotions, events, topics, stress levels)
        journals_list = []
        for idx, j in enumerate(context.get("recent_journals", [])):
            emotion_tag = f"Emotion: {j.primary_emotion}" if getattr(j, "primary_emotion", None) else ""
            stress_tag = f"Stress Level: {j.stress_level}/10" if getattr(j, "stress_level", None) is not None else ""
            event_tag = f"Event: {j.important_events}" if getattr(j, "important_events", None) else ""
            topic_tag = f"Topics: {j.recurring_topics}" if getattr(j, "recurring_topics", None) else ""
            
            meta = ", ".join([t for t in [emotion_tag, stress_tag, event_tag, topic_tag] if t])
            meta_str = f" ({meta})" if meta else ""
            
            date_str = j.created_at.strftime("%Y-%m-%d") if getattr(j, "created_at", None) else "Unknown Date"
            journals_list.append(f"- Entry on {date_str}: \"{j.content}\"{meta_str}")
        
        journals_str = "\n".join(journals_list)

        # Format detected multi-day trends
        trends_list = context.get("detected_wellbeing_trends", [])
        trends_str = "\n".join([f"- {t}" for t in trends_list]) if trends_list else "No consecutive unhealthy trends detected."

        # Format recent change indicators
        recent_diff = context.get("recent_wb_difference", 0.0)
        if recent_diff > 0:
            change_str = f"Improving (+{recent_diff} points on Wellbeing Index since last check-in)."
        elif recent_diff < 0:
            change_str = f"Declining ({recent_diff} points on Wellbeing Index since last check-in)."
        else:
            change_str = "Stable."

        instruction = f"""
        You are "Willa", a premium, highly intelligent, and empathetic wellbeing coach AI.
        Your goal is to have deeply supportive, human, and encouraging conversations with {user_name} about their mental and physical health.
        
        CRITICAL RULES:
        1. Never answer like a standard general LLM. ALWAYS prioritize the user's personal wellbeing history first!
        2. Reference their actual data (averages, journal topics, specific dates) to justify observations. Avoid generic internet tips.
        3. Explain WHY their parameters shifted using their check-in differences (e.g. sleep duration dropping, screen time rising, or hydration gaps).
        4. If {user_name} asks questions about their stress, fatigue, or mood, immediately connect it to their sleep patterns, screen exposure, or steps.
        5. Celebrate improvements and validate declines with deep empathy. Never be critical or robotic.
        6. Actively consider the SELECTED date context: if they ask about yesterday, last week, or the selected calendar date ({context.get("selected_date")}), answer with respect to the metrics logged on that day while still understanding their long-term history.
        7. Keep responses concise (1-2 paragraphs), conversational, and highly actionable.
        8. Actively scan the 'Recent Journals Context' for recent events, struggles, or emotions. If the user mentions feeling a certain way (e.g. nervous, anxious, happy, tired), identify if their recent journals explain why (e.g., an upcoming interview, parent argument, project completion) and reference the journal naturally (e.g., "You mentioned yesterday that you were worried about your interview..."). Connect past thoughts to the present conversation to demonstrate persistent coaching memory. Do not invent memories—only reference what is explicitly stated in the context.
        
        Selected Date Context:
        {target_log_str}
        
        Historical Trends Context:
        {averages_str}
        
        Recent Wellbeing Index Evolution:
        - Current status: {change_str}
        - Burnout Risk Trend: {context.get("burnout_trend")}
        - Mood Trend: {context.get("mood_trend")}
        
        Recent Journals Context:
        {journals_str if journals_str else 'No recent journal reflections recorded.'}

        Detected Multi-Day Historical Trends & Patterns (IMPORTANT - reference these patterns naturally in conversation, e.g. "You've consistently been sleeping less than 6 hours for four days" instead of isolated metrics):
        {trends_str}
        
        Wellness Coaching Plan:
        - If they report high stress or anxiety (or stress levels > 6), prioritize suggesting breathing pauses, somatic box breathing, and rehydrating with a glass of water.
        """
        alert_str = context.get("proactive_coaching_alert", "")
        if alert_str:
            instruction += f"\n\nActive Proactive Alert:\n{alert_str}\nPlease address this alert gently at the start of your message if the user welcomes you or asks for general daily suggestions."

        if personality_alignment:
            instruction += f"""

            Active Personality Alignment:
            - Detected User State: {personality_alignment.get("emotional_state")}
            - Assigned Conversational Tone: {personality_alignment.get("tone")}
            - Persona Guidance: {personality_alignment.get("coaching_instruction")}
            Adopt this tone fully and adjust your conversational style to align with this emotional profile. Never sound robotic or generic.
            """
        return instruction

    @staticmethod
    def build_insights_prompt(user_name: str, context: Dict[str, Any], decision_analysis: Dict[str, Any], preferred_tone: Optional[str] = None) -> str:
        """
        Builds the prompt template to generate structured wellbeing insights.
        """
        averages_7 = context.get("averages_7_days", {})
        target_log = context.get("target_log")
        
        # Format detected multi-day trends
        trends_list = context.get("detected_wellbeing_trends", [])
        trends_str = "\n".join([f"- {t}" for t in trends_list]) if trends_list else "No consecutive unhealthy trends detected."
        
        if target_log:
            target_str = f"""
            Check-in today:
            - Wellbeing Index: {target_log.wellbeing_index}/100
            - Stress Level: {target_log.stress_level}/10
            - Sleep: {target_log.sleep} hours
            - Water: {target_log.water} L
            - Screen Time: {target_log.screen_time} hours
            - Steps: {target_log.steps if target_log.wearable_connected else 'N/A'}
            - Recovery Score: {target_log.recovery_score}/100
            """
        else:
            target_str = "No wellbeing log recorded for today."

        # Format recent journals
        journals_list = []
        for idx, j in enumerate(context.get("recent_journals", [])):
            emotion_tag = f"Emotion: {j.primary_emotion}" if getattr(j, "primary_emotion", None) else ""
            stress_tag = f"Stress Level: {j.stress_level}/10" if getattr(j, "stress_level", None) is not None else ""
            event_tag = f"Event: {j.important_events}" if getattr(j, "important_events", None) else ""
            topic_tag = f"Topics: {j.recurring_topics}" if getattr(j, "recurring_topics", None) else ""
            summary_tag = f"Summary: {j.summary}" if getattr(j, "summary", None) else ""
            
            meta = ", ".join([t for t in [emotion_tag, stress_tag, event_tag, topic_tag, summary_tag] if t])
            meta_str = f" ({meta})" if meta else ""
            
            date_str = j.created_at.strftime("%Y-%m-%d") if getattr(j, "created_at", None) else "Unknown Date"
            journals_list.append(f"- Entry on {date_str}: \"{j.content}\"{meta_str}")
        journals_str = "\n".join(journals_list) if journals_list else "No recent journal reflections recorded."

        tone_instruction = ""
        if preferred_tone:
            if preferred_tone == "Direct & Analytical":
                tone_instruction = "IMPORTANT: Write all descriptions, observations, summaries, and advice fields in a highly analytical, logical, data-driven, and concise tone."
            elif preferred_tone == "Empathetic & Gentle":
                tone_instruction = "IMPORTANT: Write all descriptions, observations, summaries, and advice fields in a deeply supportive, warm, empathetic, and gentle coaching tone."
            elif preferred_tone == "Motivational Coach":
                tone_instruction = "IMPORTANT: Write all descriptions, observations, summaries, and advice fields in an inspiring, energetic, highly positive, and motivational coaching tone."

        prompt = f"""
        You are "Willa", a premium wellbeing intelligence AI. Your goal is to analyze user journals and historical biometrics to provide homeostatic insights and decision support.
        
        {tone_instruction}
        
        User Profile: {user_name}
        
        Today's Telemetry:
        {target_str}
        
        Averages Over Last 7 Days:
        - Wellbeing Index: {averages_7.get("wellbeing_index")}/100
        - Sleep: {averages_7.get("sleep")} hours
        - Water: {averages_7.get("water")} L
        - Stress Level: {averages_7.get("stress")}/10
        - Recovery Score: {averages_7.get("recovery_score")}/100
        
        Decision Engine Shift Analysis:
        - Explanation: {decision_analysis.get("explanation")}
        - Highest Impact Driver: {decision_analysis.get("impact_driver")}
        - Highest Impact Action: {decision_analysis.get("highest_impact_action")}

        Detected Multi-Day Historical Trends & Patterns:
        {trends_str}

        Recent Journal Reflections:
        {journals_str}
        
        Return a JSON object with the following fields:
        1. "wellbeing_summary": A single, concise, data-driven paragraph summarizing today's wellbeing. It must naturally synthesize their recent journal reflections (emotions, events, topics) with physical metrics today. Address them as {user_name} and write it like a personalized medical wellness report. Avoid generic advice.
        2. "stress_risk_explanation": A scientific explanation of today's stress forecast based on check-in sliders and emotional triggers identified in their journals.
        3. "personalized_suggestions": A list of exactly 3 concrete, actionable micro-habits to restore homeostatic balance. Blend physical vitals advice with cognitive recommendations responding to topics in their journal.
        4. "positive_reinforcement": A warm, encouraging validation of today's wins. Include confirmation of emotional or cognitive progress in their journal.
        5. "todays_win": A short, encouraging title highlight of their biggest accomplishment today (can be metric-based or reflection-based).
        6. "responsible_ai_disclaimer": "Willa AI provides wellbeing observations, not medical assessments. Consult a licensed provider for diagnostic guidance."
        7. "stress_trend_analysis": A detailed comparison of today's stress levels with previous days, explaining WHY stress increased or decreased, referencing journal events if relevant.
        8. "wellbeing_trend_analysis": A detailed comparison of today's wellbeing index with previous days, explaining WHY wellbeing improved or declined.
        9. "daily_priorities": A list of exactly 3 to 5 highly specific, achievable wellness actions today. Each action must explain why it is recommended based on today's vitals, trends, or journal entries, written in the warm, supportive tone of a personal wellbeing coach. Avoid repeating topics.
        10. "sleep_recommendations": Actionable sleep advice tailored to their recent sleep duration and quality.
        11. "hydration_advice": Hydration advice based on their current water intake.
        12. "break_reminders": Mindful break reminders and instructions based on screen time.
        13. "recovery_suggestions": Specific recovery actions (e.g. box breathing, active recovery, cognitive breaks) based on their Recovery Score.
        
        Return valid JSON only. Do not return any extra markdown packaging.
        """
        return prompt
