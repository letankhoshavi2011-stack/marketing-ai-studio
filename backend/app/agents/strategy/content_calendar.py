from typing import Any, Dict, List, Optional
from app.agents.base import BaseV4Agent
from app.agents.visual_strategy_models import ContentCalendarInput, ContentCalendarOutput, CalendarEntry
from app.core.llm import llm_router
from app.utils.json_repair import safe_json_parse

class ContentCalendarAgent(BaseV4Agent):
    agent_id = "content_calendar"
    agent_name = "Content Calendar Planner"
    description = "Plans a strategic content schedule across multiple channels."
    category = "strategy"

    async def generate(self, input_data: ContentCalendarInput) -> ContentCalendarOutput:
        context = await self.prepare_context(input_data)

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are a meticulous content planner. Return JSON. Respond with high-fidelity markdown including detailed tables and strategic callouts.",
            default_user="", # Will be loaded from YAML
            variables={
                "duration_weeks": input_data.duration_weeks,
                "channels": ", ".join(input_data.channels),
                "posting_frequency": input_data.posting_frequency,
                "campaign_theme": input_data.campaign_theme or "General brand awareness",
                "start_date": input_data.start_date or "As soon as possible",
                "context": context
            }
        )

        response_text = await llm_router.generate_text(
            prompt=prompt_config["user"],
            system_prompt=prompt_config["system"],
            model_tier="quality",
            # Calendar generation can be long
            max_tokens=4096,
            response_format={"type": "json_object"}
        )

        try:
            data = safe_json_parse(response_text)
            if data is None or not isinstance(data, dict):
                raise ValueError("Failed to parse JSON from LLM response")
            return ContentCalendarOutput(
                agent_id=self.agent_id,
                success=True,
                title=data.get("title", f"Content Calendar: {input_data.campaign_theme or 'Strategy'}"),
                sections=data.get("sections", []),
                recommendations=data.get("recommendations", []),
                action_items=data.get("action_items", []),
                entries=[CalendarEntry(**e) for e in data.get("entries", [])],
                weekly_summary=data.get("weekly_summary", ""),
                text_content=response_text,
                structured_data=data
            )
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"ContentCalendarAgent error: {e}")
            return ContentCalendarOutput(
                agent_id=self.agent_id,
                success=True,
                error=f"Parsing error: {e}",
                text_content=response_text,
                structured_data={"raw_response": response_text},
                entries=[],
                weekly_summary=""
            )
