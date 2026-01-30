import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    my_steady_10rps_test: {
      // 1. The Executor: "Open Model" logic
      executor: 'constant-arrival-rate',

      // 2. The Goal: 10 Iterations Per Second
      rate: 5,
      timeUnit: '1s', 

      // 3. Test Duration
      duration: '30s',

      // 4. Resource Management (Crucial!)
      // Start with 10 VUs. If response time gets bad, k6 is allowed
      // to spin up to 100 VUs to maintain the 10 RPS rate.
      preAllocatedVUs: 10,
      maxVUs: 100, 
    },
  },
  thresholds: {
     // Fail if we can't respond fast enough
    http_req_duration: ['p(95)<25'],
  },
};

export default function () {
  const res = http.get('https://test-api.k6.io/public/crocodiles/');
  
  check(res, { 'status is 200': (r) => r.status === 200 });
  
  // NOTE: No sleep() needed here! 
  // The executor controls the pacing, not the code.
}