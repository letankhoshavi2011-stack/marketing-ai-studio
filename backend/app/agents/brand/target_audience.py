from typing import Any, Dict, List, Optional
from app.agents.base import BaseV4Agent
from app.agents.brand.models import TargetAudienceInput, TargetAudienceOutput, BuyerPersona
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

class TargetAudienceAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: TargetAudienceInput, context_str: str) -> TargetAudienceOutput:
        """Defines detailed buyer personas with psychographics and channel preferences."""

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are a market research expert specialized in consumer profiling.",
            default_user="", # Will be loaded from YAML
            variables={
                "persona_count": input_data.persona_count,
                "brand_name": input_data.brand_name or "TBD",
                "industry": input_data.industry or "See context",
                "product_description": input_data.product_description or "See context",
                "geographic_focus": input_data.geographic_focus or "Global",
                "price_point": input_data.price_point or "Mid-range",
                "additional_context": input_data.additional_context or "N/A",
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

            return TargetAudienceOutput(
                agent_id=input_data.agent_id,
                success=True,
                personas=[BuyerPersona(**p) for p in data.get("personas", [])],
                primary_persona=data.get("primary_persona", ""),
                channel_recommendations=data.get("channel_recommendations", []),
                text_content=response,
                context_updates={"target_audience": data.get("personas")},
                **{k: v for k, v in data.items() if k not in ["personas", "primary_persona", "channel_recommendations"]}
            )
        except Exception as e:
            return TargetAudienceOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=response,
                personas=[],
                primary_persona="",
                channel_recommendations=[]
            )
