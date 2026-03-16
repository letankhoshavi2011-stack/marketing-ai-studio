import json
from typing import Dict, Any, List
from app.agents.base import BaseV4Agent
from app.agents.content_models import SEOInput, SEOOutput
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse


class SEOAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    @staticmethod
    def _as_list(value: Any) -> List[Any]:
        if value is None:
            return []
        if isinstance(value, list):
            return value
        return [value]

    @staticmethod
    def _format_item(item: Any) -> str:
        if isinstance(item, str):
            return item
        if isinstance(item, dict):
            if item.get("issue") and item.get("fix_recommendation"):
                impact = item.get("impact")
                impact_str = f" ({impact})" if impact else ""
                return f"{item['issue']}{impact_str}: {item['fix_recommendation']}"
            if item.get("level") and item.get("text"):
                return f"{item['level']}: {item['text']}"
            if item.get("question") and item.get("answer"):
                return f"Q: {item['question']} | A: {item['answer']}"
            if item.get("keyword"):
                return str(item.get("keyword"))
        return str(item)

    def _normalize_output(self, agent_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        normalized = dict(data)

        for key in [
            "recommendations",
            "technical_fixes",
            "suggested_keywords",
            "internal_links",
            "heading_structure",
            "schema_markup_suggestions",
            "faq_list",
            "entity_targets",
        ]:
            if key in normalized:
                normalized[key] = self._as_list(normalized.get(key))

        if "score" in normalized:
            try:
                normalized["score"] = int(float(normalized["score"]))
            except Exception:
                normalized.pop("score", None)

        if agent_id == "on_page_seo":
            if not normalized.get("recommendations"):
                normalized["recommendations"] = self._as_list(normalized.get("internal_links"))

        elif agent_id == "technical_seo":
            if not normalized.get("recommendations"):
                normalized["recommendations"] = self._as_list(normalized.get("schema_markup_suggestions"))

        elif agent_id == "aeo_optimizer":
            if not normalized.get("recommendations"):
                recs: List[str] = []
                if normalized.get("aeo_strategy"):
                    recs.append(str(normalized["aeo_strategy"]))
                recs.extend([self._format_item(x) for x in self._as_list(normalized.get("faq_list"))])
                normalized["recommendations"] = recs
            if not normalized.get("suggested_keywords"):
                normalized["suggested_keywords"] = self._as_list(normalized.get("entity_targets"))

        if not normalized.get("suggested_keywords") and normalized.get("keyword_opportunities"):
            normalized["suggested_keywords"] = self._as_list(normalized.get("keyword_opportunities"))

        return normalized

    def _build_text_content(self, data: Dict[str, Any]) -> str:
        parts: List[str] = []

        score = data.get("score")
        if isinstance(score, (int, float)):
            parts.append(f"SEO Analysis Score: {int(score)}/100")

        if data.get("title_tag"):
            parts.append(f"### Title Tag\n{data['title_tag']}")

        if data.get("meta_description"):
            parts.append(f"### Meta Description\n{data['meta_description']}")

        heading_structure = self._as_list(data.get("heading_structure"))
        if heading_structure:
            lines = [f"- {self._format_item(item)}" for item in heading_structure]
            parts.append("### Heading Structure\n" + "\n".join(lines))

        internal_links = self._as_list(data.get("internal_links"))
        if internal_links:
            lines = [f"- {self._format_item(item)}" for item in internal_links]
            parts.append("### Internal Links\n" + "\n".join(lines))

        recommendations = self._as_list(data.get("recommendations"))
        if recommendations:
            lines = [f"- {self._format_item(item)}" for item in recommendations]
            parts.append("### Recommendations\n" + "\n".join(lines))

        technical_fixes = self._as_list(data.get("technical_fixes"))
        if technical_fixes:
            lines = [f"- {self._format_item(item)}" for item in technical_fixes]
            parts.append("### Technical Fixes\n" + "\n".join(lines))

        suggested_keywords = self._as_list(data.get("suggested_keywords"))
        if suggested_keywords:
            lines = [f"- {self._format_item(item)}" for item in suggested_keywords]
            parts.append("### Suggested Keywords\n" + "\n".join(lines))

        schema_suggestions = self._as_list(data.get("schema_markup_suggestions"))
        if schema_suggestions:
            lines = [f"- {self._format_item(item)}" for item in schema_suggestions]
            parts.append("### Schema Suggestions\n" + "\n".join(lines))

        faq_list = self._as_list(data.get("faq_list"))
        if faq_list:
            lines = [f"- {self._format_item(item)}" for item in faq_list]
            parts.append("### FAQ List\n" + "\n".join(lines))

        entity_targets = self._as_list(data.get("entity_targets"))
        if entity_targets:
            lines = [f"- {self._format_item(item)}" for item in entity_targets]
            parts.append("### Entity Targets\n" + "\n".join(lines))

        if data.get("aeo_strategy"):
            parts.append(f"### AEO Strategy\n{data['aeo_strategy']}")

        if not parts:
            return json.dumps(data, ensure_ascii=False, indent=2)
        return "\n\n".join(parts)

    async def _execute_internal(self, input_data: SEOInput, context_str: str) -> SEOOutput:
        """Handles SEO and AEO (AI Engine Optimization) tasks."""

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are an expert in search engine algorithms and AI retrieval patterns.",
            default_user="", # Will be loaded from YAML
            variables={
                "agent_id": input_data.agent_id,
                "topic": ", ".join(input_data.target_keywords) or input_data.site_url or input_data.url_to_analyze or "N/A",
                "site_url": input_data.site_url or input_data.url_to_analyze or "N/A",
                "target_keywords": ", ".join(input_data.target_keywords),
                "search_intent": input_data.search_intent,
                "target_audience": input_data.target_audience or "General Searchers",
                "region": input_data.region or "Global",
                "language": input_data.target_language,
                "seed_keywords": ", ".join(input_data.seed_keywords) if input_data.seed_keywords else "N/A",
                "competitor_urls": ", ".join(input_data.competitor_urls) if input_data.competitor_urls else "N/A",
                "page_title": input_data.page_title or "N/A",
                "page_content": input_data.page_content or "N/A",
                "meta_description": input_data.meta_description or "N/A",
                "sitemap_url": input_data.sitemap_url or "N/A",
                "robots_txt_url": input_data.robots_txt_url or "N/A",
                "crawl_export": input_data.crawl_export or "N/A",
                "faq_content": input_data.faq_content or "N/A",
                "entity_targets": ", ".join(input_data.entity_targets) if input_data.entity_targets else "N/A",
                "answer_questions": ", ".join(input_data.answer_questions) if input_data.answer_questions else "N/A",
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
            if not isinstance(data, dict):
                raise ValueError("Failed to parse JSON")
            
            content_flat = f"SEO Analysis Score: {data.get('score', 0)}/100\n\n"
                
            if data.get('recommendations'):
                content_flat += "### Recommendations\n" + "\n".join([f"- {r}" for r in data['recommendations']]) + "\n\n"
            
            if data.get('technical_fixes'):
                content_flat += "### Technical Fixes\n" + "\n".join([f"- {f}" for f in data['technical_fixes']]) + "\n\n"
            
            if data.get('suggested_keywords'):
                content_flat += "### Suggested Keywords\n" + ", ".join(data['suggested_keywords']) + "\n"

            normalized = self._normalize_output(input_data.agent_id, data)
            content_flat = self._build_text_content(normalized)
            assets = await self.generate_media_if_requested(input_data, content_flat[:500])

            return SEOOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=content_flat,
                structured_data=normalized,
                assets=assets,
                **normalized
            )
        except Exception:
            return SEOOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=response,
                structured_data={"raw_response": response},
            )
