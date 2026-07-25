from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from app.database import get_db
from app.models.wellbeing import Wellbeing
from app.models.user import User
from app.auth.jwt_handler import get_current_user
from app.schemes.wellbeing import WellbeingCreate, WellbeingResponse

router = APIRouter(
    prefix="/wellbeing",
    tags=["Wellbeing Analytics"]
)

def compute_and_save_wellbeing_metrics(
    db: Session,
    current_user: User,
    date_str: str,
    metrics_in: WellbeingCreate
) -> Wellbeing:
    """
    Computes all indices and performs a database upsert for the specified logged_date.
    Supports partial updates by only overwriting fields provided in the request payload.
    """
    # 1. Fetch existing log or create a new one with defaults
    existing = db.query(Wellbeing).filter(
        Wellbeing.user_id == current_user.id,
        Wellbeing.logged_date == date_str
    ).order_by(Wellbeing.id.desc()).first()

    if existing:
        target = existing
    else:
        target = Wellbeing(
            user_id=current_user.id,
            logged_date=date_str,
            created_at=datetime.utcnow(),
            mood="Stable",
            sleep=8.0,
            water=2.0,
            screen_time=4.0,
            energy_level=7,
            stress_level=3,
            wearable_connected=False
        )

    # 2. Extract explicitly provided fields from the input model
    metrics_dict = metrics_in.model_dump(exclude_unset=True)

    if "wearable_connected" in metrics_dict:
        target.wearable_connected = metrics_in.wearable_connected
    
    wearable = target.wearable_connected or False

    # Apply updates for general metrics
    if "mood" in metrics_dict:
        target.mood = metrics_in.mood or "Stable"
    if "sleep" in metrics_dict:
        target.sleep = metrics_in.sleep
    if "water" in metrics_dict:
        target.water = metrics_in.water
    if "screen_time" in metrics_dict:
        target.screen_time = metrics_in.screen_time
    if "energy_level" in metrics_dict:
        target.energy_level = metrics_in.energy_level
    if "stress_level" in metrics_dict:
        target.stress_level = metrics_in.stress_level

    # Apply updates for mode-specific metrics
    if wearable:
        if "steps" in metrics_dict:
            target.steps = metrics_in.steps
        if "heart_rate" in metrics_dict:
            target.heart_rate = metrics_in.heart_rate
        # Clear standalone metrics if connected to wearable
        target.sleep_quality = None
        target.work_pressure = None
        target.anxiety_level = None
        target.motivation = None
        target.appetite = None
        target.social_interaction = None
        target.physical_activity = None
    else:
        if "sleep_quality" in metrics_dict:
            target.sleep_quality = metrics_in.sleep_quality
        if "work_pressure" in metrics_dict:
            target.work_pressure = metrics_in.work_pressure
        if "anxiety_level" in metrics_dict:
            target.anxiety_level = metrics_in.anxiety_level
        if "motivation" in metrics_dict:
            target.motivation = metrics_in.motivation
        if "appetite" in metrics_dict:
            target.appetite = metrics_in.appetite
        if "social_interaction" in metrics_dict:
            target.social_interaction = metrics_in.social_interaction
        if "physical_activity" in metrics_dict:
            target.physical_activity = metrics_in.physical_activity
        # Clear wearable metrics if standalone
        target.steps = None
        target.heart_rate = None

    # 3. Calculate scores based on the consolidated data
    sleep = target.sleep if target.sleep is not None else 8.0
    if 7.0 <= sleep <= 9.0:
        sleep_score = 100
    elif sleep < 7.0:
        sleep_score = max(0, 100 - (7.0 - sleep) * 20)
    else: # sleep > 9.0
        sleep_score = max(0, 100 - (sleep - 9.0) * 15)

    water = target.water if target.water is not None else 2.0
    water_score = min(100, (water / 2.5) * 100)

    screen_time = target.screen_time if target.screen_time is not None else 4.0
    if screen_time <= 3.0:
        screen_score = 100
    else:
        screen_score = max(0, 100 - (screen_time - 3.0) * 12)

    energy_level = target.energy_level if target.energy_level is not None else 7
    energy_score = (energy_level / 10) * 100

    stress_level = target.stress_level if target.stress_level is not None else 3
    stress_score = ((10 - stress_level) / 10) * 100

    if wearable:
        # Mode 1: Wearable Connected
        steps = target.steps if target.steps is not None else 8000
        steps_score = min(100, (steps / 10000) * 100)

        hr = target.heart_rate if target.heart_rate is not None else 72
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
        sleep_qual = target.sleep_quality if target.sleep_quality is not None else 7
        sleep_qual_score = sleep_qual * 10
        combined_sleep_score = (sleep_score + sleep_qual_score) / 2

        anxiety = target.anxiety_level if target.anxiety_level is not None else 3
        anxiety_score = ((10 - anxiety) / 10) * 100

        motivate = target.motivation if target.motivation is not None else 7
        motivation_score = (motivate / 10) * 100

        psych_score = (energy_score + anxiety_score + motivation_score) / 3

        pressure = target.work_pressure if target.work_pressure is not None else 3
        pressure_score = ((10 - pressure) / 10) * 100

        appetite = target.appetite if target.appetite is not None else 7
        appetite_score = (appetite / 10) * 100

        social = target.social_interaction if target.social_interaction is not None else 7
        social_score = (social / 10) * 100

        activity = target.physical_activity if target.physical_activity is not None else 5
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

    target.wellbeing_index = round(wellbeing_index, 1)
    target.stress_risk = stress_risk
    target.burnout_risk = burnout_risk
    target.recovery_score = round(recovery_score, 1)

    if not existing:
        db.add(target)
        
    db.commit()
    db.refresh(target)
    return target

@router.post("", response_model=WellbeingResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=WellbeingResponse, status_code=status.HTTP_201_CREATED)
def log_wellbeing_metrics(
    metrics_in: WellbeingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Log check-in metrics. Automatically resolves today's date in IST.
    """
    ist_now = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
    ist_date_str = ist_now.strftime("%Y-%m-%d")
    return compute_and_save_wellbeing_metrics(db, current_user, ist_date_str, metrics_in)

@router.post("/checkin", response_model=WellbeingResponse)
def checkin_today(
    metrics_in: WellbeingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create or update today's wellbeing check-in.
    """
    ist_now = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
    ist_date_str = ist_now.strftime("%Y-%m-%d")
    return compute_and_save_wellbeing_metrics(db, current_user, ist_date_str, metrics_in)

@router.get("/date/{date}", response_model=Optional[WellbeingResponse])
def get_wellbeing_by_date(
    date: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve the wellbeing record for a specific date (YYYY-MM-DD format).
    Returns null if no record exists.
    """
    record = db.query(Wellbeing).filter(
        Wellbeing.user_id == current_user.id,
        Wellbeing.logged_date == date
    ).order_by(Wellbeing.id.desc()).first()
    return record

@router.put("/date/{date}", response_model=WellbeingResponse)
def update_wellbeing_by_date(
    date: str,
    metrics_in: WellbeingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create or update check-in metrics for a specific calendar date (YYYY-MM-DD format).
    """
    return compute_and_save_wellbeing_metrics(db, current_user, date, metrics_in)

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
