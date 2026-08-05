import time
import json
import threading
import urllib.request
import urllib.error

BASE_URL = "http://localhost:4000"

def get_auth_token():
    email = f"loadtest_{int(time.time())}@blockcertify.org"
    payload = json.dumps({
        "full_name": "LoadTester",
        "email": email,
        "password": "Password123!",
        "role": "user"
    }).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/api/auth/register", data=payload, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode('utf-8'))
            return data.get("token", "")
    except:
        return ""

def run_user_worker(duration_sec, token, results):
    start_time = time.time()
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f"Bearer {token}"

    endpoints = [
        ("GET", "/api/certificates", None),
        ("POST", "/api/certificates/verify/hash", {"hash": "0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a"}),
    ]

    idx = 0
    while time.time() - start_time < duration_sec:
        method, path, body = endpoints[idx % len(endpoints)]
        idx += 1
        url = f"{BASE_URL}{path}"
        data_bytes = json.dumps(body).encode('utf-8') if body else None
        
        req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
        req_start = time.time()
        try:
            with urllib.request.urlopen(req) as res:
                ms = (time.time() - req_start) * 1000
                results.append((res.status, ms))
        except urllib.error.HTTPError as e:
            ms = (time.time() - req_start) * 1000
            results.append((e.code, ms))
        except Exception:
            ms = (time.time() - req_start) * 1000
            results.append((0, ms))
        time.sleep(0.01)

def run_load_test():
    token = get_auth_token()
    num_users = 100
    duration = 60 # 1 minute
    threads = []
    results = []

    print(f"🚀 Starting Load Test: {num_users} virtual users for {duration} seconds...")
    start_bench = time.time()

    for i in range(num_users):
        t = threading.Thread(target=run_user_worker, args=(duration, token, results))
        threads.append(t)
        t.start()

    for t in threads:
        t.join()

    total_time = time.time() - start_bench
    total_requests = len(results)
    rps = round(total_requests / total_time, 2)
    response_times = [r[1] for r in results if r[1] > 0]
    avg_ms = round(sum(response_times) / len(response_times), 2) if response_times else 0
    min_ms = round(min(response_times), 2) if response_times else 0
    max_ms = round(max(response_times), 2) if response_times else 0

    metrics = {
        "virtual_users": num_users,
        "duration_sec": duration,
        "total_requests": total_requests,
        "requests_per_sec": rps,
        "avg_response_time_ms": avg_ms,
        "min_response_time_ms": min_ms,
        "max_response_time_ms": max_ms
    }

    with open("automated_test/load_test_results.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"✅ Load Test Completed! RPS: {rps}, Avg Response Time: {avg_ms}ms (Min: {min_ms}ms, Max: {max_ms}ms)")
    return metrics

if __name__ == "__main__":
    run_load_test()
