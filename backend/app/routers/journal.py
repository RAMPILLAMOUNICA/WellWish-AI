from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.journal import Journal
from app.models.user import User
from app.auth.jwt_handler import get_current_user
from app.schemes.journal import JournalCreate, JournalUpdate, JournalResponse

router = APIRouter(
    prefix="/journal",
    tags=["Journaling Vault"]
)

from app.services.gemini_service import GeminiService

def preprocess_and_analyze_sentiment(text: str):
    """
    Local AI-ready journal preprocessor. Runs advanced sentiment parsing
    using the Gemini API, falling back to lexical scoring if unavailable.
    """
    try:
        gemini_result = GeminiService.analyze_journal_sentiment(text)
        if gemini_result is not None:
            return gemini_result
    except Exception:
        pass

    clean_text = text.lower().strip()
    
    # Stress/Cortisol lexical signals
    stress_keywords = ["tired", "stressed", "overwhelmed", "exhausted", "burnout", "anxious", "sad", "unhappy", "frustrated", "fatigue"]
    # Relaxed/Homeostasis lexical signals
    peace_keywords = ["happy", "excited", "good", "calm", "relax", "great", "energetic", "accomplished", "proud", "rested"]
    
    stress_count = sum(1 for word in stress_keywords if word in clean_text)
    peace_count = sum(1 for word in peace_keywords if word in clean_text)
    
    if stress_count > peace_count:
        sentiment = "Strained"
        score = max(0.1, 0.5 - (stress_count * 0.1))
    elif peace_count > stress_count:
        sentiment = "Calm"
        score = min(0.95, 0.7 + (peace_count * 0.05))
    else:
        sentiment = "Neutral"
        score = 0.5
        
    return sentiment, round(score, 2)

@router.post("/", response_model=JournalResponse, status_code=status.HTTP_201_CREATED)
def create_journal_entry(
    entry_in: JournalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Log a new journal entry. Automatically tokenizes text and yields sentiment classifications.
    """
    sentiment, score = preprocess_and_analyze_sentiment(entry_in.content)
    
    new_entry = Journal(
        user_id=current_user.id,
        content=entry_in.content,
        sentiment=sentiment,
        sentiment_score=score
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

@router.get("/history", response_model=List[JournalResponse])
def get_journal_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve historical diary logs for the authenticated session vault, sorted descending.
    """
    history = db.query(Journal).filter(
        Journal.user_id == current_user.id
    ).order_by(Journal.id.desc()).all()
    return history

@router.put("/{journal_id}", response_model=JournalResponse)
def update_journal_entry(
    journal_id: int,
    entry_in: JournalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Modify an existing journal entry content and re-analyze the sentiment score.
    """
    db_entry = db.query(Journal).filter(
        Journal.id == journal_id,
        Journal.user_id == current_user.id
    ).first()
    
    if not db_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found inside this vault."
        )
        
    sentiment, score = preprocess_and_analyze_sentiment(entry_in.content)
    
    db_entry.content = entry_in.content
    db_entry.sentiment = sentiment
    db_entry.sentiment_score = score
    
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.delete("/{journal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_journal_entry(
    journal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Purge a journal entry from the local SQLite database database.
    """
    db_entry = db.query(Journal).filter(
        Journal.id == journal_id,
        Journal.user_id == current_user.id
    ).first()
    
    if not db_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found inside this vault."
        )
        
    db.delete(db_entry)
    db.commit()
    return
