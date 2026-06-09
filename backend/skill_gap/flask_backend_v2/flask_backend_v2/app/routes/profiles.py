from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date
from ..models import User, StudentDailyScore, LeetCodeGithubSnapshot, CertificationProject, UserAssessment

bp = Blueprint("profiles", __name__, url_prefix="/profiles")

@bp.get("/me")
@jwt_required()
def my_profile():
    uid = int(get_jwt_identity())
    u = User.query.get(uid)
    if not u:
        return jsonify({}), 404
    return jsonify({
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "github_profile": u.github_profile,
        "leetcode_profile": u.leetcode_profile,
        "aspiring_role": u.aspiring_role
    })

@bp.get("/stats")
@jwt_required()
def my_stats():
    """Get comprehensive user stats including Career Readiness Index"""
    uid = int(get_jwt_identity())
    u = User.query.get(uid)
    if not u:
        return jsonify({"error": "User not found"}), 404
    
    from ..utils.score_utils import calculate_career_readiness
    
    total_score, breakdown, raw = calculate_career_readiness(uid)
    
    # Get rank from daily score
    today = date.today()
    daily_score = StudentDailyScore.query.filter_by(user_id=uid, score_date=today).first()
    
    return jsonify({
        "user": {
            "name": u.name,
            "email": u.email,
            "github_username": u.github_profile,
            "leetcode_username": u.leetcode_profile,
            "aspiring_role": u.aspiring_role or "Software Engineer"
        },
        "stats": {
            "leetcode_solved": raw["leetcode_solved"],
            "github_repos": raw["github_repos"],
            "projects_count": raw["projects_count"],
            "certifications_count": raw["certifications_count"],
            "badges_count": raw["badges_count"],
            "rank": daily_score.rank if daily_score else None,
            "total_score": float(daily_score.total_score) if daily_score else float(total_score)
        },
        "career_readiness_index": total_score,
        "breakdown": breakdown
    })
