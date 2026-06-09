from flask import Flask, jsonify
from config import Config
from extensions import init_extensions, db
from models import *  # noqa
from jobs import start_jobs

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    init_extensions(app)

    with app.app_context():
        db.create_all()

    # blueprints
    from routes.auth import bp as auth_bp
    from routes.leaderboard import bp as leaderboard_bp
    from routes.portfolio import bp as portfolio_bp
    from routes.clusters import bp as clusters_bp
    from routes.internships import bp as internships_bp
    from routes.resume import bp as resume_bp
    from routes.persona import bp as persona_bp
    from routes.learning_map import bp as learning_map_bp
    from admin_routes import bp as admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(leaderboard_bp)
    app.register_blueprint(portfolio_bp)
    app.register_blueprint(clusters_bp)
    app.register_blueprint(internships_bp)
    app.register_blueprint(resume_bp)
    app.register_blueprint(persona_bp)
    app.register_blueprint(learning_map_bp)
    app.register_blueprint(admin_bp)

    @app.get("/health")
    def health():
        return jsonify({"ok": True})

    # start background scheduler (dev-friendly)
    try:
        start_jobs(app)
    except Exception:
        # in some reload modes APScheduler can double-start; ignore for MVP
        pass

    return app
