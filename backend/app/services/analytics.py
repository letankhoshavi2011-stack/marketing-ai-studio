"""Analytics service — logs token usage and costs to MongoDB."""

import logging
from datetime import datetime, timezone
from typing import Any

from app.core.database import get_database
from app.models.analytics_log import AnalyticsLog
from app.core.config import settings
from app.core.context_vars import user_id_ctx, workspace_id_ctx, campaign_id_ctx, agent_name_ctx

logger = logging.getLogger(__name__)

# Cost per 1K tokens (Gemini 1.5 official rates)
# Pro: $1.25/1M in ($0.00125/1k), $5.00/1M out ($0.005/1k)
# Flash: $0.075/1M in ($0.000075/1k), $0.30/1M out ($0.0003/1k)
MODEL_COSTS = {
    "gemini-3.1-pro-preview": {"input": 0.00125, "output": 0.005},
    "gemini-3.1-flash-image-preview": {"input": 0.0, "output": 0.067},  # $0.067 per image (modeled as 1k output tokens)
    "veo-3.1-fast-generate-preview": {"input": 0.02, "output": 0.02},  # Placeholder for Veo calls
}


class AnalyticsService:
    """Service for tracking LLM usage, tokens, and costs."""

    @staticmethod
    async def log_usage(
        user_id: str,
        model_name: str,
        tokens_input: int,
        tokens_output: int,
        workspace_id: str | None = None,
        campaign_id: str | None = None,
        agent_name: str = "unknown",
        request_type: str = "text",
        prompt: str | None = None,
        response: str | None = None,
        latency_ms: float = 0.0,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        """Log token usage for a model call."""
        if not settings.analytics_enabled:
            return

        # Attempt to recover context if missing
        if user_id == "system":
            user_id = user_id_ctx.get() or user_id
        if workspace_id is None:
            workspace_id = workspace_id_ctx.get()
        if campaign_id is None:
            campaign_id = campaign_id_ctx.get()
        if agent_name == "unknown":
            agent_name = agent_name_ctx.get() or agent_name

        try:
            db = get_database()
            
            # Calculate cost
            costs = MODEL_COSTS.get(model_name, {"input": 0.00002, "output": 0.00004})
            cost_usd = (tokens_input / 1000 * costs["input"]) + (tokens_output / 1000 * costs["output"])

            log_entry = AnalyticsLog(
                user_id=user_id,
                workspace_id=workspace_id,
                campaign_id=campaign_id,
                model_name=model_name,
                tokens_input=tokens_input,
                tokens_output=tokens_output,
                cost_usd=cost_usd,
                agent_name=agent_name,
                request_type=request_type,
                prompt=prompt,
                response=response,
                latency_ms=latency_ms,
                metadata=metadata or {},
            )

            await db.analytics_logs.insert_one(log_entry.model_dump(by_alias=True, exclude_none=True))
            
            # Write to a debug file we can check
            with open("analytics_debug.log", "a") as f:
                f.write(f"{datetime.now(timezone.utc)} | LOGGED: user={user_id} workspace={workspace_id} agent={agent_name} model={model_name}\n")

            logger.info(
                "Analytics: Logged usage for %s (Agent: %s, User: %s) — %d in / %d out tokens ($%.6f)",
                model_name, agent_name, user_id, tokens_input, tokens_output, cost_usd
            )
        except Exception as e:
            logger.error("Failed to log analytics: %s", e)

analytics_service = AnalyticsService()
