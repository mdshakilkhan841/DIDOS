"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useAuth } from "@/context/auth-context";

interface LoginClientProps {
  initialMode?: "signin" | "signup";
  returnTo?: string;
}

export function LoginClient({
  initialMode = "signin",
  returnTo = "/app",
}: LoginClientProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const { activeRole } = useAuth();

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Column — DUDOS Brand Panel (Hidden on mobile, 50% width on md+) */}
      <AuthBrandPanel activeRole={activeRole} />

      {/* Right Column — Multi-Stakeholder Auth Form Container */}
      <div className="flex w-full flex-1 flex-col justify-between px-6 py-8 sm:px-12 md:w-1/2 lg:px-16 overflow-y-auto">
        {/* Mobile Header & Top Back Navigation */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-dudos-text-secondary hover:text-dudos-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Portal</span>
          </Link>

          {/* Mobile-only logo */}
          <Link href="/" className="flex items-center gap-1.5 md:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-dudos-primary text-sm font-bold text-white">
              D
            </span>
            <span className="text-sm font-bold text-dudos-navy-900">
              DUDOS<span className="text-dudos-primary">.</span>
            </span>
          </Link>
        </div>

        {/* Center Auth Form */}
        <div className="w-full my-auto py-4">
          {mode === "signin" ? (
            <LoginForm
              returnTo={returnTo}
              onSwitchToRegister={() => setMode("signup")}
            />
          ) : (
            <RegisterForm
              onSwitchToLogin={() => setMode("signin")}
              initialRole={activeRole}
            />
          )}
        </div>

        {/* Bottom subtle copyright / links */}
        <div className="w-full max-w-md mx-auto pt-6 text-center text-xs text-dudos-text-secondary border-t border-dudos-border/60">
          <div className="flex justify-center gap-4">
            <Link href="/legal/privacy" className="hover:text-dudos-primary hover:underline">
              Privacy Notice
            </Link>
            <span>•</span>
            <Link href="/legal/terms" className="hover:text-dudos-primary hover:underline">
              Terms of Governance
            </Link>
            <span>•</span>
            <Link href="/support" className="hover:text-dudos-primary hover:underline">
              Support Desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
