import os
import json
from flask import request
from flask_socketio import emit
from .extensions import socketio
from .models import InterviewSession, InterviewMessage, User, db
from .utils.score_utils import update_user_daily_score
from .services.llm import LLMService

# Initialize Global LLM Service
llm_service = LLMService()

# In-memory storage for session mapping (SID to Database Session ID and User ID)
active_sessions = {}

@socketio.on('connect')
def handle_connect():
    print(f"DEBUG: Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"DEBUG: Client disconnected: {request.sid}")
    if request.sid in active_sessions:
        del active_sessions[request.sid]

@socketio.on('user_answer')
def handle_answer(data):
    role = data.get('role', 'Software Engineer')
    user_text = data.get('text', '')
    user_id = data.get('user_id')
    session_id = request.sid

    # Fetch User name for personalization
    user_name = "Candidate"
    if user_id:
        u = User.query.get(user_id)
        if u and u.name:
            user_name = u.name.split()[0] # Use first name

    if session_id not in active_sessions:
        if not user_id: return
        db_sess = InterviewSession(user_id=user_id, target_role=role)
        db.session.add(db_sess)
        db.session.commit()
        
        active_sessions[session_id] = {
            "db_id": db_sess.id,
            "user_id": user_id,
            "user_name": user_name,
            "history": [{"role": "system", "content": (
                f"You are Alex, a warm and professional Senior Technical Recruiter. You are interviewing {user_name} for a {role} position. "
                "CRITICAL INSTRUCTIONS: "
                "1. Always treat this as a human conversation, not a questionnaire. "
                "2. Start by introducing yourself and welcoming the candidate by name. "
                "3. Before asking a new question, ALWAYS briefly acknowledge or comment on their previous answer (e.g., 'That's a very practical approach to state management', 'I appreciate your perspective on teamwork'). "
                "4. Be encouraging and build a rapport. "
                "5. Keep responses concise (under 60 words). "
                "6. Only ask one question at a time."
            )}]
        }
    
    sess_data = active_sessions[session_id]
    db_id = sess_data["db_id"]
    history = sess_data["history"]
    user_name = sess_data["user_name"]

    if user_text:
        history.append({"role": "user", "content": user_text})
        db.session.add(InterviewMessage(session_id=db_id, sender="user", message=user_text))
    elif len(history) == 1:
        # Initial trigger
        history.append({"role": "user", "content": f"Hi Alex, I'm {user_name}. I'm excited to start my interview for the {role} position!"})

    try:
        ai_response = llm_service.get_completion(history)
        history.append({"role": "assistant", "content": ai_response})
        db.session.add(InterviewMessage(session_id=db_id, sender="ai", message=ai_response))
        db.session.commit()
        emit('hr_question', {'text': ai_response})
    except Exception as e:
        print(f"LLM Error: {e}")
        error_msg = f"I'm sorry, {user_name}, I'm having a little trouble with my connection. Could you please give me a second?"
        emit('hr_question', {'text': error_msg})

@socketio.on('generate_report')
def handle_report(data):
    session_id = request.sid
    if session_id not in active_sessions: return

    sess_data = active_sessions[session_id]
    user_id = sess_data["user_id"]
    db_id = sess_data["db_id"]
    history = sess_data["history"]

    evaluation_prompt = (
        f"Analyze this interview for a {data.get('role', 'Candidate')} position. "
        "Provide a JSON object with: 'technical_score' (1-10), 'soft_skills_score' (1-10), "
        "'feedback' (a 2-sentence summary), and 'areas_to_improve' (list of 3 strings)."
    )
    
    eval_history = history + [{"role": "user", "content": evaluation_prompt}]
    
    try:
        report_json = llm_service.get_completion(eval_history, response_format={"type": "json_object"})
        report_obj = json.loads(report_json)
        
        final_score = ((float(report_obj.get('technical_score', 5)) + float(report_obj.get('soft_skills_score', 5))) / 20) * 100
        
        db_sess = InterviewSession.query.get(db_id)
        db_sess.status = "completed"
        db_sess.score = final_score
        db.session.commit()
        
        update_user_daily_score(user_id)
        emit('final_report', report_json)
        del active_sessions[session_id]
    except Exception as e:
        print(f"Report Error: {e}")
        emit('final_report', json.dumps({"feedback": "Error generating report."}))

@socketio.on('ping_test')
def handle_ping(data):
    emit('pong_test', {'status': 'alive'})
