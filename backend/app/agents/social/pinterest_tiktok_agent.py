from typing import Any
from app.agents.base import BaseV4Agent
from app.agents.social_models import PinterestTikTokInput, PinterestTikTokOutput, SocialPost
from app.agents.social.post_utils import ensure_list, normalize_social_post
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

class PinterestTikTokAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: Any, context_str: str) -> Any:
        """Generates Pinterest or TikTok specific content."""

        is_tiktok = "tiktok" in input_data.agent_id
        platform_name = "TikTok" if is_tiktok else "Pinterest"
        aspect_note = "9:16 vertical/portrait format" if (is_tiktok or platform_name == "Pinterest") else "16:9 landscape"

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system=f"You are a viral growth expert specializing in {platform_name} content strategy.",
            default_user="", # Will be loaded from YAML
            variables={
                "agent_id": input_data.agent_id,
                "agent_id_alias": input_data.agent_id.replace("_", " "),
                "topic": input_data.topic,
                "visual_theme": input_data.visual_theme or "Trendy",
                "tone": input_data.tone_override or "Engaging",
                "aspect_note": aspect_note,
                "pin_title": input_data.pin_title or "TBD",
                "destination_url": input_data.destination_url or "N/A",
                "duration_seconds": input_data.duration_seconds,
                "creator_style": input_data.creator_style or "Individual",
                "audio_reference": input_data.audio_reference or "None",
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

            trends = ensure_list(data.get("trends") or data.get("trending_elements"))
            adaptations = ensure_list(data.get("adaptations") or data.get("adaptation_suggestions"))
            if input_data.agent_id == "tiktok_trend":
                ideas = ensure_list(data.get("content_ideas"))
                if ideas:
                    trends = []
                    adaptations = []
                    generated_posts = []
                    for idx, idea in enumerate(ideas):
                        if isinstance(idea, dict):
                            idea_name = (idea.get("idea_name") or f"Idea {idx + 1}").strip()
                            visual_hook = str(idea.get("visual_hook") or "").strip()
                            audio = str(idea.get("audio_suggestion") or "").strip()
                            outline = str(idea.get("script_outline") or "").strip()
                            trends.append({
                                "name": idea_name,
                                "description": outline or visual_hook or audio,
                                "category": "trend idea",
                                "potential": audio,
                            })
                            adaptations.append({
                                "title": idea_name,
                                "suggestion": " | ".join([x for x in [visual_hook, audio, outline] if x]),
                            })
                            generated_posts.append({
                                "platform": "TikTok",
                                "caption": "\n".join([x for x in [f"{idea_name}", outline, visual_hook] if x]).strip(),
                                "hashtags": ensure_list(data.get("hashtags")),
                            })
                        elif idea is not None:
                            text = str(idea).strip()
                            if text:
                                trends.append({"name": text, "description": text})
                                generated_posts.append({"platform": "TikTok", "caption": text})

                    if not posts_data and generated_posts:
                        posts_data = generated_posts

            posts = [
                SocialPost(**normalize_social_post(p, platform_name), post_index=i)
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

            return PinterestTikTokOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=caption,
                assets=all_assets,
                post=posts[0] if posts else SocialPost(platform=platform_name, caption=response),
                posts=posts,
                trends=trends,
                adaptations=adaptations,
                trend_analysis=data.get("trend_analysis"),
            )
        except Exception as e:
            return PinterestTikTokOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=response,
                post=SocialPost(platform=platform_name, caption=response),
                posts=[SocialPost(platform=platform_name, caption=response)]
            )
