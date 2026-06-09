import random
from datetime import datetime
from ..models import InterviewSession, InterviewMessage, db

# Simple Question Bank for Simulation
QUESTION_BANK = {
    "React Developer": [
        "Explain the Virtual DOM and how it improves performance.",
        "What are React Hooks? Name a few common ones.",
        "Diff between state and props?",
        "How do you handle side effects in React components?",
        "Explain the Context API and when to use it.",
        "What is Redux and how does it follow the Flux pattern?"
    ],
    "Python Developer": [
        "Explain the difference between deep copy and shallow copy.",
        "What are decorators in Python? usage?",
        "Explain list comprehensions vs generators.",
        "How does Python memory management work?",
        "Difference between Flask and Django?",
        "What is the GIL (Global Interpreter Lock)?"
    ],
    "Data Scientist": [
        "Explain the bias-variance tradeoff.",
        "What is the difference between supervised and unsupervised learning?",
        "How do you handle missing data in a dataset?",
        "Explain Random Forest algorithm.",
        "What is overfitting and how do you prevent it?",
        "Explain the ROC curve."
    ],
    "AI Engineer": [
        "What is a Transformer model?",
        "Explain the concept of Attention mechanism.",
        "Difference between LSTM and RNN?",
        "How do you fine-tune a pre-trained LLM?",
        "What is RAG (Retrieval Augmented Generation)?",
        "Explain vanishing gradient problem."
    ],
    "General": [
        "Tell me about a challenging project you worked on.",
        "How do you handle tight deadlines?",
        "Describe a time you had a conflict with a team member.",
        "Where do you see yourself in 5 years?"
    ]
}

def get_questions_for_role(role):
    # Basic keyword matching to find the best question set
    role_lower = role.lower()
    if "react" in role_lower or "frontend" in role_lower:
        return QUESTION_BANK["React Developer"]
    elif "python" in role_lower or "backend" in role_lower or "django" in role_lower or "flask" in role_lower:
        return QUESTION_BANK["Python Developer"]
    elif "data" in role_lower:
        return QUESTION_BANK["Data Scientist"]
    elif "ai" in role_lower or "ml" in role_lower or "machine learning" in role_lower:
        return QUESTION_BANK["AI Engineer"]
    else:
        return QUESTION_BANK["General"]

def start_new_session(user_id, target_role):
    session = InterviewSession(user_id=user_id, target_role=target_role)
    db.session.add(session)
    db.session.commit()
    
    # Initial greeting and first question
    greeting = f"Hello! I'm your AI Interviewer. I see you're applying for a {target_role} position. Let's start."
    first_q_set = get_questions_for_role(target_role)
    first_q = first_q_set[0] if first_q_set else "Tell me about yourself."
    
    msg_greet = InterviewMessage(session_id=session.id, sender="ai", message=greeting)
    msg_q = InterviewMessage(session_id=session.id, sender="ai", message=first_q)
    
    db.session.add(msg_greet)
    db.session.add(msg_q)
    db.session.commit()
    
    return session.id, [greeting, first_q]

def process_user_answer(session_id, user_answer):
    session = InterviewSession.query.get(session_id)
    if not session or session.status == "completed":
        return None
    
    # Save user answer
    user_msg = InterviewMessage(session_id=session.id, sender="user", message=user_answer)
    db.session.add(user_msg)
    
    # Determine next question based on history length
    history_count = InterviewMessage.query.filter_by(session_id=session.id, sender="ai").count()
    # Subtract 1 for greeting if it exists, roughly
    q_index = history_count - 1 # Simple Logic: 1st AI msg is greeting (sometimes), let's assume strict alternating for now or just count AI questions
    
    # Better logic: count how many "questions" asked. 
    # For simulation, getting the list by role is deterministic.
    questions = get_questions_for_role(session.target_role)
    
    response = ""
    is_finished = False
    
    if q_index >= len(questions) or q_index > 5: # Limit to 5-6 questions
        response = "Thank you for your time! I have gathered enough information. You can check your dashboard for feedback later. (Assessment: Good job!)"
        session.status = "completed"
        session.score = random.uniform(70, 95) # Mock score
        is_finished = True
    else:
        # Evaluate previous answer strings (Mock)
        if len(user_answer) < 20:
             feedback = "That was a bit brief. "
        else:
             feedback = "Good point. "
        
        next_q = questions[q_index] if q_index < len(questions) else "Do you have any questions for me?"
        response = f"{feedback}Let's move on. {next_q}"
    
    ai_msg = InterviewMessage(session_id=session.id, sender="ai", message=response)
    db.session.add(ai_msg)
    db.session.commit()
    
    return {
        "message": response,
        "is_finished": is_finished
    }
