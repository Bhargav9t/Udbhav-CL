from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from typing import List

from .base import BaseScraper
from models.schema import Opportunity, OpportunityCategory

class DevpostScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.base_url = "https://devpost.com"

    def parse(self, url: str) -> List[Opportunity]:
        opportunities = []
        
        with sync_playwright() as p:
            browser, page = self.setup_browser(p, headless=True)
            try:
                print(f"Navigating to {url}...")
                page.goto(url, wait_until="domcontentloaded")
                self.random_delay(2, 4)
                
                # Scroll a bit to ensure lazy-loaded items might load, though devpost typically paginates
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                self.random_delay(1, 2)
                
                html_content = page.content()
                soup = BeautifulSoup(html_content, "html.parser")
                
                # Devpost hackathons are usually listed in elements with class 'hackathon-tile' or similar structure
                # We'll use a robust selector to find hackathon containers
                hackathon_cards = soup.select(".hackathon-tile")
                
                if not hackathon_cards:
                    # Fallback selector just in case Devpost layout changed
                    hackathon_cards = soup.select("div[data-role='featured-hackathons'] .clearfix, .clearfix .content")
                
                print(f"Found {len(hackathon_cards)} hackathons on the page.")
                
                for card in hackathon_cards:
                    try:
                        title_elem = card.select_one("h3") or card.select_one(".title")
                        if not title_elem:
                            continue
                        title = title_elem.get_text(strip=True)
                        
                        link_elem = card.find("a", href=True)
                        if not link_elem:
                            continue
                        link = link_elem["href"]
                        if not link.startswith("http"):
                            link = f"{self.base_url}{link}"
                            
                        # Extract organization (often not explicitly separate on the main card, but sometimes host is there)
                        org_elem = card.select_one(".host-label") or card.select_one(".organization")
                        organization = org_elem.get_text(strip=True) if org_elem else "Devpost Hackathon"
                        
                        # Extract deadline/dates
                        date_elem = card.select_one(".submission-period") or card.select_one(".date")
                        deadline = date_elem.get_text(strip=True) if date_elem else "TBA"
                        
                        # Extract summary/theme
                        theme_elem = card.select_one(".theme")
                        summary = theme_elem.get_text(strip=True) if theme_elem else f"Hackathon hosted by {organization}"
                        
                        opportunity = Opportunity(
                            title=title,
                            organization=organization,
                            category=OpportunityCategory.HACKATHON,
                            opportunity_link=link,
                            deadline=deadline,
                            summary=summary
                        )
                        opportunities.append(opportunity)
                    except Exception as e:
                        print(f"Error parsing a card: {e}")
                        continue
                        
            finally:
                browser.close()
                
        return opportunities
