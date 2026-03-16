from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, field_validator
from app.models.base import BaseAgentInput, BaseAgentOutput

# --- CATEGORY 6: CONTENT & COPY (48-59) ---

class ContentInput(BaseAgentInput):
    agent_id: Literal[
        "blog_post", "email_campaign", "newsletter", "press_release",
        "whitepaper", "landing_page", "product_description",
        "case_study", "faq_generator", "sms_marketing",
        "content_audit",
        # legacy aliases
        "landing_page_copy", "testimonial_writer", "script_writer",
        "ebook_outline", "web_copy"
    ]
    topic: str
    target_length_words: Optional[int] = None
    tone_override: Optional[str] = None
    audience_selection: Optional[str] = None # Persona name
    # New Phase 3 modifiers
    call_to_action: Optional[str] = None
    keywords: List[str] = []
    seo_intent: Optional[str] = None
    email_count: Optional[int] = None
    newsletter_goal: Optional[str] = None
    sections_to_include: Optional[List[str]] = None
    issue_theme: Optional[str] = None
    page_sections: Optional[List[str]] = None
    customer_name: Optional[str] = None
    results_metrics: Optional[str] = None
    problem_statement: Optional[str] = None
    announcement_date: Optional[str] = None
    quote_source: Optional[str] = None
    boilerplate: Optional[str] = None
    thesis: Optional[str] = None
    source_requirements: Optional[str] = None
    audience_level: Optional[str] = None
    feature_list: Optional[List[str]] = None
    specs: Optional[str] = None
    question_count: Optional[int] = None
    source_material: Optional[str] = None
    support_stage: Optional[str] = None
    link_url: Optional[str] = None
    character_limit: Optional[int] = None
    urgency_level: Optional[str] = None
    content_count: Optional[int] = None
    content_inventory_url: Optional[str] = None
    audit_goal: Optional[str] = None


class ContentOutput(BaseAgentOutput):
    title: str
    sections: List[Dict[str, str]]           # [{"heading": "...", "content": "..."}]
    meta_description: Optional[str] = None
    suggested_images: List[str] = []

# --- CATEGORY 7: ADVERTISING COPY (60-67) ---

class AdCopyInput(BaseAgentInput):
    agent_id: Literal[
        "meta_ads", "google_search_ads", "google_display_ads",
        "linkedin_lead_gen", "pinterest_ads", "tiktok_ads",
        "youtube_ads", "amazon_ppc",
        # legacy aliases
        "meta_ad_copy", "google_search_ad", "display_ad_copy",
        "linkedin_ad_copy", "twitter_ad_copy", "tiktok_ad_script",
        "pinterest_ad", "youtube_ad_copy"
    ]
    product_name: str
    offer: str
    benefit_focus: str = "emotional"        # "rational", "emotional", "scarcity", "social_proof"
    tone_override: Optional[str] = None
    target_audience: Optional[str] = None
    cta: Optional[str] = None
    keyword_theme: Optional[str | List[str]] = None
    image_angle: Optional[str] = None
    lead_asset: Optional[str] = None
    destination_url: Optional[str] = None
    creator_style: Optional[str] = None
    video_hook: Optional[str] = None
    target_keywords: List[str] = []

    @field_validator("keyword_theme", mode="before")
    @classmethod
    def normalize_keyword_theme(cls, value):
        if value is None:
            return None
        if isinstance(value, list):
            items = [str(item).strip() for item in value if str(item).strip()]
            return ", ".join(items) if items else None
        if isinstance(value, dict):
            items = [f"{k}: {v}" for k, v in value.items() if str(k).strip() and str(v).strip()]
            return ", ".join(items) if items else None
        text = str(value).strip()
        return text or None


class AdCopyOutput(BaseAgentOutput):
    variations: List[Dict[str, str]]         # [{"headline": "...", "body": "...", "cta": "..."}]

# --- CATEGORY 8: SEO & AEO (68-71) ---

class SEOInput(BaseAgentInput):
    agent_id: Literal["keyword_researcher", "on_page_seo", "technical_seo", "backlink_strategy", "aeo_optimizer"]
    url_to_analyze: Optional[str] = None
    target_keywords: List[str] = []
    competitor_urls: List[str] = []
    search_intent: str = "informational"    # "informational", "navigational", "commercial", "transactional"
    target_audience: Optional[str] = None
    region: Optional[str] = None
    seed_keywords: List[str] = []
    site_url: Optional[str] = None
    page_title: Optional[str] = None
    page_content: Optional[str] = None
    meta_description: Optional[str] = None
    sitemap_url: Optional[str] = None
    robots_txt_url: Optional[str] = None
    crawl_export: Optional[str] = None
    faq_content: Optional[str] = None
    entity_targets: List[str] = []
    answer_questions: List[str] = []


class SEOOutput(BaseAgentOutput):
    recommendations: List[Any] = []
    score: Optional[int] = None                  # 0-100 (only when provided)
    technical_fixes: List[Any] = []
    suggested_keywords: List[Any] = []
    title_tag: Optional[str] = None
    meta_description: Optional[str] = None
    heading_structure: List[Any] = []
    internal_links: List[Any] = []
    schema_markup_suggestions: List[Any] = []
    faq_list: List[Any] = []
    entity_targets: List[Any] = []
    aeo_strategy: Optional[str] = None
