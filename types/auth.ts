export type StakeholderRole =
  | "client"
  | "admin"
  | "staff"
  | "merchant"
  | "partner"
  | "academy"
  | "executive";

export interface StakeholderMeta {
  role: StakeholderRole;
  title: string;
  badge: string;
  shortDesc: string;
  description: string;
  accentColor: string;
  recommendedRoute: string;
  sampleOrgPlaceholder: string;
}

export const STAKEHOLDER_CONFIGS: Record<StakeholderRole, StakeholderMeta> = {
  client: {
    role: "client",
    title: "Customer / Client",
    badge: "Client",
    shortDesc: "Self-service AI builder, custom projects, credits & workspaces",
    description: "Manage projects, generate websites, buy credit packages, submit custom project requests, and track invoices.",
    accentColor: "#087F79",
    recommendedRoute: "/app/records/project",
    sampleOrgPlaceholder: "e.g. Acme Corporation or Daffodil Health",
  },
  admin: {
    role: "admin",
    title: "System Administrator / Tech Team",
    badge: "Tech Admin",
    shortDesc: "Client requests, technical estimation, deployment & accounting",
    description: "Conduct technical estimations, calculate man-hours/costs, dispatch quotations, oversee project lifecycles, and monitor ERP accounting.",
    accentColor: "#112C3A",
    recommendedRoute: "/app/tenant-admin",
    sampleOrgPlaceholder: "e.g. Daffodil Web & E-Commerce Engineering Team",
  },
  staff: {
    role: "staff",
    title: "Technical Team / Operations",
    badge: "Operations",
    shortDesc: "Deployment support, domain mapping, code review & task queues",
    description: "Assist with domain mapping, technical builds, managed deployment support, and operational workflows.",
    accentColor: "#1B3B4B",
    recommendedRoute: "/app/records/task",
    sampleOrgPlaceholder: "e.g. Daffodil Operations & DevOps Team",
  },
  merchant: {
    role: "merchant",
    title: "Merchant / Vendor",
    badge: "Commerce",
    shortDesc: "Product catalogs, orders & retail fulfillment",
    description: "Manage product listings, fulfillment queues, inventory, and trade invoices.",
    accentColor: "#53D3BD",
    recommendedRoute: "/app/records/product",
    sampleOrgPlaceholder: "e.g. Daffodil Gadget Store or Tech Supplies Ltd",
  },
  partner: {
    role: "partner",
    title: "Partner / Agency",
    badge: "Partner",
    shortDesc: "Affiliates, software agencies & solution partners",
    description: "Submit client leads, monitor affiliate commissions, co-sell packages, and manage listings.",
    accentColor: "#21A699",
    recommendedRoute: "/app/records/partner",
    sampleOrgPlaceholder: "e.g. Apex Digital Agency",
  },
  academy: {
    role: "academy",
    title: "Academy / Student",
    badge: "Academic",
    shortDesc: "DIU students, research labs & talent challenges",
    description: "Participate in innovation hackathons, book GPU/lab slots, and access hands-on learning paths.",
    accentColor: "#71D4BB",
    recommendedRoute: "/app/records/challenge",
    sampleOrgPlaceholder: "e.g. Daffodil International University (Dept of CSE)",
  },
  executive: {
    role: "executive",
    title: "Executive / Governance",
    badge: "Governance",
    shortDesc: "Opportunity pipelines, audits & strategic decisions",
    description: "Review high-level corporate pipeline, sign release gates, evaluate market intelligence, and audit governance.",
    accentColor: "#101F2E",
    recommendedRoute: "/app/records/decision",
    sampleOrgPlaceholder: "e.g. Daffodil Executive Board & Management",
  },
};

export type UserStatus =
  | "pending_review"
  | "in_scoping"
  | "verified"
  | "approved"
  | "active"
  | "on_hold";

export interface ProjectIntakeData {
  businessDomain: string;
  projectScope: string;
  targetStack: string;
  referenceUrls?: string;
  expectedTimeline?: string;
  budgetRange?: string;
  submittedAt: string;
  estimationQuote?: {
    manHours: number;
    hourlyRate: number;
    infraCost: number;
    totalQuote: number;
    currency: string;
    approvedAt?: string;
    adminNotes?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: StakeholderRole;
  status: UserStatus;
  credits: number;
  avatarUrl?: string;
  organizationName?: string;
  phone?: string;
  identifier?: string; // Student ID, Staff ID, Trade License, etc.
  department?: string;
  isPlatformAdmin?: boolean;
  createdAt: string;
  intake?: ProjectIntakeData;
}

export interface PreRegistrationDraft {
  role: StakeholderRole;
  username: string;
  displayName: string;
  email: string;
  organizationName?: string;
  identifier?: string;
  department?: string;
  businessDomain?: string;
  projectScope?: string;
  targetStack?: string;
  referenceUrls?: string;
  expectedTimeline?: string;
  budgetRange?: string;
  savedAt: string;
}

export interface AuthSession {
  user: UserProfile | null;
  isAuthenticated: boolean;
  activeRole: StakeholderRole;
  token?: string;
}

