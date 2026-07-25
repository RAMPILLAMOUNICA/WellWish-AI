from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.models.wellbeing import Wellbeing
from app.models.journal import Journal
from app.services.history_service import HistoryService

class ProactiveCoachingService:
    @staticmethod
    def detect_trends(db: Session, user_id: int) -> Optional[Dict[str, Any]]:
        """
        Analyzes the user's wellness history to detect critical trends
        and builds structured Explainable AI coaching recommendations.
        """
        checkins = HistoryService.get_recent_checkins(db, user_id, limit=7)
        journals = HistoryService.get_recent_journals(db, user_id, limit=3)
        
        if not checkins:
            return None

        # 1. Sleep decline detection (3 consecutive days)
        if len(checkins) >= 3:
            s0 = checkins[0].sleep
            s1 = checkins[1].sleep
            s2 = checkins[2].sleep
            if s0 is not None and s1 is not None and s2 is not None:
                # Decreasing from day before to today means s2 > s1 > s0
                if s2 > s1 > s0:
                    return {
                        "type": "sleep_decline",
                        "observation": "Your sleep duration has decreased for 3 consecutive days.",
                        "evidence": f"Sleep dropped from {s2}h to {s1}h, and is now {s0}h today.",
                        "recommendation": "Aim to wind down 30 minutes earlier and sleep before 10:30 PM tonight.",
                        "expected_benefit": "Restoring sleep duration will lower stress levels and improve tomorrow's recovery score.",
                        "coaching_message": f"I noticed that your sleep has been gradually decreasing over the last three days (from {s2}h down to {s0}h). Prioritizing a wind-down routine tonight is the best next step to recharge your recovery score."
                    }

        # 2. Stress increase detection (3 consecutive days)
        if len(checkins) >= 3:
            st0 = checkins[0].stress_level
            st1 = checkins[1].stress_level
            st2 = checkins[2].stress_level
            if st0 is not None and st1 is not None and st2 is not None:
                if st2 < st1 < st0: # Stress level increasing (today is higher than yesterday, which is higher than day before)
                    return {
                        "type": "stress_climb",
                        "observation": "Your stress level has been climbing over the last 3 days.",
                        "evidence": f"Stress level rose from {st2}/10 to {st1}/10, reaching {st0}/10 today.",
                        "recommendation": "Perform a 4-7-8 breathing pause and step away from screens for 15 minutes.",
                        "expected_benefit": "Activating your parasympathetic nervous system will lower cortisol levels and head tension.",
                        "coaching_message": f"I observed your stress indicators have risen for three days straight (now at {st0}/10). Let's take a brief screen cutoff and do a quick box-breathing cycle together."
                    }

        # 3. Consistently low hydration
        if len(checkins) >= 3:
            water_values = [c.water for c in checkins[:3] if c.water is not None]
            if water_values and len(water_values) == 3:
                avg_water = sum(water_values) / 3
                if avg_water < 1.2:
                    return {
                        "type": "low_hydration",
                        "observation": "Your hydration levels have been consistently low this week.",
                        "evidence": f"Your average water intake over the last 3 logs is only {avg_water:.1f}L, below the 2.5L recommendation.",
                        "recommendation": "Keep a water bottle on your desk and drink 500ml of water before lunch.",
                        "expected_benefit": "Improving hydration supports cellular energy and prevents brain fog.",
                        "coaching_message": f"Your hydration levels have been consistently low recently, averaging just {avg_water:.1f}L. Keeping a water bottle nearby is a simple trick to support your cellular focus."
                    }

        # 4. Recovery score falling
        if len(checkins) >= 3:
            r0 = checkins[0].recovery_score
            r1 = checkins[1].recovery_score
            r2 = checkins[2].recovery_score
            if r0 is not None and r1 is not None and r2 is not None:
                if r2 > r1 > r0: # Recovery score falling (today is lower than yesterday, which is lower than day before)
                    return {
                        "type": "recovery_drop",
                        "observation": "Your biometric recovery score has dropped for 3 consecutive check-ins.",
                        "evidence": f"Recovery dropped from {r2}% to {r1}%, and is now at {r0}%.",
                        "recommendation": "Schedule a light active recovery walk and prioritize somatic box breathing.",
                        "expected_benefit": "Light pacing restores circulation and helps reset nervous system fatigue.",
                        "coaching_message": f"Your recovery score has been sliding for three days, down to {r0}%. Incorporating a brief recovery stretch or visual break will help restart your homeostatic pacing."
                    }

        # 5. Skipped journal entries
        if journals:
            latest_journal = journals[0]
            if latest_journal.created_at:
                days_since_journal = (datetime.utcnow() - latest_journal.created_at).days
                if days_since_journal >= 3:
                    return {
                        "type": "skipped_journal",
                        "observation": "You haven't written a journal reflection in a few days.",
                        "evidence": f"Your last journal entry was written {days_since_journal} days ago.",
                        "recommendation": "Take 2 minutes to write down one positive win from your day in the journal tab.",
                        "expected_benefit": "Reflective journaling helps process cognitive loads and align daily motivation.",
                        "coaching_message": f"It's been a few days since your last journal log. Writing down just one positive win from today is a powerful way to reset your mental baseline."
                    }
        else:
            return {
                "type": "no_journal",
                "observation": "You haven't logged any journal reflections yet.",
                "evidence": "Your journal vault is currently empty.",
                "recommendation": "Submit a quick 2-sentence journal entry to explore Willa's emotional analysis.",
                "expected_benefit": "Journaling builds mental self-awareness and helps Willa detect stress triggers.",
                "coaching_message": "Welcome to your journal vault! Reflecting on your daily calibration in a brief note helps me track emotional baselines and personalize your insights."
            }

        return None
