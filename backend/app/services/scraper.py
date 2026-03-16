import httpx
from bs4 import BeautifulSoup
from typing import List, Optional
from datetime import datetime
from app.models.base import ScrapedURL
import asyncio
import logging

try:
    from crawl4ai import AsyncWebCrawler
    CRAWL4AI_AVAILABLE = True
except ImportError:
    CRAWL4AI_AVAILABLE = False
    logging.warning("crawl4ai not installed. Falling back to simple HTTP scraper.")

class ScraperService:
    """Service to scrape content from URLs."""

    @staticmethod
    async def scrape_url(url: str) -> Optional[ScrapedURL]:
        """Scrapes a single URL and returns a ScrapedURL object."""
        if CRAWL4AI_AVAILABLE:
            def _run_isolated_crawl(target_url: str):
                import asyncio
                import sys
                
                # Setup a fresh Proactor loop for Windows Playwright compatibility
                if sys.platform == "win32":
                    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
                    loop = asyncio.ProactorEventLoop()
                else:
                    loop = asyncio.new_event_loop()
                
                asyncio.set_event_loop(loop)
                
                async def _do_crawl():
                    async with AsyncWebCrawler(verbose=False) as crawler:
                        return await crawler.arun(url=target_url)

                try:
                    result = loop.run_until_complete(_do_crawl())
                    if not result.success:
                        raise Exception(f"Crawl4AI failed: {getattr(result, 'error_message', 'Unknown Error')}")
                    
                    md_obj = getattr(result, 'markdown', None)
                    md_text = ""
                    if md_obj:
                        if hasattr(md_obj, 'fit_markdown') and md_obj.fit_markdown:
                            md_text = md_obj.fit_markdown
                        elif hasattr(md_obj, 'raw_markdown') and md_obj.raw_markdown:
                            md_text = md_obj.raw_markdown
                        elif isinstance(md_obj, str):
                            md_text = md_obj
                        else:
                            md_text = str(md_obj)
                            
                    logging.info(f"[Crawl4AI] Scraped {target_url} successfully. Extracted {len(md_text.split())} words.")
                    return ScrapedURL(
                        url=target_url,
                        extracted_text=md_text,
                        title=getattr(result, 'title', None),
                        scraped_at=datetime.utcnow()
                    )
                finally:
                    loop.close()

            try:
                # Run the blocking loop isolated in a worker thread so Uvicorn's loop is undisturbed
                return await asyncio.to_thread(_run_isolated_crawl, url)
            except Exception as e:
                logging.error(f"Error scraping {url} with crawl4ai: {e}")
                # Fallback to httpx handled below
                pass

        # Fallback to simple HTTP
        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                response = await client.get(url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                for script_or_style in soup(["script", "style"]):
                    script_or_style.decompose()

                title = soup.title.string if soup.title else None
                text = soup.get_text(separator=' ', strip=True)
                
                import re
                text = re.sub(r'\s+', ' ', text)

                logging.info(f"[HTTP Fallback] Scraped {url} successfully. Extracted {len(text.split())} words.")
                return ScrapedURL(
                    url=url,
                    extracted_text=text,
                    title=title,
                    scraped_at=datetime.utcnow()
                )
        except Exception as e:
            logging.error(f"Error scraping {url} with simple fallback: {e}")
            return None

    @classmethod
    async def scrape_multiple(cls, urls: List[str]) -> List[ScrapedURL]:
        """Scrapes multiple URLs in parallel."""
        import asyncio
        tasks = [cls.scrape_url(url) for url in urls]
        results = await asyncio.gather(*tasks)
        return [res for res in results if res is not None]
