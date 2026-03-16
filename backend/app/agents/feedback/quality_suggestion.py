from google.adk.agents import LlmAgent
from app.tools.feedback_tools import score_asset_quality
from app.prompts import QUALITY_SUGGESTION
from app.core.config import settings

def create_quality_suggestion_agent() -> LlmAgent:
    """Create the Quality & Suggestion Agent (Agent 30)."""
    return LlmAgent(
        name="quality_suggestion",
        model=settings.model_text,
        instruction=QUALITY_SUGGESTION,
        description="Proactively scores quality and suggests improvements users didn't ask for but should consider.",
        tools=[score_asset_quality],
        output_key="quality_report",
    )
