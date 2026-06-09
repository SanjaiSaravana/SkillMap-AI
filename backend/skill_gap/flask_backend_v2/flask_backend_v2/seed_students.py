"""
Seed script to populate database with 10 dummy students for testing stats sync
"""
from app import create_app
from app.extensions import db
from app.models import User
from werkzeug.security import generate_password_hash

# Real GitHub/LeetCode usernames for testing
DUMMY_STUDENTS = [
    {"name": "Alex Johnson", "email": "alex@test.com", "github": "torvalds", "leetcode": "testuser"},
    {"name": "Sarah Chen", "email": "sarah@test.com", "github": "github", "leetcode": "user1234"},
    {"name": "Michael Brown", "email": "michael@test.com", "github": "microsoft", "leetcode": "codingninja"},
    {"name": "Emily Davis", "email": "emily@test.com", "github": "google", "leetcode": "leetcoder99"},
    {"name": "David Wilson", "email": "david@test.com", "github": "facebook", "leetcode": "algopro"},
    {"name": "Jessica Lee", "email": "jessica@test.com", "github": "netflix", "leetcode": "codewizard"},
    {"name": "Chris Taylor", "email": "chris@test.com", "github": "apple", "leetcode": "hackerman"},
    {"name": "Amanda Martinez", "email": "amanda@test.com", "github": "uber", "leetcode": "problemsolver"},
    {"name": "James Anderson", "email": "james@test.com", "github": "airbnb", "leetcode": "cpmaster"},
    {"name": "Laura White", "email": "laura@test.com", "github": "twitter", "leetcode": "devgenius"},
]

def seed_dummy_students():
    app = create_app()
    
    with app.app_context():
        print("🌱 Seeding dummy students...")
        
        for student in DUMMY_STUDENTS:
            # Check if user exists
            existing = User.query.filter_by(email=student["email"]).first()
            if existing:
                # Update existing
                existing.github_profile = student["github"]
                existing.leetcode_profile = student["leetcode"]
                print(f"✅ Updated: {student['name']}")
            else:
                # Create new
                user = User(
                    name=student["name"],
                    email=student["email"],
                    password_hash=generate_password_hash("password123"),
                    role="student",
                    github_profile=student["github"],
                    leetcode_profile=student["leetcode"],
                    aspiring_role="Software Engineer"
                )
                db.session.add(user)
                print(f"✅ Created: {student['name']}")
        
        db.session.commit()
        print("🏁 Seeding complete! 10 students ready for stats sync.")

if __name__ == "__main__":
    seed_dummy_students()
