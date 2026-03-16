from google.adk.agents import LlmAgent
from app.tools.creative_tools import write_email_campaign
from app.prompts import EMAIL_CAMPAIGN
from app.core.config import settings

def create_email_campaign_agent() -> LlmAgent:
    """Create the Email Campaign Agent (Agent 24)."""
    return LlmAgent(
        name="email_campaign",
        model=settings.model_text,
        instruction=EMAIL_CAMPAIGN,
        description="Creates complete email campaign sequences with A/B testing and personalization.",
        tools=[write_email_campaign],
        output_key="email_campaign",
    )
