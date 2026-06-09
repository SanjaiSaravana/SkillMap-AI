from datetime import date, datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import ClusterRun, ClusterMembership, User

bp = Blueprint("clusters", __name__, url_prefix="/clusters")

@bp.get("")
@jwt_required()
def get_clusters():
    d = request.args.get("date")
    domain = request.args.get("domain")
    if d:
        run_date = datetime.strptime(d, "%Y-%m-%d").date()
    else:
        run_date = date.today()

    q = ClusterRun.query.filter_by(run_date=run_date)
    if domain:
        q = q.filter_by(domain=domain)
    runs = q.all()

    out = []
    for run in runs:
        members = (ClusterMembership.query
                   .filter_by(cluster_run_id=run.id)
                   .order_by(ClusterMembership.cluster_label.asc(),
                             ClusterMembership.confidence.desc())
                   .limit(200).all())
        out.append({
            "domain": run.domain,
            "k": run.k,
            "members": [{
                "user_id": m.user_id,
                "name": (User.query.get(m.user_id).name if User.query.get(m.user_id) else None),
                "cluster_label": m.cluster_label,
                "confidence": m.confidence
            } for m in members]
        })
    return jsonify({"date": run_date.isoformat(), "clusters": out})

@bp.get("/me")
@jwt_required()
def my_clusters():
    user_id = int(get_jwt_identity())
    run_date = date.today()
    runs = ClusterRun.query.filter_by(run_date=run_date).all()
    mine = []
    for run in runs:
        m = ClusterMembership.query.filter_by(cluster_run_id=run.id, user_id=user_id).first()
        if m:
            mine.append({
                "domain": run.domain,
                "cluster_label": m.cluster_label,
                "confidence": m.confidence
            })
    return jsonify({"date": run_date.isoformat(), "memberships": mine})
