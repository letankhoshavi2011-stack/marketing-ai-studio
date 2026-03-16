"""Workspace business logic."""

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.repositories import WorkspaceRepository, CampaignRepository
from app.models.workspace import WorkspaceDoc


class WorkspaceService:
    """Manages workspace lifecycle operations."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.repo = WorkspaceRepository(db)
        self.campaign_repo = CampaignRepository(db)

    async def create_workspace(self, user_id: str, name: str, description: str = "") -> dict:
        """Create a new workspace for the given user."""
        workspace = WorkspaceDoc(user_id=user_id, name=name, description=description)
        data = workspace.model_dump(by_alias=True)
        await self.repo.create(data)
        return data

    async def list_workspaces(self, user_id: str) -> list[dict]:
        """List all workspaces for a user with campaign counts."""
        workspaces = await self.repo.list_by_user(user_id)
        result = []
        for ws in workspaces:
            campaigns = await self.campaign_repo.list_by_workspace(ws["uuid"])
            ws["campaign_count"] = len(campaigns)
            result.append(ws)
        return result

    async def get_workspace(self, uuid: str, user_id: str) -> dict | None:
        """Get a single workspace. Returns None if not found or not owned by user."""
        ws = await self.repo.find_by_uuid(uuid)
        if ws and ws.get("user_id") == user_id:
            campaigns = await self.campaign_repo.list_by_workspace(uuid)
            ws["campaign_count"] = len(campaigns)
            return ws
        return None

    async def update_workspace(self, uuid: str, user_id: str, updates: dict) -> bool:
        """Update workspace fields. Only the owner can update."""
        ws = await self.repo.find_by_uuid(uuid)
        if not ws or ws.get("user_id") != user_id:
            return False
        # Handle nested settings updates
        clean: dict = {}
        for key in ("name", "description"):
            if key in updates and updates[key] is not None:
                clean[key] = updates[key]
        for key in ("default_model_tier", "auto_brand_guardian"):
            if key in updates and updates[key] is not None:
                clean[f"settings.{key}"] = updates[key]
        if clean:
            return await self.repo.update(uuid, clean)
        return False

    async def delete_workspace(self, uuid: str, user_id: str) -> bool:
        """Delete a workspace. Only the owner can delete."""
        ws = await self.repo.find_by_uuid(uuid)
        if not ws or ws.get("user_id") != user_id:
            return False
        return await self.repo.delete(uuid)
