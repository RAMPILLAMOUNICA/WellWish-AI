from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User
from app.models.wellbeing import Wellbeing
from app.models.journal import Journal
from app.auth.jwt_handler import get_current_user
from app.services.gemini_service import GeminiService
from app.schemes.dashboard import DashboardResponse, WeeklyTrendItem

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard Aggregator"]
)

@router.get("/", response_model=DashboardResponse)
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch the consolidated telemetry package for the authenticated user session.
    Combines profile data, current biometrics, weekly trends, achievements, and Willa's AI reflections.
    """
    
    # 1. Fetch latest biometrics
    latest_wellbeing = db.query(Wellbeing).filter(
        Wellbeing.user_id == current_user.id
    ).order_by(Wellbeing.id.desc()).first()

    # 2. Evaluate Today's Win (default fallback)
    default_win = "Initialized daily tracking logs successfully."
    if latest_wellbeing:
        if latest_wellbeing.sleep and latest_wellbeing.sleep >= 7.5:
            default_win = "Sleep duration and deep cycles achieved healthy baseline (+14%)."
        elif latest_wellbeing.water and latest_wellbeing.water >= 2.0:
            default_win = "Daily hydration targets accomplished (+22%)."
        elif latest_wellbeing.steps and latest_wellbeing.steps >= 8000:
            default_win = "Consistent step targets achieved today."

    # 3. Retrieve weekly historical trends (last 7 logs)
    history = db.query(Wellbeing).filter(
        Wellbeing.user_id == current_user.id
    ).order_by(Wellbeing.id.desc()).limit(7).all()
    
    # Reverse so it reads left-to-right (Mon to Sun chronological order)
    history = list(reversed(history))

    # Use day names based on entry index sequentially
    default_days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_trend = []
    
    # Map real history logs
    for idx, entry in enumerate(history):
        day_label = default_days[idx % len(default_days)]
        
        # Calculate stress score inverse of the wellbeing index
        stress_val = max(15.0, 100.0 - (entry.wellbeing_index or 70.0))
        
        weekly_trend.append(WeeklyTrendItem(
            day=day_label,
            wellbeing=entry.wellbeing_index or 70.0,
            stress=round(stress_val, 1)
        ))

    # 4. Query Journal Streak count
    journal_streak = db.query(Journal).filter(Journal.user_id == current_user.id).count()

    # 5. Generate Willa's reflections
    willa_insights = GeminiService.generate_wellbeing_insights(db, current_user)

    return DashboardResponse(
        user_profile={
            "full_name": current_user.full_name,
            "email": current_user.email
        },
        wellbeing_index=latest_wellbeing.wellbeing_index if latest_wellbeing else None,
        stress_risk=latest_wellbeing.stress_risk if latest_wellbeing else None,
        mood=latest_wellbeing.mood if latest_wellbeing else None,
        sleep=latest_wellbeing.sleep if latest_wellbeing else None,
        water=latest_wellbeing.water if latest_wellbeing else None,
        steps=latest_wellbeing.steps if latest_wellbeing else None,
        screen_time=latest_wellbeing.screen_time if latest_wellbeing else None,
        burnout_risk=latest_wellbeing.burnout_risk if latest_wellbeing else None,
        recovery_score=latest_wellbeing.recovery_score if latest_wellbeing else None,
        wearable_connected=latest_wellbeing.wearable_connected if latest_wellbeing else False,
        journal_streak=journal_streak,
        today_win=willa_insights.get("todays_win") if latest_wellbeing else None,
        weekly_trend=weekly_trend,
        willa_reflection=willa_insights
    )
