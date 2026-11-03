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

def fetch_single_page(page_num, category_id, session=None, timeout=8):
    """Fetches a single page from the official Euréka REST API."""
    url = API_URL_TEMPLATE.format(category=category_id, page=page_num, size=PAGE_SIZE)
    client = session or requests
    try:
        resp = client.get(url, headers=HEADERS, timeout=timeout)
        if resp.status_code == 200:
            return page_num, resp.json(), None
        return page_num, None, f"HTTP {resp.status_code}"
    except Exception as e:
        return page_num, None, str(e)

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
        with ThreadPoolExecutor(max_workers=min(field["pages"], 8)) as executor:
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
