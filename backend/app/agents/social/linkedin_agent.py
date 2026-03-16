from typing import Dict, Any, List, Optional
from app.agents.base import BaseV4Agent
from app.agents.social_models import LinkedInAgentInput, LinkedInAgentOutput, SocialPost
from app.agents.social.post_utils import ensure_list, normalize_social_post
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

class LinkedInAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: LinkedInAgentInput, context_str: str) -> LinkedInAgentOutput:
        """Generates LinkedIn specific content."""

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are a professional brand strategist specializing in B2B marketing and LinkedIn networking.",
            default_user="", # Will be loaded from YAML
            variables={
                "agent_id": input_data.agent_id,
                "agent_id_alias": input_data.agent_id.replace("_", " "),
                "topic": input_data.topic,
                "tone": input_data.professional_tone,
                "goal": input_data.brief_primary_goal or "lead generation",
                "audience": input_data.brief_target_persona or "B2B decision-makers",
                "content_format": input_data.content_format or "Standard Post",
                "outline_depth": input_data.outline_depth or "Moderate",
                "section_count": input_data.section_count,
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

            if not posts_data:
                article_content = data.get("article_content") or data.get("full_article_content")
                if article_content:
                    posts_data = [{
                        "platform": "LinkedIn",
                        "caption": article_content,
                        "image_prompts": ensure_list(data.get("image_prompts")),
                        "video_prompts": [],
                        "hashtags": ensure_list(data.get("hashtags")),
                    }]

            posts = [
                SocialPost(**normalize_social_post(p, "LinkedIn"), post_index=i)
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

            article_content = data.get("article_content") or data.get("full_article_content")
            caption = article_content or (posts[0].caption if posts else response)

            return LinkedInAgentOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=caption,
                assets=all_assets,
                post=posts[0] if posts else SocialPost(platform="LinkedIn", caption=response),
                posts=posts,
                article_content=article_content
            )
        except Exception as e:
            return LinkedInAgentOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=response,
                post=SocialPost(platform="LinkedIn", caption=response),
                posts=[SocialPost(platform="LinkedIn", caption=response)]
            )
