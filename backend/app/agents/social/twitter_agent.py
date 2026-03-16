from typing import Dict, Any, List
from app.agents.base import BaseV4Agent
from app.agents.social_models import TwitterAgentInput, TwitterAgentOutput, SocialPost
from app.agents.social.post_utils import normalize_social_post
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

class TwitterAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: TwitterAgentInput, context_str: str) -> TwitterAgentOutput:
        """Generates Twitter/X specific content."""

        is_thread = input_data.agent_id == "twitter_thread"
        requested_thread_length = input_data.thread_length or (5 if is_thread else 1)
        default_format = "Thread" if is_thread else "Single Tweet"

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are a viral marketing expert specializing in Twitter/X engagement.",
            default_user="", # Will be loaded from YAML
            variables={
                "agent_id": input_data.agent_id,
                "agent_id_alias": "X/Twitter",
                "topic": input_data.topic,
                "thread_length": requested_thread_length,
                "tone": input_data.tone_override or "Punchy & Engaging",
                "format": input_data.format or default_format,
                "reply_goal": input_data.reply_goal or "Engagement",
                "persona_mode": input_data.persona_mode or "Professional",
                "thread_goal": input_data.thread_goal or "Education",
                "thread_outline": input_data.thread_outline or "Standard",
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

            tweets = data.get("tweets", [])
            if isinstance(tweets, str):
                tweets = [tweets]
            if not isinstance(tweets, list):
                tweets = []
            tweets = [str(t).strip() for t in tweets if str(t).strip()]

            if is_thread and requested_thread_length > 0:
                tweets = tweets[:requested_thread_length]

            # Build posts from explicit posts array or convert tweets
            posts_data = data.get("posts", [])
            if isinstance(posts_data, dict):
                posts_data = [posts_data]
            if not isinstance(posts_data, list):
                posts_data = []

            shared_image_prompts = data.get("image_prompts", [])
            if isinstance(shared_image_prompts, str):
                shared_image_prompts = [shared_image_prompts]
            if not isinstance(shared_image_prompts, list):
                shared_image_prompts = []
            shared_image_prompts = [str(p).strip() for p in shared_image_prompts if str(p).strip()]

            if is_thread and requested_thread_length > 0:
                posts_data = posts_data[:requested_thread_length]

            if posts_data and shared_image_prompts:
                first_post = posts_data[0] if isinstance(posts_data[0], dict) else {}
                first_post_prompts = first_post.get("image_prompts", [])
                if not first_post_prompts:
                    first_post["image_prompts"] = shared_image_prompts[:]
                    posts_data[0] = first_post

            if not posts_data:
                # Convert flat tweets to SocialPost format
                posts_data = [
                    {
                        "platform": "Twitter",
                        "caption": tweet,
                        "image_prompts": shared_image_prompts[:] if i == 0 else [],
                        "video_prompts": [],
                        "hashtags": [],
                        "posting_time_suggestion": "Morning",
                    }
                    for i, tweet in enumerate(tweets)
                ]

            posts = []
            for i, raw_post in enumerate(posts_data):
                fallback_caption = tweets[i] if i < len(tweets) else ""
                posts.append(
                    SocialPost(
                        **normalize_social_post(raw_post, "Twitter", fallback_caption=fallback_caption),
                        post_index=i,
                    )
                )

            if not tweets and posts:
                tweets = [p.caption for p in posts if p.caption]
                if is_thread and requested_thread_length > 0:
                    tweets = tweets[:requested_thread_length]

            content = "\n\n".join(tweets) if tweets else response

            # Generate media for posts (respects user preferences)
            posts = await self.auto_generate_social_media(
                posts,
                generate_images=getattr(input_data, "generate_image", True),
                generate_video=getattr(input_data, "generate_video", True),
                images_per_post=min(getattr(input_data, "image_count", 2), 3),
            )

            all_assets = []
            for p in posts:
                all_assets.extend(p.assets)

            return TwitterAgentOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=content,
                assets=all_assets,
                tweets=tweets,
                thread_indices=data.get("thread_indices", []),
                post=posts[0] if posts else None,
                posts=posts,
            )
        except Exception as e:
            fallback_post = SocialPost(platform="Twitter", caption=response)
            return TwitterAgentOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=response,
                tweets=[response],
                post=fallback_post,
                posts=[fallback_post],
            )
