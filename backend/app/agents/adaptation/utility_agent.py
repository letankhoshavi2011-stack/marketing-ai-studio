from typing import Dict, Any, List
from app.agents.base import BaseV4Agent
from app.agents.utility_models import UtilityInput, UtilityOutput
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

class UtilityAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: UtilityInput, context_str: str) -> UtilityOutput:
        """Handles Content Repurposing and Utility tasks."""

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are an expert in content transformation and cross-platform communication.",
            default_user="", # Will be loaded from YAML
            variables={
                "agent_id": input_data.agent_id,
                "source_content": input_data.source_content,
                "target_formats": ", ".join(input_data.target_formats),
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
            for fmt, text in data["converted_content"].items():
                content_flat += f"--- {fmt.upper()} ---\n{text}\n\n"
            
            return UtilityOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=content_flat,
                **data
            )
        except Exception as e:
            return UtilityOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=response,
                converted_content={"output": response}
            )
