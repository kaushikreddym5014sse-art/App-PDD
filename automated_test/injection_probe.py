from typing import Any, Dict, List

from dast_common import make_request


def run_injection_probe(base_url: str, tokens: Dict[str, str], endpoints: List[Dict[str, Any]], records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    payloads = ["' OR '1'='1", "1; DROP TABLE users;--", "admin'--"]
    token = tokens.get("user", "")
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    for payload in payloads:
        response = make_request(base_url, "POST", "/api/certificates/verify/hash", headers=headers, body={"hash": payload})
        finding = response["status"] >= 500 and ("sql" in response["body"].lower() or "syntax" in response["body"].lower() or "error" in response["body"].lower())
        records.append({
            "endpoint": "/api/certificates/verify/hash",
            "method": "POST",
            "role": "user",
            "status": response["status"],
            "expected_status": 200,
            "finding": finding,
            "severity": "HIGH" if finding else "INFO",
            "response_time_ms": response["response_time_ms"],
            "test_category": "Injection probe",
            "note": f"Injection payload triggered an anomaly: {payload}" if finding else "Payload handled without a server-side error",
        })
    return records
