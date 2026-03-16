"""Video generation service using Google Veo via google-genai SDK."""

import logging
import uuid
import os
import asyncio
import time
from typing import List, Optional, Literal

from google import genai
from google.genai import types
from app.core.config import settings
from app.models.base import GeneratedAsset
from app.providers.gemini import _get_client
from app.providers.gcs import upload_bytes

logger = logging.getLogger(__name__)

ASSETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "assets", "generated", "video")
os.makedirs(ASSETS_DIR, exist_ok=True)


class VideoGeneratorService:
    """Service to generate videos via Google Veo (env-configurable model)."""

    @staticmethod
    async def generate_video(
        prompt: str,
        aspect_ratio: Literal["16:9", "9:16", "1:1"] = "16:9",
        duration_seconds: int = 8,
        style: Optional[str] = None,
        agent_name: str = "video_agent",
        workspace_id: str = "global",
        campaign_id: str = "default"
    ) -> List[GeneratedAsset]:
        """Generates a video clip using Veo via the google-genai SDK."""
        client = _get_client()

        assets = []
        try:
            enhanced_prompt = prompt
            if style:
                enhanced_prompt = f"{prompt}, {style} style"

            # --- LOG FULL REQUEST ---
            logger.info("\n" + "="*50 + "\n--- FULL VIDEO PROMPT ---\n" + enhanced_prompt + "\n" + "="*50)

            import time
            start_time = time.perf_counter()

            # Start video generation (async operation)
            operation = client.models.generate_videos(
                model=settings.model_video_gen,
                prompt=enhanced_prompt,
                config=types.GenerateVideosConfig(
                    aspect_ratio=aspect_ratio,
                    number_of_videos=1,
                ),
            )
            # Poll for completion (Veo is an async operation)
            max_wait = 300  # 5 minutes max
            poll_interval = 10  # seconds
            elapsed = 0

            while not operation.done and elapsed < max_wait:
                logger.info(f"[{agent_name}] Video generation in progress... ({elapsed}s elapsed)")
                await asyncio.sleep(poll_interval)
                operation = client.operations.get(operation)
                elapsed += poll_interval

            if not operation.done:
                logger.warning(f"[{agent_name}] Video generation timed out after {max_wait}s")
                return []

            # Process completed video
            if operation.response and operation.response.generated_videos:
                for vid in operation.response.generated_videos:
                    asset_id = str(uuid.uuid4())
                    filename = f"{asset_id}.mp4"
                    filepath = os.path.join(ASSETS_DIR, filename)

                    if hasattr(vid, "video") and vid.video:
                        video_bytes = None
                        if getattr(vid.video, 'video_bytes', None) is not None:
                            video_bytes = vid.video.video_bytes
                        elif getattr(vid.video, '_video_bytes', None) is not None:
                            video_bytes = vid.video._video_bytes
                        elif hasattr(vid.video, 'dict') and vid.video.dict().get('video_bytes'):
                            video_bytes = vid.video.dict().get('video_bytes')
                        
                        filepath = os.path.join(ASSETS_DIR, filename)
                        if video_bytes:
                            gcs_result = await upload_bytes(
                                data=video_bytes,
                                workspace_uuid=workspace_id,
                                campaign_id=campaign_id,
                                asset_type="video",
                                filename=filename,
                                content_type="video/mp4"
                            )
                            
                            asset_url = gcs_result["gcs_url"]
                            gcs_path = gcs_result["gcs_path"]

                            assets.append(GeneratedAsset(
                                id=asset_id,
                                asset_type="video",
                                gcs_url=asset_url,
                                gcs_path=gcs_path,
                                thumbnail_url=asset_url,
                                prompt_used=enhanced_prompt,
                                model_used=settings.model_video_gen,
                                mime_type="video/mp4",
                            ))
                            logger.info(f"[{agent_name}] Video saved to GCS from inline bytes: {gcs_path}")

                        elif getattr(vid.video, "uri", None):
                            uri = vid.video.uri
                            api_key = settings.gemini_api_key
                            logger.info(f"[{agent_name}] Inline bytes missing. Downloading video from URI: {uri}")
                            
                            import httpx
                            async with httpx.AsyncClient(follow_redirects=True) as http_client:
                                try:
                                    headers = {"x-goog-api-key": api_key}
                                    response = await http_client.get(uri, headers=headers)
                                    response.raise_for_status()
                                    
                                    gcs_result = await upload_bytes(
                                        data=response.content,
                                        workspace_uuid=workspace_id,
                                        campaign_id=campaign_id,
                                        asset_type="video",
                                        filename=filename,
                                        content_type="video/mp4"
                                    )
                                    
                                    asset_url = gcs_result["gcs_url"]
                                    gcs_path = gcs_result["gcs_path"]

                                    assets.append(GeneratedAsset(
                                        id=asset_id,
                                        asset_type="video",
                                        gcs_url=asset_url,
                                        gcs_path=gcs_path,
                                        thumbnail_url=asset_url,
                                        prompt_used=enhanced_prompt,
                                        model_used=settings.model_video_gen,
                                        mime_type="video/mp4",
                                    ))
                                    logger.info(f"[{agent_name}] Video successfully downloaded and saved to GCS: {gcs_path}")
                                except Exception as download_err:
                                    logger.error(f"[{agent_name}] Failed to download video from {uri}: {download_err}")
                        else:
                            logger.warning(f"[{agent_name}] Video object has no bytes and no URI.")
                    else:
                        logger.warning(f"[{agent_name}] No video data in response item")
            if assets:
                # --- LOG FULL RESPONSE ---
                asset_urls = "\n".join([f"- {a.gcs_url}" for a in assets])
                logger.info("\n" + "="*50 + "\n--- FULL VIDEO RESPONSE (ASSETS) ---\n" + asset_urls + "\n" + "="*50)

                # Log to analytics
                from app.services.analytics import analytics_service
                from app.core.context_vars import user_id_ctx
                
                latency_ms = (time.perf_counter() - start_time) * 1000
                await analytics_service.log_usage(
                    user_id=user_id_ctx.get() or "system",
                    workspace_id=workspace_id,
                    campaign_id=campaign_id,
                    model_name=settings.model_video_gen,
                    tokens_input=0,
                    tokens_output=5000 * len(assets), # 5000 units per video (placeholder pricing)
                    agent_name=agent_name,
                    request_type="video_gen",
                    prompt=enhanced_prompt,
                    response=asset_urls,
                    latency_ms=latency_ms
                )
            else:
                logger.warning(f"[{agent_name}] No videos returned from Veo")

            return assets

        except Exception as e:
            logger.error(f"[{agent_name}] Video generation failed: {e}", exc_info=True)
            return []
