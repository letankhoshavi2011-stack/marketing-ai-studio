from app.models.agents import AgentCapability
from app.models.enums import ProviderCapability, ContentType, ModelTier, CardType
from typing import Dict

# ============================================================
# AGENT CAPABILITIES
# ============================================================

INTENT_DETECTION_CAPABILITY = AgentCapability(
    agent_id="intent_detection",
    agent_name="Intent Detection",
    description="Classifies user intent and extracts entities from chat messages",
    category="orchestration",
    reads_from_context=[],
    writes_to_context=[],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=None,
    output_content_type=ContentType.STRUCTURED,
    model_tier=ModelTier.FAST,
)

AGENT_ROUTER_CAPABILITY = AgentCapability(
    agent_id="agent_router",
    agent_name="Agent Router / Planner",
    description="Creates execution plans by routing to the right specialist agents",
    category="orchestration",
    reads_from_context=["brand_name", "industry"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=None,
    output_content_type=ContentType.STRUCTURED,
    model_tier=ModelTier.FAST,
)

CONTEXT_MANAGER_CAPABILITY = AgentCapability(
    agent_id="context_manager",
    agent_name="Context Manager",
    description="Manages campaign context and detects downstream impacts of changes",
    category="orchestration",
    reads_from_context=["*"],   # Reads everything
    writes_to_context=["*"],    # Writes everything
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=None,
    output_content_type=ContentType.STRUCTURED,
    model_tier=ModelTier.FAST,
)

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

LOGO_DESIGNER_CAPABILITY = AgentCapability(
    agent_id="logo_designer",
    agent_name="Logo Designer",
    description="Generates logo concepts in multiple styles: wordmark, icon, combination, abstract",
    category="visual",
    reads_from_context=["brand_name", "colors", "visual_style", "mood", "industry"],
    writes_to_context=["logo_url"],
    needs_providers=[ProviderCapability.IMAGE_GENERATE, ProviderCapability.TEXT],
    produces_card_type=CardType.LOGO,
    output_content_type=ContentType.IMAGE,
    model_tier=ModelTier.QUALITY,
)

HERO_IMAGE_CAPABILITY = AgentCapability(
    agent_id="hero_image",
    agent_name="Image Generator",
    description="Generates hero images, banners, and backgrounds for marketing campaigns",
    category="visual",
    reads_from_context=["brand_name", "colors", "visual_style", "mood"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.IMAGE_GENERATE, ProviderCapability.TEXT],
    produces_card_type=CardType.HERO_IMAGE,
    output_content_type=ContentType.IMAGE,
    model_tier=ModelTier.QUALITY,
)

PRODUCT_PHOTOSHOOT_CAPABILITY = AgentCapability(
    agent_id="product_photoshoot",
    agent_name="Product Photoshoot",
    description="Transforms product photos into professional studio and lifestyle shots",
    category="visual",
    reads_from_context=["brand_name", "colors", "visual_style"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.IMAGE_GENERATE, ProviderCapability.IMAGE_FUSION, ProviderCapability.TEXT],
    produces_card_type=CardType.PRODUCT_PHOTO,
    output_content_type=ContentType.IMAGE,
    model_tier=ModelTier.QUALITY,
)

SOCIAL_VISUALS_CAPABILITY = AgentCapability(
    agent_id="social_visuals",
    agent_name="Social Media Visuals",
    description="Generates platform-specific social media images with correct dimensions",
    category="visual",
    reads_from_context=["brand_name", "colors", "logo_url", "visual_style", "mood", "target_audience"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.IMAGE_GENERATE, ProviderCapability.IMAGE_TEXT_RENDER, ProviderCapability.TEXT],
    produces_card_type=CardType.SOCIAL_POST_IG,
    output_content_type=ContentType.IMAGE,
    model_tier=ModelTier.STANDARD,
)

AD_CREATIVE_CAPABILITY = AgentCapability(
    agent_id="ad_creative",
    agent_name="Ad Creative",
    description="Generates complete ad visuals with headline, copy, CTA, and logo baked in",
    category="visual",
    reads_from_context=["brand_name", "colors", "logo_url", "visual_style", "target_audience"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.IMAGE_GENERATE, ProviderCapability.IMAGE_TEXT_RENDER, ProviderCapability.TEXT],
    produces_card_type=CardType.AD_CREATIVE,
    output_content_type=ContentType.IMAGE,
    model_tier=ModelTier.QUALITY,
)

IMAGE_EDITOR_CAPABILITY = AgentCapability(
    agent_id="image_editor",
    agent_name="Image Editor",
    description="Edits existing images via natural language: background change, color shift, etc.",
    category="visual",
    reads_from_context=["colors", "visual_style"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.IMAGE_EDIT, ProviderCapability.TEXT],
    produces_card_type=None,
    output_content_type=ContentType.IMAGE,
    model_tier=ModelTier.STANDARD,
)

MULTI_PLATFORM_RESIZE_CAPABILITY = AgentCapability(
    agent_id="multi_platform_resize",
    agent_name="Multi-Platform Resize",
    description="Intelligently resizes/recomposes one image for all platform dimensions",
    category="adaptation",
    reads_from_context=[],
    writes_to_context=[],
    needs_providers=[ProviderCapability.IMAGE_GENERATE, ProviderCapability.TEXT],
    produces_card_type=None,
    output_content_type=ContentType.IMAGE,
    model_tier=ModelTier.STANDARD,
)

VIDEO_GENERATION_CAPABILITY = AgentCapability(
    agent_id="video_generation",
    agent_name="Video Generation",
    description="Creates marketing videos from text prompts with native audio",
    category="video",
    reads_from_context=["brand_name", "colors", "visual_style", "mood"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.VIDEO_GENERATE, ProviderCapability.TEXT],
    produces_card_type=CardType.VIDEO,
    output_content_type=ContentType.VIDEO,
    model_tier=ModelTier.QUALITY,
)

IMAGE_TO_VIDEO_CAPABILITY = AgentCapability(
    agent_id="image_to_video",
    agent_name="Image to Video",
    description="Animates static marketing images into video with motion and audio",
    category="video",
    reads_from_context=["brand_name", "visual_style"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.IMAGE_TO_VIDEO, ProviderCapability.TEXT],
    produces_card_type=CardType.VIDEO,
    output_content_type=ContentType.VIDEO,
    model_tier=ModelTier.QUALITY,
)

SOCIAL_VIDEO_CAPABILITY = AgentCapability(
    agent_id="social_video",
    agent_name="Social Video",
    description="Short-form vertical videos for Reels, Shorts, TikTok, Stories",
    category="video",
    reads_from_context=["brand_name", "colors", "visual_style", "target_audience"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.VIDEO_GENERATE, ProviderCapability.TEXT],
    produces_card_type=CardType.VIDEO_SOCIAL,
    output_content_type=ContentType.VIDEO,
    model_tier=ModelTier.STANDARD,
)

AD_COPY_CAPABILITY = AgentCapability(
    agent_id="ad_copywriter",
    agent_name="Ad Copywriter",
    description="Platform-specific ad copy with character limits, frameworks, and A/B suggestions",
    category="content",
    reads_from_context=["brand_name", "tagline", "voice_profile", "target_audience", "industry"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=CardType.AD_COPY_GOOGLE,
    output_content_type=ContentType.TEXT,
    model_tier=ModelTier.QUALITY,
)

BLOG_WRITER_CAPABILITY = AgentCapability(
    agent_id="blog_writer",
    agent_name="Blog Writer",
    description="Full blog posts with SEO optimization, headings, meta tags, and KB integration",
    category="content",
    reads_from_context=["brand_name", "voice_profile", "target_audience", "industry"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=CardType.BLOG_POST,
    output_content_type=ContentType.TEXT,
    model_tier=ModelTier.QUALITY,
)

EMAIL_CAMPAIGN_CAPABILITY = AgentCapability(
    agent_id="email_campaign",
    agent_name="Email Campaign",
    description="Complete email campaigns with subject lines, preview text, body, CTA",
    category="content",
    reads_from_context=["brand_name", "colors", "voice_profile", "target_audience", "tagline"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=CardType.EMAIL_CAMPAIGN,
    output_content_type=ContentType.TEXT,
    model_tier=ModelTier.QUALITY,
)

LANDING_PAGE_CAPABILITY = AgentCapability(
    agent_id="landing_page",
    agent_name="Landing Page Copy",
    description="Full landing page copy: hero, value props, features, social proof, FAQ, CTA",
    category="content",
    reads_from_context=["brand_name", "tagline", "colors", "voice_profile", "target_audience"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=CardType.LANDING_PAGE,
    output_content_type=ContentType.TEXT,
    model_tier=ModelTier.QUALITY,
)

PRODUCT_DESCRIPTION_CAPABILITY = AgentCapability(
    agent_id="product_description",
    agent_name="Product Description",
    description="Short, medium, long product descriptions with bullet points and SEO meta",
    category="content",
    reads_from_context=["brand_name", "voice_profile", "target_audience"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=CardType.PRODUCT_DESCRIPTION,
    output_content_type=ContentType.TEXT,
    model_tier=ModelTier.STANDARD,
)

SEO_AEO_CAPABILITY = AgentCapability(
    agent_id="seo_aeo_optimizer",
    agent_name="SEO/AEO Optimizer",
    description="Dual SEO + AEO analysis with scores, issues, and auto-optimization",
    category="optimization",
    reads_from_context=["brand_name", "industry"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=CardType.SEO_REPORT,
    output_content_type=ContentType.STRUCTURED,
    model_tier=ModelTier.QUALITY,
)


QUALITY_SCORE_CAPABILITY = AgentCapability(
    agent_id="quality_score",
    agent_name="Quality Score",
    description="Rates assets, suggests improvements, identifies missing campaign pieces",
    category="feedback",
    reads_from_context=["*"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=None,
    output_content_type=ContentType.STRUCTURED,
    model_tier=ModelTier.QUALITY,
)

CONTENT_REPURPOSE_CAPABILITY = AgentCapability(
    agent_id="content_repurpose",
    agent_name="Content Repurpose",
    description="Transforms one content piece into multiple formats: social, email, video script, etc.",
    category="adaptation",
    reads_from_context=["brand_name", "voice_profile", "target_audience"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=None,
    output_content_type=ContentType.TEXT,
    model_tier=ModelTier.STANDARD,
)

MOCKUP_GENERATOR_CAPABILITY = AgentCapability(
    agent_id="mockup_generator",
    agent_name="Mockup Generator",
    description="Places designs onto realistic mockups: t-shirts, mugs, billboards, storefronts",
    category="visual",
    reads_from_context=["brand_name", "colors", "logo_url"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.IMAGE_GENERATE, ProviderCapability.IMAGE_FUSION, ProviderCapability.TEXT],
    produces_card_type=CardType.MOCKUP,
    output_content_type=ContentType.IMAGE,
    model_tier=ModelTier.QUALITY,
)

# --- NEW VIDEO & AUDIO AGENTS ---

VIDEO_AD_CAPABILITY = AgentCapability(
    agent_id="video_ad",
    agent_name="Video Ad",
    description="Craft narratives for promotional videos to captivate audiences and drive conversions.",
    category="video",
    reads_from_context=["brand_name", "target_audience", "industry"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=CardType.VIDEO_AD,
    output_content_type=ContentType.TEXT,
    model_tier=ModelTier.QUALITY,
)

VIDEO_SCRIPT_CAPABILITY = AgentCapability(
    agent_id="video_script",
    agent_name="Video Script",
    description="Craft engaging and well-structured video scripts with scenes and dialogue.",
    category="video",
    reads_from_context=["brand_name", "voice_profile", "target_audience"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=CardType.VIDEO_SCRIPT,
    output_content_type=ContentType.TEXT,
    model_tier=ModelTier.QUALITY,
)

VIDEO_DESCRIPTION_CAPABILITY = AgentCapability(
    agent_id="video_description",
    agent_name="Video Description",
    description="Increase your video's visibility and impact by crafting SEO-friendly descriptions.",
    category="video",
    reads_from_context=["brand_name", "voice_profile"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=CardType.VIDEO_DESCRIPTION,
    output_content_type=ContentType.TEXT,
    model_tier=ModelTier.STANDARD,
)

AUDIO_SUMMARIZER_CAPABILITY = AgentCapability(
    agent_id="audio_summarizer",
    agent_name="Audio/Video Summarizer",
    description="Transform recordings or transcripts into clear summaries with chapter breakdowns.",
    category="video",
    reads_from_context=["brand_name"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=CardType.AUDIO_SUMMARIZER,
    output_content_type=ContentType.TEXT,
    model_tier=ModelTier.STANDARD,
)

SOCIAL_MEDIA_SNIPPETS_CAPABILITY = AgentCapability(
    agent_id="social_media_snippets",
    agent_name="Social Media Snippets",
    description="Extract key moments from long videos to create impactful social media posts.",
    category="video",
    reads_from_context=["brand_name", "voice_profile", "target_audience"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=CardType.SOCIAL_MEDIA_SNIPPETS,
    output_content_type=ContentType.TEXT,
    model_tier=ModelTier.STANDARD,
)

PODCAST_DESCRIPTION_CAPABILITY = AgentCapability(
    agent_id="podcast_description",
    agent_name="Podcast Description",
    description="Draft engaging show notes, timestamps, and episode descriptions for your podcast.",
    category="content",
    reads_from_context=["brand_name", "voice_profile"],
    writes_to_context=[],
    needs_providers=[ProviderCapability.TEXT],
    produces_card_type=CardType.PODCAST_DESCRIPTION,
    output_content_type=ContentType.TEXT,
    model_tier=ModelTier.QUALITY,
)

AGENT_REGISTRY: Dict[str, AgentCapability] = {
    "intent_detection": INTENT_DETECTION_CAPABILITY,
    "agent_router": AGENT_ROUTER_CAPABILITY,
    "context_manager": CONTEXT_MANAGER_CAPABILITY,
    "brand_naming": BRAND_NAMING_CAPABILITY,
    "tagline_slogan": TAGLINE_CAPABILITY,
    "brand_identity": BRAND_IDENTITY_CAPABILITY,
    "brand_voice_analyzer": BRAND_VOICE_CAPABILITY,
    "target_audience": TARGET_AUDIENCE_CAPABILITY,
    "brand_guardian": BRAND_GUARDIAN_CAPABILITY,
    "logo_designer": LOGO_DESIGNER_CAPABILITY,
    "hero_image": HERO_IMAGE_CAPABILITY,
    "product_photoshoot": PRODUCT_PHOTOSHOOT_CAPABILITY,
    "social_visuals": SOCIAL_VISUALS_CAPABILITY,
    "ad_creative": AD_CREATIVE_CAPABILITY,
    "image_editor": IMAGE_EDITOR_CAPABILITY,
    "multi_platform_resize": MULTI_PLATFORM_RESIZE_CAPABILITY,
    "video_generation": VIDEO_GENERATION_CAPABILITY,
    "image_to_video": IMAGE_TO_VIDEO_CAPABILITY,
    "social_video": SOCIAL_VIDEO_CAPABILITY,
    "ad_copywriter": AD_COPY_CAPABILITY,
    "blog_writer": BLOG_WRITER_CAPABILITY,
    "email_campaign": EMAIL_CAMPAIGN_CAPABILITY,
    "landing_page": LANDING_PAGE_CAPABILITY,
    "product_description": PRODUCT_DESCRIPTION_CAPABILITY,
    "seo_aeo_optimizer": SEO_AEO_CAPABILITY,
    "quality_score": QUALITY_SCORE_CAPABILITY,
    "content_repurpose": CONTENT_REPURPOSE_CAPABILITY,
    "mockup_generator": MOCKUP_GENERATOR_CAPABILITY,
    "video_ad": VIDEO_AD_CAPABILITY,
    "video_script": VIDEO_SCRIPT_CAPABILITY,
    "video_description": VIDEO_DESCRIPTION_CAPABILITY,
    "audio_summarizer": AUDIO_SUMMARIZER_CAPABILITY,
    "social_media_snippets": SOCIAL_MEDIA_SNIPPETS_CAPABILITY,
    "podcast_description": PODCAST_DESCRIPTION_CAPABILITY,
}
