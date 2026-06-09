from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import CertificationProject
from ..utils.validation import require_fields

bp = Blueprint("portfolio", __name__, url_prefix="/portfolio")

@bp.post("/cert-project")
@jwt_required()
def upsert_cert_project():
    user_id = int(get_jwt_identity())
    data = request.get_json(force=True)
    missing = require_fields(data, ["domain"])
    if missing:
        return jsonify({"error": f"missing fields: {', '.join(missing)}"}), 400
    domain = data["domain"].strip()
    projects_done = int(data.get("projects_done") or 0)
    certifications_done = int(data.get("certifications_done") or 0)
    row = CertificationProject.query.filter_by(user_id=user_id, domain=domain).first()
    if not row:
        row = CertificationProject(user_id=user_id, domain=domain)
        db.session.add(row)
    row.projects_done = max(0, projects_done)
    row.certifications_done = max(0, certifications_done)
    row.computed_score = min(100.0, row.projects_done*8 + row.certifications_done*12)
    db.session.commit()
    return jsonify({"ok": True, "row": {"domain": row.domain, "projects_done": row.projects_done, "certifications_done": row.certifications_done, "score": row.computed_score}})

@bp.get("/cert-project/me")
@jwt_required()
def my_cert_project():
    user_id = int(get_jwt_identity())
    rows = CertificationProject.query.filter_by(user_id=user_id).all()
    return jsonify({"items": [{"domain": r.domain, "projects_done": r.projects_done, "certifications_done": r.certifications_done, "score": r.computed_score} for r in rows]})
