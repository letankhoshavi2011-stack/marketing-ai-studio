from typing import Dict, Any, List
from app.agents.base import BaseV4Agent
from app.agents.content_models import ContentInput, ContentOutput
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

class CopyUtilityAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: ContentInput, context_str: str) -> ContentOutput:
        """Handles miscellaneous content and utility tasks (Landing pages, PRs, Case studies, etc)."""

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are a versatile senior copywriter specializing in conversion-driven and professional corporate communications.",
            default_user="", # Will be loaded from YAML
            variables={
                "agent_id": input_data.agent_id,
                "topic": input_data.topic,
                "target_length_words": input_data.target_length_words or 1000,
                "tone": input_data.tone_override or "Professional & Persuasive",
                "audience_selection": input_data.audience_selection or "General Industry Audience",
                "call_to_action": input_data.call_to_action or "None",
                "keywords": ", ".join(input_data.keywords),
                "sections_to_include": ", ".join(input_data.sections_to_include) if input_data.sections_to_include else "N/A",
                "customer_name": input_data.customer_name or "N/A",
                "results_metrics": input_data.results_metrics or "N/A",
                "problem_statement": input_data.problem_statement or "N/A",
                "newsletter_goal": input_data.newsletter_goal or "N/A",
                "issue_theme": input_data.issue_theme or "N/A",
                "announcement_date": input_data.announcement_date or "N/A",
                "quote_source": input_data.quote_source or "N/A",
                "boilerplate": input_data.boilerplate or "N/A",
                "thesis": input_data.thesis or "N/A",
                "specs": input_data.specs or "N/A",
                "link_url": input_data.link_url or "N/A",
                "urgency_level": input_data.urgency_level or "N/A",
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
            content_flat = f"# {data.get('title', '')}\n\n" + "\n\n".join([f"## {s.get('heading', '')}\n{s.get('content', '')}" for s in data.get('sections', [])])
            
            assets = await self.generate_media_if_requested(input_data, content_flat[:500])

            return ContentOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=content_flat,
                assets=assets,
                **data
            )
        except Exception as e:
            return ContentOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=response,
                title="Generated Content",
                sections=[]
            )
