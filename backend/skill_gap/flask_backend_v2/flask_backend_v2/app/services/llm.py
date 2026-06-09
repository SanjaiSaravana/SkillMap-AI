from __future__ import annotations

def generate_learning_map_template(target_role: str, missing_skills: list[str], current_skills: list[str]):
    missing = (missing_skills or [])[:24]
    weeks = 8
    plan = []
    for w in range(1, weeks+1):
        focus = []
        for i in range(3):
            if missing:
                focus.append(missing[(w*3 + i) % len(missing)])
        plan.append({
            "week": w,
            "focus": focus or ["revise fundamentals"],
            "deliverable": f"Portfolio deliverable {w} aligned to {target_role}",
            "checkpoint": f"Weekly review + notes for week {w}"
        })

    md = [f"# Personalized Learning Map: {target_role}", ""]
    md.append("## Prioritized skill gaps")
    md.append(", ".join(missing) if missing else "No missing skills detected.")
    md.append("")
    md.append("## 8-week roadmap")
    for item in plan:
        md.append(f"### Week {item['week']}")
        md.append(f"- Focus: {', '.join(item['focus'])}")
        md.append(f"- Deliverable: {item['deliverable']}")
        md.append(f"- Checkpoint: {item['checkpoint']}")
        md.append("")
    return {"roadmap_json": {"target_role": target_role, "plan": plan}, "roadmap_markdown": "\n".join(md)}

def generate_learning_map(target_role: str, missing_skills: list[str], current_skills: list[str]):
    return generate_learning_map_template(target_role, missing_skills, current_skills)
