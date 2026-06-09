from __future__ import annotations
from datetime import date
import json

from extensions import db
from models import Internship, InternshipRecommendation, StudentDailyScore, SkillProfile, ResumeJobMatch


def _parse_skills(s: str):
    return [x.strip().lower() for x in (s or "").split(",") if x.strip()]


def recompute_internship_recommendations(run_date: date, top_n: int = 10) -> None:
    scores = StudentDailyScore.query.filter_by(score_date=run_date).all()
    internships = Internship.query.all()
    if not internships or not scores:
        return

    # Clear existing recs (MVP approach)
    InternshipRecommendation.query.delete()
    db.session.commit()

    # Map latest resume match for each user
    latest_resume_match = {}
    for s in scores:
        rm = (
            ResumeJobMatch.query.filter_by(user_id=s.user_id)
            .order_by(ResumeJobMatch.created_at.desc())
            .first()
        )
        latest_resume_match[s.user_id] = rm

    for s in scores:
        sp = SkillProfile.query.filter_by(user_id=s.user_id).first()

        # collect skills from skill profile + resume extraction
        user_skills = set()

        if sp and sp.skills_json:
            try:
                sj = json.loads(sp.skills_json)
                user_skills |= set(k.lower() for k in sj.keys())
            except Exception:
                pass

        rm = latest_resume_match.get(s.user_id)
        if rm and rm.extracted_resume_skills:
            try:
                rs = json.loads(rm.extracted_resume_skills)
                user_skills |= set(x.lower() for x in rs)
            except Exception:
                pass

        asp_role = (sp.aspiring_role if sp else "") or ""

        recs = []
        for it in internships:
            req = set(_parse_skills(it.skills_required))
            if not req:
                continue

            overlap = len(req & user_skills) / max(1, len(req))
            domain_fit = 1.0 if (it.domain and it.domain.lower() in asp_role.lower()) else 0.6
            total_norm = min(1.0, (s.total_score or 0.0) / 100.0)

            match = 0.6 * overlap + 0.25 * domain_fit + 0.15 * total_norm
            recs.append((match, it))

        recs.sort(key=lambda x: x[0], reverse=True)

        for match, it in recs[:top_n]:
            db.session.add(
                InternshipRecommendation(
                    user_id=s.user_id,
                    internship_id=it.id,
                    match_score=float(match * 100.0),
                    explanation_json=json.dumps(
                        {
                            "skill_overlap": overlap if "overlap" in locals() else None,
                            "domain_fit": domain_fit if "domain_fit" in locals() else None,
                            "leaderboard_strength": float(total_norm * 100.0),
                            "note": "Score = skill overlap + domain fit + leaderboard strength",
                        }
                    ),
                )
            )

    db.session.commit()
