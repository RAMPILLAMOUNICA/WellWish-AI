from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.wellbeing import Wellbeing
from app.models.user import User
from app.auth.jwt_handler import get_current_user
from app.schemes.wellbeing import WellbeingCreate, WellbeingResponse

router = APIRouter(
    prefix="/wellbeing",
    tags=["Wellbeing Analytics"]
)

@router.post("/", response_model=WellbeingResponse, status_code=status.HTTP_201_CREATED)
def log_wellbeing_metrics(
    metrics_in: WellbeingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Log a daily check-in with dynamic Mode 1 (wearable sync) or Mode 2 (standalone reflection metrics).
    Automatically computes Wellbeing Index, Stress Risk, Burnout Risk, and Recovery Score.
    """
    wearable = metrics_in.wearable_connected or False

    # Sleep hours calculation (Common)
    sleep = metrics_in.sleep or 8.0
    if 7.0 <= sleep <= 9.0:
        sleep_score = 100
    elif sleep < 7.0:
        sleep_score = max(0, 100 - (7.0 - sleep) * 20)
    else: # sleep > 9.0
        sleep_score = max(0, 100 - (sleep - 9.0) * 15)

    # Water intake calculation (Common)
    water = metrics_in.water or 2.0
    water_score = min(100, (water / 2.5) * 100)

    # Screen Time calculation (Common)
    screen_time = metrics_in.screen_time or 4.0
    if screen_time <= 3.0:
        screen_score = 100
    else:
        screen_score = max(0, 100 - (screen_time - 3.0) * 12)

    # Energy Level (Common)
    energy_level = metrics_in.energy_level or 7
    energy_score = (energy_level / 10) * 100

    # Stress Level (Common)
    stress_level = metrics_in.stress_level or 3
    stress_score = ((10 - stress_level) / 10) * 100

    if wearable:
        # Mode 1: Wearable Connected
        steps = metrics_in.steps or 8000
        steps_score = min(100, (steps / 10000) * 100)

        hr = metrics_in.heart_rate or 72
        if 60 <= hr <= 80:
            hr_score = 100
        elif hr < 60:
            hr_score = max(0, 100 - (60 - hr) * 2.5)
        else: # hr > 80
            hr_score = max(0, 100 - (hr - 80) * 2.0)

        wellbeing_index = (sleep_score + steps_score + water_score + screen_score + hr_score + energy_score + stress_score) / 7
        recovery_score = (sleep_score + water_score + hr_score) / 3
        
        # Burnout risk Mode 1
        if screen_time > 6.0 and sleep < 6.0 and stress_level > 7:
            burnout_risk = "High"
        elif stress_level > 5 or screen_time > 5.0:
            burnout_risk = "Moderate"
        else:
            burnout_risk = "Low"

    else:
        # Mode 2: No Wearable Connected
        sleep_qual = metrics_in.sleep_quality or 7
        sleep_qual_score = sleep_qual * 10
        combined_sleep_score = (sleep_score + sleep_qual_score) / 2

        anxiety = metrics_in.anxiety_level or 3
        anxiety_score = ((10 - anxiety) / 10) * 100

        motivate = metrics_in.motivation or 7
        motivation_score = (motivate / 10) * 100

        psych_score = (energy_score + anxiety_score + motivation_score) / 3

        pressure = metrics_in.work_pressure or 3
        pressure_score = ((10 - pressure) / 10) * 100

        appetite = metrics_in.appetite or 7
        appetite_score = (appetite / 10) * 100

        social = metrics_in.social_interaction or 7
        social_score = (social / 10) * 100

        activity = metrics_in.physical_activity or 5
        activity_score = (activity / 10) * 100

        vital_rhythm_score = (appetite_score + social_score + activity_score) / 3

        wellbeing_index = (combined_sleep_score + water_score + screen_score + psych_score + pressure_score + vital_rhythm_score) / 6
        recovery_score = (combined_sleep_score + water_score + social_score + appetite_score + activity_score) / 5

        # Burnout risk Mode 2
        if pressure > 7 and anxiety > 7 and motivate < 4:
            burnout_risk = "High"
        elif pressure > 5 or anxiety > 5:
            burnout_risk = "Moderate"
        else:
            burnout_risk = "Low"

    # Calculate Stress Risk rating based on index
    if wellbeing_index >= 85:
        stress_risk = "Minimal"
    elif wellbeing_index >= 65:
        stress_risk = "Low"
    elif wellbeing_index >= 45:
        stress_risk = "Moderate"
    else:
        stress_risk = "High"

    new_metrics = Wellbeing(
        user_id=current_user.id,
        mood=metrics_in.mood or "Stable",
        sleep=metrics_in.sleep,
        steps=metrics_in.steps if wearable else None,
        water=metrics_in.water,
        screen_time=metrics_in.screen_time,
        heart_rate=metrics_in.heart_rate if wearable else None,
        energy_level=metrics_in.energy_level,
        stress_level=metrics_in.stress_level,
        
        # Standalone
        sleep_quality=metrics_in.sleep_quality if not wearable else None,
        work_pressure=metrics_in.work_pressure if not wearable else None,
        anxiety_level=metrics_in.anxiety_level if not wearable else None,
        motivation=metrics_in.motivation if not wearable else None,
        appetite=metrics_in.appetite if not wearable else None,
        social_interaction=metrics_in.social_interaction if not wearable else None,
        physical_activity=metrics_in.physical_activity if not wearable else None,
        
        wellbeing_index=round(wellbeing_index, 1),
        stress_risk=stress_risk,
        burnout_risk=burnout_risk,
        recovery_score=round(recovery_score, 1),
        wearable_connected=wearable
    )
    
    db.add(new_metrics)
    db.commit()
    db.refresh(new_metrics)
    return new_metrics

@router.get("/history", response_model=List[WellbeingResponse])
def get_wellbeing_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve historical logs for the authenticated user vault, sorted by ID descending.
    """
    history = db.query(Wellbeing).filter(
        Wellbeing.user_id == current_user.id
    ).order_by(Wellbeing.id.desc()).all()
    return history
