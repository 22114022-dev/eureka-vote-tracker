import os
import atexit
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from storage import get_storage
from fields import FIELDS
from scheduler import start_scheduler, stop_scheduler, get_next_run_seconds

DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

app = Flask(__name__, static_folder=DIST_DIR, static_url_path="")
CORS(app)

# Start background APScheduler (concurrent fetch every 60s)
start_scheduler()
atexit.register(stop_scheduler)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "service": "Euréka 2026 KHNN Live Vote Tracker",
        "version": "2.1.0 (Official REST API, multi-field)",
        "fields": [{"key": f["key"], "name": f["name"], "categoryId": f["categoryId"]} for f in FIELDS.values()]
    })

@app.route("/api/leaderboard", methods=["GET"])
def get_leaderboard():
    store = get_storage(request.args.get("field"))
    store.touch()
    payload = store.get_dashboard_payload(request.args.get("team"))
    payload["nextScrapeIn"] = get_next_run_seconds()
    return jsonify(payload)

@app.route("/api/history", methods=["GET"])
def get_history():
    return jsonify({
        "history": get_storage(request.args.get("field")).get_history(request.args.get("team"))
    })

@app.route("/api/refresh", methods=["POST"])
def manual_refresh():
    """Trigger an immediate concurrent fetch of every page of the requested field."""
    store = get_storage(request.args.get("field"))
    store.sync_live_data()
    payload = store.get_dashboard_payload(request.args.get("team"))
    payload["nextScrapeIn"] = 60
    return jsonify({
        "message": "Đã cập nhật dữ liệu trực tiếp từ cổng chính thức Euréka 2026!",
        "data": payload
    })

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(DIST_DIR, path)):
        return send_from_directory(DIST_DIR, path)
    if os.path.exists(os.path.join(DIST_DIR, "index.html")):
        return send_from_directory(DIST_DIR, "index.html")
    return jsonify({
        "status": "online",
        "service": "Euréka 2026 KHNN Live Vote Tracker Backend",
        "frontend": "Not built yet. Run 'npm run build' in frontend directory."
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[Eureka 2026 KHNN] Backend Server starting on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
