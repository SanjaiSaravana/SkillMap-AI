from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.chatbot_service import process_bot_message

bp = Blueprint("chatbot", __name__, url_prefix="/chatbot")

@bp.post("/message")
@jwt_required()
def message():
    user_id = int(get_jwt_identity())
    data = request.get_json(force=True)
    user_message = data.get("message", "")
    
    response = process_bot_message(user_id, user_message)
    
    return jsonify(response)
