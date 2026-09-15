import json
import os
from dotenv import load_dotenv
from supabase import create_client, Client

from scrapers.devpost import DevpostScraper
from scrapers.unstop import UnstopScraper
from scrapers.linkedin import LinkedInScraper
from scrapers.research import ResearchScraper

def main():
    print("Initializing Career-ladder Scraping System...")
    
    # Load environment variables
    load_dotenv()
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    supabase: Client | None = None
    if url and key and url != "your_supabase_project_url_here":
        supabase = create_client(url, key)
    else:
        print("Warning: Supabase credentials not configured in .env file.")
    
    scrapers_config = [
        (DevpostScraper(), "https://devpost.com/hackathons"),
        (DevpostScraper(), "https://devpost.com/hackathons?page=2"),
        (DevpostScraper(), "https://devpost.com/hackathons?page=3"),
        (UnstopScraper(), "https://unstop.com/hackathons"),
        (UnstopScraper(), "https://unstop.com/hackathons?page=2"),
        (LinkedInScraper(), "https://www.linkedin.com/jobs/search/?keywords=software%20engineer"),
        (ResearchScraper(), "https://www.nsf.gov/crssprgm/reu/list_result.jsp?unitid=5049"),
        (ResearchScraper(), "https://www.nsf.gov/crssprgm/reu/list_result.jsp?unitid=5048"),
        (ResearchScraper(), "https://www.nsf.gov/crssprgm/reu/list_result.jsp?unitid=5052")
    ]
    
    all_opportunities = []
    
    for scraper, target_url in scrapers_config:
        print(f"\n--- Running {scraper.__class__.__name__} ---")
        opportunities = scraper.parse(target_url)
        all_opportunities.extend(opportunities)
    
    # Convert validated Pydantic models to JSON
    json_output = [opp.model_dump(mode='json') for opp in all_opportunities]
    
    print(f"\nScraped a total of {len(json_output)} validated opportunities.")
    
    if supabase and json_output:
        try:
            print("Pushing data to Supabase table 'opportunities'...")
            # We assume a table named 'opportunities' exists.
            response = supabase.table("opportunities").insert(json_output).execute()
            print("Successfully pushed data to Supabase!")
        except Exception as e:
            print(f"Error pushing data to Supabase: {e}")
    else:
        print("Skipping Supabase push. Data preview:")
        print(json.dumps(json_output, indent=2))

if __name__ == "__main__":
    main()
