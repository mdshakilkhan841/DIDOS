"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  StakeholderRole,
  UserProfile,
  PreRegistrationDraft,
  STAKEHOLDER_CONFIGS,
  UserStatus,
  ProjectIntakeData,
} from "@/types/auth";
import { showToast } from "@/lib/toast";

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
  login: (identifier: string, role?: StakeholderRole) => Promise<boolean>;
  register: (data: Partial<UserProfile> & { password?: string }) => Promise<boolean>;
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
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user && parsed.activeRole) {
          setUser(parsed.user);
          setActiveRole(parsed.activeRole);
          try {
            document.cookie = `dudos_session=${encodeURIComponent(JSON.stringify({ userId: parsed.user.id, displayName: parsed.user.displayName, email: parsed.user.email, role: parsed.user.role }))}; path=/; max-age=2592000; SameSite=Lax`;
            document.cookie = `dudos_at=token_${parsed.user.id}; path=/; max-age=2592000; SameSite=Lax`;
          } catch {}
        }
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
  const persistSession = (u: UserProfile | null, r: StakeholderRole) => {
    try {
      if (u) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u, activeRole: r }));
        try {
          document.cookie = `dudos_session=${encodeURIComponent(JSON.stringify({ userId: u.id, displayName: u.displayName, email: u.email, role: u.role }))}; path=/; max-age=2592000; SameSite=Lax`;
          document.cookie = `dudos_at=token_${u.id}; path=/; max-age=2592000; SameSite=Lax`;
        } catch {}
      } else {
        localStorage.removeItem(STORAGE_KEY);
        try {
          document.cookie = `dudos_session=; path=/; max-age=0; SameSite=Lax`;
          document.cookie = `dudos_at=; path=/; max-age=0; SameSite=Lax`;
        } catch {}
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  };

  const login = async (identifier: string, preferredRole?: StakeholderRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 500));

      const role = preferredRole || activeRole;
      const config = STAKEHOLDER_CONFIGS[role] || STAKEHOLDER_CONFIGS.client;
      const cleanUsername = identifier.includes("@") ? identifier.split("@")[0] : identifier;

      // Check if this username/email exists in registrations
      const existing = registrations.find(
        (r) => r.username.toLowerCase() === cleanUsername.toLowerCase() || r.email.toLowerCase() === identifier.toLowerCase()
      );

      const authenticatedUser: UserProfile = {
        id: existing?.id || "usr_" + Math.random().toString(36).substring(2, 9),
        email: existing?.email || (identifier.includes("@") ? identifier : `${identifier}@daffodil.family`),
        username: cleanUsername,
        displayName: existing?.displayName || cleanUsername.replace(/[._]/g, " "),
        role,
        status: existing?.status || (role === "admin" ? "active" : "pending_review"),
        credits: existing?.credits ?? user?.credits ?? 1000,
        organizationName: existing?.organizationName || config.title,
        createdAt: existing?.createdAt || new Date().toISOString(),
        intake: existing?.intake,
      };

      setUser(authenticatedUser);
      setActiveRole(role);
      persistSession(authenticatedUser, role);

      showToast.success(`Welcome back, ${authenticatedUser.displayName}!`, {
        description: `Signed in as ${config.title}.`,
      });

      return true;
    } catch (e: any) {
      showToast.error("Sign-in failed", { description: e.message || "An unexpected error occurred." });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Partial<UserProfile> & { password?: string; intake?: ProjectIntakeData }): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 600));

      const role = data.role || activeRole;
      const config = STAKEHOLDER_CONFIGS[role] || STAKEHOLDER_CONFIGS.client;
      const username = data.username || (data.email ? data.email.split("@")[0] : "user_" + Math.random().toString(36).slice(2, 6));

      const newUser: UserProfile = {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        email: data.email || "",
        username,
        displayName: data.displayName || username,
        role,
        status: role === "admin" ? "active" : "pending_review",
        credits: 1000, // 1000 credits package bonus on registration
        organizationName: data.organizationName,
        phone: data.phone,
        identifier: data.identifier,
        department: data.department,
        createdAt: new Date().toISOString(),
        intake: data.intake || {
          businessDomain: "General Digital Transformation",
          projectScope: "Standard client onboarding & workspace initialization.",
          targetStack: "Next.js 16 + FastAPI + PostgreSQL",
          submittedAt: new Date().toISOString(),
        },
      };

      setUser(newUser);
      setActiveRole(role);
      persistSession(newUser, role);

      // Record in registrations queue
      const updatedRegs = [newUser, ...registrations.filter((r) => r.id !== newUser.id)];
      setRegistrations(updatedRegs);
      try {
        localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(updatedRegs));
      } catch {}

      // Record welcome credits transaction
      const welcomeTx: CreditTransaction = {
        id: "tx_" + Date.now().toString(36),
        amount: 1000,
        type: "credit",
        reason: "Registration Bonus: 1,000 credits granted",
        timestamp: new Date().toISOString(),
      };
      const updatedTx = [welcomeTx, ...creditTransactions];
      setCreditTransactions(updatedTx);
      try {
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTx));
      } catch {}

      // Clear pre-registration draft upon successful registration
      clearPreRegistrationDraft();

      showToast.success("Registration submitted successfully!", {
        description: `Your intake has been logged for technical review. 1,000 welcome credits granted.`,
      });

      return true;
    } catch (e: any) {
      showToast.error("Registration failed", { description: e.message || "Could not complete account creation." });
      return false;
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

  const logout = () => {
    setUser(null);
    persistSession(null, activeRole);
    showToast.info("Signed out successfully.");
  };

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
