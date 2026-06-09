"""
Delete all students except the top 20
"""
import pandas as pd
from app import create_app
from app.extensions import db
from app.models import User, StudentDailyScore, LeetCodeGithubSnapshot, CertificationProject, UserAssessment

def cleanup_students():
    app = create_app()
    
    with app.app_context():
        print("Cleaning up database - keeping only top 20 students...")
        
        # Get top 20 student names from CSV
        df = pd.read_csv('leetcode_github_dataset.csv')
        df = df.sort_values('problems_solved', ascending=False).head(20)
        
        top_20_names = set()
        for _, row in df.iterrows():
            name = str(row.get('name', '')).strip()
            if name:
                top_20_names.add(name)
        
        print(f"Keeping these {len(top_20_names)} students:")
        for name in sorted(top_20_names):
            print(f"  + {name}")
        
        # Get all student users
        all_students = User.query.filter_by(role='student').all()
        
        students_to_delete = []
        for student in all_students:
            if student.name not in top_20_names:
                students_to_delete.append(student)
        
        print(f"\nDeleting {len(students_to_delete)} students...")
        
        # Delete related data first
        for student in students_to_delete:
            # Delete daily scores
            StudentDailyScore.query.filter_by(user_id=student.id).delete()
            
            # Delete snapshots
            LeetCodeGithubSnapshot.query.filter_by(user_id=student.id).delete()
            
            # Delete certifications/projects
            CertificationProject.query.filter_by(user_id=student.id).delete()
            
            # Delete user assessments
            UserAssessment.query.filter_by(user_id=student.id).delete()
            
            # Delete user
            db.session.delete(student)
            
            print(f"  - Deleted: {student.name}")
        
        db.session.commit()
        
        # Count remaining
        remaining = User.query.filter_by(role='student').count()
        
        print(f"\n=== Cleanup Complete ===")
        print(f"Remaining students: {remaining}")
        print(f"Deleted: {len(students_to_delete)}")
        print("\nDatabase is now clean with only top 20 students!")

if __name__ == "__main__":
    cleanup_students()
