from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.wellbeing import Wellbeing
from app.models.journal import Journal

from app.models.chat_message import ChatMessage
from app.models.chat_session import ChatSession

class HistoryService:
    @staticmethod
    def get_recent_checkins(db: Session, user_id: int, limit: int = 30) -> List[Wellbeing]:
        """
        Retrieves check-in biometrics logs from newest to oldest.
        """
        return db.query(Wellbeing).filter(
            Wellbeing.user_id == user_id
        ).order_by(Wellbeing.logged_date.desc(), Wellbeing.id.desc()).limit(limit).all()

    @staticmethod
    def get_recent_journals(db: Session, user_id: int, limit: int = 5) -> List[Journal]:
        """
        Retrieves recent journal logs written by the user.
        """
        return db.query(Journal).filter(
            Journal.user_id == user_id
        ).order_by(Journal.created_at.desc(), Journal.id.desc()).limit(limit).all()

    @staticmethod
    def get_checkin_by_date(db: Session, user_id: int, date_str: str) -> Optional[Wellbeing]:
        """
        Fetches check-in record for a specific calendar date YYYY-MM-DD.
        """
        return db.query(Wellbeing).filter(
            Wellbeing.user_id == user_id,
            Wellbeing.logged_date == date_str
        ).order_by(Wellbeing.id.desc()).first()

    @staticmethod
    def get_chat_history(db: Session, user_id: int, limit: int = 50) -> List[ChatMessage]:
        """
        Retrieves recent chat history from oldest to newest.
        """
        msgs = db.query(ChatMessage).filter(
            ChatMessage.user_id == user_id
        ).order_by(ChatMessage.id.desc()).limit(limit).all()
        return list(reversed(msgs))

    @staticmethod
    def save_chat_message(db: Session, user_id: int, role: str, content: str, session_id: Optional[str] = None) -> ChatMessage:
        """
        Saves a chat message, optionally associated with a session.
        """
        msg = ChatMessage(user_id=user_id, role=role, content=content, session_id=session_id)
        db.add(msg)
        db.commit()
        db.refresh(msg)
        return msg

    @staticmethod
    def get_chat_sessions(db: Session, user_id: int) -> List[ChatSession]:
        """
        Retrieves all chat sessions for a user, sorted descending by created_at.
        """
        return db.query(ChatSession).filter(
            ChatSession.user_id == user_id
        ).order_by(ChatSession.created_at.desc()).all()

    @staticmethod
    def get_session_messages(db: Session, user_id: int, session_id: str, limit: int = 50) -> List[ChatMessage]:
        """
        Retrieves messages within a specific session, sorted oldest to newest.
        """
        msgs = db.query(ChatMessage).filter(
            ChatMessage.user_id == user_id,
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.id.desc()).limit(limit).all()
        return list(reversed(msgs))

    @staticmethod
    def delete_chat_session(db: Session, user_id: int, session_id: str) -> bool:
        """
        Deletes a specific chat session and all cascading messages.
        """
        session = db.query(ChatSession).filter(
            ChatSession.user_id == user_id,
            ChatSession.id == session_id
        ).first()
        if session:
            db.delete(session)
            db.commit()
            return True
        return False
