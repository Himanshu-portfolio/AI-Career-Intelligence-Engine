import pdfplumber
import docx
from io import BytesIO
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.models import UserProfile, Job
from app.shared.embeddings.service import embed_single, cosine_similarity
from app.shared.llm.client import llm_generate_json
from app.shared.prompts.templates import (
    RESUME_ANALYSIS_SYSTEM, RESUME_ANALYSIS,
    JOB_ANALYSIS_SYSTEM, JOB_ANALYSIS,
    MATCH_ANALYSIS_SYSTEM, MATCH_ANALYSIS,
)


async def extract_text_from_file(file: UploadFile) -> str:
    content = await file.read()
    if file.filename.endswith(".pdf"):
        with pdfplumber.open(BytesIO(content)) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
    elif file.filename.endswith(".docx"):
        doc = docx.Document(BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs)
    return content.decode("utf-8", errors="ignore")


async def analyze_resume(resume_text: str) -> dict:
    prompt = RESUME_ANALYSIS.format(resume_text=resume_text[:4000])  # Truncate to save tokens
    return await llm_generate_json(prompt, RESUME_ANALYSIS_SYSTEM)


async def analyze_job(job_text: str) -> dict:
    prompt = JOB_ANALYSIS.format(job_text=job_text[:4000])
    return await llm_generate_json(prompt, JOB_ANALYSIS_SYSTEM)


async def compute_match(profile: dict, job_requirements: dict, resume_embedding, job_embedding) -> dict:
    embedding_score = int(cosine_similarity(resume_embedding, job_embedding) * 100)
    prompt = MATCH_ANALYSIS.format(
        profile_json=str(profile)[:2000],
        job_json=str(job_requirements)[:2000],
        embedding_score=embedding_score,
    )
    return await llm_generate_json(prompt, MATCH_ANALYSIS_SYSTEM)


async def process_job_match(db: AsyncSession, user_id: str, job_text: str, url: str = None, source: str = "manual") -> dict:
    """Full pipeline: analyze job → match against resume → store → return result."""
    user = await db.get(UserProfile, user_id)
    if not user or not user.parsed_profile:
        raise ValueError("Upload and analyze your resume first")

    # Analyze job
    job_analysis = await analyze_job(job_text)

    # Compute embeddings
    import numpy as np
    job_emb = embed_single(job_text[:1000])
    resume_emb = np.array(user.embedding, dtype="float32") if user.embedding else embed_single(user.resume_text[:1000])

    # Match
    match_result = await compute_match(user.parsed_profile, job_analysis, resume_emb, job_emb)

    # Store
    job = Job(
        user_id=user.id,
        title=job_analysis.get("title", "Unknown"),
        company=job_analysis.get("company", "Unknown"),
        url=url,
        source=source,
        raw_description=job_text,
        parsed_requirements=job_analysis,
        embedding=job_emb.tolist(),
        match_score=match_result.get("match_score", 0),
        match_analysis=match_result,
        priority=match_result.get("priority", "SKIP"),
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    return {"job_id": str(job.id), "analysis": job_analysis, "match": match_result}
