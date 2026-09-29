// Phase 3 Automated Test Suite: Multi-Project Switcher & Onboarding Order Wiring
// Asserts end-to-end functionality of customer intake drafting, project creation,
// multi-project workspace enumeration, and credit accounting.

import assert from 'node:assert';

const FASTAPI_BASE = 'http://127.0.0.1:8000';

async function runTests() {
  console.log('🚀 [PHASE 3 TEST] Starting Multi-Project & Onboarding Orders verification...\n');

  const runId = Date.now().toString(36);
  const testEmail = `client_${runId}@daffodil-test.com`;
  const testPassword = 'Password123!';

  // Test 1: Customer Registration & Initial Credit Grant
  console.log(`Test 1: Customer Registration (POST /api/v1/auth/register) -> ${testEmail}`);
  const regRes = await fetch(`${FASTAPI_BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      displayName: `Enterprise Client ${runId}`,
      organizationName: `Daffodil Corp ${runId}`,
      role: 'client',
    }),
  });
  assert.strictEqual(regRes.status, 201, 'Registration should return 201 Created');
  const regData = await regRes.json();
  assert(regData.success, 'Registration success flag must be true');
  assert(regData.token, 'Registration must return JWT token');
  assert.strictEqual(regData.user.credits, 0, 'New user must start with 0 credits (no free credits)');
  const authToken = regData.token;
  const userId = regData.user.id;
  console.log(`  ✅ Passed: Registered customer "${userId}" with 0 credits (no free credits policy). Token received.\n`);

  // Test 2: Persist Intake Draft (POST /api/v1/onboarding/draft)
  console.log('Test 2: Persist Onboarding Intake Draft (POST /api/v1/onboarding/draft)');
  const intakePayload = {
    userId: userId,
    email: testEmail,
    organizationName: `Daffodil Corp ${runId}`,
    businessDomain: 'Fintech & Microcredit',
    contactPerson: 'Shakil Testing Lead',
    projectScope: 'Automated Loan Disbursement Engine with biometric KYC and credit score computation.',
    techStack: 'Next.js 16 + FastAPI + PostgreSQL',
    budgetExpectation: '$10,000 - $25,000',
    expectedTimeline: '6 to 8 Weeks',
    payload: {
      modules: ['KYC Biometrics', 'Loan Underwriting', 'Payment Gateway (bKash/Nagad)'],
      sla: '99.99%',
    },
  };
  const draftRes = await fetch(`${FASTAPI_BASE}/api/v1/onboarding/draft`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(intakePayload),
  });
  assert.strictEqual(draftRes.status, 200, 'Draft persist should return 200');
  const draftData = await draftRes.json();
  assert.strictEqual(draftData.success, true);
  assert(draftData.draftId, 'Draft ID must exist');
  console.log(`  ✅ Passed: Onboarding intake draft persisted with draftId="${draftData.draftId}".\n`);

  // Test 3: Retrieve Latest Intake Draft (GET /api/v1/onboarding/draft)
  console.log('Test 3: Retrieve Latest Intake Draft (GET /api/v1/onboarding/draft)');
  const getDraftRes = await fetch(`${FASTAPI_BASE}/api/v1/onboarding/draft`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  assert.strictEqual(getDraftRes.status, 200);
  const fetchedDraft = await getDraftRes.json();
  assert(fetchedDraft, 'Should return draft object');
  assert.strictEqual(fetchedDraft.businessDomain, 'Fintech & Microcredit');
  assert.strictEqual(fetchedDraft.organizationName, `Daffodil Corp ${runId}`);
  console.log(`  ✅ Passed: Verified draft retrieval with businessDomain="${fetchedDraft.businessDomain}".\n`);

  // Test 4: Save & Retrieve Active Workspace Draft (POST & GET /api/v1/onboarding/active-draft)
  console.log('Test 4: Save & Retrieve Active Workspace Draft');
  const activeDraftBody = {
    draft: {
      title: 'Active Fintech Draft',
      domain: 'Fintech & Microcredit',
      stage: 'architecture_review',
    },
  };
  const saveActiveRes = await fetch(`${FASTAPI_BASE}/api/v1/onboarding/active-draft`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(activeDraftBody),
  });
  assert.strictEqual(saveActiveRes.status, 200);
  const saveActiveData = await saveActiveRes.json();
  assert.strictEqual(saveActiveData.success, true);

  const getActiveRes = await fetch(`${FASTAPI_BASE}/api/v1/onboarding/active-draft`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  assert.strictEqual(getActiveRes.status, 200);
  const activeData = await getActiveRes.json();
  assert.strictEqual(activeData.title, 'Active Fintech Draft');
  console.log('  ✅ Passed: Active workspace draft saved and retrieved.\n');

  // Test 5: Create Project 1 from Draft (POST /api/v1/projects/from-draft)
  console.log('Test 5: Create Project 1 from Draft (POST /api/v1/projects/from-draft)');
  const proj1Payload = {
    name: 'Fintech Loan Engine',
    domain: 'Fintech',
    scopeSummary: 'Automated Loan Disbursement Engine with biometric KYC',
    specs: {
      stack: 'Next.js 16 + FastAPI',
      timeline: '6 to 8 Weeks',
      budget: '$10,000 - $25,000',
    },
    qaAnswers: {
      multiTenant: 'yes',
      paymentMethods: 'bKash, Nagad',
      userVolume: '50,000 active users',
    },
    srsDocument: '# SRS Document: Fintech Loan Engine\n\nFull specifications for microcredit disbursement.',
  };
  const proj1Res = await fetch(`${FASTAPI_BASE}/api/v1/projects/from-draft`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(proj1Payload),
  });
  assert.strictEqual(proj1Res.status, 201, 'Create project should return 201 Created');
  const proj1 = await proj1Res.json();
  assert(proj1.id, 'Project 1 ID must exist');
  assert.strictEqual(proj1.name, 'Fintech Loan Engine');
  assert.strictEqual(proj1.stage, 'scoping');
  console.log(`  ✅ Passed: Project 1 created with ID="${proj1.id}".\n`);

  // Test 6: Create Project 2 from Draft (Simulating Multi-Project Tenant)
  console.log('Test 6: Create Project 2 from Draft (POST /api/v1/projects/from-draft)');
  const proj2Payload = {
    name: 'Hospital Management Suite',
    domain: 'Healthcare',
    scopeSummary: 'Telemedicine, EHR, and IPD/OPD Billing management',
    specs: {
      stack: 'Next.js 16 + FastAPI + PostgreSQL',
      timeline: '12 Weeks',
      budget: '$30,000',
    },
    qaAnswers: {
      multiTenant: 'yes',
      paymentMethods: 'SSLCommerz, bKash',
      userVolume: '100,000 active records',
    },
    srsDocument: '# SRS Document: Hospital Management Suite\n\nFull specs for healthcare platform.',
  };
  const proj2Res = await fetch(`${FASTAPI_BASE}/api/v1/projects/from-draft`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(proj2Payload),
  });
  assert.strictEqual(proj2Res.status, 201);
  const proj2 = await proj2Res.json();
  assert(proj2.id, 'Project 2 ID must exist');
  assert.strictEqual(proj2.name, 'Hospital Management Suite');
  console.log(`  ✅ Passed: Project 2 created with ID="${proj2.id}".\n`);

  // Test 7: Multi-Project Workspace Enumeration (GET /api/v1/projects)
  console.log('Test 7: Multi-Project Enumeration (GET /api/v1/projects)');
  const listRes = await fetch(`${FASTAPI_BASE}/api/v1/projects`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  assert.strictEqual(listRes.status, 200);
  const projectList = await listRes.json();
  assert(Array.isArray(projectList), 'Must return project array');
  assert(projectList.length >= 2, 'Customer workspace must contain at least 2 projects');
  const ids = projectList.map((p) => p.id);
  assert(ids.includes(proj1.id), 'Project 1 must be in list');
  assert(ids.includes(proj2.id), 'Project 2 must be in list');
  console.log(`  ✅ Passed: Both Project 1 ("${proj1.id}") and Project 2 ("${proj2.id}") retrieved in tenant list.\n`);

  // Test 8: Credit Balance Verification (0 Credits) & Purchase & Build Deduction Simulation
  console.log('Test 8: Credits Balance & Deduction (GET /api/v1/credits/balance & POST /api/v1/credits/deduct)');
  const balRes = await fetch(`${FASTAPI_BASE}/api/v1/credits/balance`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  assert.strictEqual(balRes.status, 200);
  const balData = await balRes.json();
  assert.strictEqual(balData.credits, 0, 'Initial balance must be 0 (no free credits)');

  // Client purchases package (POST /api/v1/credits/add)
  const addRes = await fetch(`${FASTAPI_BASE}/api/v1/credits/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      amount: 1000,
      reason: 'Starter Builder Pack purchased',
    }),
  });
  assert.strictEqual(addRes.status, 200);

  const deductRes = await fetch(`${FASTAPI_BASE}/api/v1/credits/deduct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      amount: 1000,
      reason: 'AI Build Activation for Project 1',
    }),
  });
  assert.strictEqual(deductRes.status, 200);
  const deductData = await deductRes.json();
  assert.strictEqual(deductData.remainingCredits, 0, 'Remaining credits after deducting 1000 must be 0');
  console.log(`  ✅ Passed: Initial credits 0, added 1000, and deducted 1000 successfully. Remaining balance: ${deductData.remainingCredits}.\n`);

  console.log('🎉 [PHASE 3 ALL PASSED] 8/8 automated test assertions succeeded without error!\n');
}

runTests().catch((err) => {
  console.error('❌ Phase 3 test failed:', err);
  process.exit(1);
});
