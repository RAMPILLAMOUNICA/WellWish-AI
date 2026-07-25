from typing import Dict, Any, Optional

class PersonalityEngine:
    @staticmethod
    def detect_emotional_state_and_tone(context: Dict[str, Any], user_message: str, preferred_tone: Optional[str] = None) -> Dict[str, str]:
        """
        Analyzes recent user vitals, proactive alerts, journal entries,
        and current text inputs to detect their emotional state and choose a matching tone.
        Tones implemented: Gentle, Motivational, Reflective, Celebratory, Calm, Practical.
        """
        msg_lower = user_message.lower()
        target_log = context.get("target_log")
        averages_7 = context.get("averages_7_days", {})
        
        # Default fallback values
        emotional_state = "Neutral"
        tone = "Reflective"
        coaching_guidance = "Speak as a calm, mindful observer. Ask gentle open-ended questions about their week."

        # Detect keyword patterns
        has_anxiety_words = any(w in msg_lower for w in ["anxious", "stress", "panic", "worry", "scared", "overwhelm", "pressure"])
        has_fatigue_words = any(w in msg_lower for w in ["tired", "exhausted", "fatigue", "sleepy", "lazy", "no energy", "burnout"])
        has_happy_words = any(w in msg_lower for w in ["happy", "good", "great", "glad", "won", "achieved", "completed", "awesome"])
        has_factual_words = any(w in msg_lower for w in ["what", "why", "average", "metrics", "stats", "how many", "explain"])

        stress_level = target_log.stress_level if target_log and target_log.stress_level is not None else averages_7.get("stress", 3.0)
        sleep_quality = target_log.sleep_quality if target_log and target_log.sleep_quality is not None else 7.0
        steps = target_log.steps if target_log and target_log.steps is not None else averages_7.get("steps", 5000.0)
        water = target_log.water if target_log and target_log.water is not None else averages_7.get("water", 2.0)
        wellbeing_diff = context.get("recent_wb_difference", 0.0)

        # 1. State: Overwhelmed / Stressed -> Tone: Calm
        if has_anxiety_words or stress_level >= 7.0:
            emotional_state = "Overwhelmed"
            tone = "Calm"
            coaching_guidance = (
                "Adopt a highly soothing, grounding, and slow conversational cadence. "
                "Do not overwhelm them with metrics. Gently invite them to perform a brief box-breathing cycle "
                "or rest their eyes from screens."
            )

        # 2. State: Fatigued / Depleted -> Tone: Gentle
        elif has_fatigue_words or sleep_quality < 5.0 or context.get("burnout_trend") == "Elevated":
            emotional_state = "Fatigued"
            tone = "Gentle"
            coaching_guidance = (
                "Speak with deep empathy, warmth, and care. Acknowledge their physical exhaustion. "
                "Suggest gentle restorative rests, warm sips of tea, and dynamic wind-downs instead of pushing "
                "for strict physical targets."
            )

        # 3. State: Accomplished -> Tone: Celebratory
        elif has_happy_words or (steps >= 10000) or (water >= 2.5) or (wellbeing_diff > 5.0):
            emotional_state = "Accomplished"
            tone = "Celebratory"
            coaching_guidance = (
                "Show genuine joy and validate their achievements with high energy. "
                "Highlight the specific metrics they successfully logged (such as hitting hydration goals or sleep duration gains). "
                "Encourage them to celebrate these healthy baselines."
            )

        # 4. State: Low Motivation -> Tone: Motivational
        elif steps < 3000 or averages_7.get("steps", 5000) < 3000:
            emotional_state = "Low Motivation"
            tone = "Motivational"
            coaching_guidance = (
                "Inject encouraging, positive, and forward-looking energy. "
                "Gently motivate them to try a 5-minute movement break or short stroll. "
                "Help them see how small shifts build baseline physical momentum."
            )

        # 5. State: Curious -> Tone: Practical
        elif has_factual_words:
            emotional_state = "Curious"
            tone = "Practical"
            coaching_guidance = (
                "Provide direct, logical, and factual support. Focus on comparing metrics and averages clearly. "
                "Explain shifts using evidence (e.g. hydration vs sleep quality) and outline realistic actionable tasks."
            )

        if preferred_tone:
            if preferred_tone == "Direct & Analytical":
                tone = "Direct & Analytical"
                coaching_guidance = (
                    "Provide highly analytical, logical, concise, and direct insights. "
                    "Focus on comparing biometrics and historical averages. Limit emotional language. "
                    f"Reflect the user's current detected emotional state ({emotional_state}) through a data-driven lens."
                )
            elif preferred_tone == "Empathetic & Gentle":
                tone = "Empathetic & Gentle"
                coaching_guidance = (
                    "Adopt a highly supportive, gentle, warm, and empathetic conversational cadence. "
                    "Validate any fatigue, overwhelm, or stress with deep compassion. "
                    f"Reflect their current emotional state ({emotional_state}) with warmth and box-breathing/relaxation recommendations."
                )
            elif preferred_tone == "Motivational Coach":
                tone = "Motivational Coach"
                coaching_guidance = (
                    "Speak with inspiring, energetic, positive, and forward-looking coaching style. "
                    "Encourage movement, steps, hydration, and active recovery. "
                    f"Guide them through their current state ({emotional_state}) by building daily momentum with high motivation."
                )

        return {
            "emotional_state": emotional_state,
            "tone": tone,
            "coaching_instruction": coaching_guidance
        }
