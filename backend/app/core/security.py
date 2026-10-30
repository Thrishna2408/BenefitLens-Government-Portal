import hashlib
import re
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Union, Any
from jose import jwt, JWTError
from app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

# Aadhaar Security and Privacy Compliance
def validate_aadhaar_format(aadhaar: str) -> bool:
    """Verifies that Aadhaar contains exactly 12 digits (ignoring spaces/hyphens)"""
    cleaned = re.sub(r'[\s\-]', '', aadhaar or '')
    return bool(re.match(r'^[2-9]{1}[0-9]{11}$', cleaned))

def mask_aadhaar(aadhaar: str) -> str:
    """Never stores or displays full Aadhaar. Returns masked format: XXXX-XXXX-1234"""
    cleaned = re.sub(r'[\s\-]', '', aadhaar or '')
    if len(cleaned) == 12:
        return f"XXXX-XXXX-{cleaned[-4:]}"
    elif len(cleaned) >= 4:
        return f"XXXX-XXXX-{cleaned[-4:]}"
    return "XXXX-XXXX-XXXX"

def hash_aadhaar(aadhaar: str) -> str:
    """Secure SHA-256 hash for database uniqueness/deduplication checks without storing raw Aadhaar"""
    cleaned = re.sub(r'[\s\-]', '', aadhaar or '')
    salted = f"{settings.JWT_SECRET}:{cleaned}"
    return hashlib.sha256(salted.encode('utf-8')).hexdigest()
