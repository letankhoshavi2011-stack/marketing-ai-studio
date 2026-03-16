"""Nano Banana / Gemini image generation provider.

Uses Gemini 3.0 Flash for standard image gen and Gemini 3 Pro for high-quality.
Generates images via the Gemini API with image generation capabilities.
"""

import base64
import logging
import uuid
from typing import Any

from google import genai
from google.genai import types

from app.core.config import settings

logger = logging.getLogger(__name__)

import os

# Model tiers - configurable via env variables
FLASH_IMAGE_MODEL = os.environ.get("MODEL_IMAGE_GEN") or "gemini-2.0-flash-preview-image-generation"
PRO_IMAGE_MODEL = os.environ.get("MODEL_IMAGE_GEN") or "gemini-2.0-flash-preview-image-generation"

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


async def generate_image(
    prompt: str,
    model: str | None = None,
    num_images: int = 1,
    aspect_ratio: str = "1:1",
    style: str | None = None,
) -> list[dict[str, Any]]:
    """Generate image(s) from a text prompt.

    Returns list of {"image_bytes": bytes, "mime_type": str, "prompt": str}
    """
    client = _get_client()
    model = model or FLASH_IMAGE_MODEL

    full_prompt = prompt
    if style:
        full_prompt = f"{prompt}. Style: {style}"

    results = []
    for _ in range(num_images):
        try:
            response = client.models.generate_content(
                model=model,
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE", "TEXT"],
                ),
            )

            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    results.append({
                        "image_bytes": part.inline_data.data,
                        "mime_type": part.inline_data.mime_type or "image/png",
                        "prompt": full_prompt,
                    })
                    break
        except Exception as e:
            logger.error("Image generation failed: %s", e)
            continue

    logger.info("Generated %d/%d images with %s", len(results), num_images, model)
    return results


async def edit_image(
    image_data: bytes,
    edit_prompt: str,
    model: str | None = None,
) -> dict[str, Any] | None:
    """Edit an existing image based on a text prompt.

    Returns {"image_bytes": bytes, "mime_type": str, "prompt": str} or None
    """
    client = _get_client()
    model = model or FLASH_IMAGE_MODEL

    try:
        response = client.models.generate_content(
            model=model,
            contents=[
                types.Part.from_bytes(data=image_data, mime_type="image/png"),
                edit_prompt,
            ],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )

        for part in response.candidates[0].content.parts:
            if part.inline_data:
                return {
                    "image_bytes": part.inline_data.data,
                    "mime_type": part.inline_data.mime_type or "image/png",
                    "prompt": edit_prompt,
                }
    except Exception as e:
        logger.error("Image edit failed: %s", e)

    return None


async def generate_logo(
    brand_name: str,
    style: str = "modern",
    colors: list[str] | None = None,
    num_variations: int = 4,
) -> list[dict[str, Any]]:
    """Generate logo variations for a brand."""
    color_str = ", ".join(colors) if colors else "professional colors"
    prompt = (
        f"Create a professional {style} logo design for the brand '{brand_name}'. "
        f"Use colors: {color_str}. "
        f"Clean, scalable vector-style logo on a solid white background. "
        f"No text besides the brand name. High contrast, modern typography."
    )
    return await generate_image(prompt, num_images=num_variations)
