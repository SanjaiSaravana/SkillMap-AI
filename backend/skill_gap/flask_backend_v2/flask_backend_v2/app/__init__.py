from flask import Flask, jsonify
from .config import Config
from .extensions import init_extensions
from .jobs.scheduler import start_jobs

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    init_extensions(app)

    from .routes.auth import bp as auth_bp
    from .routes.leaderboard import bp as leaderboard_bp
    from .routes.portfolio import bp as portfolio_bp
    from .routes.clusters import bp as clusters_bp
    from .routes.internships import bp as internships_bp
    from .routes.resume import bp as resume_bp
    from .routes.persona import bp as persona_bp
    from .routes.learning_map import bp as learning_map_bp
    from .routes.admin import bp as admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(leaderboard_bp)
    app.register_blueprint(portfolio_bp)
    app.register_blueprint(clusters_bp)
    app.register_blueprint(internships_bp)
    app.register_blueprint(resume_bp)
    app.register_blueprint(persona_bp)
    app.register_blueprint(learning_map_bp)
    app.register_blueprint(admin_bp)

    @app.get("/")
    def home():
        return jsonify({
            "name": "SkillGap API",
            "status": "running",
            "health": "/health"
        })

    @app.get("/health")
    def health():
        return jsonify({"ok": True})

    try:
        start_jobs(app)
    except Exception:
        pass

    return app
