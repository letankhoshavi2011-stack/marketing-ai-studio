"""Agent log document model — per-agent execution tracking + cost."""

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


class AgentLogInDB(BaseModel):
    """One log entry per agent invocation."""
    id: str | None = Field(None, alias="_id")
    session_id: str
    campaign_id: str
    workspace_id: str
    agent_name: str
    model_used: str = ""
    intent: str = ""
    input_summary: str = ""
    output_summary: str = ""
    tokens_input: int = 0
    tokens_output: int = 0
    cost_usd: float = 0.0
    duration_ms: int = 0
    status: str = "success"  # success | error | skipped
    error_message: str = ""
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {"populate_by_name": True}
