from typing import Any, Dict, List

from dast_common import make_request


def run_token_tampering_probe(base_url: str, tokens: Dict[str, str], endpoints: List[Dict[str, Any]], records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    for endpoint in endpoints:
        if endpoint["public"]:
            continue
        token = tokens.get("user", "")
        if not token or "." not in token:
            continue
        parts = token.split(".")
        tampered = f"{parts[0]}.eyJyb2xlIjoiYWRtaW4ifQ.{parts[2]}"
        response = make_request(base_url, endpoint["method"], endpoint["path"], headers={"Authorization": f"Bearer {tampered}"}, body=None)
        records.append({
            "endpoint": endpoint["path"],
            "method": endpoint["method"],
            "role": "tampered_jwt",
            "status": response["status"],
            "expected_status": 401,
            "finding": 200 <= response["status"] < 300,
            "severity": "CRITICAL" if 200 <= response["status"] < 300 else "INFO",
            "response_time_ms": response["response_time_ms"],
            "test_category": "Token tampering",
            "note": "Tampered JWT was accepted" if 200 <= response["status"] < 300 else "Tampered JWT rejected",
        })
    return records
