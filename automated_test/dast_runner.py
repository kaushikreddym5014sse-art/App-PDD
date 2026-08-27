import json
import os
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.append(str(ROOT))

from dast_common import (  # noqa: E402
    REPORT_JSON_PATH,
    SAVEPOINT_PATH,
    build_endpoints,
    load_input,
    load_or_init_report,
    load_savepoint,
    save_report,
    save_savepoint,
)

from authn_probe import run_authn_probe  # noqa: E402
from authz_probe import run_authz_probe  # noqa: E402
from idor_probe import run_idor_probe  # noqa: E402
from token_tampering import run_token_tampering_probe  # noqa: E402
from injection_probe import run_injection_probe  # noqa: E402
from rate_limit_probe import run_rate_limit_probe  # noqa: E402
from secrets_scan import run_secrets_scan  # noqa: E402


def main() -> None:
    input_data = load_input()
    base_url = input_data.get("baseUrl", "http://localhost:4000")
    tokens = {key: value for key, value in input_data.items() if key in {"user", "institution", "employer", "admin"}}
    endpoints = build_endpoints()

    save_savepoint({
        "status": "discovered",
        "baseUrl": base_url,
        "endpoints": endpoints,
        "tokens_loaded": sorted(tokens.keys()),
        "pending_confirmation": True,
    })

    print("Discovered endpoints:")
    for ep in endpoints:
        print(f"- {ep['method']} {ep['path']} [{', '.join(ep['expected_roles'])}]")
    print(f"Total discovered endpoints: {len(endpoints)}")
    print("")
    print("Paused before live test execution. Review the list above and confirm to continue.")
    print(f"Prepared scripts: {ROOT}")
    print("Run this command when ready: python3 automated_test/dast_runner.py --execute")

    if len(sys.argv) > 1 and sys.argv[1] == "--execute":
        records = load_or_init_report()
        records = run_authn_probe(base_url, tokens, endpoints, records)
        records = run_authz_probe(base_url, tokens, endpoints, records)
        records = run_idor_probe(base_url, tokens, endpoints, records)
        records = run_token_tampering_probe(base_url, tokens, endpoints, records)
        records = run_injection_probe(base_url, tokens, endpoints, records)
        records = run_rate_limit_probe(base_url, tokens, endpoints, records)
        records = run_secrets_scan(base_url, tokens, endpoints, records)
        for record in records:
            record.setdefault("timestamp", time.strftime("%Y-%m-%dT%H:%M:%SZ"))
        save_report(records)
        save_savepoint({
            "status": "completed",
            "baseUrl": base_url,
            "endpoints": endpoints,
            "tests_written": len(records),
            "completed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        })
        print(f"Wrote {len(records)} records to {REPORT_JSON_PATH}")


if __name__ == "__main__":
    main()
