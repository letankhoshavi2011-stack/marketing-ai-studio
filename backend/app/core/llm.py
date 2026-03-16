"""Unified LLM router — uses google-genai SDK directly (no LiteLLM).
Provides a single entry point for text, image, and video generation.
"""

import logging
import os
from typing import Any, Dict, List, Optional

from google.genai import types
from app.providers.gemini import _get_client
from app.core.config import settings
from app.services.analytics import analytics_service
from app.core.context_vars import user_id_ctx, workspace_id_ctx, agent_name_ctx

logger = logging.getLogger(__name__)


class LLMRouter:
    """Unified router for AI text, image, and video generation."""

    def _get_model_for_tier(self, tier: str) -> str:
        return settings.model_text

    # ── Text Generation ─────────────────────────────────────────
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model_tier: str = "standard",
        temperature: float = 0.7,
        max_tokens: int = 16384,
        response_format: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Generate text using the requested model tier via google-genai."""
        model = self._get_model_for_tier(model_tier)
        client = _get_client()

        logger.info("Generating text via %s (Tier: %s, max_tokens: %d)", model, model_tier, max_tokens)

        config = types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
        )
        if system_prompt:
            config.system_instruction = system_prompt

        # If response_format requests JSON, set the mime type
        if response_format and response_format.get("type") == "json_object":
            config.response_mime_type = "application/json"

        import time
        start_time = time.perf_counter()
        
        # --- LOG FULL REQUEST ---
        logger.info("\n" + "="*50 + "\n--- FULL SYSTEM PROMPT ---\n" + (system_prompt or "None") + "\n" + "="*50)
        logger.info("\n" + "="*50 + "\n--- FULL USER PROMPT ---\n" + prompt + "\n" + "="*50)

        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=config,
            )
            latency_ms = (time.perf_counter() - start_time) * 1000
            content = response.text or ""
            
            # --- LOG FULL RESPONSE ---
            logger.info("\n" + "="*50 + "\n--- FULL LLM RESPONSE ---\n" + content + "\n" + "="*50)
            
            # Log usage
            user_id = user_id_ctx.get()
            workspace_id = workspace_id_ctx.get()
            logger.info("LOGGING_DEBUG: user_id=%s, workspace_id=%s, model=%s", user_id, workspace_id, model)
            
            # Log usage (Always attempt log, let analytics_service handle context recovery/warnings)
            await analytics_service.log_usage(
                user_id=user_id or "system",
                workspace_id=workspace_id,
                model_name=model,
                tokens_input=response.usage_metadata.prompt_token_count if response.usage_metadata else 0,
                tokens_output=response.usage_metadata.candidates_token_count if response.usage_metadata else 0,
                agent_name=agent_name_ctx.get() or "llm_router",
                prompt=prompt,
                response=content,
                latency_ms=latency_ms,
                request_type="text"
            )

            if content:
                logger.info("LLM response length: %d chars", len(content))
            else:
                logger.warning("LLM returned empty/None content")
            return content
        except Exception as e:
            logger.error("Text generation failed: %s", e, exc_info=True)
            raise

    # ── Image Generation ────────────────────────────────────────
    async def generate_image(
        self,
        prompt: str,
        count: int = 1,
        aspect_ratio: str = "1:1",
        style: Optional[str] = None,
        agent_name: str = "visual_agent",
    ) -> List:
        """Generate images via ImageGeneratorService (Imagen / Gemini).

        Returns a list of GeneratedAsset objects.
        """
        from app.services.image_generator import ImageGeneratorService

        logger.info("[%s] LLMRouter.generate_image → delegating to ImageGeneratorService", agent_name)
        return await ImageGeneratorService.generate_images(
            prompt=prompt,
            count=count,
            aspect_ratio=aspect_ratio,
            style=style,
            agent_name=agent_name,
            workspace_id=workspace_id_ctx.get() or "global",
            campaign_id="default" # Campaign ID context var not strictly implemented yet, safe default
        )

    # ── Video Generation ────────────────────────────────────────
    async def generate_video(
        self,
        prompt: str,
        aspect_ratio: str = "16:9",
        duration_seconds: int = 8,
        style: Optional[str] = None,
        agent_name: str = "video_agent",
    ) -> List:
        """Generate video via VideoGeneratorService (Google Veo).

        Returns a list of GeneratedAsset objects.
        """
        from app.services.video_generator import VideoGeneratorService

        logger.info("[%s] LLMRouter.generate_video → delegating to VideoGeneratorService", agent_name)
        return await VideoGeneratorService.generate_video(
            prompt=prompt,
            aspect_ratio=aspect_ratio,
            duration_seconds=duration_seconds,
            style=style,
            agent_name=agent_name,
        )


llm_router = LLMRouter()
