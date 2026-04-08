try:
    from app.shared.data.roadmap_db import ROADMAP_DATABASE
    print("Part 1 loaded:", len(ROADMAP_DATABASE), "keys:", list(ROADMAP_DATABASE.keys()))
except Exception as e:
    print("Part 1 error:", e)
    import traceback
    traceback.print_exc()

try:
    from app.shared.data.roadmap_db_part2 import ROADMAP_DATABASE_PART2
    print("Part 2 loaded:", len(ROADMAP_DATABASE_PART2), "keys:", list(ROADMAP_DATABASE_PART2.keys()))
except Exception as e:
    print("Part 2 error:", e)
    import traceback
    traceback.print_exc()

try:
    from app.shared.data.roadmap_db import ROADMAP_DATABASE
    from app.shared.data.roadmap_db_part2 import ROADMAP_DATABASE_PART2
    all_topics = {**ROADMAP_DATABASE, **ROADMAP_DATABASE_PART2}
    print("Merged:", len(all_topics), "keys:", list(all_topics.keys()))
    total_items = sum(len(v) for v in all_topics.values())
    print("Total topics:", total_items)
except Exception as e:
    print("Merge error:", e)
    import traceback
    traceback.print_exc()
