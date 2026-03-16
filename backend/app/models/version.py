"""Version document model — tracks asset version history."""

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


class VersionInDB(BaseModel):
    """Version snapshot for an asset."""
    id: str | None = Field(None, alias="_id")
    asset_id: str
    campaign_id: str
    workspace_id: str
    version: int
    changes: dict[str, Any] = Field(default_factory=dict)  # What changed
    gcs_path: str = ""
    content: str | None = None
    feedback: str = ""
    created_by: str = ""  # agent_name or "user"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {"populate_by_name": True}
