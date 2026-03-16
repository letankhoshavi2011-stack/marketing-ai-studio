"""Conversation & message document models."""

import uuid
from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


class UIHints(BaseModel):
    """A2UI dynamic form specification embedded in a message."""
    type: str = ""  # "dynamic_form", "image_carousel", "template_selector", etc.
    title: str = ""
    description: str = ""
    fields: list[dict[str, Any]] = Field(default_factory=list)
    options: list[dict[str, Any]] = Field(default_factory=list)
    submit_label: str = "Submit"


class MessageInDB(BaseModel):
    """A single message within a conversation."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str  # "user" | "assistant" | "system"
    content: str = ""
    agent_name: str | None = None
    ui_hints: UIHints | None = None
    assets: list[str] = Field(default_factory=list)  # Asset IDs
    attachments: list[str] = Field(default_factory=list)  # Base64 strings or URLs
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: dict[str, Any] = Field(default_factory=lambda: {
        "intent": "",
        "agents_used": [],
        "cost_usd": 0.0,
        "processing_time_ms": 0,
    })


class ConversationInDB(BaseModel):
    """Full conversation document in MongoDB."""
    id: str | None = Field(None, alias="_id")
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    campaign_id: str
    workspace_id: str
    user_id: str
    messages: list[MessageInDB] = Field(default_factory=list)
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {"populate_by_name": True}
