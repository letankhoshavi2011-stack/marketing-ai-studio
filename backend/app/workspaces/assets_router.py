from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.auth.dependencies import get_current_user
from app.core.database import get_database
from app.models.base import GeneratedAsset
from pydantic import BaseModel, Field
from datetime import datetime

router = APIRouter(prefix="/workspaces/{workspace_uuid}/assets", tags=["assets"])

class WorkspaceAsset(BaseModel):
    id: str
    asset_type: str
    gcs_url: str
    thumbnail_url: Optional[str] = None
    prompt_used: str = ""
    created_at: datetime
    campaign_name: str = ""
    agent_name: str = ""

@router.get("", response_model=List[WorkspaceAsset])
async def list_workspace_assets(workspace_uuid: str, user: dict = Depends(get_current_user)):
    """Aggregate all generated assets (images/videos) for a workspace."""
    db = get_database()
    
    # Verify workspace access
    ws = await db.workspaces.find_one({"uuid": workspace_uuid, "user_id": user["_id"]})
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    # Get all campaigns in this workspace for context
    campaign_map = {}
    async for camp in db.campaigns.find({"workspace_id": workspace_uuid}):
        campaign_map[str(camp["_id"])] = camp.get("name", "Untitled Campaign")

    assets = []
    
    # 1. Fetch from cards metadata
    cursor = db.cards.find({"campaign_id": {"$in": list(campaign_map.keys())}})
    async for card in cursor:
        metadata = card.get("metadata", {})
        structured_data = metadata.get("structured_data", {})
        card_assets = structured_data.get("assets", [])
        
        campaign_name = campaign_map.get(card.get("campaign_id"), "Unknown")
        agent_name = card.get("agent_used", "AI Agent")
        created_at = card.get("created_at", datetime.utcnow())

        for asset in card_assets:
            if asset.get("asset_type") in ["image", "video"]:
                assets.append(WorkspaceAsset(
                    id=asset.get("id", str(datetime.utcnow().timestamp())),
                    asset_type=asset.get("asset_type"),
                    gcs_url=asset.get("gcs_url", ""),
                    thumbnail_url=asset.get("thumbnail_url"),
                    prompt_used=asset.get("prompt_used", ""),
                    created_at=created_at,
                    campaign_name=campaign_name,
                    agent_name=agent_name
                ))

    # 2. Fetch from card versions metadata (to catch all generations)
    # We'll use a set to avoid duplicates if card metadata points to the same asset
    seen_urls = {a.gcs_url for a in assets if a.gcs_url}
    
    # We need to find versions related to the campaigns in this workspace
    # Instead of joining, let's just find versions for the cards we found
    card_ids = []
    async for card in db.cards.find({"campaign_id": {"$in": list(campaign_map.keys())}}):
         card_ids.append(str(card["_id"]))

    if card_ids:
        v_cursor = db.card_versions.find({"card_id": {"$in": card_ids}})
        async for version in v_cursor:
            metadata = version.get("metadata", {})
            structured_data = metadata.get("structured_data", {})
            v_assets = structured_data.get("assets", [])
            
            # Find the card to get campaign_id
            # This is a bit slow but safer
            # In a real app we'd have Denormalized campaign_id on versions
            # Let's skip the extra fetch and just use "Archived" if not easily found
            # or better, fetch campaign_id once since we have it on the version's parent card
            
            created_at = version.get("created_at", datetime.utcnow())

            for asset in v_assets:
                url = asset.get("gcs_url")
                if url and url not in seen_urls and asset.get("asset_type") in ["image", "video"]:
                    assets.append(WorkspaceAsset(
                        id=asset.get("id", str(datetime.utcnow().timestamp())),
                        asset_type=asset.get("asset_type"),
                        gcs_url=url,
                        thumbnail_url=asset.get("thumbnail_url"),
                        prompt_used=asset.get("prompt_used", ""),
                        created_at=created_at,
                        campaign_name="N/A", # Version level context is harder to link without many queries
                        agent_name="AI Agent"
                    ))
                    seen_urls.add(url)

    # Sort by descending date
    assets.sort(key=lambda x: x.created_at, reverse=True)
    
    return assets
