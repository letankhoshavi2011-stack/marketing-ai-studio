from typing import Any, Dict, List, Optional
from app.agents.base import BaseV4Agent
from app.agents.visual_strategy_models import ProductPhotoshootInput, ProductPhotoshootOutput
from app.core.llm import llm_router
from app.utils.json_repair import safe_json_parse

class ProductPhotoshootAgent(BaseV4Agent):
    agent_id = "product_photoshoot"
    agent_name = "Product Photoshoot"
    description = "Places products in professional studio or lifestyle scenes."
    category = "visual"

    async def generate(self, input_data: ProductPhotoshootInput) -> ProductPhotoshootOutput:
        context = await self.prepare_context(input_data)
        
        # 1. Use LLM to craft a high-quality image prompt (Standardized)
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="Return ONLY JSON.",
            default_user="", # Will be loaded from YAML
            variables={
                "product_image_url": input_data.product_image_url,
                "product_name": input_data.product_name or "Item",
                "scene": input_data.scene,
                "custom_scene": input_data.custom_scene or "None",
                "lighting": input_data.lighting,
                "aspect_ratio": input_data.aspect_ratio,
                "background_style": input_data.background_style or "N/A",
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
            context=context,
        )

        return ProductPhotoshootOutput(
            agent_id=self.agent_id,
            assets=assets,
            text_content=f"### Product Photoshoot Variations\n\n{refinement.get('reasoning', '')}",
            structured_data=refinement
        )
