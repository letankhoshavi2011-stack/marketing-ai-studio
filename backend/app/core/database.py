"""Async MongoDB connection via Motor + index creation."""

import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def get_database() -> AsyncIOMotorDatabase:
    """Return the active database handle.  Raises if not connected."""
    if _db is None:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    return _db


async def connect_db() -> None:
    """Open the Motor connection and select the database."""
    global _client, _db
    logger.info("Connecting to MongoDB at %s …", settings.mongodb_uri[:40])
    _client = AsyncIOMotorClient(settings.mongodb_uri)
    _db = _client[settings.mongodb_db_name]
    # Quick connectivity check
    await _client.admin.command("ping")
    logger.info("MongoDB connected — database: %s", settings.mongodb_db_name)


async def disconnect_db() -> None:
    """Close the Motor connection."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
        logger.info("MongoDB disconnected.")


async def create_indexes() -> None:
    """Create indexes for all collections on startup."""
    db = get_database()

    # Users
    await db.users.create_index("email", unique=True)

    # Workspaces
    await db.workspaces.create_index("uuid", unique=True)
    await db.workspaces.create_index("user_id")

    # Campaigns
    await db.campaigns.create_index("workspace_id")
    await db.campaigns.create_index([("workspace_id", 1), ("created_at", -1)])

    # Conversations
    await db.conversations.create_index("campaign_id")
    await db.conversations.create_index("session_id", unique=True)

    # Assets
    await db.assets.create_index("workspace_id")
    await db.assets.create_index("campaign_id")
    await db.assets.create_index([("campaign_id", 1), ("type", 1)])
    await db.assets.create_index("user_id")

    # Versions
    await db.versions.create_index("asset_id")
    await db.versions.create_index([("asset_id", 1), ("version", -1)])

    # Agent logs
    await db.agent_logs.create_index("session_id")
    await db.agent_logs.create_index([("session_id", 1), ("created_at", -1)])

    # Token blacklist (for JWT revocation)
    await db.token_blacklist.create_index("token", unique=True)
    await db.token_blacklist.create_index(
        "expires_at", expireAfterSeconds=0
    )  # TTL index

    # Prompt Library
    await db.prompt_library.create_index("prompt_id", unique=True)
    await db.prompt_library.create_index([("workspace_id", 1), ("agent_id", 1)])
    await db.prompt_library.create_index([("workspace_id", 1), ("category", 1)])

    # Workspace Documents
    await db.workspace_documents.create_index("workspace_id")
    await db.workspace_documents.create_index("campaign_id")
    await db.workspace_documents.create_index("source_card_id")
    await db.workspace_documents.create_index([("workspace_id", 1), ("created_at", -1)])
    await db.workspace_documents.create_index([("workspace_id", 1), ("campaign_id", 1), ("created_at", -1)])
    await db.workspace_documents.create_index([("workspace_id", 1), ("campaign_id", 1), ("agent_id", 1), ("created_at", -1)])

    # Analytics logs
    await db.analytics_logs.create_index("user_id")
    await db.analytics_logs.create_index([("workspace_id", 1), ("created_at", -1)])
    await db.analytics_logs.create_index("created_at")

    logger.info("MongoDB indexes created.")
