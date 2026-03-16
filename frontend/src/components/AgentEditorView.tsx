/**
 * AgentEditorView — Full-screen split editor.
 * Left (40%): Agent form
 * Right (60%): Output + version history sidebar + draft/finalize controls
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ArrowLeft, Sparkles, RefreshCw, CheckCircle as CheckCircleIcon, Clock,
    Save, ChevronRight, ChevronDown, History, X, Download, Copy, Check, Trash2, ClipboardList,
    Layout, Settings, FileText as FileTextIcon, Image,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { cardsApi, agentApi, canvasApi } from '../services/api';
import { AGENT_CATEGORIES } from '../data/agents';
import { AppLogo } from './Icons';
import ConfirmDialog from './ConfirmDialog';
import { BrandIdentityOutput } from './Core/agents/BrandIdentityOutput';
import { LogoDesignerOutput } from './Core/agents/LogoDesignerOutput';
import { SEOOutput } from './Core/agents/SEOOutput';

import { AgentForm } from './Core/AgentForm';
import { BrandIdentityForm } from './Core/agents/BrandIdentityForm';
import RichTextEditor from './RichTextEditor';
import MediaSlider from './MediaSlider';
import SocialPostGrid from './SocialPostGrid';
import type { SocialPostData } from './SocialPostCard';
import { SmartOutput } from './Core/agents/SmartOutput';
import { VisualOutput } from './Core/agents/VisualOutput';
import { HeroImageOutput } from './Core/agents/HeroImageOutput';
import { AdCreativeOutput } from './Core/agents/AdCreativeOutput';
import { ProductPhotoshootOutput } from './Core/agents/ProductPhotoshootOutput';
import { MockupGeneratorOutput } from './Core/agents/MockupGeneratorOutput';
import { KeywordResearcherOutput } from './Core/agents/KeywordResearcherOutput';
import { OnPageSEOOutput } from './Core/agents/OnPageSEOOutput';
import { TechnicalSEOOutput } from './Core/agents/TechnicalSEOOutput';
import { AeoOptimizerOutput } from './Core/agents/AeoOptimizerOutput';
import { BrandNamingOutput } from './Core/agents/BrandNamingOutput';
import { TaglineOutput } from './Core/agents/TaglineOutput';
import { TargetAudienceOutput } from './Core/agents/TargetAudienceOutput';
import { BrandVoiceOutput } from './Core/agents/BrandVoiceOutput';
import { BrandGuardianOutput } from './Core/agents/BrandGuardianOutput';
import { CampaignConceptOutput } from './Core/agents/CampaignConceptOutput';
import { ContentCalendarOutput } from './Core/agents/ContentCalendarOutput';
import { ImageGeneratorOutput } from './Core/agents/ImageGeneratorOutput';
import { GrowthOutput } from './Core/agents/GrowthOutput';
import { ColdEmailOutput } from './Core/agents/ColdEmailOutput';
import EmailSequenceOutput from './Core/agents/EmailSequenceOutput';
import { LaunchStrategyOutput } from './Core/agents/LaunchStrategyOutput';
import { ContentOutput } from './Core/agents/ContentOutput';
import { VideoScriptOutput } from './Core/agents/VideoScriptOutput';
import { AdCopyOutput } from './Core/agents/AdCopyOutput';
import { CreativeDirectionOutput } from './Core/agents/CreativeDirectionOutput';
import { ImageEditorOutput } from './Core/agents/ImageEditorOutput';
import { InfographicOutput } from './Core/agents/InfographicOutput';
import { PodcastAudioOutput } from './Core/agents/PodcastAudioOutput';
import { PricingStrategyOutput } from './Core/agents/PricingStrategyOutput';
import { PageCROOutput } from './Core/agents/PageCROOutput';
import { ABTestSetupOutput } from './Core/agents/ABTestSetupOutput';
import { MarketingPsychologyOutput } from './Core/agents/MarketingPsychologyOutput';
import { ContentStrategyOutput } from './Core/agents/ContentStrategyOutput';
import { CompetitorAlternativesOutput } from './Core/agents/CompetitorAlternativesOutput';
import { SEOAuditOutput } from './Core/agents/SEOAuditOutput';
import { SchemaMarkupOutput } from './Core/agents/SchemaMarkupOutput';
import ReferralProgramOutput from './Core/agents/ReferralProgramOutput';
// B6: Individual Content & Copy output components
import { BlogPostOutput } from './Core/agents/BlogPostOutput';
import { EmailCampaignOutput } from './Core/agents/EmailCampaignOutput';
import { NewsletterOutput } from './Core/agents/NewsletterOutput';
import { LandingPageOutput } from './Core/agents/LandingPageOutput';
import { CaseStudyOutput } from './Core/agents/CaseStudyOutput';
import { PressReleaseOutput } from './Core/agents/PressReleaseOutput';
import { WhitepaperOutput } from './Core/agents/WhitepaperOutput';
import { ProductDescriptionOutput } from './Core/agents/ProductDescriptionOutput';
import { FaqGeneratorOutput } from './Core/agents/FaqGeneratorOutput';
import { SmsMarketingOutput } from './Core/agents/SmsMarketingOutput';
import { ContentAuditOutput } from './Core/agents/ContentAuditOutput';
// B6: Individual Advertising output components
import { MetaAdsOutput } from './Core/agents/MetaAdsOutput';
import { GoogleSearchAdsOutput } from './Core/agents/GoogleSearchAdsOutput';
import { GoogleDisplayAdsOutput } from './Core/agents/GoogleDisplayAdsOutput';
import { LinkedInLeadGenOutput } from './Core/agents/LinkedInLeadGenOutput';
import { PinterestAdsOutput } from './Core/agents/PinterestAdsOutput';
import { TikTokAdsOutput } from './Core/agents/TikTokAdsOutput';
import { YouTubeAdsOutput } from './Core/agents/YouTubeAdsOutput';
import { AmazonPPCOutput } from './Core/agents/AmazonPPCOutput';
// B6: Individual Video & Motion output components
import { VideoAdScriptOutput } from './Core/agents/VideoAdScriptOutput';
import { YouTubeScriptOutput } from './Core/agents/YouTubeScriptOutput';
import { AiVideoGenOutput } from './Core/agents/AiVideoGenOutput';
import { VideoSummarizerOutput } from './Core/agents/VideoSummarizerOutput';
import { CaptionGeneratorOutput } from './Core/agents/CaptionGeneratorOutput';
import { ThumbnailIdeaOutput } from './Core/agents/ThumbnailIdeaOutput';
import { VideoTrendAnalyzerOutput } from './Core/agents/VideoTrendAnalyzerOutput';
// B6: Individual Audio output components
import { PodcastScriptOutput } from './Core/agents/PodcastScriptOutput';
import { PodcastDescriptionOutput } from './Core/agents/PodcastDescriptionOutput';
// B6: Individual Social Media output components
import { InstagramPostOutput } from './Core/agents/InstagramPostOutput';
import { InstagramStoryOutput } from './Core/agents/InstagramStoryOutput';
import { InstagramReelOutput } from './Core/agents/InstagramReelOutput';
import { InstagramCarouselOutput } from './Core/agents/InstagramCarouselOutput';
import { InstagramBioOutput } from './Core/agents/InstagramBioOutput';
import { FacebookPostOutput } from './Core/agents/FacebookPostOutput';
import { FacebookAdCopyOutput } from './Core/agents/FacebookAdCopyOutput';
import { LinkedInPostOutput } from './Core/agents/LinkedInPostOutput';
import { LinkedInArticleOutput } from './Core/agents/LinkedInArticleOutput';
import { LinkedInAdOutput } from './Core/agents/LinkedInAdOutput';
import { TwitterTweetOutput } from './Core/agents/TwitterTweetOutput';
import { TwitterThreadOutput } from './Core/agents/TwitterThreadOutput';
import { TwitterAdOutput } from './Core/agents/TwitterAdOutput';
import { PinterestPinOutput } from './Core/agents/PinterestPinOutput';
import { PinterestAdSocialOutput } from './Core/agents/PinterestAdSocialOutput';
import { TikTokScriptOutput } from './Core/agents/TikTokScriptOutput';
import { TikTokTrendOutput } from './Core/agents/TikTokTrendOutput';
import { TikTokAdSocialOutput } from './Core/agents/TikTokAdSocialOutput';
/* ─────────────────────────────────────── */
/* Status badge                            */
/* ─────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
    const isDraft = status === 'draft' || status === 'empty';
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: isDraft ? 'rgba(251,191,36,0.12)' : 'rgba(34,197,94,0.12)',
            color: isDraft ? '#f59e0b' : '#22c55e',
            border: `1px solid ${isDraft ? 'rgba(251,191,36,0.3)' : 'rgba(34,197,94,0.3)'}`,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
        }}>
            {isDraft ? <ClipboardList size={11} /> : <CheckCircleIcon size={11} />}
            {isDraft ? 'DRAFT' : 'FINAL'}
        </span>
    );
}

/* ─────────────────────────────────────── */
/* Version history sidebar item           */
/* ─────────────────────────────────────── */

function VersionItem({ version, index, isActive, onClick }: {
    version: any; index: number; isActive: boolean; onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                width: '100%', textAlign: 'left', padding: '10px 12px',
                background: isActive ? 'rgba(124,92,255,0.12)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(124,92,255,0.4)' : 'transparent'}`,
                borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? 'var(--primary)' : 'var(--text-primary)' }}>
                    v{index + 1}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {version.created_at
                        ? new Date(version.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'now'}
                </span>
            </div>
            <p style={{
                fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0 0',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
                {version.content?.slice?.(0, 60) || 'Version ' + (index + 1)}
            </p>
        </button>
    );
}

/* ─────────────────────────────────────── */
/* Main Component                         */
/* ─────────────────────────────────────── */

export default function AgentEditorView() {
    const {
        activeWorkspace, activeCampaign,
        agentEditorCardId, agentEditorAgentId,
        setCurrentView, setAgentEditor, removeCard, postEditorView,
        lastCardId,
    } = useAppStore();

    const backTarget = postEditorView || 'my-agents';
    const backLabel = backTarget === 'canvas' ? 'Back to Canvas' : 'Back to Agents';

    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [showSaveMenu, setShowSaveMenu] = useState(false);
    const [output, setOutput] = useState<any>(null);
    const [status, setStatus] = useState<'draft' | 'final'>('draft');
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    const [showAssetsSidebar, setShowAssetsSidebar] = useState(false);
    const [versions, setVersions] = useState<any[]>([]);
    const [activeVersionIdx, setActiveVersionIdx] = useState<number>(-1);
    const [cardId, setCardId] = useState<string | null>(agentEditorCardId);
    const [copied, setCopied] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [savedFormInputs, setSavedFormInputs] = useState<any>(null);
    const [currentFormData, setCurrentFormData] = useState<Record<string, any>>({});
    const [editorContent, setEditorContent] = useState<string>('');

    // Mobile specific state
    const [mobileTab, setMobileTab] = useState<'form' | 'result'>('form');
    const isMobile = window.innerWidth <= 768;

    const mediaItems = useMemo(() => {
        if (!output) return [];
        const items: { type: 'image' | 'video'; url: string }[] = [];

        const getFileType = (url: string): 'image' | 'video' => {
            const ext = url.split('.').pop()?.toLowerCase();
            if (['mp4', 'webm', 'ogg', 'mov'].includes(ext || '')) return 'video';
            return 'image';
        };

        if (output.images && Array.isArray(output.images)) {
            output.images.forEach((url: string) => items.push({ type: 'image', url }));
        }
        if (output.videos && Array.isArray(output.videos)) {
            output.videos.forEach((url: string) => items.push({ type: 'video', url }));
        }
        if (output.media && Array.isArray(output.media)) {
            output.media.forEach((m: any) => {
                if (typeof m === 'string') items.push({ type: getFileType(m), url: m });
                else if (m.url) items.push({ type: m.type || getFileType(m.url), url: m.url });
            });
        }
        if (output.assets && Array.isArray(output.assets)) {
            output.assets.forEach((asset: any) => {
                if (asset.gcs_url) {
                    items.push({
                        type: asset.asset_type === 'video' ? 'video' : 'image',
                        url: asset.gcs_url
                    });
                }
            });
        }
        if (output.image_url) items.push({ type: 'image', url: output.image_url });
        if (output.video_url) items.push({ type: 'video', url: output.video_url });

        return items;
    }, [output]);

    const agentId = agentEditorAgentId || '';
    const agentDef = AGENT_CATEGORIES.flatMap(c => c.agents).find(a => a.id === agentId);
    const outputMode = agentDef?.outputMode || 'text';
    const outputIncludesText = outputMode === 'structured-text' || outputMode.includes('text');
    const outputIncludesMedia = outputMode === 'image' || outputMode === 'video' || outputMode.includes('image') || outputMode.includes('video');
    const isBrandIdentity = agentId === 'brand_identity';
    const isLogoDesigner = agentId === 'logo_designer';
    const isHeroImage = agentId === 'hero_image';

    const SOCIAL_AGENT_IDS = new Set([
        'instagram_post', 'instagram_story', 'instagram_reel', 'instagram_carousel', 'instagram_bio',
        'facebook_post', 'facebook_ad_copy',
        'linkedin_post', 'linkedin_article', 'linkedin_ad',
        'twitter_tweet', 'twitter_thread', 'twitter_ad',
        'pinterest_pin', 'pinterest_ad',
        'tiktok_script', 'tiktok_trend', 'tiktok_ad',
    ]);
    const isSocialAgent = SOCIAL_AGENT_IDS.has(agentId);

    const socialPosts: SocialPostData[] = useMemo(() => {
        if (!output || !isSocialAgent) return [];
        // Prefer posts[] array
        if (output.posts && Array.isArray(output.posts) && output.posts.length > 0) {
            return output.posts;
        }
        // Fallback: single post
        if (output.post) {
            return [{ ...output.post, post_index: 0, assets: output.post.assets || [] }];
        }
        // Fallback: tweets array (Twitter agents)
        if (output.tweets && Array.isArray(output.tweets)) {
            return output.tweets.map((t: string, i: number) => ({
                platform: 'Twitter',
                caption: t,
                image_prompts: [],
                video_prompts: [],
                hashtags: [],
                posting_time_suggestion: '',
                post_index: i,
                assets: [],
            }));
        }
        return [];
    }, [output, isSocialAgent]);

    const logoImages = useMemo(
        () => mediaItems.filter((m) => m.type === 'image'),
        [mediaItems]
    );

    const structuredOutput = useMemo(() => {
        // Priority: version metadata > current output
        const versionData = versions[activeVersionIdx]?.metadata?.structured_data;
        const fullOutput = output || {};

        // Start with whichever data source is available
        let base: any = versionData || fullOutput;
        if (typeof base === 'string') {
            try { base = JSON.parse(base); } catch { base = { text_content: base }; }
        }
        if (!base || typeof base !== 'object') return null;

        // Merge all layers so components always see both Pydantic model fields
        // (variations, scenes, score, script_segments) AND raw LLM JSON fields
        const result = { ...fullOutput, ...base };

        // If there's a nested structured_data (Growth agents store raw LLM JSON here),
        // spread it on top so all LLM fields are accessible
        if (result.structured_data && typeof result.structured_data === 'object') {
            Object.assign(result, result.structured_data);
        }

        return Object.keys(result).length > 0 ? result : null;
    }, [versions, activeVersionIdx, output]);

    const hideEditorAgents = useMemo(() => new Set([
        'brand_naming', 'target_audience', 'tagline_slogan',
        'keyword_researcher', 'on_page_seo', 'technical_seo', 'aeo_optimizer', 'seo_audit',
        'brand_identity', 'brand_voice', 'brand_guardian',
        'creative_direction', 'campaign_concept', 'content_calendar',
        'logo_designer', 'hero_image', 'ad_creative', 'product_photoshoot', 'mockup_generator', 'image_generator', 'image_editor', 'infographic',
        'pricing_strategy', 'launch_strategy', 'content_strategy', 'marketing_ideas', 'marketing_psychology',
        'analytics_tracking', 'free_tool_strategy', 'product_marketing_context', 'copywriting', 'social_content',
        'paid_ads', 'site_architecture', 'schema_markup', 'ai_seo', 'competitor_alternatives', 'programmatic_seo',
        'ab_test_setup', 'form_cro', 'onboarding_cro', 'paywall_upgrade_cro', 'popup_cro', 'signup_flow_cro',
        'churn_prevention', 'email_sequence', 'referral_program', 'revops', 'sales_enablement',
        'growth_strategy', 'meta_ads', 'google_search_ads', 'google_display_ads', 'linkedin_lead_gen', 'pinterest_ads', 'tiktok_ads', 'youtube_ads', 'amazon_ppc',
        'podcast_script', 'podcast_description', 'video_summarizer',
        'cold_email', 'page_cro',
        'blog_post', 'email_campaign', 'newsletter', 'landing_page', 'case_study', 'press_release', 'whitepaper', 'product_description', 'faq_generator', 'sms_marketing', 'content_audit',
        'video_ad_script', 'youtube_script', 'ai_video_gen', 'video_trend_analyzer', 'caption_generator', 'thumbnail_idea',
    ]), []);


    const renderStructuredOutput = () => {
        if (!structuredOutput || isSocialAgent) return null;
        switch (agentId) {
            case 'brand_naming': return <BrandNamingOutput data={structuredOutput} />;
            case 'target_audience': return <TargetAudienceOutput data={structuredOutput} />;
            case 'tagline_slogan': return <TaglineOutput data={structuredOutput} />;
            case 'keyword_researcher': return <KeywordResearcherOutput data={structuredOutput} />;
            case 'on_page_seo': return <OnPageSEOOutput data={structuredOutput} />;
            case 'technical_seo': return <TechnicalSEOOutput data={structuredOutput} />;
            case 'aeo_optimizer': return <AeoOptimizerOutput data={structuredOutput} />;
            case 'brand_voice': return <BrandVoiceOutput data={structuredOutput} />;
            case 'brand_guardian': return <BrandGuardianOutput data={structuredOutput} />;
            case 'creative_direction': return <CreativeDirectionOutput data={structuredOutput} />;
            case 'campaign_concept': return <CampaignConceptOutput data={structuredOutput} />;
            case 'content_calendar': return <ContentCalendarOutput data={structuredOutput} />;
            case 'logo_designer': return <LogoDesignerOutput images={mediaItems} status={status as 'draft' | 'final'} data={{ ...(structuredOutput || {}), assets: mediaItems }} />;
            case 'image_generator': return <ImageGeneratorOutput data={{ ...(structuredOutput || {}), assets: mediaItems }} />;
            case 'image_editor': return <ImageEditorOutput data={{ ...(structuredOutput || {}), assets: mediaItems }} />;
            case 'infographic': return <InfographicOutput data={{ ...(structuredOutput || {}), assets: mediaItems }} />;
            case 'cold_email':
                return <ColdEmailOutput data={structuredOutput} />;
            case 'email_sequence':
                return <EmailSequenceOutput data={structuredOutput} />;
            case 'pricing_strategy': return <PricingStrategyOutput data={structuredOutput} />;
            case 'content_strategy': return <ContentStrategyOutput data={structuredOutput} />;
            case 'marketing_psychology': return <MarketingPsychologyOutput data={structuredOutput} />;
            case 'schema_markup': return <SchemaMarkupOutput data={structuredOutput} />;
            case 'competitor_alternatives': return <CompetitorAlternativesOutput data={structuredOutput} />;
            case 'ab_test_setup': return <ABTestSetupOutput data={structuredOutput} />;
            case 'page_cro': return <PageCROOutput data={structuredOutput} />;
            case 'referral_program': return <ReferralProgramOutput data={structuredOutput} />;
            case 'seo_audit': return <SEOAuditOutput data={structuredOutput} />;
            case 'marketing_ideas':
            case 'analytics_tracking':
            case 'free_tool_strategy':
            case 'product_marketing_context':
            case 'copywriting':
            case 'social_content':
            case 'paid_ads':
            case 'site_architecture':
            case 'ai_seo':
            case 'programmatic_seo':
            case 'form_cro':
            case 'onboarding_cro':
            case 'paywall_upgrade_cro':
            case 'popup_cro':
            case 'signup_flow_cro':
            case 'churn_prevention':
            case 'revops':
            case 'sales_enablement':
            case 'growth_strategy':
                return <GrowthOutput data={structuredOutput} />;
            case 'launch_strategy':
                return <LaunchStrategyOutput data={structuredOutput} />;
            case 'blog_post': return <BlogPostOutput data={structuredOutput} />;
            case 'email_campaign': return <EmailCampaignOutput data={structuredOutput} />;
            case 'newsletter': return <NewsletterOutput data={structuredOutput} />;
            case 'landing_page': return <LandingPageOutput data={structuredOutput} />;
            case 'case_study': return <CaseStudyOutput data={structuredOutput} />;
            case 'press_release': return <PressReleaseOutput data={structuredOutput} />;
            case 'whitepaper': return <WhitepaperOutput data={structuredOutput} />;
            case 'product_description': return <ProductDescriptionOutput data={structuredOutput} />;
            case 'faq_generator': return <FaqGeneratorOutput data={structuredOutput} />;
            case 'sms_marketing': return <SmsMarketingOutput data={structuredOutput} />;
            case 'content_audit': return <ContentAuditOutput data={structuredOutput} />;
            case 'video_ad_script': return <VideoAdScriptOutput data={structuredOutput} />;
            case 'youtube_script': return <YouTubeScriptOutput data={structuredOutput} />;
            case 'ai_video_gen': return <AiVideoGenOutput data={{ ...(structuredOutput || {}), assets: mediaItems }} />;
            case 'video_trend_analyzer': return <VideoTrendAnalyzerOutput data={structuredOutput} />;
            case 'caption_generator': return <CaptionGeneratorOutput data={structuredOutput} />;
            case 'thumbnail_idea': return <ThumbnailIdeaOutput data={{ ...(structuredOutput || {}), assets: mediaItems }} />;
            case 'podcast_script': return <PodcastScriptOutput data={structuredOutput} />;
            case 'podcast_description': return <PodcastDescriptionOutput data={structuredOutput} />;
            case 'video_summarizer': return <VideoSummarizerOutput data={structuredOutput} />;
            case 'hero_image': return <HeroImageOutput data={{ ...(structuredOutput || {}), assets: mediaItems }} />;
            case 'ad_creative': return <AdCreativeOutput data={{ ...(structuredOutput || {}), assets: mediaItems }} />;
            case 'product_photoshoot': return <ProductPhotoshootOutput data={{ ...(structuredOutput || {}), assets: mediaItems }} />;
            case 'mockup_generator': return <MockupGeneratorOutput data={{ ...(structuredOutput || {}), assets: mediaItems }} />;
            case 'meta_ads': return <MetaAdsOutput data={structuredOutput} />;
            case 'google_search_ads': return <GoogleSearchAdsOutput data={structuredOutput} />;
            case 'google_display_ads': return <GoogleDisplayAdsOutput data={structuredOutput} />;
            case 'linkedin_lead_gen': return <LinkedInLeadGenOutput data={structuredOutput} />;
            case 'pinterest_ads': return <PinterestAdsOutput data={structuredOutput} />;
            case 'facebook_ad_copy': return <FacebookAdCopyOutput data={structuredOutput} />;
            case 'tiktok_ads': return <TikTokAdsOutput data={structuredOutput} />;
            case 'youtube_ads': return <YouTubeAdsOutput data={structuredOutput} />;
            case 'amazon_ppc': return <AmazonPPCOutput data={structuredOutput} />;
            default: break;
        }
        if (outputIncludesText) return <SmartOutput data={structuredOutput} />;
        if (outputIncludesMedia && mediaItems.length > 0) return <MediaSlider items={mediaItems} />;
        return null;
    };

    const renderContentEditor = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(!isSocialAgent || socialPosts.length === 0) && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        Agent Response
                    </h3>
                    {status !== 'final' && (
                        <span style={{ fontSize: 11, color: 'var(--accent-1)', fontWeight: 600, textTransform: 'uppercase' }}>
                            Auto-saving draft...
                        </span>
                    )}
                </div>
            )}
            <RichTextEditor
                content={editorContent}
                onChange={(newContent) => {
                    setEditorContent(newContent);
                    setOutput({ ...output, text_content: newContent });
                }}
                editable={status !== 'final'}
            />
        </div>
    );

    /* ── Load existing card + versions if editing ── */
    useEffect(() => {
        if (agentEditorCardId && activeWorkspace && activeCampaign) {
            loadCard();
        }
    }, [agentEditorCardId]);

    const loadCard = async () => {
        if (!activeWorkspace || !activeCampaign || !agentEditorCardId) return;
        try {
            const card = await cardsApi.getCard(activeWorkspace.uuid, activeCampaign.id, agentEditorCardId);
            setStatus(card.status === 'final' ? 'final' : 'draft');

            // Load structured output if available
            if (card.metadata?.structured_data) {
                setOutput(card.metadata.structured_data);
                if (card.metadata.structured_data.text_content || card.metadata.structured_data.content) {
                    setEditorContent(card.metadata.structured_data.text_content || card.metadata.structured_data.content);
                }
            } else if (card.current_version?.content) {
                const text = card.current_version.content;
                setOutput({ text_content: text });
                setEditorContent(text);
            }

            // Restore saved form inputs
            if (card.metadata?.form_inputs) {
                setSavedFormInputs(card.metadata.form_inputs);
            }

            // Load version list
            try {
                const versionList = await cardsApi.getVersions(activeWorkspace.uuid, activeCampaign.id, agentEditorCardId);
                setVersions(Array.isArray(versionList) ? versionList : []);
                setActiveVersionIdx(versionList.length - 1);
            } catch { /* versions endpoint may not exist yet */ }
        } catch (err) {
            console.error('Failed to load card', err);
        }
    };

    /* ── Handle output from form generation ── */
    const handleGenerated = useCallback(async (newOutput: any) => {
        setOutput(newOutput);
        setStatus('draft');
        setIsGenerating(false);

        // Sync editor content — build from posts[] for social agents
        if (isSocialAgent && newOutput.posts && Array.isArray(newOutput.posts) && newOutput.posts.length > 0) {
            const combined = newOutput.posts.map((p: any, i: number) => {
                const parts = [`## Post ${i + 1} (${p.platform || ''})`, '', p.caption || ''];
                if (p.hashtags?.length > 0) parts.push('', p.hashtags.map((h: string) => h.startsWith('#') ? h : `#${h}`).join(' '));
                if (p.posting_time_suggestion) parts.push('', `*Best time: ${p.posting_time_suggestion}*`);
                return parts.join('\n');
            }).join('\n\n---\n\n');
            setEditorContent(newOutput.text_content || combined);
        } else if (newOutput.text_content || newOutput.content) {
            setEditorContent(newOutput.text_content || newOutput.content);
        } else if (newOutput.post?.caption) {
            setEditorContent(newOutput.post.caption);
        } else {
            setEditorContent('');
        }

        // Auto-create draft card if none exists
        await saveDraftCard(newOutput);
    }, [activeWorkspace, activeCampaign, cardId, agentId, agentDef, currentFormData, lastCardId, isSocialAgent]);

    const saveDraftCard = async (newOutput?: any) => {
        if (!activeWorkspace || !activeCampaign) return;
        const targetOutput = newOutput || output;
        if (!targetOutput) return;

        try {
            let content = '';

            // If we have editor content, use that as the primary content for the version
            if (editorContent && !isSocialAgent) {
                content = editorContent;
            } else if (isSocialAgent && targetOutput.posts && Array.isArray(targetOutput.posts) && targetOutput.posts.length > 0) {
                // Social agents: build markdown from posts array
                content = targetOutput.posts.map((p: any, i: number) => {
                    const parts = [`## Post ${i + 1} (${p.platform || ''})`, '', p.caption || ''];
                    if (p.hashtags?.length > 0) parts.push('', `**Hashtags:** ${p.hashtags.map((h: string) => h.startsWith('#') ? h : `#${h}`).join(' ')}`);
                    if (p.posting_time_suggestion) parts.push(`**Best time:** ${p.posting_time_suggestion}`);
                    const imgCount = (p.assets || []).filter((a: any) => a.asset_type === 'image').length;
                    const vidCount = (p.assets || []).filter((a: any) => a.asset_type === 'video').length;
                    if (imgCount || vidCount) parts.push('', `*Media: ${imgCount} image(s), ${vidCount} video(s)*`);
                    return parts.join('\n');
                }).join('\n\n---\n\n');
            } else {
                // Fallback reconstruction logic for non-brand agents if editor is empty
                const agentName = agentDef?.name || agentId.replace(/_/g, ' ');
                const topic = targetOutput.topic || currentFormData.topic || '';
                const textBody = targetOutput.text_content || targetOutput.content || '';
                const title = targetOutput.title || '';

                if (textBody) {
                    content = [
                        `# ${title || agentName}`,
                        topic ? `**Topic:** ${topic}` : '',
                        '',
                        textBody,
                    ].filter(Boolean).join('\n');
                } else if (targetOutput.sections && Array.isArray(targetOutput.sections)) {
                    content = [
                        `# ${title || agentName}`,
                        topic ? `**Topic:** ${topic}` : '',
                        '',
                        ...targetOutput.sections.map((s: any) => `## ${s.heading || ''}\n${s.content || ''}`),
                    ].filter(Boolean).join('\n\n');
                } else if (targetOutput.variations && Array.isArray(targetOutput.variations)) {
                    content = [
                        `# ${agentName}`,
                        '',
                        ...targetOutput.variations.map((v: any, i: number) =>
                            `### Variation ${i + 1}\n**Headline:** ${v.headline || ''}\n${v.body || ''}\n**CTA:** ${v.cta || ''}`
                        ),
                    ].join('\n\n');
                } else if (targetOutput.tweets && Array.isArray(targetOutput.tweets)) {
                    content = [
                        `# ${agentName}`,
                        '',
                        ...targetOutput.tweets.map((t: string, i: number) => `**Tweet ${i + 1}:** ${t}`),
                    ].join('\n\n');
                } else if (targetOutput.post) {
                    const p = targetOutput.post;
                    content = [
                        `# ${agentName}`,
                        '',
                        p.caption ? `${p.caption}` : '',
                        '',
                        p.hashtags?.length > 0 ? `**Hashtags:** ${p.hashtags.join(' ')}` : '',
                        p.posting_time_suggestion ? `**Best time:** ${p.posting_time_suggestion}` : '',
                    ].filter(Boolean).join('\n');
                }
            }
            if (!content) content = JSON.stringify(targetOutput, null, 2);

            // Use current form data from callback
            const contextMetadata = targetOutput.context_metadata || {};
            const formInputs = {
                ...currentFormData,
                ...(contextMetadata.selected_kb_document_ids
                    ? { selected_kb_document_ids: contextMetadata.selected_kb_document_ids }
                    : {}),
            };

            if (!cardId) {
                // Create card for first time
                const card = await cardsApi.create(activeWorkspace.uuid, activeCampaign.id, {
                    card_type: 'custom',
                    title: agentDef?.name || agentId,
                    position: 0,
                    agent_used: agentId,
                    metadata: { structured_data: targetOutput, form_inputs: formInputs, is_core: true },
                });
                setCardId(card.id);

                // Auto-connect to previous node
                if (lastCardId && lastCardId !== card.id) {
                    try {
                        const existingEdges = await canvasApi.loadEdges(activeWorkspace.uuid, activeCampaign.id).catch(() => []);
                        const newEdge = { id: `e-${lastCardId}-${card.id}`, source: lastCardId, target: card.id };
                        await canvasApi.saveEdges(activeWorkspace.uuid, activeCampaign.id, [...existingEdges, newEdge]);
                    } catch (err) {
                        console.error('Auto-connect failed', err);
                    }
                }

                await cardsApi.addVersion(activeWorkspace.uuid, activeCampaign.id, card.id, {
                    content,
                    metadata: { structured_data: targetOutput, form_inputs: formInputs },
                });
                const versionList = await cardsApi.getVersions(activeWorkspace.uuid, activeCampaign.id, card.id).catch(() => []);
                setVersions(Array.isArray(versionList) ? versionList : []);
                setActiveVersionIdx((versionList as any[]).length - 1);
            } else {
                // Update card metadata with latest output + form inputs
                try {
                    await cardsApi.update(activeWorkspace.uuid, activeCampaign.id, cardId, {
                        metadata: { structured_data: targetOutput, form_inputs: formInputs, is_core: true },
                    });
                } catch { /* update may not exist */ }
                // Add a new version with metadata
                await cardsApi.addVersion(activeWorkspace.uuid, activeCampaign.id, cardId, {
                    content,
                    metadata: { structured_data: targetOutput, form_inputs: formInputs },
                });
                const versionList = await cardsApi.getVersions(activeWorkspace.uuid, activeCampaign.id, cardId).catch(() => []);
                setVersions(Array.isArray(versionList) ? versionList : []);
                setActiveVersionIdx((versionList as any[]).length - 1);
            }
        } catch (err) {
            console.error('Failed to save draft', err);
        } finally {
            window.dispatchEvent(new Event('refresh-canvas'));
        }
    };

    /* ── Version replay ── */
    const handleLoadVersion = async (idx: number) => {
        const v = versions[idx];
        if (!v) return;
        setActiveVersionIdx(idx);
        // If structured data in version metadata, use it; otherwise show as text
        if (v.metadata?.structured_data) {
            setOutput(v.metadata.structured_data);
            if (v.metadata.structured_data.text_content || v.metadata.structured_data.content) {
                setEditorContent(v.metadata.structured_data.text_content || v.metadata.structured_data.content);
            } else {
                setEditorContent('');
            }
        } else {
            setOutput({ text_content: v.content });
            setEditorContent(v.content);
        }
        // Restore form inputs from version if available
        if (v.metadata?.form_inputs) {
            setSavedFormInputs(v.metadata.form_inputs);
        }
    };

    /* ── Finalize → save to canvas ── */
    const handleFinalize = async () => {
        if (!activeWorkspace || !activeCampaign || !cardId) return;
        setIsFinalizing(true);
        try {
            await cardsApi.finalize(activeWorkspace.uuid, activeCampaign.id, cardId);
            setStatus('final');
            setCurrentView(backTarget);
            setAgentEditor(null, null);
            window.dispatchEvent(new Event('refresh-canvas'));
        } finally {
            setIsFinalizing(false);
        }
    };

    const handleBack = () => {
        setCurrentView(backTarget);
        setAgentEditor(null, null);
    };

    const handleViewOnCanvas = () => {
        setCurrentView('canvas');
        setAgentEditor(null, null);
        window.dispatchEvent(new Event('refresh-canvas'));
    };

    const handleCopyOutput = () => {
        const text = output?.text_content || JSON.stringify(output, null, 2);
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDeleteCard = async () => {
        if (!activeWorkspace || !activeCampaign || !cardId) return;
        setIsDeleting(true);
        try {
            await cardsApi.delete(activeWorkspace.uuid, activeCampaign.id, cardId);
            removeCard(cardId);
            setShowDeleteDialog(false);
            setCurrentView(backTarget);
            setAgentEditor(null, null);
            window.dispatchEvent(new Event('refresh-canvas'));
        } catch (err) {
            console.error('Failed to delete card', err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', height: '100vh',
            background: 'var(--bg-primary)', overflow: 'hidden',
        }}>

            {/* ══ TOP BAR ══ */}
            <div style={{
                height: 56, display: 'flex', alignItems: 'center', gap: 12,
                padding: '0 20px', borderBottom: '1px solid var(--border-default)',
                background: 'var(--bg-secondary)', flexShrink: 0,
            }}>
                <button
                    onClick={handleBack}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'none', border: 'none', color: 'var(--text-secondary)',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '6px 10px',
                        borderRadius: 8, transition: 'all 0.15s',
                    }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-primary)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
            >
                <ArrowLeft size={16} /> {backLabel}
            </button>

                <div style={{ width: 1, height: 20, background: 'var(--border-default)' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    {agentDef && (
                        <div style={{
                            width: 28, height: 28, borderRadius: 7,
                            background: 'rgba(124,92,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <agentDef.icon size={14} color="#7c5cff" />
                        </div>
                    )}
                    <h1 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {agentDef?.name || agentId.replace(/_/g, ' ')}
                    </h1>
                    <StatusBadge status={status} />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Delete button — shown when card exists */}
                    {cardId && (
                        <button
                            onClick={() => setShowDeleteDialog(true)}
                            title="Delete card"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
                                background: 'rgba(239,68,68,0.08)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: 8, color: '#ef4444', fontSize: 12,
                                fontWeight: 600, cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.16)';
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.4)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.2)';
                            }}
                        >
                            <Trash2 size={13} /> Delete
                        </button>
                    )}
                    {output && (
                        <>
                            <button
                                onClick={handleCopyOutput}
                                title="Copy output"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
                                    background: 'var(--bg-primary)', border: '1px solid var(--border-default)',
                                    borderRadius: 8, color: 'var(--text-secondary)', fontSize: 12,
                                    fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                {copied ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                                onClick={() => setShowVersionHistory(!showVersionHistory)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
                                    background: showVersionHistory ? 'rgba(124,92,255,0.1)' : 'var(--bg-primary)',
                                    border: `1px solid ${showVersionHistory ? 'var(--primary)' : 'var(--border-default)'}`,
                                    borderRadius: 8, color: showVersionHistory ? 'var(--primary)' : 'var(--text-secondary)',
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                <History size={13} /> History {versions.length > 0 && `(${versions.length})`}
                            </button>
                            <button
                                onClick={() => setShowAssetsSidebar(!showAssetsSidebar)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
                                    background: showAssetsSidebar ? 'rgba(34,197,94,0.12)' : 'var(--bg-primary)',
                                    border: `1px solid ${showAssetsSidebar ? 'rgba(34,197,94,0.5)' : 'var(--border-default)'}`,
                                    borderRadius: 8, color: showAssetsSidebar ? '#22c55e' : 'var(--text-secondary)',
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                <Image size={13} /> Assets {mediaItems.length > 0 && `(${mediaItems.length})`}
                            </button>
                        </>
                    )}
                    {status !== 'final' && output && (
                        <div style={{ position: 'relative' }}>
                            {/* Primary: Save as Draft */}
                            <div style={{ display: 'flex', alignItems: 'stretch' }}>
                                <button
                                    onClick={handleFinalize}
                                    disabled={isFinalizing || !cardId}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 7,
                                        padding: '8px 16px', background: '#22c55e',
                                        border: 'none', borderRadius: '8px 0 0 8px', color: 'white',
                                        fontWeight: 700, fontSize: 13,
                                        cursor: isFinalizing || !cardId ? 'not-allowed' : 'pointer',
                                        opacity: isFinalizing || !cardId ? 0.7 : 1,
                                    }}
                                >
                                    {isFinalizing
                                        ? <><RefreshCw size={14} className="animate-spin" /> Saving...</>
                                        : <><CheckCircleIcon size={14} /> Save & Finalize</>
                                    }
                                </button>
                                {/* Dropdown toggle */}
                                <button
                                    onClick={() => setShowSaveMenu(v => !v)}
                                    style={{
                                        display: 'flex', alignItems: 'center', padding: '8px 8px',
                                        background: '#1ea74b', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '0 8px 8px 0', color: 'white', cursor: 'pointer',
                                    }}
                                >
                                    <ChevronDown size={14} />
                                </button>
                            </div>
                            {/* Dropdown menu */}
                            {showSaveMenu && (
                                <>
                                    <div onClick={() => setShowSaveMenu(false)}
                                        style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
                                    <div style={{
                                        position: 'absolute', top: '110%', right: 0, zIndex: 50,
                                        minWidth: 210, background: 'rgba(18,18,30,0.98)',
                                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                                        overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.55)',
                                    }}>
                                        <button onClick={async () => {
                                            setShowSaveMenu(false);
                                            await saveDraftCard();
                                            setCurrentView('canvas');
                                            setAgentEditor(null, null);
                                        }} style={{
                                            width: '100%', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10,
                                            background: 'none', border: 'none', color: 'rgba(255,255,255,0.75)',
                                            fontSize: 13.5, cursor: 'pointer', textAlign: 'left',
                                        }}
                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(124,92,255,0.1)'}
                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
                                        >
                                            <FileTextIcon size={15} /> Save Draft to Canvas
                                        </button>
                                        <button onClick={async () => {
                                            setShowSaveMenu(false);
                                            await saveDraftCard();
                                            await handleFinalize();
                                        }} style={{
                                            width: '100%', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10,
                                            background: 'none', border: 'none', color: 'rgba(255,255,255,0.75)',
                                            fontSize: 13.5, cursor: 'pointer', textAlign: 'left',
                                        }}
                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.1)'}
                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
                                        >
                                            <CheckCircleIcon size={15} /> Save & Finalize to Canvas
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    {status === 'final' && (
                        <button
                            onClick={handleViewOnCanvas}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '8px 18px',
                                background: 'rgba(124,92,255,0.12)',
                                border: '1px solid rgba(124,92,255,0.35)',
                                borderRadius: 10,
                                color: 'var(--text-primary)',
                                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(124,92,255,0.2)';
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,92,255,0.6)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(124,92,255,0.12)';
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,92,255,0.35)';
                            }}
                        >
                            <ChevronRight size={14} /> Open on Canvas
                        </button>
                    )}
                </div>
            </div>

            {/* ══ MOBILE TABS ══ */}
            <div className="show-on-mobile" style={{
                background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-default)',
                padding: '0 20px', gap: 24
            }}>
                <button
                    onClick={() => setMobileTab('form')}
                    style={{
                        padding: '16px 4px', fontSize: 13, fontWeight: 700,
                        color: mobileTab === 'form' ? 'var(--accent-1)' : 'var(--text-muted)',
                        borderBottom: `2px solid ${mobileTab === 'form' ? 'var(--accent-1)' : 'transparent'}`,
                        background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                    }}
                >
                    <Settings size={14} /> Configuration
                </button>
                <button
                    onClick={() => setMobileTab('result')}
                    style={{
                        padding: '16px 4px', fontSize: 13, fontWeight: 700,
                        color: mobileTab === 'result' ? 'var(--accent-1)' : 'var(--text-muted)',
                        borderBottom: `2px solid ${mobileTab === 'result' ? 'var(--accent-1)' : 'transparent'}`,
                        background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                    }}
                >
                    <Layout size={14} /> Result
                </button>
            </div>

            {/* ══ BODY: Left Form | Right Output ══ */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }} className="mobile-stack">

                {/* LEFT: Form */}
                <div
                    className={isMobile && mobileTab !== 'form' ? 'hide-on-mobile' : ''}
                    style={{
                        width: isMobile ? '100%' : '40%', minWidth: isMobile ? 'unset' : 380, maxWidth: isMobile ? 'unset' : 560,
                        borderRight: isMobile ? 'none' : '1px solid var(--border-default)',
                        overflowY: 'auto', background: 'var(--bg-secondary)',
                        display: 'flex', flexDirection: 'column',
                    }}
                >
                    <div className="show-on-mobile" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-default)' }}>
                        <p style={{
                            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.08em', color: 'var(--text-muted)', margin: 0,
                        }}>Configure Agent</p>
                    </div>
                    {/* Re-generate hint when output exists */}
                    {output && status === 'draft' && (
                        <div style={{
                            padding: '10px 24px', background: 'rgba(124,92,255,0.06)',
                            borderBottom: '1px solid rgba(124,92,255,0.15)',
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <RefreshCw size={12} color="var(--primary)" />
                            <p style={{ fontSize: 12, color: 'var(--primary)', margin: 0, fontWeight: 500 }}>
                                Modify the form and click Generate to create a new version
                            </p>
                        </div>
                    )}
                    <div style={{
                        flex: 1,
                        padding: '24px',
                        pointerEvents: isGenerating ? 'none' : 'auto',
                        opacity: isGenerating ? 0.6 : 1,
                        transition: 'opacity 0.2s ease'
                    }}>
                        {isBrandIdentity ? (
                            <BrandIdentityForm
                                onGenerate={handleGenerated}
                                setIsGenerating={setIsGenerating}
                                initialValues={savedFormInputs}
                                onFormDataChange={setCurrentFormData}
                                draftCardId={cardId}
                            />
                        ) : (
                            <AgentForm
                                agentId={agentId}
                                onGenerate={handleGenerated}
                                setIsGenerating={setIsGenerating}
                                initialValues={savedFormInputs}
                                onFormDataChange={setCurrentFormData}
                                draftCardId={cardId}
                            />
                        )}
                    </div>
                </div>

                {/* RIGHT: Output + Version sidebar */}
                <div
                    className={isMobile && mobileTab !== 'result' ? 'hide-on-mobile' : ''}
                    style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}
                >

                    {/* Output */}
                    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-primary)' }}>
                        {isGenerating ? (
                            <div style={{
                                height: '100%', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: 20,
                            }}>
                                <div style={{
                                    width: 84, height: 84, borderRadius: 'var(--radius-xl)',
                                    background: 'var(--gradient-subtle)',
                                    border: '1px solid rgba(124,92,255,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    position: 'relative'
                                }} className="animate-pulse-glow">
                                    <div style={{ position: 'absolute', inset: 0, border: '2px solid var(--accent-1)', borderRadius: 'inherit', borderTopColor: 'transparent', animation: 'spin 2s linear infinite' }} />
                                    {agentDef?.icon ? (
                                        <agentDef.icon size={40} color="var(--accent-1)" />
                                    ) : (
                                        <RefreshCw size={40} color="var(--accent-1)" className="animate-spin" />
                                    )}
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                                        {agentDef?.name || 'Agent'} is thinking...
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
                                        <Sparkles size={14} className="animate-pulse" />
                                        <span>{isSocialAgent
                                            ? 'Generating content, images, and video. This may take 1-3 minutes...'
                                            : 'Applying marketing expertise and generating content.'
                                        }</span>
                                    </div>
                                </div>
                            </div>
                        ) : output ? (
                            <div style={{ height: '100%' }}>
                                <div style={{ padding: 32 }}>
                                    {isBrandIdentity ? (
                                        <BrandIdentityOutput
                                            data={versions[activeVersionIdx]?.metadata?.structured_data || output?.structured_data || output}
                                        />
                                    ) : isLogoDesigner ? (
                                        <LogoDesignerOutput
                                            data={versions[activeVersionIdx]?.metadata?.structured_data || output?.structured_data || output}
                                            textContent={editorContent}
                                            onTextChange={(newContent: string) => {
                                                setEditorContent(newContent);
                                                setOutput({ ...output, text_content: newContent });
                                            }}
                                            images={logoImages}
                                            status={status}
                                        />
                                    ) : ['keyword_researcher', 'on_page_seo', 'technical_seo', 'aeo_optimizer'].includes(agentId) ? (
                                        <SEOOutput 
                                            data={versions[activeVersionIdx]?.metadata?.structured_data || output?.structured_data || output}
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                            {/* Social Post Cards */}
                                            {isSocialAgent && socialPosts.length > 0 && (
                                                <div style={{ marginBottom: 8 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                                                            Social Posts ({socialPosts.length})
                                                        </h3>
                                                        {status !== 'final' && (
                                                            <span style={{ fontSize: 11, color: 'var(--accent-1)', fontWeight: 600, textTransform: 'uppercase' }}>
                                                                Auto-saving draft...
                                                            </span>
                                                        )}
                                                    </div>
                                                    <SocialPostGrid
                                                        posts={socialPosts}
                                                        editable={status !== 'final'}
                                                        onCaptionChange={(idx, newCaption) => {
                                                            if (output?.posts && Array.isArray(output.posts)) {
                                                                const updated = [...output.posts];
                                                                updated[idx] = { ...updated[idx], caption: newCaption };
                                                                setOutput({ ...output, posts: updated, post: idx === 0 ? updated[0] : output.post });
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {renderStructuredOutput()}

                                            {!isSocialAgent && !structuredOutput && outputIncludesMedia && mediaItems.length > 0 && (
                                                <MediaSlider items={mediaItems} />
                                            )}

                                            {!isSocialAgent && !hideEditorAgents.has(agentId) && !structuredOutput && (outputIncludesText || isHeroImage) && (
                                                <>
                                                    {isHeroImage && renderContentEditor()}
                                                    {!isHeroImage && renderContentEditor()}
                                                </>
                                            )}

                                            {isSocialAgent && socialPosts.length === 0 && renderContentEditor()}
                                        </div>
                                    )}
                                </div>

                                        {/* Additional Metadata (Hashtags, score, etc. if not in editor) */}
                                        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            {output.hashtags?.length > 0 && !editorContent.includes('#') && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                    {output.hashtags.map((h: string, i: number) => (
                                                        <span key={i} style={{ fontSize: 12, color: 'var(--primary)', background: 'rgba(124,92,255,0.1)', padding: '4px 8px', borderRadius: 8, fontWeight: 600 }}>
                                                            {h.startsWith('#') ? h : `#${h}`}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {/* {output.score !== undefined && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <span style={{ fontSize: 24, fontWeight: 800, color: output.score >= 70 ? '#22c55e' : output.score >= 40 ? '#f59e0b' : '#ef4444' }}>{output.score}</span>
                                                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/100 SEO Score</span>
                                                </div>
                                            )} */}
                                        </div>
                            </div>
                        ) : (
                            <div style={{
                                height: '100%', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: 16,
                                padding: 40, textAlign: 'center',
                            }}>
                                <div style={{
                                    width: 72, height: 72, borderRadius: 18,
                                    border: '2px dashed var(--border-strong)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <AppLogo size={36} className="animate-pulse-glow" />
                                </div>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>
                                    Output will appear here
                                </h3>
                                <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 320, margin: 0 }}>
                                    Fill in the form on the left and click Generate to see the AI output.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sidebars */}
                    {(showVersionHistory || showAssetsSidebar) && (
                        <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
                            {showVersionHistory && (
                                <div style={{
                                    width: 240, borderLeft: '1px solid var(--border-default)',
                                    background: 'var(--bg-secondary)', overflowY: 'auto',
                                    display: 'flex', flexDirection: 'column',
                                }}>
                                    <div style={{
                                        padding: '14px 16px', borderBottom: '1px solid var(--border-default)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    }}>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                                            Version History
                                        </p>
                                        <button onClick={() => setShowVersionHistory(false)}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {versions.length === 0 ? (
                                            <p style={{ fontSize: 12, color: 'var(--text-muted)', padding: 8, textAlign: 'center' }}>
                                                No versions yet
                                            </p>
                                        ) : (
                                            [...versions].reverse().map((v, i) => (
                                                <VersionItem
                                                    key={v.id || i}
                                                    version={v}
                                                    index={versions.length - 1 - i}
                                                    isActive={activeVersionIdx === versions.length - 1 - i}
                                                    onClick={() => handleLoadVersion(versions.length - 1 - i)}
                                                />
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                            {showAssetsSidebar && (
                                <div style={{
                                    width: 260, borderLeft: '1px solid var(--border-default)',
                                    background: 'var(--bg-secondary)', overflowY: 'auto',
                                    display: 'flex', flexDirection: 'column',
                                }}>
                                    <div style={{
                                        padding: '14px 16px', borderBottom: '1px solid var(--border-default)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    }}>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                                            Generated Assets
                                        </p>
                                        <button onClick={() => setShowAssetsSidebar(false)}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {mediaItems.length === 0 ? (
                                            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 8 }}>
                                                No assets yet
                                            </p>
                                        ) : mediaItems.map((m, i) => (
                                            <div key={`${m.url}-${i}`} style={{
                                                border: '1px solid var(--border-default)',
                                                borderRadius: 10,
                                                overflow: 'hidden',
                                                background: 'var(--bg-primary)',
                                            }}>
                                                {m.type === 'image' ? (
                                                    <img src={m.url} alt={`Asset ${i + 1}`} style={{ width: '100%', display: 'block', maxHeight: 140, objectFit: 'cover' }} />
                                                ) : (
                                                    <video src={m.url} style={{ width: '100%', display: 'block', maxHeight: 140, background: '#000' }} controls />
                                                )}
                                                <div style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{m.type.toUpperCase()}</span>
                                                    <button
                                                        onClick={() => { navigator.clipboard.writeText(m.url); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                                                        style={{
                                                            border: '1px solid var(--border-default)',
                                                            background: 'var(--bg-primary)',
                                                            borderRadius: 6, padding: '4px 8px',
                                                            fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer'
                                                        }}
                                                    >
                                                        Copy URL
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ══ DELETE CONFIRM DIALOG ══ */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="Delete Card"
                message={`Are you sure you want to delete "${agentDef?.name || agentId.replace(/_/g, ' ')}" card? This will permanently remove the card and all its versions. This action cannot be undone.`}
                confirmLabel="Delete Card"
                cancelLabel="Cancel"
                variant="danger"
                isLoading={isDeleting}
                onConfirm={handleDeleteCard}
                onCancel={() => { if (!isDeleting) setShowDeleteDialog(false); }}
            />
        </div>
    );
}
