from pydantic import BaseModel, ConfigDict
from typing import Optional

class UserBase(BaseModel):
    email: str
    full_name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    notification_checkin: Optional[bool] = None
    notification_streak: Optional[bool] = None
    notification_action_plan: Optional[bool] = None
    ai_tone: Optional[str] = None
    app_theme: Optional[str] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class UserResponse(UserBase):
    id: int
    notification_checkin: bool
    notification_streak: bool
    notification_action_plan: bool
    ai_tone: str
    app_theme: str

    # Config to allow ORM conversion (from_attributes is Pydantic v2's orm_mode)
    model_config = ConfigDict(from_attributes=True)
