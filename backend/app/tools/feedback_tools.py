"""Feedback tools — parsing feedback, delta extraction, quality scoring."""

import logging
from typing import Any

from app.providers.gemini import generate_text

from app.prompts import PromptLoader

logger = logging.getLogger(__name__)


async def parse_feedback(
    feedback: str,
    current_context: str = "",
) -> str:
    """Parse natural language feedback into structured deltas."""
    prompt = PromptLoader.get_tool_prompt(
        "feedback_tools",
        "parse_feedback",
        feedback=feedback,
        current_context=current_context or "not available",
    )
    result = await generate_text(
        prompt, model="gemini-3.1-pro-preview", response_mime_type="application/json"
    )
    return result["text"]


async def score_asset_quality(
    asset_description: str,
    brand_dna: str = "",
    asset_type: str = "image",
) -> str:
    """Rate an asset's quality and suggest improvements."""
    prompt = PromptLoader.get_tool_prompt(
        "feedback_tools",
        "score_asset_quality",
        asset_type=asset_type,
        asset_description=asset_description,
        brand_dna=brand_dna or "not specified",
    )
    result = await generate_text(
        prompt, model="gemini-3.1-pro-preview", response_mime_type="application/json"
    )
    return result["text"]
