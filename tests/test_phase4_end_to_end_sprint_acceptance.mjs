// Phase 4 Automated Test Suite: Complete Sprint 1 End-to-End Acceptance Test
// Validates the entire customer journey from registration to live deployed site:
// Register -> Onboarding Order -> Project Creation -> 1,000 Credit AI Build Handoff -> Deployment Ticket -> Admin Verification -> Live Production

import assert from 'node:assert';

const FASTAPI_BASE = 'http://127.0.0.1:8000';
const NEXTJS_BASE = 'http://localhost:3000';

async function runSprint1EndToEnd() {
  console.log('🚀 [PHASE 4 E2E TEST] Starting Full Sprint 1 Acceptance Verification...\n');

  const runTag = Date.now().toString(36);
  const clientEmail = `enterprise_${runTag}@daffodil-holdings.com`;
  const clientPass = 'DaffodilPass2026!';
  const orgName = `Daffodil Retail Group ${runTag}`;
  const customDomain = `retail-${runTag}.daffodil.family`;

  // STEP 1: Registration & Welcome Credits
  console.log(`Step 1: Customer Account Creation & 1,000 Credit Grant (${clientEmail})`);
  const regRes = await fetch(`${FASTAPI_BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: clientEmail,
      password: clientPass,
      displayName: 'Corporate Lead',
      organizationName: orgName,
      role: 'client',
    }),
  });
  assert.strictEqual(regRes.status, 201, 'Customer registration should return 201');
  const regData = await regRes.json();
  const token = regData.token;
  const customerId = regData.user.id;
  assert.strictEqual(regData.user.credits, 1000, 'Customer must start with 1,000 credits');
  console.log(`  ✅ Passed: Account created (ID: ${customerId}) with 1,000 balance.\n`);

  // STEP 2: Submit Customer Requirements & Onboarding Draft
  console.log('Step 2: Collect & Persist Customer Requirements (Intake Draft)');
  const draftPayload = {
    userId: customerId,
    email: clientEmail,
    organizationName: orgName,
    businessDomain: 'Omnichannel eCommerce',
    contactPerson: 'Corporate Lead',
    phone: '+8801700000000',
    referenceSiteUrl: 'https://daffodil.family',
    projectScope: 'Nationwide retail delivery platform with automated warehouse routing and POS sync.',
    techStack: 'Next.js 16 + FastAPI + PostgreSQL',
    budgetExpectation: '$15,000 - $30,000',
    expectedTimeline: '6 Weeks',
    payload: {
      modules: ['Warehouse Sync', 'POS Integration', 'bKash/Nagad Checkout', 'Delivery Rider App'],
      compliance: 'PCI-DSS, Bangladesh Bank Fintech Guidelines',
    },
  };
  const draftRes = await fetch(`${FASTAPI_BASE}/api/v1/onboarding/draft`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(draftPayload),
  });
  assert.strictEqual(draftRes.status, 200);
  const draftData = await draftRes.json();
  assert.strictEqual(draftData.success, true);
  console.log(`  ✅ Passed: Customer intake requirements captured in PostgreSQL (Draft ID: ${draftData.draftId}).\n`);

  // STEP 3: Convert Approved Draft to Official Tracking Project
  console.log('Step 3: Convert Approved Draft into Official Project');
  const projectPayload = {
    name: 'Omnichannel Retail Hub',
    domain: 'eCommerce & Retail',
    scopeSummary: draftPayload.projectScope,
    specs: {
      stack: draftPayload.techStack,
      timeline: draftPayload.expectedTimeline,
      budget: draftPayload.budgetExpectation,
    },
    qaAnswers: {
      multiTenant: 'yes',
      paymentMethods: 'bKash, Nagad, Visa, Mastercard',
      userVolume: '100,000 daily active users',
    },
    srsDocument: `# System Requirements Specification\n\n## Project: Omnichannel Retail Hub\n- Client: ${orgName}\n- Scope: ${draftPayload.projectScope}`,
  };
  const projRes = await fetch(`${FASTAPI_BASE}/api/v1/projects/from-draft`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(projectPayload),
  });
  assert.strictEqual(projRes.status, 201);
  const project = await projRes.json();
  const projectId = project.id;
  assert(projectId, 'Project ID must be generated');
  console.log(`  ✅ Passed: Project created in PostgreSQL (ID: ${projectId}, Slug: ${project.slug}).\n`);

  // STEP 4: Deduct 1,000 Credits & Courier Specification Payload to DevScope
  console.log('Step 4: Credit Deduction & DevScope Builder Dispatch');
  const deductRes = await fetch(`${FASTAPI_BASE}/api/v1/credits/deduct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount: 1000,
      reason: `AI Builder Launch for Project ${projectId}`,
    }),
  });
  assert.strictEqual(deductRes.status, 200);
  const deductData = await deductRes.json();
  assert.strictEqual(deductData.remainingCredits, 0);

  // Dispatch via Next.js Server Bridge (Couriers to DevScope)
  const devscopeBridgeRes = await fetch(`${NEXTJS_BASE}/api/devscope`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: projectId,
      name: project.name,
      requirements: project.scopeSummary,
      srs: project.srsDocument,
      tech_stack: 'Next.js 16 + FastAPI',
      database: 'PostgreSQL',
      pages: ['Home', 'Catalog', 'Order Status', 'Rider Dashboard'],
      features: ['Auth', 'Cart', 'Payment'],
      idempotency_key: `e2e_idemp_${runTag}`,
    }),
  });
  assert.strictEqual(devscopeBridgeRes.status, 200);
  const bridgeData = await devscopeBridgeRes.json();
  const buildId = bridgeData.result?.build_id;
  assert(buildId, 'DevScope must return build_id');
  console.log(`  ✅ Passed: 1,000 credits deducted, DevScope build queued (Build ID: ${buildId}).\n`);

  // STEP 5: Customer Submits Managed Deployment Request
  console.log(`Step 5: Customer Requests Deployment Assistance (${customDomain})`);
  const deployReqRes = await fetch(`${FASTAPI_BASE}/api/v1/deployments/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      projectId: projectId,
      projectTitle: project.name,
      domainName: customDomain,
      dnsProvider: 'Cloudflare',
      hostingTarget: 'Daffodil Cloud Linux VPS',
      specialInstructions: 'Setup Let\'s Encrypt SSL and auto-renew cron.',
    }),
  });
  assert.strictEqual(deployReqRes.status, 201);
  const deployTicket = await deployReqRes.json();
  const ticketId = deployTicket.id;
  assert.strictEqual(deployTicket.status, 'pending_tech_review');
  console.log(`  ✅ Passed: Deployment ticket filed in PostgreSQL (Ticket ID: ${ticketId}).\n`);

  // STEP 6: Admin Ops Triage, DNS Validation & Production Go-Live
  console.log('Step 6: Admin Operations Triage & Production Release');
  // Admin verifies DNS
  const patchDnsRes = await fetch(`${FASTAPI_BASE}/api/v1/admin/deployments/${ticketId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dnsStatus: 'verified' }),
  });
  assert.strictEqual(patchDnsRes.status, 200);

  // Admin marks site Live
  const liveUrl = `https://${customDomain}`;
  const patchLiveRes = await fetch(`${FASTAPI_BASE}/api/v1/admin/deployments/${ticketId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'live',
      liveUrl: liveUrl,
      assignedIp: '103.145.118.42',
    }),
  });
  assert.strictEqual(patchLiveRes.status, 200);
  const patchedLive = await patchLiveRes.json();
  assert.strictEqual(patchedLive.ticket.status, 'live');
  assert.strictEqual(patchedLive.ticket.liveUrl, liveUrl);
  console.log(`  ✅ Passed: Admin verified DNS and marked site LIVE at ${liveUrl}.\n`);

  // STEP 7: Customer Final Verification
  console.log('Step 7: Customer Workspace Final Status Verification');
  const myDeploymentsRes = await fetch(`${FASTAPI_BASE}/api/v1/deployments/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(myDeploymentsRes.status, 200);
  const myTickets = await myDeploymentsRes.json();
  const activeTicket = myTickets.find((t) => t.id === ticketId);
  assert(activeTicket, 'Customer should see their active deployment ticket');
  assert.strictEqual(activeTicket.status, 'live');
  assert.strictEqual(activeTicket.liveUrl, liveUrl);
  assert.strictEqual(activeTicket.assignedIp, '103.145.118.42');
  console.log(`  ✅ Passed: Customer workspace shows active LIVE site with DNS verified and VPS assigned.\n`);

  console.log('========================================================================');
  console.log('🏆 [SPRINT 1 FULL E2E ACCEPTANCE PASSED]');
  console.log(`- Customer ID:       ${customerId}`);
  console.log(`- Project ID:        ${projectId}`);
  console.log(`- DevScope Build ID: ${buildId}`);
  console.log(`- Deployment Ticket: ${ticketId}`);
  console.log(`- Live Production:   ${liveUrl} (VPS: 103.145.118.42)`);
  console.log('========================================================================\n');
}

runSprint1EndToEnd().catch((err) => {
  console.error('❌ Sprint 1 E2E Acceptance Failed:', err);
  process.exit(1);
});
