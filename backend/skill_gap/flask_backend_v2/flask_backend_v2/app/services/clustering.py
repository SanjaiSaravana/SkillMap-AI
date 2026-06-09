from __future__ import annotations
from datetime import date
import json
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

from ..extensions import db
from ..models import CertificationProject, ClusterRun, ClusterMembership

def _label_names_from_centroids(centroids: np.ndarray):
    mags = centroids.sum(axis=1)
    order = np.argsort(mags)
    names = {}
    if len(order) >= 1: names[int(order[0])] = "Developing"
    if len(order) >= 2: names[int(order[len(order)//2])] = "Rising"
    if len(order) >= 3: names[int(order[-1])] = "Top Performers"
    for i in range(len(order)):
        names.setdefault(int(i), f"Cluster {i}")
    return names

def recompute_clusters(run_date: date, k_min: int = 2, k_max: int = 6) -> None:
    cps = CertificationProject.query.all()
    if not cps:
        return

    domains = sorted(set(x.domain for x in cps))

    runs_to_delete = ClusterRun.query.filter_by(run_date=run_date).all()
    run_ids = [r.id for r in runs_to_delete]
    if run_ids:
        ClusterMembership.query.filter(ClusterMembership.cluster_run_id.in_(run_ids)).delete(synchronize_session=False)
        ClusterRun.query.filter(ClusterRun.id.in_(run_ids)).delete(synchronize_session=False)
        db.session.commit()

    for domain in domains:
        rows = [x for x in cps if x.domain == domain]
        if len(rows) < k_min:
            continue

        X = np.array([[r.projects_done, r.certifications_done] for r in rows], dtype=float)
        X[:,0] = X[:,0] / max(1.0, X[:,0].max())
        X[:,1] = X[:,1] / max(1.0, X[:,1].max())

        best_k = None
        best_model = None
        best_score = -1.0

        upper = min(k_max, len(rows)-1)
        for k in range(k_min, max(k_min, upper)+1):
            km = KMeans(n_clusters=k, n_init="auto", random_state=42)
            labels = km.fit_predict(X)
            if len(set(labels)) < 2:
                continue
            try:
                s = silhouette_score(X, labels)
            except Exception:
                s = -1.0
            if s > best_score:
                best_score = s
                best_k = k
                best_model = km

        if not best_model:
            continue

        labels = best_model.predict(X)
        centroids = best_model.cluster_centers_
        label_names = _label_names_from_centroids(centroids)

        run = ClusterRun(
            run_date=run_date,
            domain=domain,
            k=int(best_k),
            label_names_json=json.dumps(label_names),
            metadata_json=json.dumps({"centroids": centroids.tolist(), "silhouette": best_score})
        )
        db.session.add(run)
        db.session.flush()

        for r, lbl, x in zip(rows, labels, X):
            dist = float(np.linalg.norm(x - centroids[lbl]))
            conf = float(1.0 / (1.0 + dist))
            db.session.add(ClusterMembership(
                cluster_run_id=run.id,
                user_id=r.user_id,
                cluster_label=int(lbl),
                confidence=conf,
                reasons_json=json.dumps({"projects_done": int(r.projects_done), "certifications_done": int(r.certifications_done)})
            ))
        db.session.commit()
