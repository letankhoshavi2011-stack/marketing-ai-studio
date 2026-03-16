"""Analytics log document model — detailed token tracking per model and user."""

from datetime import datetime, timezone
from typing import Any
from pydantic import BaseModel, Field


class AnalyticsLog(BaseModel):
    """Detailed log for token usage analytics."""
    id: str | None = Field(None, alias="_id")
    user_id: str
    workspace_id: str | None = None
    campaign_id: str | None = None
    model_name: str
    tokens_input: int = 0
    tokens_output: int = 0
    cost_usd: float = 0.0
    agent_name: str = "unknown"
    request_type: str = "text"  # text | image | video
    latency_ms: float = 0.0
    prompt: str | None = None
    response: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {"populate_by_name": True}
