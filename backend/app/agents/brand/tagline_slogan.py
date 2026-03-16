from typing import Any, Dict, List, Optional
from app.agents.base import BaseV4Agent
from app.agents.brand.models import TaglineInput, TaglineOutput, TaglineOption
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

class TaglineSloganAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: TaglineInput, context_str: str) -> TaglineOutput:
        """Creates memorable taglines and slogans ranked by tone and memorability."""

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are an expert copywriter specializing in short-form brand messaging.",
            default_user="", # Will be loaded from YAML
            variables={
                "brand_name": input_data.brand_name or "TBD",
                "business_description": input_data.business_description or "See context",
                "target_emotion": input_data.target_emotion or "Trust and Innovation",
                "use_case": input_data.use_case or ("Campaign slogan" if input_data.for_campaign else "Brand tagline"),
                "channel": input_data.channel or "Any",
                "tone": input_data.tone or "Professional",
                "max_words": input_data.max_words,
                "campaign_context": ("Yes, " + (input_data.campaign_theme or "")) if input_data.for_campaign else "Brand Foundation",
                "brand_values": ", ".join(input_data.brand_values),
                "keywords": ", ".join(input_data.keywords),
                "context_str": context_str,
                "context": context_str,  # Back-compat for prompt templates that use {context}
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

            # Context updates: update tagline if we have options
            context_updates = {}
            if data.get("options"):
                context_updates["tagline"] = data["options"][0]["tagline"]

            return TaglineOutput(
                agent_id=input_data.agent_id,
                success=True,
                options=[TaglineOption(**opt) for opt in data.get("options", [])],
                text_content=response,
                context_updates=context_updates,
                **{k: v for k, v in data.items() if k not in ["options"]}
            )
        except Exception as e:
            return TaglineOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=response,
                options=[]
            )
