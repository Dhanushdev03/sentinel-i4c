"""
SENTINEL-I4C: Authentication & Role-Based Access Control (RBAC)
User Roles:
1. LEA Officer
2. Bank Fraud Analyst
3. Supervisor
4. System Administrator
"""

import hmac
import hashlib
import time
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
import jwt
from pydantic import BaseModel, Field
from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = "SENTINEL_I4C_PROTOTYPE_SECRET_KEY_FOR_LOCAL_SIMULATION_ONLY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

security = HTTPBearer(auto_error=False)


class UserRole(str):
    LEA_OFFICER = "LEA Officer"
    BANK_ANALYST = "Bank Fraud Analyst"
    SUPERVISOR = "Supervisor"
    SYS_ADMIN = "System Administrator"


class User(BaseModel):
    id: str
    username: str
    full_name: str
    role: str
    badge_number: str
    clearance_level: str  # L1, L2, L3, L4
    state: str
    district: str
    password_hash: str


class UserPublic(BaseModel):
    id: str
    username: str
    full_name: str
    role: str
    badge_number: str
    clearance_level: str
    state: str
    district: str


class TokenData(BaseModel):
    sub: str
    role: str
    clearance: str


def hash_password(password: str) -> str:
    """Deterministic hash with salt for simulation prototype."""
    salt = "sentinel_salt_2024"
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    expected = hash_password(plain_password)
    return hmac.compare_digest(expected, hashed_password)


# Default In-Memory Users
SAMPLE_USERS: Dict[str, User] = {
    "r.sharma": User(
        id="USR-001",
        username="r.sharma",
        full_name="Insp. R. Sharma",
        role="LEA Officer",
        badge_number="MH-CYB-0312",
        clearance_level="L2",
        state="Maharashtra",
        district="Mumbai",
        password_hash=hash_password("Sentinel@2024!")
    ),
    "k.nair": User(
        id="USR-002",
        username="k.nair",
        full_name="SI Kavita Nair",
        role="Bank Fraud Analyst",
        badge_number="DL-CYB-0147",
        clearance_level="L2",
        state="Delhi",
        district="New Delhi",
        password_hash=hash_password("Sentinel@2024!")
    ),
    "a.mehta": User(
        id="USR-003",
        username="a.mehta",
        full_name="DCP Anand Mehta",
        role="Supervisor",
        badge_number="MH-SUP-0041",
        clearance_level="L3",
        state="Maharashtra",
        district="Mumbai",
        password_hash=hash_password("Sentinel@2024!")
    ),
    "admin": User(
        id="USR-004",
        username="admin",
        full_name="Admin Console",
        role="System Administrator",
        badge_number="SYS-ADM-0001",
        clearance_level="L4",
        state="National",
        district="Central HQ",
        password_hash=hash_password("Sentinel@2024!")
    )
}


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> User:
    if not credentials:
        # Default fallback user for convenient SIH demo without mandatory login block
        return SAMPLE_USERS["r.sharma"]

    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None or username not in SAMPLE_USERS:
            return SAMPLE_USERS["r.sharma"]
        return SAMPLE_USERS[username]
    except Exception:
        # Fallback to default user for local testing resilience
        return SAMPLE_USERS["r.sharma"]


def require_role(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles and current_user.role != "System Administrator":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation requires one of authorized roles: {allowed_roles}. Current role: {current_user.role}"
            )
        return current_user
    return role_checker
