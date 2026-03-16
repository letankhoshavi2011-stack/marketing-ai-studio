from google.adk.agents import LlmAgent
from app.tools.media_tools import create_video_from_image
from app.prompts import IMAGE_TO_VIDEO
from app.core.config import settings

def create_image_to_video_agent() -> LlmAgent:
    """Create the Image-to-Video Agent (Agent 20)."""
    return LlmAgent(
        name="image_to_video",
        model=settings.model_text,
        instruction=IMAGE_TO_VIDEO,
        description="Animates static marketing images into compelling videos.",
        tools=[create_video_from_image],
        output_key="animated_video",
    )
