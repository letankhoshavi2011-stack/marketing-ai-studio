"""Web scraper REST endpoint — scrape URLs for context."""

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.auth.dependencies import get_current_user
from app.core.database import get_database
from app.services.scraper import ScraperService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/workspaces/{workspace_uuid}/scrape", tags=["scraper"])


class ScrapeRequest(BaseModel):
    urls: List[str]


class ScrapeResult(BaseModel):
    url: str
    title: str | None = None
    extracted_text: str
    word_count: int = 0
    success: bool = True


@router.post("", response_model=List[ScrapeResult])
async def scrape_urls(
    workspace_uuid: str,
    body: ScrapeRequest,
    user: dict = Depends(get_current_user),
):
    """Scrape one or more URLs and return extracted text."""
    # Verify workspace ownership
    db = get_database()
    ws = await db.workspaces.find_one({"uuid": workspace_uuid, "user_id": user["_id"]})
    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    if not body.urls:
        return []

    # Limit to 5 URLs per request
    urls = body.urls[:5]

    results = await ScraperService.scrape_multiple(urls)

    response = []
    for scraped in results:
        text = scraped.extracted_text[:10000]  # Cap at 10k chars
        response.append(ScrapeResult(
            url=scraped.url,
            title=scraped.title,
            extracted_text=text,
            word_count=len(text.split()),
            success=True,
        ))

    # Also return failures
    succeeded_urls = {r.url for r in results}
    for url in urls:
        if url not in succeeded_urls:
            response.append(ScrapeResult(
                url=url,
                title=None,
                extracted_text="",
                word_count=0,
                success=False,
            ))

    logger.info("Scraped %d/%d URLs for workspace %s", len(results), len(urls), workspace_uuid)
    return response
