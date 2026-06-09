from datetime import date
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from services.scoring import recompute_daily_leaderboard
from services.clustering import recompute_clusters
from services.recommender import recompute_internship_recommendations

bp = Blueprint("admin", __name__, url_prefix="/admin")

@bp.post("/run-jobs")
@jwt_required()
def run_jobs_now():
    today = date.today()
    recompute_daily_leaderboard(today)
    recompute_clusters(today, k=3)
    recompute_internship_recommendations(today, top_n=10)
    return jsonify({"ok": True, "date": today.isoformat()})
