"""Media tools — image gen, video gen, image editing via providers."""

import logging
from typing import Any

from app.providers import nano_banana, veo
from app.providers.gcs import upload_bytes

logger = logging.getLogger(__name__)


async def generate_marketing_image(
    prompt: str,
    workspace_uuid: str,
    campaign_id: str,
    style: str | None = None,
    num_images: int = 1,
    asset_type: str = "image",
) -> list[dict[str, Any]]:
    """Generate marketing image(s) and upload to GCS.

    Returns:
        List of {"gcs_path": str, "gcs_url": str, "prompt": str}
    """
    images = await nano_banana.generate_image(
        prompt=prompt, style=style, num_images=num_images
    )
    results = []
    for img in images:
        gcs_result = await upload_bytes(
            data=img["image_bytes"],
            workspace_uuid=workspace_uuid,
            campaign_id=campaign_id,
            asset_type=asset_type,
            content_type=img["mime_type"],
        )
        results.append({**gcs_result, "prompt": img["prompt"]})
    return results


async def generate_logo_images(
    brand_name: str,
    workspace_uuid: str,
    campaign_id: str,
    style: str = "modern",
    colors: list[str] | None = None,
    num_variations: int = 4,
) -> list[dict[str, Any]]:
    """Generate logo variations and upload to GCS."""
    images = await nano_banana.generate_logo(
        brand_name=brand_name,
        style=style,
        colors=colors,
        num_variations=num_variations,
    )
    results = []
    for img in images:
        gcs_result = await upload_bytes(
            data=img["image_bytes"],
            workspace_uuid=workspace_uuid,
            campaign_id=campaign_id,
            asset_type="logo",
            content_type=img["mime_type"],
        )
        results.append({**gcs_result, "prompt": img["prompt"]})
    return results


async def edit_marketing_image(
    image_data: bytes,
    edit_prompt: str,
    workspace_uuid: str,
    campaign_id: str,
) -> dict[str, Any] | None:
    """Edit an existing image and upload result to GCS."""
    result = await nano_banana.edit_image(image_data, edit_prompt)
    if not result:
        return None
    gcs_result = await upload_bytes(
        data=result["image_bytes"],
        workspace_uuid=workspace_uuid,
        campaign_id=campaign_id,
        asset_type="image",
        content_type=result["mime_type"],
    )
    return {**gcs_result, "prompt": result["prompt"]}


async def generate_marketing_video(
    prompt: str,
    workspace_uuid: str,
    campaign_id: str,
    duration_seconds: int = 8,
    aspect_ratio: str = "16:9",
) -> dict[str, Any] | None:
    """Generate a marketing video and upload to GCS."""
    result = await veo.generate_video(
        prompt=prompt,
        duration_seconds=duration_seconds,
        aspect_ratio=aspect_ratio,
    )
    if not result:
        return None
    gcs_result = await upload_bytes(
        data=result["video_bytes"],
        workspace_uuid=workspace_uuid,
        campaign_id=campaign_id,
        asset_type="video",
        content_type="video/mp4",
    )
    return {**gcs_result, "prompt": result["prompt"], "duration": result["duration"]}


async def create_video_from_image(
    image_data: bytes,
    prompt: str,
    workspace_uuid: str,
    campaign_id: str,
    aspect_ratio: str = "16:9",
) -> dict[str, Any] | None:
    """Animate a static image into a video and upload to GCS."""
    result = await veo.image_to_video(
        image_data=image_data,
        prompt=prompt,
        aspect_ratio=aspect_ratio,
    )
    if not result:
        return None
    gcs_result = await upload_bytes(
        data=result["video_bytes"],
        workspace_uuid=workspace_uuid,
        campaign_id=campaign_id,
        asset_type="video",
        content_type="video/mp4",
    )
    return {**gcs_result, "prompt": result["prompt"]}
