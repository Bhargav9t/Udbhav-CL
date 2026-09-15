from enum import Enum
from typing import Optional
from pydantic import BaseModel, HttpUrl

class OpportunityCategory(str, Enum):
    HACKATHON = "Hackathon"
    INTERNSHIP = "Internship"
    RESEARCH = "Research"
    JOB = "Job"

class Opportunity(BaseModel):
    title: str
    organization: str
    category: OpportunityCategory
    opportunity_link: HttpUrl
    deadline: Optional[str] = None
    summary: str
