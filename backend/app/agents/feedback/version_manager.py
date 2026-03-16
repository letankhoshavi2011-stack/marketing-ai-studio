from google.adk.agents import LlmAgent

from app.config import settings
from app.tools.feedback_tools import get_version_history


def create_version_manager_agent() -> LlmAgent:
    """Creates the version manager agent that tracks context versions."""
    return LlmAgent(
        name="VersionManager",
        model=settings.gemini_model,
        description="Manages and presents context version history to help users track changes.",
        instruction="""You are a version history specialist for the marketing platform.

Use the get_version_history tool to retrieve the campaign's history.

When presenting version history:
1. Show what changed in each version (the delta)
2. Highlight the most significant changes
3. Allow the user to understand the evolution of their brand assets
4. If the user wants to revert, identify the target version

Present the history in a clear, chronological format that shows
the progression of the marketing strategy.""",
        tools=[get_version_history],
        output_key="version_info",
    )
