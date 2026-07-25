import json
import google.generativeai as genai
from typing import List, Tuple, Optional, Dict, Any
from app.models.journal import Journal
from app.core.config import settings

class JournalContextService:
    @staticmethod
    def analyze_journal_sentiment(content: str) -> Optional[Tuple[str, float]]:
        """
        Backward-compatible sentiment analyzer.
        """
        analysis = JournalContextService.analyze_journal_entry(content)
        return analysis.get("sentiment", "Neutral"), analysis.get("sentiment_score", 0.5)

    @staticmethod
    def analyze_journal_entry(content: str) -> Dict[str, Any]:
        """
        Analyze a journal entry using Gemini Generative AI.
        Extracts primary emotion, secondary emotions, sentiment, stress level, burnout risk, confidence, topics, and cognitive patterns.
        """
        # Guard for empty input
        clean_content = content.strip() if content else ""
        if not clean_content:
            return {
                "primary_emotion": "Neutral",
                "secondary_emotions": [],
                "sentiment": "Neutral",
                "sentiment_score": 0.5,
                "stress_level": 1,
                "burnout_risk": "Low",
                "confidence": 0.0,
                "topics": [],
                "recurring_topics": "None",
                "important_events": "None",
                "summary": "Empty journal entry.",
                "recommended_focus": "Self-reflection",
                "positive_points": [],
                "warning_signs": [],
                "cognitive_patterns": []
            }

        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
            return JournalContextService._lexical_fallback(clean_content)

        prompt = f"""
        You are acting as an expert NLP Engineer and Senior Wellbeing Intelligence Coach.
        Analyze the following user journal entry:
        "{clean_content}"

        Extract and determine the following features based on the context:
        1. "primary_emotion": The single most dominant emotional state (e.g. Relieved, Excited, Sad, Anxious, Hopeful, Tired, Frustrated, Grateful, Neutral, Angry, Calm, Stressed, Peaceful).
        2. "secondary_emotions": A list of up to 3 supporting emotional states (e.g. ["Fatigue", "Insecurity"] or ["Joy", "Relief"]).
        3. "sentiment": Overall sentiment classification. Choose exactly one of: "Positive", "Neutral", or "Negative".
        4. "sentiment_score": A float score between 0.0 and 1.0 (where 0.0 is very negative/strained, 1.0 is very positive/calm, and 0.5 is neutral).
        5. "stress_level": Integer stress rating from 1 (completely calm) to 10 (extreme panic/stress).
        6. "burnout_risk": The user's risk level for burnout. Choose exactly one of: "Low", "Medium", or "High".
        7. "confidence": A confidence score for the emotional analysis between 0.0 and 1.0.
        8. "topics": A list of 2-3 primary topics discussed (e.g. ["Work", "Fatigue"] or ["Family", "Conflict"]).
        9. "summary": A concise, compassionate, data-driven wellness summary (1-2 sentences) explaining the user's emotional state.
        10. "recommended_focus": One clear, actionable area of focus to restore or maintain homeostatic balance (e.g. "Somatic recovery", "Time management", "Setting boundaries").
        11. "positive_points": A list of up to 3 positive thoughts, gains, or self-care accomplishments mentioned or implied.
        12. "warning_signs": A list of up to 3 mental or physical stress triggers or warning signs mentioned (e.g. lack of sleep, screen fatigue, emotional strain).
        13. "cognitive_patterns": A list of cognitive patterns or distortions identified (e.g., ["Catastrophizing", "All-or-Nothing Thinking", "Emotional Reasoning", "Gratitude Focus", "Self-Compassion", "Overgeneralization", "Mindful Awareness"]).

        CRITICAL INSTRUCTIONS FOR ONE-WORD / SHORT ENTRIES:
        - If the entry is a single word or extremely brief (e.g. "Stressed", "Fine", "Sad", "Grateful", "Exhausted"), infer the emotional state, stress level, burnout risk, and summary based on that single word while populating all the other fields logically. Do not reject the entry.

        Return a JSON object with this exact keys:
        {{
            "primary_emotion": string,
            "secondary_emotions": list of strings,
            "sentiment": "Positive" | "Neutral" | "Negative",
            "sentiment_score": float,
            "stress_level": int,
            "burnout_risk": "Low" | "Medium" | "High",
            "confidence": float,
            "topics": list of strings,
            "summary": string,
            "recommended_focus": string,
            "positive_points": list of strings,
            "warning_signs": list of strings,
            "cognitive_patterns": list of strings
        }}

        Return valid JSON only. Do not wrap in extra conversational text or markdown formatting.
        """

        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-3.5-flash-lite")
            response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            resp_text = response.text.strip()
            
            if resp_text.startswith("```json"):
                resp_text = resp_text.split("```json")[1].split("```")[0].strip()
            elif resp_text.startswith("```"):
                resp_text = resp_text.split("```")[1].split("```")[0].strip()
                
            data = json.loads(resp_text)
            
            # Backwards compatibility key mapping
            if "recurring_topics" not in data and "topics" in data:
                data["recurring_topics"] = ", ".join(data["topics"])
            if "important_events" not in data:
                data["important_events"] = data.get("summary", "None")

            # Ensure all required keys exist to prevent key errors
            default_structure = {
                "primary_emotion": "Neutral",
                "secondary_emotions": [],
                "sentiment": "Neutral",
                "sentiment_score": 0.5,
                "stress_level": 3,
                "burnout_risk": "Low",
                "confidence": 0.5,
                "topics": [],
                "recurring_topics": "General reflection",
                "important_events": "None",
                "summary": "Logged daily thoughts.",
                "recommended_focus": "Self-reflection",
                "positive_points": [],
                "warning_signs": [],
                "cognitive_patterns": []
            }
            
            for k, v in default_structure.items():
                if k not in data:
                    data[k] = v
            return data
        except Exception as e:
            print("Failed to run Gemini journal analysis", e)
            return JournalContextService._lexical_fallback(clean_content)

    @staticmethod
    def _lexical_fallback(content: str) -> Dict[str, Any]:
        """
        Calculates offline lexical scores for sentiment, stress, and topics.
        """
        clean_text = content.lower().strip()
        
        # Extended list of stress and burnout keywords
        stress_keywords = [
            "tired", "stressed", "overwhelmed", "exhausted", "burnout", "burnt",
            "anxious", "sad", "unhappy", "frustrated", "fatigue", "nervous", 
            "scared", "worry", "motivation", "no motivation", "lazy", "bored",
            "depressed", "lonely", "angry", "mad", "annoyed", "conflict", "argued"
        ]
        peace_keywords = [
            "happy", "excited", "good", "calm", "relax", "great", "energetic",
            "accomplished", "proud", "rested", "peace", "meditation", "mindful",
            "self-compassion", "gratitude"
        ]
        
        stress_count = sum(1 for word in stress_keywords if word in clean_text)
        peace_count = sum(1 for word in peace_keywords if word in clean_text)
        
        if stress_count > peace_count:
            sentiment = "Negative"
            score = max(0.1, 0.5 - (stress_count * 0.1))
            
            # Determine specific emotion
            if any(w in clean_text for w in ["anxious", "nervous", "scared", "worry", "panic", "stressed"]):
                primary_emotion = "Anxious"
            elif any(w in clean_text for w in ["burnout", "burnt", "tired", "exhausted", "fatigue", "lazy"]):
                primary_emotion = "Tired"
            elif any(w in clean_text for w in ["frustrated", "angry", "mad", "annoyed", "conflict", "argued"]):
                primary_emotion = "Frustrated"
            elif "motivation" in clean_text:
                primary_emotion = "Tired"  # motivation issues correspond to fatigue/tiredness
            else:
                primary_emotion = "Sad"
                
            secondary_emotions = ["Worry", "Overwhelm"] if primary_emotion == "Anxious" else ["Fatigue", "Apathy"] if primary_emotion == "Tired" else ["Conflict", "Anger"]
            
            # Calculate stress level and burnout risk
            stress_level = min(10, 4 + stress_count * 2)
            if "burnt" in clean_text or "burnout" in clean_text:
                stress_level = max(8, stress_level)
                burnout_risk = "High"
            else:
                burnout_risk = "High" if stress_level >= 8 else "Medium"
                
            # Distortions
            cognitive_patterns = ["Catastrophizing"] if stress_level >= 8 else ["Emotional Reasoning"]
            if "burnt" in clean_text or "burnout" in clean_text:
                cognitive_patterns.append("Overgeneralization")
            warning_signs = ["Emotional strain"]
            if "sleep" in clean_text:
                warning_signs.append("Sleep deficit")
            positive_points = []
            recommended_focus = "Somatic box breathing" if primary_emotion == "Anxious" else "Rest and recovery boundaries"
            
        elif peace_count > stress_count:
            sentiment = "Positive"
            score = min(0.95, 0.7 + (peace_count * 0.05))
            primary_emotion = "Grateful" if any(w in clean_text for w in ["good", "accomplished", "proud", "gratitude"]) else "Calm"
            secondary_emotions = ["Peace", "Satisfaction"]
            stress_level = max(1, 4 - peace_count)
            burnout_risk = "Low"
            cognitive_patterns = ["Gratitude Focus"] if primary_emotion == "Grateful" else ["Mindful Awareness"]
            warning_signs = []
            positive_points = ["Maintained emotional awareness"]
            recommended_focus = "Continue daily pacing"
        else:
            sentiment = "Neutral"
            score = 0.5
            primary_emotion = "Neutral"
            secondary_emotions = []
            stress_level = 3
            burnout_risk = "Low"
            cognitive_patterns = ["Mindful Awareness"]
            warning_signs = []
            positive_points = ["Logged daily thoughts"]
            recommended_focus = "Self-reflection"

        # Topics mapping
        topics = []
        if any(w in clean_text for w in ["work", "job", "presentation", "boss", "meeting", "interview", "project"]): 
            topics.append("Work")
        if any(w in clean_text for w in ["sleep", "night", "bed", "rest"]): 
            topics.append("Sleep")
        if any(w in clean_text for w in ["family", "friend", "dinner", "party", "parents", "argued"]): 
            topics.append("Social")
        if "meditation" in clean_text or "mindful" in clean_text: 
            topics.append("Mindfulness")
        if "motivation" in clean_text:
            topics.append("Motivation")
        if "burnout" in clean_text or "burnt" in clean_text:
            topics.append("Fatigue")
        
        recurring_topics = ", ".join(topics) if topics else "General reflection"
        if not topics:
            topics = ["General reflection"]

        important_events = "Logged daily thoughts" if len(content) > 10 else "None"
        if "interview" in clean_text:
            important_events = "Preparing for an interview"
        elif "project" in clean_text:
            important_events = "Completed a project"
        elif "argued" in clean_text:
            important_events = "Argued with parents"
        elif "meditation" in clean_text:
            important_events = "Completed a meditation session"

        return {
            "primary_emotion": primary_emotion,
            "secondary_emotions": secondary_emotions,
            "sentiment": sentiment,
            "sentiment_score": round(score, 2),
            "stress_level": stress_level,
            "burnout_risk": burnout_risk,
            "confidence": 0.5,
            "topics": topics,
            "recurring_topics": recurring_topics,
            "important_events": important_events,
            "summary": f"User is feeling {primary_emotion.lower()} with {sentiment.lower()} sentiment. Stress level is {stress_level}/10.",
            "recommended_focus": recommended_focus,
            "positive_points": positive_points,
            "warning_signs": warning_signs,
            "cognitive_patterns": cognitive_patterns
        }

    @staticmethod
    def extract_journal_features(journals: List[Journal]) -> Dict[str, Any]:
        """
        [PHASE 2 ARCHITECTURE PLUGINS]
        Aggregates multi-entry summaries for long-term emotional charts.
        """
        if not journals:
            return {
                "sentiment_keywords": [],
                "primary_emotion": "Neutral",
                "detected_stress_triggers": [],
                "positive_habits": [],
                "gratitude_targets": [],
                "weekly_reflection_summary": "",
                "behavioral_patterns": [],
                "mood_evolution_trend": "Stable",
                "personal_growth_score": 5.0
            }

        # Format historical topics and events
        emotions = [j.primary_emotion for j in journals if j.primary_emotion]
        topics = []
        for j in journals:
            if j.recurring_topics:
                topics.extend([t.strip() for t in j.recurring_topics.split(",")])
        
        return {
            "sentiment_keywords": list(set(topics))[:5],
            "primary_emotion": emotions[0] if emotions else "Neutral",
            "detected_stress_triggers": ["work" if any("work" in t.lower() for t in topics) else "general pacing"],
            "positive_habits": ["reflection"],
            "gratitude_targets": ["mindful checkins"],
            "weekly_reflection_summary": "User is maintaining active logging and mental fitness reflection.",
            "behavioral_patterns": ["screen time increases correlate to lower sleep logs"],
            "mood_evolution_trend": "Stable",
            "personal_growth_score": 7.0
        }
