from typing import Any, Dict, List, Optional
from app.agents.base import BaseV4Agent
from app.agents.brand.models import BrandNamingInput, BrandNamingOutput, BrandNameOption
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

class BrandNamingAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: BrandNamingInput, context_str: str) -> BrandNamingOutput:
        """Generates creative brand name options with rationale and domain suggestions."""

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are an expert in brand naming and verbal identity.",
            default_user="", # Will be loaded from YAML
            variables={
                "business_description": input_data.business_description,
                "industry": input_data.industry or "N/A",
                "values": ", ".join(input_data.values),
                "tone": ", ".join(input_data.tone),
                "target_audience": input_data.target_audience or "General",
                "style": input_data.style or "creative",
                "keywords_include": ", ".join(input_data.keywords_include),
                "keywords_avoid": ", ".join(input_data.keywords_avoid),
                "name_count": input_data.name_count,
                "domain_tld_preferences": ", ".join(input_data.domain_tld_preferences),
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

            # Context updates: only update brand_name if a top_pick is clear
            context_updates = {"brand_name": data.get("top_pick")} if data.get("top_pick") else {}

            return BrandNamingOutput(
                agent_id=input_data.agent_id,
                success=True,
                options=[BrandNameOption(**opt) for opt in data.get("options", [])],
                top_pick=data.get("top_pick", ""),
                text_content=response,
                context_updates=context_updates,
                **{k: v for k, v in data.items() if k not in ["options", "top_pick"]}
            )
        except Exception as e:
            return BrandNamingOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=response,
                options=[],
                top_pick="See content"
            )
