"""Request and response schemas for workspace endpoints."""

from datetime import datetime
from pydantic import BaseModel, Field


class WorkspaceCreate(BaseModel):
    """POST /workspaces request body."""
    name: str = Field(..., min_length=1, max_length=255)
    description: str = ""


class WorkspaceUpdate(BaseModel):
    """PUT /workspaces/{uuid} request body."""
    name: str | None = None
    description: str | None = None
    default_model_tier: str | None = None
    auto_brand_guardian: bool | None = None


class WorkspaceResponse(BaseModel):
    """Public workspace representation."""
    uuid: str
    name: str
    description: str
    settings: dict
    created_at: str
    updated_at: str
    campaign_count: int = 0
