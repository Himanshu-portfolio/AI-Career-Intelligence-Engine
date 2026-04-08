import httpx
from bs4 import BeautifulSoup


async def scrape_greenhouse(company_slug: str) -> list[dict]:
    url = f"https://boards.greenhouse.io/{company_slug}"
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url)
    if resp.status_code != 200:
        return []
    soup = BeautifulSoup(resp.text, "html.parser")
    jobs = []
    for opening in soup.select("div.opening"):
        a_tag = opening.find("a")
        if a_tag:
            jobs.append({
                "title": a_tag.get_text(strip=True),
                "url": f"https://boards.greenhouse.io{a_tag.get('href', '')}",
                "source": "greenhouse",
            })
    return jobs


async def scrape_lever(company_slug: str) -> list[dict]:
    url = f"https://jobs.lever.co/{company_slug}"
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url)
    if resp.status_code != 200:
        return []
    soup = BeautifulSoup(resp.text, "html.parser")
    jobs = []
    for posting in soup.select("div.posting"):
        a_tag = posting.select_one("a.posting-title")
        title = posting.select_one("h5")
        if a_tag:
            jobs.append({
                "title": title.get_text(strip=True) if title else a_tag.get_text(strip=True),
                "url": a_tag.get("href", ""),
                "source": "lever",
            })
    return jobs


async def fetch_job_description(url: str) -> str:
    async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
        resp = await client.get(url)
    if resp.status_code != 200:
        return ""
    soup = BeautifulSoup(resp.text, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    return soup.get_text(separator="\n", strip=True)[:5000]


async def scrape_jobs(company_slug: str, platform: str = "greenhouse") -> list[dict]:
    if platform == "greenhouse":
        return await scrape_greenhouse(company_slug)
    elif platform == "lever":
        return await scrape_lever(company_slug)
    return []
