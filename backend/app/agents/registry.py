from typing import Dict, List, Any, Optional, Type
from pydantic import BaseModel
from app.models.base import BaseAgentInput, BaseAgentOutput

# Import specific agent models as we define them
# For now, we define the structure of the registry

class AgentMetadata(BaseModel):
    agent_id: str
    name: str
    description: str
    category: str
    icon: str  # Lucide icon name or similar
    input_model: Type[BaseAgentInput]
    output_model: Type[BaseAgentOutput]
    is_implemented: bool = False

class AgentRegistry:
    def __init__(self):
        self._agents: Dict[str, AgentMetadata] = {}

    def register(self, metadata: AgentMetadata):
        self._agents[metadata.agent_id] = metadata

    def get_agent(self, agent_id: str) -> Optional[AgentMetadata]:
        return self._agents.get(agent_id)

    def list_agents(self, category: Optional[str] = None) -> List[AgentMetadata]:
        if category:
            return [a for a in self._agents.values() if a.category == category]
        return list(self._agents.values())

    def get_categories(self) -> List[str]:
        return list(set(a.category for a in self._agents.values()))

# Global Singleton
registry = AgentRegistry()

# Forward reference to avoid circular imports during registration
def populate_registry():
    from app.agents.brand.models import (
        BrandIdentityInput, BrandIdentityOutput,
        BrandNamingInput, BrandNamingOutput,
        TaglineInput, TaglineOutput,
        TargetAudienceInput, TargetAudienceOutput,
        BrandVoiceInput, BrandVoiceOutput,
        BrandGuardianInput, BrandGuardianOutput
    )
    from app.agents.visual_strategy_models import (
        CreativeDirectionInput, CreativeDirectionOutput,
        CampaignConceptInput, CampaignConceptOutput,
        ContentCalendarInput, ContentCalendarOutput,
        LogoDesignerInput, LogoDesignerOutput,
        HeroImageInput, HeroImageOutput,
        ProductPhotoshootInput, ProductPhotoshootOutput,
        AdCreativeInput, AdCreativeOutput,
        ImageEditorInput, ImageEditorOutput,
        MockupInput, MockupOutput,
        InfographicInput, InfographicOutput,
    )
    from app.agents.social_models import (
        InstagramAgentInput, InstagramAgentOutput,
        FacebookAgentInput, FacebookAgentOutput,
        LinkedInAgentInput, LinkedInAgentOutput,
        TwitterAgentInput, TwitterAgentOutput,
        PinterestTikTokInput, PinterestTikTokOutput,
        CrossPostInput, CrossPostOutput
    )
    from app.agents.video_models import (
        VideoScriptInput, VideoScriptOutput,
        VideoToolsInput, VideoToolsOutput,
        VideoGenInput, VideoGenOutput
    )
    from app.agents.content_models import (
        ContentInput, ContentOutput,
        AdCopyInput, AdCopyOutput,
        SEOInput, SEOOutput
    )
    from app.agents.utility_models import (
        AudioInput, AudioOutput,
        UtilityInput, UtilityOutput
    )
    from app.agents.growth_models import (
        GrowthInput, GrowthOutput
    )
    
    # 🏷️ CATEGORY 1: BRAND IDENTITY (6)
    registry.register(AgentMetadata(
        agent_id="brand_identity", name="Brand Identity Builder",
        description="Creates complete brand identity — colors, fonts, mood, visual style, values.",
        category="brand", icon="Fingerprint", input_model=BrandIdentityInput, output_model=BrandIdentityOutput, is_implemented=True
    ))
    registry.register(AgentMetadata(
        agent_id="brand_naming", name="Brand Naming Agent",
        description="Generates creative brand name options with rationale and domain suggestions.",
        category="brand", icon="Type", input_model=BrandNamingInput, output_model=BrandNamingOutput, is_implemented=True
    ))
    registry.register(AgentMetadata(
        agent_id="tagline_slogan", name="Tagline & Slogan Agent",
        description="Creates memorable taglines and slogans ranked by tone and memorability.",
        category="brand", icon="Quote", input_model=TaglineInput, output_model=TaglineOutput, is_implemented=True
    ))
    registry.register(AgentMetadata(
        agent_id="target_audience", name="Target Audience Analyzer",
        description="Defines detailed buyer personas with psychographics and channel preferences.",
        category="brand", icon="Users", input_model=TargetAudienceInput, output_model=TargetAudienceOutput, is_implemented=True
    ))
    registry.register(AgentMetadata(
        agent_id="brand_voice", name="Brand Voice Analyzer",
        description="Analyzes content to extract brand tone, rules, and personality.",
        category="brand", icon="Mic", input_model=BrandVoiceInput, output_model=BrandVoiceOutput, is_implemented=True
    ))
    registry.register(AgentMetadata(
        agent_id="brand_guardian", name="Brand Guardian",
        description="Validates content against brand standards and guidelines.",
        category="brand", icon="ShieldCheck", input_model=BrandGuardianInput, output_model=BrandGuardianOutput, is_implemented=True
    ))

    # 🎨 CATEGORY 2: CREATIVE STRATEGY (3)
    registry.register(AgentMetadata(
        agent_id="creative_direction", name="Creative Direction Agent",
        description="Sets visual and mood direction for campaigns.",
        category="strategy", icon="Compass", input_model=CreativeDirectionInput, output_model=CreativeDirectionOutput, is_implemented=True
    ))
    registry.register(AgentMetadata(
        agent_id="campaign_concept", name="Campaign Concept Agent",
        description="Generates high-level themes and messaging for marketing campaigns.",
        category="strategy", icon="Lightbulb", input_model=CampaignConceptInput, output_model=CampaignConceptOutput, is_implemented=True
    ))
    registry.register(AgentMetadata(
        agent_id="content_calendar", name="Content Calendar Planner",
        description="Plans a strategic content schedule across multiple channels.",
        category="strategy", icon="Calendar", input_model=ContentCalendarInput, output_model=ContentCalendarOutput, is_implemented=True
    ))

    # 🖼️ CATEGORY 3: VISUAL DESIGN (8)
    registry.register(AgentMetadata(
        agent_id="logo_designer", name="Logo Designer",
        description="Generates professional logo variations based on brand style.",
        category="visual", icon="Palette", input_model=LogoDesignerInput, output_model=LogoDesignerOutput, is_implemented=True
    ))
    registry.register(AgentMetadata(
        agent_id="hero_image", name="Image Generator",
        description="Creates high-impact banner and hero images.",
        category="visual", icon="Image", input_model=HeroImageInput, output_model=HeroImageOutput, is_implemented=True
    ))
    registry.register(AgentMetadata(
        agent_id="product_photoshoot", name="Product Photoshoot",
        description="Places products in professional studio or lifestyle scenes.",
        category="visual", icon="Camera", input_model=ProductPhotoshootInput, output_model=ProductPhotoshootOutput, is_implemented=True
    ))
    registry.register(AgentMetadata(
        agent_id="ad_creative", name="Ad Creative Designer",
        description="Designs platform-ready visual ads with headlines.",
        category="visual", icon="Sparkles", input_model=AdCreativeInput, output_model=AdCreativeOutput, is_implemented=True
    ))
    registry.register(AgentMetadata(
        agent_id="image_editor", name="Image Editor (AI)",
        description="Applies sophisticated AI edits to existing images.",
        category="visual", icon="Edit", input_model=ImageEditorInput, output_model=ImageEditorOutput, is_implemented=True
    ))
    registry.register(AgentMetadata(
        agent_id="mockup_generator", name="Mockup Generator",
        description="Renders designs onto real-world product mockups.",
        category="visual", icon="Box", input_model=MockupInput, output_model=MockupOutput, is_implemented=True
    ))
    registry.register(AgentMetadata(
        agent_id="infographic", name="Infographic Generator",
        description="Transforms data and concepts into visual infographics.",
        category="visual", icon="BarChart", input_model=InfographicInput, output_model=InfographicOutput, is_implemented=True
    ))
    # 📱 CATEGORY 4: SOCIAL MEDIA
    for aid in ["instagram_post", "instagram_story", "instagram_reel", "instagram_carousel", "instagram_bio"]:
        registry.register(AgentMetadata(
            agent_id=aid, name=f"IG {aid.split('_')[1].title()}", description=f"Optimized Instagram {aid.split('_')[1]} content.",
            category="social", icon="Instagram", input_model=InstagramAgentInput, output_model=InstagramAgentOutput, is_implemented=True
        ))
    for aid in ["facebook_post", "facebook_ad_copy"]:
        registry.register(AgentMetadata(
            agent_id=aid, name=f"FB {aid.split('_')[1].title()}", description=f"Engagement-focused Facebook {aid.split('_')[1]}.",
            category="social", icon="Facebook", input_model=FacebookAgentInput, output_model=FacebookAgentOutput, is_implemented=True
        ))
    for aid in ["linkedin_post", "linkedin_article", "linkedin_ad"]:
        registry.register(AgentMetadata(
            agent_id=aid, name=f"LI {aid.split('_')[1].title()}", description=f"Professional LinkedIn {aid.split('_')[1]}.",
            category="social", icon="LinkedIn", input_model=LinkedInAgentInput, output_model=LinkedInAgentOutput, is_implemented=True
        ))
    for aid in ["twitter_tweet", "twitter_thread", "twitter_ad"]:
        registry.register(AgentMetadata(
            agent_id=aid, name=f"X {aid.split('_')[1].title()}", description=f"Viral X/Twitter {aid.split('_')[1]}.",
            category="social", icon="Twitter", input_model=TwitterAgentInput, output_model=TwitterAgentOutput, is_implemented=True
        ))
    for aid in ["pinterest_pin", "pinterest_ad"]:
        registry.register(AgentMetadata(
            agent_id=aid, name=f"PH {aid.split('_')[1].title()}", description=f"Pinterest {aid.split('_')[1]}.",
            category="social", icon="Pinterest", input_model=PinterestTikTokInput, output_model=PinterestTikTokOutput, is_implemented=True
        ))
    for aid in ["tiktok_script", "tiktok_trend", "tiktok_ad"]:
        registry.register(AgentMetadata(
            agent_id=aid, name=f"TT {aid.split('_')[1].title()}", description=f"TikTok {aid.split('_')[1]}.",
            category="social", icon="TikTok", input_model=PinterestTikTokInput, output_model=PinterestTikTokOutput, is_implemented=True
        ))

    # 🎬 CATEGORY 5: VIDEO & MOTION (8)
    for aid in ["video_ad_script", "youtube_script", "ai_video_gen", "video_summarizer", "caption_generator", "thumbnail_idea", "video_trend_analyzer"]:
        registry.register(AgentMetadata(
            agent_id=aid, name=aid.replace('_', ' ').title(), description=f"Platform-optimized {aid.replace('_', ' ')}.",
            category="video", icon="Video", input_model=VideoScriptInput, output_model=VideoScriptOutput, is_implemented=True
        ))

    # 📝 CATEGORY 6: CONTENT & COPY (12)
    for aid in ["blog_post", "email_campaign", "newsletter", "landing_page", "case_study", "press_release", "whitepaper", "product_description", "faq_generator", "sms_marketing", "content_audit"]:
        registry.register(AgentMetadata(
            agent_id=aid, name=aid.replace('_', ' ').title(), description=f"Expert {aid.replace('_', ' ')} writing.",
            category="content", icon="Pen", input_model=ContentInput, output_model=ContentOutput, is_implemented=True
        ))

    # 💰 CATEGORY 7: ADVERTISING COPY (8)
    for aid in ["meta_ads", "google_search_ads", "google_display_ads", "linkedin_lead_gen", "pinterest_ads", "tiktok_ads", "youtube_ads", "amazon_ppc"]:
        registry.register(AgentMetadata(
            agent_id=aid, name=aid.replace('_', ' ').title(), description=f"High-ROI {aid.replace('_', ' ')}.",
            category="ads", icon="DollarSign", input_model=AdCopyInput, output_model=AdCopyOutput, is_implemented=True
        ))

    # 🔍 CATEGORY 8: SEO & AEO (4)
    for aid in ["keyword_researcher", "on_page_seo", "technical_seo", "aeo_optimizer"]:
        registry.register(AgentMetadata(
            agent_id=aid, name=aid.replace('_', ' ').title(), description=f"Ranking-focused {aid.replace('_', ' ')}.",
            category="seo", icon="Search", input_model=SEOInput, output_model=SEOOutput, is_implemented=True
        ))

    # 🎙️ CATEGORY 9: AUDIO & PODCAST (3)
    for aid in ["podcast_script", "podcast_description"]:
        registry.register(AgentMetadata(
            agent_id=aid, name=aid.replace('_', ' ').title(), description=f"Professional {aid.replace('_', ' ')}.",
            category="audio", icon="Mic", input_model=AudioInput, output_model=AudioOutput, is_implemented=True
        ))

    # 🛠️ CATEGORY 10: ADAPTATION & UTILITIES (1)
    registry.register(AgentMetadata(
        agent_id="custom_workflow", name="Content Adaptor",
        description="Repurposes content for different platforms and formats.",
        category="utility", icon="Repeat", input_model=UtilityInput, output_model=UtilityOutput, is_implemented=True
    ))

    # 🚀 CATEGORY 10: GROWTH & STRATEGY (12)
    growth_agents = {
        "pricing_strategy": ("Pricing Strategy", "Expert SaaS pricing analysis with tiers and value metrics.", "DollarSign"),
        "launch_strategy": ("Launch Strategy", "Go-to-market launch planning with timeline and channels.", "Rocket"),
        "cold_email": ("Cold Email Writer", "Human-sounding cold emails with follow-up sequences.", "Mail"),
        "email_sequence": ("Email Sequence Builder", "Multi-step email automation sequences.", "MailPlus"),
        "page_cro": ("Page CRO Analyzer", "Conversion rate optimization for landing pages.", "MousePointerClick"),
        "ab_test_setup": ("A/B Test Planner", "Statistical test design with hypothesis and metrics.", "FlaskConical"),
        "marketing_psychology": ("Marketing Psychology", "Psychology-driven persuasion and messaging frameworks.", "Brain"),
        "content_strategy": ("Content Strategy", "Strategic content planning aligned to business goals.", "Map"),
        "competitor_alternatives": ("Competitor Alternatives", "Competitive positioning and alternative comparison pages.", "Swords"),
        "seo_audit": ("SEO Audit", "Comprehensive technical and on-page SEO audit.", "SearchCheck"),
        "schema_markup": ("Schema Markup", "Structured data and schema.org markup generator.", "Code"),
        "referral_program": ("Referral Program", "Viral referral and loyalty program design.", "Users"),
    }
    for aid, (name, desc, icon) in growth_agents.items():
        registry.register(AgentMetadata(
            agent_id=aid, name=name, description=desc,
            category="growth", icon=icon, input_model=GrowthInput, output_model=GrowthOutput, is_implemented=True
        ))

# Auto-populate on import
populate_registry()
