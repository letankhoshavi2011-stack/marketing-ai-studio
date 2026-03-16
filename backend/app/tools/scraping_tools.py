"""Web scraping tools using Crawl4AI for URL analysis."""

import json
import logging
import sys
import asyncio
from typing import Any

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from app.prompts import PromptLoader

logger = logging.getLogger(__name__)


async def scrape_url(url: str) -> str:
    """Scrape a URL and extract brand-relevant information.

    Uses Crawl4AI for modern async scraping.

    Args:
        url: The URL to scrape

    Returns:
        JSON string with extracted brand attributes
    """
    try:
        from crawl4ai import AsyncWebCrawler

        async with AsyncWebCrawler() as crawler:
            result = await crawler.arun(url=url)

            if not result.success:
                return json.dumps({"error": f"Failed to crawl {url}", "content": ""})

            # Extract relevant content
            extracted = {
                "url": url,
                "title": result.metadata.get("title", "") if result.metadata else "",
                "description": result.metadata.get("description", "") if result.metadata else "",
                "text_content": result.markdown[:5000] if result.markdown else "",
                "links": [],
                "images": [],
            }

            # Extract links
            if result.links:
                extracted["links"] = [
                    {"href": link.get("href", ""), "text": link.get("text", "")}
                    for link in result.links.get("internal", [])[:20]
                ]

            # Extract images
            if result.media:
                extracted["images"] = [
                    {"src": img.get("src", ""), "alt": img.get("alt", "")}
                    for img in result.media.get("images", [])[:20]
                ]

            return json.dumps(extracted)

    except Exception as e:
        logger.error("Scraping error for %s: %s", url, e)
        return json.dumps({"error": str(e), "url": url})


async def extract_brand_from_url(url: str) -> str:
    """Scrape a URL and extract brand attributes like colors, fonts, tone.

    Args:
        url: Website URL to analyze

    Returns:
        JSON string with brand attributes
    """
    raw_content = await scrape_url(url)

    # Use Gemini to analyze the scraped content
    from app.providers.gemini import generate_text

    prompt = PromptLoader.get_tool_prompt(
        "scraping_tools", "extract_brand_from_url", raw_content=raw_content
    )
    result = await generate_text(
        prompt, model="gemini-3.1-pro-preview", response_mime_type="application/json"
    )
    return result["text"]
