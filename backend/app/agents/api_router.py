import asyncio
import json
import logging
from datetime import datetime
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse

from app.agents.executor import AgentExecutorCore
from app.agents.registry import registry as registry_core
from app.auth.dependencies import get_current_user
from app.core.context_vars import (
    agent_name_ctx,
    campaign_id_ctx,
    gemini_attachments_ctx,
    user_id_ctx,
    workspace_id_ctx,
)
from app.core.database import get_database
from app.models.a2ui import A2UIFormSpec
from app.models.agent_io import AgentInput, AgentOutput
from app.models.base import KBDocument, ScrapedURL
from app.models.workspace_document import WorkspaceDocumentInDB
from app.providers.gcs import download_bytes, upload_bytes
from app.services.kb_processor import KBProcessorService
from app.services.scraper import ScraperService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/agents", tags=["agents"])

KB_CAMPAIGN_SCOPE = "knowledge-base"
KB_ASSET_TYPE = "workspace-documents"


def _dedupe_strings(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if not value or value in seen:
            continue
        seen.add(value)
        result.append(value)
    return result


async def _parse_generation_request(request: Request) -> tuple[dict[str, Any], list[Any]]:
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type:
        form = await request.form()
        payload_raw = form.get("payload")
        if payload_raw is None:
            raise HTTPException(status_code=400, detail="Missing payload in multipart request")
        try:
            payload = json.loads(str(payload_raw))
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=400, detail="Invalid JSON payload") from exc
        uploads = [file for file in form.getlist("files") if getattr(file, "filename", None)]
        logger.info(
            "KB_REQUEST_PARSE mode=multipart path=%s uploads=%d upload_names=%s",
            request.url.path,
            len(uploads),
            [getattr(file, "filename", "unknown") for file in uploads],
        )
        return payload, uploads

    try:
        payload = await request.json()
        logger.info("KB_REQUEST_PARSE mode=json path=%s uploads=0", request.url.path)
        return payload, []
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Request body must be valid JSON") from exc


async def _persist_uploaded_workspace_doc(
    db,
    workspace_id: str,
    upload,
    campaign_id: str | None = None,
    agent_id: str | None = None,
    source_card_id: str | None = None,
) -> tuple[str, dict[str, Any], dict[str, Any] | None]:
    content = await upload.read()
    try:
        validated = KBProcessorService.validate_upload(upload.filename, content, upload.content_type)
        kb_document = await KBProcessorService.build_kb_document(
            validated.filename,
            validated.content,
            validated.mime_type,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    gcs_result = await upload_bytes(
        data=validated.content,
        workspace_uuid=workspace_id,
        campaign_id=campaign_id or KB_CAMPAIGN_SCOPE,
        asset_type=KB_ASSET_TYPE,
        filename=validated.filename,
        content_type=validated.mime_type,
    )

    doc = WorkspaceDocumentInDB(
        workspace_id=workspace_id,
        campaign_id=campaign_id,
        agent_id=agent_id,
        source_card_id=source_card_id,
        filename=validated.filename,
        content_type=validated.mime_type,
        size_bytes=len(validated.content),
        extracted_text=kb_document.content,
        file_type=validated.mime_type,
        content_length=len(validated.content),
        gcs_path=gcs_result["gcs_path"],
        gcs_url=gcs_result["gcs_url"],
    )
    doc_dict = doc.model_dump(by_alias=False, exclude={"id"})
    result = await db.workspace_documents.insert_one(doc_dict)
    document_id = str(result.inserted_id)

    return (
        document_id,
        {
            "filename": kb_document.filename,
            "content": kb_document.content,
            "file_type": kb_document.file_type,
            "size_bytes": kb_document.size_bytes,
        },
        KBProcessorService.build_gemini_attachment(
            validated.filename,
            validated.content,
            validated.mime_type,
        ),
    )


async def _load_workspace_documents(
    db,
    workspace_id: str,
    selected_doc_ids: list[str] | None = None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[str]]:
    query: dict[str, Any] = {"workspace_id": workspace_id}
    requested_ids: list[str] = []
    if selected_doc_ids:
        object_ids = []
        for doc_id in selected_doc_ids:
            try:
                object_ids.append(ObjectId(doc_id))
                requested_ids.append(doc_id)
            except Exception:
                logger.warning("Skipping invalid workspace document id: %s", doc_id)
        if object_ids:
            query["_id"] = {"$in": object_ids}
        else:
            return [], [], []

    cursor = db.workspace_documents.find(query).sort("created_at", -1)
    kb_docs: list[dict[str, Any]] = []
    attachments: list[dict[str, Any]] = []
    resolved_ids: list[str] = []

    async for doc in cursor:
        resolved_ids.append(str(doc["_id"]))
        kb_docs.append(
            {
                "filename": doc.get("filename", "unknown"),
                "content": (doc.get("extracted_text", "") or "")[:10000],
                "file_type": doc.get("content_type", "application/octet-stream"),
                "size_bytes": doc.get("size_bytes", 0),
            }
        )

        if doc.get("gcs_path") and KBProcessorService.should_attach_to_gemini(
            doc.get("filename", ""),
            doc.get("content_type"),
        ):
            try:
                content = await download_bytes(doc["gcs_path"])
                attachment = KBProcessorService.build_gemini_attachment(
                    doc.get("filename", "document"),
                    content,
                    doc.get("content_type"),
                )
                if attachment:
                    attachments.append(attachment)
            except Exception as exc:
                logger.warning("Failed to load KB file %s from storage: %s", doc.get("filename"), exc)

    if requested_ids:
        ordered_ids = [doc_id for doc_id in requested_ids if doc_id in resolved_ids]
        missing_ids = [doc_id for doc_id in resolved_ids if doc_id not in ordered_ids]
        resolved_ids = ordered_ids + missing_ids

    return kb_docs, attachments, resolved_ids


async def _hydrate_request_context(
    db,
    workspace_id: str | None,
    input_data: dict[str, Any],
    uploads: list[Any],
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    kb_docs: list[dict[str, Any]] = list(input_data.get("kb_documents") or [])
    attachments: list[dict[str, Any]] = []
    resolved_doc_ids: list[str] = []
    selected_doc_ids = list(input_data.get("selected_kb_document_ids") or [])

    logger.info(
        "KB_CONTEXT_START workspace=%s selected_doc_ids=%s uploads=%d",
        workspace_id,
        selected_doc_ids,
        len(uploads),
    )

    if workspace_id and selected_doc_ids:
        selected_docs, selected_attachments, resolved_doc_ids = await _load_workspace_documents(
            db,
            workspace_id,
            selected_doc_ids,
        )
        kb_docs.extend(selected_docs)
        attachments.extend(selected_attachments)
        logger.info(
            "KB_CONTEXT_SELECTED_DOCS workspace=%s docs=%d attachments=%d resolved_doc_ids=%s",
            workspace_id,
            len(selected_docs),
            len(selected_attachments),
            resolved_doc_ids,
        )
    else:
        logger.info("KB_CONTEXT_NO_SELECTION workspace=%s", workspace_id)

    uploaded_doc_ids: list[str] = []
    if workspace_id and uploads:
        for upload in uploads:
            document_id, kb_doc, attachment = await _persist_uploaded_workspace_doc(
                db,
                workspace_id,
                upload,
                campaign_id=input_data.get("campaign_id"),
                agent_id=input_data.get("agent_id"),
                source_card_id=input_data.get("source_card_id"),
            )
            uploaded_doc_ids.append(document_id)
            kb_docs.append(kb_doc)
            if attachment:
                attachments.append(attachment)
            logger.info(
                "KB_CONTEXT_UPLOAD workspace=%s filename=%s persisted_doc_id=%s attachment_added=%s",
                workspace_id,
                kb_doc["filename"],
                document_id,
                bool(attachment),
            )

    final_doc_ids = _dedupe_strings(resolved_doc_ids + uploaded_doc_ids)
    if kb_docs:
        input_data["kb_documents"] = kb_docs
    else:
        input_data.pop("kb_documents", None)
    input_data["selected_kb_document_ids"] = final_doc_ids

    logger.info(
        "KB_CONTEXT_DONE workspace=%s kb_docs=%d gemini_attachments=%d final_doc_ids=%s",
        workspace_id,
        len(kb_docs),
        len(attachments),
        final_doc_ids,
    )

    return input_data, attachments


def _set_request_context(user: dict, workspace_id: str | None, campaign_id: str | None, agent_id: str):
    user_token = user_id_ctx.set(str(user.get("_id") or "system"))
    workspace_token = workspace_id_ctx.set(workspace_id)
    campaign_token = campaign_id_ctx.set(campaign_id)
    agent_token = agent_name_ctx.set(agent_id)
    return user_token, workspace_token, campaign_token, agent_token


def _reset_request_context(tokens):
    user_token, workspace_token, campaign_token, agent_token = tokens
    user_id_ctx.reset(user_token)
    workspace_id_ctx.reset(workspace_token)
    campaign_id_ctx.reset(campaign_token)
    agent_name_ctx.reset(agent_token)


# ============================================================
# V3 LEGACY ENDPOINTS
# ============================================================

@router.post("/{agent_id}/generate", response_model=AgentOutput)
async def agent_generate(
    agent_id: str,
    body: AgentInput,
    user: dict = Depends(get_current_user),
):
    """Executes an agent in Panel Mode (fire and forget / blocking)."""
    from app.agents.registry import registry

    agent = registry.get_agent(agent_id)
    workspace_id_ctx.set(body.workspace_id)
    campaign_id_ctx.set(body.campaign_id)
    agent_name_ctx.set(agent_id)

    if not agent:
        logger.info("Executing Generic Fallback Agent for %s", agent_id)
        from app.core.llm import llm_router

        if body.form_data:
            form_inputs = "\n".join([f"{k}: {v}" for k, v in body.form_data.items() if v])
            prompt = f"Please generate content based on these parameters:\n{form_inputs}"
        else:
            prompt = "Generate output for this agent."

        db = get_database()
        docs_cursor = db.workspace_documents.find({"workspace_id": body.workspace_id})
        kb_context = []
        async for doc in docs_cursor:
            if doc.get("extracted_text"):
                kb_context.append(f"--- Document: {doc['filename']} ---\n{doc['extracted_text']}")

        context_str = "\n".join(kb_context) if kb_context else "No additional context."
        sys_content = (
            f"You are the {agent_id.replace('_', ' ')} expert. "
            "Generate high-quality marketing output. Format your output in Markdown.\n\n"
            f"Context:\n{context_str}"
        )

        try:
            content = await llm_router.generate_text(
                prompt=prompt,
                system_prompt=sys_content,
                model_tier="standard",
            )
        except Exception as exc:
            logger.error("Generic Agent Error: %s", exc)
            content = f"Error generating content: {exc}"

        return AgentOutput(
            agent_id=agent_id,
            success=True,
            content=content,
            data={"raw_response": content},
        )

    db = get_database()
    docs_cursor = db.workspace_documents.find({"workspace_id": body.workspace_id})
    kb_context = []
    async for doc in docs_cursor:
        if doc.get("extracted_text"):
            kb_context.append(f"--- Document: {doc['filename']} ---\n{doc['extracted_text']}")

    if kb_context:
        body.kb_context = kb_context

    logger.info("Executing Agent %s in Panel Mode for Campaign %s", agent_id, body.campaign_id)
    return await agent.execute_panel(body)


@router.get("/{agent_id}/stream/{session_id}")
async def agent_generate_stream(agent_id: str, session_id: str):
    """SSE endpoint for streaming agent output in Panel Mode."""

    async def sse_generator():
        yield 'event: agent_start\ndata: {"status": "running"}\n\n'
        await asyncio.sleep(1)
        yield 'event: event_complete\ndata: {"status": "done"}\n\n'

    return StreamingResponse(sse_generator(), media_type="text/event-stream")


@router.post("/{agent_id}/regenerate", response_model=AgentOutput)
async def agent_regenerate(
    agent_id: str,
    body: AgentInput,
    user: dict = Depends(get_current_user),
):
    """Regenerates a previous agent execution using feedback."""
    if not body.previous_version_id or not body.feedback:
        raise HTTPException(status_code=400, detail="Must provide previous_version_id and feedback")
    return AgentOutput(agent_id=agent_id, success=True)


@router.get("/{agent_id}/form-spec", response_model=A2UIFormSpec)
async def get_agent_form_spec(agent_id: str, user: dict = Depends(get_current_user)):
    """Returns the React form specification for an agent."""
    from app.agents.registry import registry

    agent = registry.get_agent(agent_id)
    if not agent:
        from app.agents.fallback_forms import get_fallback_form_spec

        return get_fallback_form_spec(agent_id)
    return agent.form_spec


# ============================================================
# CORE ECOSYSTEM ENDPOINTS
# ============================================================

@router.get("/core/registry")
async def get_core_registry(user: dict = Depends(get_current_user)):
    """Returns full metadata for all core agents."""
    logger.info("Fetching Core Agent Registry for user: %s", user.get("email"))
    try:
        agents = registry_core.list_agents()
        result = [
            {
                "agent_id": a.agent_id,
                "name": a.name,
                "description": a.description,
                "category": a.category,
                "icon": a.icon,
                "is_implemented": a.is_implemented,
                "input_model": str(a.input_model.__name__),
                "output_model": str(a.output_model.__name__),
            }
            for a in agents
        ]
        logger.info("Returning %d agents from Core registry", len(result))
        return result
    except Exception as exc:
        logger.error("Failed to list Core agents: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Registry error: {str(exc)}") from exc


@router.post("/core/brand-identity/generate")
async def brand_identity_generate(
    request: Request,
    user: dict = Depends(get_current_user),
):
    """Generate a full brand identity using typed validation and request-scoped KB attachments."""
    input_data, uploads = await _parse_generation_request(request)
    workspace_id = input_data.get("workspace_id")
    campaign_id = input_data.get("campaign_id")
    logger.info("Brand Identity generate for workspace=%s by user=%s", workspace_id, user.get("email"))

    db = get_database()
    ws = await db.workspaces.find_one({"uuid": workspace_id}) if workspace_id else None
    context_tokens = _set_request_context(user, workspace_id, campaign_id, "brand_identity")

    try:
        input_data, attachments = await _hydrate_request_context(db, workspace_id, input_data, uploads)
        attachment_token = gemini_attachments_ctx.set(attachments)

        from app.agents.brand.brand_identity import BrandIdentityAgent
        from app.agents.brand.models import BrandIdentityInput

        body = BrandIdentityInput(**input_data)
        agent = BrandIdentityAgent()

        workspace_context = ws.get("core_context") if ws else None
        if workspace_context:
            body.workspace_context = workspace_context

        if body.urls_to_scrape and not body.scraped_content:
            try:
                scraped = await ScraperService.scrape_multiple(body.urls_to_scrape)
                body.scraped_content = [
                    ScrapedURL(url=s.url, extracted_text=s.extracted_text, title=s.title)
                    for s in scraped
                ]
                logger.info("Auto-scraped %d URLs for brand identity", len(scraped))
            except Exception as exc:
                logger.warning("Auto-scrape failed: %s", exc)

        output = await agent.generate(body)
        output.context_metadata = {
            **(output.context_metadata or {}),
            "selected_kb_document_ids": input_data.get("selected_kb_document_ids", []),
        }

        if output.success and output.context_updates and workspace_id:
            await db.workspaces.update_one(
                {"uuid": workspace_id},
                {"$set": {"core_context": output.context_updates}},
                upsert=True,
            )
            logger.info("Workspace context updated for %s", workspace_id)

        return output.model_dump()
    except Exception as exc:
        logger.error("Brand Identity Agent failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        if "attachment_token" in locals():
            gemini_attachments_ctx.reset(attachment_token)
        else:
            gemini_attachments_ctx.set([])
        _reset_request_context(context_tokens)


@router.post("/core/{agent_id}/generate")
async def core_agent_generate(
    agent_id: str,
    request: Request,
    user: dict = Depends(get_current_user),
):
    """Executes a generic core agent with scraping, KB, and draft-safe file persistence."""
    input_data, uploads = await _parse_generation_request(request)
    db = get_database()
    workspace_id = input_data.get("workspace_id")
    campaign_id = input_data.get("campaign_id")
    ws = await db.workspaces.find_one({"uuid": workspace_id}) if workspace_id else None
    context = ws.get("core_context") if ws else None
    context_tokens = _set_request_context(user, workspace_id, campaign_id, agent_id)

    try:
        input_data, attachments = await _hydrate_request_context(db, workspace_id, input_data, uploads)

        urls = input_data.get("urls_to_scrape", [])
        
        # Auto-scrape site_url for SEO agents if not already in urls_to_scrape
        seo_agents = ["keyword_researcher", "on_page_seo", "technical_seo", "aeo_optimizer", "backlink_strategy", "seo_audit"]
        site_url = input_data.get("site_url")
        if agent_id in seo_agents and site_url and site_url not in urls:
            urls.append(site_url)
            input_data["urls_to_scrape"] = urls
            logger.info("Auto-added site_url %s to scraping queue for agent %s", site_url, agent_id)

        if urls and not input_data.get("scraped_content"):
            try:
                scraped = await ScraperService.scrape_multiple(urls)
                input_data["scraped_content"] = [
                    {"url": s.url, "extracted_text": s.extracted_text, "title": s.title}
                    for s in scraped
                ]
                logger.info("Auto-scraped %d URLs (using Crawl4AI) for agent %s", len(scraped), agent_id)
            except Exception as exc:
                logger.warning("Auto-scrape failed for agent %s: %s", agent_id, exc)

        if workspace_id and not input_data.get("selected_agent_outputs") and input_data.get("selected_outputs"):
            try:
                selected_refs = []
                for card_id in input_data.get("selected_outputs", [])[:12]:
                    try:
                        card_doc = await db.cards.find_one(
                            {"_id": ObjectId(card_id), "campaign_id": input_data.get("campaign_id")}
                        )
                    except Exception:
                        card_doc = await db.cards.find_one({"_id": ObjectId(card_id)})
                    if not card_doc:
                        continue

                    agent_used = card_doc.get("agent_used") or ""
                    title = card_doc.get("title") or ""
                    preview = (card_doc.get("text_preview") or "").strip()
                    created_at = card_doc.get("updated_at") or card_doc.get("created_at") or datetime.utcnow()
                    output_id = str(card_doc.get("_id"))
                    output_type = "text"

                    current_version_id = card_doc.get("current_version_id")
                    if current_version_id:
                        try:
                            vdoc = await db.card_versions.find_one({"_id": ObjectId(current_version_id)})
                            if vdoc:
                                output_id = str(vdoc.get("_id"))
                                created_at = vdoc.get("created_at") or created_at
                                content = (vdoc.get("content") or "").strip()
                                if content:
                                    preview = content[:400]
                        except Exception:
                            pass

                    if not preview:
                        metadata = card_doc.get("metadata") or {}
                        structured = metadata.get("structured_data") if isinstance(metadata, dict) else None
                        if structured:
                            preview = str(structured)[:400]
                            output_type = "structured"

                    selected_refs.append(
                        {
                            "agent_id": agent_used or "unknown",
                            "agent_name": agent_used or title or agent_id,
                            "output_id": output_id,
                            "output_type": output_type,
                            "preview": preview[:400],
                            "created_at": created_at,
                        }
                    )

                if selected_refs:
                    input_data["selected_agent_outputs"] = selected_refs
            except Exception as exc:
                logger.warning("Failed to map selected_outputs for agent %s: %s", agent_id, exc)

        attachment_token = gemini_attachments_ctx.set(attachments)
        output = await AgentExecutorCore.execute(
            agent_id=agent_id,
            input_data=input_data,
            workspace_id=workspace_id,
            user_id=str(user["_id"]),
            workspace_context=context,
        )
        output.context_metadata = {
            **(getattr(output, "context_metadata", {}) or {}),
            "selected_kb_document_ids": input_data.get("selected_kb_document_ids", []),
        }

        if hasattr(output, "context_updates") and output.context_updates and workspace_id:
            await db.workspaces.update_one(
                {"uuid": workspace_id},
                {"$set": {"core_context": output.context_updates}},
                upsert=True,
            )

        return output
    except Exception as exc:
        logger.error("Core Agent %s failure: %s", agent_id, exc, exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        if "attachment_token" in locals():
            gemini_attachments_ctx.reset(attachment_token)
        else:
            gemini_attachments_ctx.set([])
        _reset_request_context(context_tokens)
