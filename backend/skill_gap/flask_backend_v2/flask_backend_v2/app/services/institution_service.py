from ..models import User, Internship, SkillProfile, db
import json
from collections import Counter

def get_curriculum_gaps():
    # 1. Calculate Market Demand (from Internships)
    internships = Internship.query.all()
    demand_counter = Counter()
    total_internships = len(internships)
    
    for i in internships:
        try:
            skills = json.loads(i.required_skills_json)
            # Normalize
            skills = [s.lower().strip() for s in skills]
            demand_counter.update(skills)
        except:
            pass

    # If no internships, fallback to simulated market data for demo purposes
    if total_internships == 0:
        demand_counter = Counter({
            "python": 80, "react": 75, "javascript": 70, "sql": 65, 
            "docker": 60, "aws": 55, "node.js": 50, "communication": 45
        })
        total_internships = 100 # Arbitrary base

    # 2. Calculate Student Supply (from SkillProfiles)
    students = User.query.filter_by(role="student").all()
    supply_counter = Counter()
    total_students = len(students)
    
    for s in students:
        profile = SkillProfile.query.filter_by(user_id=s.id).first()
        if profile:
            try:
                skills = json.loads(profile.skills_json)
                skills = [s.lower().strip() for s in skills]
                supply_counter.update(skills)
            except:
                pass

    # 3. Analyze Gaps
    # Gap Score = (Demand % - Supply %)
    # We only care about positive gaps (Under-supply)
    
    gaps = []
    all_skills = set(demand_counter.keys()) | set(supply_counter.keys())
    
    for skill in all_skills:
        demand_pct = (demand_counter[skill] / total_internships) * 100 if total_internships > 0 else 0
        supply_pct = (supply_counter[skill] / total_students) * 100 if total_students > 0 else 0
        
        gap = demand_pct - supply_pct
        
        if gap > 5: # Threshold for significant gap
            gaps.append({
                "skill": skill.title(),
                "demand_pct": round(demand_pct, 1),
                "supply_pct": round(supply_pct, 1),
                "gap_score": round(gap, 1),
                "recommendation": f"Increase {skill.title()} coursework"
            })
            
    # Sort by gap score descending
    gaps.sort(key=lambda x: x["gap_score"], reverse=True)
    
    return gaps[:10] # Return top 10 critical gaps
