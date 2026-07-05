from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, wellbeing, journal, ai, dashboard, community
from sqlalchemy import inspect, text

# Auto create database tables on application start
Base.metadata.create_all(bind=engine)

# Inspect and migrate table columns dynamically for existing databases
inspector = inspect(engine)
if "wellbeing" in inspector.get_table_names():
    columns = [col['name'] for col in inspector.get_columns('wellbeing')]
    new_cols = {
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

app = FastAPI(
    title="WellWish AI API",
    description="AI-Powered Decision Intelligence Platform for Personalized Wellbeing",
    version="1.0.0"
)

# CORS configurations for frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to specific domain sources
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Router Modules
app.include_router(auth.router)
app.include_router(wellbeing.router)
app.include_router(journal.router)
app.include_router(ai.router)
app.include_router(dashboard.router)
app.include_router(community.router)

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