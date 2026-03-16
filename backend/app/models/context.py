from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class WorkspaceContext(BaseModel):
    """Accumulated context from all agent outputs in workspace."""
    brand_name: Optional[str] = None
    tagline: Optional[str] = None
    colors: List[Dict[str, str]] = Field(default_factory=list)  # [{"hex": "#...", "name": "...", "usage": "..."}]
    fonts: Optional[Dict[str, str]] = None  # {"heading": "...", "body": "..."}
    logo_url: Optional[str] = None
    visual_style: Optional[str] = None
    mood: Optional[str] = None
    industry: Optional[str] = None
    target_audience: Optional[List[Dict[str, Any]]] = None  # List of personas
    voice_profile: Optional[Dict[str, Any]] = None
    values: Optional[List[str]] = None
    brand_personality: Optional[str] = None
    tagline_idea: Optional[str] = None
    tone_keywords: Optional[List[str]] = None  # set by user; avoid implicit empty default
    voice_rules: Optional[List[str]] = None    # set by user; avoid implicit empty default
    
    # Metadata about the last updated at or by which agent can be added here
    last_updated_at: Optional[str] = None
    last_updated_by: Optional[str] = None

class BuyerPersona(BaseModel):
    """Target buyer profile."""
    name: str
    demographics: Dict[str, Any] = Field(default_factory=dict)
    psychographics: Dict[str, Any] = Field(default_factory=dict)
    pain_points: List[str] = Field(default_factory=list)
    buying_triggers: List[str] = Field(default_factory=list)
    
class VoiceProfile(BaseModel):
    """Brand voice attributes."""
    tone: str
    vocabulary_level: str
    key_phrases: List[str] = Field(default_factory=list)
    forbidden_words: List[str] = Field(default_factory=list)
    
class CampaignContext(BaseModel):
    """Context specific to a marketing campaign."""
    campaign_name: str
    objective: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    target_personas: List[BuyerPersona] = Field(default_factory=list)
    key_messages: List[str] = Field(default_factory=list)
    budget: Optional[float] = None
