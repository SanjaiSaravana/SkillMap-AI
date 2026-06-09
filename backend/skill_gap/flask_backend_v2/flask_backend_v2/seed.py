import os
from datetime import date
import pandas as pd
from werkzeug.security import generate_password_hash

from app import create_app
from app.extensions import db
from app.models import User, LeetCodeGithubSnapshot, CertificationProject, Internship
from app.services.scoring import recompute_daily_leaderboard
from app.services.clustering import recompute_clusters
from app.services.recommender import recompute_internship_recommendations

ROOT = os.path.dirname(__file__)

def must(path):
    if not os.path.exists(path):
        raise SystemExit(f"Missing: {path}")
    return path

def seed_from_csv():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()

        lcgh_path = must(os.path.join(ROOT, "leetcode_github_dataset.csv"))
        cs_path = must(os.path.join(ROOT, "cs_dataset.csv"))
        internships_path = must(os.path.join(ROOT, "internships_dataset.csv"))

        lcgh = pd.read_csv(lcgh_path)
        cs = pd.read_csv(cs_path)
        ints = pd.read_csv(internships_path)

        name_to_user = {}

        for _, row in lcgh.iterrows():
            name = str(row.get("name","")).strip()
            if not name:
                continue
            if name not in name_to_user:
                u = User(name=name, role="student",
                         leetcode_profile=(str(row.get("leetcode_profile","")).strip() or None),
                         github_profile=(str(row.get("github_profile","")).strip() or None))
                db.session.add(u); db.session.flush()
                name_to_user[name] = u

        for _, row in cs.iterrows():
            name = str(row.get("name","")).strip()
            if not name:
                continue
            if name not in name_to_user:
                u = User(name=name, role="student")
                db.session.add(u); db.session.flush()
                name_to_user[name] = u

        db.session.commit()

        demo = User(name="Demo Admin", email="demo@example.com",
                    password_hash=generate_password_hash("demo123"),
                    role="admin")
        db.session.add(demo); db.session.commit()

        today = date.today()

        for _, row in lcgh.iterrows():
            name = str(row.get("name","")).strip()
            if not name:
                continue
            u = name_to_user[name]
            db.session.add(LeetCodeGithubSnapshot(user_id=u.id, snapshot_date=today,
                                                 problems_solved=int(row.get("problems_solved",0)),
                                                 days_worked=int(row.get("days_worked",0)),
                                                 projects_submitted=int(row.get("projects_submitted",0))))
        db.session.commit()

        for _, row in cs.iterrows():
            name = str(row.get("name","")).strip()
            if not name:
                continue
            u = name_to_user[name]
            projects_done = int(row.get("projects_done",0))
            certifications_done = int(row.get("certifications_done",0))
            db.session.add(CertificationProject(user_id=u.id,
                                                domain=str(row.get("domain","General")).strip() or "General",
                                                projects_done=projects_done,
                                                certifications_done=certifications_done,
                                                computed_score=min(100.0, projects_done*8 + certifications_done*12)))
        db.session.commit()

        for _, row in ints.iterrows():
            db.session.add(Internship(company_name=str(row.get("company_name","")).strip(),
                                      role=str(row.get("role","")).strip(),
                                      skills_required=str(row.get("skills_required","")).strip(),
                                      salary_package=str(row.get("salary_package","")).strip(),
                                      domain=str(row.get("domain","General")).strip() or "General"))
        db.session.commit()

        recompute_daily_leaderboard(today)
        recompute_clusters(today)
        recompute_internship_recommendations(today, top_n=10)

        print("Seed complete.")
        print("Demo admin login: demo@example.com / demo123")

if __name__ == "__main__":
    seed_from_csv()
