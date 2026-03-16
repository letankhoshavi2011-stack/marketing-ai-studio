from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from app.models.base import BaseAgentInput, BaseAgentOutput, GeneratedAsset

# --- CATEGORY 9: AUDIO & PODCAST (72-74) ---

class AudioInput(BaseAgentInput):
    agent_id: Literal["podcast_script", "podcast_description"]
    topic: str
    target_duration_mins: int = 30
    guest_names: List[str] = []
    tone_override: Optional[str] = None
    audience_selection: Optional[str] = None
    generate_audio: bool = False             # Toggle for Gemini audio generation

class AudioOutput(BaseAgentOutput):
    script_segments: List[Dict[str, str]] = [] # [{"time": "...", "speaker": "...", "text": "..."}]
    show_notes: Optional[str] = None
    seo_tags: List[str] = []
    audio_assets: List[GeneratedAsset] = []  # Generated audio files from Gemini

# --- CATEGORY 10: ADAPTATION & UTILITIES (75) ---

class UtilityInput(BaseAgentInput):
    agent_id: Literal["custom_workflow"]
    source_content: str
    target_formats: List[str]             # ["blog -> twitter", "video -> email"]

class UtilityOutput(BaseAgentOutput):
    converted_content: Dict[str, str]
