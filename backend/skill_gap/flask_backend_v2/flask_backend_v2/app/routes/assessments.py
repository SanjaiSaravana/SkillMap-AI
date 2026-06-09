from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.assessment_service import get_all_assessments, get_assessment_by_id, submit_assessment
from ..models import UserAssessment
import json

bp = Blueprint("assessments", __name__, url_prefix="/assessments")

@bp.get("/")
@jwt_required()
def list_assessments():
    user_id = int(get_jwt_identity())
    assessments = get_all_assessments()
    
    # Get user's passed assessments
    passed_ids = [ua.assessment_id for ua in UserAssessment.query.filter_by(user_id=user_id, passed=True).all()]
    
    results = []
    for asm in assessments:
        results.append({
            "id": asm.id,
            "title": asm.title,
            "skill": asm.skill,
            "difficulty": asm.difficulty,
            "passed": asm.id in passed_ids,
            "question_count": len(asm.questions)
        })
    return jsonify({"items": results})

@bp.get("/<int:id>")
@jwt_required()
def get_assessment(id):
    asm = get_assessment_by_id(id)
    if not asm:
        return jsonify({"error": "Not found"}), 404
        
    questions = []
    # Sort to ensure consistent order
    sorted_questions = sorted(asm.questions, key=lambda x: x.id)
    
    for q in sorted_questions:
        try:
            choices = json.loads(q.choices_json)
        except:
            choices = []
        questions.append({
            "id": q.id,
            "text": q.text,
            "choices": choices
        })
        
    return jsonify({
        "id": asm.id,
        "title": asm.title,
        "skill": asm.skill,
        "difficulty": asm.difficulty,
        "questions": questions
    })

@bp.post("/<int:id>/submit")
@jwt_required()
def submit(id):
    user_id = int(get_jwt_identity())
    data = request.get_json(force=True)
    answers = data.get("answers", []) # List of indices
    
    attempt = submit_assessment(user_id, id, answers)
    
    return jsonify({
        "score": attempt.score,
        "passed": attempt.passed,
        "attempted_at": attempt.attempted_at.isoformat()
    })
