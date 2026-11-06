from apscheduler.schedulers.background import BackgroundScheduler
import datetime
import time
from storage import storages, ACTIVE_WINDOW_S, IDLE_SYNC_S

scheduler = BackgroundScheduler()
_last_run_time = datetime.datetime.now()

def scheduled_job():
    global _last_run_time
    _last_run_time = datetime.datetime.now()
    print(f"[Scheduler] [{_last_run_time.strftime('%H:%M:%S')}] Concurrently syncing all fields from Euréka API...")
    for key, store in storages.items():
        now = time.time()
        idle = now - store.last_viewed > ACTIVE_WINDOW_S
        # Ticks are 60s apart: allow a little slack so an idle field syncs on every 5th tick
        if idle and now - store.last_sync_ts < IDLE_SYNC_S - 10:
            continue
        try:
            store.sync_live_data()
            print(f"[Scheduler] [{_last_run_time.strftime('%H:%M:%S')}] {key} live sync completed.")
        except Exception as e:
            print(f"[Scheduler] {key} live sync error: {e}")
        time.sleep(1)

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
