import os
import sys
import json
from datetime import datetime

# Set up path to include backend app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.journal import Journal
from app.models.wellbeing import Wellbeing
from app.services.journal_context import JournalContextService
from app.services.prompt_builder import PromptBuilder

# Set up in-memory SQLite database for clean model and CRUD tests
engine = create_engine("sqlite:///:memory:")
SessionLocal = sessionmaker(bind=engine)
Base.metadata.create_all(bind=engine)

def test_database_serialization():
    print("TEST 1: Database list property serialization...")
    db = SessionLocal()
    try:
        j = Journal(
            user_id=1,
            content="Grateful for a coding win today.",
            sentiment="Positive",
            primary_emotion="Grateful",
            secondary_emotions=["Proud", "Relieved"],
            positive_points=["Completed project", "Learned something new"],
            warning_signs=[],
            cognitive_patterns=["Gratitude Focus"],
            topics=["Work", "Learning"],
            stress_level=2,
            burnout_risk="Low"
        )
        db.add(j)
        db.commit()
        db.refresh(j)

        # Assert correct deserialization
        assert isinstance(j.secondary_emotions, list), "secondary_emotions must be a list"
        assert j.secondary_emotions == ["Proud", "Relieved"]
        assert j.positive_points == ["Completed project", "Learned something new"]
        assert j.warning_signs == []
        assert j.cognitive_patterns == ["Gratitude Focus"]
        assert j.topics == ["Work", "Learning"]
        
        # Verify raw database string contents
        raw = db.execute(Base.metadata.tables['journal'].select().where(Base.metadata.tables['journal'].c.id == j.id)).fetchone()
        # raw is a row; fields are indexed by columns
        assert '"Proud"' in raw.secondary_emotions, "Raw DB value must store serialized JSON string"
        print("TEST 1 PASSED: Model JSON array hybrid properties serialize/deserialize cleanly.")
    finally:
        db.close()

def test_empty_and_short_inputs():
    print("\nTEST 2: Empty and one-word guardrails...")
    
    # 1. Empty input
    res_empty = JournalContextService.analyze_journal_entry("")
    assert res_empty["primary_emotion"] == "Neutral", "Empty entry should default to Neutral"
    assert res_empty["sentiment"] == "Neutral"
    assert res_empty["secondary_emotions"] == []
    assert res_empty["topics"] == []
    assert res_empty["cognitive_patterns"] == []
    
    # 2. One-word input fallback
    res_word = JournalContextService._lexical_fallback("Stressed")
    assert res_word["primary_emotion"] == "Anxious", "Stressed keyword mapping must resolve emotion"
    assert res_word["sentiment"] == "Negative"
    assert res_word["stress_level"] >= 5
    assert "General reflection" in res_word["topics"]
    assert "Catastrophizing" in res_word["cognitive_patterns"] or "Emotional Reasoning" in res_word["cognitive_patterns"]
    
    print("TEST 2 PASSED: Empty and one-word inputs handle default structures safely.")

def test_lexical_fallback_schema_compatibility():
    print("\nTEST 3: Fallback schema compatibility...")
    res = JournalContextService._lexical_fallback("I couldn't sleep because of work stress.")
    
    required_keys = [
        "primary_emotion",
        "secondary_emotions",
        "sentiment",
        "sentiment_score",
        "stress_level",
        "burnout_risk",
        "confidence",
        "topics",
        "recurring_topics",
        "important_events",
        "summary",
        "recommended_focus",
        "positive_points",
        "warning_signs",
        "cognitive_patterns"
    ]
    
    for key in required_keys:
        assert key in res, f"Fallback output is missing key: {key}"
        
    assert isinstance(res["secondary_emotions"], list), "secondary_emotions must be list"
    assert isinstance(res["topics"], list), "topics must be list"
    assert isinstance(res["positive_points"], list), "positive_points must be list"
    assert isinstance(res["warning_signs"], list), "warning_signs must be list"
    assert isinstance(res["cognitive_patterns"], list), "cognitive_patterns must be list"
    assert isinstance(res["stress_level"], int), "stress_level must be int"
    
    print("TEST 3 PASSED: Fallback output structure completely matches target JSON schema.")

def test_prompt_builder_memory_coaching():
    print("\nTEST 4: Chatbot memory prompts and scan instruction...")
    mock_context = {
        "selected_date": "2026-07-25",
        "recent_journals": [
            Journal(
                content="I am scared about my interview tomorrow.",
                primary_emotion="Anxious",
                stress_level=8,
                important_events="Preparing for an interview",
                recurring_topics="Work, Interview",
                summary="User feels anxious and nervous about tomorrow's job interview."
            )
        ],
        "averages_7_days": {},
        "averages_30_days": {},
        "burnout_trend": "Stable",
        "mood_trend": "Stable"
    }
    
    prompt = PromptBuilder.build_chat_system_instruction("John", mock_context)
    
    # Assert journal entry and metadata is included in the instructions
    assert "John" in prompt
    assert "I am scared about my interview" in prompt
    assert "Emotion: Anxious" in prompt
    assert "Stress Level: 8/10" in prompt
    
    # Assert coaching memory rules are in the system instruction
    assert "Recent Journals Context" in prompt
    assert "interview" in prompt.lower()
    assert "coaching memory" in prompt.lower() or "scan the 'recent journals context'" in prompt.lower()
    
    print("TEST 4 PASSED: Chatbot memory is structured and instructed to scan recent journal logs.")

def test_daily_insights_journal_synthesis():
    print("\nTEST 5: Daily insights journal synthesis integration...")
    mock_context = {
        "selected_date": "2026-07-25",
        "recent_journals": [
            Journal(
                content="I completed my presentation today and feel proud.",
                primary_emotion="Proud",
                stress_level=2,
                summary="Completed a presentation and feels accomplished.",
                recurring_topics="Work, Accomplishment"
            )
        ],
        "averages_7_days": {"wellbeing_index": 70, "sleep": 7.5, "water": 2.0, "stress": 3.0, "recovery_score": 80.0},
        "averages_30_days": {},
        "detected_wellbeing_trends": [],
        "target_log": None
    }
    
    prompt = PromptBuilder.build_insights_prompt("John", mock_context, {"explanation": "Normal pacing", "impact_driver": "Sleep", "highest_impact_action": "Walk"})
    
    assert "Recent Journal Reflections:" in prompt
    assert "I completed my presentation today and feel proud." in prompt
    assert "synthesize" in prompt.lower() or "journal reflections" in prompt.lower()
    
    print("TEST 5 PASSED: Daily insights generator prompt successfully includes user journal reflections context.")

if __name__ == "__main__":
    print("====================================================")
    print("STARTING JOURNAL AI PIPELINE AUDIT VALIDATION TESTS")
    print("====================================================")
    
    test_database_serialization()
    test_empty_and_short_inputs()
    test_lexical_fallback_schema_compatibility()
    test_prompt_builder_memory_coaching()
    test_daily_insights_journal_synthesis()
    
    print("\n====================================================")
    print("ALL TESTS PASSED SUCCESSFULLY! OK")
    print("====================================================")
