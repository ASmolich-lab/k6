# k6 Performance Test Suite

This repository contains k6 performance tests covering different load models (Open vs. Closed) and functional patterns (Authentication/Token passing).

## Prerequisites

- [k6](https://k6.io/docs/get-started/installation/) (v0.45.0+)

## Script Inventory

### 1. `constant_arrival_rate.js` (Open Model)

**Purpose:** Tests system throughput stability under a constant arrival rate, regardless of system response time.

- **Executor:** `constant-arrival-rate`
- **Target:** 5 Iterations/sec (RPS) for 30s.
- **Key Logic:** Pre-allocates VUs to ensure the arrival rate is met even if latency increases.

### 2. `login_booking.js` (Auth & Flow)

**Purpose:** Simulates a user session requiring authentication.

- **Pattern:** `setup()` lifecycle hook handles login and passes the JWT token to VUs.
- **Config:**
  - `API_USER`: Defaults to 'admin'
  - `API_PASS`: Defaults to 'password123'
- **Threshold:** 95th percentile < 500ms.

### 3. `script.js` (Custom Metrics)

**Purpose:** Demonstrates custom metric collection.

- **Metric:** `waiting_for_search_results` (Trend) — tracks time-to-first-byte (TTFB) specifically for the search query.
- **Note:** Hits public endpoints (Google); meant for demonstration of custom metrics, not production load testing.

## Local Execution

Run specific suites:

```bash
# Run the Auth flow with credentials
k6 run -e API_USER=admin -e API_PASS=password123 login_booking.js

# Run the Constant Arrival scenario
k6 run constant_arrival_rate.js
```
