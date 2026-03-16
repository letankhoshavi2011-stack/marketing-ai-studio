from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from app.models.base import BaseAgentInput, BaseAgentOutput, GeneratedAsset

# --- CATEGORY 5: VIDEO & MOTION ---

class VideoScene(BaseModel):
    scene_number: int
    visual_description: str
    audio_voiceover: str
    duration_seconds: float
    on_screen_text: Optional[str] = None

# 5.1 Video Ads & Scripts (40-42)
class VideoScriptInput(BaseAgentInput):
    agent_id: Literal[
        "video_ad_script", "youtube_script", "ai_video_gen",
        "video_summarizer", "caption_generator",
        "thumbnail_idea", "video_trend_analyzer",
        # legacy aliases
        "video_ad", "video_script", "video_description"
    ]
    topic: str
    target_duration: float = 60.0           # Seconds
    platform: str = "youtube"               # "youtube", "tiktok", "tv"
    tone_override: Optional[str] = None
    pacing: str = "medium"                  # "fast", "medium", "slow"
    campaign_goal: Optional[str] = None
    cta: Optional[str] = None
    shot_count: Optional[int] = None
    creator_persona: Optional[str] = None
    chapter_count: Optional[int] = None
    audience: Optional[str] = None
    video_title: Optional[str] = None
    thumbnail_text: Optional[str] = None
    emotion: Optional[str] = None
    visual_angle: Optional[str] = None


class VideoScriptOutput(BaseAgentOutput):
    title: str
    hook: str
    scenes: List[VideoScene]
    cta: str
    seo_description: Optional[str] = None

# 5.2 Audio/Video Tools (43-44)
class VideoToolsInput(BaseAgentInput):
    agent_id: Literal[
        "video_summarizer",
        # legacy aliases
        "audio_summarizer", "social_media_snippets"
    ]
    source_media_url: str
    max_summary_length: int = 500
    snippet_count: int = 3

class VideoToolsOutput(BaseAgentOutput):
    summary: Optional[str] = None
    chapters: List[Dict[str, str]] = []     # [{"timestamp": "0:00", "title": "..."}]
    snippets: List[Dict[str, Any]] = []      # [{"start": 10, "end": 25, "reason": "..."}]

# 5.3 AI Video Generation (45-47)
class VideoGenInput(BaseAgentInput):
    agent_id: Literal[
        "ai_video_gen",
        # legacy aliases
        "video_generation", "image_to_video", "social_video"
    ]
    prompt: Optional[str] = None
    source_image_url: Optional[str] = None
    style: str = "realistic"                # "realistic", "anime", "cinematic"
    duration: int = 5                       # Seconds

class VideoGenOutput(BaseAgentOutput):
    assets: List[GeneratedAsset]            # Video files
    prompt_used: str
