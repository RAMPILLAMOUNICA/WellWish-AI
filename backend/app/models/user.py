from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    notification_checkin = Column(Boolean, default=True)
    notification_streak = Column(Boolean, default=True)
    notification_action_plan = Column(Boolean, default=True)
    ai_tone = Column(String, default="Empathetic & Gentle")
    app_theme = Column(String, default="Calm")
    
    # User Daily Streak System
    streak = Column(Integer, default=0, nullable=False)
    last_active_date = Column(String, nullable=True)

    # Relationships with cascading deletes
    wellbeings = relationship("Wellbeing", back_populates="user", cascade="all, delete-orphan")
    journals = relationship("Journal", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")