import google.generativeai as genai
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from app.models.user import User
from app.core.config import settings
from app.services.context_builder import ContextBuilder
from app.services.prompt_builder import PromptBuilder
from app.services.history_service import HistoryService

class ChatService:
    @staticmethod
    def generate_response(
        db: Session,
        user: User,
        message: str,
        chat_history: List[dict] = None,
        selected_date: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> tuple[str, str]:
        """
        Orchestrates Willa's context collection, prompt rendering,
        and database-persisted chat history memory for conversation flow.
        """
        import uuid
        from app.models.chat_session import ChatSession
        from app.services.gemini_service import GeminiService
        
        if not session_id:
            session_id = str(uuid.uuid4())
            
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not session:
            title = GeminiService.generate_session_title(message)
            session = ChatSession(id=session_id, user_id=user.id, title=title)
            db.add(session)
            db.commit()

        # Save user message to database
        HistoryService.save_chat_message(db, user.id, "user", message, session_id=session_id)

        # Gathers wellbeing and journal context
        context = ContextBuilder.build_wellbeing_context(db, user.id, selected_date)
        
        # Inject Proactive Coaching Trend Warning
        from app.services.proactive_coaching_service import ProactiveCoachingService
        coaching = ProactiveCoachingService.detect_trends(db, user.id)
        if coaching:
            context["proactive_coaching_alert"] = f"CRITICAL COACHING ALERT: {coaching['coaching_message']}"
        
        # Detect emotional state and select coaching tone
        from app.services.personality_engine import PersonalityEngine
        personality = PersonalityEngine.detect_emotional_state_and_tone(context, message, preferred_tone=user.ai_tone)

        # Build prompt templates
        system_instruction = PromptBuilder.build_chat_system_instruction(user.full_name, context, personality_alignment=personality)

        # Retrieve DB-persisted chat history for this specific session
        db_history = HistoryService.get_session_messages(db, user.id, session_id, limit=20)
        
        # Convert DB history to Gemini history format (excluding the very last user message we just saved)
        formatted_history = []
        if len(db_history) > 1:
            for msg in db_history[:-1]:
                role = "user" if msg.role == "user" else "model"
                formatted_history.append({"role": role, "parts": [msg.content]})

        # Fallback offline response if API key is missing
        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
            target_log = context.get("target_log")
            mood = target_log.mood if target_log else "Stable"
            fallback_reply = f"Hi {user.full_name}, I'm here as your supportive companion. Currently my AI engine is running in offline mode, but I can see you logged a {mood} mood on {context.get('selected_date')}. Remember to take a screen break and hydrate!"
            HistoryService.save_chat_message(db, user.id, "model", fallback_reply, session_id=session_id)
            return fallback_reply, session_id

        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(
                model_name="gemini-3.5-flash-lite",
                system_instruction=system_instruction
            )
            chat = model.start_chat(history=formatted_history)
            response = chat.send_message(message)
            reply = response.text.strip()
            
            # Save model reply to database
            HistoryService.save_chat_message(db, user.id, "model", reply, session_id=session_id)
            return reply, session_id
            
        except Exception as e:
            print("Chat response failed", e)
            err_reply = f"Hi {user.full_name}, I ran into a connection glitch while reviewing your parameters, but please remember to pace yourself and step away from screens for a 2-minute somatic rest!"
            HistoryService.save_chat_message(db, user.id, "model", err_reply, session_id=session_id)
            return err_reply, session_id
