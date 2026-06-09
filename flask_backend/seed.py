import os
from datetime import date
import pandas as pd
from werkzeug.security import generate_password_hash

from app import create_app
from extensions import db
from models import User, LeetCodeGithubSnapshot, CertificationProject, Internship
from services.scoring import compute_lcgh_scores, compute_cert_project_scores, recompute_daily_leaderboard
from services.clustering import recompute_clusters
from services.recommender import recompute_internship_recommendations

ROOT = os.path.dirname(__file__)

def find_file(name: str):
    p1 = os.path.join(ROOT, name)
    if os.path.exists(p1): return p1
    return None

def seed_from_csv():
    app = create_app()
    with app.app_context():
        # wipe (demo)
        db.drop_all()
        db.create_all()

        # 1) Import LeetCode + GitHub dataset
        lcgh_path = find_file("leetcode_github_dataset.csv")
        cs_path = find_file("cs_dataset.csv")
        internships_path = find_file("internships_dataset.csv")

        if not lcgh_path or not cs_path or not internships_path:
            raise SystemExit("Missing CSVs. Place leetcode_github_dataset.csv, cs_dataset.csv, internships_dataset.csv in this folder.")

        lcgh = pd.read_csv(lcgh_path)
        cs = pd.read_csv(cs_path)
        ints = pd.read_csv(internships_path)

        # Create users from union of datasets by name
        name_to_user = {}

        for _, row in lcgh.iterrows():
            name = str(row["name"]).strip()
            if name not in name_to_user:
                u = User(name=name, email=None, password_hash=None,
                         leetcode_profile=str(row.get("leetcode_profile","")) if not pd.isna(row.get("leetcode_profile","")) else None,
                         github_profile=str(row.get("github_profile","")) if not pd.isna(row.get("github_profile","")) else None)
                db.session.add(u)
                db.session.flush()
                name_to_user[name] = u

        for _, row in cs.iterrows():
            name = str(row["name"]).strip()
            if name not in name_to_user:
                u = User(name=name)
                db.session.add(u)
                db.session.flush()
                name_to_user[name] = u

        db.session.commit()

        # Add a default login user for testing
        demo = User(name="Demo User", email="demo@example.com", password_hash=generate_password_hash("demo123"))
        db.session.add(demo)
        db.session.commit()

        # snapshots for today
        today = date.today()
        for _, row in lcgh.iterrows():
            name = str(row["name"]).strip()
            u = name_to_user[name]
            snap = LeetCodeGithubSnapshot(
                user_id=u.id,
                snapshot_date=today,
                problems_solved=int(row.get("problems_solved", 0)),
                days_worked=int(row.get("days_worked", 0)),
                projects_submitted=int(row.get("projects_submitted", 0)),
            )
            compute_lcgh_scores(snap)
            db.session.add(snap)
        db.session.commit()

        # cert/projects
        for _, row in cs.iterrows():
            name = str(row["name"]).strip()
            u = name_to_user[name]
            cp = CertificationProject(
                user_id=u.id,
                domain=str(row.get("domain","General")).strip(),
                projects_done=int(row.get("projects_done",0)),
                certifications_done=int(row.get("certifications_done",0)),
            )
            compute_cert_project_scores(cp)
            db.session.add(cp)
        db.session.commit()

        # internships
        for _, row in ints.iterrows():
            it = Internship(
                company_name=str(row["company_name"]).strip(),
                role=str(row["role"]).strip(),
                skills_required=str(row["skills_required"]).strip(),
                salary_package=str(row.get("salary_package","")).strip(),
                domain=str(row.get("domain","")).strip()
            )
            db.session.add(it)
        db.session.commit()

        # compute derived
        recompute_daily_leaderboard(today)
        recompute_clusters(today, k=3)
        recompute_internship_recommendations(today, top_n=10)

        print("Seed complete.")
        print("Demo login: demo@example.com / demo123")

if __name__ == "__main__":
    seed_from_csv()
