from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.auth.jwt_handler import get_current_user
from app.services.gemini_service import GeminiService
from app.schemes.ai import AIInsightsResponse, AIChatRequest, AIChatResponse, AIWeeklyReflectionResponse

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
    Query the active AI service (Willa) to evaluate the user's latest biometrics
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
    reply = GeminiService.generate_chat_response(
        db=db,
        user=current_user,
        message=chat_in.message,
        chat_history=chat_in.chat_history
    )
    return AIChatResponse(reply=reply)

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
