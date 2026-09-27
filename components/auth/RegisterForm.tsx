"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Building, GraduationCap, Briefcase, Shield, Check, ArrowRight } from "lucide-react";
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
}

export function RegisterForm({ onSwitchToLogin, initialRole = "client" }: RegisterFormProps) {
  const router = useRouter();
  const { register, isLoading, savePreRegistrationDraft, getPreRegistrationDraft, clearPreRegistrationDraft } = useAuth();

  const [role, setRole] = useState<StakeholderRole>(initialRole);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Role-specific & Project Intake fields
  const [orgName, setOrgName] = useState("");
  const [identifier, setIdentifier] = useState(""); // Student ID, Staff ID, Trade License
  const [department, setDepartment] = useState("");
  const [businessDomain, setBusinessDomain] = useState("E-Commerce & Digital Business");
  const [targetStack, setTargetStack] = useState("Next.js 16 + FastAPI + PostgreSQL");
  const [projectScope, setProjectScope] = useState("");
  const [referenceUrls, setReferenceUrls] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // Restore pre-registration draft from sessionStorage/localStorage on mount
  useEffect(() => {
    const draft = getPreRegistrationDraft();
    if (draft) {
      if (draft.displayName) setDisplayName(draft.displayName);
      if (draft.username) setUsername(draft.username);
      if (draft.email) setEmail(draft.email);
      if (draft.role) setRole(draft.role);
      if (draft.organizationName) setOrgName(draft.organizationName);
      if (draft.identifier) setIdentifier(draft.identifier);
      if (draft.department) setDepartment(draft.department);
      if (draft.businessDomain) setBusinessDomain(draft.businessDomain);
      if (draft.targetStack) setTargetStack(draft.targetStack);
      if (draft.projectScope) setProjectScope(draft.projectScope);
      if (draft.referenceUrls) setReferenceUrls(draft.referenceUrls);
      setHasRestoredDraft(true);
    }
  }, []);

  // Real-time autosave to localStorage & sessionStorage
  useEffect(() => {
    if (displayName || username || email || orgName || projectScope) {
      savePreRegistrationDraft({
        role,
        displayName,
        username,
        email,
        organizationName: orgName,
        identifier,
        department,
        businessDomain,
        targetStack,
        projectScope,
        referenceUrls,
        savedAt: new Date().toISOString(),
      });
    }
  }, [
    role,
    displayName,
    username,
    email,
    orgName,
    identifier,
    department,
    businessDomain,
    targetStack,
    projectScope,
    referenceUrls,
  ]);

  const handleClearDraft = () => {
    clearPreRegistrationDraft();
    setDisplayName("");
    setUsername("");
    setEmail("");
    setOrgName("");
    setIdentifier("");
    setDepartment("");
    setBusinessDomain("E-Commerce & Digital Business");
    setTargetStack("Next.js 16 + FastAPI + PostgreSQL");
    setProjectScope("");
    setReferenceUrls("");
    setHasRestoredDraft(false);
    showToast.info("Cleared saved registration draft.");
  };

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

    if (!username.trim()) {
      setErrorMsg("Please choose a unique username.");
      showToast.error("Username is required.");
      return;
    }

    if (!email || !email.includes("@")) {
      setErrorMsg("Please provide a valid email address.");
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

    const success = await register({
      email,
      username,
      displayName,
      role,
      organizationName: orgName || STAKEHOLDER_CONFIGS[role].sampleOrgPlaceholder,
      identifier,
      department,
      password,
      intake: {
        businessDomain: businessDomain || "Enterprise Digital Business",
        projectScope: projectScope || "Automated website, portal and digital operations setup.",
        targetStack: targetStack || "Next.js 16 + FastAPI + PostgreSQL",
        referenceUrls: referenceUrls || "",
        submittedAt: new Date().toISOString(),
      },
    });

    if (success) {
      // Admin goes directly to control plane; clients go to the onboarding & verification process gate
      if (role === "admin") {
        router.push("/app/tenant-admin");
      } else {
        router.push("/onboarding");
      }
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

      {/* Free credit activation banner */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-800 mb-4">
        <Check className="h-4 w-4 text-teal-600 shrink-0" />
        <span><strong>Free Registration:</strong> Includes 1,000 complimentary AI Builder credits + dedicated workspace setup.</span>
      </div>

      {/* Restored draft notice */}
      {hasRestoredDraft && (
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 mb-4">
          <span>Draft registration data restored from your session.</span>
          <button
            type="button"
            onClick={handleClearDraft}
            className="font-medium underline hover:text-blue-950 ml-2"
          >
            Clear Draft
          </button>
        </div>
      )}

      {/* Stakeholder Selection Grid */}
      <div className="mb-6">
        <label className="block text-xs font-semibold uppercase tracking-wider text-dudos-text-secondary mb-2">
          Step 1: Choose Your Role
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                placeholder="e.g. Shakil Khan"
                className="pl-9"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="username" required>
              Username
            </Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-dudos-text-secondary">@</span>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="username"
                className="pl-8"
                required
              />
            </div>
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
            <span>{STAKEHOLDER_CONFIGS[role].badge} Specific Information</span>
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
                placeholder={STAKEHOLDER_CONFIGS[role].sampleOrgPlaceholder}
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

        {/* Project Scope & Intake Data Collection */}
        {role !== "admin" && (
          <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/40 space-y-3">
            <div className="text-xs font-semibold text-teal-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-teal-600" />
                <span>Project Scope & Intake Data Collection</span>
              </span>
              <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-mono font-medium">Auto-Saved</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label htmlFor="businessDomain" className="text-xs">Business Domain / Industry</Label>
                <select
                  id="businessDomain"
                  value={businessDomain}
                  onChange={(e) => setBusinessDomain(e.target.value)}
                  className="mt-1 w-full rounded-md border border-dudos-border bg-white px-2.5 py-1.5 text-xs text-dudos-text shadow-sm focus:border-dudos-primary focus:outline-none focus:ring-1 focus:ring-dudos-primary"
                >
                  <option value="E-Commerce & Digital Business">E-Commerce & Retail</option>
                  <option value="Healthcare & Telemedicine">Healthcare & Clinics</option>
                  <option value="Education & Academy">Education & Academy</option>
                  <option value="Logistics & Supply Chain">Logistics & Fleet</option>
                  <option value="SaaS & Cloud Operations">SaaS & Technology</option>
                  <option value="Finance & Enterprise ERP">Enterprise Operations & ERP</option>
                </select>
              </div>

              <div>
                <Label htmlFor="targetStack" className="text-xs">Preferred Target Stack</Label>
                <select
                  id="targetStack"
                  value={targetStack}
                  onChange={(e) => setTargetStack(e.target.value)}
                  className="mt-1 w-full rounded-md border border-dudos-border bg-white px-2.5 py-1.5 text-xs text-dudos-text shadow-sm focus:border-dudos-primary focus:outline-none focus:ring-1 focus:ring-dudos-primary"
                >
                  <option value="Next.js 16 + FastAPI + PostgreSQL">Next.js 16 + FastAPI + PostgreSQL</option>
                  <option value="React 19 + Node.js + PostgreSQL">React 19 + Node.js</option>
                  <option value="WordPress Headless + Next.js">WordPress Headless</option>
                  <option value="Laravel 11 + Vue 3">Laravel 11 + Vue 3</option>
                  <option value="Static HTML5 + Tailwind CSS">Static HTML5 High-Performance</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="projectScope" className="text-xs">Project Scope & Key Deliverables</Label>
              <textarea
                id="projectScope"
                rows={2}
                value={projectScope}
                onChange={(e) => setProjectScope(e.target.value)}
                placeholder="Briefly describe what you are building, key features, user roles, or business goals..."
                className="mt-1 w-full rounded-md border border-dudos-border bg-white px-2.5 py-1.5 text-xs text-dudos-text shadow-sm focus:border-dudos-primary focus:outline-none focus:ring-1 focus:ring-dudos-primary placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="referenceUrls" className="text-xs">Reference URLs / Benchmark Sites (Optional)</Label>
              <Input
                id="referenceUrls"
                value={referenceUrls}
                onChange={(e) => setReferenceUrls(e.target.value)}
                placeholder="e.g. https://example.com, https://dhl.com"
                className="text-xs mt-1"
              />
            </div>
          </div>
        )}

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
