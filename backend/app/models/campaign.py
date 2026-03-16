"""Campaign document model with embedded BrandDNA."""

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


class CampaignCreate(BaseModel):
    """Incoming campaign creation payload."""
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(default="", max_length=500)


class CampaignUpdate(BaseModel):
    """Campaign update — all optional."""
    name: str | None = None
    description: str | None = None
    status: str | None = None


class CampaignInDB(BaseModel):
    """Full campaign document in MongoDB."""
    id: str | None = Field(None, alias="_id")
    workspace_id: str
    user_id: str
    name: str
    description: str = ""
    status: str = "active"  # active | paused | completed | archived
    current_version: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {"populate_by_name": True}


class CampaignResponse(BaseModel):
    """Campaign returned to the frontend."""
    id: str
    workspace_id: str
    name: str
    description: str = ""
    status: str = "active"
    current_version: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
