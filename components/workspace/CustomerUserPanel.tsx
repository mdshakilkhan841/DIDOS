"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Building2,
  FolderKanban,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Send,
  Download,
  Plus,
  Coins,
  DollarSign,
  User,
  Sliders,
  Check,
  CreditCard,
  Rocket,
  Edit3,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { showToast } from "@/lib/toast";

const STORAGE_KEY = "dudos_onboarding_draft";
const ACTIVE_DRAFT_KEY = "dudos_active_draft";
const PROJECT_RECORDS_KEY = "dudos_project_records";
const CUSTOM_PROJECTS_KEY = "dudos_custom_projects";
const INVOICES_KEY = "dudos_quotation_invoices";

export interface ActiveProjectDraft {
  id: string;
  title: string;
  organizationName: string;
  contactName: string;
  email: string;
  businessDomain: string;
  projectScope: string;
  siteUrl: string;
  targetStack: string;
  budgetExpectation: string;
  expectedTimeline: string;
  qaAnswers: {
    multiTenant?: string;
    paymentGateway?: string;
    userScale?: string;
    databaseChoice?: string;
  };
  status: "draft" | "submitted" | "in_estimation" | "quoted" | "approved" | "in_development" | "completed";
  savedAt: string;
  updatedAt: string;
}

export function CustomerUserPanel({
  workspace,
  lang = "en",
}: {
  workspace: string;
  lang?: string;
}) {
  const router = useRouter();
  const { user, creditTransactions } = useAuth();

  const [activeDraft, setActiveDraft] = useState<ActiveProjectDraft | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);

  // Modals state
  const [showQaModal, setShowQaModal] = useState(false);
  const [showSrsModal, setShowSrsModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Editable QA Answers state
  const [editableQa, setEditableQa] = useState({
    multiTenant: "yes",
    paymentGateway: "bKash, Nagad & Online Gateway",
    userScale: "10,000 - 50,000 users",
    databaseChoice: "PostgreSQL with Row-Level Security",
  });

  // Load from localStorage on mount
  useEffect(() => {
    loadWorkspaceData();
  }, [user]);

  const loadWorkspaceData = () => {
    try {
      // 1. Load active project draft
      const draftStr = localStorage.getItem(ACTIVE_DRAFT_KEY);
      if (draftStr) {
        const parsed = JSON.parse(draftStr);
        setActiveDraft(parsed);
        if (parsed.qaAnswers) {
          setEditableQa({
            multiTenant: parsed.qaAnswers.multiTenant || "yes",
            paymentGateway: parsed.qaAnswers.paymentGateway || "bKash, Nagad & Online Gateway",
            userScale: parsed.qaAnswers.userScale || "10,000 - 50,000 users",
            databaseChoice: parsed.qaAnswers.databaseChoice || "PostgreSQL with Row-Level Security",
          });
        }
      } else {
        // Fallback: check project records or custom projects
        const recordsStr = localStorage.getItem(PROJECT_RECORDS_KEY);
        if (recordsStr) {
          const list = JSON.parse(recordsStr);
          if (list.length > 0) {
            setActiveDraft(list[0]);
          }
        }
      }

      // 2. Load quotation invoices
      const invStr = localStorage.getItem(INVOICES_KEY);
      if (invStr) {
        const list = JSON.parse(invStr);
        setInvoices(list);
      }

      // 3. Load all custom projects
      const projStr = localStorage.getItem(CUSTOM_PROJECTS_KEY);
      if (projStr) {
        setAllProjects(JSON.parse(projStr));
      }
    } catch {}
  };

  const handleUpdateQaAnswers = () => {
    if (!activeDraft) return;

    const updated: ActiveProjectDraft = {
      ...activeDraft,
      qaAnswers: editableQa,
      updatedAt: new Date().toISOString(),
    };

    setActiveDraft(updated);
    try {
      localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(updated));

      // Also update in PROJECT_RECORDS_KEY
      const existing = localStorage.getItem(PROJECT_RECORDS_KEY);
      if (existing) {
        const list = JSON.parse(existing);
        const nextList = list.map((item: any) =>
          item.id === updated.id ? updated : item
        );
        localStorage.setItem(PROJECT_RECORDS_KEY, JSON.stringify(nextList));
      }
    } catch {}

    setShowQaModal(false);
    showToast.success("AI Q&A Specifications Updated!", {
      description: "Architecture answers have been synchronized with your project draft.",
    });
  };

  const handleConfirmSpecifications = () => {
    if (!activeDraft) return;

    const confirmed: ActiveProjectDraft = {
      ...activeDraft,
      status: "submitted",
      updatedAt: new Date().toISOString(),
    };

    setActiveDraft(confirmed);

    try {
      localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(confirmed));

      // Append/Update in CUSTOM_PROJECTS_KEY for Admin Panel & Project Dashboard visibility
      const existingCustom = JSON.parse(localStorage.getItem(CUSTOM_PROJECTS_KEY) || "[]");
      const customItem = {
        id: confirmed.id,
        title: confirmed.title,
        clientName: confirmed.contactName || user?.displayName || "Customer Client",
        clientEmail: confirmed.email || user?.email || "customer@domain.com",
        category: confirmed.businessDomain,
        referenceUrl: confirmed.siteUrl || "https://daffodil.family",
        businessScope: confirmed.projectScope,
        selectedFeatures: [
          "Multi-Role Authentication & Access Control",
          "Online Payment Gateway (bKash, Nagad, Stripe)",
          editableQa.multiTenant === "yes" ? "Multi-Tenancy Workspace Architecture" : "Single-Tenant Dedicated Instance",
          `Database: ${editableQa.databaseChoice}`,
        ],
        framework: confirmed.targetStack,
        targetTimeline: confirmed.expectedTimeline,
        budgetRange: confirmed.budgetExpectation,
        srsContent: generateSrsMarkdown(confirmed),
        status: "submitted",
        createdAt: confirmed.savedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedCustomList = [
        customItem,
        ...existingCustom.filter((item: any) => item.id !== confirmed.id),
      ];
      localStorage.setItem(CUSTOM_PROJECTS_KEY, JSON.stringify(updatedCustomList));

      // Also update in PROJECT_RECORDS_KEY
      const existing = localStorage.getItem(PROJECT_RECORDS_KEY);
      if (existing) {
        const list = JSON.parse(existing);
        const nextList = list.map((item: any) =>
          item.id === confirmed.id ? confirmed : item
        );
        localStorage.setItem(PROJECT_RECORDS_KEY, JSON.stringify(nextList));
      }
    } catch {}

    showToast.success("Specifications Confirmed & Locked!", {
      description: "Submitted to DUDOS Tech Team for formal technical estimation and quotation.",
    });
  };

  const handleAcceptQuotation = (inv: any) => {
    try {
      const existing = JSON.parse(localStorage.getItem(INVOICES_KEY) || "[]");
      const updated = existing.map((i: any) =>
        i.id === inv.id ? { ...i, status: "paid" } : i
      );
      localStorage.setItem(INVOICES_KEY, JSON.stringify(updated));
      setInvoices(updated);

      if (activeDraft && activeDraft.id === inv.projectId) {
        const nextDraft: ActiveProjectDraft = {
          ...activeDraft,
          status: "approved",
          updatedAt: new Date().toISOString(),
        };
        setActiveDraft(nextDraft);
        localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(nextDraft));
      }

      // Also update in CUSTOM_PROJECTS_KEY
      const customExisting = JSON.parse(localStorage.getItem(CUSTOM_PROJECTS_KEY) || "[]");
      const customUpdated = customExisting.map((p: any) =>
        p.id === inv.projectId ? { ...p, status: "approved" } : p
      );
      localStorage.setItem(CUSTOM_PROJECTS_KEY, JSON.stringify(customUpdated));

      setShowQuotationModal(false);
      showToast.success("Quotation Accepted!", {
        description: "Milestone registered as paid. Project is now approved for build staging.",
      });
    } catch {}
  };

  const generateSrsMarkdown = (draft: ActiveProjectDraft) => {
    return `# Software Requirements Specification (SRS)
## Project: ${draft.title}
**Organization**: ${draft.organizationName}
**Contact**: ${draft.contactName} (${draft.email})
**Domain**: ${draft.businessDomain}
**Target Stack**: ${draft.targetStack}
**Generated Date**: ${new Date(draft.savedAt).toLocaleDateString()}

---

### 1. Executive Summary & Objective
${draft.projectScope}

### 2. Architecture & AI Q&A Final Specifications
- **Multi-Tenancy Isolation**: ${draft.qaAnswers?.multiTenant === "yes" ? "Enabled (Tenant Data Isolation with RLS)" : "Single-Tenant Dedicated"}
- **Payment Gateway Integration**: ${draft.qaAnswers?.paymentGateway || "Standard Online Gateway"}
- **Expected Concurrency**: ${draft.qaAnswers?.userScale || "Standard Web Concurrency"}
- **Database Engine**: ${draft.qaAnswers?.databaseChoice || "PostgreSQL 16"}

### 3. Commercial Scope & Delivery
- **Expected Timeline**: ${draft.expectedTimeline}
- **Budget Expectation**: ${draft.budgetExpectation}
- **Reference URL**: ${draft.siteUrl || "None provided"}

---
*DUDOS Platform & ERP · Daffodil Web & E-Commerce Limited*`;
  };

  const relevantInvoice = invoices.find(
    (inv) =>
      inv.projectId === activeDraft?.id ||
      inv.clientEmail === activeDraft?.email ||
      inv.clientEmail === user?.email
  );

  return (
    <div className="space-y-6">
      {/* 1. Client Identity & Workspace Header */}
      <div className="bg-white rounded-2xl p-6 border border-dudos-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
              <Building2 className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-dudos-text">
              {activeDraft?.organizationName || user?.organizationName || "Customer Workspace"}
            </h1>
            <Badge variant="outline" className="bg-teal-50 text-teal-800 border-teal-300 text-xs">
              Client Workspace
            </Badge>
          </div>
          <p className="text-xs text-dudos-text-secondary">
            Manage your project specifications, AI Q&A scope revisions, quotations, and deployment lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
            <Coins className="h-4 w-4 text-amber-500" />
            <span className="text-dudos-text-secondary">Credits:</span>
            <span className="font-bold text-dudos-text">{user?.credits?.toLocaleString() || 1000}</span>
          </div>

          <Link href="/onboarding">
            <Button size="sm" variant="outline" className="text-xs flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span>{lang === "bn" ? "নতুন খসড়া" : "New Onboarding Request"}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Visual 7-Step Lifecycle Pipeline */}
      <div className="bg-white rounded-2xl p-5 border border-dudos-border shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-dudos-text uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-dudos-primary" />
            <span>Customer Project Lifecycle Pipeline</span>
          </span>
          <span className="text-[11px] text-teal-700 font-mono bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            {activeDraft?.status === "approved"
              ? "Phase 3: Approved & Build Staged"
              : activeDraft?.status === "quoted"
              ? "Phase 2: Formal Quotation Dispatched"
              : activeDraft?.status === "submitted"
              ? "Phase 2: Tech Estimation in Progress"
              : "Phase 1: Draft & AI Q&A Review"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { step: "1", title: "Onboarding Form", desc: "Data Collection", done: true },
            { step: "2", title: "LocalStorage Save", desc: "Auto-Saved", done: true },
            { step: "3", title: "Registration", desc: "Client Account", done: true },
            { step: "4", title: "Draft Fed", desc: "Workspace Draft", done: true },
            {
              step: "5",
              title: "AI-Guided QA",
              desc: "Scope Refined",
              done: !!activeDraft?.qaAnswers,
              active: !activeDraft || activeDraft.status === "draft",
            },
            {
              step: "6",
              title: "Confirm Specs",
              desc: "Approval Gate",
              done: activeDraft?.status !== "draft" && !!activeDraft,
              active: activeDraft?.status === "draft",
            },
            {
              step: "7",
              title: "Tech Estimation",
              desc: "Quotation & Build",
              done: activeDraft?.status === "approved",
              active: activeDraft?.status === "submitted" || activeDraft?.status === "quoted",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-center transition-all ${
                item.done
                  ? "bg-teal-50/60 border-teal-200 text-teal-900"
                  : item.active
                  ? "bg-amber-50/70 border-amber-300 text-amber-900 ring-2 ring-amber-300/40"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                {item.done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                ) : (
                  <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-full bg-white/70">
                    {item.step}
                  </span>
                )}
                <span className="text-xs font-bold truncate">{item.title}</span>
              </div>
              <p className="text-[10px] text-dudos-text-secondary truncate">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Active Project Draft Card */}
      {activeDraft ? (
        <div className="bg-white rounded-2xl p-6 border border-dudos-border shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-dudos-border gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-dudos-primary" />
                <h2 className="text-base font-bold text-dudos-text">{activeDraft.title}</h2>
                <Badge
                  className={
                    activeDraft.status === "approved"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : activeDraft.status === "quoted"
                      ? "bg-purple-100 text-purple-800 border-purple-300"
                      : activeDraft.status === "submitted"
                      ? "bg-teal-100 text-teal-800 border-teal-300"
                      : "bg-amber-100 text-amber-800 border-amber-300"
                  }
                >
                  {activeDraft.status === "approved"
                    ? "Approved & Paid"
                    : activeDraft.status === "quoted"
                    ? "Quotation Dispatched"
                    : activeDraft.status === "submitted"
                    ? "In Tech Estimation"
                    : "Draft (LocalStorage Feed)"}
                </Badge>
              </div>
              <p className="text-xs text-dudos-text-secondary mt-1">
                Saved to browser storage: {new Date(activeDraft.savedAt).toLocaleString()} · ID:{" "}
                <span className="font-mono text-slate-500">{activeDraft.id}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSrsModal(true)}
                className="text-xs flex items-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5 text-dudos-primary" />
                <span>View Generated SRS</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQaModal(true)}
                className="text-xs flex items-center gap-1.5 border-teal-300 text-teal-800 bg-teal-50/50 hover:bg-teal-50"
              >
                <Sliders className="h-3.5 w-3.5 text-teal-700" />
                <span>Refine AI Q&A</span>
              </Button>

              {activeDraft.status === "draft" && (
                <Button
                  size="sm"
                  onClick={handleConfirmSpecifications}
                  className="bg-dudos-primary hover:bg-dudos-primary-hover text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Confirm Specifications</span>
                </Button>
              )}
            </div>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-dudos-text-secondary uppercase tracking-wider block mb-1">
                Business Domain
              </span>
              <p className="text-xs font-bold text-dudos-text">{activeDraft.businessDomain}</p>
              {activeDraft.siteUrl && (
                <a
                  href={activeDraft.siteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-teal-700 hover:underline flex items-center gap-1 mt-1"
                >
                  <span>Ref: {activeDraft.siteUrl}</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-dudos-text-secondary uppercase tracking-wider block mb-1">
                Target Architecture
              </span>
              <p className="text-xs font-bold text-dudos-text">{activeDraft.targetStack}</p>
              <p className="text-[11px] text-dudos-text-secondary mt-1">
                {editableQa.multiTenant === "yes" ? "Multi-Tenant Isolation" : "Single Tenant Instance"}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-dudos-text-secondary uppercase tracking-wider block mb-1">
                Commercial Expectations
              </span>
              <p className="text-xs font-bold text-dudos-text">{activeDraft.budgetExpectation}</p>
              <p className="text-[11px] text-dudos-text-secondary mt-1">
                Timeline: {activeDraft.expectedTimeline}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-dudos-text-secondary uppercase tracking-wider block mb-1">
                Contact Stakeholder
              </span>
              <p className="text-xs font-bold text-dudos-text">{activeDraft.contactName}</p>
              <p className="text-[11px] text-dudos-text-secondary mt-1 font-mono">{activeDraft.email}</p>
            </div>
          </div>

          {/* Business Scope Statement */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-xs">
            <span className="font-semibold text-dudos-text block mb-1">Project Scope Statement:</span>
            <p className="text-dudos-text-secondary leading-relaxed whitespace-pre-wrap">
              {activeDraft.projectScope}
            </p>
          </div>

          {/* AI-Guided Q&A Final Summary Pill */}
          <div className="bg-teal-50/50 border border-teal-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-teal-600 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-teal-950">AI-Guided Q&A Final Specification:</h4>
                <p className="text-[11px] text-teal-800 mt-0.5">
                  Multi-Tenancy: <strong>{editableQa.multiTenant === "yes" ? "Enabled" : "Single Tenant"}</strong> · 
                  Gateways: <strong>{editableQa.paymentGateway}</strong> · 
                  Scale: <strong>{editableQa.userScale}</strong>
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowQaModal(true)}
              className="text-xs bg-white border-teal-300 text-teal-900 hover:bg-teal-100/60"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              <span>Modify Q&A Responses</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 border border-dudos-border shadow-xs text-center space-y-4">
          <FolderKanban className="h-10 w-10 text-dudos-text-secondary mx-auto opacity-40" />
          <div>
            <h3 className="text-base font-bold text-dudos-text">No Active Project Draft Found</h3>
            <p className="text-xs text-dudos-text-secondary max-w-md mx-auto mt-1">
              Start by submitting your project specifications through our customer onboarding form.
              Your data will be automatically saved and fed into this workspace.
            </p>
          </div>
          <Link href="/onboarding">
            <Button size="sm" className="bg-dudos-primary hover:bg-dudos-primary-hover text-white text-xs font-semibold">
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>Start Customer Onboarding Flow</span>
            </Button>
          </Link>
        </div>
      )}

      {/* 4. Dispatched Formal Quotations / Billing Invoices */}
      {relevantInvoice && (
        <div className="bg-white rounded-2xl p-6 border border-dudos-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-dudos-border">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-dudos-text">
                Formal Tech Estimation Quotation ({relevantInvoice.id})
              </h3>
              <Badge
                className={
                  relevantInvoice.status === "paid"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-purple-100 text-purple-800 border-purple-300"
                }
              >
                {relevantInvoice.status === "paid" ? "Quotation Accepted & Paid" : "Quotation Dispatched"}
              </Badge>
            </div>

            <span className="text-xs text-dudos-text-secondary font-mono">
              Dispatched: {new Date(relevantInvoice.dispatchedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-dudos-text-secondary uppercase block mb-0.5">
                Total Man-Hours
              </span>
              <span className="text-base font-bold text-dudos-text font-mono">
                {relevantInvoice.totalHours} hrs
              </span>
              <p className="text-[10px] text-dudos-text-secondary mt-0.5">
                FE: {relevantInvoice.manHours.frontend}h · BE: {relevantInvoice.manHours.backend}h
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-dudos-text-secondary uppercase block mb-0.5">
                Blended Hourly Rate
              </span>
              <span className="text-base font-bold text-dudos-text font-mono">
                ৳{relevantInvoice.hourlyRate.toLocaleString()} / hr
              </span>
              <p className="text-[10px] text-dudos-text-secondary mt-0.5">
                Standard DUDOS Tech Rate
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-dudos-text-secondary uppercase block mb-0.5">
                Infrastructure & Cloud
              </span>
              <span className="text-base font-bold text-dudos-text font-mono">
                ৳{relevantInvoice.infrastructureCost.toLocaleString()}
              </span>
              <p className="text-[10px] text-dudos-text-secondary mt-0.5">PostgreSQL & Staging VPS</p>
            </div>

            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
              <span className="text-[11px] text-emerald-800 uppercase block mb-0.5 font-bold">
                Total Quotation (BDT)
              </span>
              <span className="text-xl font-extrabold text-emerald-700 font-mono">
                ৳{relevantInvoice.totalQuotationBDT.toLocaleString()}
              </span>
              <p className="text-[10px] text-emerald-800 mt-0.5">Includes taxes & margin</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-dudos-text-secondary">
              Quotation approved by DUDOS System Administrator. Acceptance triggers build repository staging.
            </p>
            {relevantInvoice.status !== "paid" ? (
              <Button
                size="sm"
                onClick={() => handleAcceptQuotation(relevantInvoice)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Accept Quotation & Activate Build</span>
              </Button>
            ) : (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 py-1 px-3">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                <span>Development Milestone Active</span>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* 5. SRS Modal Dialog */}
      <Dialog open={showSrsModal} onOpenChange={setShowSrsModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-dudos-primary" />
              <span>Generated Software Requirements Specification (SRS)</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Autonomous SRS generated from your onboarding data and AI-guided Q&A answers.
            </DialogDescription>
          </DialogHeader>

          {activeDraft && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {generateSrsMarkdown(activeDraft)}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(generateSrsMarkdown(activeDraft));
                    showToast.success("SRS copied to clipboard!");
                  }}
                  className="text-xs"
                >
                  Copy Markdown
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowSrsModal(false)}
                  className="bg-dudos-primary text-white text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 6. AI Q&A Refinement Modal Dialog */}
      <Dialog open={showQaModal} onOpenChange={setShowQaModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-dudos-primary" />
              <span>Refine AI-Guided Architecture Q&A</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update answers to automatically recalibrate technical requirements and stack estimations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="font-semibold text-dudos-text">
                Multi-Tenancy & Data Isolation:
              </Label>
              <select
                value={editableQa.multiTenant}
                onChange={(e) => setEditableQa({ ...editableQa, multiTenant: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-dudos-border text-xs bg-white text-dudos-text"
              >
                <option value="yes">Yes - Strict Multi-Tenant Data Isolation (Row-Level Security)</option>
                <option value="no">No - Single-Tenant Dedicated Database</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-dudos-text">
                Primary Payment Gateway Requirement:
              </Label>
              <select
                value={editableQa.paymentGateway}
                onChange={(e) => setEditableQa({ ...editableQa, paymentGateway: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-dudos-border text-xs bg-white text-dudos-text"
              >
                <option value="bKash, Nagad & Online Gateway">bKash, Nagad & Local MFS (Bangladesh)</option>
                <option value="Stripe & Global Credit Cards">Stripe & International Credit Cards (USD / EUR)</option>
                <option value="Dual Currency (bKash + Stripe)">Dual Currency (bKash + Stripe)</option>
                <option value="No Payment Gateway">No Payment Gateway Required (Catalog / Inquiry only)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-dudos-text">
                Expected Daily Active Users & Concurrency:
              </Label>
              <select
                value={editableQa.userScale}
                onChange={(e) => setEditableQa({ ...editableQa, userScale: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-dudos-border text-xs bg-white text-dudos-text"
              >
                <option value="1,000 - 5,000 users">Startup Tier: 1,000 - 5,000 DAU</option>
                <option value="10,000 - 50,000 users">Growth Tier: 10,000 - 50,000 DAU</option>
                <option value="100,000+ users">Enterprise Tier: 100,000+ High-Concurrency Scale</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-dudos-text">
                Database Engine Preference:
              </Label>
              <select
                value={editableQa.databaseChoice}
                onChange={(e) => setEditableQa({ ...editableQa, databaseChoice: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-dudos-border text-xs bg-white text-dudos-text"
              >
                <option value="PostgreSQL with Row-Level Security">PostgreSQL 16 (Recommended for RLS & FastAPI)</option>
                <option value="Supabase / Cloud Managed PG">Supabase Managed Cloud Postgres</option>
                <option value="MySQL 8.0">MySQL 8.0 Enterprise</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-dudos-border">
            <Button size="sm" variant="ghost" onClick={() => setShowQaModal(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpdateQaAnswers}
              className="bg-dudos-primary hover:bg-dudos-primary-hover text-white text-xs font-semibold"
            >
              Save Specifications
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
