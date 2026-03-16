"""Audio generation service using Gemini TTS via google-genai SDK."""

import logging
import uuid
import os
import time
from typing import List, Optional

from google import genai
from google.genai import types
from app.core.config import settings
from app.models.base import GeneratedAsset
from app.providers.gemini import _get_client
from app.providers.gcs import upload_bytes

logger = logging.getLogger(__name__)

ASSETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "assets", "generated", "audio")
os.makedirs(ASSETS_DIR, exist_ok=True)


class AudioGeneratorService:
    """Service to generate audio from text using Gemini's native TTS."""

    @staticmethod
    async def generate_audio(
        script_text: str,
        voice_name: str = "Kore",
        agent_name: str = "podcast_script",
        workspace_id: str = "global",
        campaign_id: str = "default",
    ) -> List[GeneratedAsset]:
        """Generate audio from script text using Gemini's native audio output.

        Uses Gemini 2.5 Flash with response_modalities=["AUDIO"] to produce
        speech audio from the provided script text.
        """
        client = _get_client()
        assets: List[GeneratedAsset] = []

        try:
            logger.info(
                "\n" + "=" * 50 + "\n--- AUDIO GENERATION REQUEST ---\n"
                f"Script length: {len(script_text)} chars\n"
                f"Voice: {voice_name}\n" + "=" * 50
            )

            start_time = time.perf_counter()

            # Use Gemini with audio output modality
            response = client.models.generate_content(
                model="gemini-2.5-flash-preview-tts",
                contents=script_text,
                config=types.GenerateContentConfig(
                    response_modalities=["AUDIO"],
                    speech_config=types.SpeechConfig(
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name=voice_name
                            )
                        )
                    ),
                ),
            )

            # Extract audio data from response
            audio_data = None
            mime_type = "audio/wav"

            if response.candidates and response.candidates[0].content:
                for part in response.candidates[0].content.parts:
                    if part.inline_data and part.inline_data.data:
                        audio_data = part.inline_data.data
                        if part.inline_data.mime_type:
                            mime_type = part.inline_data.mime_type
                        break

            if not audio_data:
                logger.warning(f"[{agent_name}] No audio data returned from Gemini TTS")
                return []

            # Determine file extension from mime type
            ext_map = {
                "audio/wav": "wav",
                "audio/mpeg": "mp3",
                "audio/mp3": "mp3",
                "audio/ogg": "ogg",
                "audio/webm": "webm",
                "audio/pcm": "wav",
            }
            ext = ext_map.get(mime_type, "wav")
            asset_id = str(uuid.uuid4())
            filename = f"{asset_id}.{ext}"

            # Upload to GCS (or local fallback)
            gcs_result = await upload_bytes(
                data=audio_data,
                workspace_uuid=workspace_id,
                campaign_id=campaign_id,
                asset_type="audio",
                filename=filename,
                content_type=mime_type,
            )

            asset_url = gcs_result["gcs_url"]
            gcs_path = gcs_result["gcs_path"]

            assets.append(
                GeneratedAsset(
                    id=asset_id,
                    asset_type="audio",
                    gcs_url=asset_url,
                    gcs_path=gcs_path,
                    thumbnail_url=asset_url,
                    prompt_used=script_text[:500],
                    model_used="gemini-2.5-flash-preview-tts",
                    mime_type=mime_type,
                )
            )

            latency_ms = (time.perf_counter() - start_time) * 1000
            logger.info(
                f"[{agent_name}] Audio generated successfully: "
                f"{gcs_path} ({len(audio_data)} bytes, {latency_ms:.0f}ms)"
            )

            # Log analytics
            from app.services.analytics import analytics_service
            from app.core.context_vars import user_id_ctx

            await analytics_service.log_usage(
                user_id=user_id_ctx.get() or "system",
                workspace_id=workspace_id,
                campaign_id=campaign_id,
                model_name="gemini-2.5-flash-preview-tts",
                tokens_input=len(script_text) // 4,
                tokens_output=len(audio_data) // 100,
                agent_name=agent_name,
                request_type="audio_gen",
                prompt=script_text[:500],
                response=asset_url,
                latency_ms=latency_ms,
            )

            return assets

        except Exception as e:
            logger.error(f"[{agent_name}] Audio generation failed: {e}", exc_info=True)
            return []
