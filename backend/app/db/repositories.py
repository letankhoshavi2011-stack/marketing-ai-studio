"""Async CRUD repository for all MongoDB collections."""

import logging
from datetime import datetime, timezone
from typing import Any

from bson import ObjectId

from app.core.database import get_database

logger = logging.getLogger(__name__)


class BaseRepository:
    """Generic async CRUD for a MongoDB collection."""

    def __init__(self, collection_name: str):
        self.collection_name = collection_name

    @property
    def _col(self):
        return get_database()[self.collection_name]

    async def insert(self, doc: dict[str, Any]) -> str:
        result = await self._col.insert_one(doc)
        return str(result.inserted_id)

    async def find_by_id(self, doc_id: str) -> dict[str, Any] | None:
        doc = await self._col.find_one({"_id": ObjectId(doc_id)})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def find_one(self, query: dict) -> dict[str, Any] | None:
        doc = await self._col.find_one(query)
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def find_many(
        self,
        query: dict,
        sort: list[tuple[str, int]] | None = None,
        limit: int = 100,
        skip: int = 0,
    ) -> list[dict[str, Any]]:
        cursor = self._col.find(query).skip(skip).limit(limit)
        if sort:
            cursor = cursor.sort(sort)
        results = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return results

    async def update_by_id(self, doc_id: str, updates: dict[str, Any]) -> bool:
        updates["updated_at"] = datetime.now(timezone.utc)
        result = await self._col.update_one(
            {"_id": ObjectId(doc_id)}, {"$set": updates}
        )
        return result.modified_count > 0

    async def delete_by_id(self, doc_id: str) -> bool:
        result = await self._col.delete_one({"_id": ObjectId(doc_id)})
        return result.deleted_count > 0

    async def delete_many(self, query: dict) -> int:
        result = await self._col.delete_many(query)
        return result.deleted_count

    async def count(self, query: dict | None = None) -> int:
        return await self._col.count_documents(query or {})


# Collection-specific repositories
class UserRepository(BaseRepository):
    def __init__(self):
        super().__init__("users")

    async def find_by_email(self, email: str) -> dict[str, Any] | None:
        return await self.find_one({"email": email.lower().strip()})


class WorkspaceRepository(BaseRepository):
    def __init__(self):
        super().__init__("workspaces")

    async def find_by_uuid(self, uuid: str) -> dict[str, Any] | None:
        return await self.find_one({"uuid": uuid})

    async def find_by_user(self, user_id: str) -> list[dict[str, Any]]:
        return await self.find_many({"user_id": user_id}, sort=[("created_at", -1)])


class CampaignRepository(BaseRepository):
    def __init__(self):
        super().__init__("campaigns")

    async def find_by_workspace(self, workspace_id: str) -> list[dict[str, Any]]:
        return await self.find_many(
            {"workspace_id": workspace_id}, sort=[("created_at", -1)]
        )


class ConversationRepository(BaseRepository):
    def __init__(self):
        super().__init__("conversations")

    async def find_by_session(self, session_id: str) -> dict[str, Any] | None:
        return await self.find_one({"session_id": session_id})

    async def append_message(self, session_id: str, message: dict) -> bool:
        result = await self._col.update_one(
            {"session_id": session_id},
            {
                "$push": {"messages": message},
                "$set": {"updated_at": datetime.now(timezone.utc)},
            },
        )
        return result.modified_count > 0


class AssetRepository(BaseRepository):
    def __init__(self):
        super().__init__("assets")

    async def find_by_campaign(
        self, campaign_id: str, asset_type: str | None = None
    ) -> list[dict[str, Any]]:
        query: dict[str, Any] = {"campaign_id": campaign_id}
        if asset_type:
            query["type"] = asset_type
        return await self.find_many(query, sort=[("created_at", -1)])


class VersionRepository(BaseRepository):
    def __init__(self):
        super().__init__("versions")

    async def find_by_asset(self, asset_id: str) -> list[dict[str, Any]]:
        return await self.find_many(
            {"asset_id": asset_id}, sort=[("version", -1)]
        )


class AgentLogRepository(BaseRepository):
    def __init__(self):
        super().__init__("agent_logs")

    async def find_by_session(self, session_id: str) -> list[dict[str, Any]]:
        return await self.find_many(
            {"session_id": session_id}, sort=[("created_at", -1)]
        )

    async def get_total_cost(self, workspace_id: str) -> float:
        pipeline = [
            {"$match": {"workspace_id": workspace_id}},
            {"$group": {"_id": None, "total": {"$sum": "$cost_usd"}}},
        ]
        async for result in self._col.aggregate(pipeline):
            return result.get("total", 0.0)
        return 0.0


# Singleton instances
user_repo = UserRepository()
workspace_repo = WorkspaceRepository()
campaign_repo = CampaignRepository()
conversation_repo = ConversationRepository()
asset_repo = AssetRepository()
version_repo = VersionRepository()
agent_log_repo = AgentLogRepository()
