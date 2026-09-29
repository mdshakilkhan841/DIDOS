function safeJsonParse<T = any>(val: string | null | undefined, fallback: T | null = null): T | null {
  if (!val) return fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const direct =
      localStorage.getItem("dudos_jwt_token") ||
      localStorage.getItem("dudos_auth_token") ||
      sessionStorage.getItem("dudos_jwt_token");
    if (direct) return direct;

    const sessionStr = localStorage.getItem("dudos_auth_session");
    if (sessionStr) {
      const parsed = safeJsonParse(sessionStr);
      if (parsed?.token) return parsed.token;
    }

    const match = document.cookie.match(/(^|;\s*)(dudos_session|dudos_at)=([^;]*)/);
    if (match) {
      const parsed = safeJsonParse(decodeURIComponent(match[3]));
      if (parsed?.token) return parsed.token;
    }
  } catch {}
  return null;
}

export interface ActiveProjectDraft {
  id: string;
  workspace?: string;
  title: string;
  organizationName: string;
  contactName: string;
  email: string;
  businessDomain: string;
  projectScope: string;
  siteUrl: string;
  targetStack: string;
  budgetExpectation: string;
  expectedTimeline: string;
  qaAnswers: {
    multiTenant?: string;
    paymentGateway?: string;
    userScale?: string;
    databaseChoice?: string;
  };
  status: "draft" | "submitted" | "in_estimation" | "quoted" | "approved" | "in_development" | "deploying" | "completed" | "live";
  domainName?: string;
  liveUrl?: string;
  vpsIp?: string;
  deployedAt?: string;
  buildId?: string;
  devscopeStatus?: string;
  previewUrl?: string;
  deploymentTicket?: any;
  quotationInvoice?: any;
  savedAt: string;
  updatedAt: string;
}

const ACTIVE_DRAFT_KEY = "dudos_active_draft";
const PROJECT_RECORDS_KEY = "dudos_project_records";
const CUSTOM_PROJECTS_KEY = "dudos_custom_projects";

function cleanString(val?: string | null): string {
  if (!val) return "";
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();
  if (lower === "customer / client" || lower === "client" || lower.includes("customer / client")) {
    return "";
  }
  return trimmed;
}

export function convertAssessmentRecordToDraft(
  record: any,
  user?: any,
  workspaceId?: string
): ActiveProjectDraft {
  const d = record?.data || {};
  const org =
    cleanString(d.organization) ||
    cleanString(user?.organizationName) ||
    (user?.displayName ? `${user.displayName}'s Organization` : "Customer Workspace");

  const title = org
    ? `${org} — Transformation Project`
    : record?.title || "Digital Transformation Project";

  const scopeParts = [
    d.outcomes ? `Desired Outcomes:\n${d.outcomes}` : "",
    d.modules ? `Modules & Scope: ${d.modules}` : "",
    d.systems ? `Existing Systems: ${d.systems}` : "",
    d.brand ? `Brand Requirements: ${d.brand}` : "",
    d.rights ? `Ownership & Permissions: ${d.rights}` : "",
    d.unknowns ? `Resolved Scope: ${d.unknowns}` : "",
  ].filter(Boolean);

  const scope =
    scopeParts.length > 0
      ? scopeParts.join("\n\n")
      : "Comprehensive Digital Transformation & System Delivery";

  const isSubmitted =
    record?.status === "submitted" ||
    record?.status === "in_review" ||
    record?.status === "accepted" ||
    record?.status === "in_progress";

  const multiTenantAnswer =
    d.systems?.toLowerCase().includes("multi") ||
    d.modules?.toLowerCase().includes("crm") ||
    d.modules?.toLowerCase().includes("staff")
      ? "yes"
      : "no";

  const paymentGatewayAnswer =
    d.modules?.toLowerCase().includes("commerce") ||
    d.modules?.toLowerCase().includes("billing")
      ? "bKash / Nagad / SSLCommerz / Stripe"
      : "Online Gateway";

  return {
    id: record?.id || "draft_" + Date.now().toString(36),
    workspace: workspaceId || record?.workspace || "default",
    title,
    organizationName: org,
    contactName: user?.displayName || user?.username || "Client Lead",
    email: user?.email || "",
    businessDomain: d.sector || "Enterprise Digital Platform",
    projectScope: scope,
    siteUrl: d.site_url || "",
    targetStack: d.systems || "Next.js 16 + FastAPI + PostgreSQL 16",
    budgetExpectation: d.budget || "$2,500 – $5,000 USD",
    expectedTimeline: "4-8 Weeks",
    qaAnswers: {
      multiTenant: multiTenantAnswer,
      paymentGateway: paymentGatewayAnswer,
      userScale: "5,000+ Concurrent Users",
      databaseChoice: d.systems || "PostgreSQL 16 Enterprise",
    },
    status: isSubmitted ? "submitted" : "draft",
    savedAt: record?.created_at || new Date().toISOString(),
    updatedAt: record?.updated_at || new Date().toISOString(),
  };
}

export function syncAssessmentToWorkspaceDraft(
  record: any,
  data: Record<string, string>,
  workspaceId: string,
  user?: any,
  isSubmitted = false
): ActiveProjectDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const org =
      cleanString(data.organization) ||
      cleanString(user?.organizationName) ||
      (user?.displayName ? `${user.displayName}'s Organization` : "Customer Workspace");

    const title = org
      ? `${org} — Transformation Project`
      : record.title || "Transformation Project";

    const scopeParts = [
      data.outcomes ? `Desired Outcomes:\n${data.outcomes}` : "",
      data.modules ? `Modules & Scope: ${data.modules}` : "",
      data.systems ? `Existing Systems: ${data.systems}` : "",
      data.brand ? `Brand Requirements: ${data.brand}` : "",
      data.rights ? `Ownership & Permissions: ${data.rights}` : "",
      data.unknowns ? `Resolved Scope: ${data.unknowns}` : "",
    ].filter(Boolean);

    const scope =
      scopeParts.length > 0
        ? scopeParts.join("\n\n")
        : "Enterprise Software Architecture & Digital Transformation";

    const multiTenantAnswer =
      data.systems?.toLowerCase().includes("multi") ||
      data.modules?.toLowerCase().includes("crm") ||
      data.modules?.toLowerCase().includes("staff")
        ? "yes"
        : "no";

    const paymentGatewayAnswer =
      data.modules?.toLowerCase().includes("commerce") ||
      data.modules?.toLowerCase().includes("billing")
        ? "bKash / Nagad / SSLCommerz / Stripe"
        : "Online Gateway";

    const draftRecord: ActiveProjectDraft = {
      id: record.id || "draft_" + Date.now().toString(36),
      workspace: workspaceId,
      title,
      organizationName: org,
      contactName: user?.displayName || user?.username || "Client Stakeholder",
      email: user?.email || "",
      businessDomain: data.sector || "Enterprise Digital Transformation",
      projectScope: scope,
      siteUrl: data.site_url || "",
      targetStack: data.systems || "Next.js 16 + FastAPI + PostgreSQL 16",
      budgetExpectation: data.budget || "$2,500 – $5,000 USD",
      expectedTimeline: "4-8 Weeks",
      qaAnswers: {
        multiTenant: multiTenantAnswer,
        paymentGateway: paymentGatewayAnswer,
        userScale: "5,000+ Concurrent Users",
        databaseChoice: data.systems || "PostgreSQL 16 Enterprise",
      },
      status: isSubmitted ? "submitted" : (record.status === "submitted" ? "submitted" : "draft"),
      savedAt: record.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Set active draft in localStorage
    localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(draftRecord));

    // 2. Append or update in PROJECT_RECORDS_KEY
    const existingRecords = safeJsonParse(localStorage.getItem(PROJECT_RECORDS_KEY) || "[]") || [];
    const nextRecords = [
      draftRecord,
      ...existingRecords.filter((item: any) => item.id !== draftRecord.id),
    ];
    localStorage.setItem(PROJECT_RECORDS_KEY, JSON.stringify(nextRecords));

    // 3. Append or update in CUSTOM_PROJECTS_KEY for ERP & Admin visibility
    const existingCustom = safeJsonParse(localStorage.getItem(CUSTOM_PROJECTS_KEY) || "[]") || [];
    const customItem = {
      id: draftRecord.id,
      workspace: workspaceId,
      title: draftRecord.title,
      clientName: draftRecord.contactName,
      clientEmail: draftRecord.email,
      category: draftRecord.businessDomain,
      referenceUrl: draftRecord.siteUrl || "",
      businessScope: draftRecord.projectScope,
      selectedFeatures: [
        draftRecord.qaAnswers.multiTenant === "yes"
          ? "Multi-Tenancy Workspace Architecture"
          : "Single-Tenant Instance",
        draftRecord.qaAnswers.databaseChoice ? `Database: ${draftRecord.qaAnswers.databaseChoice}` : "",
      ].filter(Boolean),
      framework: draftRecord.targetStack,
      targetTimeline: draftRecord.expectedTimeline,
      budgetRange: draftRecord.budgetExpectation,
      srsContent: `# Software Requirements Specification (SRS)\n## Project: ${draftRecord.title}\n**Organization**: ${draftRecord.organizationName}\n**Scope**:\n${draftRecord.projectScope}\n\n**Architecture**:\n- Stack: ${draftRecord.targetStack}\n- Multi-Tenancy: ${draftRecord.qaAnswers.multiTenant}\n- Payment: ${draftRecord.qaAnswers.paymentGateway}\n- Concurrency Scale: ${draftRecord.qaAnswers.userScale}`,
      status: draftRecord.status,
      createdAt: draftRecord.savedAt,
      updatedAt: draftRecord.updatedAt,
    };
    const nextCustom = [
      customItem,
      ...existingCustom.filter((item: any) => item.id !== draftRecord.id),
    ];
    localStorage.setItem(CUSTOM_PROJECTS_KEY, JSON.stringify(nextCustom));

    // 4. Asynchronously sync to FastAPI PostgreSQL backend
    const token = getAuthToken();
    if (token) {
      // a. Save to customer_onboarding_drafts table
      fetch("http://localhost:8000/api/v1/onboarding/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          organizationName: draftRecord.organizationName,
          contactPerson: draftRecord.contactName,
          email: draftRecord.email,
          businessDomain: draftRecord.businessDomain,
          projectScope: draftRecord.projectScope,
          referenceSiteUrl: draftRecord.siteUrl,
          techStack: draftRecord.targetStack,
          budgetExpectation: draftRecord.budgetExpectation,
          expectedTimeline: draftRecord.expectedTimeline,
          payload: {
            qaAnswers: draftRecord.qaAnswers,
            workspace: workspaceId,
            recordId: draftRecord.id,
            status: draftRecord.status,
          },
        }),
      }).catch((err) => console.warn("Failed to persist onboarding draft to DB:", err));

      // b. Save to customer_active_drafts table
      fetch("http://localhost:8000/api/v1/onboarding/active-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          draft: draftRecord,
          activeDraft: draftRecord,
          stage: isSubmitted ? "submitted" : "draft",
        }),
      }).catch((err) => console.warn("Failed to persist active draft to DB:", err));

      // c. Persist project in customer_projects table in PostgreSQL
      fetch("http://localhost:8000/api/v1/projects/from-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: draftRecord.title,
          domain: draftRecord.businessDomain,
          scopeSummary: draftRecord.projectScope,
          specs: {
            stack: draftRecord.targetStack,
            timeline: draftRecord.expectedTimeline,
            budget: draftRecord.budgetExpectation,
            workspace: workspaceId,
            organization: draftRecord.organizationName,
          },
          qaAnswers: draftRecord.qaAnswers,
          srsDocument: customItem.srsContent,
        }),
      }).catch((err) => console.warn("Failed to persist project to DB:", err));
    }

    return draftRecord;
  } catch (err) {
    console.error("Error in syncAssessmentToWorkspaceDraft:", err);
    return null;
  }
}
