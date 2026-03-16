from google.adk.agents import LlmAgent
from app.core.config import settings
from app.prompts import VISUAL_STYLE

def create_visual_style_agent() -> LlmAgent:
    """Creates the visual style director agent."""
    return LlmAgent(
        name="VisualStyleDirector",
        model=settings.model_text,
        description="Establishes the overall visual direction and creative style guide for the brand.",
        instruction=VISUAL_STYLE,
        output_key="visual_style_output",
    )
