import json
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, field_validator
import uuid
from app.models.base import BaseAgentInput, BaseAgentOutput, GeneratedAsset

# --- CATEGORY 2: CREATIVE STRATEGY ---

# 7. Creative Direction
class CreativeDirectionInput(BaseAgentInput):
    agent_id: str = "creative_direction"
    campaign_goal: str                      # "product launch", "brand awareness", "seasonal sale"
    target_audience: Optional[str] = None
    channels: List[str] = []
    deliverables: List[str] = []
    tone_override: Optional[str] = None
    include_link: Optional[bool] = False


class CreativeDirectionOutput(BaseAgentOutput):
    agent_id: str = "creative_direction"
    
    # Growth-style structured UI fields
    title: str = Field(default="", description="Main title of the creative brief")
    sections: List[Dict[str, str]] = Field(default=[], description="Structured breakdown {heading, content}")
    recommendations: List[str] = Field(default=[], description="Key strategic recommendations")
    action_items: List[str] = Field(default=[], description="Immediate next steps")

    mood_description: str
    visual_direction: str
    color_usage_guide: str
    composition_rules: List[str]
    imagery_approach: str                   # "photography", "illustration", "abstract"
    reference_styles: List[str]

# 8. Campaign Concept
class CampaignConcept(BaseModel):
    name: str
    theme: str
    messaging_angle: str
    suggested_assets: List[str]
    target_emotion: str
    tagline: str

class CampaignConceptInput(BaseAgentInput):
    agent_id: str = "campaign_concept"
    campaign_type: str                      # "launch", "sale", "awareness", "seasonal", "event"
    budget_range: Optional[str] = None
    duration: Optional[str] = None          # "1 week", "1 month", "ongoing"
    channels: List[str] = []                # ["instagram", "email", "google_ads"]
    primary_goal: Optional[str] = None
    target_audience: Optional[str] = None
    success_metric: Optional[str] = None


class CampaignConceptOutput(BaseAgentOutput):
    agent_id: str = "campaign_concept"

    # Growth-style structured UI fields
    title: str = Field(default="", description="Main title of the campaign proposal")
    sections: List[Dict[str, str]] = Field(default=[], description="Structured breakdown {heading, content}")
    recommendations: List[str] = Field(default=[], description="Key strategic recommendations")
    action_items: List[str] = Field(default=[], description="Immediate next steps")

    concepts: List[CampaignConcept]         # 3-5 concepts
    recommended: str

# 9. Content Calendar
class CalendarEntry(BaseModel):
    day: str
    channel: str
    content_type: str
    topic: str
    caption_idea: str
    hashtags: List[str] = []
    best_time: str

class ContentCalendarInput(BaseAgentInput):
    agent_id: str = "content_calendar"
    duration_weeks: int = 4
    channels: List[str]                     # ["instagram", "linkedin", "email", "blog"]
    posting_frequency: Dict[str, int] = {}  # {"instagram": 5, "blog": 2} per week
    campaign_theme: Optional[str] = None
    start_date: Optional[str] = None


class ContentCalendarOutput(BaseAgentOutput):
    agent_id: str = "content_calendar"

    # Growth-style structured UI fields
    title: str = Field(default="", description="Main title of the content calendar")
    sections: List[Dict[str, str]] = Field(default=[], description="Structured breakdown {heading, content}")
    recommendations: List[str] = Field(default=[], description="Key strategic recommendations")
    action_items: List[str] = Field(default=[], description="Immediate next steps")

    entries: List[CalendarEntry]
    weekly_summary: str


# --- CATEGORY 3: VISUAL DESIGN ---

# 10. Logo Designer
class LogoDesignerInput(BaseAgentInput):
    agent_id: str = "logo_designer"
    brand_name: Optional[str] = None
    styles: List[str] = []                  # ["wordmark", "icon", "combination", "abstract"]
    colors: List[str] = []                  # Hex colors to enforce
    icon_concept: Optional[str] = None
    variation_count: int = 4
    brand_description: Optional[str] = None
    usage_context: Optional[str] = None


class LogoDesignerOutput(BaseAgentOutput):
    agent_id: str = "logo_designer"
    assets: List[GeneratedAsset]            # 4-8 logo variations
    context_updates: Dict[str, Any] = {}    # Writes: logo_url

# 11. Hero Image
class HeroImageInput(BaseAgentInput):
    agent_id: str = "hero_image"
    description: str
    aspect_ratio: str = "16:9"              # "1:1", "16:9", "9:16", "4:3"
    style: str = "photorealistic"           # "illustrated", "abstract", "3d", "minimal"
    include_text: bool = False
    text_content: Optional[str] = None
    negative_prompt: Optional[str] = None
    variation_count: int = 4
    composition: Optional[str] = None


class HeroImageOutput(BaseAgentOutput):
    agent_id: str = "hero_image"
    assets: List[GeneratedAsset]

# 12. Product Photoshoot
class ProductPhotoshootInput(BaseAgentInput):
    agent_id: str = "product_photoshoot"
    product_image_url: str                  # Uploaded product photo
    product_name: Optional[str] = None
    scene: str = "studio_white"             # "lifestyle", "flat_lay", "hero", "contextual", "seasonal"
    custom_scene: Optional[str] = None
    lighting: str = "studio"
    variation_count: int = 4
    aspect_ratio: str = "1:1"
    background_style: Optional[str] = None


class ProductPhotoshootOutput(BaseAgentOutput):
    agent_id: str = "product_photoshoot"
    assets: List[GeneratedAsset]

# 13. Ad Creative Designer
class AdCreativeInput(BaseAgentInput):
    agent_id: str = "ad_creative"
    platform: str                           # "meta_feed", "google_display", "linkedin", "meta_story"
    headline: str
    body_text: Optional[str] = None
    cta: str = "Learn More"
    product_image_url: Optional[str] = None
    variation_count: int = 4
    aspect_ratio: str = "1:1"
    design_style: Optional[str] = None
    legal_text: Optional[str] = None


class AdCreativeOutput(BaseAgentOutput):
    agent_id: str = "ad_creative"
    assets: List[GeneratedAsset]
    dimension_info: str

# 14. Image Editor
class ImageEditorInput(BaseAgentInput):
    agent_id: str = "image_editor"
    source_image_url: str
    edit_instruction: str                   # "Change background to beach", "Make warmer"
    mask_area: Optional[str] = None
    variation_count: int = 4

class ImageEditorOutput(BaseAgentOutput):
    agent_id: str = "image_editor"
    assets: List[GeneratedAsset]            # Edited image
    changes_made: str

# 15. Mockup Generator
class MockupInput(BaseAgentInput):
    agent_id: str = "mockup_generator"
    design_image_url: Optional[str] = None                  # Logo or design to place (optional)
    mockup_types: List[str]                 # ["tshirt", "mug", "billboard", "phone_case", "business_card"]
    variation_count: int = 2
    background_style: Optional[str] = None
    scene_quality: str = "high"             # "draft", "high", "ultra"

class MockupOutput(BaseAgentOutput):
    agent_id: str = "mockup_generator"
    assets: List[GeneratedAsset]

# 16. Infographic Generator
class InfographicInput(BaseAgentInput):
    agent_id: str = "infographic"
    topic: str
    data_points: List[Dict[str, str]] = Field(default_factory=list)  # [{"label": "Users", "value": "10M"}]
    style: str = "modern"
    orientation: str = "portrait"           # "portrait", "landscape"
    aspect_ratio: str = "9:16"
    tone_override: Optional[str] = None

    @field_validator("data_points", mode="before")
    @classmethod
    def normalize_data_points(cls, value):
        def to_point(item: Any) -> Optional[Dict[str, str]]:
            if item is None:
                return None
            if isinstance(item, dict):
                label = str(item.get("label") or item.get("name") or item.get("key") or "").strip()
                raw_value = item.get("value")
                point_value = "" if raw_value is None else str(raw_value).strip()
                if not label and not point_value:
                    return None
                if not label:
                    label = point_value or "Data Point"
                return {"label": label, "value": point_value}

            text = str(item).strip()
            if not text:
                return None
            if ":" in text:
                label, point_value = text.split(":", 1)
                return {"label": label.strip(), "value": point_value.strip()}
            return {"label": text, "value": ""}

        if value is None:
            return []

        if isinstance(value, str):
            raw = value.strip()
            if not raw:
                return []

            # Accept JSON text from textarea/custom clients.
            if raw.startswith("[") or raw.startswith("{"):
                try:
                    parsed = json.loads(raw)
                    value = parsed
                except Exception:
                    pass

            if isinstance(value, str):
                lines = [
                    line.strip().lstrip("-* ").strip()
                    for line in raw.replace("\r", "\n").split("\n")
                    if line.strip()
                ]
                points: List[Dict[str, str]] = []
                for line in lines:
                    point = to_point(line)
                    if point:
                        points.append(point)
                return points

        if isinstance(value, dict):
            has_explicit_fields = any(key in value for key in ("label", "name", "key", "value"))
            if has_explicit_fields:
                value = [value]
            else:
                value = [{"label": str(key), "value": str(val)} for key, val in value.items()]

        if isinstance(value, list):
            points: List[Dict[str, str]] = []
            for item in value:
                point = to_point(item)
                if point:
                    points.append(point)
            return points

        point = to_point(value)
        return [point] if point else []

class InfographicOutput(BaseAgentOutput):
    agent_id: str = "infographic"
    assets: List[GeneratedAsset]
