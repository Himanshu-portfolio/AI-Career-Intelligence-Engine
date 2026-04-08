from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.core.database import get_db
from app.core.schemas import ProfileSetup, JobInput, ProgressUpdate, MockQuestionRequest, AnswerSubmission
from app.core.models import UserProfile, Job

router = APIRouter()


# ── PROFILE & RESUME ──

@router.post("/profile/resume")
async def upload_resume(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    from app.modules.resume_match.service import extract_text_from_file, analyze_resume
    from app.shared.embeddings.service import embed_single
    text = await extract_text_from_file(file)
    profile_data = await analyze_resume(text)
    embedding = embed_single(text[:1000]).tolist()

    user = UserProfile(
        name=profile_data.get("name", "User"),
        resume_text=text,
        parsed_profile=profile_data,
        embedding=embedding,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"user_id": str(user.id), "profile": profile_data}


@router.get("/profile/{user_id}")
async def get_profile(user_id: str, db: AsyncSession = Depends(get_db)):
    user = await db.get(UserProfile, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return {
        "id": str(user.id), "name": user.name,
        "parsed_profile": user.parsed_profile,
        "target_role": user.target_role,
        "target_companies": user.target_companies,
        "dsa_level": user.dsa_level,
        "backend_level": user.backend_level,
        "system_design_level": user.system_design_level,
        "hours_per_week": user.hours_per_week,
    }


@router.put("/profile/{user_id}/setup")
async def setup_profile(user_id: str, body: ProfileSetup, db: AsyncSession = Depends(get_db)):
    user = await db.get(UserProfile, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    user.target_role = body.target_role
    user.target_companies = body.target_companies
    user.dsa_level = body.dsa_level
    user.backend_level = body.backend_level
    user.system_design_level = body.system_design_level
    user.hours_per_week = body.hours_per_week
    await db.commit()
    return {"status": "updated"}


# ── JOB INTELLIGENCE ──

@router.post("/jobs/{user_id}/match")
async def match_job(user_id: str, body: JobInput, db: AsyncSession = Depends(get_db)):
    from app.modules.resume_match.service import process_job_match
    from app.modules.notifications.service import notify_job_match
    result = await process_job_match(db, user_id, body.job_text, body.url, body.source)
    match = result["match"]
    await notify_job_match(
        result["analysis"].get("title", ""), result["analysis"].get("company", ""),
        match.get("match_score", 0), match.get("priority", "SKIP"), body.url,
    )
    return result


@router.get("/jobs/{user_id}")
async def list_jobs(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Job).where(Job.user_id == user_id).order_by(Job.match_score.desc())
    )
    jobs = result.scalars().all()
    return [
        {
            "id": str(j.id), "title": j.title, "company": j.company,
            "match_score": j.match_score, "priority": j.priority,
            "match_analysis": j.match_analysis, "url": j.url,
            "created_at": j.created_at.isoformat() if j.created_at else None,
        }
        for j in jobs
    ]


@router.get("/jobs/scrape/{platform}/{company_slug}")
async def scrape_jobs(platform: str, company_slug: str):
    from app.modules.job_intel.service import scrape_jobs
    return await scrape_jobs(company_slug, platform)


@router.post("/jobs/fetch-description")
async def fetch_job_desc(url: str):
    from app.modules.job_intel.service import fetch_job_description
    text = await fetch_job_description(url)
    if not text:
        raise HTTPException(400, "Could not fetch job description")
    return {"description": text}


# ── ROADMAP ──

@router.post("/roadmap/{user_id}/generate")
async def generate_roadmap(user_id: str, db: AsyncSession = Depends(get_db)):
    from app.modules.adaptive_prep.service import generate_roadmap
    roadmap = await generate_roadmap(db, user_id)
    return {"data": roadmap}


@router.get("/roadmap/{user_id}")
async def get_roadmap(user_id: str, category: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    from app.modules.adaptive_prep.service import get_roadmap
    items = await get_roadmap(db, user_id, category)
    return {"data": items}


@router.put("/roadmap/item/{item_id}/progress")
async def update_progress(item_id: str, body: ProgressUpdate, db: AsyncSession = Depends(get_db)):
    from app.modules.adaptive_prep.service import update_progress
    return await update_progress(db, item_id, body.status, body.score)


@router.get("/roadmap/{user_id}/stats")
async def roadmap_stats(user_id: str, db: AsyncSession = Depends(get_db)):
    from app.modules.adaptive_prep.service import get_progress_stats
    stats = await get_progress_stats(db, user_id)
    return {"data": stats}


# ── COMPANY INTELLIGENCE ──

@router.get("/company/{company_name}/intel")
async def company_intel(company_name: str, role: str = "Backend Engineer", db: AsyncSession = Depends(get_db)):
    from app.modules.company_intel.service import get_company_intel
    return await get_company_intel(db, company_name, role)


# ── MOCK INTERVIEWS ──

@router.post("/mock/{user_id}/question")
async def generate_mock_question(user_id: str, body: MockQuestionRequest, db: AsyncSession = Depends(get_db)):
    from app.modules.mock_interview.service import generate_question
    return await generate_question(db, user_id, body.session_type, body.company, body.difficulty, body.topic)


@router.post("/mock/{session_id}/evaluate")
async def evaluate_mock_answer(session_id: str, body: AnswerSubmission, db: AsyncSession = Depends(get_db)):
    from app.modules.mock_interview.service import evaluate_answer
    return await evaluate_answer(db, session_id, body.answer_text, body.code)


# ── ANALYTICS ──

@router.get("/analytics/{user_id}/dashboard")
async def dashboard(user_id: str, db: AsyncSession = Depends(get_db)):
    from app.modules.analytics.service import get_dashboard
    return await get_dashboard(db, user_id)


# ── URL MANAGEMENT ──

@router.get("/roadmap/{user_id}/invalid-urls")
async def get_invalid_urls(user_id: str, db: AsyncSession = Depends(get_db)):
    from app.modules.url_management.service import get_invalid_urls
    invalid = await get_invalid_urls(db, user_id)
    return {"data": invalid}


@router.put("/roadmap/resource/{item_id}/url")
async def update_resource_url(item_id: str, resource_index: int, new_url: str, db: AsyncSession = Depends(get_db)):
    from app.modules.url_management.service import update_resource_url
    result = await update_resource_url(db, item_id, resource_index, new_url)
    return {"data": result}


# ── JOB SCRAPING ──

@router.post("/jobs/scrape-company")
async def scrape_company_jobs(company_name: str, custom_url: Optional[str] = None):
    from app.modules.job_scraper.service import scrape_company_jobs
    jobs = await scrape_company_jobs(company_name, custom_url)
    return {"data": jobs}


@router.post("/jobs/match-to-skills")
async def match_jobs_to_skills(user_id: str, db: AsyncSession = Depends(get_db)):
    from app.modules.job_scraper.service import match_jobs_to_skills
    user = await db.get(UserProfile, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    
    user_skills = {
        "dsa": user.dsa_level,
        "backend": user.backend_level,
        "system_design": user.system_design_level,
    }
    
    # Get jobs from database
    result = await db.execute(select(Job).where(Job.user_id == user_id))
    jobs = result.scalars().all()
    job_dicts = [{"title": j.title, "company": j.company, "url": j.url} for j in jobs]
    
    matched = await match_jobs_to_skills(job_dicts, user_skills)
    return {"data": matched}


@router.post("/jobs/add-company")
async def add_custom_company(company_name: str, career_url: str):
    from app.modules.job_scraper.service import add_custom_company
    result = await add_custom_company(company_name, career_url)
    return {"data": result}
