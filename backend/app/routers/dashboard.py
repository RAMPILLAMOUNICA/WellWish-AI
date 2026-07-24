from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timezone, timedelta

from app.database import get_db
from app.models.user import User
from app.models.wellbeing import Wellbeing
from app.models.journal import Journal
from app.auth.jwt_handler import get_current_user
from app.services.gemini_service import GeminiService
from app.schemes.dashboard import DashboardResponse, WeeklyTrendItem, TimelineDayItem

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard Aggregator"]
)

@router.get("", response_model=DashboardResponse)
@router.get("/", response_model=DashboardResponse)
def get_dashboard_data(
    date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch the date-driven telemetry package for the authenticated user session.
    Allows inspecting historical calendar dates while building real weekly trend data.
    """
    
    # 1. Determine current IST date and requested target date
    ist_now = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
    today_ist_str = ist_now.strftime("%Y-%m-%d")
    target_date_str = date if date else today_ist_str

    # 2. Check if today's check-in has been completed
    today_wellbeing = db.query(Wellbeing).filter(
        Wellbeing.user_id == current_user.id,
        Wellbeing.logged_date == today_ist_str
    ).order_by(Wellbeing.id.desc()).first()
    is_today_completed = today_wellbeing is not None

    # 3. Fetch biometrics for the requested date (fallback to latest entry if no exact date match)
    selected_wellbeing = db.query(Wellbeing).filter(
        Wellbeing.user_id == current_user.id,
        Wellbeing.logged_date == target_date_str
    ).order_by(Wellbeing.id.desc()).first()

    # If viewing today and not completed yet, keep selected_wellbeing None to trigger unlogged state
    if not selected_wellbeing and target_date_str != today_ist_str:
        selected_wellbeing = db.query(Wellbeing).filter(
            Wellbeing.user_id == current_user.id
        ).order_by(Wellbeing.id.desc()).first()

    # 4. Build 7-Day Calendar Week (Monday to Sunday)
    weekday = ist_now.weekday() # Monday is 0, Sunday is 6
    monday_date = ist_now - timedelta(days=weekday)
    
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    timeline_items = []
    weekly_trend_items = []

    for i in range(7):
        d = monday_date + timedelta(days=i)
        d_str = d.strftime("%Y-%m-%d")
        d_disp = d.strftime("%d %b")
        is_today = (d_str == today_ist_str)

        # Query log for this specific day (latest submission if multiple exist)
        day_log = db.query(Wellbeing).filter(
            Wellbeing.user_id == current_user.id,
            Wellbeing.logged_date == d_str
        ).order_by(Wellbeing.id.desc()).first()

        is_completed = day_log is not None
        wb_val = day_log.wellbeing_index if day_log else None
        stress_val = max(15.0, 100.0 - (day_log.wellbeing_index or 70.0)) if day_log else None

        timeline_items.append(TimelineDayItem(
            day=day_names[i],
            date_key=d_str,
            date_display=d_disp,
            is_today=is_today,
            is_completed=is_completed,
            wellbeing=wb_val,
            stress=stress_val
        ))

        weekly_trend_items.append(WeeklyTrendItem(
            day=day_names[i],
            wellbeing=wb_val,
            stress=stress_val
        ))

    # 5. Query active streak count
    journal_count = db.query(Journal).filter(Journal.user_id == current_user.id).count()
    wellbeing_count = db.query(Wellbeing).filter(Wellbeing.user_id == current_user.id).count()
    journal_streak = max(1, journal_count + wellbeing_count) if (journal_count > 0 or wellbeing_count > 0) else 0

    # 6. Generate Willa's reflections
    willa_insights = GeminiService.generate_wellbeing_insights(db, current_user)

    return DashboardResponse(
        user_profile={
            "full_name": current_user.full_name,
            "email": current_user.email
        },
        selected_date=target_date_str,
        is_today_completed=is_today_completed,
        wellbeing_index=selected_wellbeing.wellbeing_index if selected_wellbeing else None,
        stress_risk=selected_wellbeing.stress_risk if selected_wellbeing else None,
        mood=selected_wellbeing.mood if selected_wellbeing else None,
        sleep=selected_wellbeing.sleep if selected_wellbeing else None,
        water=selected_wellbeing.water if selected_wellbeing else None,
        steps=selected_wellbeing.steps if selected_wellbeing else None,
        screen_time=selected_wellbeing.screen_time if selected_wellbeing else None,
        burnout_risk=selected_wellbeing.burnout_risk if selected_wellbeing else None,
        recovery_score=selected_wellbeing.recovery_score if selected_wellbeing else None,
        wearable_connected=selected_wellbeing.wearable_connected if selected_wellbeing else False,
        journal_streak=journal_streak,
        today_win=willa_insights.get("todays_win") if selected_wellbeing else None,
        weekly_trend=weekly_trend_items,
        timeline=timeline_items,
        willa_reflection=willa_insights
    )
