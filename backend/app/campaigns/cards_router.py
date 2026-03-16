import logging
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from app.auth.dependencies import get_current_user
from app.core.database import get_database
from app.models.assets import DeckCard, AssetVersion, GeneratedAsset
from app.models.enums import CardType, CardStatus

logger = logging.getLogger(__name__)

# Note: Using /workspaces/{workspace_uuid}/campaigns/{campaign_id}/cards 
# to match the existing hierarchy
router = APIRouter(prefix="/workspaces/{workspace_uuid}/campaigns/{campaign_id}/cards", tags=["cards"])

async def _verify_campaign(workspace_uuid: str, campaign_id: str, user_id: str):
    db = get_database()
    ws = await db.workspaces.find_one({"uuid": workspace_uuid, "user_id": user_id})
    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
        
    camp = await db.campaigns.find_one({"_id": ObjectId(campaign_id), "workspace_id": workspace_uuid})
    if not camp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return camp

class CreateCardRequest(BaseModel):
    card_type: CardType
    title: str = ""
    position: int = 0
    agent_used: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class UpdateCardRequest(BaseModel):
    title: str | None = None
    status: CardStatus | None = None
    position: int | None = None
    agent_used: str | None = None
    metadata: Optional[Dict[str, Any]] = None

class ReorderCardsRequest(BaseModel):
    card_ids: list[str]  # Ordered list of card IDs

# ─────────────────────────────────────────────────────────────
# Canvas Edges — persist connections between cards
# (Must be defined BEFORE /{card_id} to avoid path collision)
# ─────────────────────────────────────────────────────────────
class EdgeItem(BaseModel):
    id: str
    source: str
    target: str

class SaveEdgesRequest(BaseModel):
    edges: List[EdgeItem]

@router.post("/edges", status_code=status.HTTP_200_OK)
async def save_edges(
    workspace_uuid: str,
    campaign_id: str,
    body: SaveEdgesRequest,
    user: dict = Depends(get_current_user),
):
    """Save / replace all edges for a campaign canvas."""
    await _verify_campaign(workspace_uuid, campaign_id, user["_id"])
    db = get_database()

    # Replace all edges atomically
    await db.canvas_edges.delete_many({"campaign_id": campaign_id})
    if body.edges:
        docs = [
            {
                "campaign_id": campaign_id,
                "edge_id": e.id,
                "source": e.source,
                "target": e.target,
                "created_at": datetime.now(timezone.utc),
            }
            for e in body.edges
        ]
        await db.canvas_edges.insert_many(docs)

    return {"status": "success", "count": len(body.edges)}


@router.get("/edges")
async def load_edges(
    workspace_uuid: str,
    campaign_id: str,
    user: dict = Depends(get_current_user),
):
    """Load all saved edges for a campaign canvas."""
    await _verify_campaign(workspace_uuid, campaign_id, user["_id"])
    db = get_database()

    cursor = db.canvas_edges.find({"campaign_id": campaign_id})
    edges = []
    async for doc in cursor:
        edges.append({
            "id": doc["edge_id"],
            "source": doc["source"],
            "target": doc["target"],
        })
    return edges


@router.delete("/edges/{edge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_edge(
    workspace_uuid: str,
    campaign_id: str,
    edge_id: str,
    user: dict = Depends(get_current_user),
):
    """Delete a single edge by its ID."""
    await _verify_campaign(workspace_uuid, campaign_id, user["_id"])
    db = get_database()
    await db.canvas_edges.delete_one({"campaign_id": campaign_id, "edge_id": edge_id})


# ─────────────────────────────────────────────────────────────
# Canvas Layout — save and restore card positions
# ─────────────────────────────────────────────────────────────
class SaveLayoutRequest(BaseModel):
    positions: Dict[str, Any]  # card_id → {x, y}

@router.put("/layout", status_code=status.HTTP_200_OK)
async def save_layout(
    workspace_uuid: str,
    campaign_id: str,
    body: SaveLayoutRequest,
    user: dict = Depends(get_current_user),
):
    """Save the current canvas card positions (snapshot)."""
    await _verify_campaign(workspace_uuid, campaign_id, user["_id"])
    db = get_database()

    await db.canvas_layouts.update_one(
        {"campaign_id": campaign_id},
        {"$set": {
            "campaign_id": campaign_id,
            "positions": body.positions,
            "updated_at": datetime.now(timezone.utc),
        }},
        upsert=True,
    )
    logger.info("Saved layout for campaign %s (%d cards)", campaign_id, len(body.positions))
    return {"status": "success", "count": len(body.positions)}


@router.get("/layout")
async def load_layout(
    workspace_uuid: str,
    campaign_id: str,
    user: dict = Depends(get_current_user),
):
    """Load the saved canvas layout (card positions)."""
    await _verify_campaign(workspace_uuid, campaign_id, user["_id"])
    db = get_database()

    doc = await db.canvas_layouts.find_one({"campaign_id": campaign_id})
    if not doc:
        return {"positions": {}}
    return {"positions": doc.get("positions", {})}


@router.post("", response_model=DeckCard, status_code=status.HTTP_201_CREATED)
async def create_card(
    workspace_uuid: str,
    campaign_id: str,
    body: CreateCardRequest,
    user: dict = Depends(get_current_user),
):
    """Create a new card on the canvas deck."""
    await _verify_campaign(workspace_uuid, campaign_id, user["_id"])
    db = get_database()

    card = DeckCard(
        campaign_id=campaign_id,
        card_type=body.card_type,
        title=body.title,
        position=body.position,
        status=CardStatus.EMPTY,
        agent_used=body.agent_used,
        metadata=body.metadata,
    )
    doc = card.model_dump(by_alias=False, exclude={"id"})
    result = await db.cards.insert_one(doc)
    doc_id = str(result.inserted_id)
    doc["id"] = doc_id
    
    return DeckCard(**doc)

class AddVersionRequest(BaseModel):
    content: str = ""
    content_type: str = "text"
    feedback: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

@router.get("", response_model=list[DeckCard])
async def list_cards(
    workspace_uuid: str, 
    campaign_id: str, 
    user: dict = Depends(get_current_user)
):
    """List all cards for a campaign, with current version content joined."""
    await _verify_campaign(workspace_uuid, campaign_id, user["_id"])
    db = get_database()
    
    cursor = db.cards.find({"campaign_id": campaign_id}).sort("position", 1)
    cards = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        
        # Join current version content for text_preview if not already set
        if not doc.get("text_preview") and doc.get("current_version_id"):
            try:
                version = await db.card_versions.find_one({"_id": ObjectId(doc["current_version_id"])})
                if version and version.get("content"):
                    doc["text_preview"] = str(version["content"])
            except Exception:
                pass
        
        cards.append(DeckCard(**doc))
    return cards


@router.put("/{card_id}", response_model=DeckCard)
async def update_card(
    workspace_uuid: str,
    campaign_id: str,
    card_id: str,
    body: UpdateCardRequest,
    user: dict = Depends(get_current_user),
):
    """Update a specific card's top-level info (title, state, position)."""
    await _verify_campaign(workspace_uuid, campaign_id, user["_id"])
    db = get_database()
    
    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    updates["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.cards.find_one_and_update(
        {"_id": ObjectId(card_id), "campaign_id": campaign_id},
        {"$set": updates},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Card not found")
        
    result["id"] = str(result.pop("_id"))
    return DeckCard(**result)

@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_card(
    workspace_uuid: str,
    campaign_id: str,
    card_id: str,
    user: dict = Depends(get_current_user),
):
    """Delete a card and associated versions."""
    await _verify_campaign(workspace_uuid, campaign_id, user["_id"])
    db = get_database()
    
    result = await db.cards.delete_one({"_id": ObjectId(card_id), "campaign_id": campaign_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Card not found")
        
    # Cascade delete versions
    await db.card_versions.delete_many({"card_id": card_id})

@router.put("/reorder", status_code=status.HTTP_200_OK)
async def reorder_cards(
    workspace_uuid: str,
    campaign_id: str,
    body: ReorderCardsRequest,
    user: dict = Depends(get_current_user),
):
    """Update all card positions at once based on array order."""
    await _verify_campaign(workspace_uuid, campaign_id, user["_id"])
    db = get_database()
    
    # Bulk write would be better here in production, but we can do simple updates for now
    for index, cid in enumerate(body.card_ids):
        await db.cards.update_one(
            {"_id": ObjectId(cid), "campaign_id": campaign_id},
            {"$set": {"position": index, "updated_at": datetime.now(timezone.utc)}}
        )
    return {"status": "success"}

@router.post("/{card_id}/add-version")
async def add_card_version(
    workspace_uuid: str,
    campaign_id: str,
    card_id: str,
    body: AddVersionRequest,
    user: dict = Depends(get_current_user),
):
    """Save a new version of generated content. Updates text_preview on the card."""
    await _verify_campaign(workspace_uuid, campaign_id, user["_id"])
    db = get_database()
    
    # Verify card exists
    card = await db.cards.find_one({"_id": ObjectId(card_id), "campaign_id": campaign_id})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Count existing versions for numbering
    version_number = await db.card_versions.count_documents({"card_id": card_id}) + 1
    
    # Build version document
    version_doc = {
        "card_id": card_id,
        "version_number": version_number,
        "content": body.content,
        "content_type": body.content_type,
        "feedback": body.feedback,
        "metadata": body.metadata or {},
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.card_versions.insert_one(version_doc)
    version_id = str(result.inserted_id)
    # insert_one mutates version_doc in-place adding _id as ObjectId — remove it
    version_doc.pop("_id", None)
    version_doc["id"] = version_id

    # Extract full content for preview
    text_preview = body.content.strip() if body.content else None

    # Update card: status=draft, current_version_id, text_preview, metadata
    card_update: dict = {
        "status": CardStatus.DRAFT.value,
        "current_version_id": version_id,
        "updated_at": datetime.now(timezone.utc),
    }
    if text_preview:
        card_update["text_preview"] = text_preview
    if body.metadata:
        card_update["metadata"] = body.metadata
        
        # Extract thumbnail from assets if available
        try:
            structured_data = body.metadata.get("structured_data", {})
            assets = structured_data.get("assets", [])
            for asset in assets:
                # Use the first image/video asset as a thumbnail
                if asset.get("asset_type") in ["image", "video"] and asset.get("gcs_url"):
                    card_update["thumbnail_url"] = asset["gcs_url"]
                    break
        except Exception:
            pass

    await db.cards.update_one(
        {"_id": ObjectId(card_id)},
        {
            "$set": card_update,
            "$push": {"versions": version_id},
        }
    )
    
    return {**version_doc, "id": version_id}



@router.put("/{card_id}/finalize", response_model=DeckCard)
async def finalize_card(
    workspace_uuid: str,
    campaign_id: str,
    card_id: str,
    user: dict = Depends(get_current_user),
):
    """Marks a card as final and updates its thumbnail/preview."""
    await _verify_campaign(workspace_uuid, campaign_id, user["_id"])
    db = get_database()
    
    result = await db.cards.find_one_and_update(
        {"_id": ObjectId(card_id), "campaign_id": campaign_id},
        {"$set": {
            "status": CardStatus.FINAL.value,
            "updated_at": datetime.now(timezone.utc)
        }},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Card not found")
        
    result["id"] = str(result.pop("_id"))
    return DeckCard(**result)


# Single Card Routes
# ─────────────────────────────────────────────────────────────

@router.get("/{card_id}")
async def get_card(
    workspace_uuid: str,
    campaign_id: str,
    card_id: str,
    user: dict = Depends(get_current_user),
):
    """Fetch a single card with its current version content and metadata."""
    await _verify_campaign(workspace_uuid, campaign_id, user["_id"])
    db = get_database()

    card = await db.cards.find_one({"_id": ObjectId(card_id), "campaign_id": campaign_id})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    card["id"] = str(card.pop("_id"))

    # Attach current version content
    if card.get("current_version_id"):
        try:
            version = await db.card_versions.find_one({"_id": ObjectId(card["current_version_id"])})
            if version:
                version["id"] = str(version.pop("_id"))
                card["current_version"] = version
        except Exception:
            pass

    return card

    card["id"] = str(card.pop("_id"))

    # Attach current version content
    if card.get("current_version_id"):
        try:
            version = await db.card_versions.find_one({"_id": ObjectId(card["current_version_id"])})
            if version:
                version["id"] = str(version.pop("_id"))
                card["current_version"] = version
        except Exception:
            pass

    return card


@router.get("/{card_id}/versions")
async def list_card_versions(
    workspace_uuid: str,
    campaign_id: str,
    card_id: str,
    user: dict = Depends(get_current_user),
):
    """Return all versions of a card in chronological order."""
    await _verify_campaign(workspace_uuid, campaign_id, user["_id"])
    db = get_database()

    card = await db.cards.find_one({"_id": ObjectId(card_id), "campaign_id": campaign_id})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    cursor = db.card_versions.find({"card_id": card_id}).sort("created_at", 1)
    versions = []
    async for v in cursor:
        v["id"] = str(v.pop("_id"))
        versions.append(v)

    return versions
