import re
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from typing import List

from .base import BaseScraper
from models.schema import Opportunity, OpportunityCategory

class ResearchScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.base_url = "https://www.nsf.gov"

    def parse(self, url: str) -> List[Opportunity]:
        opportunities = []
        
        with sync_playwright() as p:
            browser, page = self.setup_browser(p, headless=True)
            try:
                print(f"Navigating to {url}...")
                page.goto(url, wait_until="domcontentloaded")
                self.random_delay(2, 4)
                
                html_content = page.content()
                soup = BeautifulSoup(html_content, "html.parser")
                
                # NSF REU pages use tables for listings
                table = soup.find("table", class_=re.compile("table", re.I))
                
                if not table:
                    # Fallback if no table class is found, find the largest table
                    tables = soup.find_all("table")
                    if tables:
                        table = max(tables, key=lambda t: len(t.find_all("tr")))
                
                if table:
                    rows = table.find_all("tr")[1:] # Skip header
                    print(f"Found {len(rows)} potential research opportunities.")
                    
                    for row in rows:
                        try:
                            cols = row.find_all(["td", "th"])
                            if len(cols) < 2:
                                continue
                                
                            # Usually the first column is the site/title and the second is the organization/location
                            title_elem = cols[0].find("a")
                            if not title_elem:
                                continue
                                
                            title = title_elem.get_text(strip=True)
                            link = title_elem["href"]
                            if not link.startswith("http"):
                                link = f"{self.base_url}/crssprgm/reu/{link}"
                                
                            organization = cols[1].get_text(strip=True) if len(cols) > 1 else "NSF REU Site"
                            
                            # Deadline isn't always standard, so we might extract dates if available
                            summary_text = " ".join([c.get_text(strip=True) for c in cols[2:]])
                            deadline = "See site for details"
                            
                            opportunity = Opportunity(
                                title=f"REU: {title}",
                                organization=organization,
                                category=OpportunityCategory.RESEARCH,
                                opportunity_link=link,
                                deadline=deadline,
                                summary=summary_text[:200] + "..." if len(summary_text) > 200 else summary_text
                            )
                            opportunities.append(opportunity)
                        except Exception as e:
                            print(f"Error parsing research row: {e}")
                            continue
                            
            finally:
                browser.close()
                
        return opportunities
