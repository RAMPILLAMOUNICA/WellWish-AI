from pydantic import BaseModel
from typing import List, Optional, Dict

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

class AIChatRequest(BaseModel):
    message: str
    chat_history: Optional[List[Dict[str, str]]] = None # List of {"role": "user"|"model", "content": "..."}

class AIChatResponse(BaseModel):
    reply: str

class AIWeeklyReflectionResponse(BaseModel):
    weekly_summary: str
    key_accomplishments: List[str]
    pacing_suggestions: List[str]
    encouragement: str
