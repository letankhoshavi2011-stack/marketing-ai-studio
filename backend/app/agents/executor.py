import time
from typing import Any, Dict, List, Optional
from app.models.base import BaseAgentInput, BaseAgentOutput, ScrapedURL, KBDocument
from app.models.context import WorkspaceContext
from app.services.scraper import ScraperService
from app.services.kb_processor import KBProcessorService
from app.agents.registry import registry
from app.agents.base import BaseV4Agent

class AgentExecutorCore:
    """
    Generic executor for all core agents.
    Orchestrates the pre-processing and actual generation.
    """

    @staticmethod
    async def execute(
        agent_id: str,
        input_data: Dict[str, Any],
        workspace_id: str,
        user_id: str,
        workspace_context: Optional[Dict[str, Any]] = None,
        files: List[tuple] = [] # (filename, content_bytes)
    ) -> BaseAgentOutput:
        start_time = time.time()
        
        # 1. Get Agent Metadata
        meta = registry.get_agent(agent_id)
        if not meta:
            raise ValueError(f"Agent {agent_id} not found in core registry.")

        # 2. Pre-process: Scrape URLs (skip if already scraped by api_router)
        if not input_data.get("scraped_content"):
            urls = input_data.get("urls_to_scrape", [])
            if urls:
                scraped_content = await ScraperService.scrape_multiple(urls)
                input_data["scraped_content"] = scraped_content

        # 3. Pre-process: KB Documents (skip if already loaded by api_router)
        if files and not input_data.get("kb_documents"):
            kb_docs = await KBProcessorService.process_uploads(files)
            input_data["kb_documents"] = kb_docs

        # 4. Prepare Input Model
        # Merge shared fields into input_data
        input_data["workspace_id"] = workspace_id
        input_data["workspace_context"] = workspace_context
        
        agent_input = meta.input_model(**input_data)

        # 5. Load and Run Concrete Agent
        # Mapping agent_id to class (this will be handled by a factory or registry)
        agent_instance = await AgentExecutorCore._get_agent_instance(agent_id)
        
        output = await agent_instance.generate(agent_input)
        
        # 6. Finalize Metadata
        output.processing_time_ms = int((time.time() - start_time) * 1000)
        
        return output

    @staticmethod
    async def _get_agent_instance(agent_id: str) -> BaseV4Agent:
        """
        Factory method to return the concrete agent instance.
        """
        # Category 1: Brand
        if agent_id == "brand_identity":
            from app.agents.brand.brand_identity import BrandIdentityAgent
            return BrandIdentityAgent()
        elif agent_id == "brand_naming":
            from app.agents.brand.brand_naming import BrandNamingAgent
            return BrandNamingAgent()
        elif agent_id == "tagline_slogan":
            from app.agents.brand.tagline_slogan import TaglineSloganAgent
            return TaglineSloganAgent()
        elif agent_id == "target_audience":
            from app.agents.brand.target_audience import TargetAudienceAgent
            return TargetAudienceAgent()
        elif agent_id == "brand_voice":
            from app.agents.brand.brand_voice import BrandVoiceAgent
            return BrandVoiceAgent()
        elif agent_id == "brand_guardian":
            from app.agents.brand.brand_guardian import BrandGuardianAgent
            return BrandGuardianAgent()

        # Category 2: Strategy
        elif agent_id == "creative_direction":
            from app.agents.strategy.creative_direction import CreativeDirectionAgent
            return CreativeDirectionAgent()
        elif agent_id == "campaign_concept":
            from app.agents.strategy.campaign_concept import CampaignConceptAgent
            return CampaignConceptAgent()
        elif agent_id == "content_calendar":
            from app.agents.strategy.content_calendar import ContentCalendarAgent
            return ContentCalendarAgent()

        # Category 3: Visual
        elif agent_id == "logo_designer":
            from app.agents.visual.logo_designer import LogoDesignerAgent
            return LogoDesignerAgent()
        elif agent_id == "hero_image":
            from app.agents.visual.hero_image import HeroImageAgent
            return HeroImageAgent()
        elif agent_id == "product_photoshoot":
            from app.agents.visual.product_photoshoot import ProductPhotoshootAgent
            return ProductPhotoshootAgent()
        elif agent_id == "ad_creative":
            from app.agents.visual.ad_creative import AdCreativeAgent
            return AdCreativeAgent()
        elif agent_id == "image_editor":
            from app.agents.visual.image_editor import ImageEditorAgent
            return ImageEditorAgent()
        elif agent_id == "mockup_generator":
            from app.agents.visual.mockup_generator import MockupGeneratorAgent
            return MockupGeneratorAgent()
        elif agent_id == "infographic":
            from app.agents.visual.infographic import InfographicAgent
            return InfographicAgent()
        # Category 4: Social Media
        elif agent_id in ["instagram_post", "instagram_story", "instagram_reel", "instagram_carousel", "instagram_bio"]:
            from app.agents.social.instagram_agent import InstagramAgent
            return InstagramAgent()
        elif agent_id in ["facebook_post", "facebook_ad_copy"]:
            from app.agents.social.facebook_agent import FacebookAgent
            return FacebookAgent()
        elif agent_id in ["linkedin_post", "linkedin_article", "linkedin_ad"]:
            from app.agents.social.linkedin_agent import LinkedInAgent
            return LinkedInAgent()
        elif agent_id in ["twitter_tweet", "twitter_thread", "twitter_ad"]:
            from app.agents.social.twitter_agent import TwitterAgent
            return TwitterAgent()
        elif agent_id in ["pinterest_pin", "pinterest_ad", "tiktok_script", "tiktok_trend", "tiktok_ad"]:
            from app.agents.social.pinterest_tiktok_agent import PinterestTikTokAgent
            return PinterestTikTokAgent()
        
        # Category 5: Video & Motion (8)
        elif agent_id in ["video_ad_script", "youtube_script", "ai_video_gen", "video_summarizer", "caption_generator", "thumbnail_idea", "video_trend_analyzer"]:
            from app.agents.video.video_agent import VideoAgent
            return VideoAgent()
        
        # Category 6: Content & Copy (12)
        elif agent_id == "blog_post":
            from app.agents.content.blog_agent import BlogAgent
            return BlogAgent()
        elif agent_id in ["email_campaign", "newsletter"]:
            from app.agents.content.email_agent import EmailAgent
            return EmailAgent()
        elif agent_id in ["landing_page", "case_study", "press_release", "whitepaper", "product_description", "faq_generator", "sms_marketing", "content_audit"]:
            from app.agents.content.copy_utility_agent import CopyUtilityAgent
            return CopyUtilityAgent()
        
        # Category 7: Advertising Copy (8)
        elif agent_id in ["meta_ads", "google_search_ads", "google_display_ads", "linkedin_lead_gen", "pinterest_ads", "tiktok_ads", "youtube_ads", "amazon_ppc"]:
            from app.agents.ads.ad_copy_agent import AdCopyAgent
            return AdCopyAgent()
        
        # Category 8: SEO & AEO (4)
        elif agent_id in ["keyword_researcher", "on_page_seo", "technical_seo", "aeo_optimizer"]:
            from app.agents.seo.seo_agent import SEOAgent
            return SEOAgent()
        
        # Category 9: Audio & Podcast
        elif agent_id in ["podcast_script", "podcast_description"]:
            from app.agents.audio.audio_agent import AudioAgent
            return AudioAgent()
            
        # Category 10: Adaptation & Utilities
        elif agent_id in ["custom_workflow"]:
            from app.agents.adaptation.utility_agent import UtilityAgent
            return UtilityAgent()

        # Category 11: Growth & Strategy (12)
        elif agent_id in [
            "pricing_strategy", "launch_strategy", "cold_email", "email_sequence",
            "page_cro", "ab_test_setup", "marketing_psychology", "content_strategy",
            "competitor_alternatives", "seo_audit", "schema_markup", "referral_program",
        ]:
            from app.agents.growth.growth_agent import GrowthStrategyAgent
            return GrowthStrategyAgent()

        raise NotImplementedError(f"Agent implementation not found for {agent_id}")
