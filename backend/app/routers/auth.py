from fastapi import APIRouter, Depends, HTTPException, status, Request
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
            detail="Incorrect password"
        )
    
    current_user.hashed_password = get_password_hash(passwords_in.new_password)
    db.commit()
    return {"message": "Vault passcode rotated successfully."}
