from typing import Any, Dict, List, Optional
from app.agents.base import BaseV4Agent
from app.agents.brand.models import BrandGuardianInput, BrandGuardianOutput, ComplianceIssue
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

class BrandGuardianAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: BrandGuardianInput, context_str: str) -> BrandGuardianOutput:
        """Validates content against brand standards and guidelines."""

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are a brand compliance auditor. Return JSON.",
            default_user="", # Will be loaded from YAML
            variables={
                "content_type": input_data.content_type,
                "content_to_validate": input_data.content_to_validate,
                "tone_override": input_data.tone_override or "N/A",
                "auto_rewrite": input_data.auto_rewrite,
                "severity_threshold": input_data.severity_threshold,
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
            
            return BrandGuardianOutput(
                agent_id=input_data.agent_id,
                success=True,
                passed=data.get("passed", False),
                compliance_score=data.get("compliance_score", 0),
                issues=[ComplianceIssue(**i) for i in data.get("issues", [])],
                text_content=response,
                **{k: v for k, v in data.items() if k not in ["passed", "compliance_score", "issues", "text_content", "content"]}
            )
        except Exception as e:
            return BrandGuardianOutput(
                agent_id=input_data.agent_id,
                success=True,
                passed=False,
                compliance_score=0,
                issues=[],
                text_content=f"# Validation Error\n\nCould not parse LLM response for brand compliance audit.\n\n**Error:** {str(e)}",
                summary="Validation error — could not parse LLM response"
            )
