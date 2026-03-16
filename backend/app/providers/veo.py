"""Veo 3.1 video generation provider with async polling."""

import asyncio
import logging
from typing import Any

from google import genai
from google.genai import types

from app.core.config import settings

logger = logging.getLogger(__name__)

import os

# Model tiers - configurable via env variables
VEO_FAST = os.environ.get("MODEL_VIDEO_GEN") or "veo-2.0-generate-001"
VEO_STANDARD = os.environ.get("MODEL_VIDEO_GEN") or "veo-2.0-generate-001"

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


async def generate_video(
    prompt: str,
    model: str | None = None,
    duration_seconds: int = 8,
    aspect_ratio: str = "16:9",
    resolution: str = "720p",
) -> dict[str, Any] | None:
    """Generate a video from a text prompt using Veo.

    Uses async polling to wait for completion.

    Returns:
        {"video_bytes": bytes, "mime_type": str, "prompt": str, "duration": int} or None
    """
    client = _get_client()
    model = model or VEO_FAST

    try:
        # Start video generation
        operation = client.models.generate_videos(
            model=model,
            prompt=prompt,
            config=types.GenerateVideosConfig(
                aspect_ratio=aspect_ratio,
                number_of_videos=1,
            ),
        )

        # Poll for completion
        max_polls = 60  # 5 minutes max
        for _ in range(max_polls):
            if operation.done:
                break
            await asyncio.sleep(5)
            operation = client.operations.get(operation)

        if not operation.done:
            logger.error("Video generation timed out for prompt: %s", prompt[:100])
            return None

        # Extract video
        if operation.result and operation.result.generated_videos:
            video = operation.result.generated_videos[0]
            if video.video and video.video.uri:
                # Download the video bytes
                video_bytes = client.files.download(file=video.video)
                return {
                    "video_bytes": video_bytes,
                    "mime_type": "video/mp4",
                    "prompt": prompt,
                    "duration": duration_seconds,
                }

        logger.warning("No video generated for prompt: %s", prompt[:100])
        return None

    except Exception as e:
        logger.error("Video generation failed: %s", e)
        return None


async def image_to_video(
    image_data: bytes,
    prompt: str,
    model: str | None = None,
    aspect_ratio: str = "16:9",
) -> dict[str, Any] | None:
    """Animate a static image into a video.

    Returns same dict as generate_video or None.
    """
    client = _get_client()
    model = model or VEO_FAST

    try:
        from google.genai.types import Image, RawReferenceImage

        image = Image(image_bytes=image_data, mime_type="image/png")
        ref_image = RawReferenceImage(
            reference_image=image,
            reference_id=0,
        )

        operation = client.models.generate_videos(
            model=model,
            prompt=prompt,
            image=ref_image,
            config=types.GenerateVideosConfig(
                aspect_ratio=aspect_ratio,
                number_of_videos=1,
            ),
        )

        # Poll
        max_polls = 60
        for _ in range(max_polls):
            if operation.done:
                break
            await asyncio.sleep(5)
            operation = client.operations.get(operation)

        if not operation.done:
            return None

        if operation.result and operation.result.generated_videos:
            video = operation.result.generated_videos[0]
            if video.video and video.video.uri:
                video_bytes = client.files.download(file=video.video)
                return {
                    "video_bytes": video_bytes,
                    "mime_type": "video/mp4",
                    "prompt": prompt,
                    "duration": 8,
                }

        return None

    except Exception as e:
        logger.error("Image-to-video failed: %s", e)
        return None
