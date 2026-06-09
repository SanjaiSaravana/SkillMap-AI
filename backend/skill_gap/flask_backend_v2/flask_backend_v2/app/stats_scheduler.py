from apscheduler.schedulers.background import BackgroundScheduler
from .services.stats_sync_service import sync_all_users
import logging

logger = logging.getLogger(__name__)

def start_stats_scheduler(app):
    """Initialize and start the background stats sync scheduler"""
    scheduler = BackgroundScheduler()
    
    # Run sync every hour at minute 0 (e.g., 1:00, 2:00, 3:00)
    scheduler.add_job(
        func=lambda: sync_with_app_context(app),
        trigger="cron",
        minute=0,  # Run at the top of every hour
        id="stats_sync_job",
        name="Sync GitHub/LeetCode Stats",
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("✅ Stats sync scheduler started (runs every hour)")
    
    return scheduler

def sync_with_app_context(app):
    """Wrapper to run sync within Flask app context"""
    with app.app_context():
        try:
            sync_all_users()
        except Exception as e:
            logger.error(f"Scheduled sync failed: {str(e)}")
