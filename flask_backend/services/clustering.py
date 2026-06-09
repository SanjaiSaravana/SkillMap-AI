from __future__ import annotations
from datetime import date
import json
import numpy as np
from sklearn.cluster import KMeans

from extensions import db
from models import CertificationProject, ClusterRun, ClusterMembership


def recompute_clusters(run_date: date, k: int = 3) -> None:
    # cluster per domain using features: [projects_done, certifications_done]
    cps = CertificationProject.query.all()
    if not cps:
        return

    domains = sorted(set(x.domain for x in cps))

    # ---- FIX: delete without join() ----
    runs_to_delete = ClusterRun.query.filter_by(run_date=run_date).all()
    run_ids = [r.id for r in runs_to_delete]

    if run_ids:
        ClusterMembership.query.filter(ClusterMembership.cluster_run_id.in_(run_ids)).delete(
            synchronize_session=False
        )
        ClusterRun.query.filter(ClusterRun.id.in_(run_ids)).delete(synchronize_session=False)
        db.session.commit()
    # -----------------------------------

    for domain in domains:
        rows = [x for x in cps if x.domain == domain]
        if len(rows) < k:
            continue

        X = np.array([[r.projects_done, r.certifications_done] for r in rows], dtype=float)

        # normalize each column
        X[:, 0] = X[:, 0] / max(1.0, X[:, 0].max())
        X[:, 1] = X[:, 1] / max(1.0, X[:, 1].max())

        km = KMeans(n_clusters=k, n_init="auto", random_state=42)
        labels = km.fit_predict(X)

        run = ClusterRun(
            run_date=run_date,
            domain=domain,
            k=k,
            metadata_json=json.dumps({"centroids": km.cluster_centers_.tolist()}),
        )
        db.session.add(run)
        db.session.flush()  # run.id

        centers = km.cluster_centers_
        for r, lbl, x in zip(rows, labels, X):
            dist = float(np.linalg.norm(x - centers[lbl]))
            conf = float(1.0 / (1.0 + dist))
            reasons = {"projects_done": r.projects_done, "certifications_done": r.certifications_done}

            db.session.add(
                ClusterMembership(
                    cluster_run_id=run.id,
                    user_id=r.user_id,
                    cluster_label=int(lbl),
                    confidence=conf,
                    reasons_json=json.dumps(reasons),
                )
            )

        db.session.commit()

