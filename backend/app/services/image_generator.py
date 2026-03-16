"""Image generation service using Gemini image generation model."""

import logging
import uuid
import os
import base64
from typing import List, Optional, Literal

from google import genai
from google.genai import types
from app.models.base import GeneratedAsset
from app.providers.gemini import _get_client
from app.providers.gcs import upload_bytes
from app.services.analytics import analytics_service
from app.core.context_vars import user_id_ctx, workspace_id_ctx, campaign_id_ctx

logger = logging.getLogger(__name__)

# Ensure the local assets directory exists
ASSETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "assets", "generated")
os.makedirs(ASSETS_DIR, exist_ok=True)

# The correct model for image generation
_DEFAULT_IMAGE_MODEL = "gemini-2.0-flash-preview-image-generation"


def _get_image_model() -> str:
    """Resolve image model at call time (not import time)."""
    from app.core.config import settings
    model = settings.model_image_gen
    logger.debug("Resolved image model: %s", model)
    return model


class ImageGeneratorService:
    """Service to generate images via Gemini image generation model."""

    @staticmethod
    async def generate_images(
        prompt: str,
        negative_prompt: Optional[str] = None,
        aspect_ratio: Literal["1:1", "4:3", "3:4", "16:9", "9:16"] = "1:1",
        count: int = 1,
        style: Optional[str] = None,
        agent_name: str = "visual_agent",
        workspace_id: str = "global",
        campaign_id: str = "default"
    ) -> List[GeneratedAsset]:
        """Generates images using the Gemini image generation model."""
        client = _get_client()

        assets = []
        try:
            # Build enhanced prompt
            enhanced_prompt = prompt
            if style:
                enhanced_prompt = f"{prompt}, {style} style"

            # Resolve model at call time — NOT at import time
            image_model = _get_image_model()

            # --- LOG FULL REQUEST ---
            logger.info("\n" + "="*50 + "\n--- FULL IMAGE PROMPT ---\n" + enhanced_prompt + "\n" + "="*50)

            for i in range(min(count, 4)):
                response = client.models.generate_content(
                    model=image_model,
                    contents=f"Generate an image: {enhanced_prompt}",
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE", "TEXT"],
                    ),
                )

                # Extract image from response parts
                if response and response.candidates:
                    for candidate in response.candidates:
                        if candidate.content and candidate.content.parts:
                            for part in candidate.content.parts:
                                if part.inline_data and part.inline_data.mime_type and part.inline_data.mime_type.startswith("image/"):
                                    asset_id = str(uuid.uuid4())
                                    ext = "png" if "png" in part.inline_data.mime_type else "jpg"
                                    filename = f"{asset_id}.{ext}"
                                    
                                    # Upload directly to GCS (Local fallback built-in to upload_bytes)
                                    gcs_result = await upload_bytes(
                                        data=part.inline_data.data,
                                        workspace_uuid=workspace_id,
                                        campaign_id=campaign_id,
                                        asset_type="image",
                                        filename=filename,
                                        content_type=part.inline_data.mime_type or f"image/{ext}"
                                    )

                                    asset_url = gcs_result["gcs_url"]
                                    gcs_path = gcs_result["gcs_path"]

                                    assets.append(GeneratedAsset(
                                        id=asset_id,
                                        asset_type="image",
                                        gcs_url=asset_url,
                                        gcs_path=gcs_path,
                                        thumbnail_url=asset_url,
                                        prompt_used=enhanced_prompt,
                                        model_used=image_model,
                                        mime_type=part.inline_data.mime_type,
                                    ))
                                    logger.info(f"[{agent_name}] Image saved to GCS: {gcs_path}")

            if assets:
                # --- LOG FULL RESPONSE ---
                asset_urls = "\n".join([f"- {a.gcs_url}" for a in assets])
                logger.info("\n" + "="*50 + "\n--- FULL IMAGE RESPONSE (ASSETS) ---\n" + asset_urls + "\n" + "="*50)

                # Log to analytics (one log for the whole batch)
                await analytics_service.log_usage(
                    user_id=user_id_ctx.get() or "system",
                    workspace_id=workspace_id,
                    campaign_id=campaign_id,
                    model_name=image_model,
                    tokens_input=0,
                    tokens_output=1000 * len(assets), # 1000 units per image
                    agent_name=agent_name,
                    request_type="image_gen",
                    prompt=enhanced_prompt,
                    response=asset_urls
                )
            else:
                logger.warning(f"[{agent_name}] No images returned from model")

            return assets

        except Exception as e:
            logger.error(f"[{agent_name}] Image generation failed: {e}", exc_info=True)
            return []
