from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Internship, InternshipRecommendation

bp = Blueprint("internships", __name__, url_prefix="/internships")

@bp.get("")
@jwt_required()
def list_internships():
    domain = request.args.get("domain")
    q = Internship.query
    if domain:
        q = q.filter(Internship.domain.ilike(f"%{domain}%"))
    items = q.limit(300).all()
    return jsonify({"items": [{
        "id": it.id,
        "company_name": it.company_name,
        "role": it.role,
        "skills_required": it.skills_required,
        "salary_package": it.salary_package,
        "domain": it.domain
    } for it in items]})

@bp.get("/recommendations/me")
@jwt_required()
def my_recommendations():
    user_id = int(get_jwt_identity())
    recs = (InternshipRecommendation.query
            .filter_by(user_id=user_id)
            .order_by(InternshipRecommendation.match_score.desc())
            .limit(50).all())

    return jsonify({"items": [{
        "match_score": r.match_score,
        "internship": {
            "id": r.internship.id,
            "company_name": r.internship.company_name,
            "role": r.internship.role,
            "skills_required": r.internship.skills_required,
            "salary_package": r.internship.salary_package,
            "domain": r.internship.domain
        }
    } for r in recs]})
