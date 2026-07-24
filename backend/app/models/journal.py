from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime
from sqlalchemy.orm import relationship
from app.database import Base

class Journal(Base):
    __tablename__ = "journal"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(String, nullable=False)
    
    # Preprocessing AI fields (Sentiment placeholders)
    sentiment = Column(String, nullable=True)
    sentiment_score = Column(Float, nullable=True) # Score between 0 and 1
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="journals")