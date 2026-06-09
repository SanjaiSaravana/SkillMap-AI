"""
Import top 20 students from CSV for demo purposes
"""
import pandas as pd
from app import create_app
from app.extensions import db
from app.models import User
from werkzeug.security import generate_password_hash

def import_top_20_students():
    app = create_app()
    
    with app.app_context():
        print("Importing top 20 students from CSV...")
        
        # Read CSV and get top 20 by problems_solved
        df = pd.read_csv('leetcode_github_dataset.csv')
        df = df.sort_values('problems_solved', ascending=False).head(20)
        
        print(f"Selected top 20 students with highest LeetCode scores")
        
        imported_count = 0
        
        for _, row in df.iterrows():
            name = str(row.get('name', '')).strip()
            if not name:
                continue
            
            # Generate email from name
            email = name.lower().replace(' ', '.') + '@skillmap.ai'
            
            # Extract usernames from URLs
            github_url = row.get('github_profile', '')
            leetcode_url = row.get('leetcode_profile', '')
            
            github_user = github_url.rstrip('/').split('/')[-1] if pd.notna(github_url) and github_url else None
            leetcode_user = leetcode_url.rstrip('/').split('/')[-1] if pd.notna(leetcode_url) and leetcode_url else None
            
            # Check if user exists
            existing = User.query.filter_by(email=email).first()
            
            if existing:
                # Update existing user
                if github_user:
                    existing.github_profile = github_user
                if leetcode_user:
                    existing.leetcode_profile = leetcode_user
                existing.role = 'student'
                print(f"Updated: {name} (LC: {row.get('problems_solved', 0)})")
            else:
                # Create new user
                user = User(
                    name=name,
                    email=email,
                    password_hash=generate_password_hash('password123'),
                    role='student',
                    github_profile=github_user,
                    leetcode_profile=leetcode_user,
                    aspiring_role='Software Engineer'
                )
                db.session.add(user)
                print(f"Created: {name} (LC: {row.get('problems_solved', 0)}, GH: {row.get('projects_submitted', 0)})")
            
            imported_count += 1
        
        db.session.commit()
        print(f"\n=== Import Complete ===")
        print(f"{imported_count} top students imported/updated.")
        print(f"\nNext steps:")
        print("1. Run stats sync: POST http://localhost:5001/admin/sync-stats")
        print("2. Check leaderboard: GET http://localhost:5001/leaderboard")
        print("3. View dashboards with real ranked data!")

if __name__ == "__main__":
    import_top_20_students()
