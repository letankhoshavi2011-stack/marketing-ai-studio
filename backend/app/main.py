"""MarketingAI Studio — FastAPI application entry point.

Production-grade, AI-native marketing platform powered by Google ADK.
"""

import logging
import os
import sys
import asyncio
from contextlib import asynccontextmanager

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import connect_db, disconnect_db, create_indexes
from app.core.middleware import ContextMiddleware

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)


# ─── Lifespan ──────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    # Startup
    logger.info("🚀 Starting MarketingAI Studio (%s)", settings.environment)
    
    await connect_db()
    await create_indexes()
    logger.info("✅ MongoDB connected — indexes ensured")

    from app.db.seed_prompts import seed_default_prompts
    await seed_default_prompts()
    logger.info("✅ Default prompts seeded")

    logger.info("🤖 ADK agents will initialize lazily on first request")
    logger.info("✨ MarketingAI Studio is ready on port %d", settings.port)
    yield

    # Shutdown
    logger.info("🛑 Shutting down MarketingAI Studio…")
    await disconnect_db()
    logger.info("✅ Shutdown complete")


# ─── Application ───────────────────────────────────────────────────

app = FastAPI(
    title="MarketingAI Studio",
    description=(
        "Production-grade, AI-native, multi-agent marketing platform. "
        "30 specialized agents powered by Google ADK & Gemini for end-to-end "
        "brand, campaign, image, video, and content creation."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ─── CORS ──────────────────────────────────────────────────────────

app.add_middleware(ContextMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5174",
        "http://localhost:8002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Routers ───────────────────────────────────────────────────────

from app.auth.router import router as auth_router          # noqa: E402
from app.workspaces.router import router as workspace_router  # noqa: E402
from app.workspaces.documents_router import router as knowledge_router # noqa: E402
from app.campaigns.router import router as campaign_router   # noqa: E402
from app.campaigns.cards_router import router as cards_router # noqa: E402
from app.analytics.router import router as analytics_router  # noqa: E402
from app.agents.api_router import router as agents_router    # noqa: E402
from app.workspaces.prompts_router import router as prompts_router  # noqa: E402
from app.workspaces.scraper_router import router as scraper_router  # noqa: E402
from app.workspaces.assets_router import router as assets_router  # noqa: E402

app.include_router(auth_router,      prefix="/api")
app.include_router(workspace_router, prefix="/api")
app.include_router(knowledge_router, prefix="/api")
app.include_router(prompts_router,   prefix="/api")
app.include_router(scraper_router,   prefix="/api")
app.include_router(campaign_router,  prefix="/api")
app.include_router(cards_router,     prefix="/api")
app.include_router(agents_router,    prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(assets_router,    prefix="/api")

# Serve static files for local fallback
os.makedirs("assets", exist_ok=True)
app.mount("/assets", StaticFiles(directory="assets"), name="assets")


# ─── Health & Info ─────────────────────────────────────────────────

@app.get("/health", tags=["system"])
async def health_check():
    """Liveness probe — MongoDB connectivity check."""
    try:
        from app.core.database import get_database
        db = get_database()
        await db.command("ping")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "service": "MarketingAI Studio",
        "version": "1.0.0",
        "environment": settings.environment,
        "database": db_status,
    }


@app.get("/api/agents", tags=["system"])
async def list_agents():
    """List all available AI agents."""
    from app.agents.registry import list_agent_names
    return {"agents": list_agent_names(), "total": len(list_agent_names())}


# ─── Global Exception Handler ─────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Check logs for details."},
    )
