from typing import Dict, Any, List
from app.agents.base import BaseV4Agent
from app.agents.social_models import FacebookAgentInput, FacebookAgentOutput, SocialPost
from app.agents.social.post_utils import normalize_social_post
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

class FacebookAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: FacebookAgentInput, context_str: str) -> FacebookAgentOutput:
        """Generates Facebook specific content."""

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are a social media strategist specializing in Facebook community building and advertising.",
            default_user="", # Will be loaded from YAML
            variables={
                "agent_id_alias": input_data.agent_id.replace('_', ' '),
                "topic": input_data.topic,
                "goal": input_data.goal,
                "tone": input_data.tone_override or "Community-focused & Friendly",
                "include_link": "Yes" if input_data.include_link else "No",
                "audience_segment": input_data.audience_segment or "General",
                "campaign_stage": input_data.campaign_stage or "Awareness",
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

            posts_data = data.get("posts", [])
            if not posts_data and data.get("post"):
                posts_data = [data["post"]]
            if isinstance(posts_data, dict):
                posts_data = [posts_data]
            if not isinstance(posts_data, list):
                posts_data = []

            posts = [
                SocialPost(**normalize_social_post(p, "Facebook"), post_index=i)
                for i, p in enumerate(posts_data)
            ]

            posts = await self.auto_generate_social_media(
                posts,
                generate_images=getattr(input_data, "generate_image", True),
                generate_video=getattr(input_data, "generate_video", True),
                images_per_post=min(getattr(input_data, "image_count", 2), 3),
            )

            all_assets = []
            for p in posts:
                all_assets.extend(p.assets)

            caption = posts[0].caption if posts else response

            return FacebookAgentOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=caption,
                assets=all_assets,
                post=posts[0] if posts else SocialPost(platform="Facebook", caption=response),
                posts=posts,
            )
        except Exception as e:
            return FacebookAgentOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=response,
                post=SocialPost(platform="Facebook", caption=response),
                posts=[SocialPost(platform="Facebook", caption=response)]
            )
