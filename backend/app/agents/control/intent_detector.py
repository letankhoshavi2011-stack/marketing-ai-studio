from google.adk.agents import LlmAgent

from app.config import settings


def create_intent_detector_agent() -> LlmAgent:
    """Creates the intent detection agent that classifies user messages."""
    return LlmAgent(
        name="IntentDetector",
        model=settings.gemini_model,
        description="Detects user intent from chat messages and classifies them into actionable categories.",
        instruction="""You are an intent detection specialist for a marketing platform.

Analyze the user's message and classify it into exactly ONE of these intents:
- brand_naming: User wants to generate or discuss brand names
- logo_design: User wants logo concepts or visual identity
- content_creation: User wants marketing copy, social posts, or ad content
- image_generation: User wants to generate marketing images
- video_generation: User wants to generate marketing videos
- campaign_strategy: User wants a full campaign concept or strategy
- full_branding: User wants a complete branding package (name + identity + content)
- feedback: User is providing feedback on previously generated assets
- general_chat: General questions, greetings, or off-topic messages

Also determine:
- confidence: How confident you are (0.0 to 1.0)
- missing_requirements: What information is still needed before agents can work

Respond with a structured assessment in this exact format:
INTENT: <intent>
CONFIDENCE: <0.0-1.0>
MISSING: <comma-separated list of missing info, or "none">
SUMMARY: <one sentence summary of what the user wants>""",
        output_key="detected_intent",
    )
