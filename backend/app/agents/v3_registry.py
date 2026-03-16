import logging
from typing import Dict, Optional

from app.models.v3 import (
    AgentCapability,
    ProviderCapability,
    ContentType,
    ModelTier,
    CardType
)
from .base import BaseAgent

logger = logging.getLogger(__name__)

# Brand (7)
BRAND_NAMING_CAPABILITY = AgentCapability(
    agent_id="brand_naming",
    agent_name="Brand Naming",
    description="Generates creative brand name options with rationale and domain suggestions",
    category="brand",
    reads_from_context=["industry", "target_audience", "voice_profile"],
    writes_to_context=["brand_name"],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=CardType.BRAND_NAME,
    output_content_type=ContentType.STRUCTURED,
    model_tier=ModelTier.QUALITY,
)

TAGLINE_CAPABILITY = AgentCapability(
    agent_id="tagline_slogan",
    agent_name="Tagline & Slogan",
    description="Creates memorable taglines and slogans ranked by tone and memorability",
    category="brand",
    reads_from_context=["brand_name", "industry", "target_audience", "voice_profile", "mood"],
    writes_to_context=["tagline"],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=CardType.TAGLINE,
    output_content_type=ContentType.STRUCTURED,
    model_tier=ModelTier.QUALITY,
)

BRAND_IDENTITY_CAPABILITY = AgentCapability(
    agent_id="brand_identity",
    agent_name="Brand Identity",
    description="Creates complete visual identity: colors, fonts, mood, style. Can extract from URL.",
    category="brand",
    reads_from_context=["brand_name", "industry", "target_audience"],
    writes_to_context=["colors", "fonts", "visual_style", "mood", "industry", "source_url"],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=CardType.BRAND_IDENTITY,
    output_content_type=ContentType.STRUCTURED,
    model_tier=ModelTier.QUALITY,
)

BRAND_VOICE_CAPABILITY = AgentCapability(
    agent_id="brand_voice_analyzer",
    agent_name="Brand Voice Analyzer",
    description="Learns brand voice from content samples. Generates voice profile for all agents.",
    category="brand",
    reads_from_context=["brand_name", "industry"],
    writes_to_context=["voice_profile"],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=CardType.BRAND_VOICE,
    output_content_type=ContentType.STRUCTURED,
    model_tier=ModelTier.QUALITY,
)

TARGET_AUDIENCE_CAPABILITY = AgentCapability(
    agent_id="target_audience",
    agent_name="Target Audience",
    description="Defines detailed buyer personas with psychographics and channel preferences",
    category="brand",
    reads_from_context=["brand_name", "industry", "voice_profile"],
    writes_to_context=["target_audience"],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=CardType.TARGET_AUDIENCE,
    output_content_type=ContentType.STRUCTURED,
    model_tier=ModelTier.QUALITY,
)

BRAND_GUARDIAN_CAPABILITY = AgentCapability(
    agent_id="brand_guardian",
    agent_name="Brand Guardian",
    description="Quality gate that checks all outputs for brand consistency",
    category="brand",
    reads_from_context=["brand_name", "colors", "fonts", "visual_style", "mood", "voice_profile", "tagline"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=None,
    output_content_type=ContentType.STRUCTURED,
    model_tier=ModelTier.QUALITY,
)


# Content (10)
AD_COPYWRITER_CAPABILITY = AgentCapability(
    agent_id="ad_copywriter",
    agent_name="Ad Copywriter",
    description="Creates platform-specific ad copy using proven marketing frameworks (AIDA, PAS).",
    category="content",
    reads_from_context=["brand_name", "target_audience", "voice_profile", "product_description"],
    writes_to_context=["ad_copy"],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=CardType.AD_COPY,
    output_content_type=ContentType.STRUCTURED,
    model_tier=ModelTier.QUALITY,
)

# Active Implementations will be mapped here as they are built
class AgentRegistry:
    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}
        
    def register(self, agent: BaseAgent):
        self._agents[agent.capability.agent_id] = agent
        logger.info(f"Registered Agent: {agent.capability.agent_id}")
        
    def get_agent(self, agent_id: str) -> Optional[BaseAgent]:
        return self._agents.get(agent_id)
        
    def list_agents(self) -> Dict[str, AgentCapability]:
        return {agent_id: agent.capability for agent_id, agent in self._agents.items()}

# Global Singletons
registry = AgentRegistry()

# Register implemented agents
from app.agents.brand.brand_naming import BrandNamingAgent
from app.agents.content.ad_copywriter import AdCopywriterAgent

registry.register(BrandNamingAgent())
registry.register(AdCopywriterAgent())
