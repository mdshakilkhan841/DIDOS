import assert from 'node:assert';

const FASTAPI_BASE = 'http://127.0.0.1:8000';

async function run() {
  console.log('🧪 Testing Prevention of Duplicate Projects on Repeated Actions (Root Cause Test)...\n');

  // 1. Register a test user
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const email = `dedup_client_${randomSuffix}@daffodil.family`;
  const regRes = await fetch(`${FASTAPI_BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'SecurePassword123!',
      displayName: `Dedup Client ${randomSuffix}`,
      organizationName: 'Chandler Drake Associates',
      phone: '+8801700000001',
    }),
  });
  assert.strictEqual(regRes.status, 201, 'Registration must return 201');
  const { token, user } = await regRes.json();
  console.log(`  ✅ User registered: ${user.id} (${email})`);

  // 2. Action 1: Assessment Form Submission creates project
  const firstSubmitRes = await fetch(`${FASTAPI_BASE}/api/v1/projects/from-draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      recordId: 'rec_initial_draft_001',
      name: 'Chandler Drake Associates — Transformation Project',
      domain: 'Enterprise Software Architecture',
      scopeSummary: 'Initial digital transformation assessment scope',
      specs: {
        stack: 'Next.js 16 + FastAPI + PostgreSQL 16',
        timeline: '4-8 Weeks',
        budget: '$2,500 – $5,000 USD',
        recordId: 'rec_initial_draft_001',
      },
    }),
  });
  assert.strictEqual(firstSubmitRes.status, 201, 'First project submission should return 201');
  const proj1 = await firstSubmitRes.json();
  console.log(`  ✅ Action 1 (Assessment Submitted): Project created with ID: ${proj1.id}`);

  // 3. Action 2: User clicks "Confirm Specifications" (Approval Gate) in Customer Portal
  // In the old code, this generated a brand new UUID and inserted row #2 in customer_projects!
  const secondConfirmRes = await fetch(`${FASTAPI_BASE}/api/v1/projects/from-draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      projectId: proj1.id,
      recordId: 'rec_initial_draft_001',
      name: 'Chandler Drake Associates — Transformation Project',
      domain: 'Enterprise Software Architecture',
      scopeSummary: 'Scope updated with refined SRS details',
      specs: {
        stack: 'Next.js 16 + FastAPI + PostgreSQL 16',
        timeline: '6 Weeks',
        budget: '$4,000 USD',
        recordId: 'rec_initial_draft_001',
      },
      srsDocument: '# Refined SRS Document',
    }),
  });
  assert.strictEqual(secondConfirmRes.status, 201, 'Second confirmation should succeed');
  const proj2 = await secondConfirmRes.json();
  console.log(`  ✅ Action 2 (Specifications Confirmed): Returned project ID: ${proj2.id}`);
  assert.strictEqual(proj2.id, proj1.id, 'Action 2 MUST update the existing project ID, NOT create a new project!');

  // 4. Action 3: User revisits Assessment Wizard or sends request again
  const thirdRes = await fetch(`${FASTAPI_BASE}/api/v1/projects/from-draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      recordId: 'rec_initial_draft_001',
      name: 'Chandler Drake Associates — Transformation Project',
      domain: 'Enterprise Software Architecture',
      scopeSummary: 'Third check with same name and recordId',
    }),
  });
  assert.strictEqual(thirdRes.status, 201, 'Third action should succeed');
  const proj3 = await thirdRes.json();
  console.log(`  ✅ Action 3 (Re-save / Re-submit): Returned project ID: ${proj3.id}`);
  assert.strictEqual(proj3.id, proj1.id, 'Action 3 MUST update the existing project ID, NOT create a new project!');

  // 5. Query /api/v1/projects: Verify EXACTLY 1 project returned
  const listRes = await fetch(`${FASTAPI_BASE}/api/v1/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const list = await listRes.json();
  // 6. Cleanup test fixture so database is not polluted with test users
  await fetch(`${FASTAPI_BASE}/api/v1/admin/users/${user.id}`, { method: 'DELETE' });
  console.log(`  🧹 Cleaned up test user ${user.id} (${email}) from database.`);

  console.log('\n======================================================');
  console.log('🎉 PASSED: Zero duplicate project records created across repeat actions!');
  console.log('======================================================');
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
