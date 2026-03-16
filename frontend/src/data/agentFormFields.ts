/**
 * agentFormFields.ts — Data-driven form field definitions for all 78 agents.
 *
 * Each agent_id maps to an array of FormFieldDef objects.
 * Agents sharing the same backend input model share field definitions.
 * The AgentForm renders these dynamically.
 *
 * NOTE: brand_identity uses its own dedicated BrandIdentityForm component,
 * so it is NOT included here.
 */

export interface FormFieldDef {
    name: string;
    type: 'text' | 'textarea' | 'select' | 'tags' | 'number' | 'url' | 'slider' | 'checkbox' | 'colors';
    label: string;
    placeholder?: string;
    required?: boolean;
    defaultValue?: any;
    options?: { label: string; value: string }[];
    max?: number;       // max items for tags, max value for number/slider
    min?: number;       // min value for number/slider
    step?: number;      // step for number/slider
    helpText?: string;
    section?: string;   // visual grouping header
    rows?: number;      // textarea rows
    icon?: string;      // lucide-react icon name, e.g. 'Package', 'Users'
}

// ═══════════════════════════════════════════════════════════
// BRAND CATEGORY (5 of 6 — brand_identity has its own form)
// ═══════════════════════════════════════════════════════════

const BRAND_NAMING_FIELDS: FormFieldDef[] = [
    { name: 'business_description', icon: 'FileText', type: 'textarea', label: 'Business Description', placeholder: 'What does this business do? Who does it serve?', required: true, section: 'Business Details', rows: 3 },
    { name: 'industry', icon: 'Building2', type: 'text', label: 'Industry', placeholder: 'e.g. Health & Wellness, SaaS, Fashion' },
    { name: 'name_count', icon: 'Hash', type: 'number', label: 'Names to Generate', defaultValue: 10, min: 3, max: 20 },
    { name: 'domain_tld_preferences', icon: 'Globe', type: 'tags', label: 'Preferred Domain Extensions', placeholder: 'e.g. .com, .ai, .io', max: 5 },
    { name: 'values', icon: 'Heart', type: 'tags', label: 'Brand Values', placeholder: 'Type a value and press Enter', max: 6 },
    { name: 'tone', icon: 'Palette', type: 'tags', label: 'Tone / Vibe', placeholder: 'e.g. Modern, Playful, Luxurious', max: 5 },
    {
        name: 'style', icon: 'Wand2', type: 'select', label: 'Naming Style', options: [
            { label: 'Any Style', value: '' },
            { label: 'Abstract', value: 'abstract' },
            { label: 'Descriptive', value: 'descriptive' },
            { label: 'Compound Word', value: 'compound' },
            { label: 'Invented', value: 'invented' },
            { label: 'Acronym', value: 'acronym' },
        ]
    },
    { name: 'keywords_include', icon: 'Hash', type: 'tags', label: 'Keywords to Include', placeholder: 'Words that should inspire the name', max: 5 },
    { name: 'keywords_avoid', icon: 'Ban', type: 'tags', label: 'Keywords to Avoid', placeholder: 'Words to stay away from', max: 5 },
    { name: 'competitor_names', icon: 'Shield', type: 'tags', label: 'Competitor Names', placeholder: 'Names to differentiate from', max: 5 },
    { name: 'target_audience', icon: 'Users', type: 'text', label: 'Target Audience Persona', placeholder: 'e.g. Eco-conscious millennials' }
];

const TAGLINE_FIELDS: FormFieldDef[] = [
    { name: 'brand_name', icon: 'Type', type: 'text', label: 'Brand Name', placeholder: 'Your brand or business name', section: 'Brand Info' },
    { name: 'business_description', icon: 'FileText', type: 'textarea', label: 'Business Description', placeholder: 'Brief overview of what you do', rows: 2 },
    { name: 'use_case', icon: 'Target', type: 'text', label: 'Use Case', placeholder: 'e.g. Brand tagline, product launch, packaging' },
    { name: 'channel', icon: 'Share2', type: 'text', label: 'Channel / Placement', placeholder: 'e.g. Website hero, Instagram bio' },
    { name: 'tone', icon: 'Palette', type: 'text', label: 'Tone', placeholder: 'e.g. Bold, Playful, Professional' },
    { name: 'max_words', icon: 'Hash', type: 'number', label: 'Max Words', defaultValue: 8, min: 3, max: 15 },
    { name: 'brand_values', icon: 'Heart', type: 'tags', label: 'Brand Values', placeholder: 'Trust, Innovation' },
    { name: 'keywords', icon: 'Hash', type: 'tags', label: 'Keywords to Include', placeholder: 'Future, Reliable' }
];

const TARGET_AUDIENCE_FIELDS: FormFieldDef[] = [
    { name: 'brand_name', icon: 'Type', type: 'text', label: 'Brand Name', placeholder: 'Your brand name' },
    { name: 'product_description', icon: 'Package', type: 'textarea', label: 'Product / Service Description', placeholder: 'What are you selling?', rows: 2 },
    { name: 'industry', icon: 'Building2', type: 'text', label: 'Industry', placeholder: 'e.g. E-commerce, SaaS' },
    { name: 'geographic_focus', icon: 'MapPin', type: 'text', label: 'Geographic Focus', placeholder: 'e.g. US, Global', section: 'Targeting' },
    {
        name: 'price_point', icon: 'DollarSign', type: 'select', label: 'Price Point', options: [
            { label: 'Budget', value: 'budget' },
            { label: 'Mid-Range', value: 'mid' },
            { label: 'Premium', value: 'premium' },
            { label: 'Luxury', value: 'luxury' },
        ]
    },
    { name: 'persona_count', icon: 'Hash', type: 'number', label: 'Number of Personas', defaultValue: 3, min: 1, max: 6 }
];

const BRAND_VOICE_FIELDS: FormFieldDef[] = [
    { name: 'brand_description', icon: 'FileText', type: 'textarea', label: 'Brand Description', placeholder: 'Briefly describe your brand identity...', rows: 2 },
    { name: 'manual_tone', icon: 'Palette', type: 'tags', label: 'Tone Keywords', placeholder: 'e.g. Friendly, Authoritative, Casual', max: 6 },
    { name: 'manual_formality', icon: 'SlidersHorizontal', type: 'slider', label: 'Formality Level', min: 0, max: 1, step: 0.1, defaultValue: 0.5 },
    { name: 'sample_content', icon: 'FileText', type: 'textarea', label: 'Sample Content for Analysis', placeholder: 'Paste existing content to match style...', rows: 4 },
    { name: 'sample_asset_ids', icon: 'Paperclip', type: 'tags', label: 'Reference Asset IDs', placeholder: 'IDs of assets to analyze' },
    { name: 'manual_rules', icon: 'ListChecks', type: 'tags', label: 'Custom Rules', placeholder: 'e.g. Never use slang, Always talk in first person', max: 8 }
];

const BRAND_GUARDIAN_FIELDS: FormFieldDef[] = [
    { name: 'content_to_validate', icon: 'FileText', type: 'textarea', label: 'Content to Validate', placeholder: 'Paste the marketing content you want to check...', required: true, section: 'Content', rows: 6 },
    {
        name: 'content_type', icon: 'Tag', type: 'select', label: 'Content Type', required: true, options: [
            { label: 'Social Media Post', value: 'social_post' },
            { label: 'Email', value: 'email' },
            { label: 'Blog Article', value: 'blog' },
            { label: 'Ad Copy', value: 'ad_copy' },
            { label: 'Landing Page', value: 'landing_page' },
            { label: 'Other', value: 'other' },
        ]
    },
    { name: 'auto_rewrite', icon: 'RefreshCw', type: 'checkbox', label: 'Auto-Rewrite Content if Issues Found', defaultValue: false },
    {
        name: 'severity_threshold', icon: 'AlertTriangle', type: 'select', label: 'Severity Threshold', defaultValue: 'warning', options: [
            { label: 'Critical Only', value: 'critical' },
            { label: 'Warning & Above', value: 'warning' },
            { label: 'Suggestions & Above', value: 'suggestion' },
        ]
    },
    { name: 'tone_override', icon: 'Sparkles', type: 'text', label: 'Tone Override', placeholder: 'e.g. More energetic, Professional' }
];

// ═══════════════════════════════════════════════════════════
// CREATIVE STRATEGY CATEGORY (3)
// ═══════════════════════════════════════════════════════════

const CREATIVE_DIRECTION_FIELDS: FormFieldDef[] = [
    {
        name: 'campaign_goal', icon: 'Target', type: 'select', label: 'Campaign Goal', required: true, section: 'Campaign', options: [
            { label: 'Product Launch', value: 'product launch' },
            { label: 'Brand Awareness', value: 'brand awareness' },
            { label: 'Seasonal Sale', value: 'seasonal sale' },
        ]
    },
    { name: 'target_audience', icon: 'Users', type: 'text', label: 'Target Audience Persona', placeholder: 'e.g. Tech-savvy millennials' },
    { name: 'channels', icon: 'Share2', type: 'tags', label: 'Target Channels', placeholder: 'e.g. Instagram, Email, YouTube', max: 5 },
    { name: 'deliverables', icon: 'ClipboardList', type: 'tags', label: 'Expected Deliverables', placeholder: 'e.g. Video ad, Social pack, Landing page', max: 5 },
    {
        name: 'tone_override', icon: 'Mic', type: 'select', label: 'Tone', options: [
            { label: 'Auto (Friendly)', value: '' },
            { label: 'Professional', value: 'professional' },
            { label: 'Humorous', value: 'humorous' },
        ]
    },
    { name: 'include_link', icon: 'Link', type: 'checkbox', label: 'Include Link Call-to-Action' }
];

const CAMPAIGN_CONCEPT_FIELDS: FormFieldDef[] = [
    {
        name: 'campaign_type', icon: 'Megaphone', type: 'select', label: 'Campaign Type', required: true, section: 'Campaign Details', options: [
            { label: 'Product Launch', value: 'launch' },
            { label: 'Sale / Promotion', value: 'sale' },
            { label: 'Brand Awareness', value: 'awareness' },
        ]
    },
    { name: 'duration', icon: 'Clock', type: 'text', label: 'Duration', placeholder: 'e.g. 1 week, 1 month, ongoing' },
    { name: 'primary_goal', icon: 'Target', type: 'text', label: 'Primary Goal', placeholder: 'e.g. Drive 100 sales' },
    { name: 'target_audience', icon: 'Users', type: 'text', label: 'Target Audience Persona', placeholder: 'e.g. New homeowners' },
    { name: 'success_metric', icon: 'BarChart3', type: 'text', label: 'Success Metric', placeholder: 'e.g. Conversion rate, ROAS' },
    {
        name: 'budget_range', icon: 'DollarSign', type: 'select', label: 'Budget Range', options: [
            { label: 'Not specified', value: '' },
            { label: 'Under $1K', value: 'under_1k' },
            { label: '$1K - $5K', value: '1k_5k' },
        ]
    },
    { name: 'channels', icon: 'Share2', type: 'tags', label: 'Target Channels', placeholder: 'e.g. Meta Ads, Google Ads', max: 8 }
];

const CONTENT_CALENDAR_FIELDS: FormFieldDef[] = [
    { name: 'duration_weeks', icon: 'Calendar', type: 'number', label: 'Duration (Weeks)', defaultValue: 4, min: 1, max: 12, section: 'Schedule' },
    { name: 'start_date', icon: 'CalendarDays', type: 'text', label: 'Start Date', placeholder: 'YYYY-MM-DD' },
    { name: 'channels', icon: 'Share2', type: 'tags', label: 'Channels', placeholder: 'e.g. Instagram, LinkedIn, Email', required: true, max: 8 },
    {
        name: 'posting_frequency', icon: 'ListOrdered', type: 'textarea', label: 'Posting Frequency (per week)', rows: 2,
        placeholder: 'instagram:5, blog:2 or {"instagram":5,"blog":2}',
        helpText: 'Specify how many posts per week per channel.'
    },
    { name: 'campaign_theme', icon: 'Megaphone', type: 'text', label: 'Campaign Theme', placeholder: 'e.g. Holiday Special', section: 'Theme' }
];

// ═══════════════════════════════════════════════════════════
// VISUAL DESIGN CATEGORY (8 — each unique)
// ═══════════════════════════════════════════════════════════

const LOGO_DESIGNER_FIELDS: FormFieldDef[] = [
    { name: 'brand_name', icon: 'Type', type: 'text', label: 'Brand Name', placeholder: 'Name to feature in the logo', section: 'Logo Details' },
    { name: 'brand_description', icon: 'FileText', type: 'textarea', label: 'Brand Description', placeholder: 'Describe the brand identity...', rows: 2 },
    { name: 'usage_context', icon: 'Monitor', type: 'text', label: 'Usage Context', placeholder: 'e.g. Website, Mobile App, Print' },
    { name: 'styles', icon: 'Shapes', type: 'tags', label: 'Logo Styles', placeholder: 'e.g. Wordmark, Icon, Abstract', max: 4 },
    { name: 'colors', icon: 'Palette', type: 'colors', label: 'Brand Colors', helpText: 'Pick 2-5 hex colors to enforce in the logo', max: 5 },
    { name: 'icon_concept', icon: 'Lightbulb', type: 'text', label: 'Icon Concept', placeholder: 'e.g. A mountain, Lightning bolt' },
    { name: 'variation_count', icon: 'Hash', type: 'number', label: 'Number of Variations', defaultValue: 4, min: 1, max: 4 }
];

const HERO_IMAGE_FIELDS: FormFieldDef[] = [
    { name: 'description', icon: 'FileText', type: 'textarea', label: 'Image Description', placeholder: 'Describe the hero image you want...', required: true, section: 'Image Details', rows: 3 },
    { name: 'composition', icon: 'Layout', type: 'text', label: 'Composition', placeholder: 'e.g. Rule of thirds, Centered, Dynamic' },
    {
        name: 'aspect_ratio', icon: 'Monitor', type: 'select', label: 'Aspect Ratio', defaultValue: '16:9', options: [
            { label: '16:9 (Widescreen)', value: '16:9' },
            { label: '1:1 (Square)', value: '1:1' },
            { label: '9:16 (Portrait)', value: '9:16' },
            { label: '4:3 (Standard)', value: '4:3' },
        ]
    },
    {
        name: 'style', icon: 'Paintbrush', type: 'select', label: 'Visual Style', defaultValue: 'photorealistic', options: [
            { label: 'Photorealistic', value: 'photorealistic' },
            { label: 'Illustrated', value: 'illustrated' },
            { label: 'Abstract', value: 'abstract' },
            { label: '3D Render', value: '3d' },
        ]
    },
    { name: 'include_text', icon: 'Type', type: 'checkbox', label: 'Include text overlay' },
    { name: 'text_content', icon: 'Type', type: 'text', label: 'Overlay Text', placeholder: 'Text to display on image' },
    { name: 'variation_count', icon: 'Hash', type: 'number', label: 'Variations', defaultValue: 4, min: 1, max: 4 }
];

const PRODUCT_PHOTOSHOOT_FIELDS: FormFieldDef[] = [
    { name: 'product_image_url', icon: 'Image', type: 'url', label: 'Product Image URL', placeholder: 'https://...', required: true, section: 'Product' },
    { name: 'product_name', icon: 'Package', type: 'text', label: 'Product Name', placeholder: 'Name of the product' },
    {
        name: 'aspect_ratio', icon: 'Monitor', type: 'select', label: 'Aspect Ratio', defaultValue: '1:1', options: [
            { label: '1:1 (Square)', value: '1:1' },
            { label: '16:9 (Landscape)', value: '16:9' },
            { label: '9:16 (Portrait)', value: '9:16' },
            { label: '4:5 (Instagram)', value: '4:5' }
        ]
    },
    { name: 'background_style', icon: 'Palette', type: 'text', label: 'Background Style', placeholder: 'e.g. Minimalist, Wooden table, Marble surface' },
    {
        name: 'scene', icon: 'Camera', type: 'select', label: 'Scene', defaultValue: 'studio_white', options: [
            { label: 'Studio White', value: 'studio_white' },
            { label: 'Lifestyle', value: 'lifestyle' },
            { label: 'Flat Lay', value: 'flat_lay' },
            { label: 'Hero Shot', value: 'hero' },
        ]
    },
    { name: 'custom_scene', icon: 'Camera', type: 'text', label: 'Custom Scene', placeholder: 'Describe a custom scene...' },
    {
        name: 'lighting', icon: 'Sun', type: 'select', label: 'Lighting', defaultValue: 'studio', options: [
            { label: 'Studio', value: 'studio' },
            { label: 'Natural', value: 'natural' },
            { label: 'Dramatic', value: 'dramatic' },
            { label: 'Soft / Diffused', value: 'soft' },
        ]
    },
    { name: 'variation_count', icon: 'Hash', type: 'number', label: 'Variations', defaultValue: 4, min: 1, max: 4 }
];

const AD_CREATIVE_FIELDS: FormFieldDef[] = [
    {
        name: 'platform', icon: 'Monitor', type: 'select', label: 'Platform', required: true, section: 'Ad Details', options: [
            { label: 'Meta Feed', value: 'meta_feed' },
            { label: 'Google Display', value: 'google_display' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Meta Story', value: 'meta_story' },
        ]
    },
    { name: 'headline', icon: 'Type', type: 'text', label: 'Headline', placeholder: 'Ad headline text', required: true },
    { name: 'body_text', icon: 'FileText', type: 'textarea', label: 'Body Text', placeholder: 'Ad body copy', rows: 2 },
    {
        name: 'aspect_ratio', icon: 'Monitor', type: 'select', label: 'Aspect Ratio', defaultValue: '1:1', options: [
            { label: '1:1 (Square)', value: '1:1' },
            { label: '16:9 (Landscape)', value: '16:9' },
            { label: '9:16 (Portrait)', value: '9:16' },
        ]
    },
    { name: 'design_style', icon: 'Paintbrush', type: 'text', label: 'Design Style', placeholder: 'e.g. Bold, Clean, Cyberpunk' },
    { name: 'legal_text', icon: 'Scale', type: 'text', label: 'Legal Text / Disclaimer', placeholder: 'e.g. T&Cs apply, Ends tonight' },
    {
        name: 'cta', icon: 'MousePointerClick', type: 'select', label: 'Call to Action', defaultValue: 'Learn More', options: [
            { label: 'Learn More', value: 'Learn More' },
            { label: 'Shop Now', value: 'Shop Now' },
            { label: 'Sign Up', value: 'Sign Up' },
        ]
    },
    { name: 'product_image_url', icon: 'Image', type: 'url', label: 'Product Image URL', placeholder: 'https://...', section: 'Assets' },
    { name: 'variation_count', icon: 'Hash', type: 'number', label: 'Variations', defaultValue: 4, min: 1, max: 4 }
];

const IMAGE_EDITOR_FIELDS: FormFieldDef[] = [
    { name: 'source_image_url', icon: 'Image', type: 'url', label: 'Source Image URL', placeholder: 'https://...', required: true, section: 'Image' },
    { name: 'edit_instruction', icon: 'Wand2', type: 'textarea', label: 'Edit Instructions', placeholder: 'e.g. Change background to beach...', required: true, rows: 3 },
    { name: 'variation_count', icon: 'Hash', type: 'number', label: 'Variations', defaultValue: 4, min: 1, max: 4 },
    { name: 'mask_area', icon: 'Scan', type: 'text', label: 'Mask Area (Optional)', placeholder: 'e.g. background, face, sky' }
];

const MOCKUP_FIELDS: FormFieldDef[] = [
    { name: 'mockup_types', icon: 'Box', type: 'tags', label: 'Mockup Types', placeholder: 'e.g. T-shirt, Mug, Billboard, Phone', required: true, max: 6 },
    { name: 'background_style', icon: 'Palette', type: 'text', label: 'Background Style', placeholder: 'e.g. Studio, Outdoor, Minimal' },
    {
        name: 'scene_quality', icon: 'Sparkles', type: 'select', label: 'Scene Quality', defaultValue: 'high', options: [
            { label: 'High Quality', value: 'high' },
            { label: 'Photorealistic', value: 'photorealistic' },
            { label: 'Draft', value: 'draft' }
        ]
    },
    { name: 'variation_count', icon: 'Hash', type: 'number', label: 'Variations per Type', defaultValue: 2, min: 1, max: 4 }
];

const INFOGRAPHIC_FIELDS: FormFieldDef[] = [
    { name: 'topic', icon: 'FileText', type: 'text', label: 'Topic', placeholder: 'e.g. Market Analysis 2024', required: true, section: 'Content' },
    { name: 'data_points', icon: 'Database', type: 'textarea', label: 'Data Points', placeholder: 'Key data to visualize (JSON or plain text)', rows: 4, helpText: 'Enter data as JSON array or plain text list' },
    {
        name: 'style', icon: 'Paintbrush', type: 'select', label: 'Style', defaultValue: 'modern', options: [
            { label: 'Modern', value: 'modern' },
            { label: 'Corporate', value: 'corporate' },
            { label: 'Playful', value: 'playful' },
            { label: 'Minimal', value: 'minimal' },
        ]
    },
    {
        name: 'orientation', icon: 'Monitor', type: 'select', label: 'Orientation', defaultValue: 'portrait', options: [
            { label: 'Portrait (Tall)', value: 'portrait' },
            { label: 'Landscape (Wide)', value: 'landscape' },
        ]
    },
    {
        name: 'aspect_ratio', icon: 'Monitor', type: 'select', label: 'Aspect Ratio', defaultValue: '9:16', options: [
            { label: '9:16 (Tall)', value: '9:16' },
            { label: '4:5 (Instagram)', value: '4:5' },
            { label: '16:9 (Landscape)', value: '16:9' },
        ]
    },
    { name: 'tone_override', icon: 'Mic', type: 'text', label: 'Tone Override', placeholder: 'e.g. More professional, Cheerful' }
];

// ═══════════════════════════════════════════════════════════
// SHARED MEDIA GENERATION FIELD SETS
// ═══════════════════════════════════════════════════════════

const MEDIA_IMAGE_VIDEO: FormFieldDef[] = [
    { name: 'generate_image', icon: 'Image', type: 'checkbox', label: 'Generate AI Images', defaultValue: true, section: 'Media Generation' },
    { name: 'image_count', icon: 'Hash', type: 'number', label: 'Number of Images', defaultValue: 2, min: 1, max: 4, helpText: 'AI-generated images per post (max 4)' },
    { name: 'generate_video', icon: 'Film', type: 'checkbox', label: 'Generate AI Video', defaultValue: false, helpText: 'Video generation takes 1-3 minutes' },
    { name: 'video_count', icon: 'Hash', type: 'number', label: 'Number of Videos', defaultValue: 1, min: 1, max: 1, helpText: 'Max 1 AI-generated video per post' },
];
const MEDIA_IMAGE_ONLY: FormFieldDef[] = [
    { name: 'generate_image', icon: 'Image', type: 'checkbox', label: 'Generate AI Images', defaultValue: true, section: 'Media Generation' },
    { name: 'image_count', icon: 'Hash', type: 'number', label: 'Number of Images', defaultValue: 2, min: 1, max: 4, helpText: 'AI-generated images per post (max 4)' },
];
const MEDIA_VIDEO_ONLY: FormFieldDef[] = [
    { name: 'generate_video', icon: 'Film', type: 'checkbox', label: 'Generate AI Video', defaultValue: true, section: 'Media Generation', helpText: 'Video generation takes 1-3 minutes' },
];

// ═══════════════════════════════════════════════════════════
// SOCIAL MEDIA CATEGORY (22)
// ═══════════════════════════════════════════════════════════

const INSTAGRAM_BASE: FormFieldDef[] = [
    { name: 'topic', icon: 'FileText', type: 'textarea', label: 'Topic / Brief', placeholder: 'What is this post about?', required: true, section: 'Post Details', rows: 3 },
    { name: 'visual_theme', icon: 'Palette', type: 'text', label: 'Visual Theme', placeholder: 'e.g. Minimalist, Vibrant, Dark & Moody' },
    {
        name: 'hook_style', icon: 'Zap', type: 'select', label: 'Hook Style', options: [
            { label: 'Question', value: 'question' },
            { label: 'Statistic', value: 'statistic' },
            { label: 'Controversial Statement', value: 'controversial' },
            { label: 'Personal Story', value: 'story' },
            { label: 'Direct Benefit', value: 'benefit' },
        ]
    },
    {
        name: 'tone_override', icon: 'Mic', type: 'select', label: 'Tone', options: [
            { label: 'Auto (use brand voice)', value: '' },
            { label: 'Casual & Fun', value: 'casual' },
            { label: 'Professional', value: 'professional' },
            { label: 'Inspirational', value: 'inspirational' },
            { label: 'Educational', value: 'educational' },
            { label: 'Promotional', value: 'promotional' },
        ]
    },
    { name: 'keywords', icon: 'Hash', type: 'tags', label: 'Keywords / Hashtag Themes', placeholder: 'Key themes for hashtag generation', max: 8 },
];

// Per-agent Instagram composed arrays
const INSTAGRAM_POST_FIELDS: FormFieldDef[] = [
    ...INSTAGRAM_BASE,
    { name: 'shot_list', icon: 'Camera', type: 'textarea', label: 'Shot List / Visual Instructions', placeholder: 'Detail the shots you need...', rows: 2 },
    { name: 'final_slide_cta', icon: 'Zap', type: 'text', label: 'CTA', placeholder: 'e.g. Visit link, DM for info' },
    ...MEDIA_IMAGE_VIDEO,
];
const INSTAGRAM_STORY_FIELDS: FormFieldDef[] = [
    ...INSTAGRAM_BASE,
    { name: 'frame_count', icon: 'Film', type: 'number', label: 'Frame Count (for Story Sequence)', defaultValue: 3, min: 1, max: 10 },
    { name: 'sticker_cta', icon: 'Tag', type: 'text', label: 'Sticker CTA (for Stories)', placeholder: 'e.g. Link in bio, Vote now' },
    { name: 'story_sequence', icon: 'ListOrdered', type: 'textarea', label: 'Story Sequence Outline', placeholder: 'Describe the flow across frames...', rows: 2 },
    ...MEDIA_IMAGE_VIDEO,
];
const INSTAGRAM_REEL_FIELDS: FormFieldDef[] = [
    ...INSTAGRAM_BASE,
    { name: 'duration_seconds', icon: 'Clock', type: 'number', label: 'Duration (seconds)', defaultValue: 15, min: 5, max: 90 },
    { name: 'audio_reference', icon: 'Music', type: 'text', label: 'Audio / Trending Sound Ref', placeholder: 'e.g. "Upbeat Lo-fi", "Trending Motivation"' },
    { name: 'shot_list', icon: 'Camera', type: 'textarea', label: 'Shot List / Visual Instructions', placeholder: 'Detail the shots you need...', rows: 2 },
    ...MEDIA_VIDEO_ONLY,
];
const INSTAGRAM_CAROUSEL_FIELDS: FormFieldDef[] = [
    ...INSTAGRAM_BASE,
    { name: 'slide_count', icon: 'Layers', type: 'number', label: 'Slide Count', defaultValue: 5, min: 2, max: 10 },
    { name: 'slide_goal', icon: 'Target', type: 'text', label: 'Goal per Slide', placeholder: 'e.g. Educate on X, Tease Y' },
    { name: 'final_slide_cta', icon: 'Zap', type: 'text', label: 'Final Slide CTA', placeholder: 'e.g. Visit link, DM for info' },
    ...MEDIA_IMAGE_ONLY,
];
const INSTAGRAM_BIO_FIELDS: FormFieldDef[] = [
    ...INSTAGRAM_BASE,
];

const FACEBOOK_BASE: FormFieldDef[] = [
    { name: 'topic', icon: 'FileText', type: 'textarea', label: 'Topic / Brief', placeholder: 'What is this post about?', required: true, section: 'Post Details', rows: 3 },
    {
        name: 'goal', icon: 'Target', type: 'select', label: 'Post Goal', defaultValue: 'engagement', options: [
            { label: 'Engagement', value: 'engagement' },
            { label: 'Traffic', value: 'traffic' },
            { label: 'Leads', value: 'leads' },
            { label: 'Awareness', value: 'awareness' },
        ]
    },
    { name: 'audience_segment', icon: 'Users', type: 'text', label: 'Audience Segment', placeholder: 'e.g. Existing customers, Lookalike' },
    {
        name: 'campaign_stage', icon: 'Flag', type: 'select', label: 'Campaign Stage', options: [
            { label: 'Awareness (Top of Funnel)', value: 'awareness' },
            { label: 'Consideration (Middle)', value: 'consideration' },
            { label: 'Conversion (Bottom)', value: 'conversion' },
            { label: 'Retention / Loyalty', value: 'retention' },
        ]
    },
    {
        name: 'tone_override', icon: 'Mic', type: 'select', label: 'Tone', options: [
            { label: 'Auto (Friendly)', value: '' },
            { label: 'Professional', value: 'professional' },
            { label: 'Humorous / Witty', value: 'humorous' },
            { label: 'Inspirational', value: 'inspirational' },
            { label: 'Educational', value: 'educational' },
        ]
    },
    { name: 'include_link', icon: 'Link', type: 'checkbox', label: 'Include Link Call-to-Action' },
];
const FACEBOOK_POST_FIELDS: FormFieldDef[] = [...FACEBOOK_BASE, ...MEDIA_IMAGE_VIDEO];
const FACEBOOK_AD_COPY_FIELDS: FormFieldDef[] = [...FACEBOOK_BASE, ...MEDIA_IMAGE_ONLY];

const LINKEDIN_BASE: FormFieldDef[] = [
    { name: 'topic', icon: 'FileText', type: 'textarea', label: 'Topic / Brief', placeholder: 'Professional topic or thought leadership angle...', required: true, section: 'Post Details', rows: 3 },
    {
        name: 'professional_tone', icon: 'Briefcase', type: 'select', label: 'Professional Tone', defaultValue: 'expert', options: [
            { label: 'Expert', value: 'expert' },
            { label: 'Thought Leader', value: 'thought_leader' },
            { label: 'Conversational', value: 'conversational' },
            { label: 'Storyteller', value: 'storyteller' },
        ]
    },
    {
        name: 'tone_override', icon: 'Mic', type: 'select', label: 'Tone', options: [
            { label: 'Auto (Friendly)', value: '' },
            { label: 'Professional', value: 'professional' },
            { label: 'Humorous / Witty', value: 'humorous' },
            { label: 'Inspirational', value: 'inspirational' },
            { label: 'Educational', value: 'educational' },
        ]
    },
    { name: 'include_link', icon: 'Link', type: 'checkbox', label: 'Include Link Call-to-Action' },
];
const LINKEDIN_POST_FIELDS: FormFieldDef[] = [...LINKEDIN_BASE, ...MEDIA_IMAGE_ONLY];
const LINKEDIN_ARTICLE_FIELDS: FormFieldDef[] = [
    ...LINKEDIN_BASE,
    { name: 'outline_depth', icon: 'List', type: 'select', label: 'Outline Depth', defaultValue: 'detailed', options: [
        { label: 'Detailed', value: 'detailed' },
        { label: 'Brief', value: 'brief' },
        { label: 'Bullet Points only', value: 'bullets' }
    ]},
    { name: 'section_count', icon: 'Hash', type: 'number', label: 'Section Count', defaultValue: 5, min: 1, max: 10 },
];
const LINKEDIN_AD_FIELDS: FormFieldDef[] = [...LINKEDIN_BASE, ...MEDIA_IMAGE_ONLY];

const TWITTER_BASE: FormFieldDef[] = [
    { name: 'topic', icon: 'FileText', type: 'textarea', label: 'Topic / Brief', placeholder: 'What should this tweet/thread be about?', required: true, section: 'Post Details', rows: 2 },
    {
        name: 'persona_mode', icon: 'UserCircle', type: 'select', label: 'Persona Mode', options: [
            { label: 'Growth Hacker', value: 'growth_hacker' },
            { label: 'Educator', value: 'educator' },
            { label: 'Shitposter/Entertainer', value: 'shitposter' },
            { label: 'Analyst', value: 'analyst' }
        ]
    },
    {
        name: 'tone_override', icon: 'Mic', type: 'select', label: 'Tone', options: [
            { label: 'Auto (Punchy)', value: '' },
            { label: 'Professional', value: 'professional' },
            { label: 'Humorous / Witty', value: 'humorous' },
            { label: 'Inspirational', value: 'inspirational' },
            { label: 'Educational', value: 'educational' },
        ]
    },
];
const TWITTER_TWEET_FIELDS: FormFieldDef[] = [...TWITTER_BASE, ...MEDIA_IMAGE_ONLY];
const TWITTER_THREAD_FIELDS: FormFieldDef[] = [
    ...TWITTER_BASE,
    { name: 'thread_length', icon: 'ListOrdered', type: 'number', label: 'Thread Length (tweets)', defaultValue: 5, min: 1, max: 20 },
    { name: 'thread_goal', icon: 'Flag', type: 'text', label: 'Thread Goal', placeholder: 'e.g. Viral reach, Education, Conversion' },
    { name: 'thread_outline', icon: 'List', type: 'textarea', label: 'Thread Outline (Optional)', rows: 2 },
    ...MEDIA_IMAGE_ONLY,
];
const TWITTER_AD_FIELDS: FormFieldDef[] = [...TWITTER_BASE, ...MEDIA_IMAGE_ONLY];

// B3: destination_url removed (use scraper)
const PINTEREST_TIKTOK_BASE: FormFieldDef[] = [
    { name: 'topic', icon: 'FileText', type: 'textarea', label: 'Topic / Brief', placeholder: 'What is this content about?', required: true, section: 'Content Details', rows: 3 },
    { name: 'pin_title', icon: 'Type', type: 'text', label: 'Pin / Video Title', placeholder: 'Enter a catchy title' },
    {
        name: 'creator_style', icon: 'User', type: 'select', label: 'Creator Style', options: [
            { label: 'UGC Style', value: 'ugc' },
            { label: 'Polished Brand', value: 'brand' },
            { label: 'Minimalist', value: 'minimal' },
            { label: 'Lo-fi', value: 'lofi' }
        ]
    },
    { name: 'visual_theme', icon: 'Palette', type: 'text', label: 'Visual Theme', placeholder: 'e.g. Aesthetic, Bold, Pastel, Trending' },
    {
        name: 'tone_override', icon: 'Mic', type: 'select', label: 'Tone', options: [
            { label: 'Auto (use brand voice)', value: '' },
            { label: 'Fun & Trendy', value: 'fun' },
            { label: 'Educational', value: 'educational' },
            { label: 'Inspirational', value: 'inspirational' },
            { label: 'Promotional', value: 'promotional' },
        ]
    },
    { name: 'keywords', icon: 'Hash', type: 'tags', label: 'Keywords', placeholder: 'Key themes and trending topics', max: 8 },
];
const PINTEREST_PIN_FIELDS: FormFieldDef[] = [...PINTEREST_TIKTOK_BASE, ...MEDIA_IMAGE_ONLY];
const PINTEREST_AD_FIELDS: FormFieldDef[] = [...PINTEREST_TIKTOK_BASE, ...MEDIA_IMAGE_ONLY];
const TIKTOK_SCRIPT_FIELDS: FormFieldDef[] = [
    ...PINTEREST_TIKTOK_BASE,
    { name: 'duration_seconds', icon: 'Clock', type: 'number', label: 'Target Duration (seconds)', defaultValue: 15, min: 5, max: 60 },
    { name: 'audio_reference', icon: 'Music', type: 'text', label: 'Audio / Trending Ref', placeholder: 'e.g. "Popular TikTok sound"' },
    ...MEDIA_VIDEO_ONLY,
];
const TIKTOK_TREND_FIELDS: FormFieldDef[] = [
    ...PINTEREST_TIKTOK_BASE,
    { name: 'duration_seconds', icon: 'Clock', type: 'number', label: 'Target Duration (seconds)', defaultValue: 15, min: 5, max: 60 },
    { name: 'audio_reference', icon: 'Music', type: 'text', label: 'Audio / Trending Ref', placeholder: 'e.g. "Popular TikTok sound"' },
    ...MEDIA_VIDEO_ONLY,
];
const TIKTOK_AD_FIELDS: FormFieldDef[] = [
    ...PINTEREST_TIKTOK_BASE,
    { name: 'duration_seconds', icon: 'Clock', type: 'number', label: 'Target Duration (seconds)', defaultValue: 15, min: 5, max: 60 },
    { name: 'audio_reference', icon: 'Music', type: 'text', label: 'Audio / Trending Ref', placeholder: 'e.g. "Popular TikTok sound"' },
    ...MEDIA_VIDEO_ONLY,
];

// ═══════════════════════════════════════════════════════════
// VIDEO & MOTION CATEGORY (8)
// ═══════════════════════════════════════════════════════════

const VIDEO_FIELDS: FormFieldDef[] = [
    { name: 'topic', icon: 'FileText', type: 'textarea', label: 'Topic / Brief', placeholder: 'What is this video about?', required: true, section: 'Video Details', rows: 3 },
    { name: 'video_title', icon: 'Type', type: 'text', label: 'Video Title', placeholder: 'Script title' },
    { name: 'thumbnail_text', icon: 'Image', type: 'text', label: 'Thumbnail Title Text', placeholder: 'Text for AI thumbnail generation' },
    { name: 'target_duration', icon: 'Clock', type: 'number', label: 'Target Duration (seconds)', defaultValue: 60, min: 5, max: 600 },
    { name: 'campaign_goal', icon: 'Target', type: 'text', label: 'Campaign Goal', placeholder: 'e.g. Sales, Awareness' },
    { name: 'cta', icon: 'Zap', type: 'text', label: 'Call to Action', placeholder: 'e.g. Click link, Subscribe' },
    { name: 'shot_count', icon: 'Camera', type: 'number', label: 'Shot/Scene Count', defaultValue: 5, min: 1, max: 20 },
    { name: 'creator_persona', icon: 'User', type: 'text', label: 'Creator Persona', placeholder: 'e.g. Tech Reviewer, Chef' },
    { name: 'chapter_count', icon: 'List', type: 'number', label: 'Chapter Count', defaultValue: 3 },
    { name: 'audience', icon: 'Users', type: 'text', label: 'Specific Audience', placeholder: 'e.g. Home cooks, Gamers' },
    { name: 'emotion', icon: 'Heart', type: 'text', label: 'Primary Emotion', placeholder: 'e.g. Hype, Calm, Fear' },
    { name: 'visual_angle', icon: 'Video', type: 'text', label: 'Visual Angle', placeholder: 'e.g. Cinematic, First-person' },
    {
        name: 'platform', icon: 'Monitor', type: 'select', label: 'Platform', defaultValue: 'youtube', options: [
            { label: 'YouTube', value: 'youtube' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'Instagram Reels', value: 'instagram' },
            { label: 'TV / Commercial', value: 'tv' },
            { label: 'Website / Landing Page', value: 'website' },
        ]
    },
    {
        name: 'tone_override', icon: 'Mic', type: 'select', label: 'Tone', options: [
            { label: 'Auto (Friendly)', value: '' },
            { label: 'Professional', value: 'professional' },
            { label: 'Humorous / Witty', value: 'humorous' },
            { label: 'Inspirational', value: 'inspirational' },
            { label: 'Educational', value: 'educational' },
        ]
    },
    {
        name: 'pacing', icon: 'FastForward', type: 'select', label: 'Pacing / Editing Style', defaultValue: 'medium', options: [
            { label: 'Medium / Standard', value: 'medium' },
            { label: 'Fast (TikTok/Reels)', value: 'fast' },
            { label: 'Slow & Cinematic', value: 'slow' }
        ]
    },
    { name: 'include_link', icon: 'Link', type: 'checkbox', label: 'Include Link Call-to-Action' }
];
const THUMBNAIL_IDEA_FIELDS: FormFieldDef[] = [...VIDEO_FIELDS, ...MEDIA_IMAGE_ONLY];

// ═══════════════════════════════════════════════════════════
// CONTENT & COPY CATEGORY (12)
// ═══════════════════════════════════════════════════════════

const CONTENT_FIELDS: FormFieldDef[] = [
    { name: 'topic', icon: 'FileText', type: 'textarea', label: 'Topic / Brief', placeholder: 'What should this content be about?', required: true, section: 'Content Details', rows: 3 },
    { name: 'thesis', icon: 'Lightbulb', type: 'textarea', label: 'Main Thesis / Message', placeholder: 'The core argument or takeaway...', rows: 2 },
    { name: 'target_length_words', icon: 'AlignLeft', type: 'number', label: 'Target Word Count', defaultValue: 800, min: 100, max: 5000 },
    { name: 'seo_intent', icon: 'Search', type: 'text', label: 'SEO Intent', placeholder: 'e.g. Informational, Commercial' },
    { name: 'sections_to_include', icon: 'List', type: 'tags', label: 'Sections to Include', placeholder: 'e.g. Intro, Case Study, FAQ', max: 6 },
    {
        name: 'audience_level', icon: 'GraduationCap', type: 'select', label: 'Audience Level', options: [
            { label: 'Beginner', value: 'beginner' },
            { label: 'Intermediate', value: 'intermediate' },
            { label: 'Advanced', value: 'advanced' },
            { label: 'Expert/Niche', value: 'expert' }
        ]
    },
    { name: 'source_material', icon: 'File', type: 'textarea', label: 'Source Material / Key Facts', placeholder: 'Paste specific data or notes to include...', rows: 3 },
    {
        name: 'tone_override', icon: 'Mic', type: 'select', label: 'Tone', options: [
            { label: 'Auto (use brand voice)', value: '' },
            { label: 'Professional', value: 'professional' },
            { label: 'Conversational', value: 'conversational' },
            { label: 'Authoritative', value: 'authoritative' },
            { label: 'Persuasive', value: 'persuasive' },
            { label: 'Educational', value: 'educational' },
            { label: 'Friendly', value: 'friendly' },
        ]
    },
    { name: 'audience_selection', icon: 'Users', type: 'text', label: 'Target Audience / Persona', placeholder: 'e.g. Marketing Managers, Tech Enthusiasts', section: 'Audience' },
    { name: 'call_to_action', icon: 'Zap', type: 'text', label: 'Call to Action', placeholder: 'e.g. Subscribe now, Download free guide' },
    { name: 'keywords', icon: 'Hash', type: 'tags', label: 'Keywords', placeholder: 'SEO keywords to include', max: 8 },
];

// Blog-only extras for media generation
const BLOG_FIELDS: FormFieldDef[] = [
    ...CONTENT_FIELDS,
    { name: 'generate_image', icon: 'Image', type: 'checkbox', label: 'Generate blog images', defaultValue: false, section: 'Media' },
    { name: 'image_count', icon: 'Hash', type: 'number', label: 'Images to Generate (max 4)', defaultValue: 2, min: 1, max: 4, helpText: 'Pick how many visuals to embed in the post.' },
];

const NEWSLETTER_FIELDS: FormFieldDef[] = [
    ...CONTENT_FIELDS,
    { name: 'newsletter_goal', icon: 'Target', type: 'text', label: 'Newsletter Goal', placeholder: 'e.g. Weekly Roundup, Product Updates', section: 'Newsletter Info' },
    { name: 'issue_theme', icon: 'Palette', type: 'text', label: 'Issue Theme', placeholder: 'e.g. The Future of AI' },
    { name: 'email_count', icon: 'Hash', type: 'number', label: 'Number of Emails (if sequence)', defaultValue: 1, min: 1, max: 10 }
];

const LANDING_PAGE_FIELDS: FormFieldDef[] = [
    ...CONTENT_FIELDS,
    { name: 'page_sections', icon: 'Layout', type: 'tags', label: 'Page Sections', placeholder: 'e.g. Hero, Features, Testimonials', section: 'Landing Page Details' }
];

const CASE_STUDY_FIELDS: FormFieldDef[] = [
    ...CONTENT_FIELDS,
    { name: 'customer_name', icon: 'User', type: 'text', label: 'Customer / Client Name', section: 'Case Study Details' },
    { name: 'results_metrics', icon: 'BarChart3', type: 'textarea', label: 'Results & Metrics', placeholder: 'e.g. 50% increase in leads', rows: 2 },
    { name: 'problem_statement', icon: 'AlertCircle', type: 'textarea', label: 'The Problem', placeholder: 'What challenge was solved?', rows: 2 }
];

const PRESS_RELEASE_FIELDS: FormFieldDef[] = [
    ...CONTENT_FIELDS,
    { name: 'announcement_date', icon: 'Calendar', type: 'text', label: 'Announcement Date', placeholder: 'FOR IMMEDIATE RELEASE or YYYY-MM-DD', section: 'Press Details' },
    { name: 'quote_source', icon: 'MessageSquare', type: 'text', label: 'Quote Source', placeholder: 'Name and Title of spokesperson' },
    { name: 'boilerplate', icon: 'FileText', type: 'textarea', label: 'Company Boilerplate', placeholder: 'About the company...', rows: 3 }
];

const WHITEPAPER_FIELDS: FormFieldDef[] = [
    ...CONTENT_FIELDS,
    { name: 'source_requirements', icon: 'BookOpen', type: 'textarea', label: 'Source Requirements / Bibliography', placeholder: 'Specific data sources or research to cite...', rows: 3, section: 'Whitepaper Info' }
];

const PRODUCT_DESCRIPTION_FIELDS: FormFieldDef[] = [
    ...CONTENT_FIELDS,
    { name: 'feature_list', icon: 'ListChecks', type: 'tags', label: 'Key Features', section: 'Product Info' },
    { name: 'specs', icon: 'Settings', type: 'textarea', label: 'Technical Specs', placeholder: 'Weight, dimensions, materials...', rows: 2 }
];

const FAQ_GENERATOR_FIELDS: FormFieldDef[] = [
    ...CONTENT_FIELDS,
    { name: 'question_count', icon: 'Hash', type: 'number', label: 'Number of Questions', defaultValue: 5, section: 'FAQ Info' },
    { name: 'support_stage', icon: 'LifeBuoy', type: 'select', label: 'Support Stage', options: [
        { label: 'Pre-Purchase', value: 'pre-purchase' },
        { label: 'Post-Purchase', value: 'post-purchase' },
        { label: 'Technical Support', value: 'technical' }
    ]}
];

const SMS_MARKETING_FIELDS: FormFieldDef[] = [
    ...CONTENT_FIELDS,
    { name: 'link_url', icon: 'Link', type: 'url', label: 'Link URL', section: 'SMS Info' },
    { name: 'character_limit', icon: 'Scissors', type: 'number', label: 'Character Limit', defaultValue: 160 },
    { name: 'urgency_level', icon: 'AlertTriangle', type: 'select', label: 'Urgency Level', options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High / Flash Sale', value: 'high' }
    ]}
];

const CONTENT_AUDIT_FIELDS: FormFieldDef[] = [
    ...CONTENT_FIELDS,
    { name: 'audit_goal', icon: 'Target', type: 'text', label: 'Audit Goal', placeholder: 'e.g. Identify gaps, Content refresh', section: 'Audit Info' }
];


// ═══════════════════════════════════════════════════════════
// ADVERTISING COPY CATEGORY (8)
// ═══════════════════════════════════════════════════════════

const AD_COPY_FIELDS: FormFieldDef[] = [
    { name: 'product_name', icon: 'Box', type: 'text', label: 'Product / Service Name', placeholder: 'e.g. Acme Marketing Suite', required: true },
    { name: 'offer', icon: 'Target', type: 'textarea', label: 'Core Offer / Hook', placeholder: 'e.g. 50% off first month, Free Consultation', required: true, rows: 2 },
    { name: 'cta', icon: 'Zap', type: 'text', label: 'Call to Action (CTA)', placeholder: 'e.g. Shop Now, Get Free Trial' },
    { name: 'keyword_theme', icon: 'Hash', type: 'tags', label: 'Keywords to Include', max: 5 },
    {
        name: 'benefit_focus', icon: 'Brain', type: 'select', label: 'Benefit Focus / Angle', options: [
            { label: 'Emotional / Aspirational', value: 'emotional' },
            { label: 'Rational / Cost-saving', value: 'rational' },
            { label: 'Scarcity / Urgency', value: 'scarcity' },
            { label: 'Social Proof / Trust', value: 'social_proof' },
        ], defaultValue: 'emotional'
    },
    {
        name: 'tone_override', icon: 'Mic', type: 'select', label: 'Brand Voice / Tone', options: [
            { label: 'Auto (Persuasive)', value: '' },
            { label: 'Direct Response / Hard Sell', value: 'direct_response' },
            { label: 'Conversational / Storytelling', value: 'conversational' },
            { label: 'Professional / Clinical', value: 'professional' },
            { label: 'Humorous / Disruptive', value: 'humorous' }
        ]
    },
    { name: 'target_audience', icon: 'Users', type: 'text', label: 'Target Audience Persona', placeholder: 'e.g. B2B Founders, Freelancers' },
    { name: 'target_keywords', icon: 'Search', type: 'tags', label: 'Target Keywords', placeholder: 'Keywords for ad targeting', max: 8 },
];

// ═══════════════════════════════════════════════════════════
// SEO & AEO CATEGORY (4)
// ═══════════════════════════════════════════════════════════

const SEO_FIELDS: FormFieldDef[] = [
    { name: 'site_url', icon: 'Globe', type: 'url', label: 'Main Site URL', placeholder: 'https://yoursite.com' },
    { name: 'region', icon: 'MapPin', type: 'text', label: 'Region', defaultValue: 'US' },
    { name: 'target_keywords', icon: 'Search', type: 'tags', label: 'Primary Target Keywords', placeholder: 'Keywords you want to rank for', max: 10 },
    { name: 'seed_keywords', icon: 'Search', type: 'tags', label: 'Seed Keywords', placeholder: 'Initial ideas', max: 5 },
    { name: 'competitor_urls', icon: 'Shield', type: 'tags', label: 'Competitor URLs', placeholder: 'https://competitor.com', max: 5 },
    {
        name: 'search_intent', icon: 'Target', type: 'select', label: 'Search Intent', defaultValue: 'informational', options: [
            { label: 'Informational (How-to, Guides)', value: 'informational' },
            { label: 'Navigational (Brand Search)', value: 'navigational' },
            { label: 'Commercial (Reviews, Vs)', value: 'commercial' },
            { label: 'Transactional (Buy, Download)', value: 'transactional' }
        ]
    },
    { name: 'target_audience', icon: 'Users', type: 'text', label: 'Target Audience Persona', placeholder: 'e.g. CMOs, Fitness Enthusiasts' },
    { name: 'answer_questions', icon: 'HelpCircle', type: 'tags', label: 'Specific Questions to Answer', max: 5 }
];

const ON_PAGE_SEO_FIELDS: FormFieldDef[] = [
    ...SEO_FIELDS,
    { name: 'page_title', icon: 'Type', type: 'text', label: 'Current Page Title', section: 'SEO Polish' },
    { name: 'page_content', icon: 'FileText', type: 'textarea', label: 'Page Content (Excerpt)', rows: 4 },
    { name: 'meta_description', icon: 'AlignLeft', type: 'textarea', label: 'Desired Meta Description', rows: 2 }
];

const TECHNICAL_SEO_FIELDS: FormFieldDef[] = [
    ...SEO_FIELDS,
    { name: 'sitemap_url', icon: 'Layout', type: 'url', label: 'Sitemap URL', section: 'Technical Details' },
    { name: 'robots_txt_url', icon: 'Bot', type: 'url', label: 'Robots.txt URL' }
];

const AEO_OPTIMIZER_FIELDS: FormFieldDef[] = [
    ...SEO_FIELDS,
    { name: 'faq_content', icon: 'HelpCircle', type: 'textarea', label: 'Existing FAQ Content', rows: 4, section: 'AEO' },
    { name: 'entity_targets', icon: 'Database', type: 'tags', label: 'Entity Targets', placeholder: 'Key concepts or brands to associate with' }
];


// ═══════════════════════════════════════════════════════════
// AUDIO & PODCAST CATEGORY (3)
// ═══════════════════════════════════════════════════════════

const AUDIO_FIELDS: FormFieldDef[] = [
    { name: 'topic', icon: 'FileText', type: 'textarea', label: 'Topic / Content', placeholder: 'What is this audio content about?', required: true, section: 'Details', rows: 3 },
    { name: 'target_duration_mins', icon: 'Clock', type: 'number', label: 'Target Duration (minutes)', defaultValue: 30, min: 5, max: 120 },
    { name: 'guest_names', icon: 'Users', type: 'tags', label: 'Guest Names', placeholder: 'Guest speakers (if any)', max: 4 },
    { name: 'audience_selection', icon: 'Users', type: 'text', label: 'Target Audience / Persona', placeholder: 'e.g. Podcast Listeners' },
    {
        name: 'tone_override', icon: 'Mic', type: 'select', label: 'Tone / Vibe', options: [
            { label: 'Professional', value: 'professional' },
            { label: 'Conversational', value: 'conversational' },
            { label: 'Dramatic', value: 'dramatic' },
        ]
    },
    { name: 'generate_audio', icon: 'Headphones', type: 'checkbox', label: 'Generate AI Audio', defaultValue: false, section: 'Audio Generation', helpText: 'Uses Gemini to convert script to audio' }
];


// ═══════════════════════════════════════════════════════════
// GROWTH & STRATEGY CATEGORY (12)
// All map to GrowthInput: topic, target_audience, current_metrics, additional_context, url_to_analyze
// ═══════════════════════════════════════════════════════════

const PRICING_STRATEGY_FIELDS: FormFieldDef[] = [
    { name: 'topic', type: 'textarea', label: 'Product / Service Description', placeholder: 'Describe your product...', required: true, section: 'Product', rows: 3, icon: 'Package' },
    { name: 'target_audience', icon: 'Users', type: 'text', label: 'Target Audience', placeholder: 'e.g. B2B SaaS founders, DTC consumers' },
    { name: 'pricing_objective', icon: 'Target', type: 'text', label: 'Pricing Objective', placeholder: 'e.g. Market penetration, Maximize profit' },
    { name: 'margin_target', icon: 'Percent', type: 'number', label: 'Target Margin (%)', defaultValue: 30 },
    { name: 'packaging_constraints', icon: 'Box', type: 'text', label: 'Packaging Constraints', placeholder: 'e.g. No usage-based, Fixed tiers only' },
    { name: 'current_metrics', icon: 'BarChart3', type: 'textarea', label: 'Current Metrics', placeholder: 'DAU, MAU, Churn...', rows: 2 }
];

const LAUNCH_STRATEGY_FIELDS: FormFieldDef[] = [
    { name: 'topic', icon: 'Rocket', type: 'textarea', label: 'Product / Initiative', required: true, section: 'Launch Details', rows: 3 },
    { name: 'launch_date', icon: 'Calendar', type: 'text', label: 'Launch Date', placeholder: 'e.g. 2026-04-15' },
    {
        name: 'launch_type', icon: 'Flag', type: 'select', label: 'Launch Type', options: [
            { label: 'Alpha/Beta', value: 'beta' },
            { label: 'Public Release', value: 'public' },
            { label: 'Internal', value: 'internal' },
        ]
    },
    { name: 'target_audience', icon: 'Users', type: 'text', label: 'Target Audience', placeholder: 'e.g. Early adopters, Enterprise' },
    { name: 'success_metric', icon: 'BarChart3', type: 'text', label: 'Success Metric', placeholder: 'e.g. 500 signups' },
    { name: 'channels', icon: 'Share2', type: 'tags', label: 'Launch Channels', max: 5 },
    { name: 'traffic_split', icon: 'Divide', type: 'text', label: 'Traffic Split', defaultValue: '50/50' }
];

const COLD_EMAIL_FIELDS: FormFieldDef[] = [
    { name: 'topic', icon: 'Mail', type: 'textarea', label: 'Product / Offer', required: true, section: 'Outreach', rows: 3 },
    { name: 'target_audience', icon: 'Users', type: 'text', label: 'Target Audience', placeholder: 'e.g. VP of Engineering at Series B startups' },
    { name: 'email_count', icon: 'Hash', type: 'number', label: 'Number of Emails', defaultValue: 1, min: 1, max: 5 },
    { name: 'sender_identity', icon: 'User', type: 'text', label: 'Sender Identity', placeholder: 'e.g. Founder, Sales Lead' },
    { name: 'cta_type', icon: 'Zap', type: 'text', label: 'Desired CTA', placeholder: 'e.g. Book a call, Reply with interest' },
    { name: 'personalization_inputs', icon: 'Pointer', type: 'tags', label: 'Personalization Inputs', placeholder: 'e.g. LinkedIn profile, Recent post', max: 3 }
];

const EMAIL_SEQUENCE_FIELDS: FormFieldDef[] = [
    { name: 'topic', icon: 'Mail', type: 'textarea', label: 'Sequence Purpose', required: true, section: 'Sequence', rows: 3 },
    { name: 'trigger_event', icon: 'Zap', type: 'text', label: 'Trigger Event', placeholder: 'e.g. User signup, Cart abandon, Trial expiry' },
    { name: 'email_count', icon: 'Hash', type: 'number', label: 'Number of Emails', defaultValue: 5, min: 3, max: 10 },
    { name: 'send_spacing_days', icon: 'Clock', type: 'number', label: 'Spacing (Days)', defaultValue: 2 },
    { name: 'call_to_action', icon: 'Zap', type: 'text', label: 'Primary CTA' }
];

const PAGE_CRO_FIELDS: FormFieldDef[] = [
    { name: 'topic', icon: 'MousePointerClick', type: 'textarea', label: 'Page Description', required: true, section: 'Details', rows: 3 },
    { name: 'primary_conversion_event', icon: 'Target', type: 'text', label: 'Primary Conversion Event', placeholder: 'e.g. Signup, Purchase' },
    { name: 'traffic_source_mix', icon: 'Activity', type: 'text', label: 'Traffic Source Mix', placeholder: 'e.g. 80% Meta, 20% Organic' }
];

const AB_TEST_FIELDS: FormFieldDef[] = [
    { name: 'topic', icon: 'FlaskConical', type: 'textarea', label: 'Test Hypothesis', required: true, section: 'Test', rows: 3 },
    { name: 'test_type', icon: 'Layers', type: 'select', label: 'Test Type', options: [
        { label: 'A/B (two variants)', value: 'ab' },
        { label: 'Multivariate', value: 'multivariate' },
        { label: 'Split URL', value: 'split_url' },
    ]},
    { name: 'primary_metric', icon: 'Activity', type: 'text', label: 'Primary Metric', placeholder: 'e.g. CTR' },
    { name: 'secondary_metrics', icon: 'BarChart3', type: 'tags', label: 'Secondary Metrics', max: 3 },
    { name: 'traffic_split', icon: 'Divide', type: 'text', label: 'Traffic Split', defaultValue: '50/50' }
];

const MARKETING_PSYCHOLOGY_FIELDS: FormFieldDef[] = [
    { name: 'topic', icon: 'Brain', type: 'textarea', label: 'Context', required: true, rows: 3 },
    { name: 'target_audience', icon: 'Users', type: 'text', label: 'Target Audience', placeholder: 'e.g. Price-sensitive shoppers' },
    { name: 'psychology_focus', icon: 'Sparkles', type: 'select', label: 'Psychology Focus', options: [
        { label: 'Social Proof', value: 'social_proof' },
        { label: 'Scarcity & Urgency', value: 'scarcity' },
        { label: 'Anchoring', value: 'anchoring' },
        { label: 'Loss Aversion', value: 'loss_aversion' },
        { label: 'Reciprocity', value: 'reciprocity' },
    ]},
    { name: 'ethical_constraints', icon: 'Scale', type: 'text', label: 'Ethical Constraints', placeholder: 'e.g. No fake scarcity' },
    { name: 'trust_risks', icon: 'AlertTriangle', type: 'tags', label: 'Trust Risks', max: 3 }
];

const CONTENT_STRATEGY_FIELDS: FormFieldDef[] = [
    { name: 'topic', icon: 'FileText', type: 'textarea', label: 'Business Goals', required: true, rows: 3 },
    { name: 'team_capacity', icon: 'Users', type: 'text', label: 'Team Capacity', placeholder: 'e.g. 2 posts per week' },
    { name: 'repurposing_targets', icon: 'RefreshCw', type: 'tags', label: 'Repurposing Targets', placeholder: 'e.g. Video, Newsletter', max: 4 }
];

const COMPETITOR_ALTERNATIVES_FIELDS: FormFieldDef[] = [
    { name: 'topic', icon: 'Shield', type: 'textarea', label: 'Your Product', required: true, rows: 3 },
    { name: 'competitor_urls', icon: 'Link', type: 'tags', label: 'Competitor URLs', max: 5 },
    { name: 'feature_matrix', icon: 'Grid', type: 'tags', label: 'Key Features to Compare', max: 8 },
    { name: 'comparison_keywords', icon: 'Search', type: 'tags', label: 'Comparison Keywords', max: 5 }
];

const SEO_AUDIT_FIELDS: FormFieldDef[] = [
    { name: 'topic', icon: 'Search', type: 'textarea', label: 'Audit Goals', required: true, rows: 3 },
    { name: 'seed_keywords', icon: 'Key', type: 'tags', label: 'Seed Keywords', max: 10 }
];

const SCHEMA_MARKUP_FIELDS: FormFieldDef[] = [
    { name: 'topic', icon: 'Code', type: 'textarea', label: 'Content Info', required: true, rows: 3 },
    { name: 'site_type', icon: 'Globe', type: 'text', label: 'Site Type', placeholder: 'e.g. E-commerce, Blog' },
    { name: 'page_type', icon: 'File', type: 'text', label: 'Page Type', placeholder: 'e.g. Product, FAQ' },
    { name: 'existing_schema_json', icon: 'Braces', type: 'textarea', label: 'Existing Schema (optional)', rows: 4 },
    { name: 'implementation_language', icon: 'Code2', type: 'text', label: 'Implementation Language', defaultValue: 'JSON-LD' }
];

const REFERRAL_PROGRAM_FIELDS: FormFieldDef[] = [
    { name: 'topic', icon: 'Gift', type: 'textarea', label: 'Program Goals', required: true, rows: 3 },
    { name: 'target_audience', icon: 'Users', type: 'text', label: 'Target Audience', placeholder: 'e.g. Existing power users' },
    { name: 'incentive_type', icon: 'Star', type: 'select', label: 'Incentive Type', options: [
        { label: 'Cash Reward', value: 'cash' },
        { label: 'Discount', value: 'discount' },
        { label: 'Credits', value: 'credits' },
        { label: 'Free Month', value: 'free_month' },
    ]},
    { name: 'reward_budget', icon: 'DollarSign', type: 'number', label: 'Reward Budget per User', defaultValue: 10 },
    { name: 'referral_cap', icon: 'Hash', type: 'number', label: 'Referral Cap per User', defaultValue: 5 },
    { name: 'program_goal', icon: 'Target', type: 'text', label: 'Desired Program Goal', placeholder: 'e.g. Viral growth, Retention' }
];

// MASTER REGISTRY: agent_id → FormFieldDef[]
export const FORM_FIELDS: Record<string, FormFieldDef[]> = {
    // Brand
    brand_naming: BRAND_NAMING_FIELDS,
    tagline_slogan: TAGLINE_FIELDS,
    target_audience: TARGET_AUDIENCE_FIELDS,
    brand_voice: BRAND_VOICE_FIELDS,
    brand_guardian: BRAND_GUARDIAN_FIELDS,

    // Creative Strategy
    creative_direction: CREATIVE_DIRECTION_FIELDS,
    campaign_concept: CAMPAIGN_CONCEPT_FIELDS,
    content_calendar: CONTENT_CALENDAR_FIELDS,

    // Visual Design
    logo_designer: LOGO_DESIGNER_FIELDS,
    hero_image: HERO_IMAGE_FIELDS,
    product_photoshoot: PRODUCT_PHOTOSHOOT_FIELDS,
    ad_creative: AD_CREATIVE_FIELDS,
    image_generator: HERO_IMAGE_FIELDS,
    image_editor: IMAGE_EDITOR_FIELDS,
    mockup_generator: MOCKUP_FIELDS,
    infographic: INFOGRAPHIC_FIELDS,

    // Social Media
    instagram_post: INSTAGRAM_POST_FIELDS,
    instagram_story: INSTAGRAM_STORY_FIELDS,
    instagram_reel: INSTAGRAM_REEL_FIELDS,
    instagram_carousel: INSTAGRAM_CAROUSEL_FIELDS,
    instagram_bio: INSTAGRAM_BIO_FIELDS,
    facebook_post: FACEBOOK_POST_FIELDS,
    facebook_ad_copy: FACEBOOK_AD_COPY_FIELDS,
    linkedin_post: LINKEDIN_POST_FIELDS,
    linkedin_article: LINKEDIN_ARTICLE_FIELDS,
    linkedin_ad: LINKEDIN_AD_FIELDS,
    twitter_tweet: TWITTER_TWEET_FIELDS,
    twitter_thread: TWITTER_THREAD_FIELDS,
    twitter_ad: TWITTER_AD_FIELDS,
    pinterest_pin: PINTEREST_PIN_FIELDS,
    pinterest_ad: PINTEREST_AD_FIELDS,
    tiktok_script: TIKTOK_SCRIPT_FIELDS,
    tiktok_trend: TIKTOK_TREND_FIELDS,
    tiktok_ad: TIKTOK_AD_FIELDS,

    // Video & Motion
    video_ad_script: VIDEO_FIELDS,
    youtube_script: VIDEO_FIELDS,
    ai_video_gen: VIDEO_FIELDS,
    video_summarizer: VIDEO_FIELDS,
    caption_generator: VIDEO_FIELDS,
    thumbnail_idea: THUMBNAIL_IDEA_FIELDS,
    video_trend_analyzer: VIDEO_FIELDS,

    // Content & Copy
    blog_post: BLOG_FIELDS,
    email_campaign: NEWSLETTER_FIELDS,
    content_strategy: CONTENT_STRATEGY_FIELDS,
    newsletter: NEWSLETTER_FIELDS,
    landing_page: LANDING_PAGE_FIELDS,
    case_study: CASE_STUDY_FIELDS,
    press_release: PRESS_RELEASE_FIELDS,
    whitepaper: WHITEPAPER_FIELDS,
    product_description: PRODUCT_DESCRIPTION_FIELDS,
    faq_generator: FAQ_GENERATOR_FIELDS,
    sms_marketing: SMS_MARKETING_FIELDS,
    content_audit: CONTENT_AUDIT_FIELDS,

    // Advertising Copy
    meta_ads: AD_COPY_FIELDS,
    google_search_ads: AD_COPY_FIELDS,
    google_display_ads: AD_COPY_FIELDS,
    linkedin_lead_gen: AD_COPY_FIELDS,
    pinterest_ads: AD_COPY_FIELDS,
    tiktok_ads: AD_COPY_FIELDS,
    youtube_ads: AD_COPY_FIELDS,
    amazon_ppc: AD_COPY_FIELDS,

    // SEO & AEO
    keyword_researcher: SEO_FIELDS,
    on_page_seo: ON_PAGE_SEO_FIELDS,
    technical_seo: TECHNICAL_SEO_FIELDS,
    aeo_optimizer: AEO_OPTIMIZER_FIELDS,

    // Audio & Podcast
    podcast_script: AUDIO_FIELDS,
    podcast_description: AUDIO_FIELDS,

    // Growth & Strategy
    pricing_strategy: PRICING_STRATEGY_FIELDS,
    launch_strategy: LAUNCH_STRATEGY_FIELDS,
    cold_email: COLD_EMAIL_FIELDS,
    email_sequence: EMAIL_SEQUENCE_FIELDS,
    page_cro: PAGE_CRO_FIELDS,
    ab_test_setup: AB_TEST_FIELDS,
    marketing_psychology: MARKETING_PSYCHOLOGY_FIELDS,
    competitor_alternatives: COMPETITOR_ALTERNATIVES_FIELDS,
    seo_audit: SEO_AUDIT_FIELDS,
    schema_markup: SCHEMA_MARKUP_FIELDS,
    referral_program: REFERRAL_PROGRAM_FIELDS,
};
