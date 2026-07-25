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

from datetime import datetime

def run_full_journal_analysis(text: str) -> dict:
    """
    Runs full generative analysis using GeminiService, falling back to lexical rules.
    """
    try:
        return GeminiService.analyze_journal_entry(text)
    except Exception as e:
        print("Failed to run entry analysis", e)
        from app.services.journal_context import JournalContextService
        return JournalContextService._lexical_fallback(text)

@router.post("", response_model=JournalResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=JournalResponse, status_code=status.HTTP_201_CREATED)
def create_journal_entry(
    entry_in: JournalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Log a new journal entry. Automatically extracts emotions, stress levels, events, and topics.
    """
    analysis = run_full_journal_analysis(entry_in.content)
    
    entry_created_at = entry_in.created_at if entry_in.created_at else datetime.utcnow()
    
    new_entry = Journal(
        user_id=current_user.id,
        content=entry_in.content,
        sentiment=analysis.get("sentiment"),
        sentiment_score=analysis.get("sentiment_score"),
        primary_emotion=analysis.get("primary_emotion"),
        stress_level=analysis.get("stress_level"),
        important_events=analysis.get("important_events"),
        recurring_topics=analysis.get("recurring_topics"),
        secondary_emotions=analysis.get("secondary_emotions"),
        burnout_risk=analysis.get("burnout_risk"),
        confidence=analysis.get("confidence"),
        summary=analysis.get("summary"),
        recommended_focus=analysis.get("recommended_focus"),
        positive_points=analysis.get("positive_points"),
        warning_signs=analysis.get("warning_signs"),
        cognitive_patterns=analysis.get("cognitive_patterns"),
        topics=analysis.get("topics"),
        analysis_timestamp=datetime.utcnow(),
        created_at=entry_created_at
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    # Automatically recalculate user's daily streak
    from app.services.streak_service import StreakService
    StreakService.update_user_streak(db, current_user.id)

    return new_entry

@router.get("/history", response_model=List[JournalResponse])
def get_journal_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve historical diary logs for the authenticated session vault, sorted descending by event date.
    """
    history = db.query(Journal).filter(
        Journal.user_id == current_user.id
    ).order_by(Journal.created_at.desc(), Journal.id.desc()).all()
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
        
    analysis = run_full_journal_analysis(entry_in.content)
    
    db_entry.content = entry_in.content
    db_entry.sentiment = analysis.get("sentiment")
    db_entry.sentiment_score = analysis.get("sentiment_score")
    db_entry.primary_emotion = analysis.get("primary_emotion")
    db_entry.stress_level = analysis.get("stress_level")
    db_entry.important_events = analysis.get("important_events")
    db_entry.recurring_topics = analysis.get("recurring_topics")
    db_entry.secondary_emotions = analysis.get("secondary_emotions")
    db_entry.burnout_risk = analysis.get("burnout_risk")
    db_entry.confidence = analysis.get("confidence")
    db_entry.summary = analysis.get("summary")
    db_entry.recommended_focus = analysis.get("recommended_focus")
    db_entry.positive_points = analysis.get("positive_points")
    db_entry.warning_signs = analysis.get("warning_signs")
    db_entry.cognitive_patterns = analysis.get("cognitive_patterns")
    db_entry.topics = analysis.get("topics")
    db_entry.analysis_timestamp = datetime.utcnow()
    
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
