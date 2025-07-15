from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models import AdminSession
from config import settings
import uuid
import pytz

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Token settings
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# HTTP Bearer token scheme
security = HTTPBearer(auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)

def verify_admin_password(password: str) -> bool:
    """Verify admin password against configured password."""
    return password == settings.ADMIN_PASSWORD

def verify_preview_token(token: str) -> bool:
    """Verify preview token for admin access to locked content."""
    return token == settings.PREVIEW_TOKEN

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(pytz.UTC) + expires_delta
    else:
        expire = datetime.now(pytz.UTC) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    # Convert to timestamp for JWT
    to_encode.update({"exp": expire.timestamp()})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def create_admin_session(db: Session) -> str:
    """Create a new admin session and return session token."""
    # Create JWT token
    session_id = str(uuid.uuid4())
    token_data = {"session_id": session_id, "type": "admin"}
    access_token = create_access_token(token_data)
    
    # Store session in database
    expires_at = datetime.now(pytz.UTC) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    db_session = AdminSession(
        id=session_id,
        expires_at=expires_at,
        is_active=True
    )
    db.add(db_session)
    db.commit()
    
    return access_token

def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> dict:
    """Get current admin user from JWT token."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify token
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check session in database
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    session = db.query(AdminSession).filter(
        AdminSession.id == session_id,
        AdminSession.is_active == True,
        AdminSession.expires_at > datetime.now(pytz.UTC)
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {"session_id": session_id, "type": "admin"}

def get_current_time_utc() -> datetime:
    """Get current UTC time."""
    return datetime.now(pytz.UTC)

def get_current_time_gmt4() -> datetime:
    """Get current time in GMT-4 timezone."""
    utc_time = datetime.now(pytz.UTC)
    gmt4_tz = pytz.timezone('America/New_York')  # GMT-4 (EDT)
    return utc_time.astimezone(gmt4_tz)

def is_content_unlocked(release_datetime_utc: datetime, preview_token: Optional[str] = None) -> bool:
    """Check if content is unlocked based on release time or preview token."""
    # Admin preview access
    if preview_token and verify_preview_token(preview_token):
        return True
    
    # Time-based unlocking
    current_utc = get_current_time_utc()
    return current_utc >= release_datetime_utc 