from pydantic import BaseModel, ConfigDict
from typing import Optional

class JournalBase(BaseModel):
    content: str

class JournalCreate(JournalBase):
    pass

class JournalUpdate(BaseModel):
    content: str

class JournalResponse(JournalBase):
    id: int
    user_id: int
    sentiment: Optional[str] = None
    sentiment_score: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
