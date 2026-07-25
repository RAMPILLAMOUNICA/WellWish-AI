from sqlalchemy.orm import Session
from typing import List, Optional, Tuple
from app.models.user import User

from app.services.chat_service import ChatService
from app.services.insight_generator import InsightGenerator
from app.services.journal_context import JournalContextService

class GeminiService:
    """
    Facade class that wraps modular AI layer service calls to preserve backwards compatibility.
    """
    @staticmethod
    def generate_wellbeing_insights(db: Session, user: User, target_date: Optional[str] = None) -> dict:
        """
        Delegates to InsightGenerator to generate structured wellness insights.
        """
        return InsightGenerator.generate_insights(db, user, target_date)

    @staticmethod
    def generate_chat_response(
        db: Session,
        user: User,
        message: str,
        chat_history: List[dict] = None,
        selected_date: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> tuple[str, str]:
        """
        Delegates to ChatService to fetch context-enriched conversational coaching.
        """
        return ChatService.generate_response(db, user, message, chat_history, selected_date, session_id=session_id)

    @staticmethod
    def generate_weekly_reflection(db: Session, user: User) -> dict:
        """
        Delegates to InsightGenerator to analyze weekly reflections.
        """
        return InsightGenerator.generate_weekly_reflection(db, user)

    @staticmethod
    def analyze_journal_sentiment(content: str) -> Optional[Tuple[str, float]]:
        """
        Delegates to JournalContextService to query sentiments of daily reflections.
        """
        return JournalContextService.analyze_journal_sentiment(content)

    @staticmethod
    def analyze_journal_entry(content: str) -> dict:
        """
        Delegates to JournalContextService to run full entry analysis.
        """
        from app.services.journal_context import JournalContextService
        return JournalContextService.analyze_journal_entry(content)

    @staticmethod
    def get_chat_history(db: Session, user: User) -> List[dict]:
        """
        Retrieves user's conversation history.
        """
        from app.services.history_service import HistoryService
        msgs = HistoryService.get_chat_history(db, user.id)
        return [{"role": m.role, "content": m.content, "created_at": m.created_at} for m in msgs]

    @staticmethod
    def get_session_messages(db: Session, user: User, session_id: str) -> List[dict]:
        """
        Retrieves user's conversation history for a specific session.
        """
        from app.services.history_service import HistoryService
        msgs = HistoryService.get_session_messages(db, user.id, session_id)
        return [{"role": m.role, "content": m.content, "created_at": m.created_at} for m in msgs]

    @staticmethod
    def generate_session_title(message: str) -> str:
        """
        Uses Gemini to generate a concise, supportive 3-5 word topic title from the user's initial prompt.
        """
        from app.core.config import settings
        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
            return "Conversation: " + (message[:20] + "..." if len(message) > 20 else message)
            
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-2.5-flash")
            prompt = f"Generate a short, friendly, supportive conversation topic title (maximum 3 to 5 words, no quotation marks) summarizing the following message:\n\n\"{message}\""
            response = model.generate_content(prompt)
            title = response.text.strip().replace('"', '').replace("'", "")
            return title if title else "New Wellbeing Conversation"
        except Exception:
            return "New Conversation"
