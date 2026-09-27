"use client";

import React, { useState } from "react";
import {
  Shield,
  Users,
  CheckCircle2,
  Clock,
  Coins,
  FileText,
  Layers,
  Search,
  Filter,
  Plus,
  ExternalLink,
  Calculator,
  Sliders,
  Download,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  UserCheck,
  Building,
  CreditCard,
  History,
} from "lucide-react";
import { useAuth, CreditTransaction } from "@/context/auth-context";
import { UserProfile, UserStatus, ProjectIntakeData } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AdminEstimationModal } from "@/components/projects/AdminEstimationModal";
import { showToast } from "@/lib/toast";

export function AdminControlPanel({ lang = "en" }: { lang?: string }) {
  const {
    user,
    registrations,
    updateRegistrationStatus,
    allocateCreditsToUser,
    creditTransactions,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"queue" | "quotes" | "ledger">("queue");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selected client for modal views
  const [inspectingUser, setInspectingUser] = useState<UserProfile | null>(null);
  const [estimatingUser, setEstimatingUser] = useState<UserProfile | null>(null);
  const [creditModalUser, setCreditModalUser] = useState<UserProfile | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(1000);
  const [creditReason, setCreditReason] = useState<string>("Manual tech admin allocation");

  // Metrics
  const totalRegistrations = registrations.length;
  const pendingCount = registrations.filter((r) => r.status === "pending_review").length;
  const inScopingCount = registrations.filter((r) => r.status === "in_scoping").length;
  const activeCount = registrations.filter((r) => r.status === "approved" || r.status === "active").length;
  const totalCreditsAllocated = registrations.reduce((sum, r) => sum + (r.credits || 0), 0);
  const totalPipelineValue = registrations.reduce(
    (sum, r) => sum + (r.intake?.estimationQuote?.totalQuote || 0),
    0
  );

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

  const handleStatusChange = (userId: string, newStatus: UserStatus) => {
    updateRegistrationStatus(userId, newStatus);
  };

  const handleApplyCredits = () => {
    if (!creditModalUser) return;
    allocateCreditsToUser(creditModalUser.id, creditAmount, creditReason);
    setCreditModalUser(null);
  };


  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Active Workspace</Badge>;
      case "approved":
        return <Badge className="bg-teal-100 text-teal-800 border-teal-200">Scope Approved</Badge>;
      case "in_scoping":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Scoping</Badge>;
      case "pending_review":
      default:
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending Review</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Admin Header */}
      <div className="bg-white rounded-2xl p-6 border border-dudos-border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#112C3A] text-white">
              <Shield className="h-5 w-5 text-teal-400" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-dudos-text">
                {lang === "bn" ? "সিস্টেম অ্যাডমিন ও টেক কন্ট্রোল প্যানেল" : "System Administration & Tech Control Plane"}
              </h1>
              <p className="text-xs text-dudos-text-secondary mt-0.5">
                Client intake intake queue, technical estimations, credit allocations & workspace provisioning.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="bg-teal-50 text-teal-900 border-teal-200 py-1 text-xs">
            Admin Authority: Full Control
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(registrations, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `dudos_registrations_${Date.now()}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
              showToast.info("Exported client intake registry JSON.");
            }}
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Export Data
          </Button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border border-dudos-border shadow-xs">
          <span className="text-[11px] font-semibold text-dudos-text-secondary uppercase tracking-wider block">
            Total Registrations
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-dudos-text">{totalRegistrations}</span>
            <Users className="h-4 w-4 text-dudos-primary" />
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">In localStorage queue</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
            Awaiting Scoping
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-900">{pendingCount}</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <span className="text-[11px] text-amber-700/80 mt-1 block">Gate 01 Pending</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-blue-200 bg-blue-50/20 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
            In Estimation
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-blue-900">{inScopingCount}</span>
            <Calculator className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-[11px] text-blue-700/80 mt-1 block">Tech hours draft</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
            Active Workspaces
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-900">{activeCount}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="text-[11px] text-emerald-700/80 mt-1 block">Gate 04 provisioned</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-dudos-border shadow-xs">
          <span className="text-[11px] font-semibold text-dudos-text-secondary uppercase tracking-wider block">
            System Credits
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-teal-700">{totalCreditsAllocated.toLocaleString()}</span>
            <Coins className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">Active platform wallet</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-dudos-border pb-1">
        <button
          onClick={() => setActiveTab("queue")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "queue"
              ? "bg-white border-t border-x border-dudos-border text-dudos-primary shadow-xs"
              : "text-dudos-text-secondary hover:text-dudos-text"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Client Intakes & Registrations ({registrations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("quotes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "quotes"
              ? "bg-white border-t border-x border-dudos-border text-dudos-primary shadow-xs"
              : "text-dudos-text-secondary hover:text-dudos-text"
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span>Technical Estimates & Quotes (${totalPipelineValue.toLocaleString()})</span>
        </button>

        <button
          onClick={() => setActiveTab("ledger")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "ledger"
              ? "bg-white border-t border-x border-dudos-border text-dudos-primary shadow-xs"
              : "text-dudos-text-secondary hover:text-dudos-text"
          }`}
        >
          <History className="h-4 w-4" />
          <span>Platform Credit & Billing Ledger</span>
        </button>
      </div>

      {/* Tab 1: Client Registrations & Intake Queue */}
      {activeTab === "queue" && (
        <div className="bg-white rounded-2xl border border-dudos-border shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-dudos-border bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Search by client, entity, domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Filter:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-dudos-border bg-white px-2.5 py-1 text-xs text-dudos-text focus:outline-none focus:ring-1 focus:ring-dudos-primary"
              >
                <option value="all">All Statuses ({registrations.length})</option>
                <option value="pending">Pending Review ({pendingCount})</option>
                <option value="scoping">In Scoping ({inScopingCount})</option>
                <option value="active">Active & Approved ({activeCount})</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-dudos-border text-dudos-text-secondary uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Client / Entity</th>
                  <th className="py-3 px-4">Domain & Stack</th>
                  <th className="py-3 px-4">Status & Gate</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dudos-border">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No client registrations match your search filters.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((client) => {
                    const isClientApproved = client.status === "approved" || client.status === "active";
                    return (
                      <tr key={client.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-semibold text-dudos-text block text-sm">
                              {client.displayName}
                            </span>
                            <span className="text-[11px] text-gray-500 block">
                              {client.organizationName || "Independent"} • @{client.username}
                            </span>
                            <span className="text-[11px] text-teal-700">{client.email}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div>
                            <span className="font-medium text-gray-900 block">
                              {client.intake?.businessDomain || "Enterprise Systems"}
                            </span>
                            <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                              {client.intake?.targetStack || "Next.js + FastAPI"}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">{getStatusBadge(client.status)}</td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {client.credits.toLocaleString()} Cr
                          </span>
                        </td>

                        <td className="py-3 px-4 text-gray-500 text-[11px]">
                          {new Date(client.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setInspectingUser(client)}
                              className="text-[11px] h-7 px-2.5 text-gray-700"
                            >
                              <FileText className="h-3 w-3 mr-1 text-teal-600" />
                              Inspect
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEstimatingUser(client)}
                              className="text-[11px] h-7 px-2.5 text-blue-700 border-blue-200 bg-blue-50/50 hover:bg-blue-100"
                            >
                              <Calculator className="h-3 w-3 mr-1" />
                              Estimate
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setCreditModalUser(client)}
                              className="text-[11px] h-7 px-2 text-amber-700 border-amber-200 bg-amber-50/50 hover:bg-amber-100"
                              title="Adjust Credits"
                            >
                              <Coins className="h-3 w-3" />
                            </Button>

                            {!isClientApproved ? (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleStatusChange(client.id, "active")}
                                className="text-[11px] h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(client.id, "pending_review")}
                                className="text-[11px] h-7 px-2 text-gray-500 hover:text-amber-800"
                                title="Revert to Pending"
                              >
                                Hold
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

      {/* Tab 2: Technical Estimates & Quotes */}
      {activeTab === "quotes" && (
        <div className="bg-white rounded-2xl border border-dudos-border shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-dudos-border">
            <div>
              <h3 className="text-base font-bold text-dudos-text">
                Authorized Engineering Quotes & Technical Scoping
              </h3>
              <p className="text-xs text-dudos-text-secondary mt-0.5">
                Technical estimations calculated based on frontend, backend, QA and DevOps man-hours.
              </p>
            </div>
            <span className="text-sm font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
              Total Value: ${totalPipelineValue.toLocaleString()} USD
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registrations
              .filter((r) => r.intake?.estimationQuote)
              .map((r) => {
                const quote = r.intake!.estimationQuote!;
                return (
                  <div
                    key={r.id}
                    className="p-5 rounded-xl border border-dudos-border bg-gray-50/40 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-dudos-text">{r.organizationName || r.displayName}</h4>
                        <span className="text-xs text-teal-700">{r.intake?.businessDomain}</span>
                      </div>
                      <Badge className="bg-teal-100 text-teal-800 border-teal-300">
                        ${quote.totalQuote.toLocaleString()} {quote.currency}
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2">
                      {r.intake?.projectScope}
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px]">EFFORT</span>
                        <strong className="text-gray-800">{quote.manHours} Hours</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">HOURLY RATE</span>
                        <strong className="text-gray-800">${quote.hourlyRate}/hr</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">INFRA / VPS</span>
                        <strong className="text-gray-800">${quote.infraCost}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-[11px] text-gray-500">
                      <span>Stack: {r.intake?.targetStack}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEstimatingUser(r)}
                        className="text-[11px] h-6 px-2"
                      >
                        Edit Quote
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tab 3: Billing & Credit Ledger */}
      {activeTab === "ledger" && (
        <div className="bg-white rounded-2xl border border-dudos-border shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-dudos-border">
            <div>
              <h3 className="text-base font-bold text-dudos-text">
                Platform Credit & Transaction Ledger
              </h3>
              <p className="text-xs text-dudos-text-secondary mt-0.5">
                Real-time journal of AI generation credits, package activations, and administrative adjustments.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Ledger Transactions: {creditTransactions.length}
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-dudos-border text-dudos-text-secondary uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Transaction ID</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Credits</th>
                  <th className="py-2.5 px-4">Reason / Notes</th>
                  <th className="py-2.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dudos-border">
                {creditTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-gray-600">{tx.id}</td>
                    <td className="py-2.5 px-4">
                      {tx.type === "credit" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          CREDIT
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          DEBIT
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-gray-900">
                      {tx.type === "credit" ? `+${tx.amount.toLocaleString()}` : `-${tx.amount.toLocaleString()}`}
                    </td>
                    <td className="py-2.5 px-4 text-gray-700">{tx.reason}</td>
                    <td className="py-2.5 px-4 text-right text-gray-500 text-[11px]">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Intake Modal */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-dudos-border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-dudos-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dudos-text">
                    {inspectingUser.organizationName || inspectingUser.displayName}
                  </h3>
                  <p className="text-xs text-dudos-text-secondary">
                    Registered by {inspectingUser.displayName} • {inspectingUser.email}
                  </p>
                </div>
              </div>
              {getStatusBadge(inspectingUser.status)}
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                <div>
                  <span className="text-gray-500 block">Business Domain</span>
                  <strong className="text-gray-900 text-sm">{inspectingUser.intake?.businessDomain || "Not specified"}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Target Architecture</span>
                  <strong className="text-gray-900 text-sm font-mono">{inspectingUser.intake?.targetStack || "Next.js + FastAPI"}</strong>
                </div>
              </div>

              <div>
                <span className="text-gray-500 font-semibold uppercase tracking-wider block mb-1">
                  Project Scope & Functional Specifications
                </span>
                <div className="p-3.5 rounded-xl bg-white border border-gray-200 text-gray-800 leading-relaxed max-h-48 overflow-y-auto">
                  {inspectingUser.intake?.projectScope || "Standard client onboarding profile and website generation intake."}
                </div>
              </div>

              {inspectingUser.intake?.referenceUrls && (
                <div>
                  <span className="text-gray-500 font-semibold uppercase tracking-wider block mb-1">
                    Benchmark References & URLs
                  </span>
                  <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 font-mono text-xs truncate">
                    {inspectingUser.intake.referenceUrls}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 text-gray-500">
                <span>Account Created: {new Date(inspectingUser.createdAt).toLocaleString()}</span>
                <span>Wallet Balance: <strong>{inspectingUser.credits.toLocaleString()} Credits</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-dudos-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectingUser(null)}
              >
                Close Inspector
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEstimatingUser(inspectingUser);
                    setInspectingUser(null);
                  }}
                  className="text-blue-700 border-blue-200 bg-blue-50"
                >
                  <Calculator className="h-3.5 w-3.5 mr-1" />
                  Technical Scoping
                </Button>

                {inspectingUser.status !== "active" && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      handleStatusChange(inspectingUser.id, "active");
                      setInspectingUser(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Approve & Activate
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credit Allocation Modal */}
      {creditModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-dudos-border shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-dudos-border">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-dudos-text">
                  Adjust Credits: {creditModalUser.displayName}
                </h3>
                <p className="text-xs text-dudos-text-secondary">
                  Current balance: {creditModalUser.credits.toLocaleString()} Credits
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block text-gray-700 mb-1">
                  Credit Amount (Positive to add, negative to deduct)
                </label>
                <Input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="font-semibold block text-gray-700 mb-1">
                  Reason / Administrative Note
                </label>
                <Input
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  placeholder="e.g. VIP onboarding bonus, support compensation"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-dudos-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreditModalUser(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyCredits}
              >
                Confirm Allocation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Estimation Modal Integration */}
      {estimatingUser && (
        <AdminEstimationModal
          project={{
            id: estimatingUser.id,
            title: estimatingUser.organizationName || estimatingUser.displayName,
            clientEmail: estimatingUser.email,
            framework: estimatingUser.intake?.targetStack || "Next.js + FastAPI",
            description: estimatingUser.intake?.projectScope || "",
          }}
          open={!!estimatingUser}
          onOpenChange={(open) => !open && setEstimatingUser(null)}
          onDispatched={(invoice) => {
            updateRegistrationStatus(estimatingUser.id, "approved", {
              manHours: invoice.totalHours,
              hourlyRate: Math.round(invoice.hourlyRate / 120),
              infraCost: Math.round(invoice.infrastructureCost / 120),
              totalQuote: Math.round(invoice.totalQuotationBDT / 120),
              currency: "USD",
              approvedAt: new Date().toISOString(),
              adminNotes: `Estimated for ${invoice.framework}. Margin: ${invoice.profitMarginPercent}%`,
            });
            setEstimatingUser(null);
            showToast.success("Estimation quote dispatched to client!");
          }}
          lang={lang}
        />
      )}
    </div>
  );
}
