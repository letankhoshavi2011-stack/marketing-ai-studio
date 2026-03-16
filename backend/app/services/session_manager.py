"""Session management bridging ADK sessions with the application."""

import logging
from typing import AsyncGenerator

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part

from app.agents.orchestrator import MarketingOrchestrator, create_orchestrator

logger = logging.getLogger(__name__)

APP_NAME = "agents"


class SessionManager:
    """Manages ADK sessions and the Runner lifecycle."""

    def __init__(self):
        self._session_service = InMemorySessionService()
        self._orchestrator: MarketingOrchestrator | None = None
        self._runner: Runner | None = None

    def initialize(self) -> None:
        """Initialize the orchestrator and runner. Call once at startup."""
        logger.info("Initializing orchestrator and runner...")
        self._orchestrator = create_orchestrator()
        self._runner = Runner(
            agent=self._orchestrator,
            app_name=APP_NAME,
            session_service=self._session_service,
        )
        logger.info("Orchestrator and runner initialized.")

    @property
    def orchestrator(self) -> MarketingOrchestrator:
        if not self._orchestrator:
            raise RuntimeError("SessionManager not initialized. Call initialize() first.")
        return self._orchestrator

    @property
    def runner(self) -> Runner:
        if not self._runner:
            raise RuntimeError("SessionManager not initialized. Call initialize() first.")
        return self._runner

    async def create_session(
        self, user_id: str, session_id: str, initial_state: dict | None = None
    ) -> str:
        """Create a new ADK session for a user."""
        session = await self._session_service.create_session(
            app_name=APP_NAME,
            user_id=user_id,
            session_id=session_id,
            state=initial_state or {},
        )
        logger.info(f"Created ADK session: {session.id} for user: {user_id}")
        return session.id

    async def get_session(self, user_id: str, session_id: str):
        """Retrieve an existing ADK session."""
        return await self._session_service.get_session(
            app_name=APP_NAME,
            user_id=user_id,
            session_id=session_id,
        )

    async def run_turn(
        self, user_id: str, session_id: str, message: str
    ) -> AsyncGenerator:
        """Run a single conversation turn through the orchestrator.

        Yields ADK events as they are produced.
        """
        user_content = Content(
            role="user",
            parts=[Part(text=message)],
        )

        events = self.runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=user_content,
        )

        async for event in events:
            yield event

    async def update_session_state(
        self, user_id: str, session_id: str, state_updates: dict
    ) -> None:
        """Update state values in an existing session."""
        session = await self.get_session(user_id, session_id)
        if session:
            for key, value in state_updates.items():
                session.state[key] = value
