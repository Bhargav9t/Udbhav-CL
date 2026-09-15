from abc import ABC, abstractmethod
import random
import time
from playwright.sync_api import sync_playwright, Browser, Page
from typing import List, Any

class BaseScraper(ABC):
    def __init__(self):
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.2; rv:109.0) Gecko/20100101 Firefox/121.0"
        ]
        
    def get_random_user_agent(self) -> str:
        return random.choice(self.user_agents)
        
    def random_delay(self, min_seconds: float = 2.0, max_seconds: float = 5.0):
        """Implement a random delay to mimic human behavior."""
        delay = random.uniform(min_seconds, max_seconds)
        time.sleep(delay)

    @abstractmethod
    def parse(self, url: str) -> List[Any]:
        """
        Abstract method to be implemented by subclasses.
        Should return a list of Pydantic model instances.
        """
        pass
        
    def setup_browser(self, p, headless: bool = True) -> tuple[Browser, Page]:
        """
        Helper to setup the Playwright browser.
        headless=True is optimized for lower resource usage.
        """
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context(user_agent=self.get_random_user_agent())
        page = context.new_page()
        return browser, page
