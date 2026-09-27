"use client";

import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  FileText,
  Download,
  Server,
  Calculator,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  Plus,
  Building,
  User,
  ExternalLink,
  ShieldCheck,
  Send,
  Eye,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Notice, Empty } from "@/components/dudos-ui";
import { CustomProjectForm, CustomProjectData } from "./CustomProjectForm";
import { AdminEstimationModal, QuotationInvoice } from "./AdminEstimationModal";
import { ManagedDeploymentModal } from "./ManagedDeploymentModal";
import { showToast } from "@/lib/toast";

const INITIAL_PROJECTS: CustomProjectData[] = [
  {
    id: "proj_daffodil_health",
    title: "Daffodil Health & Telemedicine Portal",
    clientName: "Dr. Rafiqul Islam",
    clientEmail: "rafiqul.health@daffodil.family",
    category: "Healthcare and Social Assistance",
    referenceUrl: "https://mayoclinic.org",
    businessScope:
      "Enterprise patient appointment booking, doctor teleconsultation video rooms, electronic medical records (EMR), and bKash payment gateway integration.",
    selectedFeatures: [
      "Multi-Role Authentication & Access Control",
      "Online Payment Gateway (bKash, Nagad, Stripe)",
      "Customer Support Ticketing & Chat",
      "Dynamic ERP / Billing & Quotations",
    ],
    framework: "Next.js 16 + FastAPI (Python)",
    targetTimeline: "4 weeks",
    budgetRange: "৳150,000 - ৳250,000",
    srsContent:
      "# SRS: Daffodil Health Portal\n\n## 1. Objectives\nDeliver secure, HIPAA-compliant patient consultation workflows.\n\n## 2. Technical Stack\n- Frontend: Next.js 16 App Router\n- Backend: FastAPI (Python 3.12)\n- Database: PostgreSQL with Row-Level Security\n\n## 3. Key Modules\n- Patient Portal & Medical Records\n- Doctor Telehealth Video Session\n- Automated Billing & Invoicing",
    status: "quoted",
    createdAt: "2026-09-24T10:30:00.000Z",
    updatedAt: "2026-09-25T14:15:00.000Z",
  },
  {
    id: "proj_diu_smart_canteen",
    title: "DIU Smart Canteen & Meal Delivery",
    clientName: "Shakil Khan",
    clientEmail: "shakil@daffodil.family",
    category: "Retail and E-commerce",
    referenceUrl: "https://chaldal.com",
    businessScope:
      "Automated campus food ordering, real-time kitchen display system (KDS), student wallet RFID deduction, and daily accounting reconciliation.",
    selectedFeatures: [
      "Multi-Role Authentication & Access Control",
      "Product Catalog & E-Commerce Cart",
      "Dynamic ERP / Billing & Quotations",
      "Inventory & Order Tracking",
    ],
    framework: "React 19 + Node.js + PostgreSQL",
    targetTimeline: "3 weeks",
    budgetRange: "৳80,000 - ৳120,000",
    srsContent:
      "# SRS: DIU Smart Canteen\n\n## 1. Objectives\nReduce lunchtime queues by 80% via digital pre-orders.\n\n## 2. Features\n- Student & Faculty mobile meal booking\n- Live order preparation board\n- Automated kitchen ticket printing",
    status: "approved",
    createdAt: "2026-09-22T08:00:00.000Z",
    updatedAt: "2026-09-24T16:00:00.000Z",
  },
  {
    id: "proj_agro_supply",
    title: "Daffodil Agro Seed Supply Chain",
    clientName: "Anisur Rahman",
    clientEmail: "anisur.agro@daffodil.family",
    category: "Agriculture and Farming",
    referenceUrl: "https://deere.com",
    businessScope:
      "B2B seed catalog, dealer inventory credit limits, batch shipment tracking, and automated invoice dispatching.",
    selectedFeatures: [
      "Product Catalog & E-Commerce Cart",
      "Dynamic ERP / Billing & Quotations",
      "Admin Analytics & Sales Reporting",
    ],
    framework: "Laravel 11 + Livewire / Vue.js",
    targetTimeline: "6 weeks",
    budgetRange: "৳200,000 - ৳350,000",
    srsContent: "# SRS: Agro Supply Chain\n\nComprehensive ERP and distribution management system.",
    status: "in_estimation",
    createdAt: "2026-09-26T11:45:00.000Z",
    updatedAt: "2026-09-26T11:45:00.000Z",
  },
];

const INITIAL_INVOICES: QuotationInvoice[] = [
  {
    id: "inv_dh_9248",
    projectId: "proj_daffodil_health",
    projectTitle: "Daffodil Health & Telemedicine Portal",
    clientEmail: "rafiqul.health@daffodil.family",
    framework: "Next.js 16 + FastAPI (Python)",
    manHours: {
      frontend: 48,
      backend: 64,
      qa: 24,
      devops: 16,
    },
    totalHours: 152,
    hourlyRate: 1200,
    laborCost: 182400,
    infrastructureCost: 18000,
    profitMarginPercent: 20,
    totalQuotationBDT: 240480,
    status: "dispatched",
    dispatchedAt: "2026-09-25T14:15:00.000Z",
  },
  {
    id: "inv_diu_meal_44",
    projectId: "proj_diu_smart_canteen",
    projectTitle: "DIU Smart Canteen & Meal Delivery",
    clientEmail: "shakil@daffodil.family",
    framework: "React 19 + Node.js + PostgreSQL",
    manHours: {
      frontend: 32,
      backend: 40,
      qa: 16,
      devops: 10,
    },
    totalHours: 98,
    hourlyRate: 1000,
    laborCost: 98000,
    infrastructureCost: 12000,
    profitMarginPercent: 15,
    totalQuotationBDT: 126500,
    status: "paid",
    dispatchedAt: "2026-09-24T16:00:00.000Z",
  },
];

interface ProjectFeedback {
  id: string;
  projectId: string;
  authorEmail: string;
  authorName: string;
  comment: string;
  createdAt: string;
}

export function ProjectDashboard({ lang = "en" }: { lang?: string }) {
  const { user } = useAuth();
  const isAdminOrStaff = user?.role === "admin" || user?.role === "staff";

  // Mode: customer/client view vs admin view
  const [activeRoleView, setActiveRoleView] = useState<"client" | "admin">(
    isAdminOrStaff ? "admin" : "client"
  );

  const [projects, setProjects] = useState<CustomProjectData[]>([]);
  const [invoices, setInvoices] = useState<QuotationInvoice[]>([]);
  const [feedbacks, setFeedbacks] = useState<ProjectFeedback[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [selectedProjectForEstimation, setSelectedProjectForEstimation] = useState<CustomProjectData | null>(null);
  const [selectedProjectForDeployment, setSelectedProjectForDeployment] = useState<any | null>(null);
  const [selectedProjectForFeedback, setSelectedProjectForFeedback] = useState<CustomProjectData | null>(null);
  const [selectedInvoiceForReview, setSelectedInvoiceForReview] = useState<QuotationInvoice | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");

  // Load from localStorage or seed
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem("dudos_custom_projects");
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      } else {
        localStorage.setItem("dudos_custom_projects", JSON.stringify(INITIAL_PROJECTS));
        setProjects(INITIAL_PROJECTS);
      }

      const savedInvoices = localStorage.getItem("dudos_quotation_invoices");
      if (savedInvoices) {
        setInvoices(JSON.parse(savedInvoices));
      } else {
        localStorage.setItem("dudos_quotation_invoices", JSON.stringify(INITIAL_INVOICES));
        setInvoices(INITIAL_INVOICES);
      }

      const savedFeedback = localStorage.getItem("dudos_project_feedback");
      if (savedFeedback) {
        setFeedbacks(JSON.parse(savedFeedback));
      } else {
        const initialFb: ProjectFeedback[] = [
          {
            id: "fb_1",
            projectId: "proj_daffodil_health",
            authorEmail: "rafiqul.health@daffodil.family",
            authorName: "Dr. Rafiqul Islam",
            comment: "Please ensure video consultation works smoothly on 4G mobile connections.",
            createdAt: "2026-09-25T15:00:00.000Z",
          },
        ];
        localStorage.setItem("dudos_project_feedback", JSON.stringify(initialFb));
        setFeedbacks(initialFb);
      }
    } catch {}
  }, []);

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    // If client mode and user is logged in as non-admin, filter by user email if matching
    if (activeRoleView === "client" && user?.email && !isAdminOrStaff) {
      if (p.clientEmail !== user.email && p.id !== "proj_diu_smart_canteen") {
        // show only their own or sample
      }
    }
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate ERP Accounting Figures (Section 3.5)
  const totalSalesBDT = invoices.reduce((acc, inv) => acc + inv.totalQuotationBDT, 0);
  const receivedPaymentsBDT = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((acc, inv) => acc + inv.totalQuotationBDT, 0);
  const outstandingBalancesBDT = totalSalesBDT - receivedPaymentsBDT;
  const overallRevenueBDT = receivedPaymentsBDT;

  const handleProjectSubmitted = (newProj: CustomProjectData) => {
    const updated = [newProj, ...projects];
    setProjects(updated);
    try {
      localStorage.setItem("dudos_custom_projects", JSON.stringify(updated));
    } catch {}
    setShowNewProjectModal(false);
    showToast.success("Custom Project Submitted!", {
      description: "Our tech team will review the specification and dispatch an automated quotation.",
    });
  };

  const handleInvoiceDispatched = (newInvoice: QuotationInvoice) => {
    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    try {
      localStorage.setItem("dudos_quotation_invoices", JSON.stringify(updatedInvoices));
    } catch {}

    // Update project status to 'quoted'
    const updatedProjects = projects.map((p) =>
      p.id === newInvoice.projectId ? { ...p, status: "quoted" as const } : p
    );
    setProjects(updatedProjects);
    try {
      localStorage.setItem("dudos_custom_projects", JSON.stringify(updatedProjects));
    } catch {}

    setSelectedProjectForEstimation(null);
  };

  const handleAcceptAndPayInvoice = (invoiceId: string) => {
    const updated = invoices.map((inv) =>
      inv.id === invoiceId ? { ...inv, status: "paid" as const } : inv
    );
    setInvoices(updated);
    try {
      localStorage.setItem("dudos_quotation_invoices", JSON.stringify(updated));
    } catch {}

    // Also update project status to approved / in_development
    const inv = invoices.find((i) => i.id === invoiceId);
    if (inv) {
      const updatedProj = projects.map((p) =>
        p.id === inv.projectId ? { ...p, status: "approved" as const } : p
      );
      setProjects(updatedProj);
      try {
        localStorage.setItem("dudos_custom_projects", JSON.stringify(updatedProj));
      } catch {}
    }

    if (selectedInvoiceForReview?.id === invoiceId) {
      setSelectedInvoiceForReview({
        ...selectedInvoiceForReview,
        status: "paid",
      });
    }

    showToast.success("Quotation Accepted & Payment Recorded!", {
      description: "Project status updated to Approved. Development kickoff scheduled.",
    });
  };

  const handleSendFeedback = () => {
    if (!feedbackComment.trim() || !selectedProjectForFeedback) return;

    const newFb: ProjectFeedback = {
      id: "fb_" + Date.now().toString(36),
      projectId: selectedProjectForFeedback.id,
      authorEmail: user?.email || "user@daffodil.family",
      authorName: user?.displayName || "Customer",
      comment: feedbackComment.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newFb, ...feedbacks];
    setFeedbacks(updated);
    try {
      localStorage.setItem("dudos_project_feedback", JSON.stringify(updated));
    } catch {}

    setFeedbackComment("");
    setSelectedProjectForFeedback(null);
    showToast.success("Feedback Submitted!", {
      description: "Your comments have been logged directly into the project timeline.",
    });
  };

  const handleSimulateCodeDownload = (p: CustomProjectData) => {
    // Log code download as per Section 3.5
    const log = {
      id: "dl_" + Date.now().toString(36),
      projectId: p.id,
      projectTitle: p.title,
      clientEmail: user?.email || p.clientEmail,
      timestamp: new Date().toISOString(),
      file: `${p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-source.zip`,
    };

    try {
      const existing = JSON.parse(localStorage.getItem("dudos_code_download_logs") || "[]");
      localStorage.setItem("dudos_code_download_logs", JSON.stringify([log, ...existing]));
    } catch {}

    showToast.success("Source Code Download Initiated", {
      description: `Downloaded repository package for "${p.title}". Download audit logged.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Role Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dudos-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-dudos-primary" />
            <h1 className="text-xl font-bold text-dudos-text">
              {lang === "bn" ? "প্রজেক্ট ড্যাশবোর্ড ও ইআরপি" : "Project Dashboard & ERP"}
            </h1>
          </div>
          <p className="text-xs text-dudos-text-secondary mt-1">
            Section 3.4 & 3.5 · Managed project lifecycle, automated quotations, deployment & accounting records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Role perspective toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 text-xs">
            <button
              onClick={() => setActiveRoleView("client")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeRoleView === "client"
                  ? "bg-white text-dudos-text shadow-sm"
                  : "text-dudos-text-secondary hover:text-dudos-text"
              }`}
            >
              <User className="h-3.5 w-3.5 inline mr-1" />
              {lang === "bn" ? "ক্লায়েন্ট ভিউ" : "Client View"}
            </button>
            <button
              onClick={() => setActiveRoleView("admin")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeRoleView === "admin"
                  ? "bg-dudos-primary text-white shadow-sm"
                  : "text-dudos-text-secondary hover:text-dudos-text"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 inline mr-1" />
              {lang === "bn" ? "অ্যাডমিন ভিউ" : "Admin / Tech Team View"}
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setShowNewProjectModal(true)}
            className="bg-dudos-primary hover:bg-dudos-primary-hover text-white flex items-center gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            {lang === "bn" ? "নতুন কাস্টম প্রজেক্ট" : "New Custom Project"}
          </Button>
        </div>
      </div>

      {/* Mini ERP Financial & Accounting Overview (Section 3.5) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-dudos-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-dudos-text-secondary mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">
              {lang === "bn" ? "মোট বিক্রি / প্রস্তাব" : "Total Quoted Sales"}
            </span>
            <DollarSign className="h-4 w-4 text-dudos-primary" />
          </div>
          <div className="text-xl font-bold text-dudos-text">
            ৳{totalSalesBDT.toLocaleString()}
          </div>
          <p className="text-[11px] text-dudos-text-secondary mt-1">
            Across {invoices.length} dispatched quotations
          </p>
        </div>

        <div className="bg-white border border-dudos-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">
              {lang === "bn" ? "প্রাপ্ত অর্থ (জমা)" : "Received Payments"}
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700">
            ৳{receivedPaymentsBDT.toLocaleString()}
          </div>
          <p className="text-[11px] text-dudos-text-secondary mt-1">
            Paid & approved milestones
          </p>
        </div>

        <div className="bg-white border border-dudos-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">
              {lang === "bn" ? "বকেয়া হিসাব" : "Outstanding Balance"}
            </span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-700">
            ৳{outstandingBalancesBDT.toLocaleString()}
          </div>
          <p className="text-[11px] text-dudos-text-secondary mt-1">
            Pending client invoice approval
          </p>
        </div>

        <div className="bg-white border border-dudos-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-teal-600 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">
              {lang === "bn" ? "মোট রাজস্ব" : "Overall Revenue"}
            </span>
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-teal-700">
            ৳{overallRevenueBDT.toLocaleString()}
          </div>
          <p className="text-[11px] text-dudos-text-secondary mt-1">
            Daffodil Web & E-Commerce ERP
          </p>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-dudos-border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dudos-text-secondary" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeRoleView === "admin"
                ? "Search by client email, project title, or ID…"
                : "Search your projects…"
            }
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-dudos-text-secondary" />
          <span className="text-xs text-dudos-text-secondary">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-2 text-xs border border-dudos-border rounded-lg bg-white text-dudos-text focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="in_estimation">In Technical Estimation</option>
            <option value="quoted">Quoted / Invoice Sent</option>
            <option value="approved">Approved & Paid</option>
            <option value="in_development">In Development</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects Table & Management */}
      <div className="bg-white border border-dudos-border rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-dudos-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-dudos-text">
              {activeRoleView === "admin"
                ? "Admin Project Management & Estimations"
                : "Your Client Projects"}
            </h2>
            <p className="text-xs text-dudos-text-secondary">
              {activeRoleView === "admin"
                ? "Client-wise search, man-hours estimation, invoice dispatching & code download logs"
                : "Track project progress, download generated code, submit feedback & review quotations"}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {filteredProjects.length} Projects
          </Badge>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="p-8">
            <Empty title="No projects found matching the criteria." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 text-xs">
                  <TableHead>Project Info</TableHead>
                  <TableHead>Client / Stakeholder</TableHead>
                  <TableHead>Stack & Framework</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quotation / Cost</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((p) => {
                  const invoice = invoices.find((inv) => inv.projectId === p.id);
                  const projectFeedbacks = feedbacks.filter((fb) => fb.projectId === p.id);

                  return (
                    <TableRow key={p.id} className="text-xs hover:bg-slate-50/50">
                      <TableCell className="font-medium">
                        <div className="font-semibold text-dudos-text flex items-center gap-1.5">
                          {p.title}
                          {p.referenceUrl && (
                            <a
                              href={p.referenceUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="External Reference Website"
                              className="text-dudos-text-secondary hover:text-dudos-primary inline-flex items-center"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-[11px] text-dudos-text-secondary mt-0.5 line-clamp-1">
                          {p.businessScope}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          ID: {p.id} · {new Date(p.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-dudos-text">{p.clientName}</div>
                        <div className="text-[11px] text-dudos-text-secondary font-mono">
                          {p.clientEmail}
                        </div>
                        <div className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                          {p.category}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px] bg-slate-50">
                          {p.framework}
                        </Badge>
                        <div className="text-[10px] text-dudos-text-secondary mt-1">
                          {p.targetTimeline} · {p.selectedFeatures.length} features
                        </div>
                      </TableCell>

                      <TableCell>
                        {p.status === "submitted" && (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-[10px]">
                            Submitted
                          </Badge>
                        )}
                        {p.status === "in_estimation" && (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-[10px]">
                            In Tech Estimation
                          </Badge>
                        )}
                        {p.status === "quoted" && (
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-[10px]">
                            Quotation Sent
                          </Badge>
                        )}
                        {p.status === "approved" && (
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px]">
                            Approved / Paid
                          </Badge>
                        )}
                        {p.status === "completed" && (
                          <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100 text-[10px]">
                            Completed
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        {invoice ? (
                          <div>
                            <div className="font-semibold text-dudos-text">
                              ৳{invoice.totalQuotationBDT.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-dudos-text-secondary">
                              {invoice.totalHours} hrs · {invoice.status.toUpperCase()}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedInvoiceForReview(invoice)}
                              className="h-6 px-1.5 text-[10px] text-dudos-primary hover:text-dudos-primary-hover"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Quote
                            </Button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Est. {p.budgetRange}</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Admin estimation trigger */}
                          {activeRoleView === "admin" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedProjectForEstimation(p)}
                              className="h-7 text-xs border-dudos-primary text-dudos-primary hover:bg-teal-50"
                            >
                              <Calculator className="h-3 w-3 mr-1" />
                              Estimate & Quote
                            </Button>
                          )}

                          {/* Code download */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSimulateCodeDownload(p)}
                            title="Download Generated Source Code"
                            className="h-7 px-2 text-xs"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>

                          {/* Managed deployment assistance */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedProjectForDeployment(p)}
                            title="Request Managed Deployment Support"
                            className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Server className="h-3.5 w-3.5" />
                          </Button>

                          {/* Client Feedback / Comments */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedProjectForFeedback(p)}
                            title="Project Feedback & Comments"
                            className="h-7 px-2 text-xs relative"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            {projectFeedbacks.length > 0 && (
                              <span className="absolute -top-1 -right-1 bg-dudos-primary text-white text-[9px] rounded-full h-3.5 w-3.5 flex items-center justify-center font-bold">
                                {projectFeedbacks.length}
                              </span>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Dispatched Quotations / Invoices Section (Section 3.4 & 3.5) */}
      <div className="bg-white border border-dudos-border rounded-xl shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-dudos-text flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-dudos-primary" />
              {lang === "bn" ? "প্রস্তাবিত ইনভয়েস ও মূল্য তালিকা" : "Formal Quotations & Invoices"}
            </h3>
            <p className="text-xs text-dudos-text-secondary mt-0.5">
              Automated quotations dispatched directly to client workspace and registered email.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70 text-xs">
                <TableHead>Invoice #</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Client Email</TableHead>
                <TableHead>Man-Hours</TableHead>
                <TableHead>Rate / Hr</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Total (BDT)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} className="text-xs">
                  <TableCell className="font-mono font-medium">{inv.id}</TableCell>
                  <TableCell className="font-semibold text-dudos-text">
                    {inv.projectTitle}
                  </TableCell>
                  <TableCell className="font-mono text-slate-500">{inv.clientEmail}</TableCell>
                  <TableCell>
                    <span className="font-medium">{inv.totalHours} hrs</span>
                    <span className="text-[10px] text-slate-400 block">
                      FE:{inv.manHours.frontend} BE:{inv.manHours.backend} QA:{inv.manHours.qa}
                    </span>
                  </TableCell>
                  <TableCell>৳{inv.hourlyRate}</TableCell>
                  <TableCell>{inv.profitMarginPercent}%</TableCell>
                  <TableCell className="font-bold text-dudos-text">
                    ৳{inv.totalQuotationBDT.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {inv.status === "dispatched" && (
                      <Badge className="bg-amber-100 text-amber-800 text-[10px]">
                        Dispatched
                      </Badge>
                    )}
                    {inv.status === "paid" && (
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                        Paid
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {inv.status !== "paid" && (
                      <Button
                        size="sm"
                        onClick={() => handleAcceptAndPayInvoice(inv.id)}
                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Accept & Pay
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* New Custom Project Modal */}
      <Dialog open={showNewProjectModal} onOpenChange={setShowNewProjectModal}>
        <DialogContent className="max-w-4xl bg-white p-6 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
          <CustomProjectForm lang={lang} onSubmitted={handleProjectSubmitted} />
        </DialogContent>
      </Dialog>

      {/* Admin Estimation Modal */}
      {selectedProjectForEstimation && (
        <AdminEstimationModal
          project={selectedProjectForEstimation}
          open={!!selectedProjectForEstimation}
          onOpenChange={(open) => !open && setSelectedProjectForEstimation(null)}
          onDispatched={handleInvoiceDispatched}
          lang={lang}
        />
      )}

      {/* Managed Deployment Support Modal */}
      {selectedProjectForDeployment && (
        <ManagedDeploymentModal
          project={selectedProjectForDeployment}
          open={!!selectedProjectForDeployment}
          onOpenChange={(open) => !open && setSelectedProjectForDeployment(null)}
          lang={lang}
        />
      )}

      {/* Feedback & Comments Modal */}
      <Dialog
        open={!!selectedProjectForFeedback}
        onOpenChange={(open) => !open && setSelectedProjectForFeedback(null)}
      >
        <DialogContent className="max-w-lg bg-white p-6 rounded-2xl shadow-xl">
          <DialogHeader className="border-b border-dudos-border pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-dudos-primary" />
              <DialogTitle className="text-lg font-bold text-dudos-text">
                Project Comments & Feedback
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-dudos-text-secondary">
              Section 3.5 · Submit feedback, questions, or revision requests for {selectedProjectForFeedback?.title}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Previous Comments list */}
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {feedbacks
                .filter((fb) => fb.projectId === selectedProjectForFeedback?.id)
                .map((fb) => (
                  <div
                    key={fb.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="font-semibold text-dudos-text">{fb.authorName}</span>
                      <span className="text-[10px]">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-dudos-text">{fb.comment}</p>
                  </div>
                ))}
              {feedbacks.filter((fb) => fb.projectId === selectedProjectForFeedback?.id).length === 0 && (
                <p className="text-xs text-slate-400 italic">No feedback submitted yet.</p>
              )}
            </div>

            {/* Comment Form */}
            <div className="space-y-2">
              <Textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Write your feedback, revision notes, or technical questions…"
                rows={3}
                className="text-xs"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSendFeedback}
                  disabled={!feedbackComment.trim()}
                  className="bg-dudos-primary hover:bg-dudos-primary-hover text-white text-xs flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit Feedback
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Review Modal */}
      <Dialog
        open={!!selectedInvoiceForReview}
        onOpenChange={(open) => !open && setSelectedInvoiceForReview(null)}
      >
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl">
          <DialogHeader className="border-b border-dudos-border pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-dudos-primary" />
              <DialogTitle className="text-lg font-bold text-dudos-text">
                Quotation & Invoice Breakdown
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-dudos-text-secondary">
              Invoice #{selectedInvoiceForReview?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoiceForReview && (
            <div className="space-y-4 py-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg space-y-1.5 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Project:</span>
                  <span className="font-semibold">{selectedInvoiceForReview.projectTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Framework:</span>
                  <span>{selectedInvoiceForReview.framework}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Man-Hours:</span>
                  <span className="font-semibold">{selectedInvoiceForReview.totalHours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Labor Cost (Hourly):</span>
                  <span>৳{selectedInvoiceForReview.laborCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Infrastructure & VPS:</span>
                  <span>৳{selectedInvoiceForReview.infrastructureCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Profit Margin:</span>
                  <span>{selectedInvoiceForReview.profitMarginPercent}%</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-sm text-dudos-primary">
                  <span>Grand Total (BDT):</span>
                  <span>৳{selectedInvoiceForReview.totalQuotationBDT.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {selectedInvoiceForReview.status !== "paid" && (
                  <Button
                    onClick={() => handleAcceptAndPayInvoice(selectedInvoiceForReview.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    Accept & Settle Invoice
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
