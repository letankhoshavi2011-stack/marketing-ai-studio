import logging
from typing import Dict, Any, List
from app.agents.base import BaseV4Agent
from app.agents.utility_models import AudioInput, AudioOutput
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

logger = logging.getLogger(__name__)


class AudioAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: AudioInput, context_str: str) -> AudioOutput:
        """Generates Audio and Podcast specific content."""

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are an expert in audio storytelling and podcast production.",
            default_user="", # Will be loaded from YAML
            variables={
                "agent_id": input_data.agent_id,
                "topic": input_data.topic,
                "target_duration": input_data.target_duration_mins or 15,
                "guests": ", ".join(input_data.guest_names) if input_data.guest_names else "Solo show",
                "tone": input_data.tone_override or "Conversational & Engaging",
                "audience": input_data.audience_selection or "General Listener Base",
                "context_str": context_str
            }
        )

        response = await self.gemini.generate_text(
            prompt=prompt_config["user"],
            system_prompt=prompt_config["system"],
            model_tier="pro"
        )

        try:
            data = safe_json_parse(response)
            if data is None:
                raise ValueError("Failed to parse JSON from LLM response")
            content_flat = data.get("show_notes", "")
            if data.get("script_segments"):
                content_flat += "\n\nSCRIPT BREAKDOWN:\n" + "\n".join([f"[{s.get('time', '')}] {s.get('speaker', 'Host')}: {s.get('text', '')}" for s in data['script_segments']])

            # ── Generate audio if requested ──
            audio_assets = []
            if input_data.generate_audio and input_data.agent_id == "podcast_script":
                try:
                    from app.services.audio_generator import AudioGeneratorService

                    # Build script text from segments for TTS
                    script_text = ""
                    if data.get("script_segments"):
                        script_text = "\n\n".join(
                            [f"{s.get('speaker', 'Host')}: {s['text']}" for s in data["script_segments"]]
                        )
                    elif content_flat:
                        script_text = content_flat

                    if script_text:
                        workspace_id = getattr(input_data, "workspace_id", None) or "global"
                        campaign_id = getattr(input_data, "campaign_id", None) or "default"

                        audio_assets = await AudioGeneratorService.generate_audio(
                            script_text=script_text[:10000],  # Cap at 10K chars for TTS
                            agent_name=input_data.agent_id,
                            workspace_id=workspace_id,
                            campaign_id=campaign_id,
                        )
                        logger.info(f"AudioAgent: Generated {len(audio_assets)} audio asset(s)")
                except Exception as audio_err:
                    logger.error(f"AudioAgent: Audio generation failed: {audio_err}", exc_info=True)

            return AudioOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=content_flat,
                audio_assets=audio_assets,
                **data
            )
        except Exception as e:
            logger.error(f"AudioAgent execution failed or JSON parse error: {e}")
            return AudioOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=response if response else "Failed to generate content.",
                script_segments=[],
                show_notes=response
            )
