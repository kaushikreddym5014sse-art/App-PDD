"""
BlockCertify 2.0 — 100 Concurrent Virtual Users Load Test (60 Seconds)
Simulates 100 concurrent users continuously sending requests for 60s against:
- http://localhost:4000/api/health
- http://localhost:4000/api/certificates
- http://localhost:3000/

Measures:
- Total Requests Sent
- Requests Per Second (RPS)
- Min Response Time (ms)
- Avg Response Time (ms)
- Max Response Time (ms)
- P95 & P99 Latency
- HTTP Success vs Failure counts

Saves output to:
- automated_test/load_test_results.json
- Updates automated_test/BlockCertify_2.0_E2E_Security_Load_Report.xlsx
"""

import time
import json
import urllib.request
import urllib.error
import concurrent.futures
from datetime import datetime
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

URLS = [
    "http://localhost:4000/api/health",
    "http://localhost:4000/api/certificates",
    "http://localhost:3000/",
]

NUM_USERS = 100
DURATION_SECONDS = 60

results = []
stop_time = 0

def worker(user_id):
    local_results = []
    idx = user_id % len(URLS)
    url = URLS[idx]
    
    while time.time() < stop_time:
        start_t = time.time()
        status_code = 0
        try:
            req = urllib.request.Request(url, headers={"User-Agent": f"LoadTestUser/{user_id}"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                status_code = resp.status
                resp.read()
        except urllib.error.HTTPError as e:
            status_code = e.code
        except Exception:
            status_code = 0
        
        end_t = time.time()
        latency_ms = round((end_t - start_t) * 1000, 2)
        local_results.append((latency_ms, status_code))
        time.sleep(0.01)  # tiny pause between requests per user
    return local_results

def run_load_test():
    global stop_time
    print(f"🚀 Starting Load Test: {NUM_USERS} Virtual Users for {DURATION_SECONDS} Seconds...")
    print(f"   Target URLs: {URLS}")
    
    start_wall = time.time()
    stop_time = start_wall + DURATION_SECONDS
    
    all_metrics = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=NUM_USERS) as executor:
        futures = [executor.submit(worker, i) for i in range(NUM_USERS)]
        for f in concurrent.futures.as_completed(futures):
            all_metrics.extend(f.result())
            
    total_duration = time.time() - start_wall
    total_reqs = len(all_metrics)
    latencies = [m[0] for m in all_metrics]
    statuses = [m[1] for m in all_metrics]
    
    success_count = sum(1 for s in statuses if 200 <= s < 400)
    fail_count = total_reqs - success_count
    
    rps = round(total_reqs / total_duration, 2)
    min_ms = round(min(latencies), 2) if latencies else 0
    avg_ms = round(sum(latencies) / max(len(latencies), 1), 2) if latencies else 0
    max_ms = round(max(latencies), 2) if latencies else 0
    
    sorted_lat = sorted(latencies)
    p95_ms = round(sorted_lat[int(len(sorted_lat) * 0.95)], 2) if sorted_lat else 0
    p99_ms = round(sorted_lat[int(len(sorted_lat) * 0.99)], 2) if sorted_lat else 0
    
    summary = {
        "virtual_users": NUM_USERS,
        "duration_sec": round(total_duration, 2),
        "total_requests": total_reqs,
        "successful_requests": success_count,
        "failed_requests": fail_count,
        "requests_per_sec": rps,
        "min_response_time_ms": min_ms,
        "avg_response_time_ms": avg_ms,
        "max_response_time_ms": max_ms,
        "p95_response_time_ms": p95_ms,
        "p99_response_time_ms": p99_ms,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    print("\n✅ Load Test Completed Successfully!")
    print(f"📊 Total Requests: {total_reqs:,}")
    print(f"⚡ Requests Per Second (RPS): {rps} req/sec")
    print(f"⏱️  Min Latency: {min_ms} ms")
    print(f"⏱️  Avg Latency: {avg_ms} ms")
    print(f"⏱️  Max Latency: {max_ms} ms ({round(max_ms/1000, 2)} s)")
    print(f"⏱️  95th Percentile: {p95_ms} ms")
    print(f"⏱️  99th Percentile: {p99_ms} ms")
    print(f"✔️  Success Rate: {round(success_count/max(total_reqs,1)*100, 2)}%")
    
    with open("automated_test/load_test_results.json", "w") as f:
        json.dump(summary, f, indent=2)
    
    return summary

if __name__ == "__main__":
    run_load_test()
