from datetime import date, datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import StudentDailyScore, User

bp = Blueprint("leaderboard", __name__, url_prefix="")

@bp.get("/leaderboard")
@jwt_required()
def leaderboard():
    d = request.args.get("date")
    if d:
        run_date = datetime.strptime(d, "%Y-%m-%d").date()
    else:
        run_date = date.today()

    rows = (StudentDailyScore.query
            .filter_by(score_date=run_date)
            .order_by(StudentDailyScore.rank.asc())
            .limit(200).all())

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
            "project_score": r.project_score
        })
    return jsonify({"date": run_date.isoformat(), "leaderboard": out})
