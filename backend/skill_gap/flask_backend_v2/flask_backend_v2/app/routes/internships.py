from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Internship, InternshipRecommendation, Internship as InternshipModel

bp = Blueprint("internships", __name__, url_prefix="/internships")

@bp.get("")
@jwt_required()
def list_internships():
    domain = request.args.get("domain")
    q = InternshipModel.query
    if domain:
        q = q.filter(InternshipModel.domain.ilike(f"%{domain}%"))
    items = q.limit(500).all()
    return jsonify({"items": [{"id": it.id, "company_name": it.company_name, "role": it.role, "skills_required": it.skills_required, "salary_package": it.salary_package, "domain": it.domain} for it in items]})

@bp.get("/recommendations/me")
@jwt_required()
def my_recommendations():
    user_id = int(get_jwt_identity())
    recs = InternshipRecommendation.query.filter_by(user_id=user_id).order_by(InternshipRecommendation.match_score.desc()).limit(100).all()
    items = []
    for r in recs:
        it = Internship.query.get(r.internship_id)
        items.append({"match_score": r.match_score, "internship": {"id": it.id, "company_name": it.company_name, "role": it.role, "skills_required": it.skills_required, "salary_package": it.salary_package, "domain": it.domain}})
    return jsonify({"items": items})
