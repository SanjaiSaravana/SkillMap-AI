from datetime import date
import pandas as pd
from flask import Blueprint, jsonify, request
from ..utils.auth import admin_required
from ..extensions import db
from ..models import User, LeetCodeGithubSnapshot, CertificationProject, Internship
from ..services.scoring import recompute_daily_leaderboard
from ..services.clustering import recompute_clusters
from ..services.recommender import recompute_internship_recommendations

bp = Blueprint("admin", __name__, url_prefix="/admin")

@bp.post("/run-jobs")
@admin_required
def run_jobs_now():
    today = date.today()
    recompute_daily_leaderboard(today)
    recompute_clusters(today)
    recompute_internship_recommendations(today, top_n=10)
    return jsonify({"ok": True, "date": today.isoformat()})

@bp.post("/import-datasets")
@admin_required
def import_datasets():
    if "lcgh" not in request.files or "cs" not in request.files or "internships" not in request.files:
        return jsonify({"error": "files required: lcgh, cs, internships"}), 400
    lcgh = pd.read_csv(request.files["lcgh"])
    cs = pd.read_csv(request.files["cs"])
    ints = pd.read_csv(request.files["internships"])

    LeetCodeGithubSnapshot.query.delete()
    CertificationProject.query.delete()
    Internship.query.delete()
    db.session.commit()

    name_to_user = {u.name: u for u in User.query.all()}
    for _, row in lcgh.iterrows():
        name = str(row.get("name","")).strip()
        if not name:
            continue
        if name not in name_to_user:
            u = User(name=name)
            db.session.add(u); db.session.flush()
            name_to_user[name] = u
    db.session.commit()

    today = date.today()
    for _, row in lcgh.iterrows():
        name = str(row.get("name","")).strip()
        if not name:
            continue
        u = name_to_user[name]
        db.session.add(LeetCodeGithubSnapshot(user_id=u.id, snapshot_date=today,
                                             problems_solved=int(row.get("problems_solved",0)),
                                             days_worked=int(row.get("days_worked",0)),
                                             projects_submitted=int(row.get("projects_submitted",0))))
    db.session.commit()

    for _, row in cs.iterrows():
        name = str(row.get("name","")).strip()
        if not name:
            continue
        u = name_to_user.get(name)
        if not u:
            continue
        db.session.add(CertificationProject(user_id=u.id,
                                            domain=str(row.get("domain","General")).strip() or "General",
                                            projects_done=int(row.get("projects_done",0)),
                                            certifications_done=int(row.get("certifications_done",0)),
                                            computed_score=0.0))
    db.session.commit()

    for _, row in ints.iterrows():
        db.session.add(Internship(company_name=str(row.get("company_name","")).strip(),
                                  role=str(row.get("role","")).strip(),
                                  skills_required=str(row.get("skills_required","")).strip(),
                                  salary_package=str(row.get("salary_package","")).strip(),
                                  domain=str(row.get("domain","General")).strip() or "General"))
    db.session.commit()

    recompute_daily_leaderboard(today)
    recompute_clusters(today)
    recompute_internship_recommendations(today, top_n=10)

    return jsonify({"ok": True, "imported": True, "date": today.isoformat()})
