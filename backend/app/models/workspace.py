"""Workspace document model."""

import uuid
from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field
from .context import WorkspaceContext


class WorkspaceSettings(BaseModel):
    """Per-workspace settings."""
    default_model_tier: str = "standard"  # "standard" | "pro"
    gemini_api_key: str = ""


class WorkspaceCreate(BaseModel):
    """Incoming workspace creation payload."""
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(default="", max_length=500)
    settings: WorkspaceSettings = Field(default_factory=WorkspaceSettings)


class WorkspaceUpdate(BaseModel):
    """Workspace update payload — all fields optional."""
    name: str | None = None
    description: str | None = None
    settings: WorkspaceSettings | None = None
    core_context: WorkspaceContext | None = None


class WorkspaceInDB(BaseModel):
    """Full workspace document in MongoDB."""
    id: str | None = Field(None, alias="_id")
    uuid: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    description: str = ""
    settings: WorkspaceSettings = Field(default_factory=WorkspaceSettings)
    core_context: WorkspaceContext = Field(default_factory=WorkspaceContext)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {"populate_by_name": True}


class WorkspaceResponse(BaseModel):
    """Workspace returned to the frontend."""
    uuid: str
    name: str
    description: str = ""
    settings: WorkspaceSettings = Field(default_factory=WorkspaceSettings)
    core_context: WorkspaceContext = Field(default_factory=WorkspaceContext)
    created_at: datetime
    updated_at: datetime
