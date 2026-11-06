import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from fields import FIELDS, DEFAULT_FIELD, PAGE_SIZE

API_URL_TEMPLATE = "https://binhchon.khoahoctre.com.vn/api/c/eureka-2026/entries?categoryId={category}&page={page}&pageSize={size}"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://binhchon.khoahoctre.com.vn/c/eureka-2026/"
}

# The official API answers HTTP 429 when many pages are requested at once
RETRY_STATUSES = {429, 502, 503, 504}
MAX_ATTEMPTS = 4

def fetch_single_page(page_num, category_id, session=None, timeout=8):
    """Fetches a single page from the official Euréka REST API, retrying when it is rate limited."""
    url = API_URL_TEMPLATE.format(category=category_id, page=page_num, size=PAGE_SIZE)
    client = session or requests
    error = None
    for attempt in range(MAX_ATTEMPTS):
        try:
            resp = client.get(url, headers=HEADERS, timeout=timeout)
            if resp.status_code == 200:
                return page_num, resp.json(), None
            error = f"HTTP {resp.status_code}"
            if resp.status_code not in RETRY_STATUSES:
                break
            retry_after = resp.headers.get("Retry-After", "")
            delay = float(retry_after) if retry_after.isdigit() else 1.5 * (attempt + 1)
        except Exception as e:
            error = str(e)
            delay = 1.0
        if attempt < MAX_ATTEMPTS - 1:
            time.sleep(min(delay, 5))
    return page_num, None, error

def fetch_all_pages_concurrently(field_key=DEFAULT_FIELD, timeout=8):
    """
    Fetches every page of a field concurrently (3 for KHNN, 17 for KTE).
    Returns normalized list of all projects and fetch duration in milliseconds.
    """
    field = FIELDS[field_key]
    start_time = time.time()
    all_raw_items = []
    errors = []

    # Use a persistent session with connection pooling for maximum speed (< 300ms)
    with requests.Session() as session:
        session.headers.update(HEADERS)
        with ThreadPoolExecutor(max_workers=min(field["pages"], 4)) as executor:
            future_to_page = {
                executor.submit(fetch_single_page, page, field["categoryId"], session, timeout): page
                for page in range(1, field["pages"] + 1)
            }

            for future in as_completed(future_to_page):
                page = future_to_page[future]
                try:
                    page_num, data, err = future.result()
                    if data and "items" in data:
                        for item in data["items"]:
                            item["page"] = page_num
                            all_raw_items.append(item)
                    elif err:
                        errors.append(f"Page {page}: {err}")
                except Exception as exc:
                    errors.append(f"Page {page} exception: {exc}")

    fetch_duration_ms = round((time.time() - start_time) * 1000, 1)

    # Normalize projects schema
    normalized_projects = []
    for item in all_raw_items:
        code = str(item.get("code", "")).strip().upper()
        votes = int(item.get("voteCount", 0))
        normalized_projects.append({
            "id": item.get("id"),
            "code": code,
            "title": str(item.get("title", "")).strip(),
            "authors": str(item.get("author") or item.get("authors") or "").strip(),
            "votes": votes,
            "page": item.get("page", 1),
            "link": item.get("link"),
            "posterPath": item.get("posterPath"),
            "isTarget": (code == field["defaultTeam"])
        })

    return normalized_projects, fetch_duration_ms, errors

if __name__ == "__main__":
    for key in FIELDS:
        projects, duration, errs = fetch_all_pages_concurrently(key)
        print(f"{key}: fetched {len(projects)} projects in {duration}ms (Errors: {errs})")
        target = next((p for p in projects if p["isTarget"]), None)
        if target:
            print(f"Target {target['code']}: {target['votes']} votes")
