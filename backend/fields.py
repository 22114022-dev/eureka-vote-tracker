"""Voting fields (lĩnh vực) tracked by the app. Add an entry to track another category."""

PAGE_SIZE = 24

FIELDS = {
    "KHNN": {
        "key": "KHNN",
        "name": "Khoa học Nông nghiệp",
        "shortName": "Nông nghiệp",
        "categoryId": 6,
        "pages": 3,
        "defaultTeam": "KHNN2026-002",
        "portalSlug": "KHNN",
        # Original storage names, so data saved before multi-field support keeps loading
        "stateSuffix": "",
        "redisPrefix": "eureka_khnn",
        "snapshotMax": 1500,
    },
    "KTE": {
        "key": "KTE",
        "name": "Kinh tế",
        "shortName": "Kinh tế",
        "categoryId": 9,
        "pages": 17,
        "defaultTeam": "KTE2026-136",
        "portalSlug": "KTE",
        "stateSuffix": "_kte",
        "redisPrefix": "eureka_kte",
        # ~390 projects per snapshot: keep fewer to hold the state file near 2.5 MB
        "snapshotMax": 300,
    },
}

DEFAULT_FIELD = "KHNN"


def resolve_field(key):
    """Config for the requested field key, else the default field."""
    return FIELDS.get((key or "").strip().upper(), FIELDS[DEFAULT_FIELD])
