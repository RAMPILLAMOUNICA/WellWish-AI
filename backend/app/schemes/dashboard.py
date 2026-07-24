from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class UserProfileSchema(BaseModel):
    full_name: str
    email: str

class WeeklyTrendItem(BaseModel):
    day: str
    wellbeing: Optional[float] = None
    stress: Optional[float] = None

class TimelineDayItem(BaseModel):
    day: str             # e.g., "Mon", "Tue"
    date_key: str        # e.g., "2026-07-20"
    date_display: str    # e.g., "20 Jul"
    is_today: bool
    is_completed: bool
    wellbeing: Optional[float] = None
    stress: Optional[float] = None

class WillaReflectionSchema(BaseModel):
    wellbeing_summary: str
    stress_risk_explanation: str
    personalized_suggestions: List[str]
    positive_reinforcement: str
    todays_win: str
    responsible_ai_disclaimer: str
    
    # AI Decision Intelligence additions
    stress_trend_analysis: Optional[str] = None
    wellbeing_trend_analysis: Optional[str] = None
    daily_priorities: Optional[List[str]] = None
    sleep_recommendations: Optional[str] = None
    hydration_advice: Optional[str] = None
    break_reminders: Optional[str] = None
    recovery_suggestions: Optional[str] = None

class DashboardResponse(BaseModel):
    user_profile: UserProfileSchema
    
    # Selected Biometrics (for requested date)
    selected_date: Optional[str] = None
    is_today_completed: Optional[bool] = False
    wellbeing_index: Optional[float] = None
    stress_risk: Optional[str] = None
    mood: Optional[str] = None
    sleep: Optional[float] = None
    water: Optional[float] = None
    steps: Optional[int] = None
    screen_time: Optional[float] = None
    burnout_risk: Optional[str] = None
    recovery_score: Optional[float] = None
    wearable_connected: Optional[bool] = False
    
    journal_streak: Optional[int] = 0
    today_win: Optional[str] = None
    
    # Weekly graph & timeline telemetry
    weekly_trend: List[WeeklyTrendItem]
    timeline: List[TimelineDayItem] = []
    
    # AI insights
    willa_reflection: WillaReflectionSchema
