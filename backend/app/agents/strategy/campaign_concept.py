from typing import Any, Dict, List, Optional
from app.agents.base import BaseV4Agent
from app.agents.visual_strategy_models import CampaignConceptInput, CampaignConceptOutput, CampaignConcept
from app.core.llm import llm_router
from app.utils.json_repair import safe_json_parse

class CampaignConceptAgent(BaseV4Agent):
    agent_id = "campaign_concept"
    agent_name = "Campaign Concept Agent"
    description = "Generates high-level themes and messaging for marketing campaigns."
    category = "strategy"

    async def generate(self, input_data: CampaignConceptInput) -> CampaignConceptOutput:
        context = await self.prepare_context(input_data)

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are a brilliant marketing strategist. Return JSON. Respond with high-fidelity markdown including tables and bold messaging hooks.",
            default_user="", # Will be loaded from YAML
            variables={
                "campaign_type": input_data.campaign_type,
                "channels": ", ".join(input_data.channels),
                "duration": input_data.duration or "TBD",
                "budget_range": input_data.budget_range or "Not specified",
                "primary_goal": input_data.primary_goal or "N/A",
                "target_audience": input_data.target_audience or "N/A",
                "success_metric": input_data.success_metric or "N/A",
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
            return CampaignConceptOutput(
                agent_id=self.agent_id,
                success=True,
                title=data.get("title", f"Campaign Concepts: {input_data.campaign_type}"),
                sections=data.get("sections", []),
                recommendations=data.get("recommendations", []),
                action_items=data.get("action_items", []),
                concepts=[CampaignConcept(**c) for c in data.get("concepts", [])],
                recommended=data.get("recommended", ""),
                text_content=response_text,
                structured_data=data
            )
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"CampaignConceptAgent error: {e}")
            return CampaignConceptOutput(
                agent_id=self.agent_id,
                success=True,
                error=f"Parsing error: {e}",
                text_content=response_text,
                structured_data={"raw_response": response_text},
                concepts=[],
                recommended=""
            )
