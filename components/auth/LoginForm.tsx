"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles } from "lucide-react";
import { StakeholderRole, STAKEHOLDER_CONFIGS } from "@/types/auth";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Notice } from "@/components/ui/notice";
import { StakeholderSelector } from "@/components/auth/StakeholderSelector";
import { showToast } from "@/lib/toast";

interface LoginFormProps {
  returnTo?: string;
  onSwitchToRegister?: () => void;
}

export function LoginForm({ returnTo, onSwitchToRegister }: LoginFormProps) {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [selectedRole, setSelectedRole] = useState<StakeholderRole>("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRoleChange = (role: StakeholderRole) => {
    setSelectedRole(role);
    setErrorMsg("");
  };

  const handleFillDemo = () => {
    const demos: Record<StakeholderRole, string> = {
      client: "client.lead@enterprise.com",
      admin: "admin.tech@daffodil.family",
      staff: "ops.technician@daffodil.family",
      merchant: "store.manager@daffodilgadgets.com",
      partner: "agency.partner@diuconnect.com",
      academy: "student.cse@daffodilvarsity.edu.bd",
      executive: "governance@daffodil.family",
    };
    setEmail(demos[selectedRole] || "client.lead@enterprise.com");
    setPassword("DudosPass2026!");
    setErrorMsg("");
    showToast.info(`Filled demo credentials for ${STAKEHOLDER_CONFIGS[selectedRole]?.title || selectedRole}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your email address or username.");
      showToast.error("Email or username is required.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      showToast.error("Password is too short.");
      return;
    }

    const success = await login(email, selectedRole);
    if (success) {
      const target = returnTo || STAKEHOLDER_CONFIGS[selectedRole].recommendedRoute;
      router.push(target);
    } else {
      setErrorMsg("Invalid credentials. Please verify your email and password.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-dudos-text">
          Sign in to DUDOS
        </h2>
        <p className="mt-1.5 text-sm text-dudos-text-secondary">
          Select your stakeholder profile and enter your credentials.
        </p>
      </div>

      {/* Stakeholder Selector */}
      <div className="mb-6">
        <StakeholderSelector
          selectedRole={selectedRole}
          onSelect={handleRoleChange}
          variant="tabs"
        />
      </div>

      {/* Demo Credentials Quick Fill Button */}
      <div className="mb-4 flex items-center justify-between p-2.5 rounded-lg border border-dudos-primary/20 bg-dudos-surface-mint/60">
        <div className="flex items-center gap-2 text-xs text-dudos-primary font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Quick Test: Fill {STAKEHOLDER_CONFIGS[selectedRole].badge} Demo</span>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="text-xs font-semibold text-dudos-primary underline hover:text-dudos-primary-hover cursor-pointer"
        >
          Auto-fill
        </button>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-4">
          <Notice tone="error">{errorMsg}</Notice>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" required>
            Email Address
          </Label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dudos-text-secondary" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@organization.com"
              className="pl-9"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password" required>
              Password
            </Label>
            <a
              href="/forgot-password"
              className="text-xs text-dudos-primary hover:text-dudos-primary-hover hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dudos-text-secondary" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-9 pr-9"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dudos-text-secondary hover:text-dudos-text cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-dudos-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-dudos-border text-dudos-primary focus:ring-dudos-focus h-4 w-4"
            />
            <span>Remember this device</span>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full mt-2"
        >
          <span>Sign In as {STAKEHOLDER_CONFIGS[selectedRole].title.split("/")[0]}</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </form>

      {/* Switch to Register */}
      <div className="mt-6 pt-6 border-t border-dudos-border text-center text-sm text-dudos-text-secondary">
        Don&apos;t have an account yet?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-semibold text-dudos-primary hover:underline cursor-pointer"
        >
          Create your account
        </button>
      </div>
    </div>
  );
}
