from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class AIInsightsResponse(BaseModel):
    wellbeing_summary: str
    stress_risk_explanation: str
    personalized_suggestions: List[str]
    positive_reinforcement: str
    todays_win: str
    responsible_ai_disclaimer: str
    
    # Decision Intelligence additions
    stress_trend_analysis: Optional[str] = None
    wellbeing_trend_analysis: Optional[str] = None
    daily_priorities: Optional[List[str]] = None
    sleep_recommendations: Optional[str] = None
    hydration_advice: Optional[str] = None
    break_reminders: Optional[str] = None
    recovery_suggestions: Optional[str] = None
    proactive_coaching: Optional[Dict[str, Any]] = None

from datetime import datetime

class AIChatRequest(BaseModel):
    message: str
    chat_history: Optional[List[Dict[str, str]]] = None # List of {"role": "user"|"model", "content": "..."}
    selected_date: Optional[str] = None
    session_id: Optional[str] = None

class AIChatResponse(BaseModel):
    reply: str
    session_id: str

class ChatMessageResponse(BaseModel):
    role: str
    content: str
    created_at: Optional[datetime] = None

class ChatSessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime

class AIWeeklyReflectionResponse(BaseModel):
    weekly_summary: str
    key_accomplishments: List[str]
    pacing_suggestions: List[str]
    encouragement: str
    
    # Advanced AI Weekly Analysis fields
    wellbeing_trend: Optional[str] = None
    stress_trend: Optional[str] = None
    sleep_consistency: Optional[str] = None
    hydration_consistency: Optional[str] = None
    mood_pattern: Optional[str] = None
    achievements: Optional[List[str]] = None
    areas_for_improvement: Optional[List[str]] = None
    focus_goal_next_week: Optional[str] = None
