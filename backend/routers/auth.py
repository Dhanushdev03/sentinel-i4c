"""
Auth Router: Login & User Identity
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel

from backend.auth import (
    SAMPLE_USERS,
    verify_password,
    create_access_token,
    get_current_user,
    User,
    UserPublic
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest):
    user = SAMPLE_USERS.get(req.username)
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    token = create_access_token(data={
        "sub": user.username,
        "role": user.role,
        "clearance": user.clearance_level
    })

    return LoginResponse(
        access_token=token,
        user=UserPublic(
            id=user.id,
            username=user.username,
            full_name=user.full_name,
            role=user.role,
            badge_number=user.badge_number,
            clearance_level=user.clearance_level,
            state=user.state,
            district=user.district
        )
    )


@router.get("/me", response_model=UserPublic)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserPublic(
        id=current_user.id,
        username=current_user.username,
        full_name=current_user.full_name,
        role=current_user.role,
        badge_number=current_user.badge_number,
        clearance_level=current_user.clearance_level,
        state=current_user.state,
        district=current_user.district
    )
