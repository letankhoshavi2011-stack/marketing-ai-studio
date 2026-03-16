from typing import Dict, Any, List
from app.agents.base import BaseV4Agent
from app.agents.content_models import AdCopyInput, AdCopyOutput
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

class AdCopyAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: AdCopyInput, context_str: str) -> AdCopyOutput:
        """Generates Advertising Copy for various platforms."""

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are an expert performance marketer specializing in high-ROAS ad copy.",
            default_user="", # Will be loaded from YAML
            variables={
                "platform": input_data.agent_id.replace('_', ' ').title(),
                "product_name": input_data.product_name,
                "offer": input_data.offer,
                "benefit_focus": input_data.benefit_focus,
                "cta": input_data.cta or "N/A",
                "target_audience": input_data.target_audience or "N/A",
                "destination_url": input_data.destination_url or "N/A",
                "keyword_theme": input_data.keyword_theme or "N/A",
                "tone_override": input_data.tone_override or "N/A",
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
            content_flat = ""
            for i, v in enumerate(data['variations']):
                content_flat += f"VARIATION {i+1} ({input_data.benefit_focus})\nHEADLINE: {v['headline']}\nBODY: {v['body']}\nCTA: {v['cta']}\n\n"
            
            assets = await self.generate_media_if_requested(input_data, content_flat[:500])

            return AdCopyOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=content_flat,
                assets=assets,
                **data
            )
        except Exception as e:
            return AdCopyOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=response,
                variations=[]
            )
