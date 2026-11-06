import os
import json
import time
from datetime import datetime, timedelta, timezone
from initial_data import get_initial_dataset
from fetcher import fetch_all_pages_concurrently
from fields import FIELDS, DEFAULT_FIELD, resolve_field

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

# Per-project vote snapshots used for time-window deltas (velocity, "Biến động").
# A snapshot is only stored when votes changed, or as a heartbeat so that an
# unchanged stretch still has a recent baseline.
SNAPSHOT_HEARTBEAT_S = 600

# `team` value that turns off the home team (neutral viewing mode)
NEUTRAL_TEAM = "NONE"

# Servers such as Render run in UTC; all stored times use Vietnam time (UTC+7)
VN_TZ = timezone(timedelta(hours=7))
# Voting deadline; set VOTING_END on the server if the organizers change it, empty hides the countdown
VOTING_END = os.environ.get("VOTING_END", "2026-11-10T17:00:00+07:00")

def _now():
    return datetime.now(VN_TZ)

def _parse_iso(value):
    dt = datetime.fromisoformat(value)
    # Snapshots saved before timezones were added are naive local time
    return dt if dt.tzinfo else dt.replace(tzinfo=VN_TZ)

os.makedirs(DATA_DIR, exist_ok=True)

class Storage:
    """Live vote state of one field (lĩnh vực), with its own files and Redis keys."""

    def __init__(self, field_key=DEFAULT_FIELD):
        self.field = FIELDS[field_key]
        suffix = self.field["stateSuffix"]
        self.cache_file = os.path.join(DATA_DIR, f"votes_state{suffix}.json")
        self.history_file = os.path.join(DATA_DIR, f"votes_history{suffix}.json")
        self.snapshots_file = os.path.join(DATA_DIR, f"votes_snapshots{suffix}.json")
        self.redis_prefix = self.field["redisPrefix"]
        self.default_team = self.field["defaultTeam"]
        self.redis_client = None
        self._init_redis()
        self.projects = []
        self.history = []
        self.snapshots = []
        self._snapshots_dirty = False
        self._using_seed = False
        self.last_updated = _now().isoformat()
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
                cached = self.redis_client.get(f"{self.redis_prefix}:projects")
                if cached:
                    self.projects = json.loads(cached)
                    cached_hist = self.redis_client.get(f"{self.redis_prefix}:history")
                    self.history = json.loads(cached_hist) if cached_hist else []
                    cached_snaps = self.redis_client.get(f"{self.redis_prefix}:snapshots")
                    self.snapshots = json.loads(cached_snaps) if cached_snaps else []
                    return
            except Exception as e:
                print(f"[Storage] Redis read error: {e}")

        # 2. Try Local File
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.projects = data.get("projects", [])
                    self.last_updated = data.get("last_updated", _now().isoformat())
                    self.last_scrape_status = data.get("last_scrape_status", "Sẵn sàng")
            except Exception as e:
                print(f"[Storage] Local cache read error: {e}")

        if os.path.exists(self.history_file):
            try:
                with open(self.history_file, "r", encoding="utf-8") as f:
                    self.history = json.load(f)
            except Exception as e:
                print(f"[Storage] History read error: {e}")

        if os.path.exists(self.snapshots_file):
            try:
                with open(self.snapshots_file, "r", encoding="utf-8") as f:
                    self.snapshots = json.load(f)
            except Exception as e:
                print(f"[Storage] Snapshots read error: {e}")

        # 3. Fallback to Initial Dataset if empty (only KHNN ships seed data)
        if not self.projects and self.field["key"] == "KHNN":
            # Seed data is only a placeholder until the first live sync:
            # no history point and no vote deltas should be derived from it.
            self.projects = get_initial_dataset()
            self._using_seed = True
            self._save_state()

    def _save_state(self):
        try:
            with open(self.cache_file, "w", encoding="utf-8") as f:
                json.dump({
                    "projects": self.projects,
                    "last_updated": self.last_updated,
                    "last_scrape_status": self.last_scrape_status,
                    "last_fetch_duration_ms": self.last_fetch_duration_ms
                }, f, ensure_ascii=False, indent=2)

            with open(self.history_file, "w", encoding="utf-8") as f:
                json.dump(self.history[-100:], f, ensure_ascii=False, indent=2)

            if self._snapshots_dirty:
                with open(self.snapshots_file, "w", encoding="utf-8") as f:
                    json.dump(self.snapshots, f, ensure_ascii=False, separators=(",", ":"))
        except Exception as e:
            print(f"[Storage] Error writing state: {e}")

        if self.redis_client:
            try:
                self.redis_client.set(f"{self.redis_prefix}:projects", json.dumps(self.projects, ensure_ascii=False))
                self.redis_client.set(f"{self.redis_prefix}:history", json.dumps(self.history[-100:], ensure_ascii=False))
                # Snapshots are the largest value; only push them when they changed
                # to keep Redis bandwidth low on free tiers.
                if self._snapshots_dirty:
                    self.redis_client.set(f"{self.redis_prefix}:snapshots", json.dumps(self.snapshots, ensure_ascii=False))
                self.redis_client.set(f"{self.redis_prefix}:last_updated", self.last_updated)
            except Exception as e:
                print(f"[Storage] Redis write error: {e}")

        self._snapshots_dirty = False

    def _record_snapshot(self, initial=False):
        now_str = _now().strftime("%H:%M:%S")
        target = next((p for p in self.projects if p.get("isTarget")), None)
        runner_up = next((p for p in self.projects if p.get("rank") == 2), None)
        rank3 = next((p for p in self.projects if p.get("rank") == 3), None)

        snapshot = {
            "timestamp": now_str,
            "iso": _now().isoformat(),
            "targetVotes": target["votes"] if target else 0,
            "targetCode": target["code"] if target else self.default_team,
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
        now = _now()
        if self.snapshots:
            last = self.snapshots[-1]
            age = (now - _parse_iso(last["iso"])).total_seconds()
            if last["votes"] == votes and age < SNAPSHOT_HEARTBEAT_S:
                return
        self.snapshots.append({"iso": now.isoformat(), "votes": votes})
        self.snapshots = self.snapshots[-self.field["snapshotMax"]:]
        self._snapshots_dirty = True

    def _run_start(self):
        """Index of the first snapshot of the current uninterrupted run.

        While the server runs a snapshot is stored at least every SNAPSHOT_HEARTBEAT_S, so a
        bigger gap means it was off (or asleep): votes gained meanwhile must not count as
        recent velocity.
        """
        max_gap = SNAPSHOT_HEARTBEAT_S * 1.5
        later = _parse_iso(self.snapshots[-1]["iso"])
        for i in range(len(self.snapshots) - 1, 0, -1):
            earlier = _parse_iso(self.snapshots[i - 1]["iso"])
            if (later - earlier).total_seconds() > max_gap:
                return i
            later = earlier
        return 0

    def _votes_at(self, seconds_ago):
        """Votes per project as of `seconds_ago`, or the start of the current run if it is shorter."""
        if not self.snapshots:
            return {}
        start = self._run_start()
        cutoff = _now() - timedelta(seconds=seconds_ago)
        for i in range(len(self.snapshots) - 1, start - 1, -1):
            if _parse_iso(self.snapshots[i]["iso"]) <= cutoff:
                return self.snapshots[i]["votes"]
        return self.snapshots[start]["votes"]

    def sync_live_data(self):
        """
        Fetches live data concurrently from the field's official API pages,
        computes rank and vote deltas, and updates internal state.
        """
        fetched_projects, duration_ms, errors = fetch_all_pages_concurrently(self.field["key"])
        self.last_fetch_duration_ms = duration_ms

        # A failed page would drop its projects from the ranking: keep the last good data instead
        min_expected = 10 if self._using_seed else max(10, int(len(self.projects) * 0.95))
        if len(fetched_projects) < min_expected:
            status = f"Lỗi đồng bộ trực tiếp ({'; '.join(errors)}) - Dùng dữ liệu lưu đệm"
            self.last_scrape_status = status
            return self.get_dashboard_payload()

        # Sort descending by votes
        fetched_projects.sort(key=lambda x: x["votes"], reverse=True)

        # Previous votes map to compute changeLastCycle
        prev_map = {} if self._using_seed else {p["code"]: p["votes"] for p in self.projects}
        self._using_seed = False
        top1_votes = fetched_projects[0]["votes"] if fetched_projects else 0

        for i, p in enumerate(fetched_projects, start=1):
            p["rank"] = i
            p["diffTop1"] = top1_votes - p["votes"]
            old_votes = prev_map.get(p["code"], p["votes"])
            p["changeLastCycle"] = p["votes"] - old_votes

        self.projects = fetched_projects
        self.last_updated = _now().isoformat()
        self.last_scrape_status = f"Đồng bộ trực tiếp thành công ({len(fetched_projects)} đề tài trong {duration_ms}ms)"
        self._record_snapshot()
        self._record_votes_snapshot()
        self._save_state()
        return self.get_dashboard_payload()

    @staticmethod
    def is_neutral(team):
        return (team or "").strip().upper() == NEUTRAL_TEAM

    def resolve_team(self, team):
        """Valid project code for the requested home team, else the default.

        Neutral mode has no home team: the current leader stands in so the race
        views (history, Top 1 vs Top 2) keep working.
        """
        if self.is_neutral(team) and self.projects:
            return max(self.projects, key=lambda p: p["votes"])["code"]
        codes = {p["code"] for p in self.projects}
        team = (team or "").strip().upper()
        return team if team in codes else self.default_team

    def get_history(self, team=None):
        """Race history of `team` vs its nearest competitor, built from per-project snapshots."""
        team = self.resolve_team(team)
        top5_codes = [p["code"] for p in sorted(self.projects, key=lambda x: x["votes"], reverse=True)[:5]]
        points = []
        for snap in self.snapshots[-100:]:
            votes = snap["votes"]
            if team not in votes:
                continue
            others = [(v, c) for c, v in votes.items() if c != team]
            if not others:
                continue
            opp_votes, opp_code = max(others)
            when = _parse_iso(snap["iso"]).astimezone(VN_TZ)
            points.append({
                "timestamp": when.strftime("%H:%M:%S"),
                "iso": snap["iso"],
                "targetVotes": votes[team],
                "targetCode": team,
                "runnerUpVotes": opp_votes,
                "runnerUpCode": opp_code,
                "gap": votes[team] - opp_votes,
                "top5": {c: votes[c] for c in top5_codes if c in votes},
            })
        return points

    def _field_info(self):
        f = self.field
        return {k: f[k] for k in ("key", "name", "shortName", "defaultTeam", "pages", "portalSlug")}

    def get_dashboard_payload(self, team=None):
        neutral = self.is_neutral(team)
        team = self.resolve_team(team)
        if not self.projects:
            return {"projects": [], "field": self._field_info(), "status": self.last_scrape_status}
        # Work on copies: the home team differs per viewer, shared state must stay untouched
        sorted_projects = sorted((dict(p) for p in self.projects), key=lambda x: x["votes"], reverse=True)
        for p in sorted_projects:
            p["isTarget"] = (not neutral and p["code"] == team)

        top1_votes = sorted_projects[0]["votes"] if sorted_projects else 0
        for i, p in enumerate(sorted_projects, start=1):
            p["rank"] = i
            p["diffTop1"] = top1_votes - p["votes"]

        target = next((p for p in sorted_projects if p.get("isTarget")), None)
        if not target:
            target = sorted_projects[0]

        target_rank = target["rank"]

        # Calculate Gap to nearest competitor
        above = None
        if target_rank == 1:
            nearest = sorted_projects[1] if len(sorted_projects) > 1 else None
            gap = target["votes"] - nearest["votes"] if nearest else 0
            is_ahead = True
        else:
            nearest = sorted_projects[0]  # The leader ahead
            gap = target["votes"] - nearest["votes"]  # negative value
            is_ahead = False
            above = sorted_projects[target_rank - 2]  # project directly ahead of the target

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
                "above": above,
                # Votes the target is short of the project above / the leader (0 when already ahead)
                "toAbove": above["votes"] - target["votes"] if above else 0,
                "toTop1": nearest["votes"] - target["votes"] if not is_ahead else 0,
                "statusBadge": (
                    "Đang bám đuổi rất sát!" if is_close
                    else "Safe" if is_ahead
                    else "Đang xếp sau Top 1"
                ),
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
                "totalPages": self.field["pages"],
                "totalVotes": total_votes,
                "avgVotes": avg_votes,
                "targetVoteShare": round(target["votes"] / total_votes * 100, 2) if total_votes else 0
            },
            "field": self._field_info(),
            "neutral": neutral,
            "lastUpdated": self.last_updated,
            "votingEnd": VOTING_END,
            "fetchDurationMs": self.last_fetch_duration_ms,
            "status": self.last_scrape_status
        }

storages = {key: Storage(key) for key in FIELDS}
storage = storages[DEFAULT_FIELD]


def get_storage(field_key):
    """Storage of the requested field, falling back to the default field."""
    return storages[resolve_field(field_key)["key"]]
