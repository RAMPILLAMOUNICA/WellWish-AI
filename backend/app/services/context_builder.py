from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from app.services.history_service import HistoryService
from app.models.wellbeing import Wellbeing

class ContextBuilder:
    @staticmethod
    def build_wellbeing_context(
        db: Session,
        user_id: int,
        target_date_str: str = None
    ) -> Dict[str, Any]:
        """
        Builds a comprehensive wellness context object containing averages,
        recent reflections, and trend directions.
        """
        # Resolve target date
        if not target_date_str:
            ist_now = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
            target_date_str = ist_now.strftime("%Y-%m-%d")

        # Query history
        all_checkins = HistoryService.get_recent_checkins(db, user_id, limit=30)
        recent_journals = HistoryService.get_recent_journals(db, user_id, limit=5)
        
        # Resolve target day record
        target_log = HistoryService.get_checkin_by_date(db, user_id, target_date_str)

        # Separate check-ins for averages calculation
        checkins_7 = [c for c in all_checkins[:7]]
        checkins_30 = all_checkins

        def calc_avg(checkins: List[Wellbeing], attribute: str) -> float:
            vals = [getattr(c, attribute) for c in checkins if getattr(c, attribute) is not None]
            return round(sum(vals) / len(vals), 1) if vals else 0.0

        avg_sleep_7 = calc_avg(checkins_7, "sleep")
        avg_sleep_30 = calc_avg(checkins_30, "sleep")
        
        avg_water_7 = calc_avg(checkins_7, "water")
        avg_water_30 = calc_avg(checkins_30, "water")
        
        avg_stress_7 = calc_avg(checkins_7, "stress_level")
        avg_stress_30 = calc_avg(checkins_30, "stress_level")
        
        avg_wb_7 = calc_avg(checkins_7, "wellbeing_index")
        avg_wb_30 = calc_avg(checkins_30, "wellbeing_index")
        
        avg_rec_7 = calc_avg(checkins_7, "recovery_score")
        avg_rec_30 = calc_avg(checkins_30, "recovery_score")
        
        avg_steps_7 = calc_avg(checkins_7, "steps")
        avg_steps_30 = calc_avg(checkins_30, "steps")

        # Trend analysis (improvements or declines)
        recent_wb_diff = 0.0
        if len(all_checkins) > 1:
            # Difference between latest entry and the one before it
            recent_wb_diff = (all_checkins[0].wellbeing_index or 0.0) - (all_checkins[1].wellbeing_index or 0.0)

        # Burnout trends count
        burnout_count = sum(1 for c in checkins_7 if c.burnout_risk == "High")
        burnout_trend = "Elevated" if burnout_count >= 3 else "Moderate" if burnout_count >= 1 else "Stable/Low"

        # Mood trends
        moods = [c.mood for c in checkins_7 if c.mood]
        mood_trend = moods[0] if moods else "Stable"

        # Trend and Unhealthy Pattern Detection (consecutive days)
        detected_wellbeing_trends = []
        if len(all_checkins) >= 3:
            # 1. Check for consistently low sleep (< 6.0h)
            low_sleep_days = 0
            for c in all_checkins:
                if c.sleep is not None and c.sleep < 6.0:
                    low_sleep_days += 1
                else:
                    break
            if low_sleep_days >= 3:
                detected_wellbeing_trends.append(
                    f"You've consistently been sleeping less than 6 hours for {low_sleep_days} days."
                )

            # 2. Check for rising stress (consecutive days increasing stress)
            stress_climb_days = 1
            for i in range(len(all_checkins) - 1):
                c_new = all_checkins[i].stress_level
                c_old = all_checkins[i+1].stress_level
                if c_new is not None and c_old is not None and c_new > c_old:
                    stress_climb_days += 1
                else:
                    break
            if stress_climb_days >= 3:
                detected_wellbeing_trends.append(
                    f"Your stress levels have been steadily rising over the last {stress_climb_days} days."
                )

            # 3. Check for consistently low hydration (< 1.2L)
            low_water_days = 0
            for c in all_checkins:
                if c.water is not None and c.water < 1.2:
                    low_water_days += 1
                else:
                    break
            if low_water_days >= 3:
                detected_wellbeing_trends.append(
                    f"Your hydration has fallen short of 1.2 Liters for {low_water_days} consecutive check-ins."
                )

            # 4. Check for high screen time (> 5.0h)
            high_screen_days = 0
            for c in all_checkins:
                if c.screen_time is not None and c.screen_time > 5.0:
                    high_screen_days += 1
                else:
                    break
            if high_screen_days >= 3:
                detected_wellbeing_trends.append(
                    f"Your screen time exposure has exceeded 5 hours for the last {high_screen_days} days."
                )

            # 5. Check for falling recovery score
            rec_drop_days = 1
            for i in range(len(all_checkins) - 1):
                c_new = all_checkins[i].recovery_score
                c_old = all_checkins[i+1].recovery_score
                if c_new is not None and c_old is not None and c_new < c_old:
                    rec_drop_days += 1
                else:
                    break
            if rec_drop_days >= 3:
                detected_wellbeing_trends.append(
                    f"Your biometric recovery score has declined for {rec_drop_days} consecutive days."
                )

        return {
            "selected_date": target_date_str,
            "target_log": target_log,
            "recent_journals": recent_journals,
            "all_checkins_count": len(all_checkins),
            "averages_7_days": {
                "sleep": avg_sleep_7,
                "water": avg_water_7,
                "stress": avg_stress_7,
                "wellbeing_index": avg_wb_7,
                "recovery_score": avg_rec_7,
                "steps": avg_steps_7
            },
            "averages_30_days": {
                "sleep": avg_sleep_30,
                "water": avg_water_30,
                "stress": avg_stress_30,
                "wellbeing_index": avg_wb_30,
                "recovery_score": avg_rec_30,
                "steps": avg_steps_30
            },
            "burnout_trend": burnout_trend,
            "mood_trend": mood_trend,
            "recent_wb_difference": round(recent_wb_diff, 1),
            "detected_wellbeing_trends": detected_wellbeing_trends
        }
