import os, json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Resume, ResumeJobMatch
from services.resume_service import extract_text_from_pdf, match_resume_to_jd

bp = Blueprint("resume", __name__, url_prefix="/resume")

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@bp.post("/upload")
@jwt_required()
def upload_resume():
    user_id = int(get_jwt_identity())
    if "file" not in request.files:
        return jsonify({"error": "file required"}), 400

    f = request.files["file"]
    if not f.filename.lower().endswith(".pdf"):
        return jsonify({"error": "only PDF supported in MVP"}), 400

    save_path = os.path.join(UPLOAD_DIR, f"{user_id}_{f.filename}")
    f.save(save_path)

    try:
        text = extract_text_from_pdf(save_path)
    except Exception as e:
        text = ""

    r = Resume(user_id=user_id, file_path=save_path, parsed_text=text)
    db.session.add(r)
    db.session.commit()

    return jsonify({"ok": True, "resume_id": r.id})

@bp.post("/match")
@jwt_required()
def match_resume():
    user_id = int(get_jwt_identity())
    data = request.get_json(force=True)
    resume_id = int(data.get("resume_id") or 0)
    jd = (data.get("job_description") or "").strip()

    r = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
    if not r:
        return jsonify({"error": "resume not found"}), 404
    if not jd:
        return jsonify({"error": "job_description required"}), 400

    result = match_resume_to_jd(r.parsed_text or "", jd)

    m = ResumeJobMatch(
        user_id=user_id,
        resume_id=r.id,
        job_description=jd,
        extracted_resume_skills=json.dumps(result["resume_skills"]),
        extracted_jd_skills=json.dumps(result["jd_skills"]),
        missing_skills=json.dumps(result["missing_skills"]),
        match_score=float(result["match_score"])
    )
    db.session.add(m)
    db.session.commit()

    return jsonify({"ok": True, "match": result, "match_id": m.id})
