import sqlite3
import os

db_path = 'instance/rankdb.sqlite3'

def migrate():
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Add credits column to users
        cursor.execute("ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 100")
        print("Column 'credits' added to 'users' table.")
    except sqlite3.OperationalError:
        print("Column 'credits' already exists in 'users' table.")

    # Create skill_barter_listings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS skill_barter_listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        skill_name TEXT NOT NULL,
        description TEXT,
        credits_required INTEGER DEFAULT 50,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)
    print("Table 'skill_barter_listings' checked/created.")

    # Create skill_barter_requests table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS skill_barter_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        listing_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (listing_id) REFERENCES skill_barter_listings (id),
        FOREIGN KEY (student_id) REFERENCES users (id)
    )
    """)
    print("Table 'skill_barter_requests' checked/created.")

    # Create credit_transactions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS credit_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users (id),
        FOREIGN KEY (receiver_id) REFERENCES users (id)
    )
    """)
    print("Table 'credit_transactions' checked/created.")

    conn.commit()
    conn.close()
    print("Migration for Skill Barter System complete.")

if __name__ == "__main__":
    migrate()
