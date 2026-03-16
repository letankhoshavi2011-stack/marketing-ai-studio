"""Workspace CRUD router."""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.core.database import get_database
from app.models.workspace import WorkspaceCreate, WorkspaceResponse, WorkspaceUpdate, WorkspaceInDB

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(body: WorkspaceCreate, user: dict = Depends(get_current_user)):
    """Create a new workspace for the authenticated user."""
    db = get_database()
    ws = WorkspaceInDB(
        user_id=user["_id"],
        name=body.name,
        description=body.description,
        settings=body.settings,
    )
    doc = ws.model_dump(by_alias=False, exclude={"id"})
    result = await db.workspaces.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    logger.info("Created workspace %s for user %s", ws.uuid, user["_id"])
    return WorkspaceResponse(**doc)


@router.get("", response_model=list[WorkspaceResponse])
async def list_workspaces(user: dict = Depends(get_current_user)):
    """List all workspaces belonging to the authenticated user."""
    db = get_database()
    cursor = db.workspaces.find({"user_id": user["_id"]}).sort("created_at", -1)
    workspaces = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        workspaces.append(WorkspaceResponse(**doc))
    return workspaces



@router.get("/{workspace_uuid}", response_model=WorkspaceResponse)
async def get_workspace(workspace_uuid: str, user: dict = Depends(get_current_user)):
    """Get a workspace by UUID."""
    db = get_database()
    doc = await db.workspaces.find_one({"uuid": workspace_uuid, "user_id": user["_id"]})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
    doc["_id"] = str(doc["_id"])
    return WorkspaceResponse(**doc)


@router.put("/{workspace_uuid}", response_model=WorkspaceResponse)
async def update_workspace(
    workspace_uuid: str,
    body: WorkspaceUpdate,
    user: dict = Depends(get_current_user),
):
    """Update workspace name, description, or settings."""
    db = get_database()
    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    if "settings" in updates:
        updates["settings"] = body.settings.model_dump()

    updates["updated_at"] = datetime.now(timezone.utc)

    result = await db.workspaces.find_one_and_update(
        {"uuid": workspace_uuid, "user_id": user["_id"]},
        {"$set": updates},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
    result["_id"] = str(result["_id"])
    return WorkspaceResponse(**result)


@router.delete("/{workspace_uuid}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace(workspace_uuid: str, user: dict = Depends(get_current_user)):
    """Delete a workspace and all its campaigns."""
    db = get_database()
    ws = await db.workspaces.find_one({"uuid": workspace_uuid, "user_id": user["_id"]})
    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    # Cascade delete campaigns, assets, conversations, versions, agent_logs
    await db.campaigns.delete_many({"workspace_id": workspace_uuid})
    await db.assets.delete_many({"workspace_id": workspace_uuid})
    await db.conversations.delete_many({"workspace_id": workspace_uuid})
    await db.versions.delete_many({"workspace_id": workspace_uuid})
    await db.agent_logs.delete_many({"workspace_id": workspace_uuid})
    await db.workspaces.delete_one({"_id": ws["_id"]})
    logger.info("Deleted workspace %s", workspace_uuid)
