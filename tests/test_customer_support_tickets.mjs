// Customer Support Tickets Automated Test Suite
// Asserts end-to-end functionality of customer support ticket creation, retrieval,
// Admin triage, priority management, and resolution tracking.

import assert from 'node:assert';

const FASTAPI_BASE = 'http://127.0.0.1:8000';

async function runSupportTests() {
  console.log('🚀 [SUPPORT TICKETS TEST] Starting Customer Support & Admin Triage verification...\n');

  const runId = Date.now().toString(36);
  const testEmail = `support_client_${runId}@daffodil-client.com`;
  const testPassword = 'Password123!';

  // Test 1: Register Customer Account
  console.log(`Test 1: Register Customer (${testEmail})`);
  const regRes = await fetch(`${FASTAPI_BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      displayName: `Support Client ${runId}`,
      organizationName: `Client Enterprise ${runId}`,
      role: 'client',
    }),
  });
  assert.strictEqual(regRes.status, 201);
  const regData = await regRes.json();
  const token = regData.token;
  const customerId = regData.user.id;
  console.log(`  ✅ Passed: Registered customer "${customerId}". Token received.\n`);

  // Test 2: Customer Files Technical Support Ticket
  console.log('Test 2: Customer Submits Technical Support Ticket (POST /api/v1/support/tickets)');
  const ticket1Payload = {
    category: 'technical',
    priority: 'high',
    subject: 'Database Connection Pool Latency',
    message: 'We noticed connection wait times exceeding 800ms during concurrent traffic tests.',
  };
  const t1Res = await fetch(`${FASTAPI_BASE}/api/v1/support/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(ticket1Payload),
  });
  assert.strictEqual(t1Res.status, 201, 'Create ticket should return 201');
  const ticket1 = await t1Res.json();
  assert(ticket1.id, 'Ticket 1 ID must exist');
  assert.strictEqual(ticket1.category, 'technical');
  assert.strictEqual(ticket1.priority, 'high');
  assert.strictEqual(ticket1.status, 'open');
  assert.strictEqual(ticket1.subject, ticket1Payload.subject);
  console.log(`  ✅ Passed: Technical ticket created with ID="${ticket1.id}".\n`);

  // Test 3: Customer Files Billing Assistance Ticket
  console.log('Test 3: Customer Submits Billing Support Ticket (POST /api/v1/support/tickets)');
  const ticket2Payload = {
    category: 'billing',
    priority: 'normal',
    subject: 'Corporate VAT Invoice Request',
    message: 'Please provide official VAT challan (Mushak 6.3) for 15,000 credit package.',
  };
  const t2Res = await fetch(`${FASTAPI_BASE}/api/v1/support/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(ticket2Payload),
  });
  assert.strictEqual(t2Res.status, 201);
  const ticket2 = await t2Res.json();
  assert(ticket2.id, 'Ticket 2 ID must exist');
  assert.strictEqual(ticket2.category, 'billing');
  assert.strictEqual(ticket2.status, 'open');
  console.log(`  ✅ Passed: Billing ticket created with ID="${ticket2.id}".\n`);

  // Test 4: Customer Lists My Support Tickets
  console.log('Test 4: Customer Retrieves My Support Tickets (GET /api/v1/support/tickets/my)');
  const myRes = await fetch(`${FASTAPI_BASE}/api/v1/support/tickets/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(myRes.status, 200);
  const myTickets = await myRes.json();
  assert(Array.isArray(myTickets), 'Must return array of tickets');
  assert.strictEqual(myTickets.length, 2, 'Customer must have exactly 2 tickets');
  const ticketIds = myTickets.map((t) => t.id);
  assert(ticketIds.includes(ticket1.id));
  assert(ticketIds.includes(ticket2.id));
  console.log(`  ✅ Passed: Customer retrieved 2 open support tickets.\n`);

  // Test 5: Admin Lists All Support Tickets
  console.log('Test 5: Admin Queries All Support Tickets (GET /api/v1/admin/support/tickets)');
  const adminListRes = await fetch(`${FASTAPI_BASE}/api/v1/admin/support/tickets`);
  assert.strictEqual(adminListRes.status, 200);
  const allTickets = await adminListRes.json();
  assert(Array.isArray(allTickets));
  const foundT1 = allTickets.find((t) => t.id === ticket1.id);
  assert(foundT1, 'Admin must see Ticket 1');
  assert.strictEqual(foundT1.customerEmail, testEmail, 'Customer email must be populated');
  console.log(`  ✅ Passed: Admin queue query successful. Found ticket "${ticket1.id}" linked to "${testEmail}".\n`);

  // Test 6: Admin Triage & Responds to Technical Ticket
  console.log(`Test 6: Admin Triages Ticket 1 (PATCH /api/v1/admin/support/tickets/${ticket1.id})`);
  const adminPatch1 = await fetch(`${FASTAPI_BASE}/api/v1/admin/support/tickets/${ticket1.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'in_progress',
      adminResponse: 'Tech team is increasing PgBouncer connection limits to 250 connections.',
    }),
  });
  assert.strictEqual(adminPatch1.status, 200);
  const patchedT1 = await adminPatch1.json();
  assert.strictEqual(patchedT1.status, 'in_progress');
  assert(patchedT1.adminResponse.includes('PgBouncer'));
  console.log('  ✅ Passed: Admin updated Ticket 1 status to "in_progress" with technical response.\n');

  // Test 7: Admin Resolves Billing Ticket
  console.log(`Test 7: Admin Resolves Ticket 2 (PATCH /api/v1/admin/support/tickets/${ticket2.id})`);
  const adminPatch2 = await fetch(`${FASTAPI_BASE}/api/v1/admin/support/tickets/${ticket2.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'resolved',
      adminResponse: 'Mushak 6.3 VAT invoice #VAT-2026-8812 has been sent to your email.',
    }),
  });
  assert.strictEqual(adminPatch2.status, 200);
  const patchedT2 = await adminPatch2.json();
  assert.strictEqual(patchedT2.status, 'resolved');
  assert(patchedT2.resolvedAt, 'resolvedAt timestamp must be recorded');
  console.log(`  ✅ Passed: Admin marked Ticket 2 as "resolved" with timestamp "${patchedT2.resolvedAt}".\n`);

  // Test 8: Customer Verifies Updated Resolution State
  console.log('Test 8: Customer Checks Resolved Ticket State');
  const verifyRes = await fetch(`${FASTAPI_BASE}/api/v1/support/tickets/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(verifyRes.status, 200);
  const verifiedList = await verifyRes.json();
  const vT1 = verifiedList.find((t) => t.id === ticket1.id);
  const vT2 = verifiedList.find((t) => t.id === ticket2.id);
  assert.strictEqual(vT1.status, 'in_progress');
  assert.strictEqual(vT2.status, 'resolved');
  assert(vT2.adminResponse.includes('Mushak 6.3'));
  console.log(`  ✅ Passed: Customer workspace shows updated status: Ticket 1 is "in_progress", Ticket 2 is "resolved".\n`);

  console.log('🎉 [SUPPORT TICKETS ALL PASSED] 8/8 automated test assertions succeeded without error!\n');
}

runSupportTests().catch((err) => {
  console.error('❌ Support Tickets test failed:', err);
  process.exit(1);
});
