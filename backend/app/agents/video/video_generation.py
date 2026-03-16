from google.adk.agents import LlmAgent
from app.tools.media_tools import generate_marketing_video
from app.prompts import VIDEO_GENERATION
from app.core.config import settings

def create_video_generation_agent() -> LlmAgent:
    """Create the Video Generation Agent (Agent 19)."""
    return LlmAgent(
        name="video_generation",
        model=settings.model_text,
        instruction=VIDEO_GENERATION,
        description="Creates professional marketing videos from text prompts using Veo 3.1.",
        tools=[generate_marketing_video],
        output_key="generated_video",
    )
