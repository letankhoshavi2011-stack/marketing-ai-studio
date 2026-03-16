import abc
from typing import Any, Dict, List, Optional
from datetime import datetime
from app.models.base import BaseAgentInput, BaseAgentOutput, ScrapedURL, KBDocument, GeneratedAsset
from app.models.context import WorkspaceContext

class BaseV4Agent(abc.ABC):
    """
    Base class for all v4 agents.
    Handles shared logic: Scraping, KB processing, Context Injection,
    and optional Image / Video generation.

    Subclasses can either:
    - Override `generate()` directly (brand/strategy/visual agents do this)
    - Override `_execute_internal(input_data, context_str)` and let the
      default `generate()` handle context preparation (social/video/content agents do this)
    """
    agent_id: str = ""
    agent_name: str = ""
    description: str = ""
    category: str = ""

    def __init__(self):
        pass

    async def _load_custom_prompt(self, prompt_id: str) -> Optional[Dict[str, Any]]:
        """Fetches a custom prompt from the library by ID."""
        if not prompt_id:
            return None
        try:
            from app.core.database import get_database
            db = get_database()
            custom_prompt = await db.prompt_library.find_one({"prompt_id": prompt_id, "is_active": True})
            return custom_prompt
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Failed to load custom prompt {prompt_id}: {e}")
            return None

    def _load_default_prompt(self, agent_id: str = "") -> Optional[str]:
        """Loads the default YAML prompt for this agent."""
        from app.prompts import PromptLoader
        aid = agent_id or self.agent_id
        return PromptLoader.get_agent_prompt(aid)

    async def get_prompt_config(
        self, 
        input_data: BaseAgentInput, 
        default_system: str, 
        default_user: str,
        variables: Optional[Dict[str, Any]] = None
    ) -> Dict[str, str]:
        """
        Unified prompt loader.
        1. Checks for Custom Prompt Library override (prompt_id).
        2. Falls back to YAML file (using agent_id).
        3. Falls back to hardcoded defaults.
        """
        prompt_id = getattr(input_data, "prompt_id", None) or ""
        custom = await self._load_custom_prompt(prompt_id)
        
        system_prompt = default_system
        user_prompt = default_user

        if custom:
            # Override with custom prompt from DB
            system_prompt = custom.get("system_prompt", system_prompt)
            user_prompt = custom.get("prompt_template", user_prompt)
        else:
            # Check for YAML override
            yaml_prompt = self._load_default_prompt(input_data.agent_id)
            if yaml_prompt:
                # If the YAML prompt is just the user instruction, we use default_system
                user_prompt = yaml_prompt

        # Handle variable substitution if we have a template
        if variables and "{" in user_prompt:
            try:
                user_prompt = user_prompt.format(**variables)
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(f"Prompt formatting failed: {e}")

        return {
            "system": system_prompt + self.get_language_instruction(input_data),
            "user": user_prompt
        }

    # ── Media generation helpers (available to ALL agents) ──────
    async def generate_images(
        self,
        prompt: str,
        count: int = 1,
        aspect_ratio: str = "1:1",
        style: Optional[str] = None,
        context: Optional[str] = None,
    ) -> List[GeneratedAsset]:
        """Generate images via llm_router (unified router)."""
        from app.core.llm import llm_router
        full_prompt = prompt if not context else f"{prompt}\n\n### Brand, KB, and Brief Context\n{context}"
        return await llm_router.generate_image(
            prompt=full_prompt,
            count=count,
            aspect_ratio=aspect_ratio,
            style=style,
            agent_name=self.agent_name,
        )

    async def generate_video(
        self,
        prompt: str,
        aspect_ratio: str = "16:9",
        duration_seconds: int = 8,
        style: Optional[str] = None,
        context: Optional[str] = None,
    ) -> List[GeneratedAsset]:
        """Generate video via llm_router (unified router)."""
        from app.core.llm import llm_router
        full_prompt = prompt if not context else f"{prompt}\n\n### Brand, KB, and Brief Context\n{context}"
        return await llm_router.generate_video(
            prompt=full_prompt,
            aspect_ratio=aspect_ratio,
            duration_seconds=duration_seconds,
            style=style,
            agent_name=self.agent_name,
        )

    async def generate_media_if_requested(
        self,
        input_data: BaseAgentInput,
        text_content: str,
    ) -> List[GeneratedAsset]:
        """
        Check input for generate_image / generate_video flags.
        If set, auto-generate media using the agent output as prompt context.
        This is called by agents that want to offer optional media alongside text.
        """
        assets: List[GeneratedAsset] = []
        media_prompt = getattr(input_data, "media_prompt", None) or text_content[:500]

        if getattr(input_data, "generate_image", False):
            img_assets = await self.generate_images(
                prompt=media_prompt,
                count=getattr(input_data, "image_count", 1),
                aspect_ratio=getattr(input_data, "image_aspect_ratio", "1:1"),
            )
            assets.extend(img_assets)

        if getattr(input_data, "generate_video", False):
            vid_assets = await self.generate_video(
                prompt=media_prompt,
                duration_seconds=getattr(input_data, "video_duration", 8),
                aspect_ratio=getattr(input_data, "video_aspect_ratio", "16:9"),
            )
            assets.extend(vid_assets)

        return assets

    # ── Platform aspect-ratio map for social media ──────
    SOCIAL_ASPECT_RATIOS = {
        "Instagram":  {"image": "1:1",  "video": "9:16"},
        "Facebook":   {"image": "16:9", "video": "16:9"},
        "LinkedIn":   {"image": "16:9", "video": "16:9"},
        "Twitter":    {"image": "16:9", "video": "16:9"},
        "Pinterest":  {"image": "9:16", "video": "9:16"},
        "TikTok":     {"image": "9:16", "video": "9:16"},
    }

    async def auto_generate_social_media(
        self,
        posts: list,
        generate_images: bool = True,
        generate_video: bool = True,
        images_per_post: int = 2,
    ) -> list:
        """
        Generate images and video for a list of SocialPost objects.
        - Up to `images_per_post` images per post (capped at 3)
        - 1 video for first post only (if generate_video=True)
        Falls back gracefully if generation fails.
        """
        import logging
        logger = logging.getLogger(__name__)

        images_per_post = min(images_per_post, 3)

        for idx, post in enumerate(posts):
            post.post_index = idx
            platform = post.platform or "Instagram"
            ratios = self.SOCIAL_ASPECT_RATIOS.get(platform, {"image": "1:1", "video": "16:9"})

            # ── Images ──
            if generate_images:
                prompts = post.image_prompts[:images_per_post] if post.image_prompts else []
                for img_prompt in prompts:
                    try:
                        img_assets = await self.generate_images(
                            prompt=img_prompt,
                            count=1,
                            aspect_ratio=ratios["image"],
                        )
                        post.assets.extend(img_assets)
                    except Exception as e:
                        logger.warning(f"Image gen failed for post {idx}: {e}")

            # ── Video (first post only) ──
            if generate_video and idx == 0:
                vid_prompts = post.video_prompts[:1] if post.video_prompts else []
                for vid_prompt in vid_prompts:
                    try:
                        vid_assets = await self.generate_video(
                            prompt=vid_prompt,
                            aspect_ratio=ratios["video"],
                            duration_seconds=8,
                        )
                        post.assets.extend(vid_assets)
                    except Exception as e:
                        logger.warning(f"Video gen failed for post {idx}: {e}")

        return posts

    def get_language_instruction(self, input_data: BaseAgentInput) -> str:
        """Returns a language instruction string to append to system prompts when not English."""
        lang = getattr(input_data, "target_language", "English") or "English"
        if lang.lower() != "english":
            return f"\n\nIMPORTANT: Respond entirely in {lang}. All titles, headings, content, recommendations, and action items must be in {lang}."
        return ""

    async def generate(self, input_data: BaseAgentInput) -> BaseAgentOutput:
        """Main generation entry point. Default impl calls _execute_internal."""
        context_str = await self.prepare_context(input_data)
        return await self._execute_internal(input_data, context_str)

    async def _execute_internal(self, input_data: BaseAgentInput, context_str: str) -> BaseAgentOutput:
        """Override this in agents that use the GeminiProvider pattern."""
        raise NotImplementedError(f"{self.__class__.__name__} must implement generate() or _execute_internal()")

    async def prepare_context(self, input_data: BaseAgentInput) -> str:
        """
        Gathers all context sources into a unified string for the LLM.
        - Workspace Context (Brand, Voice, etc.)
        - Marketing Brief (shared UI fields)
        - Scraped URLs
        - Knowledge Base Docs
        - Selected Previous Outputs
        - Additional Instructions
        """
        context_parts = []

        # 1. Workspace Context
        if input_data.workspace_context:
            wc = input_data.workspace_context
            context_parts.append("### WORKSPACE CONTEXT (Brand Standards)")
            if wc.get("brand_name"): context_parts.append(f"Brand Name: {wc['brand_name']}")
            if wc.get("tagline"): context_parts.append(f"Tagline: {wc['tagline']}")
            if wc.get("tagline_idea") and wc.get("tagline_idea") != wc.get("tagline"):
                context_parts.append(f"Tagline Idea: {wc['tagline_idea']}")
            if wc.get("industry"): context_parts.append(f"Industry: {wc['industry']}")
            if wc.get("visual_style"): context_parts.append(f"Visual Style: {wc['visual_style']}")
            if wc.get("imagery_direction"): context_parts.append(f"Imagery Direction: {wc['imagery_direction']}")
            if wc.get("mood"): context_parts.append(f"Mood: {wc['mood']}")
            if wc.get("brand_personality"): context_parts.append(f"Brand Personality: {wc['brand_personality']}")
            if wc.get("values"): context_parts.append(f"Values: {', '.join([str(v) for v in wc.get('values', []) if v])}")
            if wc.get("tone_keywords"): context_parts.append(f"Tone: {', '.join(wc['tone_keywords'])}")
            if wc.get("dos"):
                dos = [str(x) for x in wc.get("dos", []) if x]
                if dos:
                    context_parts.append("Do:")
                    context_parts.extend([f"- {x}" for x in dos[:10]])
            if wc.get("donts"):
                donts = [str(x) for x in wc.get("donts", []) if x]
                if donts:
                    context_parts.append("Don't:")
                    context_parts.extend([f"- {x}" for x in donts[:10]])
            if wc.get("voice_rules"):
                rules = [str(r) for r in wc.get("voice_rules", []) if r]
                if rules:
                    context_parts.append("Voice Rules:")
                    context_parts.extend([f"- {r}" for r in rules[:12]])
            if wc.get("colors"):
                try:
                    colors = wc.get("colors") or []
                    if isinstance(colors, list) and colors:
                        preview = []
                        for c in colors[:6]:
                            if isinstance(c, dict):
                                name = c.get("name") or "Color"
                                hx = c.get("hex") or ""
                                usage = c.get("usage") or ""
                                preview.append(f"{name} {hx} ({usage})".strip())
                            else:
                                preview.append(str(c))
                        context_parts.append(f"Colors: {', '.join(preview)}")
                except Exception:
                    pass
            if wc.get("fonts"):
                try:
                    fonts = wc.get("fonts") or {}
                    if isinstance(fonts, dict) and (fonts.get("heading") or fonts.get("body")):
                        context_parts.append(f"Fonts: heading={fonts.get('heading','')} body={fonts.get('body','')}".strip())
                except Exception:
                    pass
            if wc.get("target_audience"):
                try:
                    personas = wc.get("target_audience") or []
                    if isinstance(personas, list) and personas:
                        context_parts.append("Target Personas (summary):")
                        for p in personas[:4]:
                            if isinstance(p, dict):
                                name = p.get("name") or "Persona"
                                pains = p.get("pain_points") or []
                                chans = p.get("preferred_channels") or []
                                line = f"- {name}"
                                if pains:
                                    line += f" | pains: {', '.join([str(x) for x in pains[:3]])}"
                                if chans:
                                    line += f" | channels: {', '.join([str(x) for x in chans[:4]])}"
                                context_parts.append(line)
                            else:
                                context_parts.append(f"- {p}")
                except Exception:
                    pass
            context_parts.append("")

        # 1b. Marketing brief (shared UI fields)
        brief_lines = []
        if getattr(input_data, "brief_primary_goal", None):
            brief_lines.append(f"Primary Goal: {input_data.brief_primary_goal}")
        if getattr(input_data, "brief_product_or_service", None):
            brief_lines.append(f"Product/Service: {input_data.brief_product_or_service}")
        if getattr(input_data, "brief_offer", None):
            brief_lines.append(f"Offer: {input_data.brief_offer}")
        if getattr(input_data, "brief_call_to_action", None):
            brief_lines.append(f"Call To Action: {input_data.brief_call_to_action}")
        if getattr(input_data, "brief_target_persona", None):
            brief_lines.append(f"Target Persona: {input_data.brief_target_persona}")
        if getattr(input_data, "brief_funnel_stage", None):
            brief_lines.append(f"Funnel Stage: {input_data.brief_funnel_stage}")
        key_points = getattr(input_data, "brief_key_points", None) or []
        if isinstance(key_points, list) and key_points:
            brief_lines.append("Key Points:")
            brief_lines.extend([f"- {str(x)}" for x in key_points[:12] if x])
        proof_points = getattr(input_data, "brief_proof_points", None) or []
        if isinstance(proof_points, list) and proof_points:
            brief_lines.append("Proof Points:")
            brief_lines.extend([f"- {str(x)}" for x in proof_points[:12] if x])
        constraints = getattr(input_data, "brief_constraints", None) or []
        if isinstance(constraints, list) and constraints:
            brief_lines.append("Constraints:")
            brief_lines.extend([f"- {str(x)}" for x in constraints[:12] if x])
        if brief_lines:
            context_parts.append("### MARKETING BRIEF (User-Provided)")
            context_parts.extend(brief_lines)
            context_parts.append("")

        # 2. Scraped Content
        if input_data.scraped_content:
            context_parts.append("### SCRAPED WEBSITE CONTEXT")
            for item in input_data.scraped_content:
                context_parts.append(f"URL: {item.url}")
                context_parts.append(f"Content: {item.extracted_text[:3000]}...") # Cap per URL
            context_parts.append("")

        # 3. Knowledge Base (cap per doc at 5000 chars)
        if input_data.kb_documents:
            context_parts.append("### KNOWLEDGE BASE DOCUMENTS")
            for doc in input_data.kb_documents:
                context_parts.append(f"File: {doc.filename}")
                content = doc.content[:5000]
                if len(doc.content) > 5000:
                    content += "... [truncated]"
                context_parts.append(f"Content: {content}")
            context_parts.append("")

        # 4. Previous Agent Outputs
        if input_data.selected_agent_outputs:
            context_parts.append("### PREVIOUS AGENT OUTPUTS")
            for ref in input_data.selected_agent_outputs:
                context_parts.append(f"From Agent: {ref.agent_name}")
                context_parts.append(f"Content: {ref.preview}")
            context_parts.append("")

        # 5. Additional Instructions
        if input_data.additional_instructions:
            context_parts.append("### ADDITIONAL USER INSTRUCTIONS")
            context_parts.append(input_data.additional_instructions)
            context_parts.append("")

        return "\n".join(context_parts)

