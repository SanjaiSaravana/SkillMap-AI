from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..services.institution_service import get_curriculum_gaps

bp = Blueprint("institution", __name__, url_prefix="/institution")

@bp.get("/curriculum-gaps")
@jwt_required()
def curriculum_gaps():
    gaps = get_curriculum_gaps()
    return jsonify({"items": gaps})
