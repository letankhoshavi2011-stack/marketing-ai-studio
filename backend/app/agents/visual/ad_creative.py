from typing import Any, Dict, List, Optional
from app.agents.base import BaseV4Agent
from app.agents.visual_strategy_models import AdCreativeInput, AdCreativeOutput
from app.core.llm import llm_router
from app.utils.json_repair import safe_json_parse

class AdCreativeAgent(BaseV4Agent):
    agent_id = "ad_creative"
    agent_name = "Ad Creative Designer"
    description = "Designs platform-ready visual ads with headlines."
    category = "visual"

    async def generate(self, input_data: AdCreativeInput) -> AdCreativeOutput:
        context = await self.prepare_context(input_data)
        
        # 1. Use LLM to craft a high-quality image prompt (Standardized)
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="Return ONLY JSON.",
            default_user="", # Will be loaded from YAML
            variables={
                "platform": input_data.platform,
                "headline": input_data.headline,
                "cta": input_data.cta,
                "product_image_url": input_data.product_image_url or "None",
                "aspect_ratio": input_data.aspect_ratio,
                "design_style": input_data.design_style or "N/A",
                "legal_text": input_data.legal_text or "N/A",
                "context": context
            }
        )

        refiner_res = await llm_router.generate_text(
            prompt=prompt_config["user"],
            system_prompt=prompt_config["system"],
            model_tier="standard",
            response_format={"type": "json_object"}
        )
        refinement = safe_json_parse(refiner_res)
        if refinement is None:
            raise ValueError("Failed to parse prompt refinement JSON")

        assets = await self.generate_images(
            prompt=refinement["image_prompt"],
            count=input_data.variation_count,
            aspect_ratio=input_data.aspect_ratio,
            style=input_data.design_style,
            context=context,
        )

        return AdCreativeOutput(
            agent_id=self.agent_id,
            assets=assets,
            dimension_info=f"Optimized for {input_data.platform}",
            text_content=f"### Ad Creative Variations\n\n{refinement.get('reasoning', '')}",
            structured_data=refinement
        )
