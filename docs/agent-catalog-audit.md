# Agent Catalog Audit

Date: 2026-03-14

Scope reviewed:
- `frontend/src/data/agents.ts`
- `frontend/src/data/agentFormFields.ts`
- `docs/all-agents-test-inputs.md`
- `backend/app/agents/registry.py`
- `backend/app/agents/executor.py`
- `backend/app/agents/base.py`
- `backend/app/prompts/__init__.py`
- Core input/output model files under `backend/app/agents/`

## Legend

- Value:
  - `Good` = strong standalone product value today
  - `Fair` = useful, but too generic / incomplete / wrongly surfaced
  - `Weak` = misleading, redundant, missing prompt coverage, or broken
- Action:
  - `Keep` = keep as a first-class agent
  - `Fix` = keep, but repair prompt/schema/code first
  - `Merge` = do not keep as a separate top-level agent; fold into a family agent
  - `Hide` = remove from UI until rebuilt
  - `Remove` = retire from surface and replace with another existing agent
- Prompt:
  - `Present` = exact `agent_id.yaml` exists
  - `Missing` = exact prompt file does not exist
  - `N/A` = agent does not rely on YAML prompt specialization
- Output Mode:
  - `text` = primary UI should be text / markdown / structured text
  - `image` = primary UI should focus on generated images
  - `video` = primary UI should focus on generated video
  - `audio` = primary UI should focus on audio / podcast script blocks
  - `text+image` = text is primary, image support is first-class
  - `text+video` = text is primary, video support is first-class
  - `text+image+video` = mixed-media output, all tabs matter
  - `structured-text` = structured cards / tables / persona blocks should be primary over plain rich text

## Recommended UI Attribute

Add this attribute to the agent catalog:

```ts
ui_output_mode:
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'text+image'
  | 'text+video'
  | 'text+image+video'
  | 'structured-text'
```

Purpose:
- lets the UI decide the default output tab
- helps choose card layout and preview type
- makes it easier to hide irrelevant controls
- separates "content type" from agent category

Suggested UI behavior:
- `text`: open rich text tab by default
- `structured-text`: open structured renderer by default
- `image`: open assets tab by default with image grid
- `video`: open assets tab by default with video player
- `audio`: open structured script / show-notes layout by default
- `text+image`: show text first, keep image tab prominent
- `text+video`: show text first, keep video tab prominent
- `text+image+video`: show a split summary and all relevant media tabs

## Recommended Input Attribute

Add this attribute to the agent catalog:

```ts
ui_input_requirements: {
  mandatory_form_fields: string[]
  required_sources: Array<'none' | 'image' | 'pdf' | 'video' | 'kb' | 'url'>
}
```

Purpose:
- tells the UI which fields must be filled before generate
- tells the UI whether file/image/video upload should be required or optional
- helps disable agents that cannot run meaningfully without media or KB context
- makes onboarding simpler by showing "what this agent needs"

Interpretation:
- `mandatory_form_fields`: agent-specific fields the UI must validate
- `required_sources`:
  - `none` = normal form input is enough
  - `image` = user must supply source image or image-like asset
  - `pdf` = user must supply PDF or document input
  - `video` = user must supply source video/media
  - `kb` = agent should require workspace KB or uploaded documents to be useful
  - `url` = agent should require a page/site URL

Suggested UI behavior:
- if `required_sources` contains `image`, show image upload / image URL first and block generate until present
- if `required_sources` contains `video`, show media URL/upload and block generate until present
- if `required_sources` contains `pdf` or `kb`, emphasize file picker / document selection
- if `required_sources` contains `url`, validate URL field before enabling submit

## High-Level Findings

- 78 agents are surfaced in the UI, but many are labels over shared backend classes rather than truly distinct capabilities.
- 27 surfaced agents are missing exact-match YAML prompts, because prompt lookup is keyed by `agent_id` and is exact-match based.
- `infographic` is currently broken at code level and should be hidden until fixed.
- Many forms collect fields that backend models ignore.
- The KB document selector UI is not wired into generation payloads, so users can click workspace docs without those selections actually reaching the agents.
- Structured outputs are rich for several strong agents, but the generic output viewer still renders most of them as rich text plus raw JSON.

## Cross-Cutting Issues

1. Exact-match prompt loading means generic prompt files do not help surfaced agent IDs.
   - `audio_agent.yaml`, `video_agent.yaml`, `seo_agent.yaml`, `email_agent.yaml`, and `copy_utility_agent.yaml` exist, but they do not satisfy surfaced IDs like `podcast_script`, `video_summarizer`, `keyword_researcher`, `newsletter`, or `landing_page`.

2. Too many first-class agents are prompt variants over shared schemas.
   - Social, content, ads, SEO, audio, and growth families are largely shared engines with different labels.

3. Several forms send fields that backend models do not accept.
   - `creative_direction` form sends `tone_override` and `include_link`, but the model only accepts `campaign_goal`.
   - LinkedIn forms send `tone_override` and `include_link`, but the model expects `professional_tone` and optional `content_format`.
   - Ad forms collect `tone_override` and `target_audience`, but the current ad backend model ignores both.
   - Video forms collect `include_link`, but the current video script model does not include it.

4. KB selection is incomplete.
   - Users can select existing docs in the UI, but the selected doc IDs are not included in the request payload.
   - Uploaded files are stored in front-end state, but they are not posted by the generic core form flow.

5. Output UX is inconsistent.
   - `brand_identity` has a dedicated structured renderer.
   - Most other structured agents still fall back to generic text + raw JSON, which hides their real value.

## Exact Prompt Gaps

The following surfaced agents are missing exact-match prompt files today:

- `image_editor` (not a blocker because the agent bypasses prompt YAML)
- `instagram_story`
- `instagram_reel`
- `instagram_carousel`
- `instagram_bio`
- `facebook_ad_copy`
- `linkedin_article`
- `linkedin_ad`
- `twitter_thread`
- `twitter_ad`
- `pinterest_ad`
- `tiktok_trend`
- `tiktok_ad`
- `video_ad_script`
- `youtube_script`
- `ai_video_gen`
- `video_summarizer`
- `caption_generator`
- `thumbnail_idea`
- `video_trend_analyzer`
- `newsletter`
- `keyword_researcher`
- `on_page_seo`
- `technical_seo`
- `aeo_optimizer`
- `podcast_script`
- `podcast_description`

## Broken Agent

- `infographic`
  - Status: broken
  - Problem: code-level `IndentationError` in `backend/app/agents/visual/infographic.py`
  - Recommendation: hide from UI until implementation is repaired

## Per-Agent Review

### Brand

| Agent | Value | Action | Prompt | Add attrs | Remove attrs | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `brand_identity` | Good | Keep | Present | `brand_site_url`; `competitor_urls` explicit fields in dedicated form | None | Best first-class agent today. Dedicated form and dedicated output renderer are strong. |
| `brand_naming` | Good | Keep | Present | `name_count`; `domain_tld_preferences` | None | Strong standalone verbal identity agent. |
| `tagline_slogan` | Good | Keep | Present | `use_case`; `channel` | None | Strong follow-on to brand naming / brand identity. |
| `target_audience` | Good | Keep | Present | `product_description` | None | Backend expects `product_description`, but current form/docs do not surface it clearly enough. |
| `brand_voice` | Good | Keep | Present | `sample_content`; `sample_asset_ids` | None | Strong when fed from selected outputs or sample copy. |
| `brand_guardian` | Good | Keep | Present | `auto_rewrite`; `severity_threshold` | `card_type` if not used | Strong QA / compliance gate. Prompt currently does not use `card_type`. |

### Creative Strategy

| Agent | Value | Action | Prompt | Add attrs | Remove attrs | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `creative_direction` | Fair | Fix | Present | `target_audience`; `channels`; `deliverables` | `tone_override`; `include_link` | Current form/docs send fields the backend model does not accept. |
| `campaign_concept` | Good | Keep | Present | `primary_goal`; `target_audience`; `success_metric` | None | Strong strategy agent with useful structured output. |
| `content_calendar` | Good | Fix | Present | `posting_frequency`; `start_date` | None | Backend model already supports `posting_frequency`; form/docs should expose it. |

### Visual

| Agent | Value | Action | Prompt | Add attrs | Remove attrs | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `logo_designer` | Good | Keep | Present | `brand_description`; `usage_context` | None | Solid standalone visual identity capability. |
| `hero_image` | Good | Keep | Present | `composition`; `reference_asset_url` | None | Strong prompt-refinement + generation flow. |
| `product_photoshoot` | Good | Keep | Present | `aspect_ratio`; `background_style` | None | Strong merchandising / product marketing use case. |
| `ad_creative` | Fair | Keep | Present | `aspect_ratio`; `design_style`; `legal_text` | None | Useful, but could be more structured around ad dimensions and placement types. |
| `image_editor` | Fair | Keep | N/A | `mask_area`; `variation_count` | None | Exact prompt file is missing, but not a blocker because this agent calls image editing directly. |
| `mockup_generator` | Fair | Keep | Present | `background_style`; `scene_quality` | None | Useful, but needs slightly richer control. |
| `infographic` | Weak | Hide | Present | `data_points` | `tone_override`; `include_link` | Broken code today. Also current form/docs do not match backend model, which expects `data_points`. |

### Social - Instagram

| Agent | Value | Action | Prompt | Add attrs | Remove attrs | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `instagram_post` | Fair | Merge | Present | `format` if merged into `instagram_content` | None | Only one of the IG family has exact prompt coverage. Current split creates duplicate UI over one shared backend model. |
| `instagram_story` | Weak | Hide or Merge | Missing | `frame_count`; `sticker_cta`; `story_sequence` | None | Missing prompt and still uses the same schema as a normal IG post. |
| `instagram_reel` | Fair | Merge | Missing | `hook_style`; `shot_list`; `audio_reference`; `duration_seconds` | None | Should be video-first, but currently behaves like generic IG content. |
| `instagram_carousel` | Fair | Merge | Missing | `slide_count`; `slide_goal`; `final_slide_cta` | None | Needs carousel-specific prompt and schema or should merge into one IG family agent. |
| `instagram_bio` | Weak | Hide or Merge | Missing | `bio_length`; `profile_cta`; `emoji_level` | `generate_image`; `image_count`; `generate_video` | Media-generation fields do not make sense for an IG bio. |

### Social - Facebook

| Agent | Value | Action | Prompt | Add attrs | Remove attrs | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `facebook_post` | Fair | Keep or Merge | Present | `audience_segment`; `campaign_stage` | None | Useful, but could live inside a single `facebook_content` family agent. |
| `facebook_ad_copy` | Weak | Remove | Missing | None if retired; if kept add `offer`; `campaign_objective`; `cta` | All shared social-post fields if retired | Duplicate surface next to `meta_ads`, but with weaker architecture and missing prompt coverage. |

### Social - LinkedIn

| Agent | Value | Action | Prompt | Add attrs | Remove attrs | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `linkedin_post` | Good | Keep or Merge | Present | `content_format` | `tone_override`; `include_link` | Current form collects ignored fields. Backend expects `professional_tone` and optional `content_format`. |
| `linkedin_article` | Fair | Fix or Merge | Missing | `content_format=article`; `outline_depth`; `section_count` | `tone_override`; `include_link` | Missing prompt; currently the same shared engine as post/ad. |
| `linkedin_ad` | Weak | Remove | Missing | None if retired; if kept add `offer`; `cta`; `campaign_objective` | `tone_override`; `include_link` | Better handled by `linkedin_lead_gen`. |

### Social - X / Twitter

| Agent | Value | Action | Prompt | Add attrs | Remove attrs | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `twitter_tweet` | Fair | Merge | Present | `reply_goal`; `persona_mode` | None | Useful, but better as one `x_content` family with format selection. |
| `twitter_thread` | Fair | Fix or Merge | Missing | `thread_goal`; `thread_outline` | None | Missing prompt; `thread_length` exists already and is useful. |
| `twitter_ad` | Weak | Remove | Missing | None if retired; if kept add `offer`; `cta`; `campaign_objective` | Shared social-post fields if retired | Better handled by paid ads family, not social family. |

### Social - Pinterest and TikTok

| Agent | Value | Action | Prompt | Add attrs | Remove attrs | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `pinterest_pin` | Fair | Merge | Present | `pin_title`; `destination_url` | None | Should probably live in a `pinterest_content` family agent. |
| `pinterest_ad` | Weak | Remove | Missing | None if retired; if kept add `offer`; `destination_url`; `cta` | Shared social-post fields if retired | Better handled by `pinterest_ads`. |
| `tiktok_script` | Good | Keep or Merge | Present | `duration_seconds`; `creator_style`; `audio_reference` | None | One of the stronger social agents. |
| `tiktok_trend` | Weak | Hide | Missing | `trend_reference_url`; `trend_name`; `trend_expiry` | None | Cannot credibly be a "trend" agent without live or user-provided trend sources. |
| `tiktok_ad` | Weak | Remove | Missing | None if retired; if kept add `offer`; `cta`; `ad_format` | Shared social-post fields if retired | Better handled by `tiktok_ads`. |

### Video and Motion

| Agent | Value | Action | Prompt | Add attrs | Remove attrs | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `video_ad_script` | Fair | Fix | Missing | `campaign_goal`; `cta`; `shot_count` | `include_link` | Current video family is routed through one shared script model, and exact prompt is missing. |
| `youtube_script` | Fair | Fix | Missing | `creator_persona`; `chapter_count`; `audience` | `include_link` | Missing prompt. Still useful if rebuilt as a dedicated script agent. |
| `ai_video_gen` | Fair | Fix | Missing | `prompt`; `source_image_url`; `style`; `duration` | `topic`; `target_duration`; `platform`; `tone_override`; `pacing`; `include_link` | Current form/docs do not match the intended video generation model. |
| `video_summarizer` | Weak | Hide | Missing | `source_media_url`; `max_summary_length`; `snippet_count` | `topic`; `target_duration`; `platform`; `tone_override`; `pacing`; `include_link` | Should use tool-style media input, not script input. |
| `caption_generator` | Weak | Hide | Missing | `source_media_url`; `include_timestamps`; `speaker_labels`; `caption_style` | `topic`; `target_duration`; `platform`; `tone_override`; `pacing`; `include_link` | Current surfaced schema is the wrong product shape. |
| `thumbnail_idea` | Fair | Fix or Merge | Missing | `video_title`; `thumbnail_text`; `emotion`; `visual_angle` | `target_duration`; `pacing`; `include_link` | Better as part of a broader video packaging family. |
| `video_trend_analyzer` | Weak | Hide | Missing | `niche`; `platform`; `trend_sources`; `date_range` | Current script-style fields | Like `tiktok_trend`, this is misleading without live or user-supplied trend data. |

### Content and Copy

| Agent | Value | Action | Prompt | Add attrs | Remove attrs | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `blog_post` | Good | Keep | Present | `call_to_action`; `keywords`; `seo_intent` | None | Strong first-class content agent. |
| `email_campaign` | Good | Keep | Present | `call_to_action`; `keywords`; `email_count` if multi-email mode is desired | None | Good direct-response use case. |
| `newsletter` | Fair | Fix | Missing | `newsletter_goal`; `sections_to_include`; `issue_theme`; `call_to_action` | None | Missing exact prompt; today it is only a label over the email engine. |
| `landing_page` | Good | Keep | Present | `call_to_action`; `keywords`; `page_sections` | None | Strong and commercially useful agent. |
| `case_study` | Good | Keep | Present | `customer_name`; `results_metrics`; `problem_statement` | None | Strong B2B / credibility asset. |
| `press_release` | Good | Keep | Present | `announcement_date`; `quote_source`; `boilerplate` | None | Useful and distinct. |
| `whitepaper` | Good | Keep | Present | `thesis`; `source_requirements`; `audience_level` | None | Useful long-form strategic content type. |
| `product_description` | Good | Keep | Present | `feature_list`; `specs`; `keywords` | None | Strong ecommerce use case. |
| `faq_generator` | Good | Keep | Present | `question_count`; `source_material`; `support_stage` | None | Good support and conversion asset. |
| `sms_marketing` | Good | Keep | Present | `link_url`; `character_limit`; `urgency_level` | None | Clear and high-value use case. |
| `content_audit` | Good | Keep | Present | `content_count`; `content_inventory_url`; `audit_goal` | None | Strong strategy / ops agent. |

### Advertising Copy

| Agent | Value | Action | Prompt | Add attrs | Remove attrs | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `meta_ads` | Good | Keep | Present | Add to backend: `tone_override`; `target_audience`; `cta` | None | Current UI/docs collect fields the backend model ignores. |
| `google_search_ads` | Good | Keep | Present | Add to backend: `tone_override`; `target_audience`; `cta`; `keyword_theme` | None | Strong paid search use case. |
| `google_display_ads` | Good | Keep | Present | Add to backend: `tone_override`; `target_audience`; `cta`; `image_angle` | None | Strong if visual angle is explicit. |
| `linkedin_lead_gen` | Good | Keep | Present | Add to backend: `tone_override`; `target_audience`; `lead_asset` | None | Strong B2B paid-social use case. |
| `pinterest_ads` | Good | Keep | Present | Add to backend: `tone_override`; `target_audience`; `destination_url` | None | Good commerce / discovery use case. |
| `tiktok_ads` | Good | Keep | Present | Add to backend: `tone_override`; `target_audience`; `creator_style` | None | Strong if angle and creator style are explicit. |
| `youtube_ads` | Good | Keep | Present | Add to backend: `tone_override`; `target_audience`; `video_hook` | None | Strong video ad family agent. |
| `amazon_ppc` | Good | Keep | Present | Add to backend: `tone_override`; `target_audience`; `target_keywords` | None | Distinct marketplace use case. |

### SEO and AEO

| Agent | Value | Action | Prompt | Add attrs | Remove attrs | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `keyword_researcher` | Fair | Fix | Missing | `region`; `language`; `seed_keywords`; `site_url` | None | Useful job, but missing exact prompt coverage. |
| `on_page_seo` | Fair | Fix | Missing | `page_title`; `page_content`; `meta_description` | None | Needs a more page-editor-oriented input model. |
| `technical_seo` | Fair | Fix | Missing | `sitemap_url`; `robots_txt_url`; `crawl_export` | `target_audience` | Technical SEO should not center on a persona field. |
| `aeo_optimizer` | Fair | Fix | Missing | `faq_content`; `entity_targets`; `answer_questions` | `target_audience` | Strong concept, but needs a more answer-engine-specific schema and prompt. |

### Audio and Podcast

| Agent | Value | Action | Prompt | Add attrs | Remove attrs | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `podcast_script` | Fair | Fix | Missing | `show_name`; `host_name`; `episode_goal`; `chapter_count` | None | Missing exact prompt even though a generic audio prompt file exists. |
| `podcast_description` | Fair | Fix | Missing | `show_name`; `episode_title`; `key_takeaways`; `cta` | None | Missing exact prompt even though a generic audio prompt file exists. |

### Growth and Strategy

| Agent | Value | Action | Prompt | Add attrs | Remove attrs | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `pricing_strategy` | Good | Keep | Present | `pricing_objective`; `margin_target`; `packaging_constraints` | None | Strong strategic agent. |
| `launch_strategy` | Good | Keep | Present | `launch_type`; `success_metric` | None | Strong launch-planning use case. |
| `cold_email` | Good | Keep | Present | `sender_identity`; `cta_type`; `personalization_inputs` | None | Strong outbound use case. |
| `email_sequence` | Good | Keep | Present | `send_spacing_days`; `call_to_action` | None | Strong lifecycle / nurture use case. |
| `page_cro` | Good | Keep | Present | `primary_conversion_event`; `traffic_source_mix` | None | Strong conversion optimization job. |
| `ab_test_setup` | Good | Keep | Present | `primary_metric`; `secondary_metrics`; `traffic_split` | None | Strong experiment-design agent. |
| `marketing_psychology` | Good | Keep | Present | `ethical_constraints`; `trust_risks` | None | High-value strategic lens. |
| `content_strategy` | Good | Keep | Present | `team_capacity`; `repurposing_targets` | None | Strong planning agent. |
| `competitor_alternatives` | Good | Keep | Present | `feature_matrix`; `comparison_keywords` | None | Valuable for positioning and SEO. |
| `seo_audit` | Good | Keep | Present | `competitor_urls`; `seed_keywords`; `site_type` | Ambiguous `target_audience` label in docs if replaced by market keywords | Strong and already well-prompted. |
| `schema_markup` | Good | Keep | Present | `page_type`; `existing_schema_json`; `implementation_language` | None | Strong technical marketing agent. |
| `referral_program` | Good | Keep | Present | `reward_budget`; `referral_cap`; `program_goal` | None | Strong growth mechanics agent. |

## Recommended `ui_output_mode` Per Agent

### Brand

| Agent | ui_output_mode | Why |
| --- | --- | --- |
| `brand_identity` | `structured-text` | Brand system, colors, fonts, values, dos/don'ts |
| `brand_naming` | `structured-text` | Ranked options and rationale |
| `tagline_slogan` | `structured-text` | Short ranked options |
| `target_audience` | `structured-text` | Personas, channels, triggers |
| `brand_voice` | `structured-text` | Rules, tone profile, preferred/avoid words |
| `brand_guardian` | `structured-text` | Compliance score, issues, rewrite guidance |

### Creative Strategy

| Agent | ui_output_mode | Why |
| --- | --- | --- |
| `creative_direction` | `structured-text` | Brief-style strategic output |
| `campaign_concept` | `structured-text` | Concepts, recommendations, asset ideas |
| `content_calendar` | `structured-text` | Table/calendar-like output |

### Visual

| Agent | ui_output_mode | Why |
| --- | --- | --- |
| `logo_designer` | `image` | Image assets are the real deliverable |
| `hero_image` | `image` | Asset-first output |
| `product_photoshoot` | `image` | Asset-first output |
| `ad_creative` | `image` | Visual asset is primary, supporting text is secondary |
| `image_editor` | `image` | Edited image is the product |
| `mockup_generator` | `image` | Mockup images are primary |
| `infographic` | `image` | Final deliverable is image-based once fixed |

### Social

| Agent | ui_output_mode | Why |
| --- | --- | --- |
| `instagram_post` | `text+image+video` | Caption plus optional media |
| `instagram_story` | `text+image+video` | Story copy plus visual sequence/media |
| `instagram_reel` | `text+video` | Script plus optional/generated video |
| `instagram_carousel` | `text+image` | Slide copy plus image set |
| `instagram_bio` | `text` | Bio copy only |
| `facebook_post` | `text+image+video` | Post copy plus optional media |
| `facebook_ad_copy` | `text+image` | Ad copy plus optional supporting visual |
| `linkedin_post` | `text+image` | Post copy plus optional visual |
| `linkedin_article` | `text` | Long-form article output |
| `linkedin_ad` | `text+image` | Ad copy plus optional supporting visual |
| `twitter_tweet` | `text+image` | Tweet text with optional visual |
| `twitter_thread` | `text+image` | Thread text with optional visual |
| `twitter_ad` | `text+image` | Ad copy with optional visual |
| `pinterest_pin` | `text+image` | Pin text + visual concept |
| `pinterest_ad` | `text+image` | Ad copy + creative |
| `tiktok_script` | `text+video` | Script and shot flow, video-forward |
| `tiktok_trend` | `text+video` | Trend adaptation is video-first if kept |
| `tiktok_ad` | `text+video` | Script + ad video direction |

### Video and Motion

| Agent | ui_output_mode | Why |
| --- | --- | --- |
| `video_ad_script` | `text+video` | Script plus generated video possibility |
| `youtube_script` | `text` | Script-led output |
| `ai_video_gen` | `video` | Generated video is the main deliverable |
| `video_summarizer` | `text+video` | Summary text plus clip/snippet support if rebuilt |
| `caption_generator` | `text` | Transcript/captions text is primary |
| `thumbnail_idea` | `text+image` | Thumbnail concept plus optional image asset |
| `video_trend_analyzer` | `structured-text` | Analysis/recommendations, not direct media output |

### Content and Copy

| Agent | ui_output_mode | Why |
| --- | --- | --- |
| `blog_post` | `text` | Article-first output |
| `email_campaign` | `text` | Copy-first output |
| `newsletter` | `text` | Copy-first output |
| `landing_page` | `text` | Structured web copy |
| `case_study` | `text` | Narrative copy |
| `press_release` | `text` | Formal text output |
| `whitepaper` | `text` | Long-form document |
| `product_description` | `text` | Commerce copy |
| `faq_generator` | `structured-text` | Question/answer blocks |
| `sms_marketing` | `text` | Short copy |
| `content_audit` | `structured-text` | Audit findings, gaps, action items |

### Advertising Copy

| Agent | ui_output_mode | Why |
| --- | --- | --- |
| `meta_ads` | `structured-text` | Ad variations should render in cards/tables |
| `google_search_ads` | `structured-text` | Headline/description variations |
| `google_display_ads` | `structured-text` | Copy variants plus creative notes |
| `linkedin_lead_gen` | `structured-text` | Offer + variant matrix |
| `pinterest_ads` | `structured-text` | Variant-led output |
| `tiktok_ads` | `structured-text` | Script / hook / CTA variants |
| `youtube_ads` | `structured-text` | Variant-led output |
| `amazon_ppc` | `structured-text` | Search ad and keyword style variant matrix |

### SEO and AEO

| Agent | ui_output_mode | Why |
| --- | --- | --- |
| `keyword_researcher` | `structured-text` | Keyword groups, clusters, opportunities |
| `on_page_seo` | `structured-text` | Fix lists and page recommendations |
| `technical_seo` | `structured-text` | Audit findings and prioritized fixes |
| `aeo_optimizer` | `structured-text` | Question-answer / entity / answer-engine optimization guidance |

### Audio and Podcast

| Agent | ui_output_mode | Why |
| --- | --- | --- |
| `podcast_script` | `audio` | Script segments, speakers, show notes |
| `podcast_description` | `text` | Metadata / episode description copy |

### Growth and Strategy

| Agent | ui_output_mode | Why |
| --- | --- | --- |
| `pricing_strategy` | `structured-text` | Frameworks, recommendations, decision tables |
| `launch_strategy` | `structured-text` | Roadmap, phases, channel plans |
| `cold_email` | `structured-text` | Sequence variants / outreach drafts |
| `email_sequence` | `structured-text` | Multi-email structured output |
| `page_cro` | `structured-text` | Findings and prioritized action items |
| `ab_test_setup` | `structured-text` | Hypothesis, variants, metrics |
| `marketing_psychology` | `structured-text` | Framework analysis and recommendations |
| `content_strategy` | `structured-text` | Pillars, roadmap, measurement |
| `competitor_alternatives` | `structured-text` | Comparison matrix and positioning notes |
| `seo_audit` | `structured-text` | Audit and fix plan |
| `schema_markup` | `structured-text` | JSON-LD / schema recommendations |
| `referral_program` | `structured-text` | Program structure, incentives, rollout plan |

## Recommended `ui_input_requirements` Per Agent

### Brand

| Agent | mandatory_form_fields | required_sources | Notes |
| --- | --- | --- | --- |
| `brand_identity` | `business_description`, `industry`, `target_audience` | `none` | `url` and `kb` should be optional enhancers, not blockers |
| `brand_naming` | `business_description` | `none` | Strong enough with form only |
| `tagline_slogan` | `brand_name` or `business_description` | `none` | UI can require at least one of the two |
| `target_audience` | `product_description` or `brand_name` | `none` | Better when `product_description` is required in UI |
| `brand_voice` | `brand_description` or sample brand context | `kb` | Works best with KB / prior outputs; form-only mode is weak |
| `brand_guardian` | `content_to_validate`, `content_type` | `none` | Content paste is enough |

### Creative Strategy

| Agent | mandatory_form_fields | required_sources | Notes |
| --- | --- | --- | --- |
| `creative_direction` | `campaign_goal` | `none` | Can optionally use KB and prior outputs |
| `campaign_concept` | `campaign_type` | `none` | Channels/budget/duration should stay optional |
| `content_calendar` | `duration_weeks`, `channels` | `none` | KB optional, but not required |

### Visual

| Agent | mandatory_form_fields | required_sources | Notes |
| --- | --- | --- | --- |
| `logo_designer` | `brand_name` or `icon_concept` | `none` | Can run without uploads |
| `hero_image` | `description` | `none` | Prompt-only generation |
| `product_photoshoot` | `product_image_url` | `image` | Source product image should be required |
| `ad_creative` | `platform`, `headline` | `none` | `product_image_url` optional today, but recommended for stronger output |
| `image_editor` | `source_image_url`, `edit_instruction` | `image` | Must require source image |
| `mockup_generator` | `design_image_url`, `mockup_types` | `image` | Design/logo image required |
| `infographic` | `topic`, `data_points` | `none` | Once fixed, prompt-only can work; source docs can stay optional |

### Social

| Agent | mandatory_form_fields | required_sources | Notes |
| --- | --- | --- | --- |
| `instagram_post` | `topic` | `none` | Media generation is optional |
| `instagram_story` | `topic` | `none` | Could optionally use `image` if story adaptation mode is added |
| `instagram_reel` | `topic` | `none` | Optional media generation only |
| `instagram_carousel` | `topic` | `none` | Optional media generation only |
| `instagram_bio` | `topic` | `none` | No image/video requirement |
| `facebook_post` | `topic` | `none` | Form-only is enough |
| `facebook_ad_copy` | `topic` | `none` | If retained, should still be form-only |
| `linkedin_post` | `topic`, `professional_tone` | `none` | Form-only is enough |
| `linkedin_article` | `topic` | `none` | Form-only is enough |
| `linkedin_ad` | `topic` | `none` | If retained, form-only |
| `twitter_tweet` | `topic` | `none` | Form-only is enough |
| `twitter_thread` | `topic`, `thread_length` | `none` | Form-only is enough |
| `twitter_ad` | `topic` | `none` | If retained, form-only |
| `pinterest_pin` | `topic` | `none` | Form-only is enough |
| `pinterest_ad` | `topic` | `none` | If retained, form-only |
| `tiktok_script` | `topic` | `none` | Form-only is enough |
| `tiktok_trend` | `topic` | `url` | If kept, should require trend source URL or evidence |
| `tiktok_ad` | `topic` | `none` | If retained, form-only |

### Video and Motion

| Agent | mandatory_form_fields | required_sources | Notes |
| --- | --- | --- | --- |
| `video_ad_script` | `topic`, `target_duration`, `platform` | `none` | Script can be form-only |
| `youtube_script` | `topic`, `target_duration` | `none` | Script can be form-only |
| `ai_video_gen` | `prompt` or `topic` | `none` or `image` | If image-to-video mode exists, require `image`; otherwise prompt-only |
| `video_summarizer` | `source_media_url` | `video` | Should require source media if rebuilt correctly |
| `caption_generator` | `source_media_url` | `video` | Must require source media if rebuilt correctly |
| `thumbnail_idea` | `topic` | `none` | Optional image/reference asset only |
| `video_trend_analyzer` | `niche` or `topic` | `url` | Should require trend sources or URLs if kept |

### Content and Copy

| Agent | mandatory_form_fields | required_sources | Notes |
| --- | --- | --- | --- |
| `blog_post` | `topic` | `none` | `kb` optional for research-heavy mode |
| `email_campaign` | `topic` | `none` | Form-only is enough |
| `newsletter` | `topic` | `kb` | Usually much better if KB or prior outputs are selected |
| `landing_page` | `topic` | `none` | Optional `url` if optimizing an existing page |
| `case_study` | `topic` | `kb` | Works best with source docs, transcripts, or notes |
| `press_release` | `topic` | `none` | Form-only is enough |
| `whitepaper` | `topic` | `kb` | KB should be strongly recommended or required for credibility |
| `product_description` | `topic` | `none` | Optional image/source docs can improve quality |
| `faq_generator` | `topic` | `kb` | Best when based on product docs or policy docs |
| `sms_marketing` | `topic` | `none` | Form-only is enough |
| `content_audit` | `topic` | `url` | Should require URL or site content source to be truly useful |

### Advertising Copy

| Agent | mandatory_form_fields | required_sources | Notes |
| --- | --- | --- | --- |
| `meta_ads` | `product_name`, `offer`, `benefit_focus` | `none` | Form-only is enough |
| `google_search_ads` | `product_name`, `offer`, `benefit_focus` | `none` | Form-only is enough |
| `google_display_ads` | `product_name`, `offer`, `benefit_focus` | `none` | Optional image/reference creative |
| `linkedin_lead_gen` | `product_name`, `offer`, `benefit_focus` | `none` | Form-only is enough |
| `pinterest_ads` | `product_name`, `offer`, `benefit_focus` | `none` | Optional creative reference |
| `tiktok_ads` | `product_name`, `offer`, `benefit_focus` | `none` | Optional creator/video reference |
| `youtube_ads` | `product_name`, `offer`, `benefit_focus` | `none` | Form-only is enough |
| `amazon_ppc` | `product_name`, `offer`, `benefit_focus` | `none` | Optional keyword doc could help, but not required |

### SEO and AEO

| Agent | mandatory_form_fields | required_sources | Notes |
| --- | --- | --- | --- |
| `keyword_researcher` | `target_keywords` or `url_to_analyze` | `url` | Should require at least a site URL or seed keywords |
| `on_page_seo` | `url_to_analyze`, `target_keywords` | `url` | Existing page optimization should require URL |
| `technical_seo` | `url_to_analyze` | `url` | Technical audit without URL is weak |
| `aeo_optimizer` | `url_to_analyze` or FAQ/source content | `url` or `kb` | Should require source page or knowledge content |

### Audio and Podcast

| Agent | mandatory_form_fields | required_sources | Notes |
| --- | --- | --- | --- |
| `podcast_script` | `topic`, `target_duration_mins` | `none` | Scripting can be form-only |
| `podcast_description` | `topic` | `none` | Description can be form-only |

### Growth and Strategy

| Agent | mandatory_form_fields | required_sources | Notes |
| --- | --- | --- | --- |
| `pricing_strategy` | `topic` | `none` | Metrics optional but highly recommended |
| `launch_strategy` | `topic` | `none` | URL optional |
| `cold_email` | `topic`, `target_audience` | `none` | Form-only is enough |
| `email_sequence` | `topic`, `sequence_length`, `trigger_event` | `none` | Form-only is enough |
| `page_cro` | `topic` or `url_to_analyze` | `url` | Existing-page CRO should usually require URL |
| `ab_test_setup` | `topic` | `none` | URL optional but helpful |
| `marketing_psychology` | `topic` | `none` | URL optional |
| `content_strategy` | `topic` | `none` | URL optional |
| `competitor_alternatives` | `topic`, `competitor_names` | `none` | URL optional |
| `seo_audit` | `topic` or `url_to_analyze` | `url` | Audit should strongly require a site URL |
| `schema_markup` | `topic` or `url_to_analyze` | `url` | URL should usually be required for implementation guidance |
| `referral_program` | `topic`, `incentive_type` | `none` | Metrics optional |

## Recommended Catalog Shape

### Keep as First-Class Agents

- `brand_identity`
- `brand_naming`
- `tagline_slogan`
- `target_audience`
- `brand_voice`
- `brand_guardian`
- `creative_direction`
- `campaign_concept`
- `content_calendar`
- `logo_designer`
- `hero_image`
- `product_photoshoot`
- `ad_creative`
- `image_editor`
- `mockup_generator`
- `blog_post`
- `email_campaign`
- `landing_page`
- `case_study`
- `press_release`
- `whitepaper`
- `product_description`
- `faq_generator`
- `sms_marketing`
- `content_audit`
- all 8 paid ads agents
- all 12 growth / strategy agents

### Merge Into Family Agents

- Instagram family:
  - `instagram_post`
  - `instagram_story`
  - `instagram_reel`
  - `instagram_carousel`
  - `instagram_bio`
- Facebook family:
  - `facebook_post`
- LinkedIn family:
  - `linkedin_post`
  - `linkedin_article`
- X family:
  - `twitter_tweet`
  - `twitter_thread`
- Pinterest family:
  - `pinterest_pin`
- TikTok family:
  - `tiktok_script`

Suggested merged replacements:
- `instagram_content`
- `facebook_content`
- `linkedin_content`
- `x_content`
- `pinterest_content`
- `tiktok_content`

### Hide or Remove Until Rebuilt

- `infographic`
- `facebook_ad_copy`
- `linkedin_ad`
- `pinterest_ad`
- `tiktok_ad`
- `tiktok_trend`
- `video_summarizer`
- `caption_generator`
- `video_trend_analyzer`

### Fix Before Trusting in Production

- `creative_direction`
- `content_calendar`
- `instagram_story`
- `instagram_reel`
- `instagram_carousel`
- `instagram_bio`
- `linkedin_article`
- `twitter_thread`
- all surfaced video family agents
- `newsletter`
- all surfaced SEO/AEO family agents except `seo_audit`
- both podcast agents

## New Agents Worth Adding

1. `custom_workflow`
   - Already exists in backend as an adaptation / repurposing utility.
   - It is more useful than several weak long-tail agents and should be surfaced.

2. `messaging_matrix`
   - Value props by persona, funnel stage, objection, and CTA.

3. `offer_positioning`
   - Clarifies offer hierarchy, pricing framing, risk reversal, and CTA strategy.

4. `ugc_brief`
   - Creator brief generation for influencer / UGC pipelines.

5. `analytics_insights`
   - Turns performance metrics into actions, experiments, and next-step recommendations.

## Global Implementation Priorities

1. Repair `infographic` and align its form/schema.
2. Reduce top-level agent count by merging format variants into family agents.
3. Add exact-match prompt files for any agent that remains surfaced.
4. Align forms with backend models:
   - remove ignored fields
   - add missing schema fields
5. Wire KB document selections and uploads into actual generation requests.
6. Add dedicated output renderers for:
   - `target_audience`
   - `campaign_concept`
   - `content_calendar`
   - `brand_guardian`
   - SEO family
   - growth family
   - video family
   - audio family
