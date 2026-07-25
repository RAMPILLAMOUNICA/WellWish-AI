from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class JournalBase(BaseModel):
    content: str

class JournalCreate(JournalBase):
    created_at: Optional[datetime] = None

class JournalUpdate(BaseModel):
    content: str

class JournalResponse(JournalBase):
    id: int
    user_id: int
    sentiment: Optional[str] = None
    sentiment_score: Optional[float] = None
    primary_emotion: Optional[str] = None
    stress_level: Optional[int] = None
    important_events: Optional[str] = None
    recurring_topics: Optional[str] = None
    secondary_emotions: Optional[List[str]] = None
    burnout_risk: Optional[str] = None
    confidence: Optional[float] = None
    summary: Optional[str] = None
    recommended_focus: Optional[str] = None
    positive_points: Optional[List[str]] = None
    warning_signs: Optional[List[str]] = None
    cognitive_patterns: Optional[List[str]] = None
    topics: Optional[List[str]] = None
    analysis_timestamp: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
