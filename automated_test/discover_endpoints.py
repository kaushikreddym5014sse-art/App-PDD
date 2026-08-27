import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.append(str(ROOT))

from dast_common import build_endpoints, save_savepoint  # noqa: E402


def main() -> None:
    endpoints = build_endpoints()
    print("Discovered endpoints:")
    for ep in endpoints:
        print(f"- {ep['method']} {ep['path']} [{', '.join(ep['expected_roles'])}]")
    print(f"Total discovered endpoints: {len(endpoints)}")
    save_savepoint({"status": "discovered", "endpoints": endpoints})


if __name__ == "__main__":
    main()
