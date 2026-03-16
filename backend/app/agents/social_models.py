import json
import re
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.models.base import BaseAgentInput, BaseAgentOutput, GeneratedAsset

# --- CATEGORY 4: SOCIAL MEDIA ---

class SocialPost(BaseModel):
    model_config = ConfigDict(extra="allow")

    platform: str
    caption: str
    image_prompts: List[str] = []
    video_prompts: List[str] = []
    hashtags: List[str] = []
    posting_time_suggestion: str = "Morning"
    post_index: int = 0
    assets: List[GeneratedAsset] = []

# 4.1 Instagram (18-22)
class InstagramAgentInput(BaseAgentInput):
    agent_id: Literal["instagram_post", "instagram_story", "instagram_reel", "instagram_carousel", "instagram_bio"]
    topic: str
    visual_theme: Optional[str] = None
    tone_override: Optional[str] = None
    keywords: List[str] = []
    format: Optional[str] = None
    hook_style: Optional[str] = None
    slide_count: Optional[int] = None
    frame_count: Optional[int] = None
    sticker_cta: Optional[str] = None
    story_sequence: Optional[str] = None
    shot_list: Optional[List[str]] = None
    audio_reference: Optional[str] = None
    duration_seconds: Optional[int] = None
    slide_goal: Optional[str] = None
    final_slide_cta: Optional[str] = None

    @field_validator("shot_list", mode="before")
    @classmethod
    def normalize_shot_list(cls, value):
        if value is None:
            return None
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        if isinstance(value, str):
            raw = value.strip()
            if not raw:
                return []

            # Support JSON-list text coming from custom clients.
            if raw.startswith("[") and raw.endswith("]"):
                try:
                    parsed = json.loads(raw)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if str(item).strip()]
                except Exception:
                    pass

            # Support comma/newline/bullet-separated textarea input.
            tokens = [
                part.strip(" \t\r\n-*•")
                for part in re.split(r"[,\n;]+", raw)
            ]
            return [token for token in tokens if token]
        return value


class InstagramAgentOutput(BaseAgentOutput):
    post: Optional[SocialPost] = None
    posts: List[SocialPost] = []
    alternate_captions: List[str] = []

# 4.2 Facebook (23-26)
class FacebookAgentInput(BaseAgentInput):
    agent_id: Literal["facebook_post", "facebook_ad_copy"]
    topic: str
    goal: str = "engagement"                # "engagement", "traffic", "leads"
    tone_override: Optional[str] = None
    include_link: bool = False
    audience_segment: Optional[str] = None
    campaign_stage: Optional[str] = None


class FacebookAgentOutput(BaseAgentOutput):
    post: Optional[SocialPost] = None
    posts: List[SocialPost] = []

# 4.3 LinkedIn (27-30)
class LinkedInAgentInput(BaseAgentInput):
    agent_id: Literal["linkedin_post", "linkedin_article", "linkedin_ad"]
    topic: str
    professional_tone: str = "expert"        # "expert", "thought_leader", "conversational"
    content_format: Optional[str] = None
    outline_depth: Optional[str] = None
    section_count: Optional[int] = None


class LinkedInAgentOutput(BaseAgentOutput):
    post: Optional[SocialPost] = None
    posts: List[SocialPost] = []
    article_content: Optional[str] = None

# 4.4 Twitter/X (31-34)
class TwitterAgentInput(BaseAgentInput):
    agent_id: Literal["twitter_tweet", "twitter_thread", "twitter_ad", "twitter_bio"]
    topic: str
    tone_override: Optional[str] = None
    format: Optional[str] = None
    thread_length: Optional[int] = Field(default=None, ge=1, le=20)
    reply_goal: Optional[str] = None
    persona_mode: Optional[str] = None
    thread_goal: Optional[str] = None
    thread_outline: Optional[str] = None


class TwitterAgentOutput(BaseAgentOutput):
    tweets: List[str] = []
    thread_indices: List[int] = []
    post: Optional[SocialPost] = None
    posts: List[SocialPost] = []

# 4.5 Pinterest & TikTok (mapped from frontend)
class PinterestTikTokInput(BaseAgentInput):
    agent_id: Literal[
        "pinterest_pin", "pinterest_ad",
        "tiktok_script", "tiktok_trend", "tiktok_ad"
    ]
    topic: str
    visual_theme: Optional[str] = None
    tone_override: Optional[str] = None
    keywords: List[str] = []
    pin_title: Optional[str] = None
    destination_url: Optional[str] = None
    duration_seconds: Optional[int] = None
    creator_style: Optional[str] = None
    audio_reference: Optional[str] = None


class PinterestTikTokOutput(BaseAgentOutput):
    post: Optional[SocialPost] = None
    posts: List[SocialPost] = []
    alternate_captions: List[str] = []

# 4.6 Multi-Platform & Tools (legacy)
class CrossPostInput(BaseAgentInput):
    agent_id: Literal["cross_platform_sync", "social_media_audit", "hastag_generator", "comment_replier", "social_contest"]
    source_content: str
    target_platforms: List[str]

class CrossPostOutput(BaseAgentOutput):
    platform_variations: Dict[str, SocialPost]
