from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime
from sqlalchemy.orm import relationship
from app.database import Base

import json
from typing import List

class Journal(Base):
    __tablename__ = "journal"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(String, nullable=False)
    
    # Preprocessing AI fields (Sentiment placeholders)
    sentiment = Column(String, nullable=True)
    sentiment_score = Column(Float, nullable=True) # Score between 0 and 1
    
    # Advanced AI Intelligence fields
    primary_emotion = Column(String, nullable=True)
    stress_level = Column(Integer, nullable=True)
    important_events = Column(String, nullable=True)
    recurring_topics = Column(String, nullable=True)
    
    # Additional AI Audit fields
    _secondary_emotions = Column("secondary_emotions", String, nullable=True)
    burnout_risk = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    summary = Column(String, nullable=True)
    recommended_focus = Column(String, nullable=True)
    _positive_points = Column("positive_points", String, nullable=True)
    _warning_signs = Column("warning_signs", String, nullable=True)
    _cognitive_patterns = Column("cognitive_patterns", String, nullable=True)
    _topics = Column("topics", String, nullable=True)
    analysis_timestamp = Column(DateTime, default=datetime.utcnow)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="journals")

    # Helper helper to convert JSON string properties to Python lists
    def _get_list_property(self, field: str) -> List[str]:
        raw_val = getattr(self, field)
        if not raw_val:
            return []
        try:
            return json.loads(raw_val)
        except Exception:
            return []

    def _set_list_property(self, field: str, value: List[str]):
        if value is None:
            setattr(self, field, None)
        else:
            setattr(self, field, json.dumps(value))

    @property
    def secondary_emotions(self) -> List[str]:
        return self._get_list_property("_secondary_emotions")

    @secondary_emotions.setter
    def secondary_emotions(self, value: List[str]):
        self._set_list_property("_secondary_emotions", value)

    @property
    def positive_points(self) -> List[str]:
        return self._get_list_property("_positive_points")

    @positive_points.setter
    def positive_points(self, value: List[str]):
        self._set_list_property("_positive_points", value)

    @property
    def warning_signs(self) -> List[str]:
        return self._get_list_property("_warning_signs")

    @warning_signs.setter
    def warning_signs(self, value: List[str]):
        self._set_list_property("_warning_signs", value)

    @property
    def cognitive_patterns(self) -> List[str]:
        return self._get_list_property("_cognitive_patterns")

    @cognitive_patterns.setter
    def cognitive_patterns(self, value: List[str]):
        self._set_list_property("_cognitive_patterns", value)

    @property
    def topics(self) -> List[str]:
        return self._get_list_property("_topics")

    @topics.setter
    def topics(self, value: List[str]):
        self._set_list_property("_topics", value)