from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from app.core.models import CompanyIntel
from app.shared.llm.client import llm_generate_json
from app.shared.prompts.templates import COMPANY_INTEL_SYSTEM, COMPANY_INTEL


async def get_company_intel(db: AsyncSession, company_name: str, role: str = "Backend Engineer") -> dict:
    # Check cache — refresh only if older than 30 days
    result = await db.execute(
        select(CompanyIntel).where(CompanyIntel.company_name == company_name.lower())
    )
    cached = result.scalar_one_or_none()

    if cached and cached.last_updated > datetime.utcnow() - timedelta(days=30):
        return cached.intel_data

    prompt = COMPANY_INTEL.format(company_name=company_name, role=role)
    intel = await llm_generate_json(prompt, COMPANY_INTEL_SYSTEM)

    if cached:
        cached.intel_data = intel
        cached.last_updated = datetime.utcnow()
    else:
        db.add(CompanyIntel(company_name=company_name.lower(), intel_data=intel))

    await db.commit()
    return intel
