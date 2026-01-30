import http from 'k6/http';
import { sleep } from 'k6';
import { Trend } from 'k6/metrics';

// 1. Define a custom metric
const mySearchTrend = new Trend('waiting_for_search_results');

export const options = {
  stages: [
    { duration: '5s', target: 5 },
    { duration: '10s', target: 5 },
    { duration: '5s',  target: 0 },
  ],
  thresholds: {
    // 2. Set a specific threshold for this custom metric
    'waiting_for_search_results': ['p(95)<250'],
  },
};

export default function () {

  // mimic login with crocodiles  
  const res = http.get('https://test-api.k6.io/public/crocodiles/');
  
  // checking actual search
  const res1 = http.get('https://www.google.com/search?q=croco');
  mySearchTrend.add(res1.timings.waiting);

  sleep(1);
}