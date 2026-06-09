from datetime import date
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from ..services.scoring import recompute_daily_leaderboard
from ..services.clustering import recompute_clusters
from ..services.recommender import recompute_internship_recommendations

scheduler = BackgroundScheduler()

def start_jobs(app):
    if not app.config.get("RUN_SCHEDULER", True):
        return
    scheduler.add_job(func=lambda: _run_all(app), trigger=CronTrigger(hour=0, minute=10), id="daily_jobs", replace_existing=True)
    scheduler.start()

def _run_all(app):
    with app.app_context():
        today = date.today()
        recompute_daily_leaderboard(today)
        recompute_clusters(today)
        recompute_internship_recommendations(today, top_n=10)
