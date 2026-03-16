from typing import Dict, Any, List
from app.agents.base import BaseV4Agent
from app.agents.content_models import ContentInput, ContentOutput
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

class EmailAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: ContentInput, context_str: str) -> ContentOutput:
        """Generates Email Campaign and Newsletter content."""

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are a direct-response copywriter specializing in email marketing and list engagement.",
            default_user="", # Will be loaded from YAML
            variables={
                "agent_id": input_data.agent_id,
                "topic": input_data.topic,
                "target_length_words": input_data.target_length_words or "Concise",
                "tone": input_data.tone_override or "Personal & Persuasive",
                "audience_selection": input_data.audience_selection or "General List",
                "call_to_action": input_data.call_to_action or "None",
                "email_count": input_data.email_count,
                "newsletter_goal": input_data.newsletter_goal or "N/A",
                "issue_theme": input_data.issue_theme or "N/A",
                "urgency_level": input_data.urgency_level or "N/A",
                "link_url": input_data.link_url or "N/A",
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
            content_flat = f"SUBJECTS:\n{data['sections'][0]['content']}\n\nBODY:\n{data['sections'][1]['content']}"
            
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
                title="Generated Email",
                sections=[]
            )
