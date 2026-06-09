from datetime import date, datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..models import StudentDailyScore, User

bp = Blueprint("leaderboard", __name__)

@bp.get("/leaderboard")
@jwt_required()
def leaderboard():
    d = request.args.get("date")
    run_date = datetime.strptime(d, "%Y-%m-%d").date() if d else date.today()
    rows = (StudentDailyScore.query.filter_by(score_date=run_date).order_by(StudentDailyScore.rank.asc()).limit(500).all())
    out = []
    for r in rows:
        u = User.query.get(r.user_id)
        out.append({
            "rank": r.rank,
            "user_id": r.user_id,
            "name": u.name if u else None,
            "total_score": r.total_score,
            "leetcode_score": r.leetcode_score,
            "github_score": r.github_score,
            "cert_score": r.cert_score,
            "project_score": r.project_score,
            "raw": {
                "problems_solved": r.raw_problems_solved,
                "projects_submitted": r.raw_projects_submitted,
                "days_worked": r.raw_days_worked,
                "certifications": r.raw_certs,
                "projects_done": r.raw_projects_done
            }
        })
    return jsonify({"date": run_date.isoformat(), "leaderboard": out})
