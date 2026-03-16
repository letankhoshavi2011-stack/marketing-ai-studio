"""Generic Growth / CRO / Strategy agent.

Uses per-agent system prompts loaded from YAML files (or inline defaults)
to power all 31 new marketing skill agents through a single class.
"""

import json
import logging
from typing import Any, Dict, List, Optional

from app.agents.base import BaseV4Agent
from app.agents.growth_models import GrowthInput, GrowthOutput, EmailContent
from app.core.llm import llm_router
from app.utils.json_repair import safe_json_parse


def _stringify(value: Any) -> str:
    """Coerce a value to str — handles dicts, lists, and primitives."""
    if isinstance(value, str):
        return value
    if isinstance(value, (dict, list)):
        return json.dumps(value, indent=2, ensure_ascii=False)
    return str(value)


def _build_text_content(title: str, sections: List[Dict[str, str]], recommendations: List[str], action_items: List[str]) -> str:
    """Builds a markdown string from the structured output fields."""
    parts = []
    if title:
        parts.append(f"# {title}")
    for s in sections:
        heading = s.get("heading", "")
        content = s.get("content", "")
        if heading:
            parts.append(f"## {heading}")
        if content:
            parts.append(content)
    if recommendations:
        parts.append("## Recommendations")
        parts.extend(f"- {r}" for r in recommendations)
    if action_items:
        parts.append("## Action Items")
        parts.extend(f"- {a}" for a in action_items)
    return "\n\n".join(parts)


def _collect_list_values(data: Dict[str, Any], keys: List[str]) -> List[str]:
    """Collect list-like values from multiple possible JSON keys."""
    collected: List[str] = []
    for key in keys:
        value = data.get(key)
        if isinstance(value, list):
            collected.extend([_stringify(v) for v in value if v not in (None, "", [], {})])
        elif value not in (None, "", [], {}):
            collected.append(_stringify(value))
    return collected


def _normalize_emails(data: Dict[str, Any]) -> List[EmailContent]:
    """Normalize emails from flexible model output shapes."""
    emails: List[EmailContent] = []
    raw_emails = data.get("emails", [])

    if isinstance(raw_emails, list):
        for e in raw_emails:
            if isinstance(e, dict):
                emails.append(EmailContent(
                    subject=_stringify(e.get("subject", "")).strip(),
                    opening_line=_stringify(e.get("opening_line", "")).strip() if e.get("opening_line") else None,
                    body=_stringify(e.get("body", "")).strip(),
                    cta=_stringify(e.get("cta", "")).strip() if e.get("cta") else None,
                    ps_line=_stringify(e.get("ps_line", "")).strip() if e.get("ps_line") else None,
                    step=int(e.get("step", 1)),
                    send_day=int(e.get("send_day", 1)),
                    personalization_tips=_collect_list_values(e, ["personalization_tips", "personalization_notes", "customization_tips"])
                ))
    return emails

def _normalize_sections(data: Dict[str, Any]) -> List[Dict[str, str]]:
    """Normalize sections from flexible model output shapes."""
    sections: List[Dict[str, str]] = []
    raw_sections = data.get("sections", [])

    if isinstance(raw_sections, list):
        for s in raw_sections:
            if isinstance(s, dict):
                sections.append({
                    "heading": str(s.get("heading", "")),
                    "content": _stringify(s.get("content", "")),
                })
            elif s not in (None, ""):
                sections.append({"heading": "Section", "content": _stringify(s)})
    elif isinstance(raw_sections, dict):
        for heading, content in raw_sections.items():
            sections.append({"heading": str(heading), "content": _stringify(content)})

    if sections:
        return sections

    # Fallback: convert all non-empty top-level keys into cards
    reserved = {"title", "sections", "recommendations", "action_items", "launch_type"}
    for key, value in data.items():
        if key in reserved or value in (None, "", [], {}):
            continue
        sections.append({
            "heading": key.replace("_", " ").title(),
            "content": _stringify(value),
        })
    return sections

logger = logging.getLogger(__name__)

# AGENT_PROMPTS are now loaded from external YAML files in backend/app/prompts/agents/
# The agent_id of each sub-agent maps directly to the YAML filename.

# ── Fallback prompt for agents not yet given detailed prompts ──
_DEFAULT_SYSTEM = (
    "You are an expert digital marketing strategist. "
    "Provide clear, actionable, data-driven recommendations."
)
_DEFAULT_USER = (
    "Analyze the following and provide expert recommendations:\n\n"
    "TOPIC: {topic}\n"
    "TARGET AUDIENCE: {target_audience}\n"
    "CURRENT METRICS: {current_metrics}\n"
    "ADDITIONAL CONTEXT: {additional_context}\n\n"
    "Return JSON with: title, sections (list of {{heading, content}}), "
    "recommendations (list of strings), action_items (list of strings). "
    "IMPORTANT: Each section's 'content' must be a plain text string (use newlines "
    "for formatting). Do NOT nest JSON objects or arrays inside content values."
)


class GrowthStrategyAgent(BaseV4Agent):
    """One flexible agent class that serves all Growth/CRO/Strategy agents."""

    agent_id = "growth_strategy"
    agent_name = "Growth Strategy Agent"
    description = "Covers CRO, growth, email, SEO, strategy, and sales enablement."
    category = "growth"

    async def generate(self, input_data: GrowthInput) -> GrowthOutput:
        context_str = await self.prepare_context(input_data)

        # Build optional pricing_strategy-specific lines
        pricing_model = input_data.pricing_model or ""
        competitor_pricing = input_data.competitor_pricing or ""
        pricing_model_line = f"PRICING MODEL: {pricing_model}\n" if pricing_model else ""
        competitor_pricing_line = f"COMPETITOR PRICING: {competitor_pricing}\n" if competitor_pricing else ""
        margin_target_line = f"MARGIN TARGET: {input_data.margin_target}\n" if input_data.margin_target else ""
        packaging_constraints_line = f"PACKAGING CONSTRAINTS: {input_data.packaging_constraints}\n" if input_data.packaging_constraints else ""
        pricing_objective_line = f"PRICING OBJECTIVE: {input_data.pricing_objective}\n" if input_data.pricing_objective else ""
        channels_line = ""
        if getattr(input_data, "channels", None):
            chan_val = input_data.channels
            if isinstance(chan_val, list):
                chan_val = ", ".join(chan_val)
            channels_line = f"CHANNELS: {chan_val}\n"

        # ── Load prompt (Standardized) ──
        # get_prompt_config will automatically use input_data.agent_id to look for YAML
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system=_DEFAULT_SYSTEM,
            default_user=_DEFAULT_USER,
            variables={
                "topic": input_data.topic or "",
                "target_audience": input_data.target_audience or "Not specified",
                "current_metrics": input_data.current_metrics or "Not provided",
                "additional_context": input_data.additional_context or "None",
                "pricing_model_line": pricing_model_line,
                "competitor_pricing_line": competitor_pricing_line,
                "margin_target_line": margin_target_line,
                "packaging_constraints_line": packaging_constraints_line,
                "pricing_objective_line": pricing_objective_line,
                "channels_line": channels_line,
            }
        )

        user_prompt = prompt_config["user"]
        system_prompt = prompt_config["system"]

        # ── Append only whitelisted extra form fields (e.g., CRO-specific knobs) ──
        allowed_extra_fields = {
            "pricing_model", "competitor_pricing", "margin_target", "packaging_constraints", "pricing_objective",
            "channels", "launch_date", "test_type",
            "email_count", "sequence_length", "trigger_event",
            "psychology_focus", "content_goals", "competitor_names", "schema_types",
            "incentive_type", "pricing_objective", "success_metric",
            "primary_metric", "secondary_metrics", "traffic_split",
            "cta_type", "personalization_inputs", "send_spacing_days", "call_to_action",
            "primary_conversion_event", "traffic_source_mix",
            "ethical_constraints", "trust_risks", "team_capacity", "repurposing_targets",
            "feature_matrix", "comparison_keywords", "competitor_urls", "seed_keywords",
            "site_type", "page_type", "existing_schema_json", "implementation_language",
            "reward_budget", "referral_cap", "program_goal",
        }
        extra_fields = []
        for field_name, value in input_data.model_dump().items():
            if field_name in allowed_extra_fields and value:
                label = field_name.replace("_", " ").title()
                if isinstance(value, list):
                    value = ", ".join([str(v) for v in value])
                extra_fields.append(f"{label}: {value}")

        if extra_fields:
            extra_text = "SPECIFIC PARAMETERS:\n" + "\n".join(f"- {line}" for line in extra_fields) + "\n\n"
            if "ADDITIONAL CONTEXT:" in user_prompt:
                user_prompt = user_prompt.replace("ADDITIONAL CONTEXT:", f"{extra_text}ADDITIONAL CONTEXT:")
            else:
                user_prompt += f"\n\n{extra_text}"

        # ── JSON output instruction ──
        user_prompt += "\n\nRespond ONLY in valid JSON. Do NOT include markdown formatting."

        if context_str:
            user_prompt = f"{context_str}\n\n---\n\n{user_prompt}"

        response_text = await llm_router.generate_text(
            prompt=user_prompt,
            system_prompt=system_prompt,
            model_tier="quality",
            response_format={"type": "json_object"},
        )

        try:
            data = safe_json_parse(response_text)
            if data is None:
                raise ValueError("Failed to parse JSON from LLM response")
            if not isinstance(data, dict):
                raise ValueError("LLM response is not a JSON object")

            sections = _normalize_sections(data)
            emails = _normalize_emails(data)

            title = _stringify(data.get("title", "")).strip() or input_data.agent_id.replace("_", " ").title()
            recs = _collect_list_values(
                data,
                ["recommendations", "critical_issues", "prioritized_fixes", "prioritized_fix_list"],
            )
            items = _collect_list_values(
                data,
                ["action_items", "fix_plan", "implementation_plan", "roadmap", "next_steps"],
            )
            launch_type = data.get("launch_type")
            text_content = _build_text_content(title, sections, recs, items)

            return GrowthOutput(
                agent_id=input_data.agent_id,
                title=title,
                launch_type=launch_type,
                sections=sections,
                recommendations=recs,
                action_items=items,
                emails=emails,
                text_content=text_content,
                structured_data=data,
            )
        except Exception as e:
            logger.error("GrowthStrategyAgent parse error for %s: %s", input_data.agent_id, e)
            return GrowthOutput(
                agent_id=input_data.agent_id,
                success=True,
                error=f"Parsing error: {e}",
                title=input_data.agent_id.replace("_", " ").title(),
                sections=[{"heading": "Raw Response", "content": response_text}],
                recommendations=[],
                action_items=[],
                text_content=response_text,
                structured_data={"raw_response": response_text},
                launch_type=None,
            )
