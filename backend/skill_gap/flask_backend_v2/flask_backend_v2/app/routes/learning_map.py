import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import SkillProfile, ResumeJobMatch, LearningMap
from ..services.llm import generate_learning_map

bp = Blueprint("learning_map", __name__, url_prefix="/learning-map")

@bp.post("/generate")
@jwt_required()
def generate_map():
    user_id = int(get_jwt_identity())
    data = request.get_json(force=True)
    target_role = (data.get("target_role") or "").strip()
    resume_match_id = int(data.get("resume_match_id") or 0)
    if not target_role:
        return jsonify({"error": "target_role required"}), 400
    sp = SkillProfile.query.filter_by(user_id=user_id).first()
    current_skills = []
    if sp:
        try: current_skills = list(json.loads(sp.skills_json).keys())
        except Exception: current_skills = []
    missing = []
    if resume_match_id:
        rm = ResumeJobMatch.query.filter_by(id=resume_match_id, user_id=user_id).first()
        if rm and rm.missing_skills:
            try: missing = json.loads(rm.missing_skills)
            except Exception: missing = []
    out = generate_learning_map(target_role, missing, current_skills)
    lm = LearningMap(user_id=user_id, target_role=target_role,
                     roadmap_markdown=out["roadmap_markdown"],
                     roadmap_json=json.dumps(out["roadmap_json"]),
                     based_on_json=json.dumps({"resume_match_id": resume_match_id, "missing_skills": missing, "current_skills": current_skills}))
    db.session.add(lm); db.session.commit()
    return jsonify({"ok": True, "learning_map_id": lm.id, "roadmap": out["roadmap_json"], "markdown": out["roadmap_markdown"]})

@bp.get("/me/latest")
@jwt_required()
def latest_map():
    user_id = int(get_jwt_identity())
    lm = LearningMap.query.filter_by(user_id=user_id).order_by(LearningMap.created_at.desc()).first()
    if not lm:
        return jsonify({"item": None})
    return jsonify({"item": {"id": lm.id, "target_role": lm.target_role, "created_at": lm.created_at.isoformat(), "roadmap": json.loads(lm.roadmap_json), "markdown": lm.roadmap_markdown}})
