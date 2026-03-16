import json
from pydantic import BaseModel, Field
from typing import List

from app.agents.base import BaseV4Agent
from app.agents.content_models import AdCopyInput, AdCopyOutput
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

class AdCopywriterAgent(BaseV4Agent):
    """Agent for generating Ad Copy using the V4 architecture."""
    
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: AdCopyInput, context_str: str) -> AdCopyOutput:
        
        # Determine platform from agent_id
        platform_map = {
            "meta_ads": "Facebook/Instagram",
            "google_search_ads": "Google Search",
            "google_display_ads": "Google Display network",
            "linkedin_lead_gen": "LinkedIn",
            "pinterest_ads": "Pinterest",
            "tiktok_ads": "TikTok",
            "youtube_ads": "YouTube",
            "amazon_ppc": "Amazon",
            # Legacy aliases
            "meta_ad_copy": "Facebook/Instagram",
            "google_search_ad": "Google Search",
            "display_ad_copy": "Google Display network",
            "linkedin_ad_copy": "LinkedIn",
            "twitter_ad_copy": "Twitter/X",
            "tiktok_ad_script": "TikTok",
            "pinterest_ad": "Pinterest",
            "youtube_ad_copy": "YouTube"
        }
        platform = platform_map.get(input_data.agent_id, "Digital Advertising Platforms")

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are an elite direct-response ad copywriter. Output pure, valid JSON exactly matching the requested format.",
            default_user="", # Will be loaded from YAML
            variables={
                "platform": platform,
                "product_name": input_data.product_name,
                "offer": input_data.offer,
                "benefit_focus": input_data.benefit_focus,
                "tone": input_data.tone_override or "Persuasive",
                "target_audience": input_data.target_audience or "N/A",
                "cta": input_data.cta or "N/A",
                "keyword_theme": ", ".join(input_data.keyword_theme) if isinstance(input_data.keyword_theme, list) and input_data.keyword_theme else (input_data.keyword_theme or "N/A"),
                "image_angle": input_data.image_angle or "N/A",
                "lead_asset": input_data.lead_asset or "N/A",
                "destination_url": input_data.destination_url or "N/A",
                "creator_style": input_data.creator_style or "Individual",
                "video_hook": input_data.video_hook or "N/A",
                "target_keywords": ", ".join(input_data.target_keywords) if input_data.target_keywords else "N/A",
                "context_str": context_str
            }
        )

        response_text = await self.gemini.generate_text(
            prompt=prompt_config["user"],
            system_prompt=prompt_config["system"],
            model_tier="pro"
        )
        
        try:
            data = safe_json_parse(response_text)
            if data is None:
                raise ValueError("Failed to parse JSON")
                
            variations = data.get("variations", [])
            
            parts = []
            for i, v in enumerate(variations):
                parts.append(f"Variant {i+1}")
                parts.append(f"Headline: {v.get('headline', '')}")
                parts.append(f"Body: {v.get('body', '')}")
                parts.append(f"CTA: {v.get('cta', '')}")
            content = "\n\n".join(parts)
            
            assets = await self.generate_media_if_requested(input_data, content[:500])
            
            return AdCopyOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=content,
                assets=assets,
                variations=variations
            )
            
        except Exception as e:
            return AdCopyOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=response_text,
                variations=[{"headline": "Generated Copy", "body": response_text, "cta": ""}]
            )
