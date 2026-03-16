from google.adk.agents import LlmAgent

from app.config import settings
from app.tools.media_tools import adapt_media_for_platform


def create_media_adapter_agent() -> LlmAgent:
    """Creates the media adaptation agent for platform-specific formatting."""
    return LlmAgent(
        name="MediaAdapter",
        model=settings.gemini_model,
        description="Adapts generated media assets for specific platform requirements and dimensions.",
        instruction="""You are a media production specialist who optimizes assets for different platforms.

Generated Images: {images_output}
Generated Videos: {video_output}

Use the adapt_media_for_platform tool to prepare assets for each required platform.
Common adaptations needed:
- Instagram: 1080x1080 (post), 1080x1920 (story)
- Twitter: 1200x675 (post), 1500x500 (header)
- LinkedIn: 1200x627 (post), 1584x396 (banner)
- Facebook: 1200x630 (post), 820x312 (cover)
- YouTube: 1280x720 (thumbnail)

For each platform, specify any crop adjustments or layout changes needed
to ensure the key visual elements are preserved at each size.""",
        tools=[adapt_media_for_platform],
        output_key="adapted_media_output",
    )
