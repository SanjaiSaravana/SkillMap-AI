from __future__ import annotations
from datetime import date
from ..extensions import db
from ..models import User, LeetCodeGithubSnapshot, CertificationProject, StudentDailyScore

def _minmax(values: list[float]) -> tuple[float,float]:
    if not values:
        return (0.0, 1.0)
    mn = min(values)
    mx = max(values)
    if mx - mn < 1e-9:
        return (mn, mn + 1.0)
    return (mn, mx)

def _norm(x: float, mn: float, mx: float) -> float:
    return max(0.0, min(100.0, (x - mn) * 100.0 / (mx - mn)))

def recompute_daily_leaderboard(run_date: date) -> None:
    users = User.query.all()
    raw = []
    for u in users:
        snap = (LeetCodeGithubSnapshot.query
                .filter(LeetCodeGithubSnapshot.user_id == u.id,
                        LeetCodeGithubSnapshot.snapshot_date <= run_date)
                .order_by(LeetCodeGithubSnapshot.snapshot_date.desc())
                .first())

        problems = int(snap.problems_solved) if snap else 0
        days = int(snap.days_worked) if snap else 0
        proj_sub = int(snap.projects_submitted) if snap else 0

        cps = CertificationProject.query.filter_by(user_id=u.id).all()
        certs = sum(int(x.certifications_done) for x in cps) if cps else 0
        projs_done = sum(int(x.projects_done) for x in cps) if cps else 0

        lc_raw = problems
        gh_raw = proj_sub * 10.0 + days * 0.2
        cert_raw = certs * 12.0
        proj_raw = projs_done * 8.0

        raw.append((u.id, problems, days, proj_sub, certs, projs_done, lc_raw, gh_raw, cert_raw, proj_raw))

    lc_mn, lc_mx = _minmax([r[6] for r in raw])
    gh_mn, gh_mx = _minmax([r[7] for r in raw])
    cs_mn, cs_mx = _minmax([r[8] for r in raw])
    ps_mn, ps_mx = _minmax([r[9] for r in raw])

    StudentDailyScore.query.filter_by(score_date=run_date).delete()
    db.session.commit()

    rows = []
    for (uid, problems, days, proj_sub, certs, projs_done, lc_raw, gh_raw, cert_raw, proj_raw) in raw:
        lc = _norm(lc_raw, lc_mn, lc_mx)
        gh = _norm(gh_raw, gh_mn, gh_mx)
        cs = _norm(cert_raw, cs_mn, cs_mx)
        ps = _norm(proj_raw, ps_mn, ps_mx)
        total = 0.35*lc + 0.25*gh + 0.20*cs + 0.20*ps
        rows.append((uid, lc, gh, cs, ps, total, problems, days, proj_sub, certs, projs_done))

    rows.sort(key=lambda x: x[5], reverse=True)

    for idx, r in enumerate(rows, start=1):
        uid, lc, gh, cs, ps, total, problems, days, proj_sub, certs, projs_done = r
        db.session.add(StudentDailyScore(
            user_id=uid,
            score_date=run_date,
            leetcode_score=lc,
            github_score=gh,
            cert_score=cs,
            project_score=ps,
            total_score=total,
            rank=idx,
            raw_problems_solved=problems,
            raw_days_worked=days,
            raw_projects_submitted=proj_sub,
            raw_certs=certs,
            raw_projects_done=projs_done
        ))
    db.session.commit()
