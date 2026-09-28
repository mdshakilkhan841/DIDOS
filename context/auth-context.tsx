"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  StakeholderRole,
  UserProfile,
  PreRegistrationDraft,
  STAKEHOLDER_CONFIGS,
  UserStatus,
  ProjectIntakeData,
} from "@/types/auth";
import { showToast } from "@/lib/toast";
import { getCookieDomain, safeJsonParse } from "@/lib/subdomains";

export interface CreditTransaction {
  id: string;
  amount: number;
  type: "credit" | "debit";
  reason: string;
  timestamp: string;
}

interface AuthContextType {
  user: UserProfile | null;
  activeRole: StakeholderRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password?: string, role?: StakeholderRole) => Promise<{ user: UserProfile; token: string }>;
  register: (data: Partial<UserProfile> & { password?: string }) => Promise<{ user: UserProfile; token: string }>;
  logout: () => void;
  switchRole: (newRole: StakeholderRole) => void;
  // Credits system
  credits: number;
  deductCredits: (amount: number, reason: string) => boolean;
  addCredits: (amount: number, reason: string) => void;
  creditTransactions: CreditTransaction[];
  // Pre-registration persistence
  savePreRegistrationDraft: (draft: PreRegistrationDraft) => void;
  getPreRegistrationDraft: () => PreRegistrationDraft | null;
  clearPreRegistrationDraft: () => void;
  // Admin & Registrations Queue
  registrations: UserProfile[];
  updateRegistrationStatus: (
    userId: string,
    newStatus: UserStatus,
    quote?: ProjectIntakeData["estimationQuote"]
  ) => void;
  allocateCreditsToUser: (userId: string, amount: number, reason: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "dudos_auth_session";
const PREREG_KEY = "dudos_preregistration_draft";
const TRANSACTIONS_KEY = "dudos_credit_transactions";
const REGISTRATIONS_KEY = "dudos_registrations_queue";

const SEED_REGISTRATIONS: UserProfile[] = [
  {
    id: "usr_acme_health",
    email: "farhan@acmehealth.com",
    username: "acme_health",
    displayName: "Dr. Farhan Ahmed",
    role: "client",
    status: "pending_review",
    credits: 1000,
    organizationName: "Acme Healthcare Systems Ltd",
    identifier: "TR-8921-DHK",
    department: "Clinical Operations",
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    intake: {
      businessDomain: "Healthcare & Telemedicine",
      projectScope: "Multi-hospital patient triage portal with doctor scheduling and prescription generator.",
      targetStack: "Next.js 16 + FastAPI + PostgreSQL",
      referenceUrls: "https://health.daffodil.family, https://mayoclinic.org",
      expectedTimeline: "6 Weeks",
      budgetRange: "$5,000 - $8,000",
      submittedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    },
  },
  {
    id: "usr_bengal_logistics",
    email: "tariq@bengallogistics.com",
    username: "bengal_logistics",
    displayName: "Tariqul Islam",
    role: "client",
    status: "in_scoping",
    credits: 1000,
    organizationName: "Bengal Express Logistics Ltd",
    identifier: "TL-5512-CTG",
    department: "Supply Chain",
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    intake: {
      businessDomain: "Logistics & Supply Chain",
      projectScope: "Real-time dispatch dashboard, GPS container tracking, driver mobile PWA, automated delivery receipts.",
      targetStack: "React + Node.js + PostgreSQL",
      referenceUrls: "https://dhl.com, https://uberfreight.com",
      expectedTimeline: "8 Weeks",
      budgetRange: "$10,000 - $15,000",
      submittedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
      estimationQuote: {
        manHours: 180,
        hourlyRate: 45,
        infraCost: 650,
        totalQuote: 8750,
        currency: "USD",
        approvedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
        adminNotes: "Tech architecture approved for container microservices.",
      },
    },
  },
  {
    id: "usr_daffodil_agri",
    email: "shafin@daffodil-agri.com",
    username: "daffodil_agri",
    displayName: "Shafin Rahman",
    role: "client",
    status: "approved",
    credits: 5000,
    organizationName: "Daffodil Agritech Innovations",
    identifier: "AG-1029-DHK",
    department: "Research & Development",
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    intake: {
      businessDomain: "Agriculture & IoT",
      projectScope: "Smart farm sensor monitoring, soil moisture telemetry, crop yield AI forecasting.",
      targetStack: "WordPress Headless + Next.js",
      referenceUrls: "https://agritech.daffodil.family",
      expectedTimeline: "4 Weeks",
      budgetRange: "$3,500 - $5,000",
      submittedAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
      estimationQuote: {
        manHours: 95,
        hourlyRate: 40,
        infraCost: 350,
        totalQuote: 4150,
        currency: "USD",
        approvedAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
        adminNotes: "Ready for live workspace staging.",
      },
    },
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<StakeholderRole>("client");
  const [isLoading, setIsLoading] = useState(true);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [registrations, setRegistrations] = useState<UserProfile[]>([]);

  // Restore saved session, credit logs, and registrations on mount
  useEffect(() => {
    try {
      let restoredUser: UserProfile | null = null;
      let restoredRole: StakeholderRole | null = null;
      let restoredToken: string | undefined = undefined;

      // 1. Check localStorage first
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.user && parsed.activeRole) {
            restoredUser = parsed.user;
            restoredRole = parsed.activeRole;
            restoredToken = parsed.token || localStorage.getItem("dudos_jwt_token") || undefined;
          }
        } catch {}
      }

      // 2. Fallback to cookies (enables cross-subdomain SSO and session persistence across origins)
      if (!restoredUser && typeof document !== "undefined") {
        const getCookie = (name: string) => {
          const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
          return match ? match[2] : null;
        };

        const cookieSessionRaw = getCookie("dudos_session");
        const cookieToken = getCookie("dudos_at");

        if (cookieSessionRaw) {
          try {
            const sessionData = safeJsonParse(cookieSessionRaw);
            if (sessionData) {
              const role = (sessionData.role as StakeholderRole) || "client";
              const config = STAKEHOLDER_CONFIGS[role] || STAKEHOLDER_CONFIGS.client;
              restoredUser = {
                id: sessionData.userId || sessionData.id || "usr_session",
                email: sessionData.email || "",
                username: sessionData.email?.split("@")[0] || "user",
                displayName: sessionData.displayName || sessionData.email?.split("@")[0] || "User",
                role: role,
                status: "approved",
                credits: 1000,
                organizationName: sessionData.organizationName || config.title,
                createdAt: new Date().toISOString(),
              };
              restoredRole = role;
              restoredToken = cookieToken || undefined;

              // Sync to this origin's localStorage
              localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: restoredUser, activeRole: role, token: restoredToken }));
              if (restoredToken) {
                localStorage.setItem("dudos_jwt_token", restoredToken);
              }
            }
          } catch {}
        }

        // If session cookie was missing/corrupted but auth token cookie exists, restore basic session
        if (!restoredUser && cookieToken) {
          const role: StakeholderRole = "client";
          const config = STAKEHOLDER_CONFIGS.client;
          restoredUser = {
            id: cookieToken.startsWith("token_") ? cookieToken.replace("token_", "") : "usr_session",
            email: "",
            username: "user",
            displayName: "User",
            role: role,
            status: "approved",
            credits: 1000,
            organizationName: config.title,
            createdAt: new Date().toISOString(),
          };
          restoredRole = role;
          restoredToken = cookieToken;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: restoredUser, activeRole: role, token: restoredToken }));
            localStorage.setItem("dudos_jwt_token", restoredToken);
          } catch {}
        }
      }

      if (restoredUser && restoredRole) {
        setUser(restoredUser);
        setActiveRole(restoredRole);
      }

      const storedTx = localStorage.getItem(TRANSACTIONS_KEY);
      if (storedTx) {
        setCreditTransactions(JSON.parse(storedTx));
      } else {
        const initialTx: CreditTransaction = {
          id: "tx_welcome",
          amount: 1000,
          type: "credit",
          reason: "Welcome bonus (Dudos Platform Activation)",
          timestamp: new Date().toISOString(),
        };
        setCreditTransactions([initialTx]);
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([initialTx]));
      }

      const storedRegs = localStorage.getItem(REGISTRATIONS_KEY);
      if (storedRegs) {
        setRegistrations(JSON.parse(storedRegs));
      } else {
        setRegistrations(SEED_REGISTRATIONS);
        localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(SEED_REGISTRATIONS));
      }
    } catch {
      // Fallback silently if storage read fails
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save session when user or role changes
  const persistSession = (u: UserProfile | null, r: StakeholderRole, jwtToken?: string) => {
    try {
      const cookieDomain = getCookieDomain();
      const domainAttr = cookieDomain ? `; domain=${cookieDomain}` : "";

      if (u) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u, activeRole: r, token: jwtToken }));
        if (jwtToken) {
          localStorage.setItem("dudos_jwt_token", jwtToken);
        }
        try {
          document.cookie = `dudos_session=${encodeURIComponent(JSON.stringify({ userId: u.id, displayName: u.displayName, email: u.email, role: u.role }))}; path=/; max-age=2592000; SameSite=Lax${domainAttr}`;
          document.cookie = `dudos_at=${jwtToken || `token_${u.id}`}; path=/; max-age=2592000; SameSite=Lax${domainAttr}`;
        } catch {}
      } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("dudos_jwt_token");
        try {
          // Thoroughly delete cookies for host-only, domain-scoped, and localhost contexts
          const epoch = "expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
          document.cookie = `dudos_session=; path=/; max-age=0; ${epoch}`;
          document.cookie = `dudos_at=; path=/; max-age=0; ${epoch}`;
          document.cookie = `dudos_session=; path=/; domain=localhost; max-age=0; ${epoch}`;
          document.cookie = `dudos_at=; path=/; domain=localhost; max-age=0; ${epoch}`;
          document.cookie = `dudos_session=; path=/; domain=.localhost; max-age=0; ${epoch}`;
          document.cookie = `dudos_at=; path=/; domain=.localhost; max-age=0; ${epoch}`;
          if (domainAttr) {
            document.cookie = `dudos_session=; path=/; max-age=0; ${epoch}${domainAttr}`;
            document.cookie = `dudos_at=; path=/; max-age=0; ${epoch}${domainAttr}`;
          }
        } catch {}
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  };

  const login = async (identifier: string, password?: string, preferredRole?: StakeholderRole): Promise<{ user: UserProfile; token: string }> => {
    setIsLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: identifier.trim(),
          password: password || "",
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const message = errJson.detail || "Incorrect email or password.";
        showToast.error("Sign-in failed", { description: message });
        throw new Error(message);
      }

      const data = await res.json();
      const role = (data.user.role as StakeholderRole) || preferredRole || activeRole;
      const config = STAKEHOLDER_CONFIGS[role] || STAKEHOLDER_CONFIGS.client;

      const authenticatedUser: UserProfile = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.email.split("@")[0],
        displayName: data.user.displayName || data.user.email.split("@")[0],
        role: role,
        status: data.user.status || "approved",
        credits: data.user.credits ?? 1000,
        organizationName: data.user.organizationName || config.title,
        createdAt: data.user.createdAt || new Date().toISOString(),
      };

      setUser(authenticatedUser);
      setActiveRole(role);
      persistSession(authenticatedUser, role, data.token);

      showToast.success(`Welcome back, ${authenticatedUser.displayName}!`, {
        description: `Signed in as ${config.title}.`,
      });

      return { user: authenticatedUser, token: data.token };
    } catch (e: any) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };


  const register = async (data: Partial<UserProfile> & { password?: string; intake?: ProjectIntakeData }): Promise<{ user: UserProfile; token: string }> => {
    setIsLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiBase}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email?.trim(),
          password: data.password || "",
          displayName: data.displayName?.trim(),
          role: "client",
          organizationName: data.organizationName,
          phone: data.phone,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const message = errJson.detail || "Registration failed. Please try again.";
        showToast.error("Registration failed", { description: message });
        throw new Error(message);
      }

      const respData = await res.json();
      const role: StakeholderRole = "client";
      const config = STAKEHOLDER_CONFIGS.client;

      const newUser: UserProfile = {
        id: respData.user.id,
        email: respData.user.email,
        username: respData.user.email.split("@")[0],
        displayName: respData.user.displayName,
        role: "client",
        status: respData.user.status || "approved",
        credits: respData.user.credits ?? 1000,
        organizationName: respData.user.organizationName || config.title,
        phone: data.phone,
        createdAt: respData.user.createdAt || new Date().toISOString(),
        intake: data.intake || {
          businessDomain: "General Digital Transformation",
          projectScope: "Standard client onboarding & workspace initialization.",
          targetStack: "Next.js 16 + FastAPI + PostgreSQL",
          submittedAt: new Date().toISOString(),
        },
      };

      setUser(newUser);
      setActiveRole(role);
      persistSession(newUser, role, respData.token);

      clearPreRegistrationDraft();

      showToast.success("Registration successful!", {
        description: `Welcome to DUDOS! 1,000 welcome credits granted.`,
      });

      return { user: newUser, token: respData.token };
    } catch (e: any) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };



  const updateRegistrationStatus = (
    userId: string,
    newStatus: UserStatus,
    quote?: ProjectIntakeData["estimationQuote"]
  ) => {
    const updated = registrations.map((r) => {
      if (r.id === userId) {
        const intake = r.intake || {
          businessDomain: "Digital System",
          projectScope: "Client Project",
          targetStack: "Next.js + FastAPI",
          submittedAt: new Date().toISOString(),
        };
        return {
          ...r,
          status: newStatus,
          intake: quote ? { ...intake, estimationQuote: quote } : intake,
        };
      }
      return r;
    });

    setRegistrations(updated);
    try {
      localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(updated));
    } catch {}

    // If currently logged-in user is updated, update active session
    if (user && user.id === userId) {
      const updatedUser: UserProfile = {
        ...user,
        status: newStatus,
        intake: quote ? { ...(user.intake || { businessDomain: "", projectScope: "", targetStack: "", submittedAt: "" }), estimationQuote: quote } : user.intake,
      };
      setUser(updatedUser);
      persistSession(updatedUser, activeRole);
    }

    showToast.success(`Client status updated to ${newStatus.replace("_", " ").toUpperCase()}`);
  };

  const allocateCreditsToUser = (userId: string, amount: number, reason: string) => {
    const updated = registrations.map((r) => {
      if (r.id === userId) {
        return { ...r, credits: r.credits + amount };
      }
      return r;
    });

    setRegistrations(updated);
    try {
      localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(updated));
    } catch {}

    if (user && user.id === userId) {
      const updatedUser = { ...user, credits: user.credits + amount };
      setUser(updatedUser);
      persistSession(updatedUser, activeRole);
    }

    const tx: CreditTransaction = {
      id: "tx_" + Date.now().toString(36),
      amount,
      type: amount >= 0 ? "credit" : "debit",
      reason: `Admin Allocation (${userId}): ${reason}`,
      timestamp: new Date().toISOString(),
    };
    const updatedTx = [tx, ...creditTransactions];
    setCreditTransactions(updatedTx);
    try {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTx));
    } catch {}

    showToast.success(`Allocated ${amount.toLocaleString()} credits to user!`);
  };

  const logout = useCallback(() => {
    setUser(null);
    persistSession(null, activeRole);
  }, [activeRole]);

  const switchRole = (newRole: StakeholderRole) => {
    setActiveRole(newRole);
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      persistSession(updatedUser, newRole);
    }
    showToast.info(`Switched view to ${STAKEHOLDER_CONFIGS[newRole]?.title || newRole}`);
  };

  // Credits management
  const credits = user?.credits ?? 1000;

  const deductCredits = (amount: number, reason: string): boolean => {
    if (!user) return false;
    if (user.credits < amount) {
      showToast.error("Insufficient Credits", {
        description: `You need ${amount} credits. Current balance: ${user.credits} credits. Please purchase a package.`,
      });
      return false;
    }

    const updatedUser = { ...user, credits: user.credits - amount };
    setUser(updatedUser);
    persistSession(updatedUser, activeRole);

    const tx: CreditTransaction = {
      id: "tx_" + Date.now().toString(36),
      amount,
      type: "debit",
      reason,
      timestamp: new Date().toISOString(),
    };
    const updatedTx = [tx, ...creditTransactions];
    setCreditTransactions(updatedTx);
    try {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTx));
    } catch {}

    showToast.success(`Deducted ${amount} credits`, {
      description: `${reason}. Remaining balance: ${updatedUser.credits} credits.`,
    });
    return true;
  };

  const addCredits = (amount: number, reason: string) => {
    const currentCredits = user ? user.credits : 1000;
    const newTotal = currentCredits + amount;
    if (user) {
      const updatedUser = { ...user, credits: newTotal };
      setUser(updatedUser);
      persistSession(updatedUser, activeRole);
    }

    const tx: CreditTransaction = {
      id: "tx_" + Date.now().toString(36),
      amount,
      type: "credit",
      reason,
      timestamp: new Date().toISOString(),
    };
    const updatedTx = [tx, ...creditTransactions];
    setCreditTransactions(updatedTx);
    try {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTx));
    } catch {}

    showToast.success(`Added ${amount.toLocaleString()} credits!`, {
      description: `New balance: ${newTotal.toLocaleString()} credits.`,
    });
  };

  // Pre-registration draft management
  const savePreRegistrationDraft = (draft: PreRegistrationDraft) => {
    try {
      localStorage.setItem(PREREG_KEY, JSON.stringify(draft));
      sessionStorage.setItem(PREREG_KEY, JSON.stringify(draft));
    } catch {}
  };

  const getPreRegistrationDraft = (): PreRegistrationDraft | null => {
    try {
      const fromSession = sessionStorage.getItem(PREREG_KEY);
      if (fromSession) return JSON.parse(fromSession);
      const fromLocal = localStorage.getItem(PREREG_KEY);
      if (fromLocal) return JSON.parse(fromLocal);
    } catch {}
    return null;
  };

  const clearPreRegistrationDraft = () => {
    try {
      localStorage.removeItem(PREREG_KEY);
      sessionStorage.removeItem(PREREG_KEY);
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        credits,
        deductCredits,
        addCredits,
        creditTransactions,
        savePreRegistrationDraft,
        getPreRegistrationDraft,
        clearPreRegistrationDraft,
        registrations,
        updateRegistrationStatus,
        allocateCreditsToUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
