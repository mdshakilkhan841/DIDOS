// Phase 2 Automated Test Suite: Deployment Request Persistence & Live Admin Queue
// Asserts end-to-end functionality of customer deployment tickets and admin management.

import assert from 'node:assert';

const FASTAPI_BASE = 'http://127.0.0.1:8000';

async function runTests() {
  console.log('🚀 [PHASE 2 TEST] Starting Deployment Request & Admin Queue verification...\n');

  // Test 1: Fetch Admin Deployments Initial Queue
  console.log('Test 1: Admin Deployment Queue Probe (GET /api/v1/admin/deployments)');
  const res1 = await fetch(`${FASTAPI_BASE}/api/v1/admin/deployments`);
  assert.strictEqual(res1.status, 200, 'Admin deployments query should return 200');
  const data1 = await res1.json();
  assert(Array.isArray(data1.tickets), 'Must return tickets array');
  console.log(`  ✅ Passed: Admin queue query successful. Current total tickets: ${data1.total}.\n`);

  // Test 2: Customer Submits Deployment Assistance Ticket
  console.log('Test 2: Customer Submits Deployment Ticket (POST /api/v1/deployments/request)');
  const uniqueDomain = `portal-${Date.now().toString(36)}.daffodil-client.com`;
  const submitPayload = {
    projectId: 'cproj_phase2_' + Date.now().toString(36),
    projectTitle: 'Enterprise Accounting Portal',
    domainName: uniqueDomain,
    dnsProvider: 'Cloudflare',
    hostingTarget: 'Daffodil Cloud Linux VPS',
    specialInstructions: 'Please configure SSL certificate with Cloudflare Proxy.',
  };

  const res2 = await fetch(`${FASTAPI_BASE}/api/v1/deployments/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submitPayload),
  });
  assert.strictEqual(res2.status, 201, 'Submit deployment ticket should return 201 Created');
  const ticket = await res2.json();
  assert(ticket.id, 'Ticket ID must exist');
  assert.strictEqual(ticket.domainName, uniqueDomain);
  assert.strictEqual(ticket.status, 'pending_tech_review', 'Initial status must be pending_tech_review');
  assert.strictEqual(ticket.dnsStatus, 'pending', 'Initial DNS status must be pending');
  assert.strictEqual(ticket.assignedIp, '103.145.118.42', 'Default assigned IP must be 103.145.118.42');
  console.log(`  ✅ Passed: Ticket created with ID="${ticket.id}" for domain="${ticket.domainName}".\n`);

  // Test 3: Verify Ticket Appears in Admin Queue
  console.log('Test 3: Verify Ticket is in Admin Queue (GET /api/v1/admin/deployments)');
  const res3 = await fetch(`${FASTAPI_BASE}/api/v1/admin/deployments`);
  assert.strictEqual(res3.status, 200);
  const data3 = await res3.json();
  const foundTicket = data3.tickets.find((t) => t.id === ticket.id);
  assert(foundTicket, 'Created ticket must appear in admin queue');
  assert.strictEqual(foundTicket.domainName, uniqueDomain);
  console.log(`  ✅ Passed: Ticket confirmed in PostgreSQL admin queue with domain="${foundTicket.domainName}".\n`);

  // Test 4: Admin Verifies DNS Records
  console.log(`Test 4: Admin Verifies DNS Records (PATCH /api/v1/admin/deployments/${ticket.id})`);
  const res4 = await fetch(`${FASTAPI_BASE}/api/v1/admin/deployments/${ticket.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dnsStatus: 'verified' }),
  });
  assert.strictEqual(res4.status, 200);
  const data4 = await res4.json();
  assert.strictEqual(data4.ticket.dnsStatus, 'verified', 'DNS status must be updated to verified');
  console.log('  ✅ Passed: Admin verified DNS records successfully.\n');

  // Test 5: Admin Assigns Custom Target VPS IP
  console.log(`Test 5: Admin Assigns Custom Target VPS IP (PATCH /api/v1/admin/deployments/${ticket.id})`);
  const customIp = '103.145.118.88';
  const res5 = await fetch(`${FASTAPI_BASE}/api/v1/admin/deployments/${ticket.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignedIp: customIp }),
  });
  assert.strictEqual(res5.status, 200);
  const data5 = await res5.json();
  assert.strictEqual(data5.ticket.assignedIp, customIp, 'Assigned IP must be updated');
  console.log(`  ✅ Passed: Target VPS IP updated to "${data5.ticket.assignedIp}".\n`);

  // Test 6: Admin Marks Ticket Live in Production
  console.log(`Test 6: Admin Marks Ticket Live (PATCH /api/v1/admin/deployments/${ticket.id})`);
  const liveUrl = `https://${uniqueDomain}`;
  const res6 = await fetch(`${FASTAPI_BASE}/api/v1/admin/deployments/${ticket.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'live',
      liveUrl: liveUrl,
    }),
  });
  assert.strictEqual(res6.status, 200);
  const data6 = await res6.json();
  assert.strictEqual(data6.ticket.status, 'live', 'Status must be updated to live');
  assert.strictEqual(data6.ticket.dnsStatus, 'verified');
  assert.strictEqual(data6.ticket.liveUrl, liveUrl);
  assert(data6.ticket.deployedAt, 'deployedAt timestamp must be recorded');
  console.log(`  ✅ Passed: Ticket marked live with liveUrl="${data6.ticket.liveUrl}" and deployedAt="${data6.ticket.deployedAt}".\n`);

  // Test 7: Final Query Check from PostgreSQL
  console.log('Test 7: Final Verification of Live State in PostgreSQL');
  const res7 = await fetch(`${FASTAPI_BASE}/api/v1/admin/deployments`);
  const data7 = await res7.json();
  const liveTicket = data7.tickets.find((t) => t.id === ticket.id);
  assert.strictEqual(liveTicket.status, 'live');
  assert.strictEqual(liveTicket.assignedIp, customIp);
  assert.strictEqual(liveTicket.liveUrl, liveUrl);
  console.log('  ✅ Passed: PostgreSQL database accurately reflects live production ticket.\n');

  console.log('🎉 ALL 7 TESTS PASSED! Phase 2 (Deployment Request Persistence & Admin Queue) is 100% verified.');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
