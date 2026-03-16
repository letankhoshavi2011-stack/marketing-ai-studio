from typing import Dict, Any, List
from app.agents.base import BaseV4Agent
from app.agents.content_models import ContentInput, ContentOutput
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

class BlogAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: ContentInput, context_str: str) -> ContentOutput:
        """Generates Long-form Blog/Article content."""

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are a senior content editor specializing in SEO and high-conversion blogging.",
            default_user="", # Will be loaded from YAML
            variables={
                "topic": input_data.topic,
                "target_length_words": input_data.target_length_words or 1000,
                "tone": input_data.tone_override or "Professional & Educational",
                "audience_selection": input_data.audience_selection or "General Industry Audience",
                "call_to_action": input_data.call_to_action or "None",
                "keywords": ", ".join(input_data.keywords),
                "seo_intent": input_data.seo_intent or "N/A",
                "sections_to_include": ", ".join(input_data.sections_to_include) if input_data.sections_to_include else "N/A",
                "audience_level": input_data.audience_level or "N/A",
                "source_material": input_data.source_material or "N/A",
                "thesis": input_data.thesis or "N/A",
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
            
            # ── Generate media assets if requested ──
            if input_data.generate_image:
                # Clamp to max 4 to control cost/runtime
                input_data.image_count = max(1, min(input_data.image_count, 4))
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
