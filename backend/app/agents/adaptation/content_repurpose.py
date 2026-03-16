"""Agent 28 — Content Repurpose Agent.

Transforms content across formats — blog → social, video script → ad copy, etc.
"""

from google.adk.agents import LlmAgent
from app.prompts import CONTENT_REPURPOSE
from app.core.config import settings


def create_content_repurpose_agent() -> LlmAgent:
    """Create the Content Repurpose Agent (Agent 28)."""
    return LlmAgent(
        name="content_repurpose",
        model=settings.model_text,
        instruction=CONTENT_REPURPOSE,
        description="Transforms content across formats while maintaining brand consistency and message integrity.",
        output_key="repurposed_content",
    )
