from typing import Any, Dict, List

from dast_common import make_request


def run_rate_limit_probe(base_url: str, tokens: Dict[str, str], endpoints: List[Dict[str, Any]], records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    token = tokens.get("user", "")
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    for idx in range(30):
        response = make_request(base_url, "POST", "/api/auth/login", headers={}, body={"email": f"probe{idx}@example.com", "password": "wrong"})
        if response["status"] == 429:
            records.append({
                "endpoint": "/api/auth/login",
                "method": "POST",
                "role": "anonymous",
                "status": response["status"],
                "expected_status": 429,
                "finding": True,
                "severity": "MEDIUM",
                "response_time_ms": response["response_time_ms"],
                "test_category": "Rate limiting",
                "note": "Observed a rate-limit response after a burst",
            })
            break
    else:
        records.append({
            "endpoint": "/api/auth/login",
            "method": "POST",
            "role": "anonymous",
            "status": 200,
            "expected_status": 429,
            "finding": False,
            "severity": "INFO",
            "response_time_ms": 0,
            "test_category": "Rate limiting",
            "note": "No rate-limit response observed during the burst",
        })
    return records
