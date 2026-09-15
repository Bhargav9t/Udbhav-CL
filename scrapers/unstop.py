import re
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from typing import List

from .base import BaseScraper
from models.schema import Opportunity, OpportunityCategory

class UnstopScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.base_url = "https://unstop.com"

    def parse(self, url: str) -> List[Opportunity]:
        opportunities = []
        
        with sync_playwright() as p:
            # Note: Unstop often tries to detect headless browsers, so having user-agent rotation helps
            browser, page = self.setup_browser(p, headless=True)
            try:
                print(f"Navigating to {url}...")
                # networkidle is better for SPAs like Unstop
                page.goto(url, wait_until="networkidle")
                self.random_delay(3, 6)
                
                # Scroll multiple times to trigger infinite scroll/lazy loading
                for _ in range(3):
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    self.random_delay(1, 2)
                
                html_content = page.content()
                soup = BeautifulSoup(html_content, "html.parser")
                
                # Unstop's classes are often obfuscated, so we look for generic card wrappers
                # Usually they use 'app-competition-listing' or generic 'div' with specific child structure
                # A common pattern is looking for anchor tags wrapping the entire card
                cards = soup.find_all("div", class_=re.compile("listing-card|competition-card|card"))
                
                if not cards:
                    # Alternative approach: Find links that look like hackathon details
                    links = soup.find_all("a", href=re.compile(r"/hackathons/"))
                    cards = [link.parent for link in links if link.parent]
                
                print(f"Found {len(cards)} potential hackathons on Unstop.")
                
                seen_titles = set()
                
                for card in cards:
                    try:
                        # Find title
                        title_elem = card.find(["h2", "h3"])
                        if not title_elem:
                            continue
                        title = title_elem.get_text(strip=True)
                        
                        if title in seen_titles:
                            continue
                        seen_titles.add(title)
                        
                        # Find link
                        link_elem = card.find("a", href=True) if card.name != "a" else card
                        if not link_elem and card.parent.name == "a":
                            link_elem = card.parent
                            
                        link = link_elem["href"] if link_elem else url
                        if not link.startswith("http"):
                            link = f"{self.base_url}{link}"
                            
                        # Find organization (usually the next text element after title or in a specific p tag)
                        org_elem = card.find("p", class_=re.compile("org|institute|company", re.I))
                        organization = org_elem.get_text(strip=True) if org_elem else "Unstop Host"
                        
                        # Find deadline / days left
                        deadline_elem = card.find(string=re.compile(r"days left|deadline|ends in", re.I))
                        deadline = deadline_elem.strip() if deadline_elem else "TBA"
                        
                        # Tags or summary
                        tags = [span.get_text(strip=True) for span in card.find_all("span") if len(span.get_text(strip=True)) > 2]
                        summary = ", ".join(tags[:3]) if tags else f"Hackathon on Unstop hosted by {organization}"
                        
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
                        print(f"Error parsing an Unstop card: {e}")
                        continue
                        
            finally:
                browser.close()
                
        return opportunities
