from __future__ import annotations
from datetime import date
import json

from ..extensions import db
from ..models import Internship, InternshipRecommendation, StudentDailyScore, SkillProfile, ResumeJobMatch, ClusterRun, ClusterMembership

def _parse_skills(s: str):
    return [x.strip().lower() for x in (s or "").replace("|", ",").split(",") if x.strip()]

def _safe_json_list(s: str):
    try:
        v = json.loads(s)
        return v if isinstance(v, list) else []
    except Exception:
        return []

def recompute_internship_recommendations(run_date: date, top_n: int = 10) -> None:
    scores = StudentDailyScore.query.filter_by(score_date=run_date).all()
    internships = Internship.query.all()
    if not internships or not scores:
        return

    InternshipRecommendation.query.delete()
    db.session.commit()

    domain_bonus = {}
    runs = ClusterRun.query.filter_by(run_date=run_date).all()
    for run in runs:
        label_names = {}
        if run.label_names_json:
            try: label_names = json.loads(run.label_names_json)
            except Exception: label_names = {}
        top_labels = {int(k) for k,v in label_names.items() if str(v).lower().startswith("top")}
        if not top_labels:
            continue
        members = ClusterMembership.query.filter_by(cluster_run_id=run.id).all()
        for m in members:
            if m.cluster_label in top_labels:
                domain_bonus.setdefault(m.user_id, set()).add(run.domain.lower())

    latest_resume_match = {}
    for s in scores:
        rm = (ResumeJobMatch.query.filter_by(user_id=s.user_id)
              .order_by(ResumeJobMatch.created_at.desc()).first())
        latest_resume_match[s.user_id] = rm

    for s in scores:
        sp = SkillProfile.query.filter_by(user_id=s.user_id).first()
        user_skills = set()

        if sp and sp.skills_json:
            try:
                sj = json.loads(sp.skills_json)
                user_skills |= set(k.lower() for k in sj.keys())
            except Exception:
                pass

        rm = latest_resume_match.get(s.user_id)
        if rm and rm.extracted_resume_skills:
            user_skills |= set(x.lower() for x in _safe_json_list(rm.extracted_resume_skills))

        asp_role = (sp.aspiring_role if sp else "") or ""

        recs = []
        for it in internships:
            req = set(_parse_skills(it.skills_required))
            if not req:
                continue

            overlap = len(req & user_skills) / max(1, len(req))
            base_domain_fit = 1.0 if (it.domain and it.domain.lower() in asp_role.lower()) else 0.65
            bonus = 0.10 if (it.domain and it.domain.lower() in domain_bonus.get(s.user_id, set())) else 0.0
            domain_fit = min(1.0, base_domain_fit + bonus)
            total_norm = min(1.0, (s.total_score or 0.0) / 100.0)

            match = 0.60*overlap + 0.25*domain_fit + 0.15*total_norm
            recs.append((match, overlap, domain_fit, it))

        recs.sort(key=lambda x: x[0], reverse=True)
        for match, overlap, domain_fit, it in recs[:top_n]:
            db.session.add(InternshipRecommendation(
                user_id=s.user_id,
                internship_id=it.id,
                match_score=float(match * 100.0),
                explanation_json=json.dumps({
                    "skill_overlap": float(overlap * 100.0),
                    "domain_fit": float(domain_fit * 100.0),
                    "leaderboard_strength": float(total_norm * 100.0),
                    "note": "Score = 60% skills + 25% domain + 15% leaderboard"
                })
            ))

    db.session.commit()
