from datetime import datetime, timezone
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class WSMessageType(str, Enum):
    # Client -> Server
    START_CAMPAIGN = "start_campaign"
    USER_MESSAGE = "user_message"
    FEEDBACK = "feedback"

    # Server -> Client
    CAMPAIGN_CREATED = "campaign_created"
    AGENT_THINKING = "agent_thinking"
    AGENT_RESPONSE = "agent_response"
    ASSET_GENERATED = "asset_generated"
    CONTEXT_UPDATED = "context_updated"
    ERROR = "error"


class WSMessage(BaseModel):
    type: WSMessageType
    payload: dict[str, Any] = Field(default_factory=dict)
    session_id: str = ""
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserChatMessage(BaseModel):
    text: str
    campaign_id: str


class AgentResponse(BaseModel):
    agent_name: str
    text: str
    output_key: str = ""
    data: dict[str, Any] = Field(default_factory=dict)


class AgentThinking(BaseModel):
    agent_name: str
    status: str  # e.g., "Generating brand names..."


class AssetGenerated(BaseModel):
    asset_type: str  # "image", "video", "logo_concept"
    url: str = ""
    data: dict[str, Any] = Field(default_factory=dict)


class CampaignCreated(BaseModel):
    campaign_id: str
    campaign_name: str
    session_id: str


class ErrorMessage(BaseModel):
    error: str
    details: str = ""
