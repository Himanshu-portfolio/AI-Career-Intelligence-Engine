from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from app.core.models import UserProfile, RoadmapItem, TopicStatus
from app.shared.llm.client import llm_generate_json
from app.shared.prompts.templates import ROADMAP_SYSTEM, ROADMAP_GENERATION
from app.shared.data.roadmap_db import ROADMAP_DATABASE
from app.shared.data.roadmap_db_part2 import ROADMAP_DATABASE_PART2


async def generate_roadmap(db: AsyncSession, user_id: str) -> dict:
    user = await db.get(UserProfile, user_id)
    if not user or not user.parsed_profile:
        raise ValueError("Profile not set up. Upload resume first.")

    # Clear old roadmap items before regenerating
    await db.execute(delete(RoadmapItem).where(RoadmapItem.user_id == user_id))
    await db.flush()

    # Merge databases
    all_topics = {**ROADMAP_DATABASE, **ROADMAP_DATABASE_PART2}

    # Build roadmap structure with hardcoded topics
    roadmap = {
        "total_weeks": 24,
        "phases": [],
        "weekly_schedule": {
            "dsa_hours": 8,
            "backend_hours": 4,
            "system_design_hours": 2,
            "mock_interview_hours": 1,
        },
        "milestones": [
            {"week": 4, "checkpoint": "Complete DSA Basics", "expected_level": "Comfortable with arrays, strings, sorting"},
            {"week": 8, "checkpoint": "Master Data Structures", "expected_level": "Trees, graphs, heaps"},
            {"week": 12, "checkpoint": "DP & Advanced DSA", "expected_level": "Can solve hard problems"},
            {"week": 16, "checkpoint": "Backend Fundamentals", "expected_level": "REST APIs, databases, caching"},
            {"week": 20, "checkpoint": "System Design Ready", "expected_level": "Can design scalable systems"},
            {"week": 24, "checkpoint": "Interview Ready", "expected_level": "Full stack preparation complete"},
        ]
    }

    # Phase 1: DSA Foundations (Week 1-4)
    phase1_topics = all_topics.get("DSA", [])[:4]
    roadmap["phases"].append({
        "phase_name": "DSA Foundations",
        "weeks": "W1-W4",
        "focus_areas": ["DSA"],
        "modules": [
            {
                "module_id": "DSA-101",
                "title": "Arrays, Strings & Sorting",
                "category": "DSA",
                "topics": phase1_topics,
            }
        ]
    })

    # Phase 2: Data Structures (Week 5-8)
    phase2_topics = all_topics.get("DSA", [])[4:8]
    roadmap["phases"].append({
        "phase_name": "Data Structures",
        "weeks": "W5-W8",
        "focus_areas": ["DSA"],
        "modules": [
            {
                "module_id": "DSA-102",
                "title": "Linked Lists, Stacks, Trees",
                "category": "DSA",
                "topics": phase2_topics,
            }
        ]
    })

    # Phase 3: Advanced DSA (Week 9-12)
    phase3_topics = all_topics.get("DSA", [])[8:]
    roadmap["phases"].append({
        "phase_name": "Advanced DSA",
        "weeks": "W9-W12",
        "focus_areas": ["DSA"],
        "modules": [
            {
                "module_id": "DSA-103",
                "title": "Graphs, DP, Tries",
                "category": "DSA",
                "topics": phase3_topics,
            }
        ]
    })

    # Phase 4: Backend (Week 13-18)
    backend_topics = all_topics.get("BACKEND", [])[:3]
    roadmap["phases"].append({
        "phase_name": "Backend Development",
        "weeks": "W13-W18",
        "focus_areas": ["BACKEND"],
        "modules": [
            {
                "module_id": "BACKEND-101",
                "title": "REST APIs, Databases, Caching",
                "category": "BACKEND",
                "topics": backend_topics,
            }
        ]
    })

    # Phase 5: System Design (Week 19-22)
    sd_topics = all_topics.get("SYSTEM_DESIGN", [])[:3]
    roadmap["phases"].append({
        "phase_name": "System Design",
        "weeks": "W19-W22",
        "focus_areas": ["SYSTEM_DESIGN"],
        "modules": [
            {
                "module_id": "SYSTEM-101",
                "title": "Scalability, Load Balancing, Databases",
                "category": "SYSTEM_DESIGN",
                "topics": sd_topics,
            }
        ]
    })

    # Phase 6: Languages & Behavioral (Week 23-24)
    lang_topics = all_topics.get("LANGUAGE", [])[:2]
    behav_topics = all_topics.get("BEHAVIORAL", [])
    roadmap["phases"].append({
        "phase_name": "Languages & Behavioral",
        "weeks": "W23-W24",
        "focus_areas": ["LANGUAGE", "BEHAVIORAL"],
        "modules": [
            {
                "module_id": "LANG-101",
                "title": "Java Deep Dive",
                "category": "LANGUAGE",
                "topics": lang_topics,
            },
            {
                "module_id": "BEHAV-101",
                "title": "Communication & Problem Solving",
                "category": "BEHAVIORAL",
                "topics": behav_topics,
            }
        ]
    })

    # Persist roadmap items to DB
    order = 0
    week_num = 1
    item_count = 0
    for phase in roadmap["phases"]:
        for module in phase["modules"]:
            for topic in module["topics"]:
                item = RoadmapItem(
                    user_id=user.id,
                    phase=phase["phase_name"],
                    module_id=module["module_id"],
                    category=module["category"],
                    topic=topic.get("topic", ""),
                    subtopics=topic.get("subtopics"),
                    difficulty=topic.get("difficulty", "medium"),
                    estimated_hours=topic.get("estimated_hours", 2),
                    resources=topic.get("resources", []),
                    practice_problems=topic.get("practice_problems", []),
                    week_number=week_num,
                    order_index=order,
                )
                db.add(item)
                item_count += 1
                order += 1
        week_num += 4  # Each phase is ~4 weeks

    await db.commit()
    print(f"Generated {item_count} roadmap items for user {user_id}")
    return roadmap


async def get_roadmap(db: AsyncSession, user_id: str, category: str = None) -> list[dict]:
    query = select(RoadmapItem).where(RoadmapItem.user_id == user_id).order_by(RoadmapItem.week_number, RoadmapItem.order_index)
    if category:
        query = query.where(RoadmapItem.category == category)
    result = await db.execute(query)
    items = result.scalars().all()
    return [
        {
            "id": str(i.id), "phase": i.phase, "module_id": i.module_id,
            "category": i.category, "topic": i.topic, "subtopics": i.subtopics or [],
            "difficulty": i.difficulty, "estimated_hours": i.estimated_hours,
            "resources": i.resources or [], "practice_problems": i.practice_problems or [],
            "status": i.status, "score": i.score, "week_number": i.week_number,
        }
        for i in items
    ]


async def update_progress(db: AsyncSession, item_id: str, status: str, score: float = None) -> dict:
    from datetime import datetime
    item = await db.get(RoadmapItem, item_id)
    if not item:
        raise ValueError("Roadmap item not found")
    item.status = status
    if score is not None:
        item.score = score
    if status == TopicStatus.COMPLETED.value:
        item.completed_at = datetime.utcnow()
    await db.commit()
    return {"id": str(item.id), "status": item.status, "score": item.score}


async def get_progress_stats(db: AsyncSession, user_id: str) -> dict:
    result = await db.execute(
        select(RoadmapItem.category, RoadmapItem.status, func.count())
        .where(RoadmapItem.user_id == user_id)
        .group_by(RoadmapItem.category, RoadmapItem.status)
    )
    rows = result.all()
    stats = {}
    for category, status, count in rows:
        stats.setdefault(category, {"total": 0, "completed": 0, "in_progress": 0})
        stats[category]["total"] += count
        if status == TopicStatus.COMPLETED.value:
            stats[category]["completed"] += count
        elif status == TopicStatus.IN_PROGRESS.value:
            stats[category]["in_progress"] += count

    for cat in stats:
        total = stats[cat]["total"]
        stats[cat]["completion_pct"] = round(stats[cat]["completed"] / total * 100, 1) if total else 0

    return stats
