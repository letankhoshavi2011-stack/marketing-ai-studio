import logging
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.context_vars import user_id_ctx, workspace_id_ctx
from app.auth.dependencies import get_current_user
from app.core.database import get_database

logger = logging.getLogger(__name__)

class ContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Reset context
        user_id_ctx.set(None)
        workspace_id_ctx.set(None)

        # Try to get user from token if available (simple check)
        # Note: We can't easily use Depends(get_current_user) here because it's a middleware
        # but we can try to extract it if needed, or let the router set it.
        # For now, we'll rely on routers setting the context or specific middleware logic.
        
        # Capture workspace_id from path if present
        # Format: /api/workspaces/{workspace_uuid}/...
        path_segments = request.url.path.split("/")
        if "workspaces" in path_segments:
            idx = path_segments.index("workspaces")
            if len(path_segments) > idx + 1:
                workspace_id_ctx.set(path_segments[idx + 1])

        response = await call_next(request)
        return response
