from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.models import RoadmapItem
import aiohttp

async def validate_url(url: str) -> bool:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.head(url, timeout=aiohttp.ClientTimeout(total=5), allow_redirects=True) as resp:
                return resp.status < 400
    except:
        return False

async def update_resource_url(db: AsyncSession, item_id: str, resource_index: int, new_url: str) -> dict:
    item = await db.get(RoadmapItem, item_id)
    if not item:
        raise ValueError("Roadmap item not found")
    if not item.resources or resource_index >= len(item.resources):
        raise ValueError("Resource not found")
    
    is_valid = await validate_url(new_url)
    item.resources[resource_index]["url"] = new_url
    await db.commit()
    
    return {"id": str(item.id), "resource": item.resources[resource_index], "valid": is_valid}

async def get_invalid_urls(db: AsyncSession, user_id: str) -> list:
    result = await db.execute(select(RoadmapItem).where(RoadmapItem.user_id == user_id))
    items = result.scalars().all()
    
    invalid = []
    for item in items:
        if item.resources:
            for idx, resource in enumerate(item.resources):
                is_valid = await validate_url(resource["url"])
                if not is_valid:
                    invalid.append({
                        "item_id": str(item.id),
                        "topic": item.topic,
                        "resource_index": idx,
                        "resource": resource,
                        "valid": False
                    })
    return invalid
