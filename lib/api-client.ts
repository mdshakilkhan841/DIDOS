/**
 * DUDOS Platform & ERP · API Client & Backend Integration Bridge
 * 
 * Supports dual-mode operation:
 * 1. Offline / Frontend-first Mode (default): Real-time localStorage persistence.
 * 2. FastAPI Backend Mode: Triggered when NEXT_PUBLIC_USE_BACKEND_API === "true",
 *    dispatching to http://localhost:8000/api/v1 with JWT Bearer authentication.
 */

import { PreRegistrationDraft, UserProfile, UserStatus } from "@/types/auth";

const USE_BACKEND = process.env.NEXT_PUBLIC_USE_BACKEND_API === "true";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

// Storage Keys
export const STORAGE_KEYS = {
  ONBOARDING_DRAFT: "dudos_onboarding_draft",
  ACTIVE_DRAFT: "dudos_active_draft",
  PROJECT_RECORDS: "dudos_project_records",
  CUSTOM_PROJECTS: "dudos_custom_projects",
  DEPLOYMENT_TICKETS: "dudos_deployment_tickets",
  INVOICES: "dudos_invoices",
  QUOTATION_INVOICES: "dudos_quotation_invoices",
  CREDIT_TRANSACTIONS: "dudos_credit_transactions",
  AUTH_SESSION: "dudos_auth_session",
  AUTH_TOKEN: "dudos_jwt_token",
};

// Generic fetch wrapper for FastAPI backend
async function fetchBackend<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) : null;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { data: null, error: errJson.detail || `Backend error: ${res.statusText}` };
    }

    const json = await res.json();
    return { data: json, error: null };
  } catch (err: any) {
    console.warn(`[FastAPI Bridge] Connection to ${API_BASE_URL}${endpoint} failed. Fallback to localStorage.`, err.message);
    return { data: null, error: err.message || "Failed to connect to FastAPI backend" };
  }
}

export const dudosApi = {
  getMode(): { mode: "fastapi" | "localStorage"; baseUrl: string } {
    return {
      mode: USE_BACKEND ? "fastapi" : "localStorage",
      baseUrl: API_BASE_URL,
    };
  },

  // 1. Auth Module
  auth: {
    async register(profile: Partial<UserProfile>, password?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
      if (USE_BACKEND) {
        const res = await fetchBackend<UserProfile>("/auth/register", {
          method: "POST",
          body: JSON.stringify({ ...profile, password: password || "Dudos@2026" }),
        });
        if (res.data) return { success: true, user: res.data };
      }

      // LocalStorage Fallback
      try {
        const newUser: UserProfile = {
          id: profile.id || "usr_" + Date.now().toString(36),
          email: profile.email || "client@daffodil.family",
          username: profile.username || "client_user",
          displayName: profile.displayName || "Customer Client",
          role: profile.role || "client",
          status: profile.status || "approved",
          credits: profile.credits ?? 0,
          organizationName: profile.organizationName,
          createdAt: new Date().toISOString(),
          ...profile,
        };
        localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(newUser));
        return { success: true, user: newUser };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },

    async login(email: string, password?: string): Promise<{ success: boolean; user?: UserProfile; token?: string; error?: string }> {
      if (USE_BACKEND) {
        const res = await fetchBackend<{ user: UserProfile; token: string }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password: password || "" }),
        });
        if (res.data) {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, res.data.token);
          return { success: true, user: res.data.user, token: res.data.token };
        }
        return { success: false, error: res.error || "Incorrect email or password." };
      }

      // LocalStorage Fallback (only if USE_BACKEND is false)
      try {
        const sessionStr = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
        if (sessionStr) {
          const user = JSON.parse(sessionStr);
          return { success: true, user, token: "mock_jwt_token_" + Date.now() };
        }
        return { success: false, error: "No user found in local session" };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },

    logout(): void {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      }
    },
  },

  // 2. Customer Onboarding Draft Module
  onboarding: {
    async saveDraft(draft: PreRegistrationDraft): Promise<boolean> {
      if (USE_BACKEND) {
        await fetchBackend("/onboarding/draft", {
          method: "POST",
          body: JSON.stringify(draft),
        });
      }
      try {
        localStorage.setItem(STORAGE_KEYS.ONBOARDING_DRAFT, JSON.stringify(draft));
        return true;
      } catch {
        return false;
      }
    },

    async getDraft(): Promise<PreRegistrationDraft | null> {
      if (USE_BACKEND) {
        const res = await fetchBackend<PreRegistrationDraft>("/onboarding/draft");
        if (res.data) return res.data;
      }
      try {
        const str = localStorage.getItem(STORAGE_KEYS.ONBOARDING_DRAFT);
        return str ? JSON.parse(str) : null;
      } catch {
        return null;
      }
    },

    clearDraft(): void {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.ONBOARDING_DRAFT);
      }
    },
  },

  // 3. Workspace Projects & AI-Guided QA Module
  projects: {
    async getActiveDraft(): Promise<any | null> {
      if (USE_BACKEND) {
        const res = await fetchBackend<any>("/projects/active-draft");
        if (res.data) return res.data;
      }
      try {
        const str = localStorage.getItem(STORAGE_KEYS.ACTIVE_DRAFT);
        return str ? JSON.parse(str) : null;
      } catch {
        return null;
      }
    },

    async saveActiveDraft(draft: any): Promise<boolean> {
      if (USE_BACKEND) {
        await fetchBackend("/projects/active-draft", {
          method: "PUT",
          body: JSON.stringify(draft),
        });
      }
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_DRAFT, JSON.stringify(draft));
        return true;
      } catch {
        return false;
      }
    },

    async updateQA(answers: { multiTenant: string; paymentGateway: string; userScale: string; databaseChoice: string }): Promise<boolean> {
      if (USE_BACKEND) {
        await fetchBackend("/projects/qa", {
          method: "POST",
          body: JSON.stringify(answers),
        });
      }
      try {
        const draftStr = localStorage.getItem(STORAGE_KEYS.ACTIVE_DRAFT);
        if (draftStr) {
          const draft = JSON.parse(draftStr);
          draft.qaAnswers = answers;
          draft.updatedAt = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.ACTIVE_DRAFT, JSON.stringify(draft));
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },

    async listCustomProjects(): Promise<any[]> {
      if (USE_BACKEND) {
        const res = await fetchBackend<any[]>("/projects");
        if (res.data) return res.data;
      }
      try {
        const str = localStorage.getItem(STORAGE_KEYS.CUSTOM_PROJECTS);
        return str ? JSON.parse(str) : [];
      } catch {
        return [];
      }
    },
  },

  // 4. Commercial Billing & Quotations Module
  billing: {
    async getInvoices(): Promise<any[]> {
      if (USE_BACKEND) {
        const res = await fetchBackend<any[]>("/billing/invoices");
        if (res.data) return res.data;
      }
      try {
        const str = localStorage.getItem(STORAGE_KEYS.QUOTATION_INVOICES) || localStorage.getItem(STORAGE_KEYS.INVOICES);
        return str ? JSON.parse(str) : [];
      } catch {
        return [];
      }
    },

    async payInvoice(invoiceId: string, method: string): Promise<boolean> {
      if (USE_BACKEND) {
        const res = await fetchBackend(`/billing/invoices/${invoiceId}/pay`, {
          method: "POST",
          body: JSON.stringify({ method }),
        });
        if (!res.error) return true;
      }

      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || "[]");
        const updated = existing.map((i: any) =>
          i.id === invoiceId ? { ...i, status: "paid", paidAt: new Date().toISOString(), paymentMethod: method } : i
        );
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(updated));
        localStorage.setItem(STORAGE_KEYS.QUOTATION_INVOICES, JSON.stringify(updated));
        return true;
      } catch {
        return false;
      }
    },
  },

  // 5. Managed Deployments Module
  deployments: {
    async getTickets(): Promise<any[]> {
      if (USE_BACKEND) {
        const res = await fetchBackend<any[]>("/deployments/tickets");
        if (res.data) return res.data;
      }
      try {
        const str = localStorage.getItem(STORAGE_KEYS.DEPLOYMENT_TICKETS);
        return str ? JSON.parse(str) : [];
      } catch {
        return [];
      }
    },

    async createTicket(ticket: any): Promise<boolean> {
      if (USE_BACKEND) {
        await fetchBackend("/deployments/tickets", {
          method: "POST",
          body: JSON.stringify(ticket),
        });
      }
      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPLOYMENT_TICKETS) || "[]");
        localStorage.setItem(STORAGE_KEYS.DEPLOYMENT_TICKETS, JSON.stringify([ticket, ...existing]));
        return true;
      } catch {
        return false;
      }
    },

    async verifyDNS(ticketId: string): Promise<boolean> {
      if (USE_BACKEND) {
        await fetchBackend(`/deployments/tickets/${ticketId}/verify-dns`, { method: "POST" });
      }
      try {
        const tickets = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPLOYMENT_TICKETS) || "[]");
        const updated = tickets.map((t: any) =>
          t.id === ticketId ? { ...t, dnsStatus: "verified", dnsVerifiedAt: new Date().toISOString() } : t
        );
        localStorage.setItem(STORAGE_KEYS.DEPLOYMENT_TICKETS, JSON.stringify(updated));
        return true;
      } catch {
        return false;
      }
    },

    async markLive(ticketId: string, customIp?: string): Promise<boolean> {
      const now = new Date().toISOString();
      const vpsIp = customIp || "103.145.118.42";

      if (USE_BACKEND) {
        await fetchBackend(`/deployments/tickets/${ticketId}/deploy`, {
          method: "POST",
          body: JSON.stringify({ vpsIp }),
        });
      }

      try {
        const tickets = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPLOYMENT_TICKETS) || "[]");
        let targetTicket: any = null;
        const updated = tickets.map((t: any) => {
          if (t.id === ticketId) {
            targetTicket = {
              ...t,
              status: "live",
              dnsStatus: "verified",
              assignedIp: vpsIp,
              liveUrl: `https://${t.domainName}`,
              deployedAt: now,
            };
            return targetTicket;
          }
          return t;
        });
        localStorage.setItem(STORAGE_KEYS.DEPLOYMENT_TICKETS, JSON.stringify(updated));

        if (targetTicket) {
          // Update active draft
          const draftStr = localStorage.getItem(STORAGE_KEYS.ACTIVE_DRAFT);
          if (draftStr) {
            const draft = JSON.parse(draftStr);
            draft.status = "completed";
            draft.domainName = targetTicket.domainName;
            draft.liveUrl = `https://${targetTicket.domainName}`;
            draft.vpsIp = vpsIp;
            draft.deployedAt = now;
            draft.updatedAt = now;
            localStorage.setItem(STORAGE_KEYS.ACTIVE_DRAFT, JSON.stringify(draft));
          }

          // Update custom projects
          const projStr = localStorage.getItem(STORAGE_KEYS.CUSTOM_PROJECTS);
          if (projStr) {
            const projs = JSON.parse(projStr);
            const nextProjs = projs.map((p: any) =>
              p.id === targetTicket.projectId || p.clientEmail === targetTicket.clientEmail
                ? {
                    ...p,
                    status: "completed",
                    domainName: targetTicket.domainName,
                    liveUrl: `https://${targetTicket.domainName}`,
                    vpsIp,
                    deployedAt: now,
                    updatedAt: now,
                  }
                : p
            );
            localStorage.setItem(STORAGE_KEYS.CUSTOM_PROJECTS, JSON.stringify(nextProjs));
          }
        }
        return true;
      } catch {
        return false;
      }
    },
  },
};
