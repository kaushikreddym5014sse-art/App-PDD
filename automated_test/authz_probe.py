from typing import Any, Dict, List

from dast_common import make_request


def run_authz_probe(base_url: str, tokens: Dict[str, str], endpoints: List[Dict[str, Any]], records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    roles = ["user", "institution", "employer", "admin"]
    for endpoint in endpoints:
        if endpoint["public"]:
            continue
        for role in roles:
            token = tokens.get(role, "")
            headers = {"Authorization": f"Bearer {token}"} if token else {}
            body = None
            if endpoint["path"] == "/api/certificates/issue":
                body = {
                    "holder_name": "QA Student",
                    "degree": "BSc Security",
                    "institution": "Test University",
                    "issue_date": "2026-05-10",
                    "grade": "A",
                    "reg_number": "REG-TEST-001",
                }
            elif endpoint["path"] == "/api/certificates/verify/hash":
                body = {"hash": "0x1234"}
            elif endpoint["path"] == "/api/certificates/fraud-check":
                body = {"cert_id": "00000000-0000-0000-0000-000000000000"}
            response = make_request(base_url, endpoint["method"], endpoint["path"], headers=headers, body=body)
            allowed = role in endpoint["expected_roles"]
            finding = (not allowed and 200 <= response["status"] < 300) or (allowed and response["status"] >= 400)
            records.append({
                "endpoint": endpoint["path"],
                "method": endpoint["method"],
                "role": role,
                "status": response["status"],
                "expected_status": 200 if allowed else 403,
                "finding": finding,
                "severity": "HIGH" if (not allowed and 200 <= response["status"] < 300) else "INFO",
                "response_time_ms": response["response_time_ms"],
                "test_category": "RBAC / PrivEsc",
                "note": "Role reached endpoint without expected permission" if (not allowed and 200 <= response["status"] < 300) else "Access pattern matched expectation",
            })
    return records
