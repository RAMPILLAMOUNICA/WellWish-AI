from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.auth.jwt_handler import get_current_user
from typing import List
from app.services.gemini_service import GeminiService
from app.schemes.ai import AIInsightsResponse, AIChatRequest, AIChatResponse, AIWeeklyReflectionResponse, ChatMessageResponse, ChatSessionResponse

router = APIRouter(
    prefix="/ai",
    tags=["Decision Intelligence AI"]
)

@router.get("/insights", response_model=AIInsightsResponse)
def get_wellbeing_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Query the active AI service (Willa) to evaluate the user's latest vitals
    and recent journal entries to generate homeostatic summaries and suggestions.
    """
    insights = GeminiService.generate_wellbeing_insights(db, current_user)
    return insights

@router.post("/chat", response_model=AIChatResponse)
def get_willa_chat_response(
    chat_in: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit a conversational message to Willa, returning her personalized mental fitness guidance.
    """
    reply, session_id = GeminiService.generate_chat_response(
        db=db,
        user=current_user,
        message=chat_in.message,
        chat_history=chat_in.chat_history,
        selected_date=chat_in.selected_date,
        session_id=chat_in.session_id
    )
    return AIChatResponse(reply=reply, session_id=session_id)

@router.get("/chat/sessions", response_model=List[ChatSessionResponse])
def get_willa_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch all persistent chat session threads for the authenticated user.
    """
    from app.services.history_service import HistoryService
    return HistoryService.get_chat_sessions(db, current_user.id)

@router.get("/chat/session/{session_id}", response_model=List[ChatMessageResponse])
def get_willa_session_messages(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve message sequences for a specific chat session thread.
    """
    return GeminiService.get_session_messages(db, current_user, session_id)

@router.delete("/chat/session/{session_id}", status_code=status.HTTP_200_OK)
def delete_willa_chat_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Permanently delete a chat session and purge its cascading history from database.
    """
    from app.services.history_service import HistoryService
    success = HistoryService.delete_chat_session(db, current_user.id, session_id)
    if not success:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Chat session not found.")
    return {"message": "Chat session and logs purged successfully."}

@router.get("/weekly-reflection", response_model=AIWeeklyReflectionResponse)
def get_willa_weekly_reflection(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a 7-day consolidated wellbeing reflection analyzing parameter shifts and diary logs.
    """
    reflection = GeminiService.generate_weekly_reflection(db=db, user=current_user)
    return reflection

@router.get("/chat/history", response_model=List[ChatMessageResponse])
def get_willa_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch the persistent chat logs for the active user session.
    """
    return GeminiService.get_chat_history(db, current_user)
