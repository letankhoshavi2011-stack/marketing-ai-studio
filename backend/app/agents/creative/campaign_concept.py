from google.adk.agents import LlmAgent
from app.tools.creative_tools import generate_campaign_concepts
from app.prompts import CAMPAIGN_CONCEPT
from app.core.config import settings

def create_campaign_concept_agent() -> LlmAgent:
    """Create the Campaign Concept Agent (Agent 12)."""
    return LlmAgent(
        name="campaign_concept",
        model=settings.model_text,
        instruction=CAMPAIGN_CONCEPT,
        description="Generates creative campaign concepts with A2UI card selection interface.",
        tools=[generate_campaign_concepts],
        output_key="campaign_concepts",
    )
