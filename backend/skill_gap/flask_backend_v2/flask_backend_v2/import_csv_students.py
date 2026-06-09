"""
Import student data from existing leetcode_github_dataset.csv
This will populate the database with real student data for stats tracking
"""
import pandas as pd
from app import create_app
from app.extensions import db
from app.models import User
from werkzeug.security import generate_password_hash

def extract_username_from_url(url):
    """Extract username from GitHub/LeetCode URL"""
    if pd.isna(url) or not url:
        return None
    url = str(url).strip()
    # Extract last part of URL (e.g., https://github.com/username -> username)
    parts = url.rstrip('/').split('/')
    return parts[-1] if parts else None

def import_students_from_csv():
    app = create_app()
    
    with app.app_context():
        print("Importing students from leetcode_github_dataset.csv...")
        
        # Read CSV
        df = pd.read_csv('leetcode_github_dataset.csv')
        print(f"Found {len(df)} students in CSV")
        
        imported_count = 0
        
        for _, row in df.iterrows():
            name = str(row.get('name', '')).strip()
            if not name:
                continue
            
            # Generate email from name
            email = name.lower().replace(' ', '.') + '@skillmap.ai'
            
            # Check if user exists
            existing = User.query.filter_by(email=email).first()
            
            # Extract GitHub/LeetCode usernames from URLs
            github_url = row.get('github_profile', '')
            leetcode_url = row.get('leetcode_profile', '')
            
            github_user = extract_username_from_url(github_url)
            leetcode_user = extract_username_from_url(leetcode_url)
            
            if existing:
                # Update existing user
                if github_user:
                    existing.github_profile = github_user
                if leetcode_user:
                    existing.leetcode_profile = leetcode_user
                existing.role = 'student'
                print(f"Updated: {name}")
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
                print(f"Created: {name} (GitHub: {github_user}, LeetCode: {leetcode_user})")
            
            imported_count += 1
        
        db.session.commit()
        print(f"\n=== Import Complete ===")
        print(f"{imported_count} students imported/updated.")
        print(f"\nNow run stats sync to fetch their GitHub/LeetCode data:")
        print("  POST http://localhost:5001/admin/sync-stats")

if __name__ == "__main__":
    import_students_from_csv()

