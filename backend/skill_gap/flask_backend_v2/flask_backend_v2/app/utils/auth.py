from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from ..models import User

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        uid = int(get_jwt_identity())
        u = User.query.get(uid)
        if not u or u.role != "admin":
            return jsonify({"error": "admin required"}), 403
        return fn(*args, **kwargs)
    return wrapper
