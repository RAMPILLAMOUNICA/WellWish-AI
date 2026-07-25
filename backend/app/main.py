from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.database import Base, engine
from app.routers import auth, wellbeing, journal, ai, dashboard, community
from app.models.chat_session import ChatSession
from sqlalchemy import inspect, text

# Auto create database tables on application start
Base.metadata.create_all(bind=engine)

# Inspect and migrate table columns dynamically for existing databases
inspector = inspect(engine)
if "wellbeing" in inspector.get_table_names():
    columns = [col['name'] for col in inspector.get_columns('wellbeing')]
    new_cols = {
        "logged_date": "VARCHAR",
        "created_at": "DATETIME",
        "sleep_quality": "INTEGER",
        "work_pressure": "INTEGER",
        "anxiety_level": "INTEGER",
        "motivation": "INTEGER",
        "appetite": "INTEGER",
        "social_interaction": "INTEGER",
        "physical_activity": "INTEGER",
        "burnout_risk": "VARCHAR",
        "recovery_score": "FLOAT",
        "wearable_connected": "BOOLEAN DEFAULT 0"
    }
    with engine.begin() as conn:
        for col_name, col_type in new_cols.items():
            if col_name not in columns:
                conn.execute(text(f"ALTER TABLE wellbeing ADD COLUMN {col_name} {col_type}"))

if "journal" in inspector.get_table_names():
    journal_columns = [col['name'] for col in inspector.get_columns('journal')]
    journal_new_cols = {
        "created_at": "DATETIME",
        "primary_emotion": "VARCHAR",
        "stress_level": "INTEGER",
        "important_events": "TEXT",
        "recurring_topics": "TEXT",
        "secondary_emotions": "TEXT",
        "burnout_risk": "VARCHAR",
        "confidence": "FLOAT",
        "summary": "TEXT",
        "recommended_focus": "TEXT",
        "positive_points": "TEXT",
        "warning_signs": "TEXT",
        "cognitive_patterns": "TEXT",
        "topics": "TEXT",
        "analysis_timestamp": "DATETIME"
    }
    with engine.begin() as conn:
        for col_name, col_type in journal_new_cols.items():
            if col_name not in journal_columns:
                conn.execute(text(f"ALTER TABLE journal ADD COLUMN {col_name} {col_type}"))

if "users" in inspector.get_table_names():
    users_columns = [col['name'] for col in inspector.get_columns('users')]
    users_new_cols = {
        "notification_checkin": "BOOLEAN DEFAULT 1",
        "notification_streak": "BOOLEAN DEFAULT 1",
        "notification_action_plan": "BOOLEAN DEFAULT 1",
        "ai_tone": "VARCHAR DEFAULT 'Empathetic & Gentle'",
        "app_theme": "VARCHAR DEFAULT 'Calm'",
        "streak": "INTEGER DEFAULT 0",
        "last_active_date": "VARCHAR"
    }
    with engine.begin() as conn:
        for col_name, col_type in users_new_cols.items():
            if col_name not in users_columns:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))

if "chat_messages" in inspector.get_table_names():
    chat_msg_columns = [col['name'] for col in inspector.get_columns('chat_messages')]
    if "session_id" not in chat_msg_columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE chat_messages ADD COLUMN session_id VARCHAR"))

app = FastAPI(
    title="WellWish AI API",
    description="AI-Powered Decision Intelligence Platform for Personalized Wellbeing",
    version="1.0.0"
)

# CORS configurations for frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://well-wish-ai.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "User-Agent", "X-Requested-With"],
)
# Include Router Modules
app.include_router(auth.router)
app.include_router(wellbeing.router)
app.include_router(journal.router)
app.include_router(ai.router)
app.include_router(dashboard.router)
app.include_router(community.router)

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    origin = request.headers.get("origin")
    allowed_origins = [
        "https://well-wish-ai.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173"
    ]
    allow_origin = origin if origin in allowed_origins else "https://well-wish-ai.vercel.app"
    
    headers = {
        "Access-Control-Allow-Origin": allow_origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
    }
        
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=headers
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    origin = request.headers.get("origin")
    allowed_origins = [
        "https://well-wish-ai.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173"
    ]
    allow_origin = origin if origin in allowed_origins else "https://well-wish-ai.vercel.app"

    headers = {
        "Access-Control-Allow-Origin": allow_origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
    }
        
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
        headers=headers
    )

@app.get("/")
def home():
    """
    Root endpoint.
    """
    return {
        "message": "Welcome to WellWish AI Backend 🚀",
        "docs_url": "/docs"
    }

@app.get("/health")
def health():
    """
    Service health check endpoint.
    """
    return {
        "status": "Backend Running Successfully",
        "database": "Connected"
    }