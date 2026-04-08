from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.models import UserProfile, Job, RoadmapItem, MockSession, TopicStatus


async def get_dashboard(db: AsyncSession, user_id: str) -> dict:
    # Job stats
    job_result = await db.execute(
        select(func.count(), func.avg(Job.match_score))
        .where(Job.user_id == user_id)
    )
    job_count, avg_match = job_result.one()

    apply_now = await db.execute(
        select(func.count()).where(Job.user_id == user_id, Job.priority == "APPLY_NOW")
    )

    # Roadmap stats
    roadmap_result = await db.execute(
        select(RoadmapItem.category, RoadmapItem.status, func.count())
        .where(RoadmapItem.user_id == user_id)
        .group_by(RoadmapItem.category, RoadmapItem.status)
    )
    roadmap_stats = {}
    for cat, status, count in roadmap_result.all():
        roadmap_stats.setdefault(cat, {"total": 0, "completed": 0})
        roadmap_stats[cat]["total"] += count
        if status == TopicStatus.COMPLETED.value:
            roadmap_stats[cat]["completed"] += count

    # Mock interview stats
    mock_result = await db.execute(
        select(func.count(), func.avg(MockSession.score))
        .where(MockSession.user_id == user_id, MockSession.score.isnot(None))
    )
    mock_count, avg_mock_score = mock_result.one()

    # Compute readiness scores
    dsa_pct = _completion_pct(roadmap_stats.get("DSA", {}))
    backend_pct = _completion_pct(roadmap_stats.get("BACKEND", {}))
    sd_pct = _completion_pct(roadmap_stats.get("SYSTEM_DESIGN", {}))

    return {
        "jobs": {"total": job_count or 0, "avg_match_score": round(avg_match or 0, 1), "apply_now_count": apply_now.scalar() or 0},
        "roadmap": {cat: {**v, "completion_pct": _completion_pct(v)} for cat, v in roadmap_stats.items()},
        "mock_interviews": {"total": mock_count or 0, "avg_score": round(avg_mock_score or 0, 1)},
        "readiness": {
            "dsa": min(100, int(dsa_pct * 0.6 + (avg_mock_score or 0) * 0.4)),
            "backend": int(backend_pct),
            "system_design": int(sd_pct),
            "overall": int((dsa_pct + backend_pct + sd_pct) / 3),
        },
    }


def _completion_pct(stats: dict) -> float:
    total = stats.get("total", 0)
    return round(stats.get("completed", 0) / total * 100, 1) if total else 0
