from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from extensions import db
from models import User

bp = Blueprint("auth", __name__, url_prefix="/auth")

@bp.post("/register")
def register():
    data = request.get_json(force=True)
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "name, email, password required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email already registered"}), 409

    u = User(name=name, email=email, password_hash=generate_password_hash(password))
    db.session.add(u)
    db.session.commit()

    token = create_access_token(identity=str(u.id))
    return jsonify({"access_token": token, "user": {"id": u.id, "name": u.name, "email": u.email}})

@bp.post("/login")
def login():
    data = request.get_json(force=True)
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    u = User.query.filter_by(email=email).first()
    if not u or not u.password_hash or not check_password_hash(u.password_hash, password):
        return jsonify({"error": "invalid credentials"}), 401

    token = create_access_token(identity=str(u.id))
    return jsonify({"access_token": token, "user": {"id": u.id, "name": u.name, "email": u.email}})
