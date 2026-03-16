from google.adk.agents import LlmAgent

from app.config import settings
from app.tools.feedback_tools import suggest_improvements


def create_optimizer_agent() -> LlmAgent:
    """Creates the optimizer agent that suggests improvements."""
    return LlmAgent(
        name="Optimizer",
        model=settings.gemini_model,
        description="Analyzes current marketing outputs and suggests data-driven improvements.",
        instruction="""You are a marketing optimization specialist.

Current Context: {context_summary}
Brand Identity: {brand_identity_output}
Content: {content_output}

Use the suggest_improvements tool to analyze specific areas and provide recommendations.

Focus on:
1. Message clarity and impact
2. Visual consistency across assets
3. Platform optimization opportunities
4. Competitive differentiation
5. Audience alignment

Prioritize suggestions by potential impact and ease of implementation.
Present actionable recommendations the user can choose to apply.""",
        tools=[suggest_improvements],
        output_key="optimization_suggestions",
    )
