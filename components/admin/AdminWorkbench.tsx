"use client";

import React, { useState, useEffect } from "react";
import Link from "@/components/dudos-link";
import {
  Shield,
  Users,
  FolderKanban,
  Sparkles,
  Server,
  Globe,
  CreditCard,
  FileText,
  Activity,
  Settings,
  LogOut,
  Layers3,
  ExternalLink,
  Database,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Coins,
  Calculator,
  Sliders,
  Download,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  Filter,
  Check,
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
import { UserProfile, UserStatus } from "@/types/auth";
import { AdminEstimationModal } from "@/components/projects/AdminEstimationModal";
import { showToast } from "@/lib/toast";
import { buildSubdomainUrl } from "@/lib/subdomains";
import Studio from "@/components/dudos-studio";

export default function AdminWorkbench({
  lang = "en",
  section = [],
}: {
  lang: string;
  section: string[];
}) {
  const {
    user,
    isAuthenticated,
    isLoading,
    registrations,
    updateRegistrationStatus,
    allocateCreditsToUser,
    creditTransactions,
  } = useAuth();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [navSearch, setNavSearch] = useState("");

  // Determine current active view
  // section[0] may be 'tenant-admin' or 'platform-admin', and section[1] may be subview
  let currentView = section[0] === "tenant-admin" || section[0] === "platform-admin"
    ? section[1] || "clients"
    : section[0] || "clients";

  // If viewing root tenant-admin, default to clients management
  if (currentView === "tenant-admin" || !currentView) {
    currentView = "clients";
  }

  // Client Management State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [inspectingUser, setInspectingUser] = useState<UserProfile | null>(null);
  const [estimatingUser, setEstimatingUser] = useState<UserProfile | null>(null);
  const [creditModalUser, setCreditModalUser] = useState<UserProfile | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(1000);
  const [creditReason, setCreditReason] = useState<string>("Manual tech admin allocation");

  // VPS Server & Deployment State
  const [vpsIp, setVpsIp] = useState("103.145.118.42");
  const [vpsEditing, setVpsEditing] = useState(false);

  // 1. Strict Auth Gate: only admin role allowed
  useEffect(() => {
    if (isSigningOut) return;
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("dudos_at");
        cleanUrl.searchParams.delete("dudos_session");
        window.location.replace(buildSubdomainUrl("main", `/login?return_to=${encodeURIComponent(cleanUrl.toString())}`));
      } else if (user.role !== "admin") {
        // Non-admin redirect to client app
        window.location.replace(buildSubdomainUrl("app", "/en/app"));
      }
    }
  }, [isLoading, isAuthenticated, user, isSigningOut]);

  // Loading state
  if (isLoading || !isAuthenticated || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-[#0a0f14] text-white">
        <div className="h-9 w-9 animate-spin rounded-full border-3 border-emerald-500/20 border-t-emerald-500" />
        <p className="text-sm font-medium text-slate-400">Verifying administrative credentials…</p>
      </div>
    );
  }

  // Filtered registrations
  const filteredRegistrations = registrations.filter((r) => {
    const matchesSearch =
      r.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.organizationName && r.organizationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.intake?.businessDomain && r.intake.businessDomain.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && r.status === "pending_review") ||
      (statusFilter === "scoping" && r.status === "in_scoping") ||
      (statusFilter === "active" && (r.status === "approved" || r.status === "active"));

    return matchesSearch && matchesStatus;
  });

  const totalRegistrations = registrations.length;
  const pendingCount = registrations.filter((r) => r.status === "pending_review").length;
  const inScopingCount = registrations.filter((r) => r.status === "in_scoping").length;
  const activeCount = registrations.filter((r) => r.status === "approved" || r.status === "active").length;
  const totalPipelineValue = registrations.reduce(
    (sum, r) => sum + (r.intake?.estimationQuote?.totalQuote || 0),
    0
  );

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

  const handleApplyCredits = () => {
    if (!creditModalUser) return;
    allocateCreditsToUser(creditModalUser.id, creditAmount, creditReason);
    setCreditModalUser(null);
    showToast.success(`Allocated ${creditAmount} credits to ${creditModalUser.displayName}`);
  };

  // Admin Navigation Structure
  const navSections = [
    {
      group: "PLATFORM GOVERNANCE",
      items: [
        { id: "overview", title: "Admin Dashboard", bn: "ড্যাশবোর্ড", icon: Activity },
        { id: "clients", title: "Client Management", bn: "ক্লায়েন্ট ব্যবস্থাপনা", icon: Users, badge: pendingCount > 0 ? String(pendingCount) : undefined },
        { id: "scoping", title: "Project Scoping Queue", bn: "প্রজেক্ট স্কোপিং কিউ", icon: FolderKanban, badge: inScopingCount > 0 ? String(inScopingCount) : undefined },
      ],
    },
    {
      group: "AI & BUILDER CONTROLS",
      items: [
        { id: "builder", title: "DevScope AI Engine", bn: "ডেভস্কোপ এআই বিল্ডার", icon: Sparkles },
        { id: "studio", title: "Prompt Studio & Recipes", bn: "প্রম্পট স্টুডিও", icon: Layers3 },
      ],
    },
    {
      group: "INFRASTRUCTURE & HOSTING",
      items: [
        { id: "servers", title: "VPS Fleet & IP Manager", bn: "সার্ভার ফ্লিট ও আইপি", icon: Server },
        { id: "deployments", title: "Deployment Tickets", bn: "ডিপ্লয়মেন্ট টিকেট", icon: Globe },
      ],
    },
    {
      group: "FINANCE & AUDIT",
      items: [
        { id: "ledger", title: "Billing & Credit Ledger", bn: "বিলিং ও ক্রেডিট লেজার", icon: Coins },
        { id: "invoices", title: "Invoices & Quotations", bn: "ইনভয়েস ও কোটেশন", icon: CreditCard },
        { id: "audit", title: "Security & Audit Logs", bn: "অডিট ও সিকিউরিটি লগ", icon: FileText },
      ],
    },
    {
      group: "SYSTEM",
      items: [
        { id: "settings", title: "Platform Settings", bn: "প্ল্যাটফর্ম সেটিংস", icon: Settings },
      ],
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar className="dudos-sidebar border-r border-[#1e293b] bg-[#0c1520] text-slate-200">
        <SidebarHeader className="border-b border-[#1e293b]/70 p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-sm">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-white">
                <span>DUDOS</span>
                <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">ADMIN</span>
              </div>
              <p className="text-[10px] text-slate-400">Platform Governance</p>
            </div>
          </div>
          <div className="mt-3">
            <Input
              className="h-8 border-[#1e293b] bg-[#111f30] text-xs text-slate-200 placeholder:text-slate-500"
              placeholder="Search admin modules…"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
            />
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3">
          {navSections.map((sec) => {
            const filteredItems = sec.items.filter((item) =>
              item.title.toLowerCase().includes(navSearch.toLowerCase())
            );
            if (filteredItems.length === 0) return null;

            return (
              <SidebarGroup key={sec.group} className="mb-2">
                <SidebarGroupLabel className="px-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
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
                            href={`/${lang}/app/tenant-admin/${item.id}`}
                            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                              isActive
                                ? "bg-blue-600 text-white font-semibold"
                                : "text-slate-400 hover:bg-[#16273c] hover:text-slate-200"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className="h-4 w-4 shrink-0" />
                              <span>{lang === "bn" ? item.bn : item.title}</span>
                            </div>
                            {item.badge && (
                              <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                                {item.badge}
                              </span>
                            )}
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

        <SidebarFooter className="border-t border-[#1e293b]/70 p-3">
          <div className="mb-2 px-1">
            <p className="truncate text-xs font-semibold text-slate-200">
              {user.displayName || user.username}
            </p>
            <p className="text-[10px] text-blue-400">Platform Administrator</p>
          </div>
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
            <a
              href="http://localhost:8000/db"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-blue-400"
            >
              <Database className="h-3 w-3" />
              <span>DB Explorer</span>
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1 text-slate-400 hover:text-red-400 cursor-pointer"
            >
              <LogOut className="h-3 w-3" />
              <span>{lang === "bn" ? "সাইন আউট" : "Sign out"}</span>
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-[#080e16] text-slate-100 min-h-screen">
        {/* Admin Header */}
        <header className="flex h-14 items-center justify-between border-b border-[#1e293b] px-6 bg-[#0a121c]">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div className="h-4 w-px bg-slate-700" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Admin Governance Console
            </span>
            <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-[10px] font-semibold text-blue-400">
              Tech Admin Mode
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs">
              <Server className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[11px] text-slate-400">Managed VPS:</span>
              <span className="font-mono text-[11px] text-emerald-300">{vpsIp}</span>
            </div>
            <a
              href="http://localhost:8000/db"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/50 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700/60"
            >
              <Database className="h-3.5 w-3.5 text-blue-400" />
              <span>PostgreSQL Viewer</span>
              <ExternalLink className="h-3 w-3 ml-0.5 opacity-60" />
            </a>
          </div>
        </header>

        {/* Admin Main Body */}
        <main className="p-6 max-w-7xl mx-auto space-y-6">
          {/* VIEW: CLIENT MANAGEMENT */}
          {currentView === "clients" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    <span>Client User Management</span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    Review incoming registrations, approve scoping requests, and grant credit allowances.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-slate-700 bg-slate-800 px-3 py-1 text-xs">
                    Total: <strong className="ml-1 text-white">{totalRegistrations}</strong>
                  </Badge>
                  <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-400">
                    Pending Review: <strong className="ml-1">{pendingCount}</strong>
                  </Badge>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1e293b] bg-[#0c1520] p-3">
                <div className="relative min-w-[260px] flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <Input
                    placeholder="Search by client name, org, domain…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-9 text-xs border-slate-700 bg-[#101b2a] text-slate-200 placeholder:text-slate-500"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500">Filter status:</span>
                  {(["all", "pending", "scoping", "active"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`rounded-lg px-2.5 py-1 text-xs capitalize transition-colors ${
                        statusFilter === st
                          ? "bg-blue-600 text-white font-medium"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clients Table */}
              <div className="overflow-hidden rounded-xl border border-[#1e293b] bg-[#0c1520]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#1e293b] bg-[#0f1a28] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Client & Organization</th>
                      <th className="p-3.5">Business Domain</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Credits</th>
                      <th className="p-3.5">Quotation / Value</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b] text-slate-300">
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No client records match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrations.map((client) => {
                        const quote = client.intake?.estimationQuote;
                        return (
                          <tr key={client.id} className="hover:bg-[#101b2a]/80 transition-colors">
                            <td className="p-3.5">
                              <div className="font-semibold text-white">{client.displayName}</div>
                              <div className="text-[11px] text-slate-400">{client.email}</div>
                              {client.organizationName && (
                                <div className="text-[11px] text-blue-400 font-medium mt-0.5">
                                  {client.organizationName}
                                </div>
                              )}
                            </td>
                            <td className="p-3.5">
                              <span className="font-medium text-slate-300">
                                {client.intake?.businessDomain || "General Commercial"}
                              </span>
                              <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                                {client.intake?.targetStack || "Next.js / FastAPI"}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                                  client.status === "approved" || client.status === "active"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : client.status === "in_scoping"
                                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                }`}
                              >
                                {client.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="p-3.5 font-mono text-amber-300 font-semibold">
                              {client.credits || 0} pts
                            </td>
                            <td className="p-3.5">
                              {quote ? (
                                <div className="font-mono font-semibold text-emerald-400">
                                  ${quote.totalQuote.toLocaleString()}
                                  <span className="block text-[10px] font-normal text-slate-400 font-sans">
                                    {quote.manHours} hrs @ ${quote.hourlyRate}/h
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-500 italic">Pending quote</span>
                              )}
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setInspectingUser(client)}
                                  className="h-7 border-slate-700 bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                                >
                                  Inspect Intake
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEstimatingUser(client)}
                                  className="h-7 border-blue-500/40 bg-blue-500/10 text-xs text-blue-300 hover:bg-blue-500/20"
                                >
                                  <Calculator className="h-3 w-3 mr-1" />
                                  Estimate
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCreditModalUser(client)}
                                  className="h-7 border-amber-500/40 bg-amber-500/10 text-xs text-amber-300 hover:bg-amber-500/20"
                                >
                                  <Coins className="h-3 w-3 mr-1" />
                                  Credits
                                </Button>
                                {client.status === "pending_review" && (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      updateRegistrationStatus(client.id, "approved");
                                      showToast.success(`Approved ${client.displayName}`);
                                    }}
                                    className="h-7 bg-emerald-600 text-xs text-white hover:bg-emerald-500"
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: PROJECT SCOPING QUEUE */}
          {currentView === "scoping" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <FolderKanban className="h-5 w-5 text-blue-400" />
                  <span>Project Scoping & Estimation Pipeline</span>
                </h1>
                <p className="text-xs text-slate-400">
                  Review client requirements, perform architectural calculations, and dispatch binding quotations.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {registrations.map((client) => {
                  const intake = client.intake;
                  if (!intake) return null;
                  const quote = intake.estimationQuote;

                  return (
                    <div
                      key={client.id}
                      className="rounded-xl border border-[#1e293b] bg-[#0c1520] p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{client.organizationName || client.displayName}</h3>
                          <span className="text-[11px] text-blue-400">{intake.businessDomain}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            quote
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                              : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                          }
                        >
                          {quote ? "Quotation Dispatched" : "Awaiting Estimation"}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2">
                        {intake.projectScope || "Custom full-stack web application scope."}
                      </p>

                      <div className="flex items-center justify-between rounded-lg bg-[#101b2a] p-2.5 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Target Stack</span>
                          <span className="font-mono text-slate-300">{intake.targetStack || "Next.js / Node.js"}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">Budget Expectation</span>
                          <span className="font-semibold text-emerald-400">{intake.budgetRange || "$5,000+"}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInspectingUser(client)}
                          className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-300"
                        >
                          View Full Specs
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setEstimatingUser(client)}
                          className="h-8 bg-blue-600 text-xs text-white hover:bg-blue-500"
                        >
                          <Calculator className="h-3.5 w-3.5 mr-1" />
                          {quote ? "Update Quote" : "Open Cost Calculator"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: OVERVIEW */}
          {currentView === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  <span>Platform Administration Overview</span>
                </h1>
                <p className="text-xs text-slate-400">
                  Real-time operational metrics across registered client accounts and server instances.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-[#1e293b] bg-[#0c1520] p-4">
                  <span className="text-xs font-medium text-slate-400">Total Clients</span>
                  <div className="mt-2 text-2xl font-bold text-white">{totalRegistrations}</div>
                  <span className="text-[11px] text-slate-500">Registered organizations</span>
                </div>
                <div className="rounded-xl border border-[#1e293b] bg-[#0c1520] p-4">
                  <span className="text-xs font-medium text-slate-400">Pending Reviews</span>
                  <div className="mt-2 text-2xl font-bold text-amber-400">{pendingCount}</div>
                  <span className="text-[11px] text-amber-500/80">Require intake sign-off</span>
                </div>
                <div className="rounded-xl border border-[#1e293b] bg-[#0c1520] p-4">
                  <span className="text-xs font-medium text-slate-400">Pipeline Valuation</span>
                  <div className="mt-2 text-2xl font-bold text-emerald-400">${totalPipelineValue.toLocaleString()}</div>
                  <span className="text-[11px] text-emerald-500/80">Approved quotations</span>
                </div>
                <div className="rounded-xl border border-[#1e293b] bg-[#0c1520] p-4">
                  <span className="text-xs font-medium text-slate-400">Managed VPS IP</span>
                  <div className="mt-2 font-mono text-lg font-bold text-blue-400">{vpsIp}</div>
                  <span className="text-[11px] text-slate-500">Live staging cluster</span>
                </div>
              </div>

              {/* Fast Action Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-[#1e293b] bg-[#0c1520] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                    <Users className="h-4 w-4" />
                    <span>Manage Clients</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Search client directory, verify onboarding forms, and update tenant lifecycle states.
                  </p>
                  <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-xs mt-2">
                    <Link href={`/${lang}/app/tenant-admin/clients`}>Go to Client Table</Link>
                  </Button>
                </div>

                <div className="rounded-xl border border-[#1e293b] bg-[#0c1520] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                    <FolderKanban className="h-4 w-4" />
                    <span>Cost Estimation</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Calculate man-hours, tech stack requirements, and dispatch official quotations.
                  </p>
                  <Button asChild size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500 text-xs mt-2">
                    <Link href={`/${lang}/app/tenant-admin/scoping`}>View Scoping Queue</Link>
                  </Button>
                </div>

                <div className="rounded-xl border border-[#1e293b] bg-[#0c1520] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                    <Database className="h-4 w-4" />
                    <span>Live Database</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Inspect PostgreSQL 16 tables, run custom SQL queries, and audit raw database rows.
                  </p>
                  <Button asChild size="sm" variant="outline" className="w-full border-slate-700 bg-slate-800 text-xs mt-2">
                    <a href="http://localhost:8000/db" target="_blank" rel="noreferrer">
                      Open DB Explorer
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: PROMPT STUDIO */}
          {currentView === "studio" && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Layers3 className="h-5 w-5 text-blue-400" />
                <span>Prompt Studio & System Recipes</span>
              </h1>
              <div className="rounded-xl border border-[#1e293b] bg-[#0c1520] p-4">
                <Studio workspace="admin_ws" lang={lang} />
              </div>
            </div>
          )}

          {/* VIEW: DEVSCOPE AI BUILDER */}
          {currentView === "builder" && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <span>DevScope AI Builder Orchestration</span>
              </h1>
              <div className="rounded-xl border border-[#1e293b] bg-[#0c1520] p-6 space-y-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-white">DevScope AI Engine v2.4 Active</h3>
                <p className="max-w-md mx-auto text-xs text-slate-400">
                  FastAPI backend running at <code className="text-blue-400">http://localhost:8000</code>. Container generation pipeline ready for client scaffolds.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <Button asChild className="bg-blue-600 hover:bg-blue-500 text-xs">
                    <Link href={`/${lang}/builder`}>Launch Standalone Builder</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: SERVERS & VPS */}
          {currentView === "servers" && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Server className="h-5 w-5 text-blue-400" />
                <span>Managed VPS Fleet & IP Management</span>
              </h1>
              <div className="rounded-xl border border-[#1e293b] bg-[#0c1520] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-sm">Primary Staging Server</h3>
                    <p className="text-xs text-slate-400">Ubuntu 22.04 LTS • Docker & Nginx Reverse Proxy</p>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs">
                    Operational (100% Uptime)
                  </Badge>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex-1">
                    <span className="text-[11px] text-slate-400 block mb-1">Server Public IPv4</span>
                    <Input
                      value={vpsIp}
                      disabled={!vpsEditing}
                      onChange={(e) => setVpsIp(e.target.value)}
                      className="font-mono text-xs border-slate-700 bg-[#101b2a] text-slate-200"
                    />
                  </div>
                  <div className="pt-5">
                    {vpsEditing ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setVpsEditing(false);
                          showToast.success(`Updated VPS IP to ${vpsIp}`);
                        }}
                        className="bg-emerald-600 text-xs text-white"
                      >
                        Save IP
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVpsEditing(true)}
                        className="border-slate-700 bg-slate-800 text-xs text-slate-300"
                      >
                        Change IP
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: BILLING & CREDIT LEDGER */}
          {currentView === "ledger" && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Coins className="h-5 w-5 text-blue-400" />
                <span>Platform Billing & Credit Ledger</span>
              </h1>
              <div className="overflow-hidden rounded-xl border border-[#1e293b] bg-[#0c1520]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#1e293b] bg-[#0f1a28] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Transaction ID</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Audit Reason</th>
                      <th className="p-3.5">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b] text-slate-300">
                    {creditTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#101b2a]/80">
                        <td className="p-3.5 font-mono text-slate-400">{tx.id}</td>
                        <td className="p-3.5">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                              tx.type === "credit"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-semibold text-white">
                          {tx.type === "credit" ? "+" : "-"}{tx.amount} pts
                        </td>
                        <td className="p-3.5 text-slate-300">{tx.reason}</td>
                        <td className="p-3.5 text-slate-500 text-[11px]">
                          {new Date(tx.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: STUB / UPCOMING MODULES */}
          {["deployments", "invoices", "audit", "settings"].includes(currentView) && (
            <div className="rounded-xl border border-[#1e293b] bg-[#0c1520] p-8 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                <Settings className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white capitalize">
                {currentView.replace("-", " ")} Module
              </h3>
              <p className="max-w-md mx-auto text-xs text-slate-400">
                This administrative section is configured and ready for phased expansion. Currently operational modules: Client User Management, Project Scoping Queue, and Prompt Studio.
              </p>
              <div className="pt-2">
                <Button asChild variant="outline" size="sm" className="border-slate-700 bg-slate-800 text-xs">
                  <Link href={`/${lang}/app/tenant-admin/clients`}>Back to Client Management</Link>
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* MODAL: INSPECT CLIENT INTAKE */}
        {inspectingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-[#0d1622] p-6 text-slate-100 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{inspectingUser.organizationName || inspectingUser.displayName}</h3>
                  <p className="text-xs text-slate-400">{inspectingUser.email} • ID: {inspectingUser.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingUser(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-lg bg-[#111f30] p-3">
                  <span className="text-[10px] text-slate-500 block uppercase">Business Domain</span>
                  <span className="font-semibold text-blue-400">{inspectingUser.intake?.businessDomain || "Enterprise Tech"}</span>
                </div>
                <div className="rounded-lg bg-[#111f30] p-3">
                  <span className="text-[10px] text-slate-500 block uppercase">Target Tech Stack</span>
                  <span className="font-semibold text-slate-200">{inspectingUser.intake?.targetStack || "Next.js / FastAPI / PostgreSQL"}</span>
                </div>
                <div className="rounded-lg bg-[#111f30] p-3">
                  <span className="text-[10px] text-slate-500 block uppercase">Budget Expectation</span>
                  <span className="font-semibold text-emerald-400">{inspectingUser.intake?.budgetRange || "$5,000+"}</span>
                </div>
                <div className="rounded-lg bg-[#111f30] p-3">
                  <span className="text-[10px] text-slate-500 block uppercase">Expected Timeline</span>
                  <span className="font-semibold text-slate-200">{inspectingUser.intake?.expectedTimeline || "4-6 Weeks"}</span>
                </div>
              </div>

              <div className="rounded-lg bg-[#111f30] p-3 text-xs space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Full Scope Description</span>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {inspectingUser.intake?.projectScope || "Custom system architecture requested by customer."}
                </p>
              </div>

              {inspectingUser.intake?.referenceUrls && (
                <div className="rounded-lg bg-[#111f30] p-3 text-xs">
                  <span className="text-[10px] text-slate-500 block uppercase">Reference URLs</span>
                  <p className="text-blue-400 truncate">{inspectingUser.intake.referenceUrls}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInspectingUser(null)}
                  className="border-slate-700 bg-slate-800 text-xs"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const u = inspectingUser;
                    setInspectingUser(null);
                    setEstimatingUser(u);
                  }}
                  className="bg-blue-600 text-xs text-white hover:bg-blue-500"
                >
                  <Calculator className="h-3.5 w-3.5 mr-1" />
                  Open Cost Estimation
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CREDIT ALLOCATION */}
        {creditModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0d1622] p-6 text-slate-100 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Coins className="h-4 w-4 text-amber-400" />
                  <span>Allocate Credits</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setCreditModalUser(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs text-slate-300">
                Granting platform credits to <strong className="text-white">{creditModalUser.displayName}</strong> ({creditModalUser.organizationName || creditModalUser.email}).
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Credit Amount</label>
                  <Input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                    className="h-9 border-slate-700 bg-[#111f30] text-sm font-mono text-amber-300"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Allocation Reason</label>
                  <Input
                    value={creditReason}
                    onChange={(e) => setCreditReason(e.target.value)}
                    placeholder="e.g. Scoping bonus / Custom deposit"
                    className="h-9 border-slate-700 bg-[#111f30] text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCreditModalUser(null)}
                  className="border-slate-700 bg-slate-800 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleApplyCredits}
                  className="bg-amber-600 hover:bg-amber-500 text-xs text-white"
                >
                  Confirm Allocation
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADMIN ESTIMATION CALCULATOR */}
        {estimatingUser && (
          <AdminEstimationModal
            open={!!estimatingUser}
            onOpenChange={(op) => !op && setEstimatingUser(null)}
            project={{
              id: estimatingUser.id,
              name: estimatingUser.organizationName || estimatingUser.displayName,
              clientEmail: estimatingUser.email,
              framework: estimatingUser.intake?.targetStack || "Next.js + FastAPI",
            }}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
