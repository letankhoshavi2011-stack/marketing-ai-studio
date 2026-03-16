"""Creative tools — campaign concepts, content writing, creative direction."""

import logging
from typing import Any

from app.providers.gemini import generate_text

from app.prompts import PromptLoader

logger = logging.getLogger(__name__)


async def generate_campaign_concepts(
    brand_name: str,
    industry: str,
    brand_dna: str = "",
    objective: str = "",
    count: int = 5,
) -> str:
    """Generate campaign concept ideas."""
    prompt = PromptLoader.get_tool_prompt(
        "creative_tools",
        "generate_campaign_concepts",
        count=count,
        brand_name=brand_name,
        industry=industry,
        brand_dna=brand_dna or "standard brand",
        objective=objective or "general brand awareness",
    )
    result = await generate_text(
        prompt, model="gemini-3.1-pro-preview", response_mime_type="application/json"
    )
    return result["text"]


async def generate_creative_direction(
    brand_name: str,
    brand_dna: str = "",
    campaign_type: str = "",
    target_audience: str = "",
) -> str:
    """Create a visual creative brief."""
    prompt = PromptLoader.get_tool_prompt(
        "creative_tools",
        "generate_creative_direction",
        brand_name=brand_name,
        brand_dna=brand_dna or "not specified",
        campaign_type=campaign_type or "general marketing",
        target_audience=target_audience or "general audience",
    )
    result = await generate_text(
        prompt, model="gemini-3.1-pro-preview", response_mime_type="application/json"
    )
    return result["text"]


async def write_ad_copy(
    brand_name: str,
    platform: str,
    product_description: str = "",
    brand_dna: str = "",
    count: int = 3,
    framework: str = "AIDA",
) -> str:
    """Generate platform-specific ad copy."""
    prompt = PromptLoader.get_tool_prompt(
        "creative_tools",
        "write_ad_copy",
        count=count,
        platform=platform,
        brand_name=brand_name,
        framework=framework,
        product_description=product_description or "general brand",
        brand_dna=brand_dna or "professional brand",
    )
    result = await generate_text(
        prompt, model="gemini-3.1-pro-preview", response_mime_type="application/json"
    )
    return result["text"]


async def write_social_content(
    brand_name: str,
    platform: str,
    topic: str = "",
    brand_dna: str = "",
    content_type: str = "post",
) -> str:
    """Generate social media content."""
    prompt = PromptLoader.get_tool_prompt(
        "creative_tools",
        "write_social_content",
        content_type=content_type,
        brand_name=brand_name,
        platform=platform,
        topic=topic or "brand showcase",
        brand_dna=brand_dna or "professional",
    )
    result = await generate_text(
        prompt, model="gemini-3.1-pro-preview", response_mime_type="application/json"
    )
    return result["text"]


async def write_email_campaign(
    brand_name: str,
    email_type: str = "promotional",
    product_description: str = "",
    brand_dna: str = "",
) -> str:
    """Generate a complete email campaign."""
    prompt = PromptLoader.get_tool_prompt(
        "creative_tools",
        "write_email_campaign",
        email_type=email_type,
        brand_name=brand_name,
        product_description=product_description or "general",
        brand_dna=brand_dna or "professional",
    )
    result = await generate_text(
        prompt, model="gemini-3.1-pro-preview", response_mime_type="application/json"
    )
    return result["text"]
