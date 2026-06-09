from datetime import date, datetime
from ..extensions import db
from ..models import User, StudentDailyScore, LeetCodeGithubSnapshot, CertificationProject, UserAssessment

def calculate_career_readiness(user_id):
    """
    Calculate Career Readiness Index and breakdown for a user.
    Returns: (total_score, breakdown, raw_stats)
    """
    u = User.query.get(user_id)
    if not u:
        return 0, {}, {}

    today = date.today()
    snapshot = LeetCodeGithubSnapshot.query.filter_by(user_id=user_id, snapshot_date=today).first()
    
    # Get certifications/projects count
    cert_proj = CertificationProject.query.filter_by(user_id=user_id).all()
    # Use manual counts if available, otherwise sum from cert_proj
    projects_count = u.manual_projects_count or sum(cp.projects_done for cp in cert_proj)
    certs_count = u.manual_certifications_count or sum(cp.certifications_done for cp in cert_proj)
    
    # Get verified badges count (passed assessments)
    badges_count = UserAssessment.query.filter_by(user_id=user_id, passed=True).count()
    
    # Extract raw values from snapshot or fallback
    leetcode_solved = snapshot.problems_solved if snapshot else 0
    github_repos = snapshot.projects_submitted if snapshot else 0
    
    # Calculate scores (0-100 normalization)
    # Target: 500 problems
    leetcode_score = min((leetcode_solved / 500) * 100, 100)
    # Target: 20 repos
    github_score = min((github_repos / 20) * 100, 100)
    # Target: 10 projects
    projects_score = min((projects_count / 10) * 100, 100)
    # Target: 10 total
    certs_score = min(((certs_count + badges_count) / 10) * 100, 100)

    # Get latest interview score for today
    from ..models import InterviewSession
    latest_interview = InterviewSession.query.filter_by(
        user_id=user_id,
        status="completed"
    ).filter(InterviewSession.started_at >= datetime.combine(today, datetime.min.time())).order_by(InterviewSession.started_at.desc()).first()

    raw_interview = latest_interview.score if latest_interview else 0.0
    interview_score_norm = min(raw_interview, 100) # Score is already typically 0-100 or 1-10 scaled elsewhere

    # Weighted average (20/20/20/20/20) - 5 pillars
    total_score = (
        (leetcode_score * 0.20) +
        (github_score * 0.20) +
        (projects_score * 0.20) +
        (certs_score * 0.20) +
        (interview_score_norm * 0.20)
    )

    breakdown = {
        "leetcode": int(leetcode_score * 0.20),
        "github": int(github_score * 0.20),
        "projects": int(projects_score * 0.20),
        "certifications": int(certs_score * 0.20),
        "interview": int(interview_score_norm * 0.20)
    }

    raw_stats = {
        "leetcode_solved": leetcode_solved,
        "github_repos": github_repos,
        "projects_count": projects_count,
        "certifications_count": certs_count,
        "badges_count": badges_count,
        "interview_score": raw_interview
    }
    
    raw_stats = {
        "leetcode_solved": leetcode_solved,
        "github_repos": github_repos,
        "projects_count": projects_count,
        "certifications_count": certs_count,
        "badges_count": badges_count
    }
    
    return int(total_score), breakdown, raw_stats

def sync_user_with_dataset(user_id):
    """
    Search the leetcode_github_dataset.csv for a match based on name or usernames.
    If found, update the user's LeetCodeGithubSnapshot.
    """
    import pandas as pd
    u = User.query.get(user_id)
    if not u: return
    
    try:
        df = pd.read_csv('leetcode_github_dataset.csv')
    except Exception as e:
        print(f"ERROR: Could not read dataset for sync: {e}")
        return

    match = None
    # 1. Search by Name (exact)
    match = df[df['name'].str.lower() == u.name.lower()]
    
    # 2. Search by LeetCode handle (if URL contains the handle or handle is exact)
    if match.empty and u.leetcode_profile:
        # Handle could be "testuser" or "https://leetcode.com/testuser"
        handle = u.leetcode_profile.split('/')[-1].strip().lower()
        match = df[df['leetcode_profile'].str.lower().str.contains(handle, na=False)]
    
    # 3. Search by GitHub profile
    if match.empty and u.github_profile:
        handle = u.github_profile.lower()
        match = df[df['github_profile'].str.lower() == handle]

    if not match.empty:
        row = match.iloc[0]
        today = date.today()
        snapshot = LeetCodeGithubSnapshot.query.filter_by(user_id=user_id, snapshot_date=today).first()
        if not snapshot:
            snapshot = LeetCodeGithubSnapshot(user_id=user_id, snapshot_date=today)
            db.session.add(snapshot)
        
        snapshot.problems_solved = int(row.get('problems_solved', 0))
        snapshot.days_worked = int(row.get('days_worked', 0))
        snapshot.projects_submitted = int(row.get('projects_submitted', 0))
        db.session.commit()
        print(f"DEBUG: Synced user {u.name} with dataset match: {row['name']}")
        return True
    return False

def update_user_daily_score(user_id):
    """
    Recalculate and update the user's score in student_daily_scores.
    Also triggers a global rank update.
    """
    try:
        # Try to sync with dataset first if handles were updated
        sync_user_with_dataset(user_id)
        
        total_score, breakdown, raw = calculate_career_readiness(user_id)
        today = date.today()
        
        score_entry = StudentDailyScore.query.filter_by(user_id=user_id, score_date=today).first()
        if not score_entry:
            score_entry = StudentDailyScore(user_id=user_id, score_date=today)
            db.session.add(score_entry)
            
        score_entry.total_score = total_score
        score_entry.leetcode_score = breakdown["leetcode"]
        score_entry.github_score = breakdown["github"]
        score_entry.project_score = breakdown["projects"]
        score_entry.cert_score = breakdown["certifications"]
        score_entry.interview_score = breakdown.get("interview", 0)

        score_entry.raw_problems_solved = raw["leetcode_solved"]
        score_entry.raw_projects_submitted = raw["github_repos"]
        score_entry.raw_certs = raw["certifications_count"]
        score_entry.raw_projects_done = raw["projects_count"]
        score_entry.raw_interview_score = raw.get("interview_score", 0.0)
        
        db.session.commit()
        
        # Update Ranks for the day
        results = (StudentDailyScore.query.filter_by(score_date=today)
                .order_by(StudentDailyScore.total_score.desc())
                .all())
        
        for i, r in enumerate(results):
            r.rank = i + 1
            
        db.session.commit()
        print(f"DEBUG: Score updated for user {user_id}: {total_score}")
        return total_score
    except Exception as e:
        db.session.rollback()
        print(f"ERROR: Failed to update score for user {user_id}: {e}")
        return None
