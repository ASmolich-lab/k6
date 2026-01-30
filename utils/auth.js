import http from 'k6/http';
import { check, fail } from 'k6';

/**
 * Authenticates a user and returns the auth token.
 * Fails the iteration immediately if login fails.
 */
export function authenticate(baseUrl, username, password) {
  const payload = JSON.stringify({
    username: username,
    password: password,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(`${baseUrl}/auth`, payload, params);

  // We perform the check inside the module so the calling script 
  // doesn't have to worry about validation logic.
  const isSuccessful = check(res, {
    'auth: login successful': (r) => r.status === 200,
    'auth: has token': (r) => r.json('token') !== undefined,
  });

  if (!isSuccessful) {
    console.error(`Login failed for user: ${username}`);
    // "fail" stops the execution of the current VU immediately 
    // to prevent cascading errors in the main test logic.
    fail('Login failed'); 
  }

  return res.json('token');
}