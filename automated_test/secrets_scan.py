import os
import re
from pathlib import Path
from typing import Any, Dict, List

ROOT = Path(__file__).resolve().parents[1]


def run_secrets_scan(base_url: str, tokens: Dict[str, str], endpoints: List[Dict[str, Any]], records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    patterns = [
        re.compile(r"AKIA[0-9A-Z]{16}"),
        re.compile(r"AIza[0-9A-Za-z\-_]{35}"),
        re.compile(r"ghp_[A-Za-z0-9]{36}"),
        re.compile(r"sk_live_[A-Za-z0-9]{16,}"),
    ]
    findings = []
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        if any(part in {"node_modules", ".git", "automated_test"} for part in path.parts):
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        for pattern in patterns:
            if pattern.search(text):
                findings.append(str(path))
                break
    records.append({
        "endpoint": "codebase",
        "method": "SCAN",
        "role": "none",
        "status": 0,
        "expected_status": 0,
        "finding": bool(findings),
        "severity": "HIGH" if findings else "INFO",
        "response_time_ms": 0,
        "test_category": "Hardcoded creds",
        "note": f"Potential hardcoded secrets found: {', '.join(findings) if findings else 'none'}",
    })
    return records
