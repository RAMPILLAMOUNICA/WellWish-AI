from pydantic import BaseModel, ConfigDict
from typing import Optional

class WellbeingBase(BaseModel):
    mood: Optional[str] = None
    sleep: Optional[float] = None
    steps: Optional[int] = None
    water: Optional[float] = None
    screen_time: Optional[float] = None
    heart_rate: Optional[int] = None
    energy_level: Optional[int] = None
    stress_level: Optional[int] = None
    
    # Standalone Mode 2 Metrics
    sleep_quality: Optional[int] = None
    work_pressure: Optional[int] = None
    anxiety_level: Optional[int] = None
    motivation: Optional[int] = None
    appetite: Optional[int] = None
    social_interaction: Optional[int] = None
    physical_activity: Optional[int] = None
    
    # AI Synthesized indices
    wellbeing_index: Optional[float] = None
    stress_risk: Optional[str] = None
    burnout_risk: Optional[str] = None
    recovery_score: Optional[float] = None
    wearable_connected: Optional[bool] = False

class WellbeingCreate(WellbeingBase):
    pass

class WellbeingResponse(WellbeingBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)
