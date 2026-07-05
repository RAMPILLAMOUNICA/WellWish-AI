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

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class UserResponse(UserBase):
    id: int

    # Config to allow ORM conversion (from_attributes is Pydantic v2's orm_mode)
    model_config = ConfigDict(from_attributes=True)
