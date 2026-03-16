"""Asset document model — images, videos, logos, copy stored with GCS paths."""

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


class AssetCreate(BaseModel):
    """Incoming asset creation payload."""
    type: str  # image, video, logo, mockup, ad_creative, text, email, social_post
    content: str | None = None  # For text-based assets
    prompt_used: str = ""
    model_used: str = ""
    generation_params: dict[str, Any] = Field(default_factory=dict)


class AssetInDB(BaseModel):
    """Full asset document in MongoDB."""
    id: str | None = Field(None, alias="_id")
    workspace_id: str
    campaign_id: str
    user_id: str
    type: str  # image, video, logo, mockup, ad_creative, text, email, social_post
    version: int = 1
    parent_version: int | None = None
    agent_name: str = ""
    gcs_path: str = ""
    gcs_url: str = ""  # Signed URL for frontend access
    content: str | None = None  # For text-based assets
    prompt_used: str = ""
    model_used: str = ""
    generation_params: dict[str, Any] = Field(default_factory=dict)
    feedback_history: list[dict[str, Any]] = Field(default_factory=list)
    is_favorite: bool = False
    is_final: bool = False
    cost_usd: float = 0.0
    brand_guardian_score: int | None = None
    brand_guardian_issues: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {"populate_by_name": True}


class AssetResponse(BaseModel):
    """Asset returned to the frontend."""
    id: str
    workspace_id: str
    campaign_id: str
    type: str
    version: int = 1
    agent_name: str = ""
    gcs_url: str = ""
    content: str | None = None
    prompt_used: str = ""
    model_used: str = ""
    is_favorite: bool = False
    is_final: bool = False
    cost_usd: float = 0.0
    brand_guardian_score: int | None = None
    brand_guardian_issues: list[str] = Field(default_factory=list)
    created_at: datetime
