import db from './database.js';

const API_BASE = 'http://localhost:5000/api';
const TEST_EMAIL = 'test.user@example.com';
const TEST_NAME = 'Adyar Test User';
const TEST_PASSWORD = 'password123';

async function runTests() {
  console.log('Clearing test user from database...');
  db.prepare('DELETE FROM users WHERE LOWER(email) = LOWER(?)').run(TEST_EMAIL);
  db.prepare('DELETE FROM otp_codes WHERE email = ?').run(TEST_EMAIL);
  console.log('Starting API Endpoint Verification Tests...\n');

  // Test 1: Check email for non-existent user
  console.log('Test 1: POST /api/check-email (non-existent)...');
  try {
    const res1 = await fetch(`${API_BASE}/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL })
    });
    const data1 = await res1.json();
    console.log('Result:', data1);
    if (data1.exists === false) {
      console.log('✅ PASS: Email check returned exists: false\n');
    } else {
      console.log('❌ FAIL: Expected exists: false\n');
    }
  } catch (err) {
    console.error('❌ FAIL: Request error:', err.message, '\n');
    return;
  }

  // Test 2: Send OTP
  console.log('Test 2: POST /api/send-otp...');
  try {
    const res2 = await fetch(`${API_BASE}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL })
    });
    const data2 = await res2.json();
    console.log('Result:', data2);
    if (data2.success === true) {
      console.log('✅ PASS: OTP send request succeeded\n');
    } else {
      console.log('❌ FAIL: Expected success: true\n');
    }
  } catch (err) {
    console.error('❌ FAIL: Request error:', err.message, '\n');
  }

  // Test 3: Register new user (simulate registering directly after frontend verification)
  console.log('Test 3: POST /api/register...');
  let token = '';
  try {
    const res3 = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: TEST_NAME, email: TEST_EMAIL, password: TEST_PASSWORD })
    });
    const data3 = await res3.json();
    console.log('Result:', data3.token ? '{ token: "..." }' : data3);
    if (data3.token) {
      token = data3.token;
      console.log('✅ PASS: User registered successfully, JWT token received\n');
    } else {
      console.log('❌ FAIL: Expected JWT token\n');
    }
  } catch (err) {
    console.error('❌ FAIL: Request error:', err.message, '\n');
  }

  // Test 4: Check email for newly created user (should exist now)
  console.log('Test 4: POST /api/check-email (existent)...');
  try {
    const res4 = await fetch(`${API_BASE}/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL })
    });
    const data4 = await res4.json();
    console.log('Result:', data4);
    if (data4.exists === true) {
      console.log('✅ PASS: Email check returned exists: true\n');
    } else {
      console.log('❌ FAIL: Expected exists: true\n');
    }
  } catch (err) {
    console.error('❌ FAIL: Request error:', err.message, '\n');
  }

  // Test 5: Verify Session using /api/me
  console.log('Test 5: GET /api/me...');
  try {
    const res5 = await fetch(`${API_BASE}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data5 = await res5.json();
    console.log('Result:', data5);
    if (data5.name === TEST_NAME && data5.email === TEST_EMAIL) {
      console.log('✅ PASS: Correct user details returned from token\n');
    } else {
      console.log('❌ FAIL: Expected user details mismatch\n');
    }
  } catch (err) {
    console.error('❌ FAIL: Request error:', err.message, '\n');
  }

  // Test 6: Login with password
  console.log('Test 6: POST /api/login...');
  try {
    const res6 = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
    });
    const data6 = await res6.json();
    console.log('Result:', data6.token ? '{ token: "..." }' : data6);
    if (data6.token) {
      console.log('✅ PASS: Logged in successfully, JWT token received\n');
    } else {
      console.log('❌ FAIL: Expected successful login token\n');
    }
  } catch (err) {
    console.error('❌ FAIL: Request error:', err.message, '\n');
  }

  console.log('All verification tests completed.');
}

// Wait 1 second before running to ensure server is listening if launched concurrently
setTimeout(runTests, 1000);
