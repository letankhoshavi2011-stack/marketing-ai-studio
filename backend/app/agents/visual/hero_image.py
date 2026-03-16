from typing import Any, Dict, List, Optional
from app.agents.base import BaseV4Agent
from app.agents.visual_strategy_models import HeroImageInput, HeroImageOutput
from app.core.llm import llm_router
from app.utils.json_repair import safe_json_parse

class HeroImageAgent(BaseV4Agent):
    agent_id = "hero_image"
    agent_name = "Image Generator"
    description = "Creates high-impact banner and hero images."
    category = "visual"

    async def generate(self, input_data: HeroImageInput) -> HeroImageOutput:
        context = await self.prepare_context(input_data)
        
        # 1. Use LLM to craft a high-quality image prompt (Standardized)
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="Return ONLY JSON.",
            default_user="", # Will be loaded from YAML
            variables={
                "description": input_data.description,
                "style": input_data.style,
                "aspect_ratio": input_data.aspect_ratio,
                "text_content": input_data.text_content if input_data.include_text else "None",
                "composition": input_data.composition or "N/A",
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
            aspect_ratio=input_data.aspect_ratio,
            count=input_data.variation_count,
            style=input_data.style,
            context=context,
        )

        return HeroImageOutput(
            agent_id=self.agent_id,
            assets=assets,
            text_content=f"### Hero Image Concepts\n\n{refinement.get('reasoning', '')}",
            structured_data=refinement
        )
