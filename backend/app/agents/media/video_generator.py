from google.adk.agents import LlmAgent

from app.config import settings
from app.tools.media_tools import generate_video_from_prompt


def create_video_generator_agent() -> LlmAgent:
    """Creates the video generation agent using Veo 2."""
    return LlmAgent(
        name="VideoGenerator",
        model=settings.gemini_model,
        description="Generates short marketing videos and motion content using Veo 2.",
        instruction="""You are a video content creator for marketing campaigns.

Brand Name: {selected_brand_name}
Visual Style: {visual_style_output}
Campaign Concept: {campaign_concept_output}

Use the generate_video_from_prompt tool to create marketing videos.
Generate video concepts for:
1. A brand introduction/teaser video (5-10 seconds)
2. A product/service showcase clip
3. A social media story/reel

For each video:
- Write a detailed scene description
- Specify the visual style and mood
- Define the camera movement and transitions
- Align with the brand's motion principles from the visual style guide

Keep videos short and impactful — optimized for social media consumption.""",
        tools=[generate_video_from_prompt],
        output_key="video_output",
    )
