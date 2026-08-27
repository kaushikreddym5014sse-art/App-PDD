import json
import os
import time
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional

ROOT = os.path.dirname(os.path.abspath(__file__))
INPUT_JSON_PATH = os.path.join(ROOT, "input.json")
REPORT_JSON_PATH = os.path.join(ROOT, "report.json")
SAVEPOINT_PATH = os.path.join(ROOT, "savepoint.json")


def load_input() -> Dict[str, Any]:
    with open(INPUT_JSON_PATH, "r", encoding="utf-8") as fh:
        return json.load(fh)


def load_or_init_report() -> List[Dict[str, Any]]:
    if os.path.exists(REPORT_JSON_PATH):
        with open(REPORT_JSON_PATH, "r", encoding="utf-8") as fh:
            try:
                data = json.load(fh)
                if isinstance(data, list):
                    return data
            except json.JSONDecodeError:
                pass
    return []


def save_report(records: List[Dict[str, Any]]) -> None:
    with open(REPORT_JSON_PATH, "w", encoding="utf-8") as fh:
        json.dump(records, fh, indent=2)


def save_savepoint(payload: Dict[str, Any]) -> None:
    with open(SAVEPOINT_PATH, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2)


def load_savepoint() -> Dict[str, Any]:
    if os.path.exists(SAVEPOINT_PATH):
        with open(SAVEPOINT_PATH, "r", encoding="utf-8") as fh:
            try:
                return json.load(fh)
            except json.JSONDecodeError:
                return {}
    return {}


def build_endpoints() -> List[Dict[str, Any]]:
    return [
        {"path": "/api/auth/register", "method": "POST", "public": True, "expected_roles": ["public"]},
        {"path": "/api/auth/login", "method": "POST", "public": True, "expected_roles": ["public"]},
        {"path": "/api/auth/profile", "method": "GET", "public": False, "expected_roles": ["user", "institution", "employer", "admin"]},
        {"path": "/api/certificates/verify/hash", "method": "POST", "public": False, "expected_roles": ["user", "institution", "employer", "admin"]},
        {"path": "/api/certificates", "method": "GET", "public": False, "expected_roles": ["user", "institution", "employer", "admin"]},
        {"path": "/api/certificates/issue", "method": "POST", "public": False, "expected_roles": ["institution", "admin"]},
        {"path": "/api/certificates/fraud-check", "method": "POST", "public": False, "expected_roles": ["user", "institution", "employer", "admin"]},
    ]


def make_request(base_url: str, method: str, path: str, headers: Optional[Dict[str, str]] = None, body: Optional[Dict[str, Any]] = None, timeout: int = 10) -> Dict[str, Any]:
    url = f"{base_url}{path}"
    data_bytes = None
    if body is not None:
        data_bytes = json.dumps(body).encode("utf-8")
    request_headers = dict(headers or {})
    if body is not None and "Content-Type" not in request_headers:
        request_headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data_bytes, headers=request_headers, method=method)
    start = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            body_text = response.read().decode("utf-8", errors="ignore")
            return {
                "status": response.status,
                "response_time_ms": round((time.time() - start) * 1000, 2),
                "body": body_text,
                "headers": dict(response.headers.items()),
            }
    except urllib.error.HTTPError as exc:
        body_text = exc.read().decode("utf-8", errors="ignore")
        return {
            "status": exc.code,
            "response_time_ms": round((time.time() - start) * 1000, 2),
            "body": body_text,
            "headers": dict(exc.headers.items()),
        }
    except Exception as exc:
        return {
            "status": 0,
            "response_time_ms": round((time.time() - start) * 1000, 2),
            "body": str(exc),
            "headers": {},
        }


def append_records(records: List[Dict[str, Any]], new_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    records.extend(new_records)
    return records
