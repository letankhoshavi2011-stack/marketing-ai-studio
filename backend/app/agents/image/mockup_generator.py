from google.adk.agents import LlmAgent
from app.tools.media_tools import generate_marketing_image
from app.prompts import MOCKUP_GENERATOR
from app.core.config import settings

def create_mockup_generator_agent() -> LlmAgent:
    """Create the Mockup Generator Agent (Agent 18)."""
    return LlmAgent(
        name="mockup_generator",
        model=settings.model_text,
        instruction=MOCKUP_GENERATOR,
        description="Creates photorealistic product mockups with brand designs on real-world items.",
        tools=[generate_marketing_image],
        output_key="mockups",
    )
