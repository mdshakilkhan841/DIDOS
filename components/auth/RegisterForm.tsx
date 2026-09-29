"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Building, GraduationCap, Briefcase, Shield, ArrowRight } from "lucide-react";
import { StakeholderRole, STAKEHOLDER_CONFIGS } from "@/types/auth";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Notice } from "@/components/ui/notice";
import { StakeholderSelector } from "@/components/auth/StakeholderSelector";
import { showToast } from "@/lib/toast";

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
  initialRole?: StakeholderRole;
  returnTo?: string;
}

export function RegisterForm({ onSwitchToLogin, initialRole = "client", returnTo }: RegisterFormProps) {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [role, setRole] = useState<StakeholderRole>(initialRole);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Role-specific fields
  const [orgName, setOrgName] = useState("");
  const [identifier, setIdentifier] = useState(""); // Student ID, Staff ID, Trade License
  const [department, setDepartment] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const strengthColors = ["bg-gray-200", "bg-dudos-error", "bg-dudos-warning", "bg-dudos-primary", "bg-dudos-success"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!displayName.trim()) {
      setErrorMsg("Please enter your full name.");
      showToast.error("Full name is required.");
      return;
    }

    if (!email || !email.includes("@")) {
      setErrorMsg("Please provide a valid corporate or academic email.");
      showToast.error("Invalid email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      showToast.error("Password must be 8+ characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      showToast.error("Password confirmation does not match.");
      return;
    }

    if (!termsAccepted) {
      setErrorMsg("Please agree to the DUDOS Terms of Service and Privacy Policy.");
      showToast.warning("Agreement to terms is required.");
      return;
    }

    const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "_");

    const success = await register({
      email,
      username,
      displayName,
      role,
      organizationName: orgName || "",
      identifier,
      department,
      password,
    });

    if (success) {
      const destination = returnTo || STAKEHOLDER_CONFIGS[role]?.recommendedRoute || "/app";
      router.push(destination);
    } else {
      setErrorMsg("Registration could not be completed. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Title */}
      <div className="mb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-dudos-text">
          Create DUDOS Account
        </h2>
        <p className="mt-1 text-sm text-dudos-text-secondary">
          Join the Daffodil Unified Digital Operating System ecosystem.
        </p>
      </div>

      {/* Stakeholder Selection Grid */}
      <div className="mb-6">
        <label className="block text-xs font-semibold uppercase tracking-wider text-dudos-text-secondary mb-2">
          Step 1: Choose Your Stakeholder Profile
        </label>
        <StakeholderSelector
          selectedRole={role}
          onSelect={(r) => {
            setRole(r);
            setErrorMsg("");
          }}
          variant="grid"
        />
      </div>

      {errorMsg && (
        <div className="mb-4">
          <Notice tone="error">{errorMsg}</Notice>
        </div>
      )}

      {/* Form Details */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="displayName" required>
            Full Name
          </Label>
          <div className="relative mt-1.5">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dudos-text-secondary" />
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Dr. Sabrina Khan or Shakil Ahmed"
              className="pl-9"
              required
            />
          </div>
        </div>

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
              placeholder={
                role === "academy"
                  ? "student.id@daffodilvarsity.edu.bd"
                  : "work.email@organization.com"
              }
              className="pl-9"
              required
            />
          </div>
        </div>

        {/* Stakeholder Specific Attributes */}
        <div className="p-3.5 rounded-xl border border-dudos-border bg-dudos-surface/70 space-y-3">
          <div className="text-xs font-semibold text-dudos-primary flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            <span>{STAKEHOLDER_CONFIGS[role]?.badge || "Role"} Specific Information</span>
          </div>

          <div>
            <Label htmlFor="orgName">
              {role === "academy"
                ? "University / Institution"
                : role === "client"
                ? "Organization / Enterprise Name"
                : role === "merchant"
                ? "Store / Trading Name"
                : role === "partner"
                ? "Agency / Company Name"
                : "Department / Operating Unit"}
            </Label>
            <div className="relative mt-1">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dudos-text-secondary" />
              <Input
                id="orgName"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder={STAKEHOLDER_CONFIGS[role]?.sampleOrgPlaceholder}
                className="pl-9 text-xs"
              />
            </div>
          </div>

          {(role === "academy" || role === "staff") && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="identifier">
                  {role === "academy" ? "Student/Faculty ID" : "Employee ID"}
                </Label>
                <div className="relative mt-1">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dudos-text-secondary" />
                  <Input
                    id="identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 211-15-4321"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <div className="relative mt-1">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dudos-text-secondary" />
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. CSE / SWE / IT"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="password" required>
              Password
            </Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dudos-text-secondary" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars"
                className="pl-9 text-xs"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="confirmPassword" required>
              Confirm
            </Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dudos-text-secondary" />
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="pl-9 text-xs"
                required
              />
            </div>
          </div>
        </div>

        {/* Password Strength Meter */}
        {password && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-dudos-text-secondary">
              <span>Password Security</span>
              <span className="font-semibold text-dudos-text">{strengthLabels[strength]}</span>
            </div>
            <div className="grid grid-cols-4 gap-1 h-1.5">
              {[0, 1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-full rounded-full transition-all ${
                    strength > step ? strengthColors[strength] : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        <label className="flex items-start gap-2.5 text-xs text-dudos-text-secondary cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="rounded border-dudos-border text-dudos-primary focus:ring-dudos-focus h-4 w-4 mt-0.5"
            required
          />
          <span className="leading-snug">
            I agree to the{" "}
            <a href="/legal/terms" className="text-dudos-primary underline hover:text-dudos-primary-hover">
              DUDOS Platform Terms
            </a>{" "}
            and{" "}
            <a href="/legal/privacy" className="text-dudos-primary underline hover:text-dudos-primary-hover">
              Privacy Policy
            </a>
            .
          </span>
        </label>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full mt-2"
        >
          <span>Complete Registration</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </form>

      {/* Switch to Sign In */}
      <div className="mt-6 pt-5 border-t border-dudos-border text-center text-sm text-dudos-text-secondary">
        Already have a DUDOS account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-dudos-primary hover:underline cursor-pointer"
        >
          Sign in here
        </button>
      </div>
    </div>
  );
}
