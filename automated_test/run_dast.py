import os
import json
import time
import urllib.request
import urllib.error
import re

BASE_URL = "http://localhost:4000"
INPUT_JSON_PATH = "automated_test/input.json"
REPORT_JSON_PATH = "automated_test/report.json"

# Register test users to get valid tokens
def get_tokens():
    tokens = {}
    roles = ["user", "institution", "employer", "admin"]
    for role in roles:
        email = f"test_{role}_{int(time.time())}@blockcertify.org"
        payload = json.dumps({
            "full_name": f"Test {role.capitalize()}",
            "email": email,
            "password": "Password123!",
            "role": role,
            "institution": "Test Inst"
        }).encode('utf-8')
        
        req = urllib.request.Request(f"{BASE_URL}/api/auth/register", data=payload, headers={'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req) as res:
                data = json.loads(res.read().decode('utf-8'))
                tokens[role] = data.get("token", "")
        except Exception as e:
            # Try login if already registered
            login_payload = json.dumps({"email": email, "password": "Password123!"}).encode('utf-8')
            login_req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=login_payload, headers={'Content-Type': 'application/json'})
            try:
                with urllib.request.urlopen(login_req) as lres:
                    data = json.loads(lres.read().decode('utf-8'))
                    tokens[role] = data.get("token", "")
            except Exception as le:
                tokens[role] = ""
    return tokens

def make_request(method, path, headers=None, body=None):
    if headers is None:
        headers = {}
    url = f"{BASE_URL}{path}"
    data_bytes = json.dumps(body).encode('utf-8') if body else None
    if body and 'Content-Type' not in headers:
        headers['Content-Type'] = 'application/json'
    
    req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
    start_time = time.time()
    try:
        with urllib.request.urlopen(req) as res:
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            res_body = res.read().decode('utf-8', errors='ignore')
            return res.status, elapsed_ms, res_body
    except urllib.error.HTTPError as e:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        res_body = e.read().decode('utf-8', errors='ignore')
        return e.code, elapsed_ms, res_body
    except Exception as e:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        return 0, elapsed_ms, str(e)

def run_dast_suite():
    tokens = get_tokens()
    with open(INPUT_JSON_PATH, "w") as f:
        json.dump({"baseUrl": BASE_URL, **tokens}, f, indent=2)

    reports = []
    
    endpoints = [
        {"path": "/api/auth/register", "method": "POST", "public": True, "roles": ["public"]},
        {"path": "/api/auth/login", "method": "POST", "public": True, "roles": ["public"]},
        {"path": "/api/auth/profile", "method": "GET", "public": False, "roles": ["user", "institution", "employer", "admin"]},
        {"path": "/api/certificates/verify/hash", "method": "POST", "public": False, "roles": ["user", "institution", "employer", "admin"]},
        {"path": "/api/certificates", "method": "GET", "public": False, "roles": ["user", "institution", "employer", "admin"]},
        {"path": "/api/certificates/issue", "method": "POST", "public": False, "roles": ["institution", "admin"]},
        {"path": "/api/certificates/fraud-check", "method": "POST", "public": False, "roles": ["user", "institution", "employer", "admin"]},
    ]

    # Category 1: AuthN Bypass (No token)
    for ep in endpoints:
        if not ep["public"]:
            status, ms, body = make_request(ep["method"], ep["path"])
            finding = status >= 200 and status < 300
            reports.append({
                "endpoint": ep["path"],
                "method": ep["method"],
                "role": "none",
                "status": status,
                "expected_status": 401,
                "finding": finding,
                "severity": "HIGH" if finding else "INFO",
                "response_time_ms": ms,
                "test_category": "AuthN Bypass",
                "note": "2xx on missing token!" if finding else "Correctly rejected missing token",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
            })

    # Category 2: AuthZ / PrivEsc & RBAC Matrix
    roles_list = ["user", "institution", "employer", "admin"]
    for ep in endpoints:
        if not ep["public"]:
            for role in roles_list:
                token = tokens.get(role, "")
                headers = {"Authorization": f"Bearer {token}"} if token else {}
                body = None
                if ep["path"] == "/api/certificates/issue":
                    body = {
                        "holder_name": "QA Student",
                        "degree": "B.Sc Security",
                        "institution": "Test University",
                        "issue_date": "2026-05-10",
                        "grade": "A",
                        "reg_number": f"REG-TEST-{int(time.time())}"
                    }
                elif ep["path"] == "/api/certificates/verify/hash":
                    body = {"hash": "0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a"}
                elif ep["path"] == "/api/certificates/fraud-check":
                    body = {"cert_id": "00000000-0000-0000-0000-000000000000"}

                status, ms, res_body = make_request(ep["method"], ep["path"], headers=headers, body=body)
                allowed = role in ep["roles"]
                expected = 200 if allowed or status == 201 else (403 if token else 401)
                finding = (not allowed and (200 <= status < 300)) or (allowed and status >= 400)
                
                reports.append({
                    "endpoint": ep["path"],
                    "method": ep["method"],
                    "role": role,
                    "status": status,
                    "expected_status": expected,
                    "finding": finding,
                    "severity": "HIGH" if (not allowed and 200 <= status < 300) else ("MEDIUM" if finding else "INFO"),
                    "response_time_ms": ms,
                    "test_category": "RBAC / PrivEsc",
                    "note": f"Role '{role}' allowed inappropriately" if (not allowed and 200 <= status < 300) else "Access control verified",
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
                })

    # Category 3: Token Tampering
    for ep in endpoints:
        if not ep["public"]:
            token = tokens.get("user", "")
            if token and "." in token:
                parts = token.split(".")
                # Flip claim payload to admin without resign
                tampered_token = f"{parts[0]}.eyJ1c2VySWQiOiJmYWtlIiwicm9sZSI6ImFkbWluIn0.{parts[2]}"
                headers = {"Authorization": f"Bearer {tampered_token}"}
                status, ms, body = make_request(ep["method"], ep["path"], headers=headers)
                finding = 200 <= status < 300
                reports.append({
                    "endpoint": ep["path"],
                    "method": ep["method"],
                    "role": "tampered_jwt",
                    "status": status,
                    "expected_status": 401,
                    "finding": finding,
                    "severity": "CRITICAL" if finding else "INFO",
                    "response_time_ms": ms,
                    "test_category": "Token Tampering",
                    "note": "Unsigned JWT claim accepted!" if finding else "Tampered JWT rejected cleanly",
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
                })

    # Category 4: Injection Probe (SQLi / NoSQLi detection)
    sqli_payloads = ["' OR '1'='1", "1; DROP TABLE users;--", "admin'--"]
    user_token = tokens.get("user", "")
    headers = {"Authorization": f"Bearer {user_token}"}
    for payload in sqli_payloads:
        status, ms, body = make_request("POST", "/api/certificates/verify/hash", headers=headers, body={"hash": payload})
        anomalous = status == 500 and ("SQL syntax" in body or "error" in body.lower())
        reports.append({
            "endpoint": "/api/certificates/verify/hash",
            "method": "POST",
            "role": "user",
            "status": status,
            "expected_status": 200,
            "finding": anomalous,
            "severity": "HIGH" if anomalous else "INFO",
            "response_time_ms": ms,
            "test_category": "Injection Probe",
            "note": f"SQLi anomaly detected for payload '{payload}'" if anomalous else "Parameter handled safely",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        })

    # Save report.json
    with open(REPORT_JSON_PATH, "w") as f:
        json.dump(reports, f, indent=2)

    print(f"✅ DAST Suite executed. Total test records: {len(reports)}")
    return reports

if __name__ == "__main__":
    run_dast_suite()
