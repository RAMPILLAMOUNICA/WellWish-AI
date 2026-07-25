from typing import Dict, Any, List
from app.models.wellbeing import Wellbeing

class DecisionEngine:
    @staticmethod
    def analyze_score_change(today_log: Wellbeing, averages_7: Dict[str, float]) -> Dict[str, Any]:
        """
        Calculates metric differences compared to the 7-day average.
        Identifies the highest impact driver and suggestions.
        """
        if not today_log:
            return {
                "impact_driver": "No Data Logged",
                "impact_direction": "Neutral",
                "explanation": "No log exists for this date. Daily check-in is required to run decision intelligence.",
                "highest_impact_action": "Log today's check-in metrics."
            }

        # Compare biometrics (today vs 7-day average)
        sleep_diff = today_log.sleep - averages_7.get("sleep", 8.0) if today_log.sleep is not None else 0.0
        water_diff = today_log.water - averages_7.get("water", 2.0) if today_log.water is not None else 0.0
        stress_diff = today_log.stress_level - averages_7.get("stress", 3.0) if today_log.stress_level is not None else 0.0
        rec_diff = today_log.recovery_score - averages_7.get("recovery_score", 70.0) if today_log.recovery_score is not None else 0.0
        screen_diff = today_log.screen_time - averages_7.get("screen", 4.0) if today_log.screen_time is not None else 0.0

        # Map drivers: (Name, impact_value, action_recommending)
        # Shift values are formatted so that a HIGHER number is a worse negative change
        drivers = [
            ("Sleep", -sleep_diff, "Increase sleep duration to align rest cycles."),
            ("Hydration", -water_diff, "Drink 500ml more water within the next hour."),
            ("Stress", stress_diff, "Complete a 4-7-8 breathing pause to lower stress level."),
            ("Recovery", -rec_diff, "Engage in somatics or slow active stretches."),
            ("Screen Time", screen_diff, "Disconnect from screens for 15 minutes to reduce cognitive overload.")
        ]

        # Find the driver with the maximum negative shift
        max_driver = max(drivers, key=lambda x: x[1])

        impact_driver = max_driver[0]
        highest_impact_action = max_driver[2]
        
        # Build explanation string
        why_parts = []
        if sleep_diff < 0: why_parts.append(f"Sleep ↓ ({abs(sleep_diff):.1f}h)")
        elif sleep_diff > 0: why_parts.append(f"Sleep ↑ (+{sleep_diff:.1f}h)")
        
        if water_diff < 0: why_parts.append(f"Hydration ↓ ({abs(water_diff):.1f}L)")
        elif water_diff > 0: why_parts.append(f"Hydration ↑ (+{water_diff:.1f}L)")
        
        if stress_diff > 0: why_parts.append(f"Stress ↑ (+{stress_diff:.1f} pts)")
        elif stress_diff < 0: why_parts.append(f"Stress ↓ ({abs(stress_diff):.1f} pts)")
        
        if rec_diff < 0: why_parts.append(f"Recovery ↓ ({abs(rec_diff):.1f}%)")
        elif rec_diff > 0: why_parts.append(f"Recovery ↑ (+{rec_diff:.1f}%)")

        explanation = ", ".join(why_parts) if why_parts else "All indicators are steady."

        return {
            "impact_driver": impact_driver,
            "impact_direction": "Negative" if max_driver[1] > 0 else "Positive",
            "explanation": f"Wellbeing parameters shifted compared to your 7-day average: {explanation}",
            "highest_impact_action": highest_impact_action
        }
