from typing import Any

from pydantic import BaseModel, Field


class IntentResult(BaseModel):
    intent: str  # brand_naming, logo_design, content_creation, image_generation, video_generation, feedback, general_chat, full_branding
    confidence: float = 1.0
    required_agents: list[str] = Field(default_factory=list)
    missing_requirements: list[str] = Field(default_factory=list)


class AgentInput(BaseModel):
    task: str
    context: dict[str, Any] = Field(default_factory=dict)
    parameters: dict[str, Any] = Field(default_factory=dict)


class AgentOutput(BaseModel):
    agent_name: str
    status: str  # "success", "error", "needs_input"
    result: dict[str, Any] = Field(default_factory=dict)
    message: str = ""


class FeedbackRequest(BaseModel):
    feedback_text: str
    campaign_id: str
    target_fields: list[str] = Field(default_factory=list)
    # e.g., ["logo_concepts", "brand_names"] to hint which areas the feedback targets
