from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any, Literal

from .enums import ProviderCapability, ContentType, ModelTier, AgentMode, CardType
from .context import CampaignContext

class AgentCapability(BaseModel):
    """Declares what an agent needs and produces."""
    agent_id: str
    agent_name: str
    description: str
    category: Literal["orchestration", "brand", "visual", "content", "video", "adaptation", "optimization", "feedback"]
    
    # What it reads from CampaignContext
    reads_from_context: List[str]       # ["brand_name", "colors", "voice_profile"]
    
    # What it writes to CampaignContext
    writes_to_context: List[str]        # ["logo_url"]
    
    # What AI capabilities it needs
    needs_providers: List[ProviderCapability]  # [TEXT, IMAGE_GENERATE]
    
    # What deck card type it produces
    produces_card_type: Optional[CardType] = None
    
    # Content type of output
    output_content_type: ContentType
    
    # Model tier preference
    model_tier: ModelTier = ModelTier.STANDARD

class AgentInput(BaseModel):
    """Base input for all agents."""
    agent_id: str
    mode: AgentMode = AgentMode.PANEL
    campaign_id: str
    workspace_id: str
    
    # Campaign context (auto-injected by backend)
    context: Optional[CampaignContext] = None
    
    # Knowledge base context (auto-injected by backend after RAG search)
    kb_context: Optional[List[str]] = None   # Relevant KB chunks
    
    # Voice profile (auto-injected from context)
    voice_prompt: Optional[str] = None
    
    # For chat mode — raw user message
    chat_message: Optional[str] = None
    
    # Form data from A2UI frontend
    form_data: Optional[Dict[str, Any]] = None
    
    # For feedback/iteration
    previous_version_id: Optional[str] = None
    feedback: Optional[str] = None
    
    model_config = ConfigDict(extra="ignore")

class AgentOutput(BaseModel):
    """Base output from all agents."""
    agent_id: str
    success: bool = True
    error: Optional[str] = None
    content: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    
    # What to write to CampaignContext
    context_updates: Dict[str, Any] = {}
    
    # Cost tracking
    model_used: str = ""
    provider_used: str = ""
    tokens_in: int = 0
    tokens_out: int = 0
    cost_usd: float = 0.0
    processing_time_ms: int = 0
    
    # Version info
    version_number: int = 1
    parent_version_id: Optional[str] = None
