from typing import Any, Dict, List

from dast_common import make_request


def run_authn_probe(base_url: str, tokens: Dict[str, str], endpoints: List[Dict[str, Any]], records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    for endpoint in endpoints:
        if endpoint["public"]:
            continue
        response = make_request(base_url, endpoint["method"], endpoint["path"], headers={}, body=None)
        finding = 200 <= response["status"] < 300
        records.append({
            "endpoint": endpoint["path"],
            "method": endpoint["method"],
            "role": "none",
            "status": response["status"],
            "expected_status": 401,
            "finding": finding,
            "severity": "HIGH" if finding else "INFO",
            "response_time_ms": response["response_time_ms"],
            "test_category": "AuthN bypass",
            "note": "Protected endpoint accepted request without token" if finding else "Missing token correctly rejected",
        })
    return records
