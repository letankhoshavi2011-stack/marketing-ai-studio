/**
 * testData.ts — Ready-to-use sample inputs for all 78 agents.
 *
 * Fictional brand: "GreenPulse" — a sustainable fitness-tech company
 * that sells smart workout gear made from recycled ocean plastics.
 *
 * Every agent has unique, field-accurate test data.
 * Field types match agentFormFields.ts definitions exactly:
 *   - tags → string[]
 *   - select → matching option value
 *   - checkbox → boolean
 *   - slider → number
 *   - number → number
 *
 * Usage:  import { TEST_DATA } from '../data/testData';
 *         const sampleInputs = TEST_DATA['blog_post'];
 */

// ─── Shared brand context ────────────────────────────────────
const BRAND = {
    name: 'GreenPulse',
    description:
        'GreenPulse makes smart fitness wearables and workout gear crafted from recycled ocean plastics. We combine cutting-edge health tracking with sustainable manufacturing to help eco-conscious athletes perform their best while protecting the planet.',
    industry: 'Sustainable Fitness Technology',
    audience: 'Eco-conscious fitness enthusiasts aged 25-40',
    values: ['Sustainability', 'Innovation', 'Performance', 'Transparency'],
    tone: ['Bold', 'Inspiring', 'Authentic'],
    competitors: ['Fitbit', 'Garmin', 'Whoop', 'Oura'],
};

// ═══════════════════════════════════════════════════════════════
// BRAND (6 agents)
// ═══════════════════════════════════════════════════════════════

const brand_identity = {
    business_name: BRAND.name,
    business_description: BRAND.description,
    industry: BRAND.industry,
    target_audience: BRAND.audience,
    values: BRAND.values,
    style_preferences: ['Modern', 'Clean', 'Bold'],
    color_preferences: ['#0EA5E9', '#06B6D4', '#F97316', '#1E293B', '#F8FAFC'],
    source_url: 'https://greenpulse.example.com',
    competitor_urls: ['https://fitbit.com', 'https://whoop.com', 'https://ouraring.com'],
    additional_instructions: 'We want a premium, athletic, sustainability-forward brand. Avoid looking like a typical eco-brand (no leaf icons). Think Nike meets Patagonia.',
};

const brand_naming = {
    business_description: BRAND.description,
    industry: BRAND.industry,
    values: BRAND.values,
    tone: BRAND.tone,
    style: 'compound',
    keywords_include: ['eco', 'pulse', 'green', 'ocean'],
    keywords_avoid: ['cheap', 'plastic', 'disposable'],
    competitor_names: BRAND.competitors,
    target_audience: BRAND.audience,
};

const tagline_slogan = {
    brand_name: BRAND.name,
    business_description: BRAND.description,
    target_emotion: 'empowerment',
    tone: 'Bold & Inspiring',
    use_case: 'Campaign slogan',
    channel: 'Website hero + paid social',
    max_words: 8,
    for_campaign: true,
    campaign_theme: 'Ocean Month Product Launch',
    brand_values: ['Sustainability', 'Performance', 'Innovation'],
    keywords: ['ocean', 'power', 'future', 'move'],
};

const target_audience = {
    product_description: BRAND.description,
    brand_name: BRAND.name,
    industry: BRAND.industry,
    geographic_focus: 'United States & Western Europe',
    price_point: 'premium',
    persona_count: 3,
    additional_context: 'We sell direct-to-consumer via our website and select REI locations.',
};

const brand_voice = {
    manual_tone: ['Bold', 'Energetic', 'Sustainability-forward'],
    manual_formality: 0.4,
    manual_rules: ['Never say "eco-friendly" — say "planet-positive"', 'Avoid corporate jargon', 'Use active verbs'],
    brand_description: BRAND.description,
};

const brand_guardian = {
    content_to_validate: `Get the NEW GreenPulse Pro band — it's the cheapest eco-friendly tracker on the market!
Made from recycled stuff, this plastic gadget will change your life forever.
Buy now before stocks run out!!!`,
    content_type: 'ad_copy',
    card_type: 'social_post',
    tone_override: '',
};

// ═══════════════════════════════════════════════════════════════
// CREATIVE STRATEGY (3 agents)
// ═══════════════════════════════════════════════════════════════

const creative_direction = {
    campaign_goal: 'product launch',
    tone_override: 'inspirational',
    include_link: true,
};

const campaign_concept = {
    campaign_type: 'launch',
    budget_range: '5k_25k',
    duration: '1 month',
    channels: ['Instagram', 'TikTok', 'YouTube', 'Email', 'Influencer'],
};

const content_calendar = {
    duration_weeks: 4,
    channels: ['Instagram', 'TikTok', 'LinkedIn', 'Email', 'Blog'],
    campaign_theme: 'GreenPulse Pro Launch — "Move the Ocean Forward"',
};

// ═══════════════════════════════════════════════════════════════
// VISUAL DESIGN (7 agents)
// ═══════════════════════════════════════════════════════════════

const logo_designer = {
    brand_name: BRAND.name,
    styles: ['Wordmark', 'Icon', 'Combination'],
    icon_concept: 'Ocean wave merged with a heartbeat pulse line',
    colors: ['#1fb6ff', '#0f172a', '#34d399'],
    variation_count: 4,
};

const hero_image = {
    description: 'A runner on a pristine beach at sunrise wearing the GreenPulse Pro band, ocean waves crashing in the background, turquoise and coral color palette, cinematic lighting',
    aspect_ratio: '16:9',
    style: 'photorealistic',
    include_text: true,
    text_content: 'Move the Ocean Forward',
    negative_prompt: 'blurry, low quality, text artifacts',
    variation_count: 4,
};

const product_photoshoot = {
    product_image_url: 'https://greenpulse.example.com/images/pro-band.png',
    product_name: 'GreenPulse Pro Smart Band',
    scene: 'lifestyle',
    custom_scene: 'On a surfer\'s wrist with ocean background at golden hour',
    lighting: 'natural',
    variation_count: 4,
};

const ad_creative = {
    platform: 'meta_feed',
    headline: 'The Ocean on Your Wrist',
    body_text: 'Track your fitness while cleaning the ocean. GreenPulse Pro — made from 100% recycled ocean plastics.',
    cta: 'Shop Now',
    product_image_url: 'https://greenpulse.example.com/images/pro-band.png',
    variation_count: 4,
};

const image_editor = {
    source_image_url: 'https://greenpulse.example.com/images/hero-beach.jpg',
    edit_instruction: 'Change the sky to a dramatic sunset with vibrant orange and purple tones. Add a subtle lens flare from the sun. Make the ocean water more turquoise.',
};

const mockup_generator = {
    mockup_types: ['T-shirt', 'Water Bottle', 'Billboard', 'Phone Case', 'Tote Bag'],
    variation_count: 2,
};

const infographic = {
    topic: 'GreenPulse Ocean Impact 2025 — 50 tons of ocean plastic recycled into fitness wearables',
    style: 'modern',
    orientation: 'portrait',
    tone_override: 'educational',
    include_link: true,
};

// ═══════════════════════════════════════════════════════════════
// SOCIAL MEDIA — Instagram (5 agents)
// ═══════════════════════════════════════════════════════════════

const instagram_post = {
    topic: 'GreenPulse Pro launch — the first fitness tracker made from 100% recycled ocean plastics. Features: heart rate, sleep tracking, 7-day battery, waterproof to 50m.',
    visual_theme: 'Ocean blues with vibrant coral accents, action shots of athletes at the beach',
    tone_override: 'casual',
    keywords: ['sustainable fitness', 'ocean plastic', 'smart wearable', 'eco athlete'],
    generate_image: true,
    image_count: 2,
    generate_video: false,
};

const instagram_story = {
    topic: 'Behind the scenes at GreenPulse — showing the recycling process from ocean plastic collection to the finished Pro band in our Bali facility.',
    visual_theme: 'Raw documentary-style with ocean blues and factory closeups',
    tone_override: 'casual',
    keywords: ['behindthescenes', 'sustainability', 'recycling', 'oceanlove'],
    generate_image: true,
    image_count: 2,
    generate_video: false,
};

const instagram_reel = {
    topic: '30-second transformation reel: ocean plastic debris → recycled pellets → molded GreenPulse Pro band. Set to trending upbeat audio.',
    visual_theme: 'Fast-paced, vibrant transitions, turquoise accents',
    tone_override: 'casual',
    keywords: ['transformation', 'reels', 'sustainable', 'satisfying'],
    generate_image: true,
    image_count: 1,
    generate_video: true,
};

const instagram_carousel = {
    topic: '5-slide carousel: "5 Reasons Your Fitness Tracker Should Be Made from Ocean Plastic" — mix of infographic data and lifestyle shots.',
    visual_theme: 'Clean editorial with data callouts and ocean imagery',
    tone_override: 'educational',
    keywords: ['fitness tips', 'sustainability', 'carousel', 'eco living'],
    generate_image: true,
    image_count: 3,
    generate_video: false,
};

const instagram_bio = {
    topic: 'GreenPulse Instagram bio — highlight the brand mission (ocean plastic → fitness gear), include CTA to shop, and mention the #MoveTheOceanForward campaign.',
    visual_theme: 'Clean, emoji-accented',
    tone_override: 'promotional',
    keywords: ['fitness', 'sustainability', 'ocean', 'wearable tech'],
    generate_image: false,
    image_count: 1,
    generate_video: false,
};

// ═══════════════════════════════════════════════════════════════
// SOCIAL MEDIA — Facebook (2 agents)
// ═══════════════════════════════════════════════════════════════

const facebook_post = {
    topic: 'Introducing GreenPulse Pro — a premium smart fitness band crafted from recycled ocean plastics. Join our pre-order waitlist for a 20% early-bird discount.',
    goal: 'awareness',
    tone_override: 'inspirational',
    include_link: true,
    generate_image: true,
    image_count: 2,
    generate_video: false,
};

const facebook_ad_copy = {
    topic: 'GreenPulse Pro retargeting ad for website visitors who viewed the product page but didn\'t pre-order. Emphasize limited early-bird pricing and sustainability mission.',
    goal: 'traffic',
    tone_override: 'professional',
    include_link: true,
    generate_image: true,
    image_count: 1,
    generate_video: false,
};

// ═══════════════════════════════════════════════════════════════
// SOCIAL MEDIA — LinkedIn (3 agents)
// ═══════════════════════════════════════════════════════════════

const linkedin_post = {
    topic: 'How GreenPulse is turning 50 tons of ocean plastic into premium fitness wearables — our supply chain innovation story and what it means for the future of sustainable consumer electronics.',
    professional_tone: 'thought_leader',
    tone_override: 'professional',
    include_link: true,
    generate_image: true,
    image_count: 2,
    generate_video: false,
};

const linkedin_article = {
    topic: 'The Circular Economy Playbook: How We Built a $10M Fitness Brand on Recycled Ocean Plastics — lessons for founders building sustainable consumer products.',
    professional_tone: 'expert',
    tone_override: 'professional',
    include_link: true,
    generate_image: true,
    image_count: 1,
    generate_video: false,
};

const linkedin_ad = {
    topic: 'GreenPulse B2B corporate wellness partnership — offer bulk pricing on Pro bands for employee wellness programs. Sustainability + fitness = employer branding win.',
    professional_tone: 'expert',
    tone_override: 'professional',
    include_link: true,
    generate_image: true,
    image_count: 1,
    generate_video: false,
};

// ═══════════════════════════════════════════════════════════════
// SOCIAL MEDIA — Twitter/X (3 agents)
// ═══════════════════════════════════════════════════════════════

const twitter_tweet = {
    topic: 'GreenPulse Pro launch day — single punchy tweet about the world\'s first ocean-plastic fitness tracker, link to pre-order.',
    thread_length: 1,
    tone_override: 'humorous',
    generate_image: true,
    image_count: 1,
    generate_video: false,
};

const twitter_thread = {
    topic: 'Why we built the world\'s first ocean-plastic fitness tracker — the founding story, R&D challenges, manufacturing breakthroughs, and what the data shows about sustainable hardware at scale.',
    thread_length: 7,
    tone_override: 'educational',
    generate_image: true,
    image_count: 2,
    generate_video: false,
};

const twitter_ad = {
    topic: 'GreenPulse Pro promoted tweet — drive pre-orders with a 20% early-bird discount. Highlight: ocean-plastic materials, 7-day battery, waterproof to 50m.',
    thread_length: 1,
    tone_override: 'professional',
    generate_image: true,
    image_count: 1,
    generate_video: false,
};

// ═══════════════════════════════════════════════════════════════
// SOCIAL MEDIA — Pinterest (2 agents)
// ═══════════════════════════════════════════════════════════════

const pinterest_pin = {
    topic: 'GreenPulse Pro styled with summer workout outfits — aesthetic flat lay with the band, yoga mat, water bottle, and ocean-themed accessories.',
    visual_theme: 'Clean ocean aesthetic, turquoise & coral, flat lay',
    tone_override: 'inspirational',
    keywords: ['fitness style', 'sustainable fashion', 'workout gear', 'ocean vibes'],
    generate_image: true,
    image_count: 2,
    generate_video: false,
};

const pinterest_ad = {
    topic: 'GreenPulse Pro promoted pin — "The fitness tracker that cleans the ocean." Drive traffic to product page, pre-order at $199.',
    visual_theme: 'Premium product photography, ocean backdrop',
    tone_override: 'promotional',
    keywords: ['fitness tracker', 'sustainable tech', 'gift idea', 'eco wearable'],
    generate_image: true,
    image_count: 1,
    generate_video: false,
};

// ═══════════════════════════════════════════════════════════════
// SOCIAL MEDIA — TikTok (3 agents)
// ═══════════════════════════════════════════════════════════════

const tiktok_script = {
    topic: 'Day-in-the-life wearing GreenPulse Pro — morning run on the beach, checking health stats on app, ocean cleanup volunteer session, evening yoga. 45-second script.',
    visual_theme: 'Trendy, fast-paced transitions, natural lighting',
    tone_override: 'fun',
    keywords: ['dayinmylife', 'fitness', 'sustainable', 'trending'],
    generate_image: true,
    image_count: 1,
    generate_video: true,
};

const tiktok_trend = {
    topic: 'Adapt the "Get Ready With Me" trend for GreenPulse Pro — putting on the band, checking stats, heading to a beach workout. Use trending audio.',
    visual_theme: 'Trending aesthetic, POV angles, upbeat energy',
    tone_override: 'fun',
    keywords: ['grwm', 'fitness', 'ocean', 'fyp'],
    generate_image: true,
    image_count: 1,
    generate_video: true,
};

const tiktok_ad = {
    topic: 'GreenPulse Pro spark ad — 15 seconds, hook in first 2 seconds ("This tracker is literally made from ocean garbage"), product demo closeups, CTA to pre-order.',
    visual_theme: 'Bold text overlays, product close-ups, ocean B-roll',
    tone_override: 'promotional',
    keywords: ['ad', 'fitness', 'sustainable', 'must have'],
    generate_image: true,
    image_count: 1,
    generate_video: true,
};

// ═══════════════════════════════════════════════════════════════
// VIDEO & MOTION (7 agents)
// ═══════════════════════════════════════════════════════════════

const video_ad_script = {
    topic: '30-second TV/digital ad for GreenPulse Pro — open on ocean plastic problem, transition to our manufacturing, end with athlete wearing the band at sunrise. Tagline: "Every rep cleans the ocean."',
    target_duration: 30,
    platform: 'tv',
    tone_override: 'inspirational',
    pacing: 'medium',
    include_link: false,
};

const youtube_script = {
    topic: '"I Wore a Fitness Tracker Made from Ocean Plastic for 30 Days — Here\'s What Happened." Cover unboxing, daily features, accuracy vs Fitbit/Whoop, sustainability deep dive, final verdict.',
    target_duration: 600,
    platform: 'youtube',
    tone_override: 'educational',
    pacing: 'medium',
    include_link: true,
};

const ai_video_gen = {
    topic: 'GreenPulse Pro product reveal — ocean waves morphing into the band shape, then transitioning to a runner at the beach wearing it. 15 seconds, cinematic slow motion.',
    target_duration: 15,
    platform: 'instagram',
    tone_override: 'inspirational',
    pacing: 'slow',
    include_link: false,
};

const video_summarizer = {
    topic: 'Summarize the GreenPulse keynote presentation (45 min) into a 60-second highlight reel with key announcements: Pro pricing, shipping date, sustainability metrics, athlete partnerships.',
    target_duration: 60,
    platform: 'youtube',
    tone_override: 'professional',
    pacing: 'fast',
    include_link: true,
};

const caption_generator = {
    topic: 'Generate captions/subtitles for GreenPulse Pro product demo video — includes voiceover explaining features, B-roll of ocean cleanup operations, and athlete testimonials.',
    target_duration: 120,
    platform: 'youtube',
    tone_override: 'professional',
    pacing: 'medium',
    include_link: false,
};

const thumbnail_idea = {
    topic: 'YouTube thumbnail for "Ocean Plastic → Fitness Tracker: The GreenPulse Story" — needs to be click-worthy, show the transformation from waste to product.',
    target_duration: 60,
    platform: 'youtube',
    tone_override: 'inspirational',
    pacing: 'medium',
    include_link: false,
};

const video_trend_analyzer = {
    topic: 'Analyze trending video formats in the sustainable tech / fitness wearable space — what content styles perform best on TikTok, YouTube Shorts, and Instagram Reels for eco-tech product launches.',
    target_duration: 60,
    platform: 'tiktok',
    tone_override: 'educational',
    pacing: 'fast',
    include_link: false,
};

// ═══════════════════════════════════════════════════════════════
// CONTENT & COPY (11 agents)
// ═══════════════════════════════════════════════════════════════

const blog_post = {
    topic: 'The science behind turning ocean plastic into durable fitness wearables — how GreenPulse\'s patented recycling process works and why it matters for the future of consumer electronics.',
    target_length_words: 1500,
    tone_override: 'educational',
    audience_selection: 'Eco-conscious consumers and tech enthusiasts',
};

const email_campaign = {
    topic: 'GreenPulse Pro pre-order email: announcement with hero image, feature highlights (HR, sleep, battery, waterproof), athlete endorsement, and 20% early-bird CTA button.',
    target_length_words: 600,
    tone_override: 'persuasive',
    audience_selection: 'Existing GreenPulse customers and newsletter subscribers',
};

const newsletter = {
    topic: 'GreenPulse monthly newsletter — Pro launch announcement, Q3 ocean cleanup impact stats (12 tons collected), community spotlight on athletes using GreenPulse gear, upcoming events.',
    target_length_words: 800,
    tone_override: 'friendly',
    audience_selection: 'Newsletter subscribers and community members',
};

const landing_page = {
    topic: 'GreenPulse Pro product landing page — hero section with video, 4 key features (HR, sleep, battery, waterproof), sustainability story section, comparison chart vs competitors, 3 testimonials, pre-order CTA.',
    target_length_words: 1200,
    tone_override: 'persuasive',
    audience_selection: 'Cold traffic from ads and organic search',
};

const case_study = {
    topic: 'How professional triathlete Maria Santos trained for Ironman using GreenPulse gear — performance data improvements, training insights, and how the sustainability mission motivated her season.',
    target_length_words: 1000,
    tone_override: 'authoritative',
    audience_selection: 'Competitive athletes and fitness coaches',
};

const press_release = {
    topic: 'GreenPulse announces the Pro smart band — the world\'s first premium fitness tracker made from 100% recycled ocean plastics. Available for pre-order at $199, shipping Q2 2026.',
    target_length_words: 500,
    tone_override: 'professional',
    audience_selection: 'Tech journalists and media outlets',
};

const whitepaper = {
    topic: 'The circular economy opportunity in consumer electronics: How GreenPulse\'s ocean-to-wrist supply chain model reduces costs by 15% while eliminating 50 tons of ocean waste annually.',
    target_length_words: 2500,
    tone_override: 'authoritative',
    audience_selection: 'Investors, sustainability officers, and industry analysts',
};

const product_description = {
    topic: 'GreenPulse Pro Smart Band — 24/7 heart rate & SpO2, advanced sleep stages, 7-day battery, 50m waterproof, recycled ocean plastic case & band, solar-assist charging, Bluetooth 5.3, iOS & Android.',
    target_length_words: 300,
    tone_override: 'persuasive',
    audience_selection: 'Online shoppers comparing fitness trackers',
};

const faq_generator = {
    topic: 'GreenPulse Pro FAQ — covering: materials & sustainability, health tracking accuracy, battery life, water resistance, compatibility (iOS/Android), warranty, sizing, and pre-order process.',
    target_length_words: 1000,
    tone_override: 'friendly',
    audience_selection: 'Pre-order customers and product page visitors',
};

const sms_marketing = {
    topic: 'GreenPulse Pro pre-order reminder — 20% early-bird discount ending in 48 hours. Direct link to purchase. Keep it punchy and urgent.',
    target_length_words: 160,
    tone_override: 'persuasive',
    audience_selection: 'Waitlist subscribers who have not yet pre-ordered',
};

const content_audit = {
    topic: 'Audit GreenPulse\'s existing blog (15 posts on sustainability, fitness, and product updates) — identify content gaps, underperforming posts, SEO opportunities, and recommended content pillars for the Pro launch.',
    target_length_words: 1500,
    tone_override: 'professional',
    audience_selection: 'GreenPulse marketing team',
};

// ═══════════════════════════════════════════════════════════════
// ADVERTISING COPY (8 agents — each platform-specific)
// ═══════════════════════════════════════════════════════════════

const meta_ads = {
    product_name: 'GreenPulse Pro Smart Band',
    offer: '20% early-bird discount — pre-order at $199 (regular $249). Free shipping.',
    benefit_focus: 'emotional',
    tone_override: 'conversational',
    target_audience: 'Eco-conscious fitness enthusiasts aged 25-40 on Instagram and Facebook',
};

const google_search_ads = {
    product_name: 'GreenPulse Pro Smart Band',
    offer: 'World\'s first ocean-plastic fitness tracker. Pre-order $199 — free shipping + 20% off.',
    benefit_focus: 'rational',
    tone_override: 'direct_response',
    target_audience: 'People searching for "sustainable fitness tracker" and "eco-friendly wearable"',
};

const google_display_ads = {
    product_name: 'GreenPulse Pro Smart Band',
    offer: 'Track your fitness. Clean the ocean. Pre-order now at $199.',
    benefit_focus: 'emotional',
    tone_override: 'conversational',
    target_audience: 'Fitness and sustainability interest audiences on Google Display Network',
};

const linkedin_lead_gen = {
    product_name: 'GreenPulse Corporate Wellness Program',
    offer: 'Bulk GreenPulse Pro bands for employee wellness — sustainable branding + fitness tracking. Volume discounts starting at 50 units.',
    benefit_focus: 'social_proof',
    tone_override: 'professional',
    target_audience: 'HR directors and corporate wellness managers at companies with 200+ employees',
};

const pinterest_ads = {
    product_name: 'GreenPulse Pro Smart Band',
    offer: 'The most aesthetic fitness tracker — and it\'s made from recycled ocean plastics. Pre-order $199.',
    benefit_focus: 'emotional',
    tone_override: 'conversational',
    target_audience: 'Women 25-45 interested in fitness, sustainable living, and wellness aesthetics',
};

const tiktok_ads = {
    product_name: 'GreenPulse Pro Smart Band',
    offer: 'This fitness tracker is literally made from ocean trash. And it slaps. Pre-order $199.',
    benefit_focus: 'emotional',
    tone_override: 'humorous',
    target_audience: 'Gen Z and millennial fitness enthusiasts on TikTok',
};

const youtube_ads = {
    product_name: 'GreenPulse Pro Smart Band',
    offer: '7-day battery, 50m waterproof, made from ocean plastic. Pre-order at $199 with 20% early-bird discount.',
    benefit_focus: 'rational',
    tone_override: 'conversational',
    target_audience: 'Fitness and tech YouTube viewers interested in wearable reviews',
};

const amazon_ppc = {
    product_name: 'GreenPulse Pro Smart Band',
    offer: 'GreenPulse Pro — Premium Fitness Tracker | Recycled Ocean Plastic | HR, Sleep, 7-Day Battery | $199',
    benefit_focus: 'rational',
    tone_override: 'direct_response',
    target_audience: 'Amazon shoppers searching for fitness trackers and sustainable products',
};

// ═══════════════════════════════════════════════════════════════
// SEO & AEO (4 agents — each with different focus)
// ═══════════════════════════════════════════════════════════════

const keyword_researcher = {
    url_to_analyze: 'https://greenpulse.example.com',
    target_keywords: ['sustainable fitness tracker', 'eco-friendly wearable', 'recycled ocean plastic watch', 'green fitness band'],
    competitor_urls: ['https://fitbit.com', 'https://whoop.com'],
    search_intent: 'commercial',
    target_audience: 'Eco-conscious consumers searching for sustainable fitness wearables',
};

const on_page_seo = {
    url_to_analyze: 'https://greenpulse.example.com/pro',
    target_keywords: ['GreenPulse Pro review', 'ocean plastic fitness tracker', 'sustainable smartwatch 2026'],
    competitor_urls: ['https://fitbit.com/charge6', 'https://ouraring.com'],
    search_intent: 'commercial',
    target_audience: 'Fitness tracker comparison shoppers',
};

const technical_seo = {
    url_to_analyze: 'https://greenpulse.example.com',
    target_keywords: ['sustainable fitness tracker', 'eco wearable', 'GreenPulse'],
    competitor_urls: ['https://fitbit.com', 'https://garmin.com'],
    search_intent: 'navigational',
    target_audience: 'All website visitors and search engine crawlers',
};

const aeo_optimizer = {
    url_to_analyze: 'https://greenpulse.example.com/faq',
    target_keywords: ['what is GreenPulse Pro', 'is GreenPulse Pro worth it', 'ocean plastic fitness tracker reviews'],
    competitor_urls: ['https://whoop.com/faq', 'https://ouraring.com/faq'],
    search_intent: 'informational',
    target_audience: 'Users asking questions via AI search engines and voice assistants',
};

// ═══════════════════════════════════════════════════════════════
// AUDIO & PODCAST (2 agents)
// ═══════════════════════════════════════════════════════════════

const podcast_script = {
    topic: 'Interview with GreenPulse CEO about building a sustainable fitness brand — covering: the ocean plastic problem, recycling innovation, athlete partnerships, and product roadmap for 2026.',
    target_duration_mins: 30,
    guest_names: ['Sarah Chen (CEO)', 'Alex Rivera (Head of Sustainability)'],
    tone_override: 'storytelling',
    audience_selection: 'Entrepreneurship and sustainability podcast listeners',
};

const podcast_description = {
    topic: 'Episode description for "From Ocean Trash to Wrist Tech" — GreenPulse CEO Sarah Chen reveals how they turned 50 tons of ocean plastic into premium fitness wearables, the R&D challenges, and what\'s next.',
    target_duration_mins: 30,
    guest_names: ['Sarah Chen (CEO)'],
    tone_override: 'educational',
    audience_selection: 'Podcast listeners browsing episode lists on Spotify and Apple Podcasts',
};

// ═══════════════════════════════════════════════════════════════
// GROWTH & STRATEGY (12 agents)
// ═══════════════════════════════════════════════════════════════

const pricing_strategy = {
    topic: 'Pricing the GreenPulse Pro — currently planned at $249 retail. Competitors: Fitbit Charge 6 ($159), Whoop 4.0 ($239/yr subscription), Oura Ring ($299). Our COGS is $78.',
    target_audience: 'Consumer',
    pricing_model: 'one_time',
    current_metrics: 'Pre-launch phase. Email waitlist: 12,000. Social followers: 85K. Previous product (GreenPulse Lite) sold 8,000 units at $149.',
    competitor_pricing: 'Fitbit: $99-$299 one-time. Whoop: $239/yr subscription. Oura: $299 + $5.99/mo. Garmin: $149-$499.',
    additional_context: 'We want to position as premium but accessible. Sustainability story is a key differentiator. Considering early-bird at $199.',
};

const launch_strategy = {
    topic: 'GreenPulse Pro smart band launch — targeting Q2 2026. DTC website + select retail partnerships (REI, Nordstrom). Goal: 10,000 units in first 90 days.',
    launch_date: '2026-06-01',
    target_audience: BRAND.audience,
    current_metrics: '12,000 email waitlist, 85K social followers, 8K existing customers from Lite product',
    channels: ['DTC website', 'Instagram', 'TikTok', 'YouTube', 'Email'],
    additional_context: 'Budget: $75K for launch campaign. We have partnerships with 15 fitness influencers (combined 2M followers).',
    url_to_analyze: '',
};

const cold_email = {
    topic: 'Outreach to fitness influencers and sustainability bloggers for GreenPulse Pro partnership — offer free product + affiliate commission (15%) + exclusive behind-the-scenes content.',
    target_audience: 'Fitness influencers with 50K-500K followers who promote sustainable living',
    email_count: 3,
    current_metrics: 'Previous influencer campaigns: 3.2% conversion rate, $24 avg CAC via influencer channel',
    additional_context: 'We want authentic partnerships, not just sponsored posts. Offer includes a trip to our ocean cleanup facility in Bali.',
};

const email_sequence = {
    topic: 'GreenPulse Pro pre-order nurture sequence — from waitlist signup to purchase. Educate on sustainability story, build excitement with feature reveals, convert with early-bird offer.',
    target_audience: 'Email waitlist subscribers who signed up for GreenPulse Pro updates',
    sequence_length: 5,
    trigger_event: 'signup',
    current_metrics: 'Current email list: 12,000 subscribers. Open rate: 42%. Click rate: 8.5%. Previous launch conversion: 12%.',
    additional_context: 'Sequence should run over 14 days leading up to pre-order opening. Using Mailchimp.',
};

const page_cro = {
    topic: 'Optimize GreenPulse Pro landing page for pre-order conversions. Current conversion rate is 3.2% (visitor to pre-order). Target: 6%.',
    target_audience: BRAND.audience,
    current_metrics: 'Monthly visitors: 45K. Bounce rate: 52%. Avg time on page: 2m 10s. Current CVR: 3.2%. Mobile traffic: 68%.',
    additional_context: 'Landing page has: hero video, feature grid, sustainability section, testimonials, comparison chart, pre-order CTA. Suspecting the CTA placement and pricing visibility might be issues.',
    url_to_analyze: 'https://greenpulse.example.com/pro',
};

const ab_test_setup = {
    topic: 'Test pricing display on GreenPulse Pro landing page: showing "$199 early-bird" vs "$249 $199 (save $50)" vs "$199/mo × 4 payments".',
    test_type: 'pricing',
    target_audience: BRAND.audience,
    current_metrics: 'Current CVR: 3.2%. Monthly traffic: 45K visitors. AOV: $199. 68% mobile.',
    additional_context: 'We want to find the optimal price framing. Test should run 2-3 weeks for statistical significance. Using Google Optimize.',
    url_to_analyze: 'https://greenpulse.example.com/pro',
};

const marketing_psychology = {
    topic: 'Apply behavioral psychology principles to GreenPulse Pro marketing — how to leverage sustainability guilt, social proof from athletes, and scarcity of ocean-sourced materials.',
    launch_date: '2026-06-01',
    target_audience: BRAND.audience,
    psychology_focus: 'social_proof',
    current_metrics: '12K waitlist, 85K social followers, 15 influencer partners',
    additional_context: 'We want to avoid greenwashing accusations while still leveraging the sustainability angle authentically.',
    url_to_analyze: '',
};

const content_strategy = {
    topic: 'Build a 6-month content strategy for GreenPulse around the Pro launch — covering pre-launch hype, launch week, post-launch community building, and always-on sustainability content.',
    launch_date: '2026-06-01',
    target_audience: BRAND.audience,
    content_goals: ['brand_awareness', 'seo', 'leads'],
    current_metrics: 'Blog: 15 posts, 5K monthly visitors. Social: 85K followers. Email: 12K subscribers. YouTube: 2.3K subscribers.',
    additional_context: 'We have one content writer, one social media manager, and budget for 2 freelance writers. Focus on scalable, repurposable content.',
    url_to_analyze: '',
};

const competitor_alternatives = {
    topic: 'Competitive analysis: How GreenPulse Pro compares to Fitbit Charge 6, Whoop 4.0, Oura Ring Gen 3, and Apple Watch SE on features, pricing, sustainability, and target market.',
    competitor_names: ['Fitbit', 'Whoop', 'Oura', 'Apple Watch'],
    target_audience: BRAND.audience,
    current_metrics: 'GreenPulse Lite sold 8K units. Market share in sustainable wearables: ~2%. Growing 40% QoQ.',
    additional_context: 'Our key differentiator is sustainability + premium performance. We need positioning that avoids direct Apple/Samsung comparison.',
    url_to_analyze: '',
};

const seo_audit = {
    topic: 'Full SEO audit for GreenPulse website — assess technical health, content gaps, keyword opportunities in "sustainable fitness" and "eco wearable" categories.',
    target_audience: 'Sustainable fitness tracker, eco-friendly wearable, green smartwatch',
    current_metrics: 'Domain authority: 28. Organic traffic: 5K/mo. Top keywords: "recycled fitness tracker" (#12), "sustainable wearable" (#18). 15 blog posts, 8 product pages.',
    additional_context: 'We want to rank for "best fitness tracker 2026" and "sustainable smartwatch". Content is thin — most posts under 800 words.',
    url_to_analyze: 'https://greenpulse.example.com',
};

const schema_markup = {
    topic: 'Implement schema markup for GreenPulse Pro product page, FAQ page, and blog articles to improve rich snippets and AI answer engine visibility.',
    schema_types: ['Product', 'FAQPage', 'Article', 'Review'],
    target_audience: 'Product searches, fitness tracker comparisons, how-to queries',
    current_metrics: 'Currently no structured data on any page. Google Search Console shows 0 rich results.',
    additional_context: 'Product page needs: price ($199), availability (pre-order), rating (4.8/5 from beta testers), review count (127). Using Next.js.',
    url_to_analyze: 'https://greenpulse.example.com/pro',
};

const referral_program = {
    topic: 'Design a referral program for GreenPulse Pro — incentivize existing customers and waitlist subscribers to share with friends. Each referral should feel tied to the ocean cleanup mission.',
    incentive_type: 'discount',
    target_audience: 'Existing GreenPulse customers and waitlist subscribers',
    current_metrics: '8K existing customers, 12K waitlist. Current NPS: 72. Organic word-of-mouth accounts for 18% of traffic.',
    additional_context: 'For every referral that converts, we donate 1lb of ocean plastic cleanup. Referrer gets $25 credit, referee gets $25 off.',
    url_to_analyze: '',
};

// ═══════════════════════════════════════════════════════════════
// EXPORT MAP — all 78 agent IDs
// ═══════════════════════════════════════════════════════════════

export const TEST_DATA: Record<string, Record<string, any>> = {
    // Brand (6)
    brand_identity,
    brand_naming,
    tagline_slogan,
    target_audience,
    brand_voice,
    brand_guardian,

    // Creative Strategy (3)
    creative_direction,
    campaign_concept,
    content_calendar,

    // Visual Design (7)
    logo_designer,
    hero_image,
    product_photoshoot,
    ad_creative,
    image_editor,
    mockup_generator,
    infographic,

    // Social — Instagram (5)
    instagram_post,
    instagram_story,
    instagram_reel,
    instagram_carousel,
    instagram_bio,

    // Social — Facebook (2)
    facebook_post,
    facebook_ad_copy,

    // Social — LinkedIn (3)
    linkedin_post,
    linkedin_article,
    linkedin_ad,

    // Social — Twitter/X (3)
    twitter_tweet,
    twitter_thread,
    twitter_ad,

    // Social — Pinterest (2)
    pinterest_pin,
    pinterest_ad,

    // Social — TikTok (3)
    tiktok_script,
    tiktok_trend,
    tiktok_ad,

    // Video & Motion (7)
    video_ad_script,
    youtube_script,
    ai_video_gen,
    video_summarizer,
    caption_generator,
    thumbnail_idea,
    video_trend_analyzer,

    // Content & Copy (11)
    blog_post,
    email_campaign,
    newsletter,
    landing_page,
    case_study,
    press_release,
    whitepaper,
    product_description,
    faq_generator,
    sms_marketing,
    content_audit,

    // Advertising Copy (8)
    meta_ads,
    google_search_ads,
    google_display_ads,
    linkedin_lead_gen,
    pinterest_ads,
    tiktok_ads,
    youtube_ads,
    amazon_ppc,

    // SEO & AEO (4)
    keyword_researcher,
    on_page_seo,
    technical_seo,
    aeo_optimizer,

    // Audio & Podcast (2)
    podcast_script,
    podcast_description,

    // Growth & Strategy (12)
    pricing_strategy,
    launch_strategy,
    cold_email,
    email_sequence,
    page_cro,
    ab_test_setup,
    marketing_psychology,
    content_strategy,
    competitor_alternatives,
    seo_audit,
    schema_markup,
    referral_program,
};

export default TEST_DATA;
