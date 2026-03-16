from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any, Literal
from enum import Enum
from datetime import datetime
import uuid

# ============================================================
# BASE — Every agent inherits these
# ============================================================

class KBDocument(BaseModel):
    """Knowledge base document uploaded per-agent."""
    filename: str
    content: str                    # Extracted text
    file_type: str                  # "pdf", "docx", "txt", "csv", "md"
    size_bytes: int                 # Max 500KB

class ScrapedURL(BaseModel):
    """URL scraped for context."""
    url: str
    extracted_text: str
    title: Optional[str] = None
    scraped_at: datetime = Field(default_factory=datetime.utcnow)

class AgentOutputReference(BaseModel):
    """Reference to a previous agent's output in this workspace."""
    agent_id: str
    agent_name: str
    output_id: str
    output_type: str                # "text", "image", "structured"
    preview: str                    # First 200 chars or thumbnail URL
    created_at: datetime

class SharedAgentFields(BaseModel):
    """Every agent form includes these fields."""
    workspace_id: str
    campaign_id: Optional[str] = None
    prompt_id: Optional[str] = None  # Custom prompt from library
    target_language: str = "English"  # Output language for multi-lingual support

    # Marketing brief (shared across all agents)
    # These fields are intentionally prefixed to avoid collisions with agent-specific schemas.
    brief_primary_goal: Optional[str] = None            # e.g. "leads", "sales", "awareness"
    brief_product_or_service: Optional[str] = None      # what you're promoting
    brief_offer: Optional[str] = None                   # deal / pricing / hook
    brief_call_to_action: Optional[str] = None          # "Book a demo", "Buy now"
    brief_target_persona: Optional[str] = None          # short ICP/persona description
    brief_funnel_stage: Optional[str] = None            # "TOFU", "MOFU", "BOFU"
    brief_key_points: List[str] = []                    # key messages/features
    brief_proof_points: List[str] = []                  # testimonials, stats, social proof
    brief_constraints: List[str] = []                   # compliance / forbidden claims / must-include

    # Knowledge Base (per-agent, up to 1MB)
    kb_documents: List[KBDocument] = []
    selected_kb_document_ids: List[str] = []
    
    # URLs to scrape
    urls_to_scrape: List[str] = []
    scraped_content: List[ScrapedURL] = []      # Populated by backend after scraping
    
    # Additional instructions
    additional_instructions: Optional[str] = None  # Freeform text
    
    # Outputs from other agents (manual select + auto-inject)
    selected_agent_outputs: List[AgentOutputReference] = []
    
    # Auto-injected workspace context
    workspace_context: Optional[Dict[str, Any]] = None  # Brand name, colors, voice, etc.

class BaseAgentInput(SharedAgentFields):
    """Base input all agents extend."""
    agent_id: str

    # ── Optional media generation toggles (available to ALL agents) ──
    generate_image: bool = False
    generate_video: bool = False
    media_prompt: Optional[str] = None       # Custom prompt for media gen (auto-derived from text if empty)
    image_count: int = 1
    image_aspect_ratio: str = "1:1"          # "1:1", "4:3", "16:9", "9:16"
    video_duration: int = 8                  # seconds
    video_aspect_ratio: str = "16:9"

class GeneratedAsset(BaseModel):
    """Any generated asset — image, video, document."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    asset_type: Literal["image", "video", "audio", "document"]
    gcs_path: Optional[str] = None
    gcs_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    mime_type: Optional[str] = None
    file_size_bytes: Optional[int] = None
    prompt_used: str = ""
    model_used: str = ""

class BaseAgentOutput(BaseModel):
    """Base output all agents extend."""
    model_config = ConfigDict(extra="allow")

    agent_id: str
    success: bool = True
    error: Optional[str] = None
    
    # Text content (for rich text editor)
    text_content: Optional[str] = None
    html_content: Optional[str] = None
    
    # Generated assets (images, videos)
    assets: List[GeneratedAsset] = []
    
    # Structured data (brand identity, audience, etc.)
    structured_data: Optional[Dict[str, Any]] = None
    
    # Context updates — what to write to workspace context
    context_updates: Dict[str, Any] = {}
    context_metadata: Dict[str, Any] = {}
    
    # Metadata
    model_used: str = ""
    provider_used: str = ""
    cost_usd: float = 0.0
    processing_time_ms: int = 0
    
    # For versioning
    version: int = 1
    parent_output_id: Optional[str] = None
    feedback_applied: Optional[str] = None
