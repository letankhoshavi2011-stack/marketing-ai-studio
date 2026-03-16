"""WebSocket connection lifecycle management."""

import logging
from datetime import datetime, timezone

from fastapi import WebSocket

from app.models.messages import WSMessage, WSMessageType

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages active WebSocket connections."""

    def __init__(self):
        self._connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, session_id: str) -> None:
        """Accept and register a WebSocket connection."""
        await websocket.accept()
        self._connections[session_id] = websocket
        logger.info(f"WebSocket connected: {session_id}")

    def disconnect(self, session_id: str) -> None:
        """Remove a WebSocket connection."""
        self._connections.pop(session_id, None)
        logger.info(f"WebSocket disconnected: {session_id}")

    async def send_message(self, session_id: str, message: WSMessage) -> None:
        """Send a typed message to a specific connection."""
        ws = self._connections.get(session_id)
        if ws:
            await ws.send_json(message.model_dump(mode="json"))

    async def send_agent_thinking(
        self, session_id: str, agent_name: str, status: str
    ) -> None:
        """Send an agent thinking/progress notification."""
        await self.send_message(
            session_id,
            WSMessage(
                type=WSMessageType.AGENT_THINKING,
                payload={"agent_name": agent_name, "status": status},
                session_id=session_id,
            ),
        )

    async def send_agent_response(
        self, session_id: str, agent_name: str, text: str, data: dict | None = None
    ) -> None:
        """Send an agent response with optional structured data."""
        await self.send_message(
            session_id,
            WSMessage(
                type=WSMessageType.AGENT_RESPONSE,
                payload={
                    "agent_name": agent_name,
                    "text": text,
                    "data": data or {},
                },
                session_id=session_id,
            ),
        )

    async def send_asset_generated(
        self, session_id: str, asset_type: str, url: str = "", data: dict | None = None
    ) -> None:
        """Send notification that a media asset was generated."""
        await self.send_message(
            session_id,
            WSMessage(
                type=WSMessageType.ASSET_GENERATED,
                payload={
                    "asset_type": asset_type,
                    "url": url,
                    "data": data or {},
                },
                session_id=session_id,
            ),
        )

    async def send_context_updated(
        self, session_id: str, version_number: int, changes: dict
    ) -> None:
        """Send notification that context was updated to a new version."""
        await self.send_message(
            session_id,
            WSMessage(
                type=WSMessageType.CONTEXT_UPDATED,
                payload={
                    "version_number": version_number,
                    "changes": changes,
                },
                session_id=session_id,
            ),
        )

    async def send_error(
        self, session_id: str, error: str, details: str = ""
    ) -> None:
        """Send an error message."""
        await self.send_message(
            session_id,
            WSMessage(
                type=WSMessageType.ERROR,
                payload={"error": error, "details": details},
                session_id=session_id,
            ),
        )

    @property
    def active_count(self) -> int:
        return len(self._connections)
