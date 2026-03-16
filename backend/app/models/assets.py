from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

from .enums import CardType, CardStatus, ContentType

class GeneratedAsset(BaseModel):
    """Single generated asset (image, text, video, etc.)."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content_type: ContentType
    
    # For images/videos
    gcs_path: Optional[str] = None
    gcs_url: Optional[str] = None       # Signed URL
    thumbnail_url: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    
    # For text
    text_content: Optional[str] = None
    html_content: Optional[str] = None  # Rich text
    
    # For structured data
    structured_data: Optional[Dict[str, Any]] = None
    
    # Metadata
    prompt_used: str = ""
    model_used: str = ""
    generation_params: Dict[str, Any] = {}

class DeckCard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    campaign_id: str
    card_type: CardType
    status: CardStatus = CardStatus.EMPTY
    position: int = 0
    title: str = ""
    
    current_version_id: Optional[str] = None
    thumbnail_url: Optional[str] = None
    text_preview: Optional[str] = None  # First 300 chars
    metadata: Optional[Dict[str, Any]] = None  # Structured agent output
    
    versions: List[str] = []            # Version IDs
    agent_used: Optional[str] = None
    context_snapshot: Optional[Dict] = None  # Context at time of generation
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AssetVersion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    card_id: str
    version_number: int
    content_type: ContentType
    
    # Assets (can be multiple variations)
    assets: List[GeneratedAsset] = []
    selected_asset_id: Optional[str] = None  # Which variation user picked
    
    # Generation context
    prompt_used: str = ""
    model_used: str = ""
    provider_used: str = ""
    generation_params: Dict[str, Any] = {}
    
    # Feedback that led to this version
    feedback: Optional[str] = None
    parent_version_id: Optional[str] = None
    
    # Scores
    seo_score: Optional[int] = None
    aeo_score: Optional[int] = None
    brand_compliance_score: Optional[int] = None
    
    # Cost
    cost_usd: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
