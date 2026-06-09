"""
Simplified stats sync service that uses CSV data directly
Since the CSV has fake usernames, we'll use the data from the CSV itself
"""
import pandas as pd
from datetime import date
from app.extensions import db
from app.models import User, LeetCodeGithubSnapshot, StudentDailyScore

def sync_all_users():
    """Sync stats for all users using CSV data for LeetCode/GitHub and manual fields for others"""
    print("📊 Starting stats sync for ALL users...")
    
    from ..utils.score_utils import update_user_daily_score
    
    # Read CSV
    csv_path = 'leetcode_github_dataset.csv'
    csv_data_map = {}
    try:
        df = pd.read_csv(csv_path)
        for _, row in df.iterrows():
            name = str(row.get('name', '')).strip()
            if name:
                csv_data_map[name] = {
                    'problems_solved': int(row.get('problems_solved', 0)),
                    'days_worked': int(row.get('days_worked', 0)),
                    'projects_submitted': int(row.get('projects_submitted', 0))
                }
    except Exception as e:
        print(f"⚠️ Warning: Could not read CSV ({e}). Syncing users with 0 CSV stats.")
    
    today = date.today()
    synced_count = 0
    
    # Sync ALL users who are students
    users = User.query.filter_by(role='student').all()
    
    for user in users:
        # 1. Update Snapshot if we have CSV data for this user name
        if user.name in csv_data_map:
            data = csv_data_map[user.name]
            snapshot = LeetCodeGithubSnapshot.query.filter_by(
                user_id=user.id,
                snapshot_date=today
            ).first()
            
            if not snapshot:
                snapshot = LeetCodeGithubSnapshot(user_id=user.id, snapshot_date=today)
                db.session.add(snapshot)
            
            snapshot.problems_solved = data['problems_solved']
            snapshot.days_worked = data['days_worked']
            snapshot.projects_submitted = data['projects_submitted']
            db.session.commit() # Save snapshot so score calc sees it
        
        # 2. Trigger the centralized score update (handles manual projects, certs, and ranking)
        update_user_daily_score(user.id)
        synced_count += 1
        
        if synced_count % 20 == 0:
            print(f"✅ Processed {synced_count} users...")
    
    print(f"🎉 Sync complete! {synced_count} users processed.")
    
    return {
        "synced": synced_count,
        "total": len(users),
        "date": today.isoformat()
    }

def recalculate_ranks(score_date):
    """Recalculate ranks for all students on a given date"""
    rows = StudentDailyScore.query.filter_by(score_date=score_date).order_by(
        StudentDailyScore.total_score.desc()
    ).all()
    
    for rank, row in enumerate(rows, start=1):
        row.rank = rank
    
    db.session.commit()
    print(f"✅ Ranked {len(rows)} students")
