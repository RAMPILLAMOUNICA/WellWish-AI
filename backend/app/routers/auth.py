from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.auth.password import get_password_hash, verify_password
from app.auth.jwt_handler import create_access_token, get_current_user
from app.schemes.user import UserCreate, UserResponse, UserUpdate, PasswordChange
from app.schemes.token import Token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user vault. Checks for email conflicts and hashes passwords.
    """
    # Check duplicate email
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered in another vault."
        )
    
    # Hash password and create record
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_pwd
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    OAuth2-compliant login endpoint. Exchanges valid email/password credentials for a JWT.
    
    Compatible with Axios:
    To authenticate via frontend, post credentials using 'multipart/form-data' or standard urlencoded format:
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    body: username=email&password=password
    """
    # Find user by email (OAuth2 username field maps to email)
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate token
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
    Update the full name of the current authenticated user vault.
    """
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name
    db.commit()
    db.refresh(current_user)
    return current_user

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
            detail="Incorrect old password verification."
        )
    
    current_user.hashed_password = get_password_hash(passwords_in.new_password)
    db.commit()
    return {"message": "Vault passcode rotated successfully."}
