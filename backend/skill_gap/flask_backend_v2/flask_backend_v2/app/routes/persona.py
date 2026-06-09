import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import SkillProfile
from ..utils.validation import require_fields

bp = Blueprint("persona", __name__, url_prefix="/persona")

@bp.post("/skills")
@jwt_required()
def upsert_skills():
    user_id = int(get_jwt_identity())
    data = request.get_json(force=True)
    missing = require_fields(data, ["skills"])
    if missing:
        return jsonify({"error": f"missing fields: {', '.join(missing)}"}), 400
    skills = data.get("skills")
    aspiring_role = (data.get("aspiring_role") or "").strip()
    projects_summary = (data.get("projects_summary") or "").strip()
    if not isinstance(skills, dict):
        return jsonify({"error": "skills must be an object like {python:3, react:4}"}), 400
    row = SkillProfile.query.filter_by(user_id=user_id).first()
    if not row:
        row = SkillProfile(user_id=user_id, skills_json=json.dumps(skills))
        db.session.add(row)
    row.skills_json = json.dumps(skills)
    row.aspiring_role = aspiring_role or row.aspiring_role
    row.projects_summary = projects_summary
    db.session.commit()
    return jsonify({"ok": True})

@bp.get("/skills/me")
@jwt_required()
def my_skills():
    user_id = int(get_jwt_identity())
    row = SkillProfile.query.filter_by(user_id=user_id).first()
    if not row:
        return jsonify({"skills": {}, "aspiring_role": None, "projects_summary": ""})
    return jsonify({"skills": json.loads(row.skills_json), "aspiring_role": row.aspiring_role, "projects_summary": row.projects_summary or ""})
