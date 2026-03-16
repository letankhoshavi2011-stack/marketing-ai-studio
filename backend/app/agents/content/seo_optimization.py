from google.adk.agents import LlmAgent
from app.prompts import SEO_OPTIMIZATION
from app.core.config import settings

def create_seo_optimization_agent() -> LlmAgent:
    """Create the SEO Optimization Agent (Agent 26)."""
    return LlmAgent(
        name="seo_optimization",
        model=settings.model_text,
        instruction=SEO_OPTIMIZATION,
        description="Analyzes and optimizes content for search engine performance with keyword research.",
        output_key="seo_analysis",
    )
