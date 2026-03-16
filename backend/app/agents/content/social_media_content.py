from google.adk.agents import LlmAgent
from app.tools.creative_tools import write_social_content
from app.prompts import SOCIAL_MEDIA_CONTENT
from app.core.config import settings

def create_social_media_content_agent() -> LlmAgent:
    """Create the Social Media Content Agent (Agent 23)."""
    return LlmAgent(
        name="social_media_content",
        model=settings.model_text,
        instruction=SOCIAL_MEDIA_CONTENT,
        description="Creates social media posts, content calendars, and platform strategies.",
        tools=[write_social_content],
        output_key="social_content",
    )
