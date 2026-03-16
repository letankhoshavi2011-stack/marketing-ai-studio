"""User document model."""

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Incoming registration payload."""
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="Plaintext password (≥8 chars)")
    full_name: str = Field(..., min_length=1, description="Display name")


class UserInDB(BaseModel):
    """Full user document as stored in MongoDB."""
    id: str | None = Field(None, alias="_id", description="MongoDB ObjectId as string")
    email: str
    hashed_password: str
    full_name: str
    is_active: bool = True
    usage: dict[str, Any] = Field(default_factory=lambda: {
        "total_cost_usd": 0.0,
        "total_generations": 0,
        "total_tokens": 0,
    })
    preferences: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {"populate_by_name": True}


class UserResponse(BaseModel):
    """Public user info returned by API."""
    id: str
    email: str
    full_name: str
    is_active: bool = True
    usage: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
