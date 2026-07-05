from passlib.context import CryptContext

# Instantiate CryptContext with Bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify if a raw password matches its encrypted database version.
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Encrypt a plain text password using bcrypt hashing.
    """
    return pwd_context.hash(password)
