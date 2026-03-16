import re
import logging
from typing import Any, Dict, List, Optional
from app.agents.base import BaseV4Agent
from app.agents.brand.models import (
    BrandIdentityInput,
    BrandIdentityOutput,
    ColorSwatch,
    FontPair,
)
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

logger = logging.getLogger(__name__)


def _deep_get(d: dict, *keys, default=None):
    """Walk nested dicts to find a value by trying each key path."""
    for key in keys:
        parts = key.split(".")
        val = d
        for p in parts:
            if isinstance(val, dict):
                val = val.get(p)
            else:
                val = None
                break
        if val is not None:
            return val
    return default


def _parse_colors_from_table(text: str) -> List[Dict[str, str]]:
    """Extract colors from a markdown table containing hex codes."""
    colors = []
    hex_pattern = re.compile(r'#[0-9A-Fa-f]{6}')
    for line in text.split('\n'):
        if '|' not in line or line.strip().startswith('| :') or line.strip().startswith('|--'):
            continue
        cells = [c.strip() for c in line.split('|') if c.strip()]
        if len(cells) < 2:
            continue
        hex_match = None
        for cell in cells:
            m = hex_pattern.search(cell)
            if m:
                hex_match = m.group()
                break
        if hex_match:
            name = cells[0] if not hex_pattern.search(cells[0]) else "Color"
            usage = ""
            for cell in cells:
                if cell == name or hex_pattern.search(cell):
                    continue
                if any(kw in cell.lower() for kw in ['primary', 'secondary', 'accent', 'neutral', 'background', 'cta', 'text', 'link', 'highlight']):
                    usage = cell
                    break
            if not usage and len(cells) >= 3:
                usage = cells[2] if cells[2] != hex_match and cells[2] != name else ""
            colors.append({"hex": hex_match, "name": name, "usage": usage or "General"})
    return colors


def _parse_fonts_from_text(text: str) -> Optional[Dict[str, str]]:
    """Extract heading/body font names from markdown typography text."""
    heading = None
    body = None
    lines = text.split('\n')
    for i, line in enumerate(lines):
        lower = line.lower()
        if 'primary' in lower or 'heading' in lower or 'headline' in lower:
            # Font name is often in the same line after a colon, or the next significant word
            m = re.search(r'(?:typeface|font)[:\s]*\*?\*?([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)', line)
            if m:
                heading = m.group(1).strip()
            elif ':' in line:
                heading = line.split(':')[-1].strip().strip('*').strip()
        elif 'secondary' in lower or 'body' in lower or 'monospace' in lower:
            m = re.search(r'(?:typeface|font)[:\s]*\*?\*?([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)', line)
            if m:
                body = m.group(1).strip()
            elif ':' in line:
                body = line.split(':')[-1].strip().strip('*').strip()
    if heading:
        return {"heading": heading, "body": body or heading, "heading_weight": "700", "body_weight": "400"}
    return None


def _normalize_response(data: dict) -> dict:
    """Normalize a deeply nested LLM response into the flat structure the output model expects."""
    # If the response already has top-level brand_name + colors list, it's already flat
    if data.get("brand_name") and isinstance(data.get("colors"), list) and len(data.get("colors", [])) > 0:
        return data

    flat: Dict[str, Any] = {}

    # ── Brand Name ──
    flat["brand_name"] = _deep_get(
        data, "brand_name",
        "brand_identity.name", "brand_identity.brand_name",
        "brand_strategy_document.brand_name",
    )

    # ── Tagline ──
    flat["tagline_idea"] = _deep_get(
        data, "tagline_idea", "tagline",
        "brand_identity.tagline", "brand_identity.tagline_idea",
    ) or ""

    # ── Personality & Mood ──
    voice_attrs = _deep_get(data, "brand_messaging.voice_attributes", default=[])
    flat["brand_personality"] = _deep_get(
        data, "brand_personality",
        "brand_identity.brand_personality",
    ) or (", ".join(voice_attrs) if voice_attrs else "")
    flat["mood"] = _deep_get(data, "mood", "brand_identity.mood") or ""

    # ── Visual Style & Imagery ──
    flat["visual_style"] = _deep_get(
        data, "visual_style",
        "visual_identity.visual_style", "visual_identity.design_principles",
    ) or ""
    flat["imagery_direction"] = _deep_get(
        data, "imagery_direction",
        "visual_identity.imagery_style", "visual_identity.imagery_direction",
        "visual_identity.photography_style",
    ) or ""

    # ── Colors ──
    raw_colors = _deep_get(data, "colors", default=[])
    if isinstance(raw_colors, list) and len(raw_colors) > 0:
        flat["colors"] = raw_colors
    else:
        # Try to parse from markdown table
        color_text = _deep_get(data, "visual_identity.color_palette", "visual_identity.colors", default="")
        if isinstance(color_text, str) and '#' in color_text:
            flat["colors"] = _parse_colors_from_table(color_text)
        elif isinstance(color_text, list):
            flat["colors"] = color_text
        else:
            flat["colors"] = []

    # ── Fonts ──
    raw_fonts = _deep_get(data, "fonts", default=None)
    if isinstance(raw_fonts, dict) and raw_fonts.get("heading"):
        flat["fonts"] = raw_fonts
    else:
        typo_text = _deep_get(data, "visual_identity.typography", default="")
        if isinstance(typo_text, str) and typo_text:
            parsed = _parse_fonts_from_text(typo_text)
            flat["fonts"] = parsed
        else:
            flat["fonts"] = None

    # ── Values ──
    raw_values = _deep_get(data, "values", "brand_identity.core_values", default=[])
    if isinstance(raw_values, list) and len(raw_values) > 0:
        if isinstance(raw_values[0], dict):
            flat["values"] = [v.get("value", v.get("name", str(v))) for v in raw_values]
        else:
            flat["values"] = raw_values
    else:
        flat["values"] = []

    # ── DOs & DON'Ts ──
    flat["dos"] = _deep_get(data, "dos", "brand_guidelines.dos", default=[])
    flat["donts"] = _deep_get(data, "donts", "brand_guidelines.donts", default=[])

    # ── Title ──
    flat["title"] = _deep_get(data, "title", default=f"Brand Identity: {flat.get('brand_name', 'Results')}")

    # ── Sections — build from nested content ──
    sections = _deep_get(data, "sections", default=[])
    if not sections:
        sections = []
        # Build sections from various nested keys
        bi = data.get("brand_identity", {})
        if isinstance(bi, dict):
            mission = bi.get("mission_statement", "")
            vision = bi.get("vision_statement", "")
            if mission or vision:
                content_parts = []
                if mission:
                    content_parts.append(f"**Mission:** {mission}")
                if vision:
                    content_parts.append(f"**Vision:** {vision}")
                sections.append({"heading": "Mission & Vision", "content": "\n\n".join(content_parts)})

        bp = data.get("brand_positioning", {})
        if isinstance(bp, dict):
            usp = bp.get("unique_selling_proposition", "")
            market = bp.get("market_analysis", "")
            if usp:
                sections.append({"heading": "Unique Selling Proposition", "content": usp})
            target = bp.get("target_audience", "")
            if target:
                sections.append({"heading": "Target Audience", "content": target})
            if market:
                sections.append({"heading": "Market Analysis", "content": market})
            comp = bp.get("competitive_landscape", "")
            if comp:
                sections.append({"heading": "Competitive Landscape", "content": comp})

        bm = data.get("brand_messaging", {})
        if isinstance(bm, dict):
            tone = bm.get("tone_guidelines", "")
            if tone:
                sections.append({"heading": "Tone & Voice Guidelines", "content": tone})
            pillars = bm.get("messaging_pillars", [])
            if pillars:
                pillar_parts = []
                for p in pillars:
                    if isinstance(p, dict):
                        pname = p.get("pillar", p.get("name", ""))
                        pdesc = p.get("description", "")
                        keywords = p.get("keywords", [])
                        pillar_parts.append(f"**{pname}:** {pdesc}")
                        if keywords:
                            pillar_parts.append(f"*Keywords: {', '.join(keywords)}*")
                    else:
                        pillar_parts.append(str(p))
                sections.append({"heading": "Messaging Pillars", "content": "\n\n".join(pillar_parts)})

        vi = data.get("visual_identity", {})
        if isinstance(vi, dict):
            imagery = vi.get("imagery_style", "")
            if imagery:
                sections.append({"heading": "Imagery & Photography", "content": imagery})

        ml = data.get("marketing_and_launch", data.get("marketing_launch", {}))
        if isinstance(ml, dict):
            channels = ml.get("key_channels", [])
            if channels:
                ch_content = "\n".join(f"- {c}" for c in channels if isinstance(c, str))
                sections.append({"heading": "Key Marketing Channels", "content": ch_content})
            launch = ml.get("launch_plan_summary", ml.get("launch_plan", ""))
            if launch:
                sections.append({"heading": "Launch Plan", "content": launch})

    flat["sections"] = sections

    # ── Recommendations & Action Items ──
    flat["recommendations"] = _deep_get(data, "recommendations", default=[])
    flat["action_items"] = _deep_get(data, "action_items", default=[])

    return flat


class BrandIdentityAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: BrandIdentityInput, context_str: str) -> BrandIdentityOutput:
        """Creates a complete brand identity — colors, fonts, mood, visual style, values, and brand guidelines."""

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are a brand strategist. Return JSON. Respond with high-fidelity markdown formatting including tables and lists.",
            default_user="", # Will be loaded from YAML
            variables={
                "business_name": input_data.business_name or "(suggest one)",
                "business_description": input_data.business_description,
                "industry": input_data.industry,
                "target_audience": input_data.target_audience or "(not specified)",
                "values": ", ".join(input_data.values),
                "style_preferences": ", ".join(input_data.style_preferences),
                "color_preferences": ", ".join(input_data.color_preferences),
                "brand_site_url": input_data.brand_site_url or "N/A",
                "competitor_urls": ", ".join(input_data.competitor_urls) if input_data.competitor_urls else "N/A",

                "context_str": context_str
            }
        )

        target_lang = input_data.target_language or "English"
        max_tok = 8000 if target_lang.lower() != "english" else 4096

        response = await self.gemini.generate_text(
            prompt=prompt_config["user"],
            system_prompt=prompt_config["system"],
            model_tier="pro",
            max_output_tokens=max_tok
        )

        raw_data = safe_json_parse(response)

        # Simple retry if truncated
        if raw_data is None:
            response = await self.gemini.generate_text(
                prompt="The previous JSON was truncated. Regenerate ONLY valid JSON, keeping text concise.\n" + prompt_config["user"],
                system_prompt="You are a brand strategist. Return JSON.",
                model_tier="pro",
                max_output_tokens=max_tok
            )
            raw_data = safe_json_parse(response)

        try:
            if raw_data is None:
                raise ValueError("JSON parse failed")

            # Normalize nested LLM responses into flat structure
            data = _normalize_response(raw_data)

            colors_raw = data.get("colors", [])
            colors = []
            for c in colors_raw:
                try:
                    colors.append(ColorSwatch(**c) if isinstance(c, dict) else c)
                except Exception:
                    pass

            fonts_data = data.get("fonts")
            fonts = None
            if isinstance(fonts_data, dict) and fonts_data.get("heading"):
                try:
                    fonts = FontPair(**fonts_data)
                except Exception:
                    pass

            brand_name = data.get("brand_name") or input_data.business_name
            values = data.get("values", [])
            sections = data.get("sections", [])

            # ── Build markdown from structured data ──
            md_parts = [f"# {brand_name or 'Brand Identity'}"]
            tagline = data.get("tagline_idea", "")
            if tagline:
                md_parts.append(f'\n> *"{tagline}"*')

            if data.get("brand_personality") or data.get("mood"):
                md_parts.append("\n---\n\n## Brand Essence")
                if data.get("brand_personality"):
                    md_parts.append(f"\n**Personality:** {data['brand_personality']}")
                if data.get("mood"):
                    md_parts.append(f"\n**Mood:** {data['mood']}")

            if data.get("visual_style") or data.get("imagery_direction"):
                md_parts.append("\n---\n\n## Visual Direction")
                if data.get("visual_style"):
                    md_parts.append(f"\n**Visual Style:** {data['visual_style']}")
                if data.get("imagery_direction"):
                    md_parts.append(f"\n**Imagery Direction:** {data['imagery_direction']}")

            if colors:
                md_parts.append("\n---\n\n## Color Palette\n")
                md_parts.append("| Color | Hex | Usage |")
                md_parts.append("|-------|-----|-------|")
                for c in colors:
                    cs = c if isinstance(c, ColorSwatch) else ColorSwatch(**c)
                    md_parts.append(f"| {cs.name} | `{cs.hex}` | {cs.usage} |")

            if fonts:
                md_parts.append(f"\n---\n\n## Typography\n")
                md_parts.append(f"**Heading Font:** {fonts.heading} (weight: {fonts.heading_weight})")
                md_parts.append(f"\n**Body Font:** {fonts.body} (weight: {fonts.body_weight})")

            if values:
                md_parts.append("\n---\n\n## Brand Values\n")
                for v in values:
                    md_parts.append(f"- {v}")

            dos = data.get("dos", [])
            donts = data.get("donts", [])
            if dos or donts:
                md_parts.append("\n---\n\n## Brand Guidelines")
                if dos:
                    md_parts.append("\n### Do")
                    for item in dos:
                        md_parts.append(f"- {item}")
                if donts:
                    md_parts.append("\n### Don't")
                    for item in donts:
                        md_parts.append(f"- {item}")

            for s in sections:
                if isinstance(s, dict) and s.get("heading"):
                    md_parts.append(f"\n---\n\n## {s['heading']}\n\n{s.get('content', '')}")

            recs = data.get("recommendations", [])
            if recs:
                md_parts.append("\n---\n\n## Recommendations\n")
                for r in recs:
                    md_parts.append(f"- {r}")

            actions = data.get("action_items", [])
            if actions:
                md_parts.append("\n---\n\n## Action Items\n")
                for a in actions:
                    md_parts.append(f"- {a}")

            text_summary = "\n".join(md_parts)

            context_updates = {
                "brand_name": brand_name,
                "industry": input_data.industry,
                "colors": [c.model_dump() if isinstance(c, ColorSwatch) else c for c in colors],
                "fonts": fonts.model_dump() if fonts else None,
                "visual_style": data.get("visual_style"),
                "mood": data.get("mood"),
                "values": values,
                "brand_personality": data.get("brand_personality"),
                "tagline_idea": tagline,
                # Align with WorkspaceContext keys (frontend/backends may use either)
                "tagline": tagline,
                "imagery_direction": data.get("imagery_direction", ""),
                "dos": data.get("dos", []),
                "donts": data.get("donts", []),
            }

            return BrandIdentityOutput(
                agent_id=input_data.agent_id,
                success=True,
                title=data.get("title", f"Brand Identity: {brand_name or 'Results'}"),
                sections=sections,
                recommendations=recs,
                action_items=actions,
                brand_name=brand_name,
                tagline_idea=tagline,
                brand_personality=data.get("brand_personality", ""),
                mood=data.get("mood", ""),
                visual_style=data.get("visual_style", ""),
                imagery_direction=data.get("imagery_direction", ""),
                colors=colors,
                fonts=fonts,
                values=values,
                dos=dos,
                donts=donts,
                text_content=text_summary,
                context_updates=context_updates,
            )
        except Exception as e:
            logger.exception("Brand identity processing failed: %s", e)
            return BrandIdentityOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=response,
                colors=[],
                fonts=None,
                values=[],
                dos=[],
                donts=[]
            )
