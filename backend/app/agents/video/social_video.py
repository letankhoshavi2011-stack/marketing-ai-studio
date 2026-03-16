from google.adk.agents import LlmAgent
from app.tools.media_tools import generate_marketing_video
from app.prompts import SOCIAL_VIDEO
from app.core.config import settings

def create_social_video_agent() -> LlmAgent:
    """Create the Social Video Agent (Agent 21)."""
    return LlmAgent(
        name="social_video",
        model=settings.model_text,
        instruction=SOCIAL_VIDEO,
        description="Creates platform-optimized short-form vertical videos for social media.",
        tools=[generate_marketing_video],
        output_key="social_video",
    )
