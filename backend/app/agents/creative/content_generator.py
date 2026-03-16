from google.adk.agents import LlmAgent
from app.core.config import settings
from app.tools.creative_tools import generate_marketing_content
from app.prompts import CONTENT_GENERATOR

def create_content_generator_agent() -> LlmAgent:
    """Creates the content generator agent."""
    return LlmAgent(
        name="ContentGenerator",
        model=settings.model_text,
        description="Writes marketing copy, social posts, ad content, and other written materials.",
        instruction=CONTENT_GENERATOR,
        tools=[generate_marketing_content],
        output_key="content_output",
    )
