from ..models import User
import random

# Enhanced keyword-based chatbot with better intent detection
# For production, integrate with Gemini/OpenAI API

NAVIGATION_MAP = {
    "dashboard": "/dashboard",
    "profile": "/profile",
    "assessments": "/assessments",
    "assessment": "/assessments",
    "quiz": "/assessments",
    "test": "/assessments",
    "skill test": "/assessments",
    "roadmap": "/roadmap",
    "learning path": "/roadmap",
    "home": "/",
    "jobs": "/internships",
    "internships": "/internships",
    "internship": "/internships",
    "candidates": "/company",
    "curriculum": "/institution",
    "leaderboard": "/leaderboard",
    "upload": "/upload",
    "match skills": "/upload"
}

def process_bot_message(user_id, message):
    user = User.query.get(user_id)
    role = user.role if user else "student"
    msg_lower = message.lower().strip()

    # Handle greetings
    if any(word in msg_lower for word in ["hello", "hi", "hey", "start", "hey there"]):
        greetings = {
            "student": f"Hello! I'm your SkillMap AI Coach. I can help you with:\n• Taking skill assessments\n• Building your roadmap\n• Finding internships\n• Improving your profile\nWhat would you like to do?",
            "company": "Hello! I can help you find candidates and manage your recruitment. What are you looking for?",
            "institution": "Welcome! I can help you analyze curriculum gaps and student performance. What do you need?"
        }
        return {"text": greetings.get(role, greetings["student"]), "action": "reply", "payload": None}

    # Handle navigation
    if any(phrase in msg_lower for phrase in ["go to", "open", "show me", "navigate to", "take me to"]):
        for key, path in NAVIGATION_MAP.items():
            if key in msg_lower:
                return {
                    "text": f"Taking you to {key.title()}...",
                    "action": "navigate",
                    "payload": path
                }
        return {"text": "Where would you like to go? Try 'Go to Dashboard' or 'Show me Assessments'.", "action": "reply", "payload": None}

    # Skill-specific responses
    if "python" in msg_lower:
        return {
            "text": "Python is highly valuable! 🐍\n• Take the Python Basics assessment to earn a badge\n• Complete Python projects for your portfolio\n• Check the roadmap for Python learning resources\nWant me to open the assessments page?",
            "action": "reply",
            "payload": None
        }

    if "java" in msg_lower or "javascript" in msg_lower:
        return {
            "text": "Great choice! Java/JavaScript skills are in high demand.\n• Take relevant skill tests\n• Add projects to showcase your skills\n• Check job listings for opportunities\nShall I show you the assessments?",
            "action": "reply",
            "payload": None
        }

    # Assessment/Quiz queries
    if any(word in msg_lower for word in ["assessment", "quiz", "test", "skill test", "exam"]):
        return {
            "text": "Skill assessments help you earn verified badges! 🎯\n• Go to Assessments to browse available tests\n• Score 80%+ to earn a badge\n• Badges boost your visibility to recruiters\nReady to take a test?",
            "action": "reply",
            "payload": None
        }

    # Resume/Profile queries
    if any(word in msg_lower for word in ["resume", "cv", "profile"]):
        return {
            "text": "Your profile is your first impression! ✨\n• Upload your resume in 'Match Skills'\n• Add GitHub/LeetCode credentials\n• Complete skill assessments for badges\n• Update your bio and experience\nNeed help with any of these?",
            "action": "reply",
            "payload": None
        }

    # Internship/Job queries
    if any(word in msg_lower for word in ["job", "internship", "opportunity", "hiring", "career"]):
        return {
            "text": "Looking for opportunities? 💼\n• Check the Job Feed for internships\n• Match your skills with job requirements\n• Improve your readiness score\n• Take assessments to stand out\nWant to see available jobs?",
            "action": "reply",
            "payload": None
        }

    # Roadmap queries
    if any(word in msg_lower for word in ["roadmap", "learning", "study", "learn", "improve"]):
        return {
            "text": "Your personalized roadmap helps you grow! 📚\n• Get skill recommendations based on gaps\n• Follow curated learning paths\n• Track your progress\n• Align with industry demands\nShould I open your roadmap?",
            "action": "reply",
            "payload": None
        }

    # Leaderboard queries
    if any(word in msg_lower for word in ["leaderboard", "rank", "score", "compete"]):
        return {
            "text": "The leaderboard shows top performers! 🏆\n• Your rank is based on skills + projects + stats\n• Compete with peers\n• High rankings attract recruiters\nWant to check your position?",
            "action": "reply",
            "payload": None
        }

    # Help queries
    if any(word in msg_lower for word in ["help", "how to", "what can you", "guide"]):
        return {
            "text": "I'm here to guide you! Here's what I can do:\n• Answer questions about features\n• Navigate you to different pages\n• Suggest next steps for your career\n• Provide tips on skills and assessments\nWhat specific help do you need?",
            "action": "reply",
            "payload": None
        }

    # Recruiter-specific
    if role == "company":
        if "candidate" in msg_lower or "search" in msg_lower:
            return {
                "text": "To find the best candidates:\n• Use AI Candidate Search with a job description\n• Filter by verified skills\n• Check candidate rankings\n• Review their portfolios\nShall I open the search page?",
                "action": "reply",
                "payload": None
            }

    # Institution-specific
    if role == "institution":
        if "gap" in msg_lower or "curriculum" in msg_lower:
            return {
                "text": "Curriculum insights available:\n• View skill demand vs supply\n• Identify market gaps\n• See talent clusters\n• Track student performance\nLet me show you the dashboard.",
                "action": "navigate",
                "payload": "/institution"
            }

    # Default contextual responses
    default_responses = {
        "student": [
            "That's a great question! As a student, I recommend:\n• Taking skill assessments to build credibility\n• Keeping your profile updated\n• Exploring job opportunities\nWhat would you like to focus on?",
            "I'm here to help you grow! 🌱\nTry asking about assessments, jobs, or your roadmap. What interests you most?",
            "Good thinking! Consider:\n• Earning skill badges\n• Building your portfolio\n• Following your personalized roadmap\nWhich sounds most useful?"
        ],
        "company": [
            "For recruiting, I suggest:\n• Using AI Candidate Search\n• Filtering by verified skills\n• Reviewing student portfolios\nWhat would help you most?",
            "Let me help with recruitment! You can search candidates, analyze profiles, or post requirements. What do you need?"
        ],
        "institution": [
            "For institutional insights:\n• Check curriculum alignment\n• Review talent clusters\n• Monitor student performance\nWhat would you like to see?",
            "I can show you data on skill gaps, student rankings, and market trends. What interests you?"
        ]
    }

    response_text = random.choice(default_responses.get(role, default_responses["student"]))
    return {"text": response_text, "action": "reply", "payload": None}
