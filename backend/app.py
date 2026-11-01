import os
import atexit
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from storage import storage
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
        "version": "2.0.0 (Official REST API)",
        "categoryId": 6,
        "categoryName": "Khoa học Nông nghiệp"
    })

@app.route("/api/leaderboard", methods=["GET"])
def get_leaderboard():
    payload = storage.get_dashboard_payload()
    payload["nextScrapeIn"] = get_next_run_seconds()
    return jsonify(payload)

@app.route("/api/history", methods=["GET"])
def get_history():
    return jsonify({
        "history": storage.get_history()
    })

@app.route("/api/refresh", methods=["POST"])
def manual_refresh():
    """Trigger an immediate concurrent fetch across all 3 pages."""
    payload = storage.sync_live_data()
    payload["nextScrapeIn"] = 60
    return jsonify({
        "message": "Đã cập nhật dữ liệu trực tiếp từ cổng chính thức Euréka 2026!",
        "data": payload
    })

@app.route("/api/simulate-vote", methods=["POST"])
def simulate_vote():
    """Simulation/Testing endpoint."""
    data = request.get_json() or {}
    code = data.get("code", "KHNN2026-002")
    amount = int(data.get("amount", 1))

    updated_proj = storage.bump_vote(code, amount)
    if updated_proj:
        payload = storage.get_dashboard_payload()
        return jsonify({
            "success": True,
            "message": f"Đã tăng +{amount} phiếu cho đề tài {code}!",
            "project": updated_proj,
            "dashboard": payload
        })
    else:
        return jsonify({
            "success": False,
            "error": f"Không tìm thấy đề tài mã {code}"
        }), 404

@app.route("/api/reset-data", methods=["POST"])
def reset_data():
    """Reset back to the exact initial seed dataset."""
    payload = storage.reset_to_seed()
    return jsonify({
        "success": True,
        "message": "Đã khôi phục dữ liệu gốc thành công!",
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
