"""Workspace Documents CRUD router for Knowledge Base."""

import logging
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status

from app.auth.dependencies import get_current_user
from app.core.database import get_database
from app.models.workspace_document import WorkspaceDocumentInDB, WorkspaceDocumentResponse
from app.providers.gcs import delete_file, get_signed_url, upload_bytes
from app.services.kb_processor import KBProcessorService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/workspaces/{workspace_uuid}/documents", tags=["workspaces", "knowledge_base"])

KB_CAMPAIGN_SCOPE = "knowledge-base"
KB_ASSET_TYPE = "workspace-documents"


@router.post("", response_model=WorkspaceDocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    workspace_uuid: str,
    file: UploadFile = File(...),
    campaign_id: str | None = Form(None),
    agent_id: str | None = Form(None),
    source_card_id: str | None = Form(None),
    user: dict = Depends(get_current_user),
):
    """Upload a knowledge-base document and persist it to GCS/local fallback."""
    logger.info("Uploading document %s to workspace %s", file.filename, workspace_uuid)

    db = get_database()
    ws = await db.workspaces.find_one({"uuid": workspace_uuid, "user_id": user["_id"]})
    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    content = await file.read()
    try:
        upload = KBProcessorService.validate_upload(file.filename, content, file.content_type)
        kb_document = await KBProcessorService.build_kb_document(upload.filename, upload.content, upload.mime_type)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    gcs_result = await upload_bytes(
        data=upload.content,
        workspace_uuid=workspace_uuid,
        campaign_id=campaign_id or KB_CAMPAIGN_SCOPE,
        asset_type=KB_ASSET_TYPE,
        filename=upload.filename,
        content_type=upload.mime_type,
    )

    doc = WorkspaceDocumentInDB(
        workspace_id=workspace_uuid,
        campaign_id=campaign_id,
        agent_id=agent_id,
        source_card_id=source_card_id,
        filename=upload.filename,
        content_type=upload.mime_type,
        size_bytes=len(upload.content),
        extracted_text=kb_document.content,
        file_type=upload.mime_type,
        content_length=len(upload.content),
        gcs_path=gcs_result["gcs_path"],
        gcs_url=gcs_result["gcs_url"],
    )

    doc_dict = doc.model_dump(by_alias=False, exclude={"id"})
    result = await db.workspace_documents.insert_one(doc_dict)
    doc_dict["_id"] = str(result.inserted_id)
    doc_dict["id"] = str(result.inserted_id)

    logger.info(
        "Created document %s for workspace %s campaign=%s agent=%s source_card=%s",
        doc_dict["_id"],
        workspace_uuid,
        campaign_id,
        agent_id,
        source_card_id,
    )
    return WorkspaceDocumentResponse(**doc_dict)


@router.get("", response_model=list[WorkspaceDocumentResponse])
async def list_documents(
    workspace_uuid: str,
    campaign_id: str | None = Query(None),
    agent_id: str | None = Query(None),
    source_card_id: str | None = Query(None),
    user: dict = Depends(get_current_user),
):
    """List all documents in the workspace knowledge base."""
    db = get_database()
    ws = await db.workspaces.find_one({"uuid": workspace_uuid, "user_id": user["_id"]})
    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    query = {"workspace_id": workspace_uuid}
    if campaign_id:
        query["campaign_id"] = campaign_id
    if agent_id:
        query["agent_id"] = agent_id
    if source_card_id:
        query["source_card_id"] = source_card_id

    cursor = db.workspace_documents.find(query).sort("created_at", -1)
    documents = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc["id"] = str(doc["_id"])
        if doc.get("gcs_path"):
            try:
                doc["gcs_url"] = await get_signed_url(doc["gcs_path"])
            except Exception as exc:
                logger.warning("Failed to refresh signed URL for %s: %s", doc["filename"], exc)
        doc["file_type"] = doc.get("file_type") or doc.get("content_type")
        doc["content_length"] = doc.get("content_length") or doc.get("size_bytes")
        doc["extracted_text"] = doc.get("extracted_text", "")[:500] + "..." if doc.get("extracted_text") else ""
        documents.append(WorkspaceDocumentResponse(**doc))
    return documents


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    workspace_uuid: str,
    document_id: str,
    user: dict = Depends(get_current_user),
):
    """Delete a document from the workspace knowledge base."""
    db = get_database()
    ws = await db.workspaces.find_one({"uuid": workspace_uuid, "user_id": user["_id"]})
    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    from bson import ObjectId

    try:
        obj_id = ObjectId(document_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid document ID format") from exc

    document = await db.workspace_documents.find_one({"_id": obj_id, "workspace_id": workspace_uuid})
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if document.get("gcs_path"):
        try:
            await delete_file(document["gcs_path"])
        except Exception as exc:
            logger.warning("Failed to delete KB file %s: %s", document["gcs_path"], exc)

    result = await db.workspace_documents.delete_one({"_id": obj_id, "workspace_id": workspace_uuid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    logger.info("Deleted document %s from workspace %s", document_id, workspace_uuid)


@router.get("/{document_id}", response_model=WorkspaceDocumentResponse)
async def get_document(
    workspace_uuid: str,
    document_id: str,
    user: dict = Depends(get_current_user),
):
    """Get full document details (including full extracted text)."""
    db = get_database()
    ws = await db.workspaces.find_one({"uuid": workspace_uuid, "user_id": user["_id"]})
    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    from bson import ObjectId

    try:
        obj_id = ObjectId(document_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid document ID format") from exc

    doc = await db.workspace_documents.find_one({"_id": obj_id, "workspace_id": workspace_uuid})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    doc["_id"] = str(doc["_id"])
    doc["id"] = str(doc["_id"])
    if doc.get("gcs_path"):
        try:
            doc["gcs_url"] = await get_signed_url(doc["gcs_path"])
        except Exception as exc:
            logger.warning("Failed to refresh signed URL for %s: %s", doc["filename"], exc)
    
    doc["file_type"] = doc.get("file_type") or doc.get("content_type")
    doc["content_length"] = doc.get("content_length") or doc.get("size_bytes")
    # extracted_text is included in the response by default from the DB if it exists
    return WorkspaceDocumentResponse(**doc)
