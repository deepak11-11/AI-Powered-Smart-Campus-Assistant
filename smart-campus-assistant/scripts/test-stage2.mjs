/**
 * test-stage2.mjs
 * End-to-end tests for Stage 2 authentication endpoints.
 * Run with: node scripts/test-stage2.mjs  (from smart-campus-assistant/)
 *
 * Tests:
 *  1.  Register a new user                      → 201, token + safe user
 *  2.  Register duplicate email                  → 409 conflict
 *  3.  Register with short password              → 422 validation error
 *  4.  Login with correct credentials            → 200, token
 *  5.  Login with wrong password                 → 401
 *  6.  Login with unknown email                  → 401
 *  7.  GET /me with valid token                  → 200, user (no password_hash)
 *  8.  GET /me with no token                     → 401
 *  9.  GET /me with malformed token              → 401
 * 10.  Health check still works                  → 200
 */

const BASE = 'http://localhost:4000';
const TEST_EMAIL = `stage2test_${Date.now()}@example.com`;
const TEST_PASS  = 'TestPass99!';

let passed = 0;
let failed = 0;
let token  = '';

async function req(method, path, body, authToken) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  return { status: res.status, data };
}

function assert(label, condition, got) {
  if (condition) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  ${label}`);
    console.error(`     Got: ${JSON.stringify(got)}`);
    failed++;
  }
}

console.log('\n═══════════════════════════════════════');
console.log('  Stage 2 — Authentication API Tests   ');
console.log('═══════════════════════════════════════\n');

// ── Test 1: Register new user ─────────────────────────────────────────────────
console.log('1. Register new user');
{
  const { status, data } = await req('POST', '/api/auth/register', {
    name: 'Test Student',
    email: TEST_EMAIL,
    password: TEST_PASS,
    branch: 'Computer Science',
    year: 2,
  });
  assert('Status 201', status === 201, status);
  assert('success: true', data.success === true, data);
  assert('token returned', typeof data.token === 'string' && data.token.length > 20, data.token);
  assert('user.id present', typeof data.user?.id === 'number', data.user);
  assert('user.email correct', data.user?.email === TEST_EMAIL, data.user?.email);
  assert('password_hash NOT in response', !data.user?.password_hash, data.user);
  token = data.token;
}

// ── Test 2: Duplicate email ───────────────────────────────────────────────────
console.log('\n2. Duplicate email → 409');
{
  const { status, data } = await req('POST', '/api/auth/register', {
    name: 'Duplicate',
    email: TEST_EMAIL,
    password: TEST_PASS,
    branch: 'IT',
    year: 1,
  });
  assert('Status 409', status === 409, status);
  assert('success: false', data.success === false, data);
}

// ── Test 3: Short password validation ────────────────────────────────────────
console.log('\n3. Short password → 422 validation error');
{
  const { status, data } = await req('POST', '/api/auth/register', {
    name: 'Val Test',
    email: `valtest_${Date.now()}@example.com`,
    password: 'ab',
    branch: 'IT',
    year: 1,
  });
  assert('Status 422', status === 422, status);
  assert('errors array present', Array.isArray(data.errors), data);
}

// ── Test 4: Login correct credentials ────────────────────────────────────────
console.log('\n4. Login with correct credentials → 200');
{
  const { status, data } = await req('POST', '/api/auth/login', {
    email: TEST_EMAIL,
    password: TEST_PASS,
  });
  assert('Status 200', status === 200, status);
  assert('success: true', data.success === true, data);
  assert('token returned', typeof data.token === 'string', data.token);
  assert('password_hash NOT in response', !data.user?.password_hash, data.user);
  token = data.token; // refresh token
}

// ── Test 5: Wrong password ────────────────────────────────────────────────────
console.log('\n5. Wrong password → 401');
{
  const { status, data } = await req('POST', '/api/auth/login', {
    email: TEST_EMAIL,
    password: 'wrongpassword',
  });
  assert('Status 401', status === 401, status);
  assert('success: false', data.success === false, data);
  // Must not reveal which field was wrong
  assert('generic error message', data.message?.includes('Invalid'), data.message);
}

// ── Test 6: Unknown email ─────────────────────────────────────────────────────
console.log('\n6. Unknown email → 401');
{
  const { status, data } = await req('POST', '/api/auth/login', {
    email: 'nobody@nowhere.com',
    password: TEST_PASS,
  });
  assert('Status 401', status === 401, status);
  assert('same generic message', data.message?.includes('Invalid'), data.message);
}

// ── Test 7: GET /me with valid token ─────────────────────────────────────────
console.log('\n7. GET /me with valid token → 200');
{
  const { status, data } = await req('GET', '/api/auth/me', null, token);
  assert('Status 200', status === 200, status);
  assert('success: true', data.success === true, data);
  assert('user.email matches', data.user?.email === TEST_EMAIL, data.user?.email);
  assert('password_hash NOT in response', !data.user?.password_hash, data.user);
}

// ── Test 8: GET /me with no token ─────────────────────────────────────────────
console.log('\n8. GET /me with no token → 401');
{
  const { status, data } = await req('GET', '/api/auth/me', null, null);
  assert('Status 401', status === 401, status);
  assert('success: false', data.success === false, data);
}

// ── Test 9: GET /me with bad token ────────────────────────────────────────────
console.log('\n9. GET /me with malformed token → 401');
{
  const { status, data } = await req('GET', '/api/auth/me', null, 'not.a.real.token');
  assert('Status 401', status === 401, status);
  assert('success: false', data.success === false, data);
}

// ── Test 10: Health check unaffected ─────────────────────────────────────────
console.log('\n10. Health check still works → 200');
{
  const { status, data } = await req('GET', '/api/health', null, null);
  assert('Status 200', status === 200, status);
  assert('database: connected', data.database === 'connected', data.database);
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════');
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log('═══════════════════════════════════════\n');
if (failed > 0) process.exit(1);
