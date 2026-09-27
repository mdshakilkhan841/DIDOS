export type StakeholderRole =
  | "client"
  | "merchant"
  | "partner"
  | "academy"
  | "staff"
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
    title: "Client / Enterprise",
    badge: "Enterprise",
    shortDesc: "Transformation, custom projects & managed services",
    description: "Access software project tracking, milestone reviews, service quotations, and IT consulting.",
    accentColor: "#087F79",
    recommendedRoute: "/app/records/project",
    sampleOrgPlaceholder: "e.g. Acme Corporation or Daffodil Health",
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
  staff: {
    role: "staff",
    title: "Staff / Operations",
    badge: "Internal",
    shortDesc: "Field visits, installation tasks & operational review",
    description: "Execute assigned operational tasks, field visits, installation reports, and ticket routing.",
    accentColor: "#112C3A",
    recommendedRoute: "/app/records/task",
    sampleOrgPlaceholder: "e.g. Daffodil Operations & Field Services",
  },
  executive: {
    role: "executive",
    title: "Executive / Admin",
    badge: "Governance",
    shortDesc: "Opportunity pipelines, audits & strategic decisions",
    description: "Review high-level corporate pipeline, sign release gates, evaluate market intelligence, and audit governance.",
    accentColor: "#101F2E",
    recommendedRoute: "/app/records/decision",
    sampleOrgPlaceholder: "e.g. Daffodil Executive Board & Management",
  },
};

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: StakeholderRole;
  avatarUrl?: string;
  organizationName?: string;
  phone?: string;
  identifier?: string; // Student ID, Staff ID, Trade License, etc.
  department?: string;
  isPlatformAdmin?: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: UserProfile | null;
  isAuthenticated: boolean;
  activeRole: StakeholderRole;
  token?: string;
}
