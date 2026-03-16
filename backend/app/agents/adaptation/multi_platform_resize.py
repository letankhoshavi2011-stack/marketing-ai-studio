from google.adk.agents import LlmAgent
from app.tools.media_tools import generate_marketing_image
from app.prompts import MULTI_PLATFORM_RESIZE
from app.core.config import settings

def create_multi_platform_resize_agent() -> LlmAgent:
    """Create the Multi-Platform Resize Agent (Agent 27)."""
    return LlmAgent(
        name="multi_platform_resize",
        model=settings.model_text,
        instruction=MULTI_PLATFORM_RESIZE,
        description="AI-aware multi-platform resize that re-composes images for each platform.",
        tools=[generate_marketing_image],
        output_key="resized_assets",
    )
