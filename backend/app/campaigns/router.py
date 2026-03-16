"""Campaign CRUD router — nested under workspaces."""

import logging
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.core.database import get_database
from app.models.campaign import CampaignCreate, CampaignInDB, CampaignResponse, CampaignUpdate

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/workspaces/{workspace_uuid}/campaigns", tags=["campaigns"])


async def _verify_workspace(workspace_uuid: str, user_id: str):
    """Verify the workspace exists and belongs to the user."""
    db = get_database()
    ws = await db.workspaces.find_one({"uuid": workspace_uuid, "user_id": user_id})
    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
    return ws


@router.post("", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    workspace_uuid: str,
    body: CampaignCreate,
    user: dict = Depends(get_current_user),
):
    """Create a campaign within a workspace."""
    await _verify_workspace(workspace_uuid, user["_id"])
    db = get_database()

    campaign = CampaignInDB(
        workspace_id=workspace_uuid,
        user_id=user["_id"],
        name=body.name,
        description=body.description,
    )
    doc = campaign.model_dump(by_alias=False, exclude={"id"})
    result = await db.campaigns.insert_one(doc)
    doc_id = str(result.inserted_id)
    logger.info("Created campaign %s in workspace %s", doc_id, workspace_uuid)
    return CampaignResponse(id=doc_id, **doc)


@router.get("", response_model=list[CampaignResponse])
async def list_campaigns(workspace_uuid: str, user: dict = Depends(get_current_user)):
    """List all campaigns in a workspace."""
    await _verify_workspace(workspace_uuid, user["_id"])
    db = get_database()
    cursor = db.campaigns.find({"workspace_id": workspace_uuid}).sort("created_at", -1)
    campaigns = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        campaigns.append(CampaignResponse(**doc))
    return campaigns


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    workspace_uuid: str,
    campaign_id: str,
    user: dict = Depends(get_current_user),
):
    """Get a single campaign."""
    await _verify_workspace(workspace_uuid, user["_id"])
    db = get_database()
    doc = await db.campaigns.find_one(
        {"_id": ObjectId(campaign_id), "workspace_id": workspace_uuid}
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    doc["id"] = str(doc.pop("_id"))
    return CampaignResponse(**doc)


@router.put("/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    workspace_uuid: str,
    campaign_id: str,
    body: CampaignUpdate,
    user: dict = Depends(get_current_user),
):
    """Update a campaign."""
    await _verify_workspace(workspace_uuid, user["_id"])
    db = get_database()
    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    updates["updated_at"] = datetime.now(timezone.utc)

    result = await db.campaigns.find_one_and_update(
        {"_id": ObjectId(campaign_id), "workspace_id": workspace_uuid},
        {"$set": updates},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    result["id"] = str(result.pop("_id"))
    return CampaignResponse(**result)


@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_campaign(
    workspace_uuid: str,
    campaign_id: str,
    user: dict = Depends(get_current_user),
):
    """Delete a campaign and its assets/conversations."""
    await _verify_workspace(workspace_uuid, user["_id"])
    db = get_database()
    result = await db.campaigns.delete_one(
        {"_id": ObjectId(campaign_id), "workspace_id": workspace_uuid}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    # Cascade
    await db.assets.delete_many({"campaign_id": campaign_id})
    await db.conversations.delete_many({"campaign_id": campaign_id})
    await db.versions.delete_many({"campaign_id": campaign_id})
    await db.agent_logs.delete_many({"campaign_id": campaign_id})
    logger.info("Deleted campaign %s from workspace %s", campaign_id, workspace_uuid)
