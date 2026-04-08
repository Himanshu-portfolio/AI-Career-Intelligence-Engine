import aiohttp
from bs4 import BeautifulSoup
from app.shared.embeddings.service import embed_single
from typing import Optional
import re

COMPANY_CAREER_URLS = {
    "google": "https://careers.google.com/jobs/results/",
    "microsoft": "https://careers.microsoft.com/us/en/search-results",
    "amazon": "https://www.amazon.jobs/en/search",
    "meta": "https://www.metacareers.com/jobs/",
    "apple": "https://jobs.apple.com/en-us/search",
    "netflix": "https://jobs.netflix.com/",
    "uber": "https://www.uber.com/en-IN/careers/list/",
    "airbnb": "https://careers.airbnb.com/positions/",
    "stripe": "https://stripe.com/jobs/search",
    "github": "https://github.com/about/careers",
    "gitlab": "https://about.gitlab.com/jobs/",
    "shopify": "https://www.shopify.com/careers",
    "twilio": "https://www.twilio.com/en-us/company/careers",
    "datadog": "https://www.datadoghq.com/careers/",
    "figma": "https://www.figma.com/careers/",
}

async def scrape_company_jobs(company_name: str, custom_url: Optional[str] = None) -> list[dict]:
    """Scrape jobs from company career page"""
    url = custom_url or COMPANY_CAREER_URLS.get(company_name.lower())
    if not url:
        raise ValueError(f"No career URL found for {company_name}")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status != 200:
                    return []
                
                html = await resp.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                jobs = []
                # Generic job extraction - looks for common patterns
                job_elements = soup.find_all(['div', 'li'], class_=re.compile(r'job|position|listing', re.I))
                
                for elem in job_elements[:20]:  # Limit to 20 jobs
                    title_elem = elem.find(['h2', 'h3', 'a'], class_=re.compile(r'title|name', re.I))
                    link_elem = elem.find('a', href=True)
                    
                    if title_elem and link_elem:
                        jobs.append({
                            "title": title_elem.get_text(strip=True),
                            "url": link_elem.get('href'),
                            "company": company_name,
                            "source": "web_scrape"
                        })
                
                return jobs
    except Exception as e:
        print(f"Error scraping {company_name}: {e}")
        return []

async def match_jobs_to_skills(jobs: list[dict], user_skills: dict) -> list[dict]:
    """Match jobs to user skills using embeddings"""
    matched = []
    
    user_skill_text = " ".join([
        f"{skill}: {level}" for skill, level in user_skills.items()
    ])
    user_embedding = embed_single(user_skill_text)
    
    for job in jobs:
        job_embedding = embed_single(job["title"])
        
        # Simple cosine similarity
        similarity = sum(a*b for a, b in zip(user_embedding, job_embedding)) / (
            (sum(a*a for a in user_embedding)**0.5) * (sum(b*b for b in job_embedding)**0.5) + 1e-10
        )
        
        if similarity > 0.5:  # Threshold
            matched.append({**job, "match_score": round(similarity * 100, 1)})
    
    return sorted(matched, key=lambda x: x["match_score"], reverse=True)

async def add_custom_company(company_name: str, career_url: str) -> dict:
    """Add custom company to scraping list"""
    COMPANY_CAREER_URLS[company_name.lower()] = career_url
    return {"company": company_name, "url": career_url, "status": "added"}
