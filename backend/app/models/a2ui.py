from pydantic import BaseModel
from typing import Optional, List, Any
from enum import Enum

class A2UIFieldType(str, Enum):
    TEXT_INPUT = "text_input"
    TEXT_AREA = "text_area"
    SELECT = "select"
    MULTI_SELECT = "multi_select"
    COLOR_PICKER = "color_picker"
    FILE_UPLOAD = "file_upload"
    URL_INPUT = "url_input"
    SLIDER = "slider"
    TOGGLE = "toggle"
    RADIO_GROUP = "radio_group"
    CHECKBOX_GROUP = "checkbox_group"
    IMAGE_CAROUSEL = "image_carousel"
    TEMPLATE_SELECTOR = "template_selector"
    NUMBER_INPUT = "number_input"

class A2UIField(BaseModel):
    name: str                           # Field key
    type: A2UIFieldType
    label: str                          # Display label
    required: bool = False
    default_value: Optional[Any] = None
    placeholder: Optional[str] = None
    options: Optional[List[str]] = None  # For select/multi_select/radio/checkbox
    min_value: Optional[float] = None   # For slider/number
    max_value: Optional[float] = None
    accept: Optional[str] = None        # For file_upload: "image/*", ".pdf,.docx"
    auto_filled: bool = False           # True if value came from CampaignContext
    auto_fill_source: Optional[str] = None  # Which context field it came from
    help_text: Optional[str] = None

class A2UIFormSpec(BaseModel):
    """Specification for a dynamic form that the frontend renders."""
    title: str
    description: Optional[str] = None
    fields: List[A2UIField]
    submit_label: str = "Generate"
