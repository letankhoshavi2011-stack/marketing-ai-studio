"""WebSocket message handlers — bridge between WS messages and the ADK orchestrator."""

import json
import logging
import traceback

from app.models.context import ContextDelta
from app.models.messages import WSMessage, WSMessageType
from app.services.campaign_manager import CampaignManager
from app.services.context_manager import ContextManager
from app.services.session_manager import SessionManager
from app.websocket.connection_manager import ConnectionManager

logger = logging.getLogger(__name__)


class WebSocketHandler:
    """Dispatches incoming WebSocket messages to the appropriate handler."""

    def __init__(
        self,
        connection_manager: ConnectionManager,
        session_manager: SessionManager,
        context_manager: ContextManager,
        campaign_manager: CampaignManager,
    ):
        self._connections = connection_manager
        self._sessions = session_manager
        self._contexts = context_manager
        self._campaigns = campaign_manager

        # Track session_id -> (user_id, campaign_id) mapping
        self._session_metadata: dict[str, dict] = {}

    async def handle(self, session_id: str, raw_message: str) -> None:
        """Parse and dispatch a raw WebSocket message."""
        try:
            data = json.loads(raw_message)
            message = WSMessage(**data)
            message.session_id = session_id

            handler_map = {
                WSMessageType.START_CAMPAIGN: self._handle_start_campaign,
                WSMessageType.USER_MESSAGE: self._handle_user_message,
                WSMessageType.FEEDBACK: self._handle_user_message,  # Feedback flows through the same pipeline
            }

            handler = handler_map.get(message.type)
            if handler:
                await handler(session_id, message)
            else:
                await self._connections.send_error(
                    session_id, f"Unknown message type: {message.type}"
                )

        except json.JSONDecodeError:
            await self._connections.send_error(session_id, "Invalid JSON message")
        except Exception as e:
            logger.error(f"Handler error: {e}\n{traceback.format_exc()}")
            await self._connections.send_error(session_id, str(e))

    async def _handle_start_campaign(
        self, session_id: str, message: WSMessage
    ) -> None:
        """Create a new campaign, context, and ADK session."""
        user_id = message.payload.get("user_id", "default_user")
        campaign_name = message.payload.get("name", "Untitled Campaign")

        # Create campaign in DB
        campaign = await self._campaigns.create_campaign(user_id, campaign_name)

        # Create initial context version
        await self._contexts.create_initial_context(campaign.id)

        # Create ADK session with all template variable defaults pre-populated
        initial_state = ContextManager.get_default_state(campaign.id)
        adk_session_id = await self._sessions.create_session(
            user_id=user_id,
            session_id=session_id,
            initial_state=initial_state,
        )

        # Track metadata
        self._session_metadata[session_id] = {
            "user_id": user_id,
            "campaign_id": campaign.id,
        }

        # Notify client
        await self._connections.send_message(
            session_id,
            WSMessage(
                type=WSMessageType.CAMPAIGN_CREATED,
                payload={
                    "campaign_id": campaign.id,
                    "campaign_name": campaign.name,
                    "session_id": session_id,
                },
                session_id=session_id,
            ),
        )

    async def _handle_user_message(
        self, session_id: str, message: WSMessage
    ) -> None:
        """Process a user message through the ADK orchestrator."""
        metadata = self._session_metadata.get(session_id)
        if not metadata:
            await self._connections.send_error(
                session_id, "No active campaign. Send start_campaign first."
            )
            return

        user_id = metadata["user_id"]
        campaign_id = metadata["campaign_id"]
        user_text = message.payload.get("text", "")

        if not user_text:
            return

        # Sync current context to ADK state
        current_version = await self._contexts.get_current_context(campaign_id)
        if current_version:
            adk_session = await self._sessions.get_session(user_id, session_id)
            if adk_session:
                ContextManager.sync_context_to_adk_state(
                    current_version.context, adk_session.state
                )
                adk_session.state["current_version"] = str(current_version.version_number)

        # Send thinking indicator
        await self._connections.send_agent_thinking(
            session_id, "MarketingOrchestrator", "Processing your request..."
        )

        # Run the orchestrator
        try:
            last_agent = ""
            async for event in self._sessions.run_turn(user_id, session_id, user_text):
                # Stream events to the client
                agent_name = event.author or "System"

                # Send thinking updates when agent changes
                if agent_name != last_agent and agent_name != "MarketingOrchestrator":
                    last_agent = agent_name
                    await self._connections.send_agent_thinking(
                        session_id, agent_name, f"{agent_name} is working..."
                    )

                # Send final responses
                if event.is_final_response() and event.content and event.content.parts:
                    text = event.content.parts[0].text if event.content.parts[0].text else ""
                    if text:
                        await self._connections.send_agent_response(
                            session_id, agent_name, text
                        )

            # After all agents complete, extract outputs and update context
            adk_session = await self._sessions.get_session(user_id, session_id)
            if adk_session:
                delta = ContextManager.extract_outputs_from_adk_state(adk_session.state)
                if delta.changes:
                    new_version = await self._contexts.apply_delta(campaign_id, delta)

                    # Send asset_generated events for any new images/videos
                    for img in delta.changes.get("images", []):
                        await self._connections.send_asset_generated(
                            session_id,
                            asset_type="image",
                            data=img if isinstance(img, dict) else {"url": str(img)},
                        )
                    for vid in delta.changes.get("videos", []):
                        await self._connections.send_asset_generated(
                            session_id,
                            asset_type="video",
                            data=vid if isinstance(vid, dict) else {"url": str(vid)},
                        )

                    # Send context update (without large base64 data)
                    summary = {
                        k: v for k, v in delta.changes.items()
                        if k not in ("images", "videos")
                    }
                    if delta.changes.get("images"):
                        summary["images"] = f"{len(delta.changes['images'])} image(s) generated"
                    if delta.changes.get("videos"):
                        summary["videos"] = f"{len(delta.changes['videos'])} video(s) generated"
                    await self._connections.send_context_updated(
                        session_id,
                        new_version.version_number,
                        summary,
                    )

        except Exception as e:
            logger.error(f"Orchestrator error: {e}\n{traceback.format_exc()}")
            await self._connections.send_error(
                session_id, f"Processing failed: {str(e)}"
            )
