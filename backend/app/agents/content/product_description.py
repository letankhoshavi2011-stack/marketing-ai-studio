from google.adk.agents import LlmAgent
from app.prompts import PRODUCT_DESCRIPTION
from app.core.config import settings

def create_product_description_agent() -> LlmAgent:
    """Create the Product Description Agent (Agent 25)."""
    return LlmAgent(
        name="product_description",
        model=settings.model_text,
        instruction=PRODUCT_DESCRIPTION,
        description="Creates SEO-optimized, conversion-focused product descriptions.",
        output_key="product_descriptions",
    )
