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
  refreshUsers: () => Promise<void>;
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

const SEED_REGISTRATIONS: UserProfile[] = [];

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

      // 2. Fallback to cookies (enables cross-subdomain SSO)
      if (!restoredUser && typeof document !== "undefined") {
        const getCookie = (name: string) => {
          const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
          return match ? match[2] : null;
        };

        const cookieSessionRaw = getCookie("dudos_session");
        const cookieToken = getCookie("dudos_at");

        if (cookieSessionRaw && cookieToken && !cookieToken.startsWith("token_")) {
          try {
            const sessionData = safeJsonParse(cookieSessionRaw);
            if (sessionData && sessionData.email) {
              const role = (sessionData.role as StakeholderRole) || "client";
              const config = STAKEHOLDER_CONFIGS[role] || STAKEHOLDER_CONFIGS.client;
              restoredUser = {
                id: sessionData.userId || sessionData.id || "usr_session",
                email: sessionData.email || "",
                username: sessionData.email?.split("@")[0] || "user",
                displayName: sessionData.displayName || sessionData.email?.split("@")[0] || "User",
                role: role,
                status: "approved",
                credits: 0,
                organizationName: sessionData.organizationName || config.title,
                createdAt: new Date().toISOString(),
              };
              restoredRole = role;
              restoredToken = cookieToken;
            }
          } catch {}
        }
      }

      if (restoredUser && restoredRole) {
        setUser(restoredUser);
        setActiveRole(restoredRole);

        // Verify active token against backend database
        if (restoredToken && !restoredToken.startsWith("token_")) {
          const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
          fetch(`${apiBase}/auth/me`, {
            headers: { Authorization: `Bearer ${restoredToken}` }
          })
            .then(async (res) => {
              if (!res.ok) {
                // Backend database was reset or account no longer exists
                setUser(null);
                persistSession(null, "client");
                if (typeof window !== "undefined" && window.location.pathname.includes("/app")) {
                  window.location.href = "/login";
                }
              } else {
                const liveData = await res.json();
                if (liveData) {
                  setUser((prev) => prev ? {
                    ...prev,
                    id: liveData.id,
                    email: liveData.email,
                    displayName: liveData.displayName || prev.displayName,
                    role: liveData.role || prev.role,
                    credits: liveData.credits ?? prev.credits,
                    status: liveData.status || prev.status,
                  } : null);
                }
              }
            })
            .catch(() => {});
        } else {
          // Stale legacy mock token -> clear session
          setUser(null);
          persistSession(null, "client");
          if (typeof window !== "undefined" && window.location.pathname.includes("/app")) {
            window.location.href = "/login";
          }
        }
      }

      const storedTx = localStorage.getItem(TRANSACTIONS_KEY);
      if (storedTx) {
        try {
          const parsed = JSON.parse(storedTx);
          // Purge legacy mock tx_welcome transaction
          const cleanTx = Array.isArray(parsed) ? parsed.filter((t: any) => t && t.id !== "tx_welcome") : [];
          setCreditTransactions(cleanTx);
          localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(cleanTx));
        } catch {
          setCreditTransactions([]);
        }
      } else {
        setCreditTransactions([]);
      }

      // Clean load of registrations directly from PostgreSQL
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
      fetch(`${apiBase}/admin/users`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.users && Array.isArray(data.users)) {
            setRegistrations(data.users);
            try {
              localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(data.users));
            } catch {}
          } else {
            setRegistrations([]);
          }
        })
        .catch(() => {
          setRegistrations([]);
        });
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
        credits: data.user.credits ?? 0,
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
        credits: respData.user.credits ?? 0,
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

      setRegistrations((prev) => {
        const next = [newUser, ...prev.filter((p) => p.id !== newUser.id)];
        try {
          localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });

      clearPreRegistrationDraft();

      showToast.success("Registration successful!", {
        description: "Your workspace has been initialized.",
      });

      return { user: newUser, token: respData.token };
    } catch (e: any) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };



  const refreshUsers = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiBase}/admin/users`);
      if (res.ok) {
        const data = await res.json();
        if (data?.users && Array.isArray(data.users)) {
          setRegistrations(data.users);
          try {
            localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(data.users));
          } catch {}
        }
      }
    } catch {}
  };

  const updateRegistrationStatus = (
    userId: string,
    newStatus: UserStatus,
    quote?: ProjectIntakeData["estimationQuote"]
  ) => {
    // Asynchronously update in PostgreSQL backend
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
      fetch(`${apiBase}/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      }).catch(() => {});
    } catch {}

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
    // Asynchronously update in PostgreSQL backend
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
      fetch(`${apiBase}/admin/users/${userId}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, reason }),
      }).catch(() => {});
    } catch {}

    const updated = registrations.map((r) => {
      if (r.id === userId) {
        return { ...r, credits: (r.credits || 0) + amount };
      }
      return r;
    });

    setRegistrations(updated);
    try {
      localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(updated));
    } catch {}

    if (user && user.id === userId) {
      const updatedUser = { ...user, credits: (user.credits || 0) + amount };
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
  const credits = user?.credits ?? 0;

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
    const currentCredits = user ? user.credits : 0;
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
        refreshUsers,
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
