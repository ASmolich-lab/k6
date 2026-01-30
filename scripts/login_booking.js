import http from 'k6/http';
import { check, sleep } from 'k6';
// Import the shared module
import { authenticate } from '../utils/auth.js';

// 1. CONFIGURATION
export const options = {
  stages: [
    { duration: '5s', target: 5 },
    { duration: '5s', target: 5 },
    { duration: '5s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], 
  },
};

// 2. ENV VARS
const USERNAME = __ENV.API_USER || 'admin';
const PASSWORD = __ENV.API_PASS || 'password123';
const BASE_URL = 'https://restful-booker.herokuapp.com';

// 3. SETUP (Lifecycle)
export function setup() {
  const token = authenticate(BASE_URL, USERNAME, PASSWORD);
  return { token: token };
}

// 4. VU CODE
export default function (data) {
  const token = data.token;

  // Business Logic: Create Booking
  const params = {
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': `token=${token}` 
    },
  };

  const payload = JSON.stringify({
    firstname: "Jim",
    lastname: "Brown",
    totalprice: 111,
    depositpaid: true,
    bookingdates: { checkin: "2026-01-01", checkout: "2026-01-05" },
    additionalneeds: "Breakfast"
  });

  const res = http.post(`${BASE_URL}/booking`, payload, params);

  check(res, {
    'create booking 200': (r) => r.status === 200,
  });

  sleep(1);
}