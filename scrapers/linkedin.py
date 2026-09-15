import re
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from typing import List

from .base import BaseScraper
from models.schema import Opportunity, OpportunityCategory

class LinkedInScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.base_url = "https://www.linkedin.com"

    def parse(self, url: str) -> List[Opportunity]:
        opportunities = []
        
        with sync_playwright() as p:
            # LinkedIn is very aggressive against bots. Headless mode might be detected,
            # but we use a real user agent and delays.
            browser, page = self.setup_browser(p, headless=True)
            try:
                print(f"Navigating to {url}...")
                page.goto(url, wait_until="domcontentloaded")
                self.random_delay(2, 5)
                
                # Scroll to load more jobs if pagination is lazy
                for _ in range(2):
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    self.random_delay(1, 3)
                
                html_content = page.content()
                soup = BeautifulSoup(html_content, "html.parser")
                
                # LinkedIn public job search uses base-card classes
                job_cards = soup.find_all("div", class_="base-card")
                
                if not job_cards:
                    job_cards = soup.find_all("li", class_=re.compile("job-result-card|jobs-search-results__list-item"))
                
                print(f"Found {len(job_cards)} jobs on LinkedIn.")
                
                for card in job_cards:
                    try:
                        title_elem = card.find(["h3", "h4"], class_=re.compile("title"))
                        if not title_elem:
                            continue
                        title = title_elem.get_text(strip=True)
                        
                        org_elem = card.find(["h4", "a"], class_=re.compile("subtitle|company-name"))
                        organization = org_elem.get_text(strip=True) if org_elem else "Unknown Company"
                        
                        link_elem = card.find("a", class_=re.compile("base-card__full-link|job-search-card__link"), href=True)
                        link = link_elem["href"] if link_elem else url
                        # Remove tracking params from URL to keep it clean
                        link = link.split("?")[0] if "?" in link else link
                        
                        loc_elem = card.find("span", class_=re.compile("location"))
                        location = loc_elem.get_text(strip=True) if loc_elem else ""
                        
                        time_elem = card.find("time")
                        deadline = time_elem.get_text(strip=True) if time_elem else "Open"
                        
                        summary = f"Job Location: {location}" if location else "LinkedIn Job Posting"
                        
                        opportunity = Opportunity(
                            title=title,
                            organization=organization,
                            category=OpportunityCategory.JOB,
                            opportunity_link=link,
                            deadline=deadline,
                            summary=summary
                        )
                        opportunities.append(opportunity)
                    except Exception as e:
                        print(f"Error parsing a LinkedIn card: {e}")
                        continue
                        
            finally:
                browser.close()
                
        return opportunities
