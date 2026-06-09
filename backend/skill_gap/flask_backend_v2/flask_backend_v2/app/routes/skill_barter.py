from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, User, SkillBarterListing, SkillBarterRequest, CreditTransaction
from datetime import datetime

bp = Blueprint('skill_barter', __name__, url_prefix='/api/skill-barter')

def get_current_user():
    user_uid = get_jwt_identity()
    if not user_uid:
        return None
    return User.query.filter_by(user_uid=user_uid).first()

@bp.get('/credits')
@jwt_required()
def get_credits():
    user = get_current_user()
    if not user:
        return jsonify({"msg": "User not found"}), 404
    return jsonify({"credits": getattr(user, 'credits', 0)})

@bp.get('/listings')
@jwt_required()
def get_listings():
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    
    # Get all listings except current user's
    listings = SkillBarterListing.query.filter(SkillBarterListing.user_id != user.id).all()
    
    result = []
    for l in listings:
        result.append({
            "id": l.id,
            "user_name": l.user.name if l.user else "Unknown",
            "skill_name": l.skill_name,
            "description": l.description,
            "credits_required": l.credits_required,
            "created_at": l.created_at.isoformat() if l.created_at else None
        })
    return jsonify(result)

@bp.post('/listings')
@jwt_required()
def create_listing():
    user = get_current_user()
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    data = request.json or {}
    skill_name = data.get('skill_name')
    if not skill_name:
        return jsonify({"msg": "Skill name is required"}), 400

    new_listing = SkillBarterListing(
        user_id=user.id,
        skill_name=skill_name,
        description=data.get('description'),
        credits_required=data.get('credits_required', 50)
    )
    db.session.add(new_listing)
    db.session.commit()
    return jsonify({"msg": "Listing created", "id": new_listing.id}), 201

@bp.post('/request/<int:listing_id>')
@jwt_required()
def request_swap(listing_id):
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    
    listing = SkillBarterListing.query.get_or_404(listing_id)
    
    if user.credits < listing.credits_required:
        return jsonify({"msg": "Insufficient credits"}), 400
    
    existing = SkillBarterRequest.query.filter_by(listing_id=listing_id, student_id=user.id).first()
    if existing:
        return jsonify({"msg": "Request already exists"}), 400
        
    new_req = SkillBarterRequest(listing_id=listing_id, student_id=user.id)
    db.session.add(new_req)
    db.session.commit()
    return jsonify({"msg": "Swap request sent", "id": new_req.id}), 201

@bp.get('/my-requests')
@jwt_required()
def get_my_requests():
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    
    # Requests I've sent
    sent = SkillBarterRequest.query.filter_by(student_id=user.id).all()
    # Requests I've received for my listings
    received = SkillBarterRequest.query.join(SkillBarterListing).filter(SkillBarterListing.user_id == user.id).all()
    
    return jsonify({
        "sent": [{
            "id": r.id,
            "skill": r.listing.skill_name if r.listing else "Unknown",
            "teacher": r.listing.user.name if r.listing and r.listing.user else "Unknown",
            "status": r.status,
            "credits": r.listing.credits_required if r.listing else 0
        } for r in sent],
        "received": [{
            "id": r.id,
            "skill": r.listing.skill_name if r.listing else "Unknown",
            "student": r.student.name if r.student else "Unknown",
            "status": r.status,
            "credits": r.listing.credits_required if r.listing else 0
        } for r in received]
    })

@bp.post('/manage-request/<int:request_id>')
@jwt_required()
def manage_request(request_id):
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    
    req = SkillBarterRequest.query.get_or_404(request_id)
    data = request.json or {}
    action = data.get('action') # accept, reject, complete
    
    if action == 'accept' or action == 'reject':
        if req.listing.user_id != user.id:
            return jsonify({"msg": "Unauthorized"}), 403
        req.status = 'accepted' if action == 'accept' else 'rejected'
        
    elif action == 'complete':
        if req.student_id != user.id:
            return jsonify({"msg": "Only student can mark as complete"}), 403
            
        if req.status != 'accepted':
            return jsonify({"msg": "Request must be accepted first"}), 400
            
        # Transfer Credits
        teacher = req.listing.user
        student = req.student
        if not teacher or not student:
            return jsonify({"msg": "User data missing"}), 400

        amount = req.listing.credits_required
        
        if student.credits < amount:
            return jsonify({"msg": "Insufficient credits"}), 400
            
        student.credits -= amount
        teacher.credits += amount
        req.status = 'completed'
        
        # Log Transaction
        tx = CreditTransaction(
            sender_id=student.id,
            receiver_id=teacher.id,
            amount=amount,
            reason=f"Skill Swap: {req.listing.skill_name if req.listing else 'Unknown'}"
        )
        db.session.add(tx)
        
    db.session.commit()
    return jsonify({"msg": f"Request {action}ed successfully"})
