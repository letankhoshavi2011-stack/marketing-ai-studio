"""Request and response schemas for campaign endpoints."""

from pydantic import BaseModel, Field


class CampaignCreate(BaseModel):
    """POST /workspaces/{wid}/campaigns request body."""
    name: str = Field(..., min_length=1, max_length=255)


class CampaignUpdate(BaseModel):
    """PUT request body."""
    name: str | None = None
    status: str | None = None  # "active" | "paused" | "completed" | "archived"


class BrandDNAUpdate(BaseModel):
    """PUT request body for updating brand DNA."""
    brand_name: str | None = None
    tagline: str | None = None
    colors: list[str] | None = None
    fonts: list[str] | None = None
    tone_of_voice: str | None = None
    visual_style: str | None = None
    mood: str | None = None
    target_audience: str | None = None
    industry: str | None = None
    source_url: str | None = None
    brand_values: list[str] | None = None
    keywords: list[str] | None = None


class CampaignResponse(BaseModel):
    """Public campaign representation."""
    uuid: str
    workspace_id: str
    name: str
    status: str
    brand_dna: dict
    current_version: int
    created_at: str
    updated_at: str
