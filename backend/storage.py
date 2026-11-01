import os
import json
import time
from datetime import datetime, timedelta
from initial_data import get_initial_dataset
from fetcher import fetch_all_pages_concurrently

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CACHE_FILE = os.path.join(DATA_DIR, "votes_state.json")
HISTORY_FILE = os.path.join(DATA_DIR, "votes_history.json")
SNAPSHOTS_FILE = os.path.join(DATA_DIR, "votes_snapshots.json")

# Per-project vote snapshots used for time-window deltas (velocity, "Biến động").
# A snapshot is only stored when votes changed, or as a heartbeat so that an
# unchanged stretch still has a recent baseline.
SNAPSHOT_MAX = 1500
SNAPSHOT_HEARTBEAT_S = 600

os.makedirs(DATA_DIR, exist_ok=True)

class Storage:
    def __init__(self):
        self.redis_client = None
        self._init_redis()
        self.projects = []
        self.history = []
        self.snapshots = []
        self.last_updated = datetime.now().isoformat()
        self.last_fetch_duration_ms = 0
        self.last_scrape_status = "Chưa đồng bộ"
        self._load_state()

        # Perform initial real-time sync if possible
        try:
            self.sync_live_data()
        except Exception as e:
            print(f"[Storage] Initial sync note: {e}")

    def _init_redis(self):
        redis_url = os.environ.get("REDIS_URL") or os.environ.get("UPSTASH_REDIS_REST_URL")
        if redis_url:
            try:
                import redis
                self.redis_client = redis.from_url(redis_url, decode_responses=True)
                self.redis_client.ping()
                print("[Storage] Connected to Upstash Redis successfully.")
            except Exception as e:
                print(f"[Storage] Redis connection fallback: {e}")
                self.redis_client = None
        else:
            print("[Storage] In-memory storage active with JSON persistence.")

    def _load_state(self):
        # 1. Try Redis
        if self.redis_client:
            try:
                cached = self.redis_client.get("eureka_khnn:projects")
                if cached:
                    self.projects = json.loads(cached)
                    cached_hist = self.redis_client.get("eureka_khnn:history")
                    self.history = json.loads(cached_hist) if cached_hist else []
                    cached_snaps = self.redis_client.get("eureka_khnn:snapshots")
                    self.snapshots = json.loads(cached_snaps) if cached_snaps else []
                    return
            except Exception as e:
                print(f"[Storage] Redis read error: {e}")

        # 2. Try Local File
        if os.path.exists(CACHE_FILE):
            try:
                with open(CACHE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.projects = data.get("projects", [])
                    self.last_updated = data.get("last_updated", datetime.now().isoformat())
                    self.last_scrape_status = data.get("last_scrape_status", "Sẵn sàng")
            except Exception as e:
                print(f"[Storage] Local cache read error: {e}")

        if os.path.exists(HISTORY_FILE):
            try:
                with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                    self.history = json.load(f)
            except Exception as e:
                print(f"[Storage] History read error: {e}")

        if os.path.exists(SNAPSHOTS_FILE):
            try:
                with open(SNAPSHOTS_FILE, "r", encoding="utf-8") as f:
                    self.snapshots = json.load(f)
            except Exception as e:
                print(f"[Storage] Snapshots read error: {e}")

        # 3. Fallback to Initial Dataset if empty
        if not self.projects:
            self.projects = get_initial_dataset()
            self._record_snapshot(initial=True)
            self._save_state()

    def _save_state(self):
        try:
            with open(CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump({
                    "projects": self.projects,
                    "last_updated": self.last_updated,
                    "last_scrape_status": self.last_scrape_status,
                    "last_fetch_duration_ms": self.last_fetch_duration_ms
                }, f, ensure_ascii=False, indent=2)

            with open(HISTORY_FILE, "w", encoding="utf-8") as f:
                json.dump(self.history[-100:], f, ensure_ascii=False, indent=2)

            with open(SNAPSHOTS_FILE, "w", encoding="utf-8") as f:
                json.dump(self.snapshots, f, ensure_ascii=False, separators=(",", ":"))
        except Exception as e:
            print(f"[Storage] Error writing state: {e}")

        if self.redis_client:
            try:
                self.redis_client.set("eureka_khnn:projects", json.dumps(self.projects, ensure_ascii=False))
                self.redis_client.set("eureka_khnn:history", json.dumps(self.history[-100:], ensure_ascii=False))
                self.redis_client.set("eureka_khnn:snapshots", json.dumps(self.snapshots, ensure_ascii=False))
                self.redis_client.set("eureka_khnn:last_updated", self.last_updated)
            except Exception as e:
                print(f"[Storage] Redis write error: {e}")

    def _record_snapshot(self, initial=False):
        now_str = datetime.now().strftime("%H:%M:%S")
        target = next((p for p in self.projects if p.get("isTarget")), None)
        runner_up = next((p for p in self.projects if p.get("rank") == 2), None)
        rank3 = next((p for p in self.projects if p.get("rank") == 3), None)

        snapshot = {
            "timestamp": now_str,
            "iso": datetime.now().isoformat(),
            "targetVotes": target["votes"] if target else 0,
            "targetCode": target["code"] if target else "KHNN2026-002",
            "runnerUpVotes": runner_up["votes"] if runner_up else 0,
            "runnerUpCode": runner_up["code"] if runner_up else "",
            "rank3Votes": rank3["votes"] if rank3 else 0,
            "rank3Code": rank3["code"] if rank3 else "",
            "gap": (target["votes"] - runner_up["votes"]) if (target and runner_up) else 0
        }

        if not self.history or self.history[-1]["timestamp"] != now_str or initial:
            self.history.append(snapshot)
            if len(self.history) > 100:
                self.history = self.history[-100:]

    def _record_votes_snapshot(self):
        votes = {p["code"]: p["votes"] for p in self.projects}
        now = datetime.now()
        if self.snapshots:
            last = self.snapshots[-1]
            age = (now - datetime.fromisoformat(last["iso"])).total_seconds()
            if last["votes"] == votes and age < SNAPSHOT_HEARTBEAT_S:
                return
        self.snapshots.append({"iso": now.isoformat(), "votes": votes})
        self.snapshots = self.snapshots[-SNAPSHOT_MAX:]

    def _votes_at(self, seconds_ago):
        """Votes per project as of `seconds_ago`, or the oldest snapshot if history is shorter."""
        if not self.snapshots:
            return {}
        cutoff = datetime.now() - timedelta(seconds=seconds_ago)
        for s in reversed(self.snapshots):
            if datetime.fromisoformat(s["iso"]) <= cutoff:
                return s["votes"]
        return self.snapshots[0]["votes"]

    def sync_live_data(self):
        """
        Fetches live data concurrently from the 3 official API endpoints,
        computes rank and vote deltas, and updates internal state.
        """
        fetched_projects, duration_ms, errors = fetch_all_pages_concurrently()
        self.last_fetch_duration_ms = duration_ms

        if not fetched_projects or len(fetched_projects) < 10:
            status = f"Lỗi đồng bộ trực tiếp ({'; '.join(errors)}) - Dùng dữ liệu lưu đệm"
            self.last_scrape_status = status
            return self.get_dashboard_payload()

        # Sort descending by votes
        fetched_projects.sort(key=lambda x: x["votes"], reverse=True)

        # Previous votes map to compute changeLastCycle
        prev_map = {p["code"]: p["votes"] for p in self.projects}
        top1_votes = fetched_projects[0]["votes"] if fetched_projects else 0

        for i, p in enumerate(fetched_projects, start=1):
            p["rank"] = i
            p["diffTop1"] = top1_votes - p["votes"]
            old_votes = prev_map.get(p["code"], p["votes"])
            p["changeLastCycle"] = p["votes"] - old_votes

        self.projects = fetched_projects
        self.last_updated = datetime.now().isoformat()
        self.last_scrape_status = f"Đồng bộ trực tiếp thành công ({len(fetched_projects)} đề tài trong {duration_ms}ms)"
        self._record_snapshot()
        self._record_votes_snapshot()
        self._save_state()
        return self.get_dashboard_payload()

    def get_history(self):
        return list(self.history)

    def get_dashboard_payload(self):
        # Sort descending by votes
        sorted_projects = sorted(self.projects, key=lambda x: x["votes"], reverse=True)

        top1_votes = sorted_projects[0]["votes"] if sorted_projects else 0
        for i, p in enumerate(sorted_projects, start=1):
            p["rank"] = i
            p["diffTop1"] = top1_votes - p["votes"]

        target = next((p for p in sorted_projects if p.get("isTarget")), None)
        if not target:
            target = sorted_projects[0]

        target_rank = target["rank"]

        # Calculate Gap to nearest competitor
        if target_rank == 1:
            nearest = sorted_projects[1] if len(sorted_projects) > 1 else None
            gap = target["votes"] - nearest["votes"] if nearest else 0
            is_ahead = True
        else:
            nearest = sorted_projects[0]  # The leader ahead
            gap = target["votes"] - nearest["votes"]  # negative value
            is_ahead = False

        is_close = abs(gap) < 50

        # Time-window deltas from per-project snapshots
        base_5m = self._votes_at(5 * 60)
        base_1h = self._votes_at(60 * 60)
        for p in sorted_projects:
            p["change1h"] = p["votes"] - base_1h.get(p["code"], p["votes"])

        velocity_last_cycle = target.get("changeLastCycle", 0)
        velocity_5m = target["votes"] - base_5m.get(target["code"], target["votes"])
        velocity_1h = target["change1h"]

        total_votes = sum(p["votes"] for p in sorted_projects)
        avg_votes = round(total_votes / len(sorted_projects), 1) if sorted_projects else 0

        # Head to head (Rank 1 vs Rank 2)
        p1 = sorted_projects[0]
        p2 = sorted_projects[1] if len(sorted_projects) > 1 else None
        h2h_total = (p1["votes"] + (p2["votes"] if p2 else 0))
        p1_share = round((p1["votes"] / h2h_total * 100), 1) if h2h_total > 0 else 50
        p2_share = round(100 - p1_share, 1)

        # Chasing pack (ranks 6, 7, 8)
        chasing_pack = sorted_projects[5:8] if len(sorted_projects) >= 8 else []
        top5_min_votes = sorted_projects[4]["votes"] if len(sorted_projects) >= 5 else 0
        for cp in chasing_pack:
            cp["gapToTop5"] = top5_min_votes - cp["votes"]

        return {
            "projects": sorted_projects,
            "top5": sorted_projects[:5],
            "targetProject": target,
            "gapTracker": {
                "gap": gap,
                "isClose": is_close,
                "isAhead": is_ahead,
                "nearestCompetitor": nearest,
                "statusBadge": "Đang bám đuổi rất sát!" if is_close else "Khoảng cách an toàn",
                "alertLevel": "danger" if abs(gap) <= 25 else ("warning" if is_close else "normal")
            },
            "velocity": {
                "lastCycle": velocity_last_cycle,
                "velocity5m": velocity_5m,
                "velocity1h": velocity_1h,
                "trend": "up" if velocity_last_cycle >= 0 else "down"
            },
            "headToHead": {
                "rank1": p1,
                "rank2": p2,
                "gap": p1["votes"] - (p2["votes"] if p2 else 0),
                "p1Share": p1_share,
                "p2Share": p2_share
            },
            "chasingPack": chasing_pack,
            "overview": {
                "totalProjects": len(sorted_projects),
                "totalPages": 3,
                "totalVotes": total_votes,
                "avgVotes": avg_votes,
                "targetVoteShare": round(target["votes"] / total_votes * 100, 2) if total_votes else 0
            },
            "lastUpdated": self.last_updated,
            "fetchDurationMs": self.last_fetch_duration_ms,
            "status": self.last_scrape_status
        }

    def bump_vote(self, code, amount=1):
        target = next((p for p in self.projects if p["code"] == code), None)
        if target:
            target["votes"] += amount
            target["changeLastCycle"] = amount
            self.last_updated = datetime.now().isoformat()
            self._record_snapshot()
            self._record_votes_snapshot()
            self._save_state()
            return target
        return None

    def reset_to_seed(self):
        self.projects = get_initial_dataset()
        self.history = []
        self.snapshots = []
        self._record_snapshot(initial=True)
        self._record_votes_snapshot()
        self.last_updated = datetime.now().isoformat()
        self.last_scrape_status = "Đã khôi phục dữ liệu gốc"
        self._save_state()
        return self.get_dashboard_payload()

storage = Storage()
