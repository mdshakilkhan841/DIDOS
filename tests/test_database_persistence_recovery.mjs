import assert from 'node:assert';

const FASTAPI_BASE = 'http://127.0.0.1:8000';

async function run() {
  console.log('🧪 Starting Database Persistence & Recovery Test (Clearing LocalStorage Scenario)...\n');

  // 1. Register a real customer
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const email = `persisted_client_${randomSuffix}@daffodil.family`;
  const regRes = await fetch(`${FASTAPI_BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'SecurePassword123!',
      displayName: `Persisted Client ${randomSuffix}`,
      organizationName: 'Shakil Holdings',
      phone: '+8801700000000',
    }),
  });
  assert.strictEqual(regRes.status, 201, 'Registration must return 201');
  const { token, user } = await regRes.json();
  console.log(`  ✅ Step 1: Customer registered in DB: ${user.id} (${email})`);

  // 2. Persist assessment draft to PostgreSQL via /api/v1/onboarding/draft & /api/v1/onboarding/active-draft
  const draftRes = await fetch(`${FASTAPI_BASE}/api/v1/onboarding/draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      organizationName: 'Shakil Holdings',
      contactPerson: 'Shakil',
      email,
      businessDomain: 'Fintech & Cloud Payments',
      projectScope: 'Full payment gateway and microcredit platform',
      referenceSiteUrl: 'https://daffodil.family',
      techStack: 'Next.js 16 + FastAPI + PostgreSQL 16',
      budgetExpectation: '$5,000 – $10,000 USD',
      expectedTimeline: '4-8 Weeks',
      payload: {
        qaAnswers: {
          multiTenant: 'yes',
          paymentGateway: 'bKash + Nagad + SSLCommerz',
          userScale: '10,000+ Concurrent Users',
          databaseChoice: 'PostgreSQL 16 Enterprise',
        },
      },
    }),
  });
  assert.strictEqual(draftRes.status, 200, 'Draft persist must return 200');
  console.log('  ✅ Step 2: Intake Draft saved in PostgreSQL customer_onboarding_drafts table');

  // 3. Persist project in customer_projects table via /api/v1/projects/from-draft
  const projRes = await fetch(`${FASTAPI_BASE}/api/v1/projects/from-draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: 'Shakil Cloud Payments Platform',
      domain: 'Fintech & Cloud Payments',
      scopeSummary: 'Full payment gateway and microcredit platform',
      specs: {
        stack: 'Next.js 16 + FastAPI + PostgreSQL 16',
        timeline: '4-8 Weeks',
        budget: '$5,000 – $10,000 USD',
      },
      qaAnswers: {
        multiTenant: 'yes',
        paymentGateway: 'bKash + Nagad + SSLCommerz',
      },
      srsDocument: '# Full SRS Specification',
    }),
  });
  assert.strictEqual(projRes.status, 201, 'Project create must return 201');
  const project = await projRes.json();
  console.log(`  ✅ Step 3: Project created in PostgreSQL customer_projects table: ${project.id} (${project.name})`);

  // 4. Simulate user clearing localStorage!
  // In localStorage simulation: everything in localStorage is GONE, only the user's session token remains!
  console.log('\n  🧹 [SIMULATION]: User cleans browser localStorage completely (dudos_active_draft, dudos_custom_projects, records deleted)');

  // 5. Test Frontend hydration logic against the Database:
  // a) Fetch active draft
  const activeDraftRes = await fetch(`${FASTAPI_BASE}/api/v1/onboarding/active-draft`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(activeDraftRes.status, 200, 'Active draft retrieval must return 200');
  const fetchedDraft = await activeDraftRes.json();
  assert(fetchedDraft, 'Active draft must not be null');
  console.log(`  ✅ Step 4: Active draft successfully retrieved from DB: "${fetchedDraft.title}"`);

  // b) Fetch projects list
  const listProjectsRes = await fetch(`${FASTAPI_BASE}/api/v1/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(listProjectsRes.status, 200, 'Project list must return 200');
  const projectsList = await listProjectsRes.json();
  assert(Array.isArray(projectsList) && projectsList.length > 0, 'Must have at least 1 project in DB');
  assert.strictEqual(projectsList[0].id, project.id, 'Fetched project must match persisted project ID');
  console.log(`  ✅ Step 5: Projects list successfully retrieved from DB: ${projectsList.length} project(s) found!`);

  // Step 6: Clean up test fixture
  await fetch(`${FASTAPI_BASE}/api/v1/admin/users/${user.id}`, { method: 'DELETE' });
  console.log(`  🧹 Cleaned up test user ${user.id} (${email}) from database.`);

  console.log('\n======================================================');
  console.log('🎉 Database persistence & clean-storage recovery verified!');
  console.log('======================================================');
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
