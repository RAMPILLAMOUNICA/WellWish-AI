from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class MoodDistributionItem(BaseModel):
    name: str
    value: int

class CommunityTrendItem(BaseModel):
    date: str
    wellbeing: float
    index: float

class StressFactorItem(BaseModel):
    factor: str
    percentage: int

class CommunityInsightsResponse(BaseModel):
    average_wellbeing_index: Optional[float] = None
    mood_distribution: List[MoodDistributionItem]
    weekly_trends: List[CommunityTrendItem]
    common_stress_factors: List[StressFactorItem]
    positive_insights: List[str]
