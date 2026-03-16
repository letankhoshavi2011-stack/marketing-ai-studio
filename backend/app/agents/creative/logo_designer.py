from google.adk.agents import LlmAgent
from app.core.config import settings
from app.tools.creative_tools import generate_logo_description
from app.prompts import LOGO_DESIGNER

def create_logo_designer_agent() -> LlmAgent:
    """Creates the logo designer agent."""
    return LlmAgent(
        name="LogoDesigner",
        model=settings.model_text,
        description="Creates detailed logo design concepts with color palettes and typography.",
        instruction=LOGO_DESIGNER,
        tools=[generate_logo_description],
        output_key="logo_concepts_output",
    )
