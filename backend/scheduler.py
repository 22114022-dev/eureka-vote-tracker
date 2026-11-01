from apscheduler.schedulers.background import BackgroundScheduler
import datetime
from storage import storage

scheduler = BackgroundScheduler()
_last_run_time = datetime.datetime.now()

def scheduled_job():
    global _last_run_time
    _last_run_time = datetime.datetime.now()
    print(f"[Scheduler] [{_last_run_time.strftime('%H:%M:%S')}] Concurrently syncing 3 pages from Euréka API...")
    try:
        storage.sync_live_data()
        print(f"[Scheduler] [{_last_run_time.strftime('%H:%M:%S')}] Live sync completed.")
    except Exception as e:
        print(f"[Scheduler] Live sync error: {e}")

def get_next_run_seconds():
    global _last_run_time
    now = datetime.datetime.now()
    elapsed = (now - _last_run_time).total_seconds()
    remaining = max(0, 60 - int(elapsed % 60))
    return remaining

def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(scheduled_job, 'interval', seconds=60, id='eureka_khnn_api_sync', replace_existing=True)
        scheduler.start()
        print("[Scheduler] APScheduler started (concurrent API sync every 60s).")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        print("[Scheduler] APScheduler stopped.")
