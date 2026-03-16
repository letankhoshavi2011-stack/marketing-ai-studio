from typing import Any, Dict, List, Optional
from app.agents.base import BaseV4Agent
from app.agents.visual_strategy_models import MockupInput, MockupOutput
from app.core.llm import llm_router
from app.utils.json_repair import safe_json_parse

class MockupGeneratorAgent(BaseV4Agent):
    agent_id = "mockup_generator"
    agent_name = "Mockup Generator"
    description = "Renders designs onto real-world product mockups."
    category = "visual"

    async def generate(self, input_data: MockupInput) -> MockupOutput:
        context = await self.prepare_context(input_data)
        
        # 1. Use LLM to craft a high-quality mockup prompt (Standardized)
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="Return ONLY JSON.",
            default_user="", # Will be loaded from YAML
            variables={
                "design_image_url": input_data.design_image_url or "Not provided — derive or generate a minimal brand mark from context.",
                "mockup_types": ", ".join(input_data.mockup_types),
                "background_style": input_data.background_style or "N/A",
                "scene_quality": input_data.scene_quality,
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

        # 2. Generate Mockups
        assets = await self.generate_images(
            prompt=refinement["image_prompt"],
            count=input_data.variation_count,
            context=context,
        )

        # 3. Format Output
        return MockupOutput(
            agent_id=self.agent_id,
            assets=assets,
            text_content=f"### Product Mockups\n\n{refinement.get('reasoning', '')}",
            structured_data=refinement
        )
