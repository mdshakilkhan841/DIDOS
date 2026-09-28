"use client";

import React, { useState, useEffect } from "react";
import Link from "@/components/dudos-link";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Rocket,
  CreditCard,
  Coins,
  Sparkles,
  Layers3,
  Search,
  MessageSquare,
  Users,
  Bell,
  Settings,
  LogOut,
  Globe,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Plus,
  Server,
  DollarSign,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-context";
import { CreditBadgeButton, CreditWalletModal } from "@/components/billing/CreditWalletModal";
import { ManagedDeploymentModal } from "@/components/projects/ManagedDeploymentModal";
import { RequestsView, Notifications } from "@/components/dudos-requests";
import { Team } from "@/components/dudos-team";
import { AssetsView } from "@/components/dudos-records";
import { ReferenceExplorer } from "@/components/dudos-reference";
import { ProjectDashboard } from "@/components/projects/ProjectDashboard";
import { buildSubdomainUrl } from "@/lib/subdomains";
import { showToast } from "@/lib/toast";

const ACTIVE_DRAFT_KEY = "dudos_active_draft";
const INVOICES_KEY = "dudos_quotation_invoices";

export default function ClientWorkbench({
  lang = "en",
  section = [],
}: {
  lang: string;
  section: string[];
}) {
  const { user, isAuthenticated, isLoading, creditTransactions, deductCredits, addCredits } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [navSearch, setNavSearch] = useState("");

  const currentView = section[0] || "overview";

  // Client Data State
  const [activeDraft, setActiveDraft] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "card" | "credits" | "bank">("bkash");
  const [mfsPhone, setMfsPhone] = useState("01711000000");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Editable QA Answers state
  const [editableQa, setEditableQa] = useState({
    multiTenant: "yes",
    paymentGateway: "bKash, Nagad & Online Gateway",
    userScale: "10,000 - 50,000 users",
    databaseChoice: "PostgreSQL with Row-Level Security",
  });

  // 1. Strict Auth Gate: Block unauthenticated visitors and redirect Admins to Admin Portal
  useEffect(() => {
    if (isSigningOut) return;
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("dudos_at");
        cleanUrl.searchParams.delete("dudos_session");
        window.location.replace(buildSubdomainUrl("main", `/login?return_to=${encodeURIComponent(cleanUrl.toString())}`));
      } else if (user.role === "admin") {
        // Admins must be routed to dedicated admin subdomain
        window.location.replace(buildSubdomainUrl("admin", "/en/app/tenant-admin"));
      }
    }
  }, [isLoading, isAuthenticated, user, isSigningOut]);

  // Load client workspace records
  useEffect(() => {
    try {
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
      } else if (user?.intake) {
        setActiveDraft({
          id: `proj_${user.id}`,
          title: `${user.organizationName || user.displayName} Core Application`,
          organizationName: user.organizationName || "Client Org",
          businessDomain: user.intake.businessDomain,
          projectScope: user.intake.projectScope,
          targetStack: user.intake.targetStack,
          status: user.intake.estimationQuote ? "quoted" : "in_scoping",
          quotationInvoice: user.intake.estimationQuote ? {
            invoiceNumber: "INV-DUDOS-8821",
            amount: user.intake.estimationQuote.totalQuote,
            currency: "USD",
            manHours: user.intake.estimationQuote.manHours,
            hourlyRate: user.intake.estimationQuote.hourlyRate,
            infraCost: user.intake.estimationQuote.infraCost,
            status: "unpaid",
          } : undefined,
        });
      }

      const invStr = localStorage.getItem(INVOICES_KEY);
      if (invStr) {
        setInvoices(JSON.parse(invStr));
      }
    } catch {}
  }, [user]);

  const handleSignOut = () => {
    setIsSigningOut(true);
    try {
      localStorage.removeItem("dudos_auth_session");
      localStorage.removeItem("dudos_jwt_token");
      sessionStorage.clear();
      const epoch = "expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      document.cookie = `dudos_session=; path=/; max-age=0; ${epoch}`;
      document.cookie = `dudos_at=; path=/; max-age=0; ${epoch}`;
      document.cookie = `dudos_session=; path=/; domain=localhost; max-age=0; ${epoch}`;
      document.cookie = `dudos_at=; path=/; domain=localhost; max-age=0; ${epoch}`;
      document.cookie = `dudos_session=; path=/; domain=.localhost; max-age=0; ${epoch}`;
      document.cookie = `dudos_at=; path=/; domain=.localhost; max-age=0; ${epoch}`;
    } catch {}
    window.location.href = buildSubdomainUrl("main", "/logout?return_to=/login");
  };

  const handleSaveQa = () => {
    if (!activeDraft) return;
    const updated = {
      ...activeDraft,
      qaAnswers: editableQa,
      updatedAt: new Date().toISOString(),
    };
    setActiveDraft(updated);
    try {
      localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(updated));
    } catch {}
    showToast.success("Project scoping questionnaire updated successfully.");
  };

  const handleConfirmPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
      if (activeDraft) {
        const updated = {
          ...activeDraft,
          status: "in_development",
          quotationInvoice: activeDraft.quotationInvoice
            ? { ...activeDraft.quotationInvoice, status: "paid", paidAt: new Date().toISOString() }
            : undefined,
        };
        setActiveDraft(updated);
        try {
          localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(updated));
        } catch {}
      }
      showToast.success("Payment confirmed! Project milestone initiated.");
    }, 1200);
  };

  if (isLoading || !isAuthenticated || !user || user.role === "admin") {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-[#0d1821] text-white">
        <div className="h-9 w-9 animate-spin rounded-full border-3 border-emerald-500/20 border-t-emerald-500" />
        <p className="text-sm font-medium text-slate-400">Loading your customer workspace…</p>
      </div>
    );
  }

  // Client Sidebar Structure
  const clientNavSections = [
    {
      group: "WORKSPACE & PROJECTS",
      items: [
        { id: "overview", title: "Overview & Dashboard", bn: "সংক্ষিপ্ত চিত্র", icon: LayoutDashboard },
        { id: "projects", title: "My Projects", bn: "আমার প্রজেক্ট", icon: FolderKanban },
        { id: "scoping", title: "AI Scoping & SRS", bn: "এআই স্কোপিং ও এসআরএস", icon: Sparkles },
        { id: "deployments", title: "Deployments & Domains", bn: "ডিপ্লয়মেন্ট ও ডোমেন", icon: Rocket },
      ],
    },
    {
      group: "FINANCE & BILLING",
      items: [
        { id: "invoices", title: "Quotes & Invoices", bn: "কোটেশন ও ইনভয়েস", icon: CreditCard },
        { id: "billing", title: "Credit Wallet", bn: "ক্রেডিট ওয়ালেট", icon: Coins },
      ],
    },
    {
      group: "AI TOOLS & RESOURCES",
      items: [
        { id: "builder", title: "DevScope AI Builder", bn: "ডেভস্কোপ এআই বিল্ডার", icon: Sparkles },
        { id: "assets", title: "Source Files & Assets", bn: "সোর্স ফাইল ও সম্পদ", icon: Layers3 },
        { id: "reference", title: "Requirements & Specs", bn: "শর্তাবলী ও স্পেসিফিকেশন", icon: Search },
      ],
    },
    {
      group: "COLLABORATION & SETTINGS",
      items: [
        { id: "requests", title: "Support & Requests", bn: "অনুরোধ ও সহায়তা", icon: MessageSquare },
        { id: "team", title: "Team Members", bn: "টিম মেম্বার", icon: Users },
        { id: "notifications", title: "Notifications", bn: "নোটিফিকেশন", icon: Bell },
        { id: "settings", title: "Organization Settings", bn: "প্রতিষ্ঠান সেটিংস", icon: Settings },
      ],
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar className="dudos-sidebar border-r border-[#1a3040] bg-[#101f2e] text-[#e2edf2]">
        <SidebarHeader className="border-b border-[#1a3040]/70 p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#087f79] font-bold text-white shadow-sm">
              <span>D</span>
            </div>
            <div>
              <div className="flex items-center gap-1 font-bold tracking-tight text-white">
                <span>DUDOS</span>
                <span className="text-[#087f79]">.</span>
              </div>
              <p className="text-[10px] text-[#76929e] tracking-wider uppercase font-semibold">Client Workspace</p>
            </div>
          </div>
          <div className="mt-3">
            <Input
              className="h-8 border-[#1a3040] bg-[#162a3c] text-xs text-[#d4e5ee] placeholder:text-[#8ba4b0]"
              placeholder={lang === "bn" ? "মেনু খুঁজুন…" : "Find workflow…"}
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
            />
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3">
          {clientNavSections.map((sec) => {
            const filteredItems = sec.items.filter((item) =>
              item.title.toLowerCase().includes(navSearch.toLowerCase())
            );
            if (filteredItems.length === 0) return null;

            return (
              <SidebarGroup key={sec.group} className="mb-2">
                <SidebarGroupLabel className="px-2 text-[10px] font-bold tracking-wider text-[#7896a6] uppercase">
                  {sec.group}
                </SidebarGroupLabel>
                <SidebarMenu>
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link
                            href={`/${lang}/app/${item.id}`}
                            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                              isActive
                                ? "bg-[#1a454a] text-[#82dcc8] font-semibold"
                                : "text-[#b9cfdb] hover:bg-[#183548] hover:text-white"
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{lang === "bn" ? item.bn : item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroup>
            );
          })}
        </SidebarContent>

        <SidebarFooter className="border-t border-[#1a3040]/70 p-3">
          <div className="mb-2 px-1">
            <p className="truncate text-xs font-semibold text-white">
              {user.displayName || user.username}
            </p>
            <p className="text-[10px] text-[#82dcc8] truncate font-medium">
              {user.organizationName || "Client Account"}
            </p>
          </div>
          <div className="flex items-center justify-between pt-1 text-[11px] text-[#89a5b5]">
            <Link href={`/${lang === "bn" ? "en" : "bn"}/app/${section.join("/")}`} className="flex items-center gap-1 hover:text-white">
              <Globe className="h-3 w-3" />
              <span>{lang === "bn" ? "English" : "বাংলা"}</span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1 text-[#89a5b5] hover:text-red-400 cursor-pointer"
            >
              <LogOut className="h-3 w-3" />
              <span>{lang === "bn" ? "সাইন আউট" : "Sign out"}</span>
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-[#f8fafc] text-slate-800 min-h-screen">
        {/* Client Topbar */}
        <header className="flex h-14 items-center justify-between border-b border-slate-200 px-6 bg-white shadow-2xs">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-semibold text-slate-600">
              {user.organizationName || "Client Workspace"}
            </span>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] font-semibold text-emerald-800">
              Client Portal
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <CreditBadgeButton lang={lang} />
            <Link
              href={`/${lang}/transform`}
              className="flex items-center gap-1 rounded-lg bg-[#087f79] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#076c67] shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{lang === "bn" ? "নতুন প্রজেক্ট" : "New Scope"}</span>
            </Link>
          </div>
        </header>

        {/* Client Main Body */}
        <main className="p-6 max-w-6xl mx-auto space-y-6">
          {/* VIEW: OVERVIEW */}
          {currentView === "overview" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/60 via-teal-50/30 to-white p-6 shadow-xs">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">
                      Welcome Back, {user.displayName}
                    </span>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      {user.organizationName ? `${user.organizationName} Operations` : "Your Digital Workspace"}
                    </h1>
                    <p className="text-xs text-slate-600 max-w-xl">
                      Monitor project milestones, review official cost quotations from Tech Admin, manage custom domain mappings, and utilize AI Builder tools.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setShowCreditModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9"
                    >
                      <Coins className="h-4 w-4 mr-1.5" />
                      Buy Credits
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Status Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <span className="text-xs font-medium text-slate-500">Available Credits</span>
                  <div className="mt-1 text-2xl font-bold text-amber-600 font-mono">
                    {user.credits ?? 1000} pts
                  </div>
                  <span className="text-[11px] text-slate-500">Ready for AI builds</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <span className="text-xs font-medium text-slate-500">Active Project State</span>
                  <div className="mt-1 text-lg font-bold text-emerald-700 capitalize">
                    {activeDraft?.status?.replace("_", " ") || "In Scoping"}
                  </div>
                  <span className="text-[11px] text-slate-500">Milestone status</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <span className="text-xs font-medium text-slate-500">Latest Quote</span>
                  <div className="mt-1 text-2xl font-bold text-slate-900 font-mono">
                    {activeDraft?.quotationInvoice ? `$${activeDraft.quotationInvoice.amount}` : "Pending"}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {activeDraft?.quotationInvoice ? "Dispatched by Admin" : "Awaiting Tech Review"}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <span className="text-xs font-medium text-slate-500">Target VPS Staging</span>
                  <div className="mt-1 text-lg font-mono font-bold text-blue-600">
                    103.145.118.42
                  </div>
                  <span className="text-[11px] text-slate-500">Nginx Reverse Proxy</span>
                </div>
              </div>

              {/* Active Project Highlight Card */}
              {activeDraft && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <FolderKanban className="h-5 w-5 text-emerald-600" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{activeDraft.title || "Core Application Project"}</h3>
                        <p className="text-[11px] text-slate-500">{activeDraft.businessDomain || "Custom Architecture"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs capitalize">
                      {activeDraft.status?.replace("_", " ") || "In Progress"}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                    {activeDraft.projectScope || "Comprehensive multi-tenant web application scaffold with modern microservices."}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                        <Link href={`/${lang}/app/scoping`}>Edit Scoping Q&A</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                        <Link href={`/${lang}/app/invoices`}>View Quotation</Link>
                      </Button>
                    </div>
                    <Button asChild size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                      <Link href={`/${lang}/app/deployments`}>
                        <Rocket className="h-3.5 w-3.5 mr-1" />
                        Deployment Setup
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: SCOPING & SRS */}
          {currentView === "scoping" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  <span>AI Scoping & Technical SRS</span>
                </h1>
                <p className="text-xs text-slate-500">
                  Review and customize technical parameters for your software application.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
                  <h3 className="text-sm font-bold text-slate-900">Architecture Questionnaire</h3>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Multi-Tenant Isolation
                      </label>
                      <Input
                        value={editableQa.multiTenant}
                        onChange={(e) => setEditableQa({ ...editableQa, multiTenant: e.target.value })}
                        className="h-8 text-xs border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Payment Gateway Integration
                      </label>
                      <Input
                        value={editableQa.paymentGateway}
                        onChange={(e) => setEditableQa({ ...editableQa, paymentGateway: e.target.value })}
                        className="h-8 text-xs border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Target User Scale
                      </label>
                      <Input
                        value={editableQa.userScale}
                        onChange={(e) => setEditableQa({ ...editableQa, userScale: e.target.value })}
                        className="h-8 text-xs border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Database Engine
                      </label>
                      <Input
                        value={editableQa.databaseChoice}
                        onChange={(e) => setEditableQa({ ...editableQa, databaseChoice: e.target.value })}
                        className="h-8 text-xs border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button onClick={handleSaveQa} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                      Save Questionnaire Changes
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs">
                  <h3 className="text-sm font-bold text-slate-900">Project Scope Summary</h3>
                  <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 space-y-2">
                    <div>
                      <span className="font-semibold text-slate-900 block">Domain:</span>
                      <span>{activeDraft?.businessDomain || user?.intake?.businessDomain || "Enterprise Tech"}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block">Tech Stack:</span>
                      <span className="font-mono text-emerald-800">{activeDraft?.targetStack || user?.intake?.targetStack || "Next.js / FastAPI"}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block">Requirements:</span>
                      <p className="mt-1 leading-relaxed text-slate-600">
                        {activeDraft?.projectScope || user?.intake?.projectScope || "Standard modular business application."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: INVOICES & QUOTATIONS */}
          {currentView === "invoices" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  <span>Quotes & Milestone Invoices</span>
                </h1>
                <p className="text-xs text-slate-500">
                  Official quotations generated by Tech Admin based on architectural complexity.
                </p>
              </div>

              {activeDraft?.quotationInvoice ? (
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5 max-w-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[11px] font-mono text-slate-500 block">INVOICE #{activeDraft.quotationInvoice.invoiceNumber || "INV-DUDOS-8821"}</span>
                      <h3 className="font-bold text-slate-900">{activeDraft.title}</h3>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        activeDraft.quotationInvoice.status === "paid"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                          : "border-amber-300 bg-amber-50 text-amber-800"
                      }
                    >
                      {activeDraft.quotationInvoice.status === "paid" ? "PAID & CONFIRMED" : "AWAITING PAYMENT"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <span className="text-[10px] text-slate-500 block">Estimated Hours</span>
                      <span className="font-bold text-slate-800 font-mono text-base">
                        {activeDraft.quotationInvoice.manHours || 120} hrs
                      </span>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <span className="text-[10px] text-slate-500 block">Hourly Rate</span>
                      <span className="font-bold text-slate-800 font-mono text-base">
                        ${activeDraft.quotationInvoice.hourlyRate || 45}/hr
                      </span>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <span className="text-[10px] text-slate-500 block">Infrastructure</span>
                      <span className="font-bold text-slate-800 font-mono text-base">
                        ${activeDraft.quotationInvoice.infraCost || 350}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 p-4 border border-emerald-100">
                    <div>
                      <span className="text-[11px] text-emerald-800 block font-semibold">Total Amount</span>
                      <span className="text-2xl font-bold font-mono text-emerald-900">
                        ${activeDraft.quotationInvoice.amount || 5750} USD
                      </span>
                    </div>
                    {activeDraft.quotationInvoice.status !== "paid" && (
                      <Button
                        onClick={() => setShowPaymentModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9"
                      >
                        Pay Invoice Online
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
                  Your project scope is currently in technical estimation review. Your quotation will appear here once dispatched by Tech Admin.
                </div>
              )}
            </div>
          )}

          {/* VIEW: DEPLOYMENTS & DOMAINS */}
          {currentView === "deployments" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-emerald-600" />
                  <span>Deployments & Custom Domains</span>
                </h1>
                <p className="text-xs text-slate-500">
                  Manage live staging environments, VPS clusters, and DNS A-record mapping.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-emerald-600" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Managed Staging Server</h3>
                      <p className="text-xs text-slate-500">Containerized Next.js & FastAPI Stack</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs">
                    Live Cluster
                  </Badge>
                </div>

                <div className="rounded-lg bg-slate-900 p-4 font-mono text-xs text-emerald-300 space-y-1">
                  <div># Target Server IP for DNS A-Record:</div>
                  <div className="text-white text-sm font-bold">103.145.118.42</div>
                  <div className="text-slate-400 text-[11px] pt-1">Point your custom domain @ and www records to this IP.</div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => setShowDeploymentModal(true)}
                    className="bg-[#087f79] hover:bg-[#076c67] text-white text-xs"
                  >
                    Open Deployment Wizard
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: BILLING & CREDITS */}
          {currentView === "billing" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    <Coins className="h-5 w-5 text-amber-600" />
                    <span>Credit Wallet & Usage Ledger</span>
                  </h1>
                  <p className="text-xs text-slate-500">
                    Platform credits can be used for AI builders, rapid prototyping, and system generation.
                  </p>
                </div>
                <Button
                  onClick={() => setShowCreditModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Top-up Credits
                </Button>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase">
                    <tr>
                      <th className="p-3.5">Transaction ID</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Description</th>
                      <th className="p-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {creditTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-mono text-slate-500">{tx.id}</td>
                        <td className="p-3.5">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                              tx.type === "credit"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-semibold">
                          {tx.type === "credit" ? "+" : "-"}{tx.amount} pts
                        </td>
                        <td className="p-3.5">{tx.reason}</td>
                        <td className="p-3.5 text-slate-500 text-[11px]">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: PROJECTS DASHBOARD */}
          {currentView === "projects" && (
            <div className="space-y-4">
              <ProjectDashboard lang={lang} />
            </div>
          )}

          {/* VIEW: SUPPORT & REQUESTS */}
          {currentView === "requests" && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">My Requests & Change Orders</h1>
              <RequestsView lang={lang} />
            </div>
          )}

          {/* VIEW: NOTIFICATIONS */}
          {currentView === "notifications" && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Activity Notifications</h1>
              <Notifications lang={lang} />
            </div>
          )}

          {/* VIEW: TEAM */}
          {currentView === "team" && (
            <div className="space-y-4">
              <Team workspace={`ws_${user.id}`} lang={lang} />
            </div>
          )}

          {/* VIEW: ASSETS */}
          {currentView === "assets" && (
            <div className="space-y-4">
              <AssetsView workspace={`ws_${user.id}`} lang={lang} />
            </div>
          )}

          {/* VIEW: REFERENCE */}
          {currentView === "reference" && (
            <div className="space-y-4">
              <ReferenceExplorer workspace={`ws_${user.id}`} lang={lang} />
            </div>
          )}

          {/* VIEW: DEVSCOPE AI BUILDER */}
          {currentView === "builder" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-3">
                <Sparkles className="mx-auto h-8 w-8 text-[#087f79]" />
                <h3 className="text-base font-bold text-slate-900">DevScope AI Web Builder</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Generate full web application frontends and landing pages with prompt instructions.
                </p>
                <div className="pt-2">
                  <Button asChild className="bg-[#087f79] hover:bg-[#076c67] text-white text-xs">
                    <Link href={`/${lang}/builder`}>Launch AI Web Builder</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: SETTINGS */}
          {currentView === "settings" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4 max-w-xl">
              <h3 className="text-sm font-bold text-slate-900">Organization Profile</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Company / Organization Name</label>
                  <Input defaultValue={user.organizationName || "Client Org"} className="h-8 text-xs" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Contact Email</label>
                  <Input defaultValue={user.email} disabled className="h-8 text-xs bg-slate-50" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Contact Person</label>
                  <Input defaultValue={user.displayName} className="h-8 text-xs" />
                </div>
              </div>
              <div className="pt-2">
                <Button onClick={() => showToast.success("Settings saved.")} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* MODAL: PAYMENT */}
        {showPaymentModal && activeDraft?.quotationInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span>Invoice Payment</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 flex justify-between items-center">
                <span>Invoice Total:</span>
                <span className="font-bold text-base font-mono">${activeDraft.quotationInvoice.amount} USD</span>
              </div>

              <div className="space-y-2 text-xs">
                <label className="text-[11px] font-semibold text-slate-600 block">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bkash")}
                    className={`rounded-lg border p-2.5 text-xs text-left transition-colors ${
                      paymentMethod === "bkash" ? "border-pink-500 bg-pink-50 text-pink-700 font-bold" : "border-slate-200"
                    }`}
                  >
                    bKash / Nagad MFS
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`rounded-lg border p-2.5 text-xs text-left transition-colors ${
                      paymentMethod === "card" ? "border-blue-500 bg-blue-50 text-blue-700 font-bold" : "border-slate-200"
                    }`}
                  >
                    Credit / Debit Card
                  </button>
                </div>
              </div>

              {paymentMethod === "bkash" && (
                <div className="space-y-2 text-xs">
                  <label className="text-[11px] text-slate-600 block">Enter bKash Mobile Number</label>
                  <Input value={mfsPhone} onChange={(e) => setMfsPhone(e.target.value)} className="h-8 text-xs font-mono" />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => setShowPaymentModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmPayment}
                  disabled={isProcessingPayment}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                >
                  {isProcessingPayment ? "Processing Payment…" : "Pay Now"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: TOP-UP CREDITS */}
        <CreditWalletModal
          open={showCreditModal}
          onOpenChange={setShowCreditModal}
          lang={lang}
        />

        {/* MODAL: MANAGED DEPLOYMENT */}
        <ManagedDeploymentModal
          open={showDeploymentModal}
          onOpenChange={setShowDeploymentModal}
          lang={lang}
          project={activeDraft}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
