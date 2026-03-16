"""Pydantic I/O models for Growth, CRO, and Strategy agents."""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from app.models.base import BaseAgentInput, BaseAgentOutput


# --- Generic Growth / CRO / Strategy Input ---

class GrowthInput(BaseAgentInput):
    agent_id: Literal[
        # CRO
        "ab_test_setup", "form_cro", "onboarding_cro", "page_cro",
        "paywall_upgrade_cro", "popup_cro", "signup_flow_cro",
        # Retention
        "churn_prevention",
        # Strategy
        "analytics_tracking", "content_strategy", "free_tool_strategy",
        "launch_strategy", "marketing_ideas", "marketing_psychology",
        "pricing_strategy", "product_marketing_context",
        # SEO / Web
        "ai_seo", "competitor_alternatives", "programmatic_seo",
        "schema_markup", "seo_audit", "site_architecture",
        # Sales / Email / RevOps
        "cold_email", "email_sequence", "referral_program",
        "revops", "sales_enablement",
        # Copy & Content
        "copy_editing", "copywriting", "paid_ads", "social_content",
    ]
    topic: str
    additional_context: Optional[str] = None
    target_audience: Optional[str] = None
    current_metrics: Optional[str] = None
    url_to_analyze: Optional[str] = None
    # pricing_strategy-specific optional fields
    pricing_model: Optional[str] = None
    competitor_pricing: Optional[str] = None
    # launch_strategy
    launch_date: Optional[str] = None
    channels: Optional[List[str]] = None
    # cold_email
    email_count: Optional[int] = None
    # email_sequence
    sequence_length: Optional[int] = None
    trigger_event: Optional[str] = None
    # ab_test_setup
    test_type: Optional[str] = None
    # marketing_psychology
    psychology_focus: Optional[str] = None
    # content_strategy
    content_goals: Optional[List[str]] = None
    # competitor_alternatives
    competitor_names: Optional[List[str]] = None
    # schema_markup
    schema_types: Optional[List[str]] = None
    # referral_program
    incentive_type: Optional[str] = None
    pricing_objective: Optional[str] = None
    margin_target: Optional[float | str] = None
    packaging_constraints: Optional[str] = None
    launch_type: Optional[str] = None
    success_metric: Optional[str] = None
    sender_identity: Optional[str] = None
    cta_type: Optional[str] = None
    personalization_inputs: Optional[str | List[str]] = None
    send_spacing_days: Optional[int] = None
    call_to_action: Optional[str] = None
    primary_conversion_event: Optional[str] = None
    traffic_source_mix: Optional[str] = None
    primary_metric: Optional[str] = None
    secondary_metrics: Optional[List[str]] = None
    traffic_split: Optional[str] = None
    ethical_constraints: Optional[str | List[str]] = None
    trust_risks: Optional[str | List[str]] = None
    team_capacity: Optional[str] = None
    repurposing_targets: Optional[str | List[str]] = None
    feature_matrix: Optional[str | List[str]] = None
    comparison_keywords: Optional[List[str]] = None
    competitor_urls: Optional[List[str]] = None
    seed_keywords: Optional[List[str]] = None
    site_type: Optional[str] = None
    page_type: Optional[str] = None
    existing_schema_json: Optional[str] = None
    implementation_language: Optional[str] = None
    reward_budget: Optional[str | float | int] = None
    referral_cap: Optional[int] = None
    program_goal: Optional[str] = None



class EmailContent(BaseModel):
    subject: str = ""
    opening_line: Optional[str] = None
    body: str = ""
    cta: Optional[str] = None
    ps_line: Optional[str] = None
    step: int = 1
    send_day: int = 1
    personalization_tips: List[str] = []

class GrowthOutput(BaseAgentOutput):
    title: str = ""
    launch_type: Optional[str] = None
    sections: List[Dict[str, str]] = []   # [{"heading": "...", "content": "..."}]
    recommendations: List[str] = []
    action_items: List[str] = []
    emails: List[EmailContent] = []
