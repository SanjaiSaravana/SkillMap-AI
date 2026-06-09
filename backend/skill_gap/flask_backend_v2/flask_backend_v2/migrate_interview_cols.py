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
        # Add interview_score column
        cursor.execute("ALTER TABLE student_daily_scores ADD COLUMN interview_score FLOAT DEFAULT 0.0")
        print("Column 'interview_score' added successfully.")
    except sqlite3.OperationalError:
        print("Column 'interview_score' already exists.")

    try:
        # Add raw_interview_score column
        cursor.execute("ALTER TABLE student_daily_scores ADD COLUMN raw_interview_score FLOAT DEFAULT 0.0")
        print("Column 'raw_interview_score' added successfully.")
    except sqlite3.OperationalError:
        print("Column 'raw_interview_score' already exists.")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
