"""Brand-related ADK tool functions — name gen, tagline gen, DNA extraction."""

import json
import logging
from typing import Any

from app.providers.gemini import generate_text

from app.prompts import PromptLoader

logger = logging.getLogger(__name__)


async def generate_brand_names(
    industry: str,
    values: str = "",
    tone: str = "",
    keywords: str = "",
    count: int = 15,
) -> str:
    """Generate brand name options with rationale and domain suggestions."""
    prompt = PromptLoader.get_tool_prompt(
        "brand_tools",
        "generate_brand_names",
        count=count,
        industry=industry,
        values=values or "not specified",
        tone=tone or "modern and professional",
        keywords=keywords or "none specified",
    )
    result = await generate_text(
        prompt, model="gemini-3.1-pro-preview", response_mime_type="application/json"
    )
    return result["text"]


async def generate_taglines(
    brand_name: str,
    industry: str,
    tone: str = "",
    values: str = "",
    count: int = 10,
    tagline_type: str = "brand",
) -> str:
    """Generate tagline/slogan options ranked by memorability."""
    prompt = PromptLoader.get_tool_prompt(
        "brand_tools",
        "generate_taglines",
        count=count,
        tagline_type=tagline_type,
        brand_name=brand_name,
        industry=industry,
        tone=tone or "professional",
        values=values or "quality, innovation",
    )
    result = await generate_text(
        prompt, model="gemini-3.1-pro-preview", response_mime_type="application/json"
    )
    return result["text"]


async def extract_brand_dna(
    brand_name: str,
    industry: str,
    description: str = "",
    values: str = "",
    target_audience: str = "",
    url_analysis: str = "",
) -> str:
    """Create a comprehensive BrandDNA profile."""
    prompt = PromptLoader.get_tool_prompt(
        "brand_tools",
        "extract_brand_dna",
        brand_name=brand_name,
        industry=industry,
        description=description or "not provided",
        values=values or "not provided",
        target_audience=target_audience or "not provided",
        url_analysis=url_analysis or "not available",
    )
    result = await generate_text(
        prompt, model="gemini-3.1-pro-preview", response_mime_type="application/json"
    )
    return result["text"]


async def analyze_brand_consistency(
    brand_dna: str,
    asset_description: str,
    asset_type: str = "image",
) -> str:
    """Check asset consistency against brand DNA."""
    prompt = PromptLoader.get_tool_prompt(
        "brand_tools",
        "analyze_brand_consistency",
        asset_type=asset_type,
        brand_dna=brand_dna,
        asset_description=asset_description,
    )
    result = await generate_text(
        prompt, model="gemini-3.1-pro-preview", response_mime_type="application/json"
    )
    return result["text"]
