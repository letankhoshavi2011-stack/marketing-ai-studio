from contextvars import ContextVar
from typing import Any, Optional

user_id_ctx: ContextVar[Optional[str]] = ContextVar("user_id", default=None)
workspace_id_ctx: ContextVar[Optional[str]] = ContextVar("workspace_id", default=None)
campaign_id_ctx: ContextVar[Optional[str]] = ContextVar("campaign_id", default=None)
agent_name_ctx: ContextVar[Optional[str]] = ContextVar("agent_name", default=None)
gemini_attachments_ctx: ContextVar[list[dict[str, Any]]] = ContextVar("gemini_attachments", default=[])
