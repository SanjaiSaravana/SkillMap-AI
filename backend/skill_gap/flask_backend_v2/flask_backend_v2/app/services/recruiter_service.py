from ..models import User, SkillProfile, LeetCodeGithubSnapshot, UserAssessment, db

import re

# Simple extraction logic if utils not available or specific
COMMON_SKILLS = [
    "python", "java", "react", "node.js", "sql", "aws", "docker", 
    "machine learning", "data analysis", "javascript", "typescript",
    "flask", "django", "html", "css", "c++", "kubernetes"
]

def extract_skills(text):
    text = text.lower()
    found = []
    for sk in COMMON_SKILLS:
        if sk in text:
            found.append(sk)
    return found

def search_candidates(jd_text):
    # 1. Extract skills from JD
    required_skills = extract_skills(jd_text)
    if not required_skills:
        return []

    # 2. Get all students
    students = User.query.filter_by(role="student").all()
    results = []

    for student in students:
        score = 0
        matches = []
        
        # A. Skill Profile Match (Self-reported)
        profile = SkillProfile.query.filter_by(user_id=student.id).first()
        student_skills = []
        if profile:
            # Assuming skills_json is list of strings or string
            import json
            try:
                student_skills = json.loads(profile.skills_json)
            except:
                pass
        
        for req in required_skills:
            # Simple substring match
            if any(req in s.lower() for s in student_skills):
                score += 10
                matches.append(req)

        # B. Verified Badges Boost (Proof)
        badges = UserAssessment.query.filter_by(user_id=student.id, passed=True).all()
        for badge in badges:
            # We need to check if the badge skill is relevant
            # But let's verify against the Assessment model if needed
            # For efficiency, we assume badge title/skill relates
            # Here we just give a flat boost for ANY verified badge because it shows competence
            # Ideally: check badge.assessment.skill Vs required_skills
            score += 15 # High value for verification!

        # C. Stats Boost (Performance)
        snapshot = LeetCodeGithubSnapshot.query.filter_by(user_id=student.id).order_by(LeetCodeGithubSnapshot.snapshot_date.desc()).first()
        if snapshot:
            if snapshot.leetcode_score > 50: score += 5
            if snapshot.github_score > 50: score += 5

        # Calculate percentage (Mock)
        # Max score approx = len(required) * 10 + 30
        max_score = (len(required_skills) * 10) + 40
        match_percentage = min(100, (score / max_score) * 100)

        results.append({
            "id": student.id,
            "name": student.name,
            "role": student.aspiring_role,
            "total_score": match_percentage,
            "matched_skills": matches,
            "github_repos": snapshot.projects_submitted if snapshot else 0,
            "leetcode_solved": snapshot.problems_solved if snapshot else 0,
        })

    # Sort by score desc
    results.sort(key=lambda x: x["total_score"], reverse=True)
    return results
