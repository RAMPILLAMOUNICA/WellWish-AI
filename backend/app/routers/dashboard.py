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
    from sqlalchemy import text
    ist_now = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
    text("DATE(created_at) = :d_date")
    target_date_str = date if date else today_ist_str

    # 2. Check if today's check-in has been completed
    today_wellbeing = db.query(Wellbeing).filter(
        Wellbeing.user_id == current_user.id,
        Wellbeing.logged_date == today_ist_str
    ).order_by(Wellbeing.id.desc()).first()
    
    # Also check if today's journal exists
    today_journal = db.query(Journal).filter(
        Journal.user_id == current_user.id,
        text("DATE(created_at) = :today_date")
    ).params(today_date=today_ist_str).first()
    
    is_today_completed = (today_wellbeing is not None) or (today_journal is not None)

    # 3. Fetch biometrics for the requested date
    selected_wellbeing = db.query(Wellbeing).filter(
        Wellbeing.user_id == current_user.id,
        Wellbeing.logged_date == target_date_str
    ).order_by(Wellbeing.id.desc()).first()

    # 3b. Fetch journal for the requested date
    selected_journal = db.query(Journal).filter(
        Journal.user_id == current_user.id,
        text("DATE(created_at) = :target_date")
    ).params(target_date=target_date_str).order_by(Journal.id.desc()).first()

    # 4. Build 7-Day Calendar Week (Monday to Sunday) centered on selected date
    try:
        parsed_target_date = datetime.strptime(target_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except Exception:
        parsed_target_date = ist_now

    weekday = parsed_target_date.weekday() # Monday is 0, Sunday is 6
    monday_date = parsed_target_date - timedelta(days=weekday)
    
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    timeline_items = []
    weekly_trend_items = []

    for i in range(7):
        d = monday_date + timedelta(days=i)
        d_str = d.strftime("%Y-%m-%d")
        d_disp = d.strftime("%d %b")
        is_today = (d_str == today_ist_str)

        # Query log and journal for this specific day
        day_log = db.query(Wellbeing).filter(
            Wellbeing.user_id == current_user.id,
            Wellbeing.logged_date == d_str
        ).order_by(Wellbeing.id.desc()).first()

        day_journal = db.query(Journal).filter(
            Journal.user_id == current_user.id,
            text("strftime('%Y-%m-%d', created_at) = :d_date")
        ).params(d_date=d_str).order_by(Journal.id.desc()).first()

        is_completed = (day_log is not None) or (day_journal is not None)
        
        wb_val = None
        if day_log:
            wb_val = day_log.wellbeing_index
        elif day_journal:
            # Estimate wellbeing index from stress and sentiment
            j_stress = day_journal.stress_level or 3
            wb_val = 100.0 - (j_stress * 8.0)
            if day_journal.sentiment == "Positive":
                wb_val += 10.0
            elif day_journal.sentiment == "Negative":
                wb_val -= 10.0
            wb_val = max(10.0, min(100.0, wb_val))

        stress_val = None
        if day_log:
            stress_val = max(15.0, 100.0 - (day_log.wellbeing_index or 70.0))
        elif day_journal:
            stress_val = (day_journal.stress_level or 3) * 10.0

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
    willa_insights = GeminiService.generate_wellbeing_insights(db, current_user, target_date_str)

    # Resolve telemetry from selected wellbeing or estimated from selected journal
    mood_val = None
    stress_risk_val = None
    burnout_risk_val = None
    recovery_score_val = None
    wellbeing_index_val = None
    
    if selected_wellbeing:
        mood_val = selected_wellbeing.mood
        stress_risk_val = selected_wellbeing.stress_risk
        burnout_risk_val = selected_wellbeing.burnout_risk
        recovery_score_val = selected_wellbeing.recovery_score
        wellbeing_index_val = selected_wellbeing.wellbeing_index
    elif selected_journal:
        mood_val = selected_journal.primary_emotion
        stress_risk_val = "High" if (selected_journal.stress_level or 0) >= 7 else "Moderate" if (selected_journal.stress_level or 0) >= 4 else "Low"
        burnout_risk_val = selected_journal.burnout_risk
        recovery_score_val = max(10.0, 100.0 - (selected_journal.stress_level or 3) * 8.0)
        # Estimate wellbeing index
        j_stress = selected_journal.stress_level or 3
        wellbeing_index_val = 100.0 - (j_stress * 8.0)
        if selected_journal.sentiment == "Positive":
            wellbeing_index_val += 10.0
        elif selected_journal.sentiment == "Negative":
            wellbeing_index_val -= 10.0
        wellbeing_index_val = max(10.0, min(100.0, wellbeing_index_val))

    return DashboardResponse(
        user_profile={
            "full_name": current_user.full_name,
            "email": current_user.email
        },
        selected_date=target_date_str,
        is_today_completed=is_today_completed,
        wellbeing_index=wellbeing_index_val,
        stress_risk=stress_risk_val,
        mood=mood_val,
        sleep=selected_wellbeing.sleep if selected_wellbeing else None,
        water=selected_wellbeing.water if selected_wellbeing else None,
        steps=selected_wellbeing.steps if selected_wellbeing else None,
        screen_time=selected_wellbeing.screen_time if selected_wellbeing else None,
        burnout_risk=burnout_risk_val,
        recovery_score=recovery_score_val,
        wearable_connected=selected_wellbeing.wearable_connected if selected_wellbeing else False,
        journal_streak=journal_streak,
        today_win=willa_insights.get("todays_win") if (selected_wellbeing or selected_journal) else None,
        weekly_trend=weekly_trend_items,
        timeline=timeline_items,
        willa_reflection=willa_insights
    )
