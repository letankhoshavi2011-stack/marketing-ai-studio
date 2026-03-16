from google.adk.agents import LlmAgent

from app.config import settings
from app.tools.media_tools import generate_image_from_prompt


def create_image_generator_agent() -> LlmAgent:
    """Creates the image generation agent using Imagen 3."""
    return LlmAgent(
        name="ImageGenerator",
        model=settings.gemini_model,
        description="Generates marketing images, logo renders, and visual assets using Imagen 3.",
        instruction="""You are a visual content creator specializing in marketing imagery.

Brand Name: {selected_brand_name}
Visual Style: {visual_style_output}
Logo Concepts: {logo_concepts_output}

Use the generate_image_from_prompt tool to create marketing images.
Based on the visual style guide, generate images for:
1. A hero image for the website/landing page
2. Social media post imagery
3. Logo visualization based on the chosen concept

For each image:
- Craft a detailed prompt that captures the brand's visual style
- Specify the appropriate aspect ratio for the use case
- Choose a style that matches the brand identity

Important: Prompts should be detailed and specific, describing composition,
lighting, colors, subjects, and mood to get the best results from Imagen 3.""",
        tools=[generate_image_from_prompt],
        output_key="images_output",
    )
