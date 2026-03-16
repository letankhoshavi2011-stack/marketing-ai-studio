from typing import Dict, Any, List
from app.agents.base import BaseV4Agent
from app.agents.video_models import VideoScriptInput, VideoScriptOutput, VideoScene
from app.providers.gemini import GeminiProvider
from app.utils.json_repair import safe_json_parse

# Agent IDs that should auto-generate a video clip alongside the script
VIDEO_GEN_AGENT_IDS = {"ai_video_gen", "video_ad_script"}

class VideoAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: VideoScriptInput, context_str: str) -> VideoScriptOutput:
        """Generates Video specific content (Scripts, Ads, etc)."""
        is_thumbnail_idea = input_data.agent_id == "thumbnail_idea"

        # ── Load prompt (Standardized) ──
        prompt_config = await self.get_prompt_config(
            input_data=input_data,
            default_system="You are a creative director specializing in video production and viral storytelling.",
            default_user="", # Will be loaded from YAML
            variables={
                "agent_id": input_data.agent_id,
                "topic": input_data.topic,
                "platform": input_data.platform,
                "target_duration": input_data.target_duration or 30,
                "tone": input_data.tone_override or "Engaging & Authentic",
                "pacing": input_data.pacing or "Fast and energetic",
                "campaign_goal": input_data.campaign_goal or "N/A",
                "cta": input_data.cta or "N/A",
                "shot_count": input_data.shot_count,
                "creator_persona": input_data.creator_persona or "N/A",
                "chapter_count": input_data.chapter_count,
                "audience": input_data.audience or "N/A",
                "video_title": input_data.video_title or "TBD",
                "thumbnail_text": input_data.thumbnail_text or "N/A",
                "emotion": input_data.emotion or "N/A",
                "visual_angle": input_data.visual_angle or "N/A",
                "context_str": context_str
            }
        )
        
        response = await self.gemini.generate_text(
            prompt=prompt_config["user"],
            system_prompt=prompt_config["system"],
            model_tier="pro",
            response_format={"type": "json_object"},
        )
        
        try:
            data = safe_json_parse(response) or {}

            title = data.get("title") or input_data.video_title or input_data.topic or "Video Concept"
            hook = (
                data.get("hook")
                or data.get("hook_line")
                or data.get("thumbnail_text")
                or input_data.thumbnail_text
                or "Compelling hook not provided."
            )
            scenes = data.get("scenes") or []
            if not isinstance(scenes, list):
                scenes = []
            if not scenes and input_data.topic:
                # Fallback minimal scene list
                scenes = [{
                    "scene_number": 1,
                    "visual_description": input_data.topic,
                    "audio_voiceover": hook,
                    "duration_seconds": input_data.target_duration or 8
                }]

            # Build text content for card preview
            text_content = (
                f"TITLE: {title}\n\nHOOK: {hook}\n\n" +
                "\n".join(
                    [f"Scene {s.get('scene_number', i+1)}: {s.get('visual_description','')} | Audio: {s.get('audio_voiceover','')}"
                     for i, s in enumerate(scenes)]
                )
            )

            # ── Auto-generate video for specific agents ──
            assets = []
            if input_data.agent_id in VIDEO_GEN_AGENT_IDS or getattr(input_data, "generate_video", False):
                # Build a rich prompt from the hook + scene descriptions
                scene_snippets = [s.get("visual_description", "") for s in scenes[:3]]
                video_prompt = f"{title}. {hook}. " + " ".join(scene_snippets)
                vid_assets = await self.generate_video(
                    prompt=video_prompt[:500],
                    duration_seconds=int(input_data.target_duration or 8),
                    aspect_ratio=getattr(input_data, "video_aspect_ratio", "16:9"),
                    context=context_str,
                )
                assets.extend(vid_assets)

            # ── Also generate images if requested (always on for thumbnail ideas) ──
            should_generate_images = bool(getattr(input_data, "generate_image", False)) or is_thumbnail_idea
            if should_generate_images:
                image_count = max(1, min(int(getattr(input_data, "image_count", 1) or 1), 4))
                aspect_ratio = "16:9" if is_thumbnail_idea else getattr(input_data, "image_aspect_ratio", "16:9")

                concept_prompts: List[str] = []
                if is_thumbnail_idea:
                    concepts = data.get("thumbnail_concepts") or []
                    if isinstance(concepts, list):
                        for c in concepts:
                            if not isinstance(c, dict):
                                continue
                            prompt = (
                                c.get("ai_image_prompt")
                                or c.get("image_prompt")
                                or c.get("visual_description")
                                or c.get("concept_name")
                            )
                            if prompt:
                                concept_prompts.append(str(prompt).strip())

                if concept_prompts:
                    for prompt in concept_prompts[:image_count]:
                        img_assets = await self.generate_images(
                            prompt=prompt[:500],
                            count=1,
                            aspect_ratio=aspect_ratio,
                            context=context_str,
                        )
                        assets.extend(img_assets)
                else:
                    thumbnail_prompt = (
                        f"Cinematic thumbnail for: {title}. "
                        f"Topic: {input_data.topic}. "
                        f"Hook: {hook}. "
                        f"Emotion: {input_data.emotion or 'high contrast, curiosity'}."
                    )
                    img_assets = await self.generate_images(
                        prompt=thumbnail_prompt[:500],
                        count=image_count,
                        aspect_ratio=aspect_ratio,
                        context=context_str,
                    )
                    assets.extend(img_assets)

            normalized_data = dict(data) if isinstance(data, dict) else {}
            normalized_data.setdefault("title", title)
            normalized_data.setdefault("hook", hook)
            normalized_data.setdefault("scenes", scenes)
            normalized_data.setdefault("cta", data.get("cta") or input_data.cta or "Learn more")

            return VideoScriptOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=text_content,
                assets=assets,
                **normalized_data
            )
        except Exception as e:
            return VideoScriptOutput(
                agent_id=input_data.agent_id,
                success=True,
                text_content=response,
                title="Generated Video Script",
                hook="See content",
                scenes=[],
                cta="See content"
            )
