from datetime import datetime, date
from extensions import db

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    user_uid = db.Column(db.String(32), unique=True, nullable=True)  # for imported datasets like U001
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=True)

    leetcode_profile = db.Column(db.String(255), nullable=True)
    github_profile = db.Column(db.String(255), nullable=True)
    aspiring_role = db.Column(db.String(120), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class LeetCodeGithubSnapshot(db.Model):
    __tablename__ = "lcgh_snapshots"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    snapshot_date = db.Column(db.Date, nullable=False, index=True)

    problems_solved = db.Column(db.Integer, default=0)
    days_worked = db.Column(db.Integer, default=0)
    projects_submitted = db.Column(db.Integer, default=0)

    leetcode_score = db.Column(db.Float, default=0.0)
    github_score = db.Column(db.Float, default=0.0)

    user = db.relationship("User", backref=db.backref("lcgh_snapshots", lazy=True))

class CertificationProject(db.Model):
    __tablename__ = "cert_proj"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    domain = db.Column(db.String(120), nullable=False)

    projects_done = db.Column(db.Integer, default=0)
    certifications_done = db.Column(db.Integer, default=0)

    computed_score = db.Column(db.Float, default=0.0)  # domain score

    user = db.relationship("User", backref=db.backref("cert_proj", lazy=True))

class StudentDailyScore(db.Model):
    __tablename__ = "student_daily_scores"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    score_date = db.Column(db.Date, nullable=False, index=True)

    leetcode_score = db.Column(db.Float, default=0.0)
    github_score = db.Column(db.Float, default=0.0)
    cert_score = db.Column(db.Float, default=0.0)
    project_score = db.Column(db.Float, default=0.0)
    total_score = db.Column(db.Float, default=0.0)
    rank = db.Column(db.Integer, nullable=True)

    user = db.relationship("User", backref=db.backref("daily_scores", lazy=True))

class ClusterRun(db.Model):
    __tablename__ = "cluster_runs"
    id = db.Column(db.Integer, primary_key=True)
    run_date = db.Column(db.Date, nullable=False, index=True)
    domain = db.Column(db.String(120), nullable=False)
    k = db.Column(db.Integer, default=3)
    metadata_json = db.Column(db.Text, nullable=True)  # centroids etc.

class ClusterMembership(db.Model):
    __tablename__ = "cluster_memberships"
    id = db.Column(db.Integer, primary_key=True)
    cluster_run_id = db.Column(db.Integer, db.ForeignKey("cluster_runs.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    cluster_label = db.Column(db.Integer, nullable=False)
    confidence = db.Column(db.Float, default=0.0)
    reasons_json = db.Column(db.Text, nullable=True)

    user = db.relationship("User", backref=db.backref("cluster_memberships", lazy=True))
    run = db.relationship("ClusterRun", backref=db.backref("memberships", lazy=True))

class Internship(db.Model):
    __tablename__ = "internships"
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(160), nullable=False)
    skills_required = db.Column(db.Text, nullable=False)  # comma-separated
    salary_package = db.Column(db.String(60), nullable=True)
    domain = db.Column(db.String(120), nullable=False)

class InternshipRecommendation(db.Model):
    __tablename__ = "internship_recs"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    internship_id = db.Column(db.Integer, db.ForeignKey("internships.id"), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    match_score = db.Column(db.Float, default=0.0)
    explanation_json = db.Column(db.Text, nullable=True)

    user = db.relationship("User", backref=db.backref("internship_recs", lazy=True))
    internship = db.relationship("Internship", backref=db.backref("recommendations", lazy=True))

class Resume(db.Model):
    __tablename__ = "resumes"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    parsed_text = db.Column(db.Text, nullable=True)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

class ResumeJobMatch(db.Model):
    __tablename__ = "resume_job_matches"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    resume_id = db.Column(db.Integer, db.ForeignKey("resumes.id"), nullable=False)

    job_description = db.Column(db.Text, nullable=False)
    extracted_resume_skills = db.Column(db.Text, nullable=True)  # json string
    extracted_jd_skills = db.Column(db.Text, nullable=True)
    missing_skills = db.Column(db.Text, nullable=True)
    match_score = db.Column(db.Float, default=0.0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SkillProfile(db.Model):
    __tablename__ = "skill_profiles"
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    skills_json = db.Column(db.Text, nullable=False)  # {"python":3,...}
    projects_summary = db.Column(db.Text, nullable=True)
    aspiring_role = db.Column(db.String(120), nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

class LearningMap(db.Model):
    __tablename__ = "learning_maps"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    target_role = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    roadmap_markdown = db.Column(db.Text, nullable=False)
    roadmap_json = db.Column(db.Text, nullable=False)  # json string
    based_on_json = db.Column(db.Text, nullable=True)
