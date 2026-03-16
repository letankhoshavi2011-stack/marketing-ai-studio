from app.models.a2ui import A2UIFormSpec, A2UIField, A2UIFieldType
from app.agents.capabilities import AGENT_REGISTRY

def get_fallback_form_spec(agent_id: str) -> A2UIFormSpec:
    capability = AGENT_REGISTRY.get(agent_id)
    
    title = capability.agent_name if capability else agent_id.replace('_', ' ').title()
    desc = capability.description if capability else f"Configure parameters for the {title} AI agent."
    
    # Custom form specs based on agent_id
    if agent_id == "brand_naming":
        fields = [
            A2UIField(name="industry", type=A2UIFieldType.TEXT_INPUT, label="Industry", auto_filled=True),
            A2UIField(name="business_description", type=A2UIFieldType.TEXT_AREA, label="Business Description", required=True),
            A2UIField(name="values", type=A2UIFieldType.MULTI_SELECT, label="Core Values", options=["sustainability", "quality", "community", "innovation", "trust", "speed"]),
            A2UIField(name="tone", type=A2UIFieldType.MULTI_SELECT, label="Tone", options=["warm", "natural", "premium", "playful", "authoritative"]),
            A2UIField(name="keywords_to_include", type=A2UIFieldType.TEXT_INPUT, label="Keywords to Include"),
            A2UIField(name="keywords_to_avoid", type=A2UIFieldType.TEXT_INPUT, label="Keywords to Avoid"),
            A2UIField(name="name_style_preference", type=A2UIFieldType.RADIO_GROUP, label="Name Style", options=["evocative", "descriptive", "abstract", "compound", "no_preference"], default_value="no_preference"),
            A2UIField(name="competitor_names", type=A2UIFieldType.TEXT_INPUT, label="Competitor Names (comma separated)")
        ]
    elif agent_id == "tagline_slogan":
        fields = [
            A2UIField(name="brand_name", type=A2UIFieldType.TEXT_INPUT, label="Brand Name", auto_filled=True),
            A2UIField(name="industry", type=A2UIFieldType.TEXT_INPUT, label="Industry", auto_filled=True),
            A2UIField(name="business_description", type=A2UIFieldType.TEXT_AREA, label="Business Description", required=True),
            A2UIField(name="target_emotion", type=A2UIFieldType.SELECT, label="Target Emotion", options=["inspired", "comforted", "excited", "trusted"]),
            A2UIField(name="max_word_count", type=A2UIFieldType.SLIDER, label="Max Word Count", min_value=3, max_value=12, default_value=8),
            A2UIField(name="tone_preference", type=A2UIFieldType.RADIO_GROUP, label="Tone", options=["aspirational", "playful", "authoritative", "emotional", "witty", "no_preference"], default_value="no_preference"),
            A2UIField(name="campaign_specific", type=A2UIFieldType.TOGGLE, label="Campaign Specific?", default_value=False),
        ]
    elif agent_id == "brand_identity":
        fields = [
            A2UIField(name="source_url", type=A2UIFieldType.URL_INPUT, label="Extract from URL (Optional)", help_text="Provide a website URL to extract brand colors and fonts automatically."),
            A2UIField(name="style_preferences", type=A2UIFieldType.MULTI_SELECT, label="Style Preferences", options=["modern", "minimal", "bold", "playful", "luxury", "vintage", "corporate", "organic", "tech", "handcrafted"]),
            A2UIField(name="color_preferences", type=A2UIFieldType.COLOR_PICKER, label="Primary Color Preference", default_value="#000000"),
            A2UIField(name="mood", type=A2UIFieldType.TEXT_INPUT, label="Mood Preference", placeholder="e.g. Warm, inviting, grounded")
        ]
    elif agent_id == "brand_voice_analyzer":
        fields = [
            A2UIField(name="samples", type=A2UIFieldType.FILE_UPLOAD, label="Upload Voice Samples", accept=".txt,.md,.pdf,.docx"),
            A2UIField(name="manual_tone", type=A2UIFieldType.MULTI_SELECT, label="Define Tone Manually", options=["friendly", "authoritative", "witty", "professional", "casual"]),
            A2UIField(name="manual_formality", type=A2UIFieldType.SLIDER, label="Formality Level (0=Casual, 100=Formal)", min_value=0, max_value=100, default_value=50),
            A2UIField(name="manual_rules", type=A2UIFieldType.TEXT_AREA, label="Custom Rules & Vocabulary")
        ]
    elif agent_id == "target_audience":
        fields = [
            A2UIField(name="brand_name", type=A2UIFieldType.TEXT_INPUT, label="Brand Name", auto_filled=True),
            A2UIField(name="product_service_description", type=A2UIFieldType.TEXT_AREA, label="Product/Service Description", required=True),
            A2UIField(name="geographic_focus", type=A2UIFieldType.SELECT, label="Geographic Focus", options=["Global", "US", "Europe", "Asia", "Local"]),
            A2UIField(name="price_point", type=A2UIFieldType.RADIO_GROUP, label="Price Point", options=["budget", "mid_range", "premium", "luxury"]),
            A2UIField(name="persona_count", type=A2UIFieldType.SLIDER, label="Number of Personas", min_value=1, max_value=5, default_value=3)
        ]
    elif agent_id == "logo_designer":
        fields = [
            A2UIField(name="brand_name", type=A2UIFieldType.TEXT_INPUT, label="Brand Name", auto_filled=True),
            A2UIField(name="preferred_styles", type=A2UIFieldType.MULTI_SELECT, label="Logo Styles", options=["wordmark", "lettermark", "icon", "combination", "abstract", "mascot", "emblem"]),
            A2UIField(name="icon_concept", type=A2UIFieldType.TEXT_INPUT, label="Icon Concept", placeholder="e.g. coffee bean, leaf, sunrise"),
            A2UIField(name="reference_image", type=A2UIFieldType.FILE_UPLOAD, label="Reference Image (Optional)", accept="image/*"),
            A2UIField(name="variation_count", type=A2UIFieldType.SLIDER, label="Variations to Generate", min_value=2, max_value=8, default_value=4)
        ]
    elif agent_id == "hero_image":
        fields = [
            A2UIField(name="description", type=A2UIFieldType.TEXT_AREA, label="Scene Description", placeholder="e.g. A sunrise over coffee plantations", required=True),
            A2UIField(name="aspect_ratio", type=A2UIFieldType.SELECT, label="Aspect Ratio", options=["1:1 (Square)", "16:9 (Landscape)", "9:16 (Portrait)", "21:9 (Ultrawide)", "4:3 (Standard)"], default_value="16:9 (Landscape)"),
            A2UIField(name="image_style", type=A2UIFieldType.SELECT, label="Image Style", options=["photorealistic", "illustrated", "abstract", "flat_design", "3d_render", "watercolor", "minimalist"], default_value="photorealistic"),
            A2UIField(name="include_text", type=A2UIFieldType.TOGGLE, label="Render Text in Image?", default_value=False),
            A2UIField(name="negative_prompt", type=A2UIFieldType.TEXT_INPUT, label="Negative Prompt (What to Avoid)")
        ]
    elif agent_id == "product_photoshoot":
        fields = [
            A2UIField(name="product_image", type=A2UIFieldType.FILE_UPLOAD, label="Upload Product Image", accept="image/*", required=True),
            A2UIField(name="product_name", type=A2UIFieldType.TEXT_INPUT, label="Product Name"),
            A2UIField(name="scene_type", type=A2UIFieldType.SELECT, label="Scene Type", options=["studio_white", "studio_gradient", "lifestyle", "flat_lay", "hero_shot", "contextual", "seasonal"], default_value="studio_white"),
            A2UIField(name="lighting", type=A2UIFieldType.SELECT, label="Lighting", options=["studio", "natural", "dramatic", "soft", "golden_hour"], default_value="studio"),
            A2UIField(name="angle", type=A2UIFieldType.SELECT, label="Camera Angle", options=["front", "45_degree", "top_down", "eye_level", "low_angle"], default_value="front")
        ]
    elif agent_id == "social_visuals":
        fields = [
            A2UIField(name="platforms", type=A2UIFieldType.MULTI_SELECT, label="Target Platforms", options=["instagram_post", "instagram_story", "facebook_post", "linkedin_post", "twitter_post", "youtube_thumbnail", "pinterest_pin"], required=True),
            A2UIField(name="topic", type=A2UIFieldType.TEXT_INPUT, label="Topic / Announcement", required=True),
            A2UIField(name="include_logo", type=A2UIFieldType.TOGGLE, label="Include Logo?", default_value=True),
            A2UIField(name="cta_text", type=A2UIFieldType.TEXT_INPUT, label="Call to Action Text")
        ]
    elif agent_id == "ad_copywriter":
        fields = [
            A2UIField(name="platform", type=A2UIFieldType.SELECT, label="Ad Platform", options=["google_search", "google_display", "meta_ads", "linkedin_ads"], required=True),
            A2UIField(name="product_service", type=A2UIFieldType.TEXT_AREA, label="Product/Service Description", required=True),
            A2UIField(name="key_benefits", type=A2UIFieldType.TEXT_AREA, label="Key Benefits (One per line)"),
            A2UIField(name="offer", type=A2UIFieldType.TEXT_INPUT, label="Special Offer", placeholder="e.g. 20% off, Free shipping"),
            A2UIField(name="framework", type=A2UIFieldType.RADIO_GROUP, label="Copywriting Framework", options=["aida", "pas", "bab", "fab"], default_value="aida"),
            A2UIField(name="variation_count", type=A2UIFieldType.SLIDER, label="Number of Variations", min_value=3, max_value=10, default_value=5)
        ]
    elif agent_id == "blog_writer":
        fields = [
            A2UIField(name="topic", type=A2UIFieldType.TEXT_AREA, label="Blog Topic", required=True),
            A2UIField(name="target_keywords", type=A2UIFieldType.TEXT_INPUT, label="Target Keywords (comma separated)"),
            A2UIField(name="blog_length", type=A2UIFieldType.RADIO_GROUP, label="Blog Length", options=["short", "medium", "long", "comprehensive"], default_value="medium"),
            A2UIField(name="include_faq", type=A2UIFieldType.TOGGLE, label="Include FAQ Section?", default_value=False),
            A2UIField(name="outline_only", type=A2UIFieldType.TOGGLE, label="Generate Outline Only?", default_value=False)
        ]
    elif agent_id == "video_generation":
        fields = [
            A2UIField(name="prompt", type=A2UIFieldType.TEXT_AREA, label="Video Description", placeholder="e.g. Cinematic shot of coffee beans being roasted", required=True),
            A2UIField(name="duration_seconds", type=A2UIFieldType.SLIDER, label="Duration (Seconds)", min_value=5, max_value=15, default_value=8),
            A2UIField(name="aspect_ratio", type=A2UIFieldType.SELECT, label="Aspect Ratio", options=["16:9", "9:16", "1:1"], default_value="16:9"),
            A2UIField(name="include_audio", type=A2UIFieldType.TOGGLE, label="Include Background Audio?", default_value=True),
            A2UIField(name="style_reference", type=A2UIFieldType.TEXT_INPUT, label="Style Reference", placeholder="e.g. Cinematic, slow motion")
        ]
    elif agent_id == "seo_aeo_optimizer":
        fields = [
            A2UIField(name="content", type=A2UIFieldType.TEXT_AREA, label="Content to Analyze", required=True),
            A2UIField(name="content_type", type=A2UIFieldType.SELECT, label="Content Type", options=["blog", "landing_page", "product_description", "email", "ad_copy"], required=True),
            A2UIField(name="target_keywords", type=A2UIFieldType.TEXT_INPUT, label="Target Keywords (comma separated)"),
            A2UIField(name="check_serp", type=A2UIFieldType.TOGGLE, label="Check live search results?", default_value=True)
        ]
    elif agent_id == "video_ad":
        fields = [
            A2UIField(name="product_service", type=A2UIFieldType.TEXT_AREA, label="Product/Service Being Promoted", required=True),
            A2UIField(name="target_audience", type=A2UIFieldType.TEXT_INPUT, label="Target Audience", auto_filled=True),
            A2UIField(name="key_benefits", type=A2UIFieldType.TEXT_AREA, label="Key Benefits to Highlight"),
            A2UIField(name="tone", type=A2UIFieldType.SELECT, label="Tone of Video", options=["Energetic", "Professional", "Emotional", "Humorous", "Urgent"], default_value="Energetic"),
            A2UIField(name="video_length", type=A2UIFieldType.SELECT, label="Video Length", options=["15 seconds", "30 seconds", "60 seconds", "2+ minutes"], default_value="30 seconds")
        ]
    elif agent_id == "video_script":
        fields = [
            A2UIField(name="topic", type=A2UIFieldType.TEXT_AREA, label="Video Topic / Concept", required=True),
            A2UIField(name="primary_goal", type=A2UIFieldType.SELECT, label="Primary Goal", options=["Educational", "Entertainment", "Sales/Lead Gen", "Brand Awareness"]),
            A2UIField(name="host_style", type=A2UIFieldType.RADIO_GROUP, label="Presenter Style", options=["Talking Head (Direct to Camera)", "Voiceover only", "Interview", "Documentary style"], default_value="Talking Head (Direct to Camera)"),
            A2UIField(name="call_to_action", type=A2UIFieldType.TEXT_INPUT, label="Call to Action (CTA)")
        ]
    elif agent_id == "video_description":
        fields = [
            A2UIField(name="video_title", type=A2UIFieldType.TEXT_INPUT, label="Video Title", required=True),
            A2UIField(name="video_summary", type=A2UIFieldType.TEXT_AREA, label="Brief Summary of Video Content", required=True),
            A2UIField(name="target_keywords", type=A2UIFieldType.TEXT_INPUT, label="SEO Keywords (comma separated)"),
            A2UIField(name="links_to_include", type=A2UIFieldType.TEXT_AREA, label="Links to Include (e.g. website, socials)")
        ]
    elif agent_id == "audio_summarizer":
        fields = [
            A2UIField(name="transcript", type=A2UIFieldType.FILE_UPLOAD, label="Upload Transcript/Notes", accept=".txt,.pdf,.docx,.srt", required=True),
            A2UIField(name="summary_type", type=A2UIFieldType.RADIO_GROUP, label="Output Format", options=["Executive Summary", "Detailed Chapter Breakdown", "Action Items & Next Steps", "Key Takeaways (Bulleted)"], default_value="Detailed Chapter Breakdown"),
            A2UIField(name="focus_areas", type=A2UIFieldType.TEXT_INPUT, label="Specific Themes to Focus On (Optional)")
        ]
    elif agent_id == "social_media_snippets":
        fields = [
            A2UIField(name="source_content", type=A2UIFieldType.TEXT_AREA, label="Paste Long-Form Transcript or Outline", required=True),
            A2UIField(name="platforms", type=A2UIFieldType.MULTI_SELECT, label="Target Platforms", options=["TikTok", "Instagram Reels", "YouTube Shorts", "LinkedIn Video"], required=True),
            A2UIField(name="snippet_count", type=A2UIFieldType.SLIDER, label="Number of Snippets to Extract", min_value=1, max_value=10, default_value=5),
            A2UIField(name="hook_style", type=A2UIFieldType.SELECT, label="Hook Style", options=["Controversial/Bold", "Question-Based", "Storytelling", "Value/Educational"], default_value="Value/Educational")
        ]
    elif agent_id == "podcast_description":
        fields = [
            A2UIField(name="episode_title", type=A2UIFieldType.TEXT_INPUT, label="Episode Title"),
            A2UIField(name="guest_name", type=A2UIFieldType.TEXT_INPUT, label="Guest Name (if any)"),
            A2UIField(name="key_topics", type=A2UIFieldType.TEXT_AREA, label="Key Topics Discussed", required=True),
            A2UIField(name="include_timestamps", type=A2UIFieldType.TOGGLE, label="Generate Timestamp Placeholders?", default_value=True),
            A2UIField(name="sponsor_reads", type=A2UIFieldType.TEXT_AREA, label="Sponsor Reads/Links to Include")
        ]
    else:
        # Generic fallback
        fields = [
            A2UIField(
                name="prompt",
                type=A2UIFieldType.TEXT_AREA,
                label="Instructions / Context",
                placeholder="Enter what you want this agent to generate...",
                required=True,
                help_text=f"Provide context and instructions for the {title} agent."
            )
        ]

    return A2UIFormSpec(
        title=f"{title} Studio",
        description=desc,
        submit_label="Generate Draft",
        fields=fields
    )
