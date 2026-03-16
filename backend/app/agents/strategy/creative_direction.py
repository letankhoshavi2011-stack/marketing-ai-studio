from typing import Any, Dict, List, Optional
from app.agents.base import BaseV4Agent
from app.agents.visual_strategy_models import CreativeDirectionInput, CreativeDirectionOutput
from app.core.llm import llm_router
from app.utils.json_repair import safe_json_parse

class CreativeDirectionAgent(BaseV4Agent):
    agent_id = "creative_direction"
    agent_name = "Creative Direction Agent"
    description = "Sets visual and mood direction for campaigns."
    category = "strategy"

    async def generate(self, input_data: CreativeDirectionInput) -> CreativeDirectionOutput:
        context = await self.prepare_context(input_data)

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are a visionary creative director. Return JSON. Respond with high-fidelity markdown including tables and strategic callouts.",
            default_user="", # Will be loaded from YAML
            variables={
                "campaign_goal": input_data.campaign_goal,
                "target_audience": input_data.target_audience or "N/A",
                "channels": ", ".join(input_data.channels) if input_data.channels else "N/A",
                "deliverables": ", ".join(input_data.deliverables) if input_data.deliverables else "N/A",
                "context": context
            }
        )

        response_text = await llm_router.generate_text(
            prompt=prompt_config["user"],
            system_prompt=prompt_config["system"],
            model_tier="quality",
            response_format={"type": "json_object"}
        )

        try:
            data = safe_json_parse(response_text)
            if data is None or not isinstance(data, dict):
                raise ValueError("Failed to parse JSON from LLM response")
            return CreativeDirectionOutput(
                agent_id=self.agent_id,
                success=True,
                title=data.get("title", f"Creative Brief: {input_data.campaign_goal}"),
                sections=data.get("sections", []),
                recommendations=data.get("recommendations", []),
                action_items=data.get("action_items", []),
                mood_description=data.get("mood_description", ""),
                visual_direction=data.get("visual_direction", ""),
                color_usage_guide=data.get("color_usage_guide", ""),
                composition_rules=data.get("composition_rules", []),
                imagery_approach=data.get("imagery_approach", ""),
                reference_styles=data.get("reference_styles", []),
                text_content=response_text,
                structured_data=data
            )
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"CreativeDirectionAgent error: {e}")
            return CreativeDirectionOutput(
                agent_id=self.agent_id,
                success=True,
                error=f"Parsing error: {e}",
                text_content=response_text,
                structured_data={"raw_response": response_text},
                mood_description="", visual_direction="", color_usage_guide="",
                composition_rules=[], imagery_approach="", reference_styles=[]
            )
