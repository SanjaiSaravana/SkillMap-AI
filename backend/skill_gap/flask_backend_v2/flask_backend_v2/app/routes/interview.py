from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.interview_service import start_new_session, process_user_answer
from ..models import InterviewSession, InterviewMessage

bp = Blueprint("interview", __name__, url_prefix="/interview")

@bp.post("/start")
@jwt_required()
def start():
    data = request.get_json(force=True)
    target_role = data.get("target_role")
    if not target_role:
        return jsonify({"error": "target_role required"}), 400
    
    user_id = int(get_jwt_identity())
    session_id, initial_msgs = start_new_session(user_id, target_role)
    
    return jsonify({
        "session_id": session_id,
        "messages": [{"sender": "ai", "content": m} for m in initial_msgs]
    })

@bp.post("/<int:session_id>/chat")
@jwt_required()
def chat(session_id):
    data = request.get_json(force=True)
    user_message = data.get("message")
    
    if not user_message:
        return jsonify({"error": "message required"}), 400
        
    result = process_user_answer(session_id, user_message)
    if not result:
        return jsonify({"error": "Session closed or invalid"}), 400
        
    return jsonify(result)

@bp.get("/<int:session_id>/history")
@jwt_required()
def history(session_id):
    msgs = InterviewMessage.query.filter_by(session_id=session_id).order_by(InterviewMessage.created_at.asc()).all()
    return jsonify({
        "messages": [{"sender": m.sender, "content": m.message} for m in msgs]
    })
