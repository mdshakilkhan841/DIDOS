"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Sparkles,
  Link2,
  Check,
  Send,
  Save,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  Cpu,
  Globe,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/dudos-ui";
import { showToast } from "@/lib/toast";

const COMMON_FEATURES = [
  "Multi-Role Authentication & Access Control",
  "Product Catalog & E-Commerce Cart",
  "Online Payment Gateway (bKash, Nagad, Stripe)",
  "Dynamic ERP / Billing & Quotations",
  "Inventory & Order Tracking",
  "Customer Support Ticketing & Chat",
  "AI Chatbot / Digital Sales Assistant",
  "Facebook Pixel & Ad Engine Integration",
  "Progressive Web App (PWA) Offline Support",
  "Admin Analytics & Sales Reporting",
];

const FRAMEWORKS = [
  { id: "next_fastapi", label: "Next.js 16 + FastAPI (Python)", desc: "High-performance enterprise stack, AI-ready" },
  { id: "react_postgres", label: "React 19 + Node.js + PostgreSQL", desc: "Rapid scalable SaaS architecture" },
  { id: "laravel_vue", label: "Laravel 11 + Livewire / Vue.js", desc: "Robust monolithic ERP and rapid delivery" },
  { id: "wordpress_woo", label: "WordPress + WooCommerce", desc: "Fast traditional content & store management" },
  { id: "flutter_mobile", label: "Flutter Mobile App + Cloud Backend", desc: "Cross-platform iOS and Android app" },
];

export interface CustomProjectData {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  category: string;
  referenceUrl: string;
  businessScope: string;
  selectedFeatures: string[];
  framework: string;
  targetTimeline: string;
  budgetRange: string;
  srsContent: string;
  status: "submitted" | "in_estimation" | "quoted" | "approved" | "in_development" | "completed";
  createdAt: string;
  updatedAt: string;
}

const DRAFT_STORAGE_KEY = "dudos_custom_project_draft";

export function CustomProjectForm({
  lang = "en",
  onSubmitted,
}: {
  lang?: string;
  onSubmitted?: (project: CustomProjectData) => void;
}) {
  const { user, deductCredits } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Information Technology (IT)");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [businessScope, setBusinessScope] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    COMMON_FEATURES[0],
    COMMON_FEATURES[3],
  ]);
  const [framework, setFramework] = useState("next_fastapi");
  const [targetTimeline, setTargetTimeline] = useState("4 weeks");
  const [budgetRange, setBudgetRange] = useState("৳50,000 - ৳150,000");
  const [srsContent, setSrsContent] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore draft from localStorage / sessionStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY) || sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.title) setTitle(d.title);
        if (d.category) setCategory(d.category);
        if (d.referenceUrl) setReferenceUrl(d.referenceUrl);
        if (d.businessScope) setBusinessScope(d.businessScope);
        if (d.selectedFeatures) setSelectedFeatures(d.selectedFeatures);
        if (d.framework) setFramework(d.framework);
        if (d.targetTimeline) setTargetTimeline(d.targetTimeline);
        if (d.budgetRange) setBudgetRange(d.budgetRange);
        if (d.srsContent) setSrsContent(d.srsContent);
        setHasRestoredDraft(true);
      }
    } catch {}
  }, []);

  // Autosave to storage
  useEffect(() => {
    if (title || businessScope || referenceUrl || srsContent) {
      const draft = {
        title,
        category,
        referenceUrl,
        businessScope,
        selectedFeatures,
        framework,
        targetTimeline,
        budgetRange,
        srsContent,
        updatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch {}
    }
  }, [title, category, referenceUrl, businessScope, selectedFeatures, framework, targetTimeline, budgetRange, srsContent]);

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    setTitle("");
    setReferenceUrl("");
    setBusinessScope("");
    setSelectedFeatures([COMMON_FEATURES[0]]);
    setSrsContent("");
    setHasRestoredDraft(false);
    showToast.info("Cleared custom project draft.");
  };

  // AI SRS Generator (consumes 50 credits as per Section 3.2 & 3.3)
  const handleGenerateAiSrs = () => {
    if (!title.trim() && !businessScope.trim()) {
      showToast.warning("Please provide a project title or business scope first.");
      return;
    }

    const deducted = deductCredits(50, "AI Technical SRS Generation");
    if (!deducted) return;

    setIsAiGenerating(true);
    setTimeout(() => {
      const generatedSrs = `# Software Requirements Specification (SRS)
## Project: ${title || "Custom Enterprise Solution"}
**Category:** ${category}
**Prepared For:** ${user?.displayName || "Enterprise Client"} (${user?.organizationName || "Daffodil Group"})
**Target Tech Stack:** ${FRAMEWORKS.find((f) => f.id === framework)?.label || framework}
**Reference Model:** ${referenceUrl || "Custom In-House Architecture"}

### 1. Executive Summary & Business Scope
${businessScope || "The proposed platform delivers an automated, high-availability digital operating system designed to optimize workflows, customer acquisition, and service delivery."}

### 2. Functional Feature Matrix
${selectedFeatures.map((f, i) => `${i + 1}. **${f}**: Full lifecycle implementation with validation, auditing, and responsive interfaces.`).join("\n")}

### 3. Non-Functional Specifications
- **Performance:** Target < 1.0s Largest Contentful Paint (LCP) and zero render-blocking scripts.
- **Security:** Role-based access control (RBAC), CSRF protection, AES-256 data sanitization.
- **Scalability:** Containerized Docker Compose and microservices ready for Kubernetes deployment.
- **Target Launch:** ${targetTimeline}

### 4. Technical Estimation Next Steps
Submitted to System Administrator and Technical Team for framework analysis, man-hour calculation, and formal quotation dispatch.`;

      setSrsContent(generatedSrs);
      setIsAiGenerating(false);
      showToast.success("AI Technical SRS generated successfully!");
    }, 700);
  };

  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast.error("Project title is required.");
      return;
    }

    setIsSubmitting(true);

    const newProject: CustomProjectData = {
      id: "cproj_" + Date.now().toString(36),
      title,
      clientName: user?.displayName || "Client User",
      clientEmail: user?.email || "client@daffodil.family",
      category,
      referenceUrl,
      businessScope,
      selectedFeatures,
      framework,
      targetTimeline,
      budgetRange,
      srsContent: srsContent || "SRS generation pending technical team intake.",
      status: "submitted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save into localStorage projects list
    try {
      const existing = JSON.parse(localStorage.getItem("dudos_custom_projects") || "[]");
      localStorage.setItem("dudos_custom_projects", JSON.stringify([newProject, ...existing]));
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}

    setTimeout(() => {
      setIsSubmitting(false);
      showToast.success("Custom Project Request submitted!", {
        description: "Our Tech Team has received your scope for technical estimation and auto-quotation.",
      });
      onSubmitted?.(newProject);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-dudos-border shadow-sm">
      <div className="border-b border-dudos-border pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-dudos-primary uppercase tracking-wider">
          <Cpu className="h-4 w-4" />
          <span>Section 3.4 · Custom Project Intake & Auto-Quotation</span>
        </div>
        <h2 className="text-xl font-bold text-dudos-text mt-1">
          {lang === "bn" ? "কাস্টম প্রজেক্ট রিকোয়ারমেন্ট সাবমিশন" : "Submit Custom Project Request"}
        </h2>
        <p className="text-xs text-dudos-text-secondary mt-1">
          {lang === "bn"
            ? "আপনার স্পেসিফিকেশন প্রদান করুন। টেকনিক্যাল টিম ম্যান-আওয়ার হিসাব করে স্বয়ংক্রিয় কোটেশন পাঠাবে।"
            : "Define your requirements and features. Our Tech Team will analyze framework selection, man-hours, and dispatch a formal quotation."}
        </p>
      </div>

      {hasRestoredDraft && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
          <span>Draft specifications restored from your current browser session.</span>
          <button
            type="button"
            onClick={handleClearDraft}
            className="font-semibold underline hover:text-blue-950 ml-2"
          >
            Clear Draft
          </button>
        </div>
      )}

      {/* Row 1: Title & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="projectTitle" required>
            {lang === "bn" ? "প্রজেক্টের নাম" : "Project Name"}
          </Label>
          <Input
            id="projectTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Daffodil Health Portal ERP"
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="category">
            {lang === "bn" ? "ব্যবসার শ্রেণি" : "Industry Category"}
          </Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Healthcare, IT, E-Commerce"
            className="mt-1"
          />
        </div>
      </div>

      {/* Reference Website URL */}
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="refUrl">
            {lang === "bn" ? "রেফারেন্স ওয়েবসাইটের লিংক (যদি থাকে)" : "External Reference Website URL (Optional)"}
          </Label>
          <span className="text-[11px] text-dudos-text-secondary">Section 3.2 Layout Replication</span>
        </div>
        <div className="relative mt-1">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dudos-text-secondary" />
          <Input
            id="refUrl"
            type="url"
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            placeholder="https://example.com (URL to replicate specific designs or layouts)"
            className="pl-9 text-xs"
          />
        </div>
        <p className="text-[11px] text-dudos-text-secondary mt-1">
          Provide any competitor or benchmark website URL whose layout and user flow you wish to emulate.
        </p>
      </div>

      {/* Business Scope & Objectives */}
      <div>
        <Label htmlFor="businessScope" required>
          {lang === "bn" ? "ব্যবসায়িক পরিধি ও চাহিদা" : "Business Scope & Requirements"}
        </Label>
        <Textarea
          id="businessScope"
          rows={4}
          value={businessScope}
          onChange={(e) => setBusinessScope(e.target.value)}
          placeholder="Describe your audience, key user workflows, operational pain points, and intended business outcomes..."
          className="mt-1 text-xs"
          required
        />
      </div>

      {/* Feature Selection Grid */}
      <div>
        <Label className="block mb-2">
          {lang === "bn" ? "প্রয়োজনীয় ফিচার তালিকা" : "Required Capabilities & Features"}
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {COMMON_FEATURES.map((feat) => {
            const isChecked = selectedFeatures.includes(feat);
            return (
              <label
                key={feat}
                onClick={() => toggleFeature(feat)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  isChecked
                    ? "border-dudos-primary bg-dudos-surface-mint/50 font-medium text-dudos-text"
                    : "border-dudos-border bg-white text-dudos-text-secondary hover:bg-slate-50"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded flex items-center justify-center border ${
                    isChecked
                      ? "bg-dudos-primary border-dudos-primary text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isChecked && <Check className="h-3 w-3" />}
                </div>
                <span>{feat}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Preferred Framework / Tech Stack */}
      <div>
        <Label className="block mb-2">
          {lang === "bn" ? "পছন্দসই টেক ফ্রেমওয়ার্ক" : "Target Framework / Technology Selection"}
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {FRAMEWORKS.map((fw) => {
            const isSelected = framework === fw.id;
            return (
              <div
                key={fw.id}
                onClick={() => setFramework(fw.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "border-dudos-primary bg-teal-50 ring-1 ring-dudos-primary"
                    : "border-dudos-border bg-white hover:border-slate-300"
                }`}
              >
                <div className="font-semibold text-dudos-text">{fw.label}</div>
                <div className="text-[11px] text-dudos-text-secondary mt-0.5">{fw.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row: Timeline & Budget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="timeline">Target Timeline</Label>
          <Input
            id="timeline"
            value={targetTimeline}
            onChange={(e) => setTargetTimeline(e.target.value)}
            placeholder="e.g. 3-4 weeks"
            className="mt-1 text-xs"
          />
        </div>
        <div>
          <Label htmlFor="budget">Target Budget Range</Label>
          <Input
            id="budget"
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
            placeholder="e.g. ৳50,000 - ৳100,000"
            className="mt-1 text-xs"
          />
        </div>
      </div>

      {/* AI SRS Generator Section */}
      <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-dudos-primary" />
            <span className="font-bold text-xs text-dudos-text">
              {lang === "bn" ? "এআই এসআরএস জেনারেটর" : "AI Technical SRS Generator (Section 3.2)"}
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={isAiGenerating}
            onClick={handleGenerateAiSrs}
            variant="outline"
            className="text-xs bg-white"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1 text-dudos-primary" />
            {isAiGenerating ? "Synthesizing..." : "Generate AI SRS (50 Credits)"}
          </Button>
        </div>
        <p className="text-[11px] text-slate-600">
          If no written specification exists, click above to automatically synthesize an SRS based on your scope and selected features.
        </p>
        {srsContent && (
          <div className="mt-2">
            <Label htmlFor="srsPreview" className="text-xs">Generated Technical Specification</Label>
            <Textarea
              id="srsPreview"
              rows={8}
              value={srsContent}
              onChange={(e) => setSrsContent(e.target.value)}
              className="mt-1 font-mono text-[11px] bg-white"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-dudos-border">
        <Button
          type="button"
          variant="ghost"
          onClick={handleClearDraft}
          className="text-xs text-dudos-text-secondary"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Reset Form
        </Button>

        <Button type="submit" disabled={isSubmitting || !title.trim()}>
          <Send className="h-4 w-4 mr-1.5" />
          {isSubmitting ? "Submitting Request..." : "Submit for Technical Estimation & Quotation"}
        </Button>
      </div>
    </form>
  );
}
