from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.wellbeing import Wellbeing
from app.models.journal import Journal
from app.models.chat_message import ChatMessage
from app.auth.password import get_password_hash, verify_password
from app.auth.jwt_handler import create_access_token, get_current_user
from app.schemes.user import UserCreate, UserResponse, UserUpdate, PasswordChange
from app.schemes.token import Token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@router.post("/register/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user vault. If the account already exists with valid password, return existing user.
    """
    clean_email = user_in.email.strip().lower()
    db_user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if db_user:
        if verify_password(user_in.password, db_user.hashed_password):
            return db_user
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email address is already registered. Please sign in with your password."
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        email=clean_email,
        full_name=user_in.full_name.strip(),
        hashed_password=hashed_pwd
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
@router.post("/login/", response_model=Token)
async def login(request: Request, db: Session = Depends(get_db)):
    """
    Dual form-data and JSON compatible login endpoint.
    Exchanges valid email/password credentials for a JWT.
    """
    username = None
    password = None

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            username = body.get("email") or body.get("username")
            password = body.get("password")
        except Exception:
            pass

    if not username or not password:
        try:
            form = await request.form()
            username = form.get("username") or form.get("email")
            password = form.get("password")
        except Exception:
            pass

    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email/username and password are required."
        )

    clean_email = username.strip().lower()
    user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Fetch the profile metadata for the currently authenticated user session.
    
    Axios setup:
    Attach JWT in Auth Headers:
    headers: { Authorization: `Bearer ${token}` }
    """
    return current_user

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """
    Token-based logout placeholder. 
    
    Since JWTs are stateless, actual invalidation should be handled on the client-side
    (e.g., removing the token from localStorage/cookies via Axios client intercepts).
    """
    return {
        "status": "success",
        "message": "Vault successfully locked. Please purge client session tokens."
    }

@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update the user vault settings and profile preferences.
    """
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name.strip()
        
    if profile_in.email is not None:
        clean_email = profile_in.email.strip().lower()
        if clean_email != current_user.email:
            existing = db.query(User).filter(User.email.ilike(clean_email)).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This email address is already in use by another account."
                )
            current_user.email = clean_email
            
    if profile_in.notification_checkin is not None:
        current_user.notification_checkin = profile_in.notification_checkin
        
    if profile_in.notification_streak is not None:
        current_user.notification_streak = profile_in.notification_streak
        
    if profile_in.notification_action_plan is not None:
        current_user.notification_action_plan = profile_in.notification_action_plan
        
    if profile_in.ai_tone is not None:
        current_user.ai_tone = profile_in.ai_tone
        
    if profile_in.app_theme is not None:
        current_user.app_theme = profile_in.app_theme
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/export-data")
def export_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Compile and export all user data including biometrics history, journal entries, and chat logs.
    """
    wellbeings = [
        {
            "logged_date": w.logged_date,
            "wellbeing_index": w.wellbeing_index,
            "mood": w.mood,
            "sleep": w.sleep,
            "water": w.water,
            "steps": w.steps,
            "screen_time": w.screen_time,
            "recovery_score": w.recovery_score,
            "burnout_risk": w.burnout_risk,
            "created_at": w.created_at.isoformat() if w.created_at else None
        }
        for w in current_user.wellbeings
    ]
    
    journals = [
        {
            "content": j.content,
            "sentiment": j.sentiment,
            "sentiment_score": j.sentiment_score,
            "primary_emotion": j.primary_emotion,
            "stress_level": j.stress_level,
            "summary": j.summary,
            "created_at": j.created_at.isoformat() if j.created_at else None
        }
        for j in current_user.journals
    ]
    
    # Calculate unique check-in dates
    all_dates = list(set([w["logged_date"] for w in wellbeings if w["logged_date"]] + 
                         [j["created_at"][:10] for j in journals if j["created_at"]]))
    all_dates.sort(reverse=True)
    
    data = {
        "user": {
            "full_name": current_user.full_name,
            "email": current_user.email,
            "ai_tone": current_user.ai_tone,
            "app_theme": current_user.app_theme
        },
        "wellbeing_logs": wellbeings,
        "journal_entries": journals,
        "total_logs": len(wellbeings),
        "total_journals": len(journals),
        "logged_dates": all_dates
    }
    return data

@router.post("/clear-data")
def clear_user_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Purge all journal entries, biometrics logs, and chatbot memories for the current user.
    """
    db.query(Wellbeing).filter(Wellbeing.user_id == current_user.id).delete()
    db.query(Journal).filter(Journal.user_id == current_user.id).delete()
    db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).delete()
    db.commit()
    return {"message": "All session memories and logs purged successfully."}

@router.delete("/delete-account")
def delete_user_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Permanently remove the user account and cascade delete all associated data assets.
    """
    db.delete(current_user)
    db.commit()
    return {"message": "Account and all associated wellness assets permanently deleted."}

@router.put("/password", status_code=status.HTTP_200_OK)
def change_password(
    passwords_in: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update user password securely, verifying old password matches context records.
    """
    if not verify_password(passwords_in.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    current_user.hashed_password = get_password_hash(passwords_in.new_password)
    db.commit()
    return {"message": "Vault passcode rotated successfully."}
