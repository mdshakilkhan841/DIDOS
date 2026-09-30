import assert from "assert";

// Mock localStorage for node environment
const storage = {};
global.window = {
    localStorage: {
        getItem: (key) => storage[key] || null,
        setItem: (key, val) => {
            storage[key] = String(val);
        },
        removeItem: (key) => {
            delete storage[key];
        },
        clear: () => {
            Object.keys(storage).forEach((k) => delete storage[k]);
        },
    },
};
global.localStorage = global.window.localStorage;

import {
    convertAssessmentRecordToDraft,
    getAuthToken,
    findAssessmentRecord,
    syncAssessmentToWorkspaceDraft,
} from "../lib/dudos/assessment-sync.ts";

// The session cookie may not contain a token; the raw access token follows it.
global.sessionStorage = { getItem: () => null };
global.document = {
    cookie: `dudos_session=${encodeURIComponent(JSON.stringify({ userId: "usr_shakil_01" }))}; dudos_at=header.payload.signature`,
};
assert.strictEqual(
    getAuthToken(),
    "header.payload.signature",
    "Must read the raw access-token cookie even when the session cookie appears first",
);
global.document.cookie = "";

console.log("🧪 Starting Assessment & Workspace Sync Unit Test...\n");

// 1. Test assessment record conversion
const mockAssessmentRecord = {
    id: "rec_assessment_test1",
    kind: "assessment",
    workspace: "ws_test_shakil",
    title: "Transformation draft",
    status: "draft",
    created_at: new Date().toISOString(),
    data: {
        organization: "Daffodil Smart Campus",
        outcomes:
            "Automate student admission, payments and attendance across 5 campuses",
        sector: "Higher Education & EdTech",
        site_url: "https://daffodil.family",
        systems: "PostgreSQL 16, Legacy ERP",
        modules: "website, commerce, billing, AI assistant",
        budget: "$5,000 – $10,000 USD",
    },
};

const user = {
    id: "usr_shakil_01",
    displayName: "Shakil Khan",
    email: "shakil@daffodil.family",
    organizationName: "Daffodil Smart Campus",
};

const draft = convertAssessmentRecordToDraft(
    mockAssessmentRecord,
    user,
    "ws_test_shakil",
);

console.log("Test 1: Convert Assessment Record to ActiveProjectDraft");
assert(draft.id === "rec_assessment_test1", "Draft ID should match record ID");
assert(
    draft.title.includes("Daffodil Smart Campus"),
    "Draft title should include organization",
);
assert(
    draft.businessDomain === "Higher Education & EdTech",
    "Domain should match sector",
);
assert(draft.siteUrl === "https://daffodil.family", "Site URL should match");
assert(
    draft.qaAnswers.multiTenant === "yes" ||
        draft.qaAnswers.multiTenant === "no",
    "Multi-tenant answer should exist",
);
assert(
    draft.qaAnswers.paymentGateway.includes("bKash"),
    "Payment gateway should include bKash/Nagad due to commerce/billing",
);
console.log(
    "  ✅ Passed: Assessment record successfully converted to ActiveProjectDraft",
);

// 2. Test syncAssessmentToWorkspaceDraft
console.log("\nTest 2: Sync Assessment to Workspace Draft Storage");
const synced = await syncAssessmentToWorkspaceDraft(
    mockAssessmentRecord,
    mockAssessmentRecord.data,
    "ws_test_shakil",
    user,
    false,
);
assert(synced !== null, "Synced draft should not be null");

const activeDraftStr = localStorage.getItem("dudos_active_draft");
assert(activeDraftStr !== null, "dudos_active_draft should be set in storage");
const activeDraft = JSON.parse(activeDraftStr);
assert(
    activeDraft.id === "rec_assessment_test1",
    "Stored active draft ID should match",
);
assert(activeDraft.status === "draft", "Status should be draft");

const projectRecordsStr = localStorage.getItem("dudos_project_records");
assert(projectRecordsStr !== null, "dudos_project_records should be updated");
const projectRecords = JSON.parse(projectRecordsStr);
assert(projectRecords.length === 1, "Should have 1 project record");

const customProjectsStr = localStorage.getItem("dudos_custom_projects");
assert(customProjectsStr !== null, "dudos_custom_projects should be updated");
const customProjects = JSON.parse(customProjectsStr);
assert(customProjects.length === 1, "Should have 1 custom project");
assert(
    customProjects[0].srsContent.includes("SRS"),
    "Custom project should have SRS content",
);
console.log(
    "  ✅ Passed: Assessment synced across dudos_active_draft, dudos_project_records, and dudos_custom_projects",
);

// 3. Test submitting the assessment
console.log("\nTest 3: Submit Assessment via Send to DUDOS");
const submittedDraft = await syncAssessmentToWorkspaceDraft(
    mockAssessmentRecord,
    mockAssessmentRecord.data,
    "ws_test_shakil",
    user,
    true,
);
assert(submittedDraft.status === "submitted", "Status should be submitted");
const updatedActive = JSON.parse(localStorage.getItem("dudos_active_draft"));
assert(
    updatedActive.status === "submitted",
    "Active draft status should be updated to submitted",
);
console.log(
    '  ✅ Passed: Submitting assessment updates draft status to "submitted"',
);

console.log("\n======================================================");
console.log("🎉 All Assessment & Workspace Sync unit tests passed!");
console.log("======================================================");

assert.strictEqual(
    findAssessmentRecord([mockAssessmentRecord], {
        recordId: mockAssessmentRecord.id,
        organizationName: "A different org",
    }),
    mockAssessmentRecord,
    "Edit lookup should prioritize the original assessment ID",
);
assert.strictEqual(
    findAssessmentRecord([mockAssessmentRecord], {
        organizationName: "Daffodil Smart Campus",
    }),
    mockAssessmentRecord,
    "Edit lookup should fall back to the assessment organization",
);
assert.strictEqual(
    synced.assessmentRecordId,
    mockAssessmentRecord.id,
    "Synced draft should preserve the source assessment ID",
);
assert.strictEqual(
    synced.assessmentData.organization,
    "Daffodil Smart Campus",
    "Synced draft should preserve editable assessment answers",
);
