from typing import Any, Dict, List, Optional
from app.agents.base import BaseV4Agent
from app.agents.visual_strategy_models import InfographicInput, InfographicOutput
from app.core.llm import llm_router
from app.utils.json_repair import safe_json_parse

class InfographicAgent(BaseV4Agent):
    agent_id = "infographic"
    agent_name = "Infographic Generator"
    description = "Designs data-driven infographics and visual explainers."
    category = "visual"

    async def generate(self, input_data: InfographicInput) -> InfographicOutput:
        context = await self.prepare_context(input_data)
        
        # 1. Use LLM to craft a high-quality image prompt
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="Return ONLY JSON.",
            default_user="", # Will be loaded from YAML
            variables={
                "topic": input_data.topic,
                "style": input_data.style,
                "aspect_ratio": input_data.aspect_ratio,
                "tone_override": input_data.tone_override or "N/A",
                "data_points": str(input_data.data_points) if input_data.data_points else "None",
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
            raise ValueError("Failed to parse refinement JSON")

        # 2. Generate Images
        assets = await self.generate_images(
            prompt=refinement["image_prompt"],
            aspect_ratio=input_data.aspect_ratio,
            count=1,
            style=input_data.style,
            context=context,
        )

        # 3. Format Output
        return InfographicOutput(
            agent_id=self.agent_id,
            assets=assets,
            text_content=f"### Infographic Design Concept\n\n{refinement.get('reasoning', '')}",
            structured_data=refinement
        )
