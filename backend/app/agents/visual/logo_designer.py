from typing import Any, Dict, List, Optional
from app.agents.base import BaseV4Agent
from app.agents.visual_strategy_models import LogoDesignerInput, LogoDesignerOutput
from app.core.llm import llm_router
from app.utils.json_repair import safe_json_parse

class LogoDesignerAgent(BaseV4Agent):
    agent_id = "logo_designer"
    agent_name = "Logo Designer"
    description = "Generates professional logo variations based on brand style."
    category = "visual"

    async def generate(self, input_data: LogoDesignerInput) -> LogoDesignerOutput:
        context = await self.prepare_context(input_data)
        
        # 1. Use LLM to craft a high-quality image prompt
        # 1. Use LLM to craft a high-quality image prompt (Standardized)
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="Return ONLY JSON.",
            default_user="", # Will be loaded from YAML
            variables={
                "brand_name": input_data.brand_name or "TBD",
                "styles": ", ".join(input_data.styles),
                "icon_concept": input_data.icon_concept or "Creative and modern",
                "brand_description": input_data.brand_description or "N/A",
                "usage_context": input_data.usage_context or "General brand use",
                "colors": ", ".join(input_data.colors) if input_data.colors else "Use existing brand palette",
                "context": context
            }
        )

        refiner_res = await llm_router.generate_text(
            prompt=prompt_config["user"],
            system_prompt=prompt_config["system"],
            model_tier="quality",
            response_format={"type": "json_object"}
        )
        refinement = safe_json_parse(refiner_res)
        if refinement is None:
            raise ValueError("Failed to parse prompt refinement JSON")

        # 2. Generate Images via llm_router
        assets = await self.generate_images(
            prompt=refinement["image_prompt"],
            count=input_data.variation_count,
            context=context,
        )

        # 3. Format Output
        return LogoDesignerOutput(
            agent_id=self.agent_id,
            assets=assets,
            text_content=f"## Logo Concepts for {input_data.brand_name}\n\n{refinement.get('reasoning', '')}",
            context_updates={"logo_url": assets[0].gcs_url if assets else None},
            structured_data=refinement
        )
