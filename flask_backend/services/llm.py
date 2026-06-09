from __future__ import annotations
import json, os

def generate_learning_map_template(target_role: str, missing_skills: list[str], current_skills: list[str]):
    # Deterministic roadmap (works without any API key)
    missing = missing_skills[:20]
    weeks = 8
    roadmap = []
    for w in range(1, weeks+1):
        week_topics = []
        # rotate missing skills
        for i in range(2):
            idx = (w*2 + i) % max(1, len(missing))
            if missing:
                week_topics.append(missing[idx])
        roadmap.append({
            "week": w,
            "focus": week_topics or ["revise fundamentals"],
            "project": f"Mini project {w} for {target_role}",
            "checkpoint": f"Build + document outcomes for week {w}"
        })

    md = [f"# Personalized Learning Map: {target_role}", ""]
    md.append("## Skill gaps prioritized")
    md.append(", ".join(missing) if missing else "No missing skills detected from current inputs.")
    md.append("")
    md.append("## 8-week plan")
    for item in roadmap:
        md.append(f"### Week {item['week']}")
        md.append(f"- Focus: {', '.join(item['focus'])}")
        md.append(f"- Project: {item['project']}")
        md.append(f"- Checkpoint: {item['checkpoint']}")
        md.append("")
    return {
        "roadmap_json": {"target_role": target_role, "plan": roadmap},
        "roadmap_markdown": "\n".join(md)
    }
