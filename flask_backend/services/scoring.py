from __future__ import annotations
from datetime import date
from extensions import db
from models import User, LeetCodeGithubSnapshot, CertificationProject, StudentDailyScore

def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))

def compute_lcgh_scores(snapshot: LeetCodeGithubSnapshot) -> None:
    # LeetCode score from solved count (simple + stable for demo)
    lc = snapshot.problems_solved
    # Normalize: assume 0..1200 range for demo dataset
    snapshot.leetcode_score = _clamp((lc / 1200.0) * 100.0, 0.0, 100.0)

    # GitHub proxy score: projects_submitted + days_worked
    gh = snapshot.projects_submitted * 8 + snapshot.days_worked * 0.1
    snapshot.github_score = _clamp(gh, 0.0, 100.0)

def compute_cert_project_scores(cp: CertificationProject) -> None:
    # Quick scoring: certifications weighted higher
    score = cp.projects_done * 8 + cp.certifications_done * 12
    cp.computed_score = _clamp(score, 0.0, 100.0)

def recompute_daily_leaderboard(run_date: date) -> None:
    # Uses latest snapshot for each user at run_date (or most recent <= run_date)
    users = User.query.all()

    rows = []
    for u in users:
        snap = (LeetCodeGithubSnapshot.query
                .filter(LeetCodeGithubSnapshot.user_id == u.id,
                        LeetCodeGithubSnapshot.snapshot_date <= run_date)
                .order_by(LeetCodeGithubSnapshot.snapshot_date.desc())
                .first())

        leetcode_score = snap.leetcode_score if snap else 0.0
        github_score = snap.github_score if snap else 0.0

        cp = CertificationProject.query.filter_by(user_id=u.id).all()
        cert_score = 0.0
        project_score = 0.0
        if cp:
            # split: certifications -> cert_score, projects -> project_score
            total_cert = sum(x.certifications_done for x in cp)
            total_proj = sum(x.projects_done for x in cp)
            cert_score = _clamp(total_cert * 10.0, 0.0, 100.0)
            project_score = _clamp(total_proj * 8.0, 0.0, 100.0)

        total_score = (0.35 * leetcode_score +
                       0.25 * github_score +
                       0.20 * cert_score +
                       0.20 * project_score)

        rows.append((u.id, leetcode_score, github_score, cert_score, project_score, total_score))

    # rank by total_score desc
    rows.sort(key=lambda x: x[-1], reverse=True)

    # delete existing for day
    StudentDailyScore.query.filter_by(score_date=run_date).delete()
    db.session.commit()

    for idx, (user_id, lc, gh, cs, ps, ts) in enumerate(rows, start=1):
        db.session.add(StudentDailyScore(
            user_id=user_id,
            score_date=run_date,
            leetcode_score=lc,
            github_score=gh,
            cert_score=cs,
            project_score=ps,
            total_score=ts,
            rank=idx
        ))
    db.session.commit()
