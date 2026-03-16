from typing import List
from app.agents.base import BaseV4Agent
from app.agents.visual_strategy_models import ImageEditorInput, ImageEditorOutput
from app.core.llm import llm_router
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

class ImageEditorAgent(BaseV4Agent):
    agent_id = "image_editor"
    agent_name = "Image Editor (AI)"
    description = "Applies sophisticated AI edits to existing images."
    category = "visual"

    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def generate(self, input_data: ImageEditorInput) -> ImageEditorOutput:
        context_str = await self.prepare_context(input_data)
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="Return ONLY JSON.",
            default_user="",
            variables={
                "edit_instruction": input_data.edit_instruction,
                "source_image_url": input_data.source_image_url,
                "context_str": context_str,
            }
        )

        refined_prompt = input_data.edit_instruction
        transformation_steps: List[str] = []
        negative_prompt = ""

        try:
            refine_response = await self.gemini.generate_text(
                prompt=prompt_config["user"],
                system_prompt=prompt_config["system"],
                model_tier="standard"
            )
            refined = safe_json_parse(refine_response) or {}
            refined_prompt = refined.get("ai_edit_prompt") or input_data.edit_instruction
            transformation_steps = refined.get("transformation_steps", []) if isinstance(refined.get("transformation_steps", []), list) else []
            negative_prompt = str(refined.get("negative_prompt") or "").strip()
        except Exception:
            pass

        composed_prompt = (
            f"{refined_prompt}\n\n"
            f"Source image URL: {input_data.source_image_url}\n"
            f"Original edit request: {input_data.edit_instruction}"
        )
        if negative_prompt:
            composed_prompt += f"\nNegative prompt: {negative_prompt}"

        assets = await llm_router.generate_image(
            prompt=composed_prompt,
            count=1,
            agent_name=self.agent_name
        )

        return ImageEditorOutput(
            agent_id=self.agent_id,
            assets=assets,
            changes_made=input_data.edit_instruction,
            text_content=(
                "### Edit Summary\n"
                f"Source: {input_data.source_image_url}\n\n"
                f"Applied edit: *{input_data.edit_instruction}*\n\n"
                + ("\n".join([f"- {s}" for s in transformation_steps]) if transformation_steps else "")
            ).strip()
        )
