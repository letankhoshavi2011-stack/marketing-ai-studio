from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.base import BaseAgentInput, BaseAgentOutput


# ============================================================
# SHARED NESTED MODELS
# ============================================================

class ColorSwatch(BaseModel):
    """A single brand color with its intended usage."""
    hex: str = Field(..., description="Hex color code, e.g. '#2D5016'")
    name: str = Field(..., description="Human-readable color name, e.g. 'Forest Green'")
    usage: str = Field(..., description="Primary | Secondary | Accent | Neutral | Background")

class FontPair(BaseModel):
    """Brand typography pairing."""
    heading: str = Field(..., description="Font name for headings, e.g. 'Montserrat'")
    body: str = Field(..., description="Font name for body text, e.g. 'Open Sans'")
    heading_weight: str = Field(default="700", description="Font weight for headings")
    body_weight: str = Field(default="400", description="Font weight for body")


# ============================================================
# 1. BRAND IDENTITY BUILDER
# ============================================================

class BrandIdentityInput(BaseAgentInput):
    """Input schema for the Brand Identity Builder agent."""
    agent_id: str = Field(default="brand_identity")

    # Core business details
    business_name: Optional[str] = Field(default=None, description="Optional: Company/brand name. Leave blank to have AI suggest one.")
    business_description: str = Field(..., description="What does this business do? Who does it serve?")
    industry: str = Field(..., description="Industry sector, e.g. 'Health & Wellness', 'Fashion', 'SaaS'")

    # Brand direction
    target_audience: Optional[str] = Field(default=None, description="Who are your ideal customers?")
    values: List[str] = Field(default=[], description="Core brand values, e.g. ['Innovation', 'Trust', 'Sustainability']")
    style_preferences: List[str] = Field(default=[], description="Visual style keywords, e.g. ['Modern', 'Minimal', 'Bold']")

    # Color suggestions
    color_preferences: List[str] = Field(default=[], description="Hex codes or color names the user likes")

    # Context sources
    source_url: Optional[str] = Field(default=None, description="Company website to scrape for context")
    brand_site_url: Optional[str] = Field(default=None, description="Official brand website URL")

    competitor_urls: List[str] = Field(default=[], description="Competitor websites to analyze and differentiate from")


class BrandIdentityOutput(BaseAgentOutput):
    """Structured output for the Brand Identity Builder agent."""
    agent_id: str = Field(default="brand_identity")

    # Growth-style structured UI fields
    title: str = Field(default="", description="Main title of the brand presentation")
    sections: List[Dict[str, str]] = Field(default=[], description="Structured breakdown {heading, content}")
    recommendations: List[str] = Field(default=[], description="Key strategic recommendations")
    action_items: List[str] = Field(default=[], description="Immediate next steps")

    # Brand Identity Core
    brand_name: Optional[str] = Field(default=None, description="Recommended brand name")
    tagline_idea: str = Field(default="", description="AI-suggested tagline")
    brand_personality: str = Field(default="", description="E.g. 'Bold, approachable, premium'")
    mood: str = Field(default="", description="Emotional feel, e.g. 'Energetic, confident, warm'")
    visual_style: str = Field(default="", description="E.g. 'Clean modern lines with earthy accents'")
    imagery_direction: str = Field(default="", description="Photo/illustration guidance")

    # Design System
    colors: List[ColorSwatch] = Field(default=[], description="3-5 brand colors with usage roles")
    fonts: Optional[FontPair] = Field(default=None, description="Typography pairing")

    # Values & Guidelines
    values: List[str] = Field(default=[], description="Refined brand values")
    dos: List[str] = Field(default=[], description="Brand DOs — what to always do")
    donts: List[str] = Field(default=[], description="Brand DON'Ts — what to always avoid")

    # Context auto-sync
    context_updates: Dict[str, Any] = Field(
        default={},
        description="Written to workspace context for other agents to use"
    )


# ============================================================
# 2. BRAND NAMING
# ============================================================

class BrandNameOption(BaseModel):
    name: str
    rationale: str
    domain_suggestions: List[str]
    style: str
    score: float

class BrandNamingInput(BaseAgentInput):
    agent_id: str = Field(default="brand_naming")
    industry: Optional[str] = None
    business_description: str
    values: List[str] = []
    tone: List[str] = []
    keywords_include: List[str] = []
    keywords_avoid: List[str] = []
    style: Optional[str] = None
    name_count: int = Field(default=10, description="Number of name suggestions to generate")
    domain_tld_preferences: List[str] = Field(default=[".com", ".io"], description="Preferred domain extensions")

    competitor_names: List[str] = []
    target_audience: Optional[str] = None

class BrandNamingOutput(BaseAgentOutput):
    agent_id: str = Field(default="brand_naming")
    options: List[BrandNameOption]
    top_pick: str
    context_updates: Dict[str, Any] = {}


# ============================================================
# 3. TAGLINE & SLOGAN
# ============================================================

class TaglineOption(BaseModel):
    tagline: str
    tone: str
    memorability_score: float
    reasoning: str

class TaglineInput(BaseAgentInput):
    agent_id: str = Field(default="tagline_slogan")
    brand_name: Optional[str] = None
    business_description: Optional[str] = None
    target_emotion: Optional[str] = None
    use_case: Optional[str] = None
    channel: Optional[str] = None
    max_words: int = 8
    tone: Optional[str] = None
    for_campaign: bool = False
    campaign_theme: Optional[str] = None
    brand_values: List[str] = []
    keywords: List[str] = []

class TaglineOutput(BaseAgentOutput):
    agent_id: str = Field(default="tagline_slogan")
    options: List[TaglineOption]
    context_updates: Dict[str, Any] = {}


# ============================================================
# 4. TARGET AUDIENCE
# ============================================================

class BuyerPersona(BaseModel):
    name: str
    age_range: str
    occupation: str
    income_range: str
    pain_points: List[str]
    aspirations: List[str]
    preferred_channels: List[str]
    content_preferences: List[str]
    buying_triggers: List[str]

class TargetAudienceInput(BaseAgentInput):
    agent_id: str = Field(default="target_audience")
    brand_name: Optional[str] = None
    industry: Optional[str] = None
    product_description: Optional[str] = Field(default=None, description="What do you sell or offer?")
    geographic_focus: Optional[str] = None
    price_point: Optional[str] = None
    persona_count: int = 3
    additional_context: Optional[str] = None

class TargetAudienceOutput(BaseAgentOutput):
    agent_id: str = Field(default="target_audience")
    personas: List[BuyerPersona]
    primary_persona: str
    channel_recommendations: List[str]
    context_updates: Dict[str, Any] = {}


# ============================================================
# 5. BRAND VOICE
# ============================================================

class BrandVoiceInput(BaseAgentInput):
    agent_id: str = Field(default="brand_voice")
    manual_tone: Optional[List[str]] = None
    manual_formality: Optional[float] = None
    manual_rules: Optional[List[str]] = None
    brand_description: Optional[str] = None
    sample_content: Optional[str] = Field(default=None, description="Provide a sample of existing brand content")
    sample_asset_ids: List[str] = Field(default=[], description="List of asset IDs to analyze for voice")


class BrandVoiceOutput(BaseAgentOutput):
    agent_id: str = Field(default="brand_voice")
    tone: List[str]
    formality: float
    avg_sentence_length: float
    vocabulary_level: str
    preferred_words: Dict[str, str]
    avoid_words: List[str]
    uses_emojis: bool
    uses_exclamations: bool
    paragraph_style: str
    custom_rules: List[str]
    voice_prompt: str
    context_updates: Dict[str, Any] = {}


# ============================================================
# 6. BRAND GUARDIAN
# ============================================================

class ComplianceIssue(BaseModel):
    severity: str
    category: str
    description: str
    suggestion: str

class BrandGuardianInput(BaseAgentInput):
    agent_id: str = Field(default="brand_guardian")
    content_to_validate: str
    content_type: str
    card_type: Optional[str] = None
    tone_override: Optional[str] = None
    auto_rewrite: bool = Field(default=False, description="Automatically rewrite content to fix issues")
    severity_threshold: float = Field(default=0.7, description="Threshold for flagging issues (0 to 1)")


class BrandGuardianOutput(BaseAgentOutput):
    agent_id: str = Field(default="brand_guardian")
    passed: bool
    compliance_score: int
    issues: List[ComplianceIssue]
    summary: str = Field(default="", description="High-level audit summary")
