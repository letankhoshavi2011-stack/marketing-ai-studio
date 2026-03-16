from typing import Any, Dict, List, Optional
from app.agents.base import BaseV4Agent
from app.agents.brand.models import BrandVoiceInput, BrandVoiceOutput
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

class BrandVoiceAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: BrandVoiceInput, context_str: str) -> BrandVoiceOutput:
        """Analyzes content to extract brand tone, rules, and personality."""

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are a brand voice architect. Return JSON.",
            default_user="", # Will be loaded from YAML
            variables={
                "brand_description": input_data.brand_description or "N/A",
                "manual_tone": input_data.manual_tone,
                "manual_formality": input_data.manual_formality,
                "manual_rules": input_data.manual_rules,
                "sample_content": input_data.sample_content or "N/A",
                "sample_asset_ids": ", ".join(input_data.sample_asset_ids) if input_data.sample_asset_ids else "N/A",
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
            
            context_updates = {
                "voice_profile": data,
                "tone_keywords": data.get("tone", []),
                "voice_rules": data.get("custom_rules", [])
            }

            return BrandVoiceOutput(
                agent_id=input_data.agent_id,
                success=True,
                tone=data.get("tone", []),
                formality=data.get("formality", 0.5),
                avg_sentence_length=data.get("avg_sentence_length", 15.0),
                vocabulary_level=data.get("vocabulary_level", "simple"),
                preferred_words=data.get("preferred_words", {}),
                avoid_words=data.get("avoid_words", []),
                uses_emojis=data.get("uses_emojis", False),
                uses_exclamations=data.get("uses_exclamations", False),
                paragraph_style=data.get("paragraph_style", "short"),
                custom_rules=data.get("custom_rules", []),
                voice_prompt=data.get("voice_prompt", ""),
                text_content=response,
                context_updates=context_updates,
                **{k: v for k, v in data.items() if k not in ["tone", "formality", "avg_sentence_length", "vocabulary_level", "preferred_words", "avoid_words", "uses_emojis", "uses_exclamations", "paragraph_style", "custom_rules", "voice_prompt"]}
            )
        except Exception as e:
            return BrandVoiceOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=response,
                tone=[], formality=0.5, avg_sentence_length=15.0, vocabulary_level="simple",
                preferred_words={}, avoid_words=[], uses_emojis=False, uses_exclamations=False,
                paragraph_style="short", custom_rules=[], voice_prompt=""
            )
