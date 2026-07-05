import os
from dotenv import load_dotenv

# Load environment file
load_dotenv()

class Settings:
    PROJECT_NAME: str = "WellWish AI API"
    PROJECT_VERSION: str = "1.0.0"
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./wellwish.db")
    
    # JWT Authentication settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "wellwish_super_secret_key_2026")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # API Integration settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
