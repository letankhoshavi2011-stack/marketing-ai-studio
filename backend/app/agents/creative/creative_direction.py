from google.adk.agents import LlmAgent
from app.tools.creative_tools import generate_creative_direction
from app.prompts import CREATIVE_DIRECTION
from app.core.config import settings

def create_creative_direction_agent() -> LlmAgent:
    """Create the Creative Direction Agent (Agent 11)."""
    return LlmAgent(
        name="creative_direction",
        model=settings.model_text,
        instruction=CREATIVE_DIRECTION,
        description="Art Director that creates comprehensive visual creative briefs for all generation agents.",
        tools=[generate_creative_direction],
        output_key="creative_direction",
    )
