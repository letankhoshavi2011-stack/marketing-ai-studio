"""Auth router — register, login, refresh, me."""

import logging
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.auth.schemas import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse
from app.core.database import get_database
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import UserResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest):
    """Create a new user account and return tokens."""
    db = get_database()

    # Check if email already exists
    existing = await db.users.find_one({"email": body.email.lower().strip()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create user document
    now = datetime.now(timezone.utc)
    user_doc = {
        "email": body.email.lower().strip(),
        "hashed_password": hash_password(body.password),
        "full_name": body.full_name.strip(),
        "is_active": True,
        "usage": {"total_cost_usd": 0.0, "total_generations": 0, "total_tokens": 0},
        "preferences": {},
        "created_at": now,
        "updated_at": now,
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    logger.info("Registered user %s (%s)", user_id, body.email)

    # Generate tokens
    token_data = {"sub": user_id, "email": body.email.lower().strip()}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    """Authenticate with email + password and return tokens."""
    db = get_database()
    user = await db.users.find_one({"email": body.email.lower().strip()})

    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account deactivated",
        )

    user_id = str(user["_id"])
    token_data = {"sub": user_id, "email": user["email"]}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest):
    """Exchange a valid refresh token for a new token pair."""
    payload = decode_token(body.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    db = get_database()

    # Check if token is blacklisted
    blacklisted = await db.token_blacklist.find_one({"token": body.refresh_token})
    if blacklisted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
        )

    # Blacklist the old refresh token
    await db.token_blacklist.insert_one({
        "token": body.refresh_token,
        "expires_at": datetime.fromtimestamp(payload["exp"], tz=timezone.utc),
    })

    # Issue new pair
    token_data = {"sub": payload["sub"], "email": payload.get("email", "")}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.get("/me", response_model=UserResponse)
async def me(current_user: dict = Depends(get_current_user)):
    """Return the authenticated user's profile."""
    return UserResponse(
        id=current_user["_id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        is_active=current_user.get("is_active", True),
        usage=current_user.get("usage", {}),
        created_at=current_user["created_at"],
    )
