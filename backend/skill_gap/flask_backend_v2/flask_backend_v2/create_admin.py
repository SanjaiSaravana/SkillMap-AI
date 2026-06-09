"""
Create an admin user for testing admin endpoints
"""
from app import create_app
from app.extensions import db
from app.models import User
from werkzeug.security import generate_password_hash

def create_admin():
    app = create_app()
    
    with app.app_context():
        # Check if admin exists
        admin = User.query.filter_by(email='admin@skillmap.ai').first()
        
        if admin:
            print("Admin user already exists!")
            print("Email: admin@skillmap.ai")
            print("Password: admin123")
        else:
            # Create admin user
            admin = User(
                name="Admin User",
                email="admin@skillmap.ai",
                password_hash=generate_password_hash('admin123'),
                role="admin"  # Important!
            )
            db.session.add(admin)
            db.session.commit()
            print("Admin user created successfully!")
            print("Email: admin@skillmap.ai")
            print("Password: admin123")

if __name__ == "__main__":
    create_admin()
