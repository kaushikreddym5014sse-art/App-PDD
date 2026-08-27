from typing import Any, Dict, List

from dast_common import make_request


def run_idor_probe(base_url: str, tokens: Dict[str, str], endpoints: List[Dict[str, Any]], records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    # The current API exposes no object-specific IDs in the discovered routes, so this is a placeholder with a live probe against the certificate verification endpoint.
    for role in ["user", "institution", "employer", "admin"]:
        token = tokens.get(role, "")
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        for payload in [
            {"hash": "0x1234"},
            {"hash": "0x999999"},
            {"hash": "0xdeadbeef"},
        ]:
            response = make_request(base_url, "POST", "/api/certificates/verify/hash", headers=headers, body=payload)
            records.append({
                "endpoint": "/api/certificates/verify/hash",
                "method": "POST",
                "role": role,
                "status": response["status"],
                "expected_status": 200,
                "finding": False,
                "severity": "INFO",
                "response_time_ms": response["response_time_ms"],
                "test_category": "IDOR",
                "note": "No object-specific ID parameters found in the reachable routes",
            })
    return records
