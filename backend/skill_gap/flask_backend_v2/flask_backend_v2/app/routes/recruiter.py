from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..services.recruiter_service import search_candidates

bp = Blueprint("recruiter", __name__, url_prefix="/recruiter")

@bp.post("/search")
@jwt_required()
def search():
    data = request.get_json(force=True)
    jd_text = data.get("jd_text", "")
    
    if len(jd_text) < 5:
        return jsonify({"items": []})
        
    results = search_candidates(jd_text)
    return jsonify({"items": results})
