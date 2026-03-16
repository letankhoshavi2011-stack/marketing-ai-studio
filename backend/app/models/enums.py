from enum import Enum

class CardType(str, Enum):
    BRAND_NAME = "brand_name"
    TAGLINE = "tagline"
    BRAND_IDENTITY = "brand_identity"
    BRAND_VOICE = "brand_voice"
    TARGET_AUDIENCE = "target_audience"
    LOGO = "logo"
    HERO_IMAGE = "hero_image"
    PRODUCT_PHOTO = "product_photo"
    SOCIAL_POST_IG = "social_post_ig"
    SOCIAL_POST_FB = "social_post_fb"
    SOCIAL_POST_LINKEDIN = "social_post_linkedin"
    SOCIAL_POST_TWITTER = "social_post_twitter"
    AD_COPY = "ad_copy"
    AD_COPY_GOOGLE = "ad_copy_google"
    AD_COPY_META = "ad_copy_meta"
    AD_COPY_LINKEDIN = "ad_copy_linkedin"
    AD_CREATIVE = "ad_creative"
    BLOG_POST = "blog_post"
    EMAIL_CAMPAIGN = "email_campaign"
    LANDING_PAGE = "landing_page"
    PRODUCT_DESCRIPTION = "product_description"
    VIDEO = "video"
    VIDEO_SOCIAL = "video_social"
    MOCKUP = "mockup"
    SEO_REPORT = "seo_report"
    CUSTOM = "custom"
    TEXT_EDITOR = "text_editor"
    # New Video/Audio Types
    VIDEO_AD = "video_ad"
    VIDEO_SCRIPT = "video_script"
    VIDEO_DESCRIPTION = "video_description"
    AUDIO_SUMMARIZER = "audio_summarizer"
    SOCIAL_MEDIA_SNIPPETS = "social_media_snippets"
    PODCAST_DESCRIPTION = "podcast_description"


class CardStatus(str, Enum):
    EMPTY = "empty"
    GENERATING = "generating"
    DRAFT = "draft"
    NEEDS_UPDATE = "needs_update"
    FINAL = "final"


class ContentType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    MIXED = "mixed"         # text + image combo (e.g., social post)
    STRUCTURED = "structured"  # JSON-like (brand identity, audience personas)


class ModelTier(str, Enum):
    FAST = "fast"           # Cheap, quick — drafts, orchestration
    STANDARD = "standard"   # Default generation
    QUALITY = "quality"     # High-quality finals


class ProviderCapability(str, Enum):
    TEXT = "text"
    IMAGE_GENERATE = "image_generate"
    IMAGE_EDIT = "image_edit"
    IMAGE_FUSION = "image_fusion"      # Multi-image compositing
    IMAGE_TEXT_RENDER = "image_text_render"  # Text-in-image
    VIDEO_GENERATE = "video_generate"
    IMAGE_TO_VIDEO = "image_to_video"


class AgentMode(str, Enum):
    PANEL = "panel"         # Structured form input → structured output
    CHAT = "chat"           # Freeform text input → streamed output
