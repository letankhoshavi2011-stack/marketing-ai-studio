"""Workspace Prompt Library CRUD router."""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.auth.dependencies import get_current_user
from app.core.database import get_database
from app.models.prompt_library import (
    PromptCreate,
    PromptInDB,
    PromptResponse,
    PromptUpdate,
)
from app.services.prompt_utils import extract_input_variables

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/workspaces/{workspace_uuid}/prompts",
    tags=["workspaces", "prompt_library"],
)

COLLECTION = "prompt_library"


# ---------------------------------------------------------------------------
# POST / — Create prompt
# ---------------------------------------------------------------------------
@router.post("", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
async def create_prompt(
    workspace_uuid: str,
    body: PromptCreate,
    user: dict = Depends(get_current_user),
):
    """Create a new prompt in the workspace prompt library."""
    db = get_database()

    # Verify workspace exists and user has access
    ws = await db.workspaces.find_one({"uuid": workspace_uuid, "user_id": user["_id"]})
    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    # Auto-extract input variables from the template
    input_variables = extract_input_variables(body.prompt_template)

    prompt = PromptInDB(
        workspace_id=workspace_uuid,
        agent_id=body.agent_id,
        category=body.category,
        name=body.name,
        description=body.description,
        system_prompt=body.system_prompt,
        prompt_template=body.prompt_template,
        input_variables=input_variables,
        model_tier=body.model_tier,
        temperature=body.temperature,
        created_by=user["_id"],
    )

    doc = prompt.model_dump()
    await db[COLLECTION].insert_one(doc)

    logger.info("Created prompt %s for workspace %s", prompt.prompt_id, workspace_uuid)
    return PromptResponse(**doc)


# ---------------------------------------------------------------------------
# GET / — List prompts (system defaults + workspace overrides)
# ---------------------------------------------------------------------------
@router.get("", response_model=list[PromptResponse])
async def list_prompts(
    workspace_uuid: str,
    agent_id: str | None = Query(default=None),
    user: dict = Depends(get_current_user),
):
    """List active prompts: system defaults merged with workspace-specific ones."""
    db = get_database()

    # Verify workspace
    ws = await db.workspaces.find_one({"uuid": workspace_uuid, "user_id": user["_id"]})
    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    # Build filter — active prompts for this workspace OR system defaults
    base_filter: dict = {
        "is_active": True,
        "workspace_id": {"$in": [workspace_uuid, "__system__"]},
    }
    if agent_id:
        base_filter["agent_id"] = agent_id

    cursor = db[COLLECTION].find(base_filter).sort("created_at", -1)
    results: list[PromptResponse] = []
    async for doc in cursor:
        doc.pop("_id", None)
        results.append(PromptResponse(**doc))

    return results


# ---------------------------------------------------------------------------
# GET /{prompt_id} — Get single prompt
# ---------------------------------------------------------------------------
@router.get("/{prompt_id}", response_model=PromptResponse)
async def get_prompt(
    workspace_uuid: str,
    prompt_id: str,
    user: dict = Depends(get_current_user),
):
    """Retrieve a single prompt by its ID."""
    db = get_database()

    # Verify workspace
    ws = await db.workspaces.find_one({"uuid": workspace_uuid, "user_id": user["_id"]})
    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    doc = await db[COLLECTION].find_one({
        "prompt_id": prompt_id,
        "workspace_id": {"$in": [workspace_uuid, "__system__"]},
    })
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")

    doc.pop("_id", None)
    return PromptResponse(**doc)


# ---------------------------------------------------------------------------
# PUT /{prompt_id} — Update prompt
# ---------------------------------------------------------------------------
@router.put("/{prompt_id}", response_model=PromptResponse)
async def update_prompt(
    workspace_uuid: str,
    prompt_id: str,
    body: PromptUpdate,
    user: dict = Depends(get_current_user),
):
    """Update an existing prompt. Cannot update system defaults."""
    db = get_database()

    # Verify workspace
    ws = await db.workspaces.find_one({"uuid": workspace_uuid, "user_id": user["_id"]})
    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    existing = await db[COLLECTION].find_one({
        "prompt_id": prompt_id,
        "workspace_id": workspace_uuid,
    })
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")

    if existing.get("is_default"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify a default system prompt. Clone it first.",
        )

    updates: dict = body.model_dump(exclude_none=True)

    # Re-extract input variables if the template changed
    if "prompt_template" in updates:
        updates["input_variables"] = [
            v.model_dump() for v in extract_input_variables(updates["prompt_template"])
        ]

    updates["updated_at"] = datetime.now(timezone.utc)
    updates["version"] = existing.get("version", 1) + 1

    await db[COLLECTION].update_one(
        {"prompt_id": prompt_id, "workspace_id": workspace_uuid},
        {"$set": updates},
    )

    updated = await db[COLLECTION].find_one({"prompt_id": prompt_id})
    updated.pop("_id", None)

    logger.info("Updated prompt %s (v%s)", prompt_id, updates["version"])
    return PromptResponse(**updated)


# ---------------------------------------------------------------------------
# DELETE /{prompt_id} — Soft delete
# ---------------------------------------------------------------------------
@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prompt(
    workspace_uuid: str,
    prompt_id: str,
    user: dict = Depends(get_current_user),
):
    """Soft-delete a prompt (set is_active=False). Cannot delete system defaults."""
    db = get_database()

    # Verify workspace
    ws = await db.workspaces.find_one({"uuid": workspace_uuid, "user_id": user["_id"]})
    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    existing = await db[COLLECTION].find_one({
        "prompt_id": prompt_id,
        "workspace_id": workspace_uuid,
    })
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")

    if existing.get("is_default"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete a default system prompt.",
        )

    await db[COLLECTION].update_one(
        {"prompt_id": prompt_id, "workspace_id": workspace_uuid},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc)}},
    )

    logger.info("Soft-deleted prompt %s in workspace %s", prompt_id, workspace_uuid)


# ---------------------------------------------------------------------------
# POST /rewrite — AI-powered prompt rewriting
# ---------------------------------------------------------------------------
class RewritePromptRequest(BaseModel):
    prompt_text: str
    agent_id: str | None = None

@router.post("/rewrite")
async def rewrite_prompt(
    workspace_uuid: str,
    body: RewritePromptRequest,
    user: dict = Depends(get_current_user),
):
    """Use LLM to restructure and improve a prompt template."""
    db = get_database()

    ws = await db.workspaces.find_one({"uuid": workspace_uuid, "user_id": user["_id"]})
    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    from app.providers.gemini import GeminiProvider
    gemini = GeminiProvider()

    system_prompt = """You are an expert Prompt Engineer. Your job is to take a raw prompt and rewrite it to be:
1. More structured and clear (use sections, numbered steps, constraints).
2. More effective for LLM consumption (explicit instructions, examples, format specs).
3. Preserving all original intent and variables (keep {variable_name} placeholders intact).
4. Professional and concise.

Return ONLY the rewritten prompt text, nothing else."""

    user_prompt = f"""Rewrite and improve this prompt:

---
{body.prompt_text}
---

Agent context: {body.agent_id or "general purpose"}"""

    try:
        rewritten = await gemini.generate_text(
            prompt=user_prompt,
            system_prompt=system_prompt,
            model_tier="pro",
            response_mime_type="text/plain"
        )
        return {"rewritten_prompt": rewritten.strip()}
    except Exception as e:
        logger.error(f"Prompt rewrite failed: {e}")
        raise HTTPException(status_code=500, detail="Prompt rewrite failed")
