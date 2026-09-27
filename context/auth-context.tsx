"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { StakeholderRole, UserProfile, STAKEHOLDER_CONFIGS } from "@/types/auth";
import { showToast } from "@/lib/toast";

interface AuthContextType {
  user: UserProfile | null;
  activeRole: StakeholderRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role?: StakeholderRole) => Promise<boolean>;
  register: (data: Partial<UserProfile> & { password?: string }) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: StakeholderRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "dudos_auth_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<StakeholderRole>("client");
  const [isLoading, setIsLoading] = useState(true);

  // Restore saved session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user && parsed.activeRole) {
          setUser(parsed.user);
          setActiveRole(parsed.activeRole);
        }
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
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  };

  const login = async (email: string, preferredRole?: StakeholderRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulated dynamic authentication
      await new Promise((res) => setTimeout(res, 600));

      const role = preferredRole || activeRole;
      const config = STAKEHOLDER_CONFIGS[role];

      const authenticatedUser: UserProfile = {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        email,
        displayName: email.split("@")[0].replace(/[._]/g, " "),
        role,
        organizationName: config.title,
        createdAt: new Date().toISOString(),
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

  const register = async (data: Partial<UserProfile> & { password?: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 700));

      const role = data.role || activeRole;
      const config = STAKEHOLDER_CONFIGS[role];

      const newUser: UserProfile = {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        email: data.email || "",
        displayName: data.displayName || "New Member",
        role,
        organizationName: data.organizationName,
        phone: data.phone,
        identifier: data.identifier,
        department: data.department,
        createdAt: new Date().toISOString(),
      };

      setUser(newUser);
      setActiveRole(role);
      persistSession(newUser, role);

      showToast.success("Account created successfully!", {
        description: `Registered as ${config.title}.`,
      });

      return true;
    } catch (e: any) {
      showToast.error("Registration failed", { description: e.message || "Could not complete account creation." });
      return false;
    } finally {
      setIsLoading(false);
    }
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
    showToast.info(`Switched view to ${STAKEHOLDER_CONFIGS[newRole].title}`);
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
