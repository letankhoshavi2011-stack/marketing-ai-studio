# Social Agent Test Inputs

Manual testing reference for all 18 social media agent IDs.

**Base URL:** `http://localhost:8002/api/v1/agents/core`

**Common fields (inherited from BaseAgentInput):**
- `workspace_id` (required): string
- `target_language`: string (default: "English")
- `generate_image`: bool (default: false) — set true to generate AI images
- `image_count`: int (default: 1) — images per post, max 3
- `generate_video`: bool (default: false) — set true to generate AI video (slow, 30-300s)
- `urls_to_scrape`: string[] — URLs for context
- `additional_instructions`: string — freeform guidance

---

## Instagram Agents

### instagram_post
**Endpoint:** `POST /instagram_post/generate`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| topic | string | yes | — | Post topic/brief |
| visual_theme | string | no | — | e.g. "Minimalist", "Vibrant" |
| tone_override | string | no | — | "casual", "professional", "inspirational", "educational", "promotional" |
| keywords | string[] | no | [] | Hashtag themes |
| generate_image | bool | no | false | Generate AI images |
| image_count | int | no | 1 | 1-3 images per post |
| generate_video | bool | no | false | Generate AI video |

```json
{
  "agent_id": "instagram_post",
  "workspace_id": "test-ws-001",
  "topic": "Sustainable fashion tips for summer 2025",
  "visual_theme": "Bright & Earthy",
  "tone_override": "casual",
  "keywords": ["sustainable", "fashion", "ecofriendly"],
  "generate_image": true,
  "image_count": 2,
  "generate_video": false
}
```

### instagram_story
Same input model as `instagram_post`. Change `agent_id` to `"instagram_story"`.

### instagram_reel
Same input model as `instagram_post`. Change `agent_id` to `"instagram_reel"`.

### instagram_carousel
Same input model as `instagram_post`. Change `agent_id` to `"instagram_carousel"`.

### instagram_bio
Same input model as `instagram_post`. Change `agent_id` to `"instagram_bio"`.

---

## Facebook Agents

### facebook_post
**Endpoint:** `POST /facebook_post/generate`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| topic | string | yes | — | Post topic/brief |
| goal | string | no | "engagement" | "engagement", "traffic", "leads", "awareness" |
| tone_override | string | no | — | "professional", "humorous", "inspirational", "educational" |
| include_link | bool | no | false | Include link CTA |
| generate_image | bool | no | false | Generate AI images |
| image_count | int | no | 1 | 1-3 images per post |
| generate_video | bool | no | false | Generate AI video |

```json
{
  "agent_id": "facebook_post",
  "workspace_id": "test-ws-001",
  "topic": "New product launch: AI-powered marketing suite",
  "goal": "awareness",
  "tone_override": "professional",
  "include_link": true,
  "generate_image": true,
  "image_count": 1,
  "generate_video": false
}
```

### facebook_ad_copy
Same input model as `facebook_post`. Change `agent_id` to `"facebook_ad_copy"`.

---

## LinkedIn Agents

### linkedin_post
**Endpoint:** `POST /linkedin_post/generate`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| topic | string | yes | — | Professional topic |
| professional_tone | string | no | "expert" | "expert", "thought_leader", "conversational", "storyteller" |
| content_format | string | no | — | e.g. "Standard Post", "Article" |
| generate_image | bool | no | false | Generate AI images |
| image_count | int | no | 1 | 1-3 images per post |
| generate_video | bool | no | false | Generate AI video |

```json
{
  "agent_id": "linkedin_post",
  "workspace_id": "test-ws-001",
  "topic": "5 lessons I learned scaling a SaaS from 0 to 10K users",
  "professional_tone": "thought_leader",
  "generate_image": true,
  "image_count": 2,
  "generate_video": false
}
```

### linkedin_article
Same input model as `linkedin_post`. Change `agent_id` to `"linkedin_article"`.

### linkedin_ad
Same input model as `linkedin_post`. Change `agent_id` to `"linkedin_ad"`.

---

## Twitter/X Agents

### twitter_tweet
**Endpoint:** `POST /twitter_tweet/generate`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| topic | string | yes | — | Tweet topic |
| thread_length | int | no | 5 | 1-20, set to 1 for single tweet |
| tone_override | string | no | — | "professional", "humorous", "inspirational", "educational" |
| generate_image | bool | no | false | Generate AI images |
| image_count | int | no | 1 | 1-3 images per post |
| generate_video | bool | no | false | Generate AI video |

```json
{
  "agent_id": "twitter_tweet",
  "workspace_id": "test-ws-001",
  "topic": "Why AI agents are the future of marketing",
  "thread_length": 1,
  "tone_override": "humorous",
  "generate_image": true,
  "image_count": 1,
  "generate_video": false
}
```

### twitter_thread
Same input model as `twitter_tweet`. Change `agent_id` to `"twitter_thread"` and use `thread_length: 5-10`.

### twitter_ad
Same input model as `twitter_tweet`. Change `agent_id` to `"twitter_ad"`.

---

## Pinterest Agents

### pinterest_pin
**Endpoint:** `POST /pinterest_pin/generate`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| topic | string | yes | — | Content topic |
| visual_theme | string | no | — | "Aesthetic", "Bold", "Pastel", "Trending" |
| tone_override | string | no | — | "fun", "educational", "inspirational", "promotional" |
| keywords | string[] | no | [] | Trending topics |
| generate_image | bool | no | false | Generate AI images |
| image_count | int | no | 1 | 1-3 images per post |
| generate_video | bool | no | false | Generate AI video |

```json
{
  "agent_id": "pinterest_pin",
  "workspace_id": "test-ws-001",
  "topic": "DIY home decor ideas for small apartments",
  "visual_theme": "Aesthetic",
  "tone_override": "inspirational",
  "keywords": ["homedecor", "diy", "smallspaces"],
  "generate_image": true,
  "image_count": 2,
  "generate_video": false
}
```

### pinterest_ad
Same input model as `pinterest_pin`. Change `agent_id` to `"pinterest_ad"`.

---

## TikTok Agents

### tiktok_script
**Endpoint:** `POST /tiktok_script/generate`

Same input model as Pinterest (PinterestTikTokInput).

```json
{
  "agent_id": "tiktok_script",
  "workspace_id": "test-ws-001",
  "topic": "3 productivity hacks you need to try",
  "visual_theme": "Bold",
  "tone_override": "fun",
  "keywords": ["productivity", "lifehack", "trending"],
  "generate_image": true,
  "image_count": 1,
  "generate_video": true
}
```

### tiktok_trend
Same input model. Change `agent_id` to `"tiktok_trend"`.

### tiktok_ad
Same input model. Change `agent_id` to `"tiktok_ad"`.

---

## Testing Tips

### Quick test (text only, no media)
```bash
curl -X POST http://localhost:8002/api/v1/agents/core/instagram_post/generate \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "instagram_post",
    "workspace_id": "test-ws-001",
    "topic": "Test post about coffee",
    "generate_image": false,
    "generate_video": false
  }'
```

### Test with images only (fast, ~5-10s)
```bash
curl -X POST http://localhost:8002/api/v1/agents/core/instagram_post/generate \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "instagram_post",
    "workspace_id": "test-ws-001",
    "topic": "Morning coffee ritual",
    "generate_image": true,
    "image_count": 1,
    "generate_video": false
  }'
```

### Test with video (slow, 30-300s)
```bash
curl -X POST http://localhost:8002/api/v1/agents/core/instagram_post/generate \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "instagram_post",
    "workspace_id": "test-ws-001",
    "topic": "Morning coffee ritual",
    "generate_image": false,
    "generate_video": true
  }'
```

### Test with multilingual output
Add `"target_language": "Spanish"` to any payload.

### Test with max images
Set `"image_count": 3` — backend caps at 3 regardless of input.
