import http from 'k6/http';
import { check, sleep } from 'k6';
import { authenticate } from '../utils/auth.js';
// Import the new generators
import { randomString, randomNumber, getRandomFutureDate } from '../utils/generators.js';

// 1. CONFIGURATION
export const options = {
  stages: [
    { duration: '3s', target: 1 },
    { duration: '3s', target: 2 },
    { duration: '3s', target: 1 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], 
  },
};

const USERNAME = __ENV.API_USER || 'admin';
const PASSWORD = __ENV.API_PASS || 'password123';
const BASE_URL = 'https://restful-booker.herokuapp.com';

// 2. SETUP (Run once)
export function setup() {
  const token = authenticate(BASE_URL, USERNAME, PASSWORD);
  return { token: token };
}

// 3. VU CODE (Run repeatedly)
export default function (data) {
  const token = data.token;

  const params = {
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cookie': `token=${token}` 
    },
  };

  // GENERATE DYNAMIC PAYLOAD
  // This runs every single iteration, creating unique data
  const checkinDate = getRandomFutureDate(randomNumber(1, 30));
  const checkoutDate = getRandomFutureDate(randomNumber(31, 60));

  const payload = JSON.stringify({
    firstname: `First_${randomString(5)}`, // e.g. "User_xY7z"
    lastname: `Last_${randomString(5)}`,   // e.g. "Test_aB9c"
    totalprice: randomNumber(100, 999),
    depositpaid: Math.random() < 0.5,      // Random boolean
    bookingdates: { 
      checkin: checkinDate, 
      checkout: checkoutDate 
    },
    additionalneeds: "Breakfast"
  });

  const res = http.post(`${BASE_URL}/booking`, payload, params);

  // Debug: If request fails, print the body to see the real error
  if (res.status !== 200) {
    console.error(`Request failed with status ${res.status}: ${res.body}`);
  }

  check(res, {
    'create booking 200': (r) => r.status === 200,
    // 1. ?. checks if the value exists
    // 2. .includes() checks the content
    // 3. ?? false returns failure if anything was null/undefined
    'verified name': (r) => r.json('booking.firstname')?.includes('First_') ?? false,
  });

  sleep(1);
}