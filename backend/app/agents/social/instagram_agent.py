from typing import Dict, Any, List
from app.agents.base import BaseV4Agent
from app.agents.social_models import InstagramAgentInput, InstagramAgentOutput, SocialPost
from app.agents.social.post_utils import ensure_list, normalize_hashtags, normalize_social_post
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

class InstagramAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: InstagramAgentInput, context_str: str) -> InstagramAgentOutput:
        """Generates Instagram specific content."""

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are a social media growth hacker specializing in Instagram.",
            default_user="", # Will be loaded from YAML if empty
            variables={
                "agent_id_alias": input_data.agent_id.replace('_', ' '),
                "topic": input_data.topic,
                "visual_theme": input_data.visual_theme or "Standard Instagram Aesthetic",
                "tone": input_data.tone_override or "Engaging & Lifestyle-oriented",
                "keywords": ", ".join(input_data.keywords),
                "audience": input_data.brief_target_persona or "General Audience",
                "format": input_data.format or "Standard Post",
                "hook_style": input_data.hook_style or "Engaging",
                "slide_count": input_data.slide_count,
                "frame_count": input_data.frame_count,
                "sticker_cta": input_data.sticker_cta or "None",
                "story_sequence": input_data.story_sequence or "None",
                "shot_list": ", ".join(input_data.shot_list) if input_data.shot_list else "Standard",
                "audio_reference": input_data.audio_reference or "None",
                "duration_seconds": input_data.duration_seconds,
                "slide_goal": input_data.slide_goal or "Engagement",
                "final_slide_cta": input_data.final_slide_cta or "Standard",
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

            # Build SocialPost list from response
            posts_data = data.get("posts", [])
            # Backwards compat: if LLM returned single "post" instead of "posts"
            if not posts_data and data.get("post"):
                posts_data = [data["post"]]
            if isinstance(posts_data, dict):
                posts_data = [posts_data]
            if not isinstance(posts_data, list):
                posts_data = []

            bios = [str(b).strip() for b in ensure_list(data.get("bios")) if str(b).strip()]
            if not posts_data and bios:
                recommended_hashtags = normalize_hashtags(data.get("recommended_hashtags"))
                posts_data = [
                    {
                        "platform": "Instagram",
                        "caption": bio,
                        "hashtags": recommended_hashtags,
                        "image_prompts": [],
                        "video_prompts": [],
                    }
                    for bio in bios
                ]

            posts = [
                SocialPost(**normalize_social_post(p, "Instagram"), post_index=i)
                for i, p in enumerate(posts_data)
            ]

            # Auto-generate media (respects user preferences)
            posts = await self.auto_generate_social_media(
                posts,
                generate_images=getattr(input_data, "generate_image", True),
                generate_video=getattr(input_data, "generate_video", True),
                images_per_post=min(getattr(input_data, "image_count", 2), 3),
            )

            # Flatten all assets for top-level backwards compat
            all_assets = []
            for p in posts:
                all_assets.extend(p.assets)

            caption = posts[0].caption if posts else response
            alternate_captions = data.get("alternate_captions", [])
            if bios and not alternate_captions:
                alternate_captions = bios[1:]

            return InstagramAgentOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=caption,
                assets=all_assets,
                post=posts[0] if posts else SocialPost(platform="Instagram", caption=response),
                posts=posts,
                alternate_captions=alternate_captions
            )
        except Exception as e:
            # Fallback
            return InstagramAgentOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=response,
                post=SocialPost(platform="Instagram", caption=response),
                posts=[SocialPost(platform="Instagram", caption=response)]
            )
