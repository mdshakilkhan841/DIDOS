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
  Server,
  Zap,
  Phone,
  Globe,
  ShieldCheck,
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
import { CreditWalletModal } from "@/components/billing/CreditWalletModal";
import { ManagedDeploymentModal } from "@/components/projects/ManagedDeploymentModal";
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
  status: "draft" | "submitted" | "in_estimation" | "quoted" | "approved" | "in_development" | "deploying" | "completed" | "live";
  domainName?: string;
  liveUrl?: string;
  vpsIp?: string;
  deployedAt?: string;
  buildId?: string;
  devscopeStatus?: string;
  previewUrl?: string;
  deploymentTicket?: any;
  quotationInvoice?: any;
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
  const { user, creditTransactions, deductCredits, addCredits } = useAuth();

  const [activeDraft, setActiveDraft] = useState<ActiveProjectDraft | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [deploymentTickets, setDeploymentTickets] = useState<any[]>([]);

  // Modals state
  const [showQaModal, setShowQaModal] = useState(false);
  const [showSrsModal, setShowSrsModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "card" | "credits" | "bank">("bkash");
  const [mfsPhone, setMfsPhone] = useState("01711000000");

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

      // 2. Load quotation invoices (supports both dudos_quotation_invoices and dudos_invoices)
      const invStr = localStorage.getItem(INVOICES_KEY) || localStorage.getItem("dudos_invoices");
      if (invStr) {
        const list = JSON.parse(invStr);
        setInvoices(list);
      }

      // 3. Load all custom projects
      const projStr = localStorage.getItem(CUSTOM_PROJECTS_KEY);
      if (projStr) {
        setAllProjects(JSON.parse(projStr));
      }

      // 4. Load deployment tickets
      const depStr = localStorage.getItem("dudos_deployment_tickets");
      if (depStr) {
        setDeploymentTickets(JSON.parse(depStr));
      }
    } catch {}
  };

  const handleSimulateDeployLive = () => {
    if (!activeDraft) return;
    const domain = activeDraft.domainName || "portal.daffodil.family";
    const vpsIp = activeDraft.vpsIp || "103.145.118.42";
    const liveUrl = `https://${domain}`;
    const now = new Date().toISOString();

    const completedDraft: ActiveProjectDraft = {
      ...activeDraft,
      status: "completed",
      domainName: domain,
      liveUrl,
      vpsIp,
      deployedAt: now,
      updatedAt: now,
    };
    setActiveDraft(completedDraft);

    try {
      localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(completedDraft));

      // Update deployment tickets
      const depStr = localStorage.getItem("dudos_deployment_tickets");
      if (depStr) {
        const tickets = JSON.parse(depStr);
        const updatedTickets = tickets.map((t: any) =>
          t.projectId === activeDraft.id || t.domainName === domain
            ? { ...t, status: "live", dnsStatus: "verified", liveUrl, assignedIp: vpsIp, deployedAt: now }
            : t
        );
        localStorage.setItem("dudos_deployment_tickets", JSON.stringify(updatedTickets));
        setDeploymentTickets(updatedTickets);
      }

      // Update custom projects
      const projStr = localStorage.getItem(CUSTOM_PROJECTS_KEY);
      if (projStr) {
        const projs = JSON.parse(projStr);
        const updated = projs.map((p: any) =>
          p.id === activeDraft.id
            ? { ...p, status: "completed", liveUrl, vpsIp, deployedAt: now, updatedAt: now }
            : p
        );
        localStorage.setItem(CUSTOM_PROJECTS_KEY, JSON.stringify(updated));
      }
    } catch {}

    showToast.success("Production Deployment Verified & Live! 🚀", {
      description: `${domain} is now live with 256-bit SSL on Daffodil Cloud Linux VPS (${vpsIp}).`,
    });
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

  // Phase 3: Standard Credit Package Build Activation
  const handleActivateViaCredits = () => {
    if (!activeDraft) return;
    const currentCredits = user?.credits ?? 0;
    if (currentCredits < 1000) {
      showToast.error("Insufficient Credits", {
        description: "You need 1,000 credits to activate autonomous build staging. Please top up your wallet.",
      });
      setShowCreditModal(true);
      return;
    }

    const deducted = deductCredits(1000, `Autonomous Build Staging for "${activeDraft.title}"`);
    if (!deducted) return;

    const approvedDraft: ActiveProjectDraft = {
      ...activeDraft,
      status: "approved",
      updatedAt: new Date().toISOString(),
    };
    setActiveDraft(approvedDraft);

    try {
      localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(approvedDraft));

      const existingCustom = JSON.parse(localStorage.getItem(CUSTOM_PROJECTS_KEY) || "[]");
      const updatedCustom = existingCustom.map((p: any) =>
        p.id === activeDraft.id ? { ...p, status: "approved" } : p
      );
      localStorage.setItem(CUSTOM_PROJECTS_KEY, JSON.stringify(updatedCustom));
    } catch {}

    // Trigger internal DevScope builder bridge
    fetch('/api/devscope', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: activeDraft.id,
        name: activeDraft.title,
        requirements: activeDraft.projectScope,
        srs: generateSrsMarkdown(activeDraft),
        tech_stack: activeDraft.targetStack,
        database: activeDraft.qaAnswers?.databaseChoice || 'PostgreSQL',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.result) {
          const withBuildId: ActiveProjectDraft = {
            ...approvedDraft,
            buildId: data.result.build_id,
            devscopeStatus: data.result.customer_status,
            previewUrl: `http://localhost:8000/preview/${data.result.build_id}`,
          };
          setActiveDraft(withBuildId);
          try {
            localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(withBuildId));
          } catch {}
        }
      })
      .catch((err) => console.error('DevScope build trigger error:', err));

    showToast.success("Build Phase Activated via Credits!", {
      description: "1,000 credits deducted. Project approved and queued in DevScope AI Builder.",
    });
  };

  // Phase 3: Simulate Admin Quotation Dispatch (for testing the 'Pricing if not exist' workflow)
  const handleSimulateAdminQuotation = () => {
    if (!activeDraft) return;

    const simulatedInvoice = {
      id: "inv_" + Date.now().toString(36),
      projectId: activeDraft.id,
      projectTitle: activeDraft.title,
      clientEmail: activeDraft.email || user?.email || "customer@domain.com",
      framework: activeDraft.targetStack,
      manHours: {
        frontend: 40,
        backend: 56,
        qa: 20,
        devops: 14,
      },
      totalHours: 130,
      hourlyRate: 1200,
      laborCost: 156000,
      infrastructureCost: 14000,
      profitMarginPercent: 20,
      totalQuotationBDT: 204000,
      status: "dispatched",
      dispatchedAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem(INVOICES_KEY) || "[]");
      const updated = [simulatedInvoice, ...existing.filter((i: any) => i.id !== simulatedInvoice.id)];
      localStorage.setItem(INVOICES_KEY, JSON.stringify(updated));
      setInvoices(updated);

      const quotedDraft: ActiveProjectDraft = {
        ...activeDraft,
        status: "quoted",
        updatedAt: new Date().toISOString(),
      };
      setActiveDraft(quotedDraft);
      localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(quotedDraft));

      const customExisting = JSON.parse(localStorage.getItem(CUSTOM_PROJECTS_KEY) || "[]");
      const customUpdated = customExisting.map((p: any) =>
        p.id === activeDraft.id ? { ...p, status: "quoted" } : p
      );
      localStorage.setItem(CUSTOM_PROJECTS_KEY, JSON.stringify(customUpdated));

      showToast.success("Formal Technical Quotation Dispatched!", {
        description: `Tech Team dispatched Invoice ${simulatedInvoice.id} for ৳204,000 (130 man-hours).`,
      });
    } catch {}
  };

  // Phase 3: Confirm Payment for Formal Quotation
  const handleConfirmQuotationPayment = () => {
    if (!relevantInvoice) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      try {
        if (paymentMethod === "credits") {
          const deducted = deductCredits(1000, `Quotation Milestone Payment for "${relevantInvoice.projectTitle}"`);
          if (!deducted) {
            setIsProcessingPayment(false);
            return;
          }
        }

        const existing = JSON.parse(localStorage.getItem(INVOICES_KEY) || "[]");
        const updated = existing.map((i: any) =>
          i.id === relevantInvoice.id ? { ...i, status: "paid" } : i
        );
        localStorage.setItem(INVOICES_KEY, JSON.stringify(updated));
        setInvoices(updated);

        if (activeDraft) {
          const nextDraft: ActiveProjectDraft = {
            ...activeDraft,
            status: "approved",
            updatedAt: new Date().toISOString(),
          };
          setActiveDraft(nextDraft);
          localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(nextDraft));
        }

        const customExisting = JSON.parse(localStorage.getItem(CUSTOM_PROJECTS_KEY) || "[]");
        const customUpdated = customExisting.map((p: any) =>
          p.id === relevantInvoice.projectId ? { ...p, status: "approved" } : p
        );
        localStorage.setItem(CUSTOM_PROJECTS_KEY, JSON.stringify(customUpdated));

        setShowPaymentModal(false);
        setIsProcessingPayment(false);
        showToast.success("Quotation Milestone Paid & Verified!", {
          description: `Payment recorded via ${paymentMethod.toUpperCase()}. Project moved to Build & Deploy staging.`,
        });
      } catch {
        setIsProcessingPayment(false);
      }
    }, 600);
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
      {/* 1. Client Identity & Workspace Header - Authentic DUDOS Template */}
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            <span />
            {lang === "bn" ? "ক্লায়েন্ট ওয়ার্কস্পেস" : "CLIENT WORKSPACE"}
          </p>
          <h1>
            {activeDraft?.organizationName || user?.organizationName || "Customer Workspace"}
          </h1>
          <p>
            {lang === "bn"
              ? "প্রজেক্ট স্পেসিফিকেশন, এআই কিউঅ্যান্ডএ স্কোপ রিভিশন, কোটেশন ও ডিপ্লয়মেন্ট পরিচালনা করুন।"
              : "Manage your project specifications, AI Q&A scope revisions, quotations, and deployment lifecycles."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Clickable Credit Wallet Button */}
          <button
            onClick={() => setShowCreditModal(true)}
            className="bg-[#f0f4f6] hover:bg-[#e4ebef] border border-[#dce5e9] rounded-lg px-3 py-2 flex items-center gap-2 text-xs transition-colors cursor-pointer group"
            title="Click to view Credit Wallet & Packages"
          >
            <Coins className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="text-[#5b6f7b]">Wallet:</span>
            <span className="font-bold text-[#162c38]">
              {user?.credits?.toLocaleString() || 1000}
            </span>
            <span className="text-[10px] text-[#087f79] font-semibold bg-[#edf7f4] px-1.5 py-0.5 rounded border border-[#c2e2dc] ml-1">
              + Top Up
            </span>
          </button>

          <Link href="/onboarding">
            <Button
              size="sm"
              variant="outline"
              className="text-xs flex items-center gap-1.5 bg-white border-[#dce5e9] text-[#162c38] hover:bg-[#f4f7f8]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{lang === "bn" ? "নতুন খসড়া" : "New Onboarding Request"}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Visual 8-Step Lifecycle Pipeline */}
      <div className="bg-white rounded-xl p-5 border border-[#dce5e9] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-dudos-text uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-dudos-primary" />
            <span>Customer Project Lifecycle Pipeline</span>
          </span>
          <span className="text-[11px] text-teal-700 font-mono bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            {activeDraft?.status === "completed" || activeDraft?.status === "live"
              ? "Phase 4: Live in Production 🚀"
              : activeDraft?.status === "deploying"
              ? "Phase 4: Managed Deployment In Progress"
              : activeDraft?.status === "approved"
              ? "Phase 3: Approved & Build Staged"
              : activeDraft?.status === "quoted"
              ? "Phase 2: Formal Quotation Dispatched"
              : activeDraft?.status === "submitted"
              ? "Phase 2: Tech Estimation in Progress"
              : "Phase 1: Draft & AI Q&A Review"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {[
            { step: "1", title: "Onboarding Form", desc: "Data Collection", done: true },
            { step: "2", title: "LocalStorage", desc: "Auto-Saved", done: true },
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
              title: "Billing & Pricing",
              desc: "Quotation / Credits",
              done: activeDraft?.status === "approved" || activeDraft?.status === "deploying" || activeDraft?.status === "completed" || activeDraft?.status === "live",
              active: activeDraft?.status === "submitted" || activeDraft?.status === "quoted",
            },
            {
              step: "8",
              title: "Build & Deploy",
              desc:
                activeDraft?.status === "completed" || activeDraft?.status === "live"
                  ? "Live in Production"
                  : activeDraft?.status === "deploying"
                  ? "VPS Provisioning"
                  : "Staging Ready",
              done: activeDraft?.status === "completed" || activeDraft?.status === "live",
              active: activeDraft?.status === "approved" || activeDraft?.status === "deploying",
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
        <div className="bg-white rounded-xl p-6 border border-[#dce5e9] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#dce5e9] gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-dudos-primary" />
                <h2 className="text-base font-bold text-dudos-text">{activeDraft.title}</h2>
                <Badge
                  className={
                    activeDraft.status === "completed" || activeDraft.status === "live"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : activeDraft.status === "deploying"
                      ? "bg-teal-100 text-teal-800 border-teal-300"
                      : activeDraft.status === "approved"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : activeDraft.status === "quoted"
                      ? "bg-purple-100 text-purple-800 border-purple-300"
                      : activeDraft.status === "submitted"
                      ? "bg-teal-100 text-teal-800 border-teal-300"
                      : "bg-amber-100 text-amber-800 border-amber-300"
                  }
                >
                  {activeDraft.status === "completed" || activeDraft.status === "live"
                    ? "Live in Production 🚀"
                    : activeDraft.status === "deploying"
                    ? "Deploying to VPS"
                    : activeDraft.status === "approved"
                    ? "Approved & Staged"
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

            <div className="flex items-center gap-2 flex-wrap">
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

              {activeDraft.status === "approved" && (
                <Button
                  size="sm"
                  onClick={() => setShowDeploymentModal(true)}
                  className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Rocket className="h-3.5 w-3.5" />
                  <span>Request Live Deployment</span>
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

          {/* Phase 3: Commercial Gate (Pricing Exists vs Does Not Exist) */}
          {activeDraft.status === "submitted" && !relevantInvoice && (
            <div className="p-5 rounded-xl border border-amber-300 bg-amber-50/60 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-700" />
                    <span>Commercial Phase: Pricing & Technical Estimation Gate</span>
                  </h4>
                  <p className="text-xs text-amber-800 mt-1">
                    Your specifications are locked. Choose whether to activate standard build staging via 
                    <strong> 1,000 Credits</strong>, or await formal custom technical estimation from the Tech Team.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Button
                  size="sm"
                  onClick={handleActivateViaCredits}
                  className="bg-dudos-primary hover:bg-dudos-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Coins className="h-3.5 w-3.5" />
                  <span>Activate Build via 1,000 Credits</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSimulateAdminQuotation}
                  className="text-xs bg-white border-amber-300 text-amber-900 hover:bg-amber-100/80 flex items-center gap-1.5"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-600" />
                  <span>Dispatch Technical Quotation (Mock Tech Team)</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowCreditModal(true)}
                  className="text-xs text-amber-900"
                >
                  <span>Purchase Credits / View Packages →</span>
                </Button>
              </div>
            </div>
          )}

          {/* Phase 3: Approved & Staged Banner */}
          {activeDraft.status === "approved" && (
            <div className="p-5 rounded-xl border border-emerald-300 bg-emerald-50/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-emerald-600 text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    Project Approved · DevScope Builder Staged
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Commercial milestone paid and verified. Your project architecture is approved and queued in DevScope AI Builder.
                  </p>
                  {activeDraft.buildId && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-emerald-900 font-mono">
                      <span className="px-2 py-0.5 rounded bg-emerald-200/80 font-bold">
                        Build ID: {activeDraft.buildId}
                      </span>
                      {activeDraft.devscopeStatus && (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase text-[10px] font-bold">
                          {activeDraft.devscopeStatus}
                        </span>
                      )}
                      {activeDraft.previewUrl && (
                        <a
                          href={activeDraft.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:text-emerald-900 underline font-sans font-medium"
                        >
                          Open Preview →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => setShowDeploymentModal(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Server className="h-3.5 w-3.5" />
                <span>Launch Managed Deployment Ticket</span>
              </Button>
            </div>
          )}

          {/* Phase 4: Deploying to VPS Banner */}
          {activeDraft.status === "deploying" && (
            <div className="p-5 rounded-2xl border border-teal-300 bg-teal-50/70 space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-teal-600 text-white">
                    <Server className="h-5 w-5 animate-pulse" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-teal-950">
                      Managed Deployment in Progress · Tech Team Provisioning
                    </h4>
                    <p className="text-xs text-teal-800 mt-0.5">
                      Target Domain: <strong>{activeDraft.domainName || "Custom Domain"}</strong> · Infrastructure: <strong>Daffodil Cloud Linux VPS</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleSimulateDeployLive}
                    className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Simulate Tech Team Deployment (Mark Live)</span>
                  </Button>
                </div>
              </div>

              <div className="p-3.5 bg-white/90 rounded-xl border border-teal-200 text-xs text-teal-900 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-teal-700 uppercase font-semibold block mb-0.5">DNS CNAME / A Target</span>
                  <span className="font-mono font-bold text-slate-800">{activeDraft.domainName || "domain.com"} ➔ 103.145.118.42</span>
                </div>
                <div>
                  <span className="text-[10px] text-teal-700 uppercase font-semibold block mb-0.5">DNS Verification Status</span>
                  <span className="font-semibold text-amber-700 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Awaiting Tech Verification / Propagation</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-teal-700 uppercase font-semibold block mb-0.5">Security / SSL</span>
                  <span className="font-semibold text-teal-800 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-teal-600" />
                    <span>Auto-Provisioning 256-bit TLS</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Phase 4: Live in Production Banner */}
          {(activeDraft.status === "completed" || activeDraft.status === "live") && (
            <div className="p-6 rounded-2xl border border-emerald-300 bg-emerald-50/80 space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="p-3 rounded-2xl bg-emerald-600 text-white shadow-xs">
                    <Globe className="h-6 w-6" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-emerald-950">
                        Project Live in Production 🚀
                      </h4>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">
                        Production Ready
                      </Badge>
                    </div>
                    <p className="text-xs text-emerald-800 mt-1">
                      Your website application is successfully deployed and running on high-availability Daffodil Cloud Linux infrastructure.
                    </p>
                  </div>
                </div>

                <a
                  href={activeDraft.liveUrl || (activeDraft.domainName ? `https://${activeDraft.domainName}` : "#")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <span>Visit Production Site</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Infrastructure & SSL Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">
                    Live Domain
                  </span>
                  <span className="font-bold text-slate-900 font-mono truncate block">
                    {activeDraft.domainName || "portal.daffodil.family"}
                  </span>
                  <span className="text-[10px] text-emerald-700 mt-0.5 block">HTTPS / TLS 1.3</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">
                    Server Target & IP
                  </span>
                  <span className="font-bold text-slate-900 font-mono block">
                    {activeDraft.vpsIp || "103.145.118.42"}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Daffodil Cloud Linux VPS</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">
                    SSL Certificate
                  </span>
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Active (256-bit)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Auto-Renewed TLS</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">
                    System Health
                  </span>
                  <span className="font-bold text-emerald-800 block">
                    200 OK · 99.98%
                  </span>
                  <span className="text-[10px] text-emerald-700 mt-0.5 block">Response: 38ms</span>
                </div>
              </div>

              {/* Handover & SRS quick actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-emerald-200/80">
                <span className="text-[11px] text-emerald-900 font-medium">
                  Deployed on: {activeDraft.deployedAt ? new Date(activeDraft.deployedAt).toLocaleString() : new Date().toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSrsModal(true)}
                    className="text-xs bg-white text-emerald-950 border-emerald-300 hover:bg-emerald-100/50"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    View Handover Documentation & SRS
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 border border-[#dce5e9] shadow-xs text-center space-y-4">
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
        <div className="bg-white rounded-xl p-6 border border-[#dce5e9] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#dce5e9]">
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
                onClick={() => setShowPaymentModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Review & Pay Quotation (৳{relevantInvoice.totalQuotationBDT.toLocaleString()})</span>
              </Button>
            ) : (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 py-1 px-3">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                <span>Development Milestone Active & Paid</span>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* 5. Phase 3: Quotation Payment Modal Dialog */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <span>Commercial Payment: Quotation {relevantInvoice?.id}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select payment method to pay the approved commercial milestone for {relevantInvoice?.projectTitle}.
            </DialogDescription>
          </DialogHeader>

          {relevantInvoice && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-800 block">Total Payable:</span>
                  <span className="text-lg font-bold text-emerald-900 font-mono">
                    ৳{relevantInvoice.totalQuotationBDT.toLocaleString()}
                  </span>
                </div>
                <Badge variant="outline" className="bg-white text-emerald-800 border-emerald-300">
                  {relevantInvoice.totalHours} Estimated Hours
                </Badge>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-dudos-text">Select Payment Gateway / Method:</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "bkash", label: "bKash / Nagad MFS", desc: "Local Instant Gateway" },
                    { id: "card", label: "Debit / Credit Card", desc: "Visa / Mastercard" },
                    { id: "credits", label: "Wallet Credits", desc: "Deduct 1,000 credits" },
                    { id: "bank", label: "Corporate Bank Wire", desc: "Invoice / PO Net-30" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentMethod === m.id
                          ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-300/40"
                          : "border-[#dce5e9] bg-white text-dudos-text hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-bold block">{m.label}</span>
                      <span className="text-[10px] text-dudos-text-secondary">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === "bkash" && (
                <div className="space-y-1.5 p-3 rounded-xl bg-pink-50/50 border border-pink-200">
                  <Label className="text-[11px] font-semibold text-pink-950 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-pink-600" />
                    <span>bKash / Nagad Wallet Number:</span>
                  </Label>
                  <Input
                    value={mfsPhone}
                    onChange={(e) => setMfsPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="h-8 text-xs bg-white"
                  />
                  <span className="text-[10px] text-pink-800 block">
                    Instant sandbox simulation: Confirms immediately without OTP.
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#dce5e9]">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPaymentModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={isProcessingPayment}
                  onClick={handleConfirmQuotationPayment}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>
                    {isProcessingPayment
                      ? "Verifying Payment…"
                      : `Confirm & Pay ৳${relevantInvoice.totalQuotationBDT.toLocaleString()}`}
                  </span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 6. SRS Modal Dialog */}
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

      {/* 7. AI Q&A Refinement Modal Dialog */}
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
                className="w-full h-9 px-3 rounded-lg border border-[#dce5e9] text-xs bg-white text-dudos-text"
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
                className="w-full h-9 px-3 rounded-lg border border-[#dce5e9] text-xs bg-white text-dudos-text"
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
                className="w-full h-9 px-3 rounded-lg border border-[#dce5e9] text-xs bg-white text-dudos-text"
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
                className="w-full h-9 px-3 rounded-lg border border-[#dce5e9] text-xs bg-white text-dudos-text"
              >
                <option value="PostgreSQL with Row-Level Security">PostgreSQL 16 (Recommended for RLS & FastAPI)</option>
                <option value="Supabase / Cloud Managed PG">Supabase Managed Cloud Postgres</option>
                <option value="MySQL 8.0">MySQL 8.0 Enterprise</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#dce5e9]">
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

      {/* 8. Credit Wallet Modal Integration */}
      <CreditWalletModal
        open={showCreditModal}
        onOpenChange={setShowCreditModal}
        lang={lang}
      />

      {/* 9. Managed Deployment Modal Integration */}
      <ManagedDeploymentModal
        project={activeDraft}
        open={showDeploymentModal}
        onOpenChange={setShowDeploymentModal}
        onSubmitted={() => loadWorkspaceData()}
        lang={lang}
      />
    </div>
  );
}
