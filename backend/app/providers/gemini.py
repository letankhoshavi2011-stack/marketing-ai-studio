"""Google Gemini client wrapper — text generation + multimodal."""

import io
import logging
from typing import Any

from google import genai
from google.genai import types

from app.core.config import settings
from app.services.analytics import analytics_service
from app.core.context_vars import (
    agent_name_ctx,
    campaign_id_ctx,
    gemini_attachments_ctx,
    user_id_ctx,
    workspace_id_ctx,
)

logger = logging.getLogger(__name__)

_client: genai.Client | None = None


def _build_contents(client: genai.Client, prompt: str) -> tuple[list[Any] | str, list[Any], str]:
    attachments = gemini_attachments_ctx.get() or []
    if not attachments:
        return prompt, [], "none"

    contents: list[Any] = []
    uploaded_files: list[Any] = []
    used_file_api = False
    for attachment in attachments:
        try:
            data = attachment.get("data")
            filename = attachment.get("filename") or "attachment"
            mime_type = attachment.get("mime_type") or "application/octet-stream"
            if not data:
                continue

            file_obj = io.BytesIO(data)
            setattr(file_obj, "name", filename)
            uploaded_file = client.files.upload(
                file=file_obj,
                config=types.UploadFileConfig(
                    mime_type=mime_type,
                    display_name=filename,
                ),
            )
            contents.append(uploaded_file)
            uploaded_files.append(uploaded_file)
            used_file_api = True
            logger.info(
                "GEMINI_FILE_UPLOAD filename=%s mime_type=%s uploaded_name=%s",
                filename,
                mime_type,
                getattr(uploaded_file, "name", "unknown"),
            )
        except Exception as exc:
            logger.warning(
                "Gemini file upload failed for %s, falling back to inline bytes: %s",
                attachment.get("filename"),
                exc,
            )
            data = attachment.get("data")
            mime_type = attachment.get("mime_type") or "application/octet-stream"
            if data:
                contents.append(types.Part.from_bytes(data=data, mime_type=mime_type))
    contents.append(prompt)
    return contents, uploaded_files, "file_api" if used_file_api else "inline_fallback"


def _cleanup_uploaded_files(client: genai.Client, uploaded_files: list[Any]) -> None:
    for uploaded_file in uploaded_files:
        try:
            file_name = getattr(uploaded_file, "name", None)
            if file_name:
                client.files.delete(name=file_name)
                logger.info("GEMINI_FILE_DELETE uploaded_name=%s", file_name)
        except Exception as exc:
            logger.warning(
                "Failed to delete Gemini uploaded file %s: %s",
                getattr(uploaded_file, "name", "unknown"),
                exc,
            )


def _attachment_metadata() -> tuple[int, list[str]]:
    attachments = gemini_attachments_ctx.get() or []
    filenames = [str(attachment.get("filename") or "unnamed") for attachment in attachments]
    return len(attachments), filenames


def _get_client() -> genai.Client:
    """Get or initialize the Gemini client."""
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


class GeminiProvider:
    """High-level wrapper used by agents. Returns text strings directly."""

    def _resolve_model(self, model_tier: str | None = None) -> str:
        return settings.model_text

    async def generate_text(
        self,
        prompt: str,
        system_prompt: str | None = None,
        model_tier: str = "pro",
        temperature: float = 0.7,
        max_output_tokens: int = 8192,
        response_mime_type: str | None = "application/json",
        response_format: dict | None = None,
    ) -> str:
        """Generate text and return the raw string (not a dict)."""
        if response_format and response_format.get("type") == "json_object":
            response_mime_type = "application/json"

        result = await generate_text(
            prompt=prompt,
            model=self._resolve_model(model_tier),
            system_instruction=system_prompt,
            temperature=temperature,
            max_output_tokens=max_output_tokens,
            response_mime_type=response_mime_type,
        )
        return result["text"]


async def generate_text(
    prompt: str,
    model: str | None = None,
    system_instruction: str | None = None,
    temperature: float = 0.7,
    max_output_tokens: int = 8192,
    response_mime_type: str | None = None,
    user_id: str | None = None,
    workspace_id: str | None = None,
    campaign_id: str | None = None,
    agent_name: str | None = None,
) -> dict[str, Any]:
    """Generate text using Gemini.
    
    Returns:
        {"text": "...", "tokens_input": int, "tokens_output": int, "model": str}
    """
    client = _get_client()
    model = model or settings.model_text

    # Recover context
    user_id = user_id or user_id_ctx.get() or "system"
    workspace_id = workspace_id or workspace_id_ctx.get()
    campaign_id = campaign_id or campaign_id_ctx.get()
    agent_name = agent_name or agent_name_ctx.get() or "unknown"
    
    config = types.GenerateContentConfig(
        temperature=temperature,
        max_output_tokens=max_output_tokens,
    )
    if system_instruction:
        config.system_instruction = system_instruction
    if response_mime_type:
        config.response_mime_type = response_mime_type

    attachment_count, attachment_names = _attachment_metadata()
    contents, uploaded_files, attachment_mode = _build_contents(client, prompt)
    logger.info(
        "GEMINI_CALL_START type=text model=%s agent=%s workspace=%s campaign=%s attachments=%d attachment_names=%s attachment_mode=%s prompt_chars=%d response_mime=%s",
        model,
        agent_name,
        workspace_id,
        campaign_id,
        attachment_count,
        attachment_names,
        attachment_mode,
        len(prompt or ""),
        response_mime_type or "default",
    )

    # --- LOG FULL REQUEST ---
    logger.info("\n" + "="*50 + "\n--- FULL SYSTEM PROMPT ---\n" + (system_instruction or "None") + "\n" + "="*50)
    logger.info("\n" + "="*50 + "\n--- FULL USER PROMPT ---\n" + prompt + "\n" + "="*50)

    try:
        response = client.models.generate_content(
            model=model,
            contents=contents,
            config=config,
        )
    except Exception:
        logger.exception(
            "GEMINI_CALL_ERROR type=text model=%s agent=%s workspace=%s campaign=%s attachments=%d attachment_names=%s attachment_mode=%s",
            model,
            agent_name,
            workspace_id,
            campaign_id,
            attachment_count,
            attachment_names,
            attachment_mode,
        )
        raise
    finally:
        _cleanup_uploaded_files(client, uploaded_files)

    text = response.text or ""
    
    # --- LOG FULL RESPONSE ---
    logger.info("\n" + "="*50 + "\n--- FULL LLM RESPONSE ---\n" + text + "\n" + "="*50)

    usage = response.usage_metadata
    tokens_in = usage.prompt_token_count if usage else 0
    tokens_out = usage.candidates_token_count if usage else 0

    # Log analytics
    await analytics_service.log_usage(
        user_id=user_id,
        workspace_id=workspace_id,
        campaign_id=campaign_id,
        model_name=model,
        tokens_input=tokens_in,
        tokens_output=tokens_out,
        agent_name=agent_name,
        request_type="text",
        prompt=prompt,
        response=text,
    )

    logger.info(
        "GEMINI_CALL_DONE type=text model=%s agent=%s workspace=%s campaign=%s attachments=%d attachment_mode=%s tokens_in=%d tokens_out=%d text_chars=%d",
        model,
        agent_name,
        workspace_id,
        campaign_id,
        attachment_count,
        attachment_mode,
        tokens_in,
        tokens_out,
        len(text),
    )
    return {
        "text": text,
        "tokens_input": tokens_in,
        "tokens_output": tokens_out,
        "model": model,
    }


async def generate_with_image(
    prompt: str,
    image_data: bytes | None = None,
    image_mime_type: str = "image/png",
    model: str | None = None,
    system_instruction: str | None = None,
    user_id: str | None = None,
    workspace_id: str | None = None,
    campaign_id: str | None = None,
    agent_name: str | None = None,
) -> dict[str, Any]:
    """Multimodal generation — text + optional image input."""
    client = _get_client()
    model = model or settings.model_text

    # Recover context
    user_id = user_id or user_id_ctx.get() or "system"
    workspace_id = workspace_id or workspace_id_ctx.get()
    campaign_id = campaign_id or campaign_id_ctx.get()
    agent_name = agent_name or agent_name_ctx.get() or "unknown"
    
    contents, uploaded_files, attachment_mode = _build_contents(client, "")
    if contents == "":
        contents = []
    elif isinstance(contents, str):
        contents = [contents]
    if contents and contents[-1] == "":
        contents = contents[:-1]

    if image_data:
        contents.append(types.Part.from_bytes(data=image_data, mime_type=image_mime_type))
    contents.append(prompt)

    config = types.GenerateContentConfig(
        temperature=0.7,
        max_output_tokens=8192,
    )
    if system_instruction:
        config.system_instruction = system_instruction

    attachment_count, attachment_names = _attachment_metadata()
    logger.info(
        "GEMINI_CALL_START type=vision model=%s agent=%s workspace=%s campaign=%s attachments=%d attachment_names=%s attachment_mode=%s inline_image=%s prompt_chars=%d",
        model,
        agent_name,
        workspace_id,
        campaign_id,
        attachment_count,
        attachment_names,
        attachment_mode,
        bool(image_data),
        len(prompt or ""),
    )

    # --- LOG FULL REQUEST ---
    logger.info("\n" + "="*50 + "\n--- FULL SYSTEM PROMPT ---\n" + (system_instruction or "None") + "\n" + "="*50)
    logger.info("\n" + "="*50 + "\n--- FULL USER PROMPT ---\n" + prompt + "\n" + "="*50)

    try:
        response = client.models.generate_content(
            model=model,
            contents=contents,
            config=config,
        )
    except Exception:
        logger.exception(
            "GEMINI_CALL_ERROR type=vision model=%s agent=%s workspace=%s campaign=%s attachments=%d attachment_names=%s attachment_mode=%s inline_image=%s",
            model,
            agent_name,
            workspace_id,
            campaign_id,
            attachment_count,
            attachment_names,
            attachment_mode,
            bool(image_data),
        )
        raise
    finally:
        _cleanup_uploaded_files(client, uploaded_files)

    text = response.text or ""

    # --- LOG FULL RESPONSE ---
    logger.info("\n" + "="*50 + "\n--- FULL LLM RESPONSE ---\n" + text + "\n" + "="*50)

    usage = response.usage_metadata
    tokens_in = usage.prompt_token_count if usage else 0
    tokens_out = usage.candidates_token_count if usage else 0

    # Log analytics
    await analytics_service.log_usage(
        user_id=user_id,
        workspace_id=workspace_id,
        campaign_id=campaign_id,
        model_name=model,
        tokens_input=tokens_in,
        tokens_output=tokens_out,
        agent_name=agent_name,
        request_type="vision",
        prompt=prompt,
        response=text,
    )

    logger.info(
        "GEMINI_CALL_DONE type=vision model=%s agent=%s workspace=%s campaign=%s attachments=%d attachment_mode=%s tokens_in=%d tokens_out=%d text_chars=%d",
        model,
        agent_name,
        workspace_id,
        campaign_id,
        attachment_count,
        attachment_mode,
        tokens_in,
        tokens_out,
        len(text),
    )

    return {
        "text": text,
        "tokens_input": tokens_in,
        "tokens_output": tokens_out,
        "model": model,
    }
