from sqlalchemy import Column, Integer, Float, String, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Wellbeing(Base):
    __tablename__ = "wellbeing"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    logged_date = Column(String, index=True, nullable=True) # YYYY-MM-DD format (IST)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Biometric Telemetry
    mood = Column(String, nullable=True)
    sleep = Column(Float, nullable=True) # Hours of sleep
    steps = Column(Integer, nullable=True)
    water = Column(Float, nullable=True) # Litres
    screen_time = Column(Float, nullable=True) # Hours
    heart_rate = Column(Integer, nullable=True) # Resting HR (BPM)
    
    # Questionnaire Metrics
    energy_level = Column(Integer, nullable=True) # Scale 1-10
    stress_level = Column(Integer, nullable=True) # Scale 1-10
    
    # Standalone Mode 2 Metrics
    sleep_quality = Column(Integer, nullable=True)
    work_pressure = Column(Integer, nullable=True)
    anxiety_level = Column(Integer, nullable=True)
    motivation = Column(Integer, nullable=True)
    appetite = Column(Integer, nullable=True)
    social_interaction = Column(Integer, nullable=True)
    physical_activity = Column(Integer, nullable=True)
    
    # AI Synthesized indices
    wellbeing_index = Column(Float, nullable=True)
    stress_risk = Column(String, nullable=True)
    burnout_risk = Column(String, nullable=True)
    recovery_score = Column(Float, nullable=True)
    wearable_connected = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="wellbeings")