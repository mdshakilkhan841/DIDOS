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
    LifeBuoy,
    Search,
    Pencil,
    Code2,
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
import { CustomerSupportModal } from "@/components/support/CustomerSupportModal";
import { showToast } from "@/lib/toast";
import {
    convertAssessmentRecordToDraft,
    getAuthToken,
} from "@/lib/dudos/assessment-sync";

const STORAGE_KEY = "dudos_onboarding_draft";
const ACTIVE_DRAFT_KEY = "dudos_active_draft";
const PROJECT_RECORDS_KEY = "dudos_project_records";
const CUSTOM_PROJECTS_KEY = "dudos_custom_projects";
const INVOICES_KEY = "dudos_quotation_invoices";

export interface ActiveProjectDraft {
    id: string;
    workspace?: string;
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
    status:
        | "draft"
        | "submitted"
        | "in_estimation"
        | "quoted"
        | "approved"
        | "in_development"
        | "deploying"
        | "completed"
        | "live";
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
    workspaceName,
    workspaces = [],
    activeWorkspaceId,
    onSelectWorkspace,
    onCreateWorkspace,
    lang = "en",
    activeSection = "overview",
}: {
    workspace: string;
    workspaceName?: string;
    workspaces?: any[];
    activeWorkspaceId?: string;
    onSelectWorkspace?: (id: string) => void;
    onCreateWorkspace?: () => void;
    lang?: string;
    activeSection?:
        | "overview"
        | "projects"
        | "deployments"
        | "support"
        | "billing";
}) {
    const router = useRouter();
    const { user, creditTransactions, deductCredits, addCredits } = useAuth();

    const [activeDraft, setActiveDraft] = useState<ActiveProjectDraft | null>(
        null,
    );
    const [invoices, setInvoices] = useState<any[]>([]);
    const [allProjects, setAllProjects] = useState<any[]>([]);
    const [deploymentTickets, setDeploymentTickets] = useState<any[]>([]);
    const [supportTickets, setSupportTickets] = useState<any[]>([]);

    // Search & Filter state for focused views
    const [projectSearch, setProjectSearch] = useState("");
    const [deploymentSearch, setDeploymentSearch] = useState("");
    const [supportFilter, setSupportFilter] = useState("all");
    const [supportSearch, setSupportSearch] = useState("");

    // Modals state
    const [showQaModal, setShowQaModal] = useState(false);
    const [showSrsModal, setShowSrsModal] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showDeploymentModal, setShowDeploymentModal] = useState(false);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<
        "bkash" | "card" | "credits" | "bank"
    >("bkash");
    const [mfsPhone, setMfsPhone] = useState(user?.phone || "");

    // Editable Project Scope Modal State
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);
    const [editProjectForm, setEditProjectForm] = useState({
        title: "",
        organizationName: "",
        businessDomain: "",
        targetStack: "",
        budgetExpectation: "",
        expectedTimeline: "",
        siteUrl: "",
        projectScope: "",
    });

    // Editable QA Answers state
    const [editableQa, setEditableQa] = useState({
        multiTenant: "",
        paymentGateway: "",
        userScale: "",
        databaseChoice: "",
    });

    // Load from localStorage on mount & when workspace changes
    useEffect(() => {
        loadWorkspaceData();
    }, [user, workspace]);

    const loadWorkspaceData = () => {
        try {
            let resolvedDraft: ActiveProjectDraft | null = null;

            // 1. Try loading active project draft
            const draftStr = localStorage.getItem(ACTIVE_DRAFT_KEY);
            if (draftStr) {
                try {
                    const parsed = JSON.parse(draftStr);
                    if (parsed && typeof parsed === "object") {
                        if (
                            !workspace ||
                            workspace === "client_ws" ||
                            !parsed.workspace ||
                            parsed.workspace === workspace
                        ) {
                            resolvedDraft = parsed;
                        }
                    }
                } catch {}
            }

            // 2. Fallback: check project records list
            if (!resolvedDraft) {
                const recordsStr = localStorage.getItem(PROJECT_RECORDS_KEY);
                if (recordsStr) {
                    try {
                        const list = JSON.parse(recordsStr);
                        if (Array.isArray(list) && list.length > 0) {
                            const matching =
                                list.find(
                                    (p: any) => p.workspace === workspace,
                                ) || list[0];
                            if (matching) resolvedDraft = matching;
                        }
                    } catch {}
                }
            }

            // 3. Fallback: check custom projects
            if (!resolvedDraft) {
                const projStr = localStorage.getItem(CUSTOM_PROJECTS_KEY);
                if (projStr) {
                    try {
                        const list = JSON.parse(projStr);
                        if (Array.isArray(list) && list.length > 0) {
                            const matching =
                                list.find(
                                    (p: any) => p.workspace === workspace,
                                ) || list[0];
                            if (matching) {
                                resolvedDraft = {
                                    id: matching.id,
                                    workspace: matching.workspace || workspace,
                                    title:
                                        matching.title ||
                                        "Custom Engineering Project",
                                    organizationName:
                                        matching.organizationName ||
                                        matching.domain ||
                                        "",
                                    contactName:
                                        matching.clientName ||
                                        user?.displayName ||
                                        "",
                                    email:
                                        matching.clientEmail ||
                                        user?.email ||
                                        "",
                                    businessDomain: matching.category || "",
                                    projectScope: matching.businessScope || "",
                                    siteUrl: matching.referenceUrl || "",
                                    targetStack:
                                        matching.framework ||
                                        "Next.js 16 + FastAPI + PostgreSQL 16",
                                    budgetExpectation:
                                        matching.budgetRange ||
                                        "$2,500 – $5,000 USD",
                                    expectedTimeline:
                                        matching.targetTimeline || "4-8 Weeks",
                                    qaAnswers: {
                                        multiTenant:
                                            matching.selectedFeatures?.some(
                                                (f: string) =>
                                                    f.includes("Multi-Tenancy"),
                                            )
                                                ? "yes"
                                                : "no",
                                        paymentGateway:
                                            "Standard Online Gateway",
                                        userScale: "5,000+ Concurrent Users",
                                        databaseChoice: "PostgreSQL 16",
                                    },
                                    status: matching.status || "draft",
                                    savedAt:
                                        matching.createdAt ||
                                        new Date().toISOString(),
                                    updatedAt:
                                        matching.updatedAt ||
                                        new Date().toISOString(),
                                };
                            }
                        }
                    } catch {}
                }
            }

            // 4. Fallback: check saved assessment records in localStorage mock store
            if (!resolvedDraft) {
                const userStoreKey = user ? `records_${user.id}` : "records";
                const rawRecs =
                    localStorage.getItem(`dudos_static_${userStoreKey}`) ||
                    localStorage.getItem("dudos_static_records");
                if (rawRecs) {
                    try {
                        const recList = JSON.parse(rawRecs);
                        if (Array.isArray(recList) && recList.length > 0) {
                            const assessmentRec =
                                recList.find(
                                    (r: any) =>
                                        r.kind === "assessment" &&
                                        (!workspace ||
                                            workspace === "client_ws" ||
                                            r.workspace === workspace),
                                ) ||
                                recList.find(
                                    (r: any) => r.kind === "assessment",
                                );

                            if (assessmentRec) {
                                resolvedDraft = convertAssessmentRecordToDraft(
                                    assessmentRec,
                                    user,
                                    workspace,
                                );
                                localStorage.setItem(
                                    ACTIVE_DRAFT_KEY,
                                    JSON.stringify(resolvedDraft),
                                );
                            }
                        }
                    } catch {}
                }
            }

            if (resolvedDraft) {
                setActiveDraft(resolvedDraft);
                if (resolvedDraft.qaAnswers) {
                    setEditableQa({
                        multiTenant: resolvedDraft.qaAnswers.multiTenant || "",
                        paymentGateway:
                            resolvedDraft.qaAnswers.paymentGateway ||
                            (resolvedDraft.qaAnswers as any).paymentMethods ||
                            "",
                        userScale:
                            resolvedDraft.qaAnswers.userScale ||
                            (resolvedDraft.qaAnswers as any).userVolume ||
                            "",
                        databaseChoice:
                            resolvedDraft.qaAnswers.databaseChoice || "",
                    });
                }
            } else {
                setActiveDraft(null);
            }

            // 2. Load quotation invoices (supports both dudos_quotation_invoices and dudos_invoices)
            const invStr =
                localStorage.getItem(INVOICES_KEY) ||
                localStorage.getItem("dudos_invoices");
            if (invStr) {
                const list = JSON.parse(invStr);
                setInvoices(list);
            }

            // 3. Load all custom projects & project records (deduplicated by ID and title)
            try {
                const projStr = localStorage.getItem(CUSTOM_PROJECTS_KEY);
                const customList = projStr ? JSON.parse(projStr) : [];
                const recordsStr = localStorage.getItem(PROJECT_RECORDS_KEY);
                const recordsList = recordsStr ? JSON.parse(recordsStr) : [];
                const combined = Array.isArray(customList)
                    ? [...customList]
                    : [];
                if (Array.isArray(recordsList)) {
                    for (const rec of recordsList) {
                        const recTitle = (rec.title || rec.name || "")
                            .trim()
                            .toLowerCase();
                        if (
                            !combined.some(
                                (p: any) =>
                                    p.id === rec.id ||
                                    (recTitle &&
                                        (p.title || p.name || "")
                                            .trim()
                                            .toLowerCase() === recTitle),
                            )
                        ) {
                            combined.push(rec);
                        }
                    }
                }
                if (combined.length > 0) {
                    setAllProjects(combined);
                }
            } catch {}

            // 4. Load deployment tickets
            const depStr = localStorage.getItem("dudos_deployment_tickets");
            if (depStr) {
                setDeploymentTickets(JSON.parse(depStr));
            }

            // 5. Load projects & active draft from FastAPI PostgreSQL backend
            const token = getAuthToken();
            if (token) {
                // Fetch active draft from PostgreSQL
                fetch("http://localhost:8000/api/v1/onboarding/active-draft", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then((res) => (res.ok ? res.json() : null))
                    .then((data) => {
                        const draft =
                            data?.activeDraft || (data?.id ? data : null);
                        if (draft) {
                            setActiveDraft(draft);
                            try {
                                localStorage.setItem(
                                    ACTIVE_DRAFT_KEY,
                                    JSON.stringify(draft),
                                );
                            } catch {}
                            if (draft.qaAnswers) {
                                setEditableQa({
                                    multiTenant:
                                        draft.qaAnswers.multiTenant || "",
                                    paymentGateway:
                                        draft.qaAnswers.paymentGateway || "",
                                    userScale: draft.qaAnswers.userScale || "",
                                    databaseChoice:
                                        draft.qaAnswers.databaseChoice || "",
                                });
                            }
                        }
                    })
                    .catch(() => {});

                // Fetch official projects from PostgreSQL
                fetch("http://localhost:8000/api/v1/projects", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then((res) => (res.ok ? res.json() : []))
                    .then((backendProjects) => {
                        if (Array.isArray(backendProjects)) {
                            // The backend database is the single authoritative source of truth for projects
                            setAllProjects(backendProjects);
                            try {
                                localStorage.setItem(
                                    CUSTOM_PROJECTS_KEY,
                                    JSON.stringify(backendProjects),
                                );
                            } catch {}

                            // Auto-hydrate or unify activeDraft with backend authoritative ID
                            setActiveDraft((curr) => {
                                if (!curr && backendProjects.length > 0) {
                                    const latest = backendProjects[0];
                                    const hydrated: ActiveProjectDraft = {
                                        id: latest.id,
                                        workspace:
                                            latest.specs?.workspace ||
                                            workspace ||
                                            "client_ws",
                                        title: latest.name,
                                        organizationName:
                                            latest.domain ||
                                            latest.name.split("—")[0].trim(),
                                        contactName:
                                            user?.displayName ||
                                            user?.username ||
                                            "Client Stakeholder",
                                        email: user?.email || "",
                                        businessDomain:
                                            latest.domain ||
                                            "Enterprise Software",
                                        projectScope: latest.scopeSummary || "",
                                        siteUrl: "",
                                        targetStack:
                                            latest.specs?.stack ||
                                            "Next.js + FastAPI + PostgreSQL",
                                        budgetExpectation:
                                            latest.specs?.budget ||
                                            "$5,000 USD",
                                        expectedTimeline:
                                            latest.specs?.timeline ||
                                            "4-8 Weeks",
                                        qaAnswers: latest.qaAnswers || {
                                            multiTenant: "no",
                                            paymentGateway:
                                                "Standard Online Gateway",
                                            userScale: "1,000 - 5,000 Users",
                                            databaseChoice: "PostgreSQL 16",
                                        },
                                        status:
                                            (latest.status as any) ||
                                            "submitted",
                                        savedAt:
                                            latest.createdAt ||
                                            new Date().toISOString(),
                                        updatedAt:
                                            latest.updatedAt ||
                                            new Date().toISOString(),
                                    };
                                    try {
                                        localStorage.setItem(
                                            ACTIVE_DRAFT_KEY,
                                            JSON.stringify(hydrated),
                                        );
                                    } catch {}
                                    return hydrated;
                                }
                                if (curr && backendProjects.length > 0) {
                                    const match = backendProjects.find(
                                        (bp) =>
                                            bp.id === curr.id ||
                                            (bp.name &&
                                                (curr.title || "")
                                                    .trim()
                                                    .toLowerCase() ===
                                                    bp.name
                                                        .trim()
                                                        .toLowerCase()) ||
                                            (bp.specs?.recordId &&
                                                bp.specs.recordId === curr.id),
                                    );
                                    if (match && curr.id !== match.id) {
                                        const unified = {
                                            ...curr,
                                            id: match.id,
                                            title: match.name,
                                        };
                                        try {
                                            localStorage.setItem(
                                                ACTIVE_DRAFT_KEY,
                                                JSON.stringify(unified),
                                            );
                                        } catch {}
                                        return unified;
                                    }
                                }
                                return curr;
                            });
                        }
                    })
                    .catch((err) =>
                        console.error("FastAPI projects load error:", err),
                    );

                // 6. Load support tickets from FastAPI backend
                fetch("http://localhost:8000/api/v1/support/tickets/my", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then((res) => res.json())
                    .then((data) => {
                        if (Array.isArray(data)) {
                            setSupportTickets(data);
                            localStorage.setItem(
                                "dudos_support_tickets",
                                JSON.stringify(data),
                            );
                        }
                    })
                    .catch(() => {
                        try {
                            const stored = localStorage.getItem(
                                "dudos_support_tickets",
                            );
                            if (stored) setSupportTickets(JSON.parse(stored));
                        } catch {}
                    });

                // 7. Load deployments from FastAPI backend
                fetch("http://localhost:8000/api/v1/deployments/my", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.tickets && Array.isArray(data.tickets)) {
                            setDeploymentTickets(data.tickets);
                            localStorage.setItem(
                                "dudos_deployment_tickets",
                                JSON.stringify(data.tickets),
                            );
                        }
                    })
                    .catch(() => {});
            } else {
                try {
                    const stored = localStorage.getItem(
                        "dudos_support_tickets",
                    );
                    if (stored) setSupportTickets(JSON.parse(stored));
                } catch {}
            }
        } catch {}
    };

    const switchActiveProject = (projectId: string) => {
        const selected = allProjects.find((p) => p.id === projectId);
        if (!selected) return;

        const converted: ActiveProjectDraft = {
            id: selected.id,
            title:
                selected.title || selected.name || "Custom Engineering Project",
            organizationName:
                selected.organizationName || selected.domain || "",
            contactName: selected.contactName || user?.displayName || "",
            email: selected.email || selected.clientEmail || user?.email || "",
            businessDomain: selected.category || selected.domain || "",
            projectScope:
                selected.scopeSummary ||
                selected.businessScope ||
                selected.projectScope ||
                "",
            siteUrl: selected.referenceUrl || selected.siteUrl || "",
            targetStack:
                selected.framework ||
                selected.targetStack ||
                selected.specs?.stack ||
                "",
            budgetExpectation:
                selected.budgetRange || selected.budgetExpectation || "",
            expectedTimeline:
                selected.targetTimeline || selected.expectedTimeline || "",
            qaAnswers: selected.qaAnswers || editableQa,
            status: selected.status || "draft",
            buildId: selected.buildId,
            previewUrl: selected.previewUrl,
            domainName: selected.domainName,
            liveUrl: selected.liveUrl,
            vpsIp: selected.vpsIp,
            savedAt: selected.createdAt || new Date().toISOString(),
            updatedAt: selected.updatedAt || new Date().toISOString(),
        };

        setActiveDraft(converted);
        if (converted.qaAnswers) {
            setEditableQa({
                multiTenant: converted.qaAnswers.multiTenant || "yes",
                paymentGateway:
                    converted.qaAnswers.paymentGateway ||
                    "bKash, Nagad & Online Gateway",
                userScale:
                    converted.qaAnswers.userScale || "10,000 - 50,000 users",
                databaseChoice:
                    converted.qaAnswers.databaseChoice ||
                    "PostgreSQL with Row-Level Security",
            });
        }

        try {
            localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(converted));
        } catch {}

        showToast.success(`Switched active view to "${converted.title}"`);
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
            localStorage.setItem(
                ACTIVE_DRAFT_KEY,
                JSON.stringify(completedDraft),
            );

            // Update deployment tickets
            const depStr = localStorage.getItem("dudos_deployment_tickets");
            if (depStr) {
                const tickets = JSON.parse(depStr);
                const updatedTickets = tickets.map((t: any) =>
                    t.projectId === activeDraft.id || t.domainName === domain
                        ? {
                              ...t,
                              status: "live",
                              dnsStatus: "verified",
                              liveUrl,
                              assignedIp: vpsIp,
                              deployedAt: now,
                          }
                        : t,
                );
                localStorage.setItem(
                    "dudos_deployment_tickets",
                    JSON.stringify(updatedTickets),
                );
                setDeploymentTickets(updatedTickets);
            }

            // Update custom projects
            const projStr = localStorage.getItem(CUSTOM_PROJECTS_KEY);
            if (projStr) {
                const projs = JSON.parse(projStr);
                const updated = projs.map((p: any) =>
                    p.id === activeDraft.id
                        ? {
                              ...p,
                              status: "completed",
                              liveUrl,
                              vpsIp,
                              deployedAt: now,
                              updatedAt: now,
                          }
                        : p,
                );
                localStorage.setItem(
                    CUSTOM_PROJECTS_KEY,
                    JSON.stringify(updated),
                );
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
                    item.id === updated.id ? updated : item,
                );
                localStorage.setItem(
                    PROJECT_RECORDS_KEY,
                    JSON.stringify(nextList),
                );
            }
        } catch {}

        setShowQaModal(false);
        showToast.success("AI Q&A Specifications Updated!", {
            description:
                "Architecture answers have been synchronized with your project draft.",
        });

        // Persist QA update to PostgreSQL
        const token = getAuthToken();
        if (token) {
            fetch("http://localhost:8000/api/v1/onboarding/active-draft", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ draft: updated, activeDraft: updated }),
            }).catch((err) =>
                console.warn(
                    "Failed to persist updated QA answers to DB:",
                    err,
                ),
            );
        }
    };

    const handleOpenEditProject = () => {
        if (!activeDraft) return;
        setEditProjectForm({
            title: activeDraft.title || "",
            organizationName: activeDraft.organizationName || "",
            businessDomain: activeDraft.businessDomain || "",
            targetStack:
                activeDraft.targetStack ||
                "Next.js 16 + FastAPI + PostgreSQL 16",
            budgetExpectation:
                activeDraft.budgetExpectation || "৳150,000 - ৳350,000 BDT",
            expectedTimeline: activeDraft.expectedTimeline || "4-8 Weeks",
            siteUrl: activeDraft.siteUrl || "",
            projectScope: activeDraft.projectScope || "",
        });
        setShowEditProjectModal(true);
    };

    const handleSaveProject = () => {
        if (!activeDraft) return;
        if (!editProjectForm.title.trim()) {
            showToast.error("Project title cannot be empty");
            return;
        }

        const updated: ActiveProjectDraft = {
            ...activeDraft,
            title: editProjectForm.title.trim(),
            organizationName: editProjectForm.organizationName.trim(),
            businessDomain: editProjectForm.businessDomain.trim(),
            targetStack: editProjectForm.targetStack.trim(),
            budgetExpectation: editProjectForm.budgetExpectation.trim(),
            expectedTimeline: editProjectForm.expectedTimeline.trim(),
            siteUrl: editProjectForm.siteUrl.trim(),
            projectScope: editProjectForm.projectScope.trim(),
            updatedAt: new Date().toISOString(),
        };

        setActiveDraft(updated);

        try {
            localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(updated));

            // Also update in PROJECT_RECORDS_KEY
            const recordsStr = localStorage.getItem(PROJECT_RECORDS_KEY);
            if (recordsStr) {
                const list = JSON.parse(recordsStr);
                const nextList = list.map((item: any) =>
                    item.id === updated.id ? updated : item,
                );
                localStorage.setItem(
                    PROJECT_RECORDS_KEY,
                    JSON.stringify(nextList),
                );
            }

            // Also update in CUSTOM_PROJECTS_KEY
            const customStr = localStorage.getItem(CUSTOM_PROJECTS_KEY);
            if (customStr) {
                const list = JSON.parse(customStr);
                const nextList = list.map((item: any) =>
                    item.id === updated.id
                        ? {
                              ...item,
                              title: updated.title,
                              category: updated.businessDomain,
                              referenceUrl: updated.siteUrl,
                              businessScope: updated.projectScope,
                              framework: updated.targetStack,
                              targetTimeline: updated.expectedTimeline,
                              budgetRange: updated.budgetExpectation,
                              updatedAt: new Date().toISOString(),
                          }
                        : item,
                );
                localStorage.setItem(
                    CUSTOM_PROJECTS_KEY,
                    JSON.stringify(nextList),
                );
            }
        } catch (e) {
            console.warn("Failed to persist project edits to localStorage:", e);
        }

        // Persist to FastAPI PostgreSQL Database
        const token = getAuthToken();
        if (token) {
            fetch("http://localhost:8000/api/v1/onboarding/active-draft", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ draft: updated, activeDraft: updated }),
            }).catch((err) =>
                console.warn(
                    "Failed to persist project edits to active-draft API:",
                    err,
                ),
            );

            fetch("http://localhost:8000/api/v1/onboarding/draft", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updated),
            }).catch((err) =>
                console.warn(
                    "Failed to persist project edits to draft API:",
                    err,
                ),
            );
        }

        setShowEditProjectModal(false);
        showToast.success("Project Scope Updated Successfully!", {
            description:
                "All changes saved to your workspace and synchronized with DUDOS cloud.",
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
            const existingCustom = JSON.parse(
                localStorage.getItem(CUSTOM_PROJECTS_KEY) || "[]",
            );
            const customItem = {
                id: confirmed.id,
                title: confirmed.title,
                clientName:
                    confirmed.contactName || user?.displayName || "Client",
                clientEmail: confirmed.email || user?.email || "",
                category: confirmed.businessDomain || "",
                referenceUrl: confirmed.siteUrl || "",
                businessScope: confirmed.projectScope || "",
                selectedFeatures: [
                    editableQa.multiTenant === "yes"
                        ? "Multi-Tenancy Workspace Architecture"
                        : "Single-Tenant Dedicated Instance",
                    editableQa.databaseChoice
                        ? `Database: ${editableQa.databaseChoice}`
                        : "",
                ].filter(Boolean),
                framework: confirmed.targetStack || "",
                targetTimeline: confirmed.expectedTimeline || "",
                budgetRange: confirmed.budgetExpectation || "",
                srsContent: generateSrsMarkdown(confirmed),
                status: "submitted",
                createdAt: confirmed.savedAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const updatedCustomList = [
                customItem,
                ...existingCustom.filter(
                    (item: any) => item.id !== confirmed.id,
                ),
            ];
            localStorage.setItem(
                CUSTOM_PROJECTS_KEY,
                JSON.stringify(updatedCustomList),
            );

            // Also update in PROJECT_RECORDS_KEY
            const existing = localStorage.getItem(PROJECT_RECORDS_KEY);
            if (existing) {
                const list = JSON.parse(existing);
                const nextList = list.map((item: any) =>
                    item.id === confirmed.id ? confirmed : item,
                );
                localStorage.setItem(
                    PROJECT_RECORDS_KEY,
                    JSON.stringify(nextList),
                );
            }
        } catch {}

        // Persist to FastAPI PostgreSQL Database
        const token = getAuthToken();
        if (token) {
            // 1. Update active draft status in PostgreSQL
            fetch("http://localhost:8000/api/v1/onboarding/active-draft", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    draft: confirmed,
                    activeDraft: confirmed,
                    stage: "submitted",
                }),
            }).catch((err) =>
                console.warn(
                    "Failed to update active draft status in DB:",
                    err,
                ),
            );

            // 2. Persist project in customer_projects PostgreSQL table
            fetch("http://localhost:8000/api/v1/projects/from-draft", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    projectId: confirmed.id.startsWith("cproj_")
                        ? confirmed.id
                        : undefined,
                    recordId: confirmed.id,
                    workspace: confirmed.workspace || workspace,
                    name: confirmed.title,
                    domain: confirmed.businessDomain,
                    scopeSummary: confirmed.projectScope,
                    specs: {
                        stack: confirmed.targetStack,
                        timeline: confirmed.expectedTimeline,
                        budget: confirmed.budgetExpectation,
                        workspace: confirmed.workspace || workspace,
                        recordId: confirmed.id,
                    },
                    qaAnswers: editableQa,
                    srsDocument: generateSrsMarkdown(confirmed),
                }),
            })
                .then((res) => (res.ok ? res.json() : null))
                .then((savedProj) => {
                    if (savedProj?.id) {
                        if (confirmed.id !== savedProj.id) {
                            confirmed.id = savedProj.id;
                            setActiveDraft({ ...confirmed, id: savedProj.id });
                            try {
                                localStorage.setItem(
                                    ACTIVE_DRAFT_KEY,
                                    JSON.stringify({
                                        ...confirmed,
                                        id: savedProj.id,
                                    }),
                                );
                            } catch {}
                        }
                        setAllProjects((prev) => {
                            const exists = prev.some(
                                (p) => p.id === savedProj.id,
                            );
                            if (exists) {
                                return prev.map((p) =>
                                    p.id === savedProj.id ? savedProj : p,
                                );
                            }
                            return [
                                savedProj,
                                ...prev.filter((p) => p.id !== confirmed.id),
                            ];
                        });
                    }
                })
                .catch((err) =>
                    console.warn(
                        "Failed to persist confirmed project to DB:",
                        err,
                    ),
                );
        }

        showToast.success("Specifications Confirmed & Locked!", {
            description:
                "Submitted to DUDOS Tech Team for formal technical estimation and quotation.",
        });
    };

    // Phase 3: Standard Credit Package Build Activation
    const handleActivateViaCredits = () => {
        if (!activeDraft) return;
        const currentCredits = user?.credits ?? 0;
        if (currentCredits < 1000) {
            showToast.error("Insufficient Credits", {
                description:
                    "You need 1,000 credits to activate autonomous build staging. Please top up your wallet.",
            });
            setShowCreditModal(true);
            return;
        }

        const deducted = deductCredits(
            1000,
            `Autonomous Build Staging for "${activeDraft.title}"`,
        );
        if (!deducted) return;

        const approvedDraft: ActiveProjectDraft = {
            ...activeDraft,
            status: "approved",
            updatedAt: new Date().toISOString(),
        };
        setActiveDraft(approvedDraft);

        try {
            localStorage.setItem(
                ACTIVE_DRAFT_KEY,
                JSON.stringify(approvedDraft),
            );

            const existingCustom = JSON.parse(
                localStorage.getItem(CUSTOM_PROJECTS_KEY) || "[]",
            );
            const updatedCustom = existingCustom.map((p: any) =>
                p.id === activeDraft.id ? { ...p, status: "approved" } : p,
            );
            localStorage.setItem(
                CUSTOM_PROJECTS_KEY,
                JSON.stringify(updatedCustom),
            );
        } catch {}

        // Trigger internal DevScope builder bridge
        fetch("/api/devscope", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                project_id: activeDraft.id,
                name: activeDraft.title,
                requirements: activeDraft.projectScope,
                srs: generateSrsMarkdown(activeDraft),
                tech_stack: activeDraft.targetStack,
                database: activeDraft.qaAnswers?.databaseChoice || "PostgreSQL",
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
                        localStorage.setItem(
                            ACTIVE_DRAFT_KEY,
                            JSON.stringify(withBuildId),
                        );
                    } catch {}
                }
            })
            .catch((err) =>
                console.error("DevScope build trigger error:", err),
            );

        showToast.success("Build Phase Activated via Credits!", {
            description:
                "1,000 credits deducted. Project approved and queued in DevScope AI Builder.",
        });
    };

    // Phase 3: Simulate Admin Quotation Dispatch (for testing the 'Pricing if not exist' workflow)
    const handleSimulateAdminQuotation = () => {
        if (!activeDraft) return;

        const simulatedInvoice = {
            id: "inv_" + Date.now().toString(36),
            projectId: activeDraft.id,
            projectTitle: activeDraft.title,
            clientEmail: activeDraft.email || user?.email || "",
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
            const existing = JSON.parse(
                localStorage.getItem(INVOICES_KEY) || "[]",
            );
            const updated = [
                simulatedInvoice,
                ...existing.filter((i: any) => i.id !== simulatedInvoice.id),
            ];
            localStorage.setItem(INVOICES_KEY, JSON.stringify(updated));
            setInvoices(updated);

            const quotedDraft: ActiveProjectDraft = {
                ...activeDraft,
                status: "quoted",
                updatedAt: new Date().toISOString(),
            };
            setActiveDraft(quotedDraft);
            localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(quotedDraft));

            const customExisting = JSON.parse(
                localStorage.getItem(CUSTOM_PROJECTS_KEY) || "[]",
            );
            const customUpdated = customExisting.map((p: any) =>
                p.id === activeDraft.id ? { ...p, status: "quoted" } : p,
            );
            localStorage.setItem(
                CUSTOM_PROJECTS_KEY,
                JSON.stringify(customUpdated),
            );

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
                    const deducted = deductCredits(
                        1000,
                        `Quotation Milestone Payment for "${relevantInvoice.projectTitle}"`,
                    );
                    if (!deducted) {
                        setIsProcessingPayment(false);
                        return;
                    }
                }

                const existing = JSON.parse(
                    localStorage.getItem(INVOICES_KEY) || "[]",
                );
                const updated = existing.map((i: any) =>
                    i.id === relevantInvoice.id ? { ...i, status: "paid" } : i,
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
                    localStorage.setItem(
                        ACTIVE_DRAFT_KEY,
                        JSON.stringify(nextDraft),
                    );
                }

                const customExisting = JSON.parse(
                    localStorage.getItem(CUSTOM_PROJECTS_KEY) || "[]",
                );
                const customUpdated = customExisting.map((p: any) =>
                    p.id === relevantInvoice.projectId
                        ? { ...p, status: "approved" }
                        : p,
                );
                localStorage.setItem(
                    CUSTOM_PROJECTS_KEY,
                    JSON.stringify(customUpdated),
                );

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
            inv.clientEmail === user?.email,
    );

    // Natural project list from authoritative store without manual filtering hacks
    const displayedProjects = allProjects.slice();
    if (
        activeDraft &&
        activeDraft.status === "draft" &&
        !displayedProjects.some((p) => p.id === activeDraft.id)
    ) {
        displayedProjects.unshift(activeDraft as any);
    }

    return (
        <div className="space-y-6">
            {(!activeSection ||
                activeSection === "overview" ||
                activeSection === "billing") && (
                <>
                    {/* 1. Client Identity & Workspace Header - Authentic DUDOS Template */}
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">
                                <span />
                                {lang === "bn"
                                    ? "ক্লায়েন্ট ওয়ার্কস্পেস"
                                    : "CLIENT WORKSPACE"}
                            </p>
                            <h1>
                                {workspaceName ||
                                    (activeDraft?.organizationName &&
                                    activeDraft.organizationName !==
                                        "Customer / Client"
                                        ? activeDraft.organizationName
                                        : "") ||
                                    (user?.organizationName &&
                                    user.organizationName !==
                                        "Customer / Client"
                                        ? user.organizationName
                                        : "") ||
                                    (user?.displayName
                                        ? `${user.displayName}'s Workspace`
                                        : lang === "bn"
                                          ? "ব্যক্তিগত কর্মপরিসর"
                                          : "Customer Workspace")}
                            </h1>
                            <p>
                                {lang === "bn"
                                    ? "প্রজেক্ট স্পেসিফিকেশন, এআই কিউঅ্যান্ডএ স্কোপ রিভিশন, কোটেশন ও ডিপ্লয়মেন্ট পরিচালনা করুন।"
                                    : "Manage your project specifications, AI Q&A scope revisions, quotations, and deployment lifecycles."}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            {/* Interactive Multi-Workspace Switcher Dropdown */}
                            {workspaces &&
                            workspaces.length > 0 &&
                            onSelectWorkspace ? (
                                <div className="flex items-center gap-1.5 bg-[#edf7f4] border border-[#c2e2dc] hover:border-[#087f79] rounded-lg px-2.5 py-1.5 shadow-2xs transition-colors">
                                    <Building2 className="h-3.5 w-3.5 text-[#087f79] shrink-0" />
                                    <span className="text-xs text-[#087f79] font-bold hidden sm:inline">
                                        {lang === "bn"
                                            ? "ওয়ার্কস্পেস:"
                                            : "Workspace:"}
                                    </span>
                                    <select
                                        value={activeWorkspaceId || workspace}
                                        onChange={(e) => {
                                            if (
                                                e.target.value ===
                                                "__NEW_WORKSPACE__"
                                            ) {
                                                onCreateWorkspace?.();
                                            } else {
                                                onSelectWorkspace(
                                                    e.target.value,
                                                );
                                            }
                                        }}
                                        className="text-xs font-bold text-[#087f79] bg-transparent outline-none cursor-pointer pr-1 max-w-[170px] truncate"
                                        title={
                                            lang === "bn"
                                                ? "ওয়ার্কস্পেস পরিবর্তন করুন"
                                                : "Switch Active Workspace"
                                        }
                                    >
                                        {workspaces.map((w: any) => (
                                            <option
                                                key={w.id}
                                                value={w.id}
                                                className="text-[#162c38]"
                                            >
                                                {w.name}
                                            </option>
                                        ))}
                                        {onCreateWorkspace && (
                                            <option
                                                value="__NEW_WORKSPACE__"
                                                className="text-[#087f79] font-bold"
                                            >
                                                {lang === "bn"
                                                    ? "+ নতুন ওয়ার্কস্পেস..."
                                                    : "+ New Workspace..."}
                                            </option>
                                        )}
                                    </select>
                                </div>
                            ) : (
                                workspaceName && (
                                    <div className="flex items-center gap-1.5 bg-[#edf7f4] border border-[#c2e2dc] rounded-lg px-2.5 py-1.5 shadow-2xs">
                                        <Building2 className="h-3.5 w-3.5 text-[#087f79]" />
                                        <span className="text-xs text-[#087f79] font-bold max-w-[160px] truncate">
                                            {workspaceName}
                                        </span>
                                    </div>
                                )
                            )}
                            {/* Multi-Project Switcher Dropdown */}
                            {displayedProjects.length > 0 && (
                                <div className="flex items-center gap-1.5 bg-[#f0f4f6] border border-[#dce5e9] rounded-lg px-2.5 py-1.5 shadow-xs">
                                    <FolderKanban className="h-3.5 w-3.5 text-[#087f79]" />
                                    <span className="text-xs text-[#5b6f7b] font-semibold hidden sm:inline">
                                        Project:
                                    </span>
                                    <select
                                        value={activeDraft?.id || ""}
                                        onChange={(e) =>
                                            switchActiveProject(e.target.value)
                                        }
                                        className="text-xs font-semibold text-[#162c38] bg-transparent outline-none cursor-pointer pr-1 max-w-[180px] truncate"
                                        title="Switch Active Project"
                                    >
                                        {displayedProjects.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.title || p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

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
                                <span className="text-xs text-[#087f79] font-bold bg-[#edf7f4] px-2 py-0.5 rounded border border-[#c2e2dc] ml-1">
                                    + Top Up
                                </span>
                            </button>

                            <Link
                                href={
                                    lang ? `/${lang}/onboarding` : "/onboarding"
                                }
                            >
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs flex items-center gap-1.5 bg-white border-[#dce5e9] text-[#162c38] hover:bg-[#f4f7f8]"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>
                                        {lang === "bn"
                                            ? "নতুন খসড়া"
                                            : "New Onboarding Request"}
                                    </span>
                                </Button>
                            </Link>

                            {/* Support Ticket Quick Button */}
                            <button
                                onClick={() => setShowSupportModal(true)}
                                className="bg-white hover:bg-[#f4f7f8] border border-[#dce5e9] text-[#162c38] rounded-lg px-3 py-2 flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                                title="Raise Support Ticket"
                            >
                                <LifeBuoy className="h-3.5 w-3.5 text-[#087f79]" />
                                <span>
                                    {lang === "bn" ? "সহায়তা" : "Support"}
                                </span>
                                {supportTickets.filter(
                                    (t) =>
                                        t.status === "open" ||
                                        t.status === "in_progress",
                                ).length > 0 && (
                                    <span className="text-xs bg-[#087f79] text-white px-2 py-0.5 rounded-full font-bold ml-1">
                                        {
                                            supportTickets.filter(
                                                (t) =>
                                                    t.status === "open" ||
                                                    t.status === "in_progress",
                                            ).length
                                        }
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 2. Visual 5-Stage Project Lifecycle Pipeline */}
                    <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#dce5e9] shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-dudos-primary" />
                                    <span>Project Delivery Lifecycle</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    5-stage path from intake and architecture
                                    through autonomous build and live
                                    deployment.
                                </p>
                            </div>
                            <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1 rounded-md border border-teal-200 shrink-0 self-start sm:self-auto">
                                {activeDraft?.status === "completed" ||
                                activeDraft?.status === "live"
                                    ? "Stage 5: Live in Production 🚀"
                                    : activeDraft?.status === "deploying"
                                      ? "Stage 4: Cloud VPS Deployment In Progress"
                                      : activeDraft?.status === "approved"
                                        ? "Stage 4: Build Staged & Repository Initialized"
                                        : activeDraft?.status === "quoted"
                                          ? "Stage 3: Formal Tech Quotation Dispatched"
                                          : activeDraft?.status === "submitted"
                                            ? "Stage 3: Tech Estimation & Architecture Review"
                                            : "Stage 2: Scope & Architecture Specs"}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            {[
                                {
                                    step: "1",
                                    title: "Intake & Objectives",
                                    desc: "Scope & Requirements Captured",
                                    done: !!activeDraft,
                                    active: !activeDraft,
                                },
                                {
                                    step: "2",
                                    title: "Architecture & Specs",
                                    desc: "Tech Stack & AI QA Defined",
                                    done:
                                        !!activeDraft &&
                                        activeDraft.status !== "draft",
                                    active:
                                        !!activeDraft &&
                                        activeDraft.status === "draft",
                                },
                                {
                                    step: "3",
                                    title: "Quotation & Review",
                                    desc: "Estimation & Commercial Gate",
                                    done: [
                                        "approved",
                                        "in_development",
                                        "deploying",
                                        "completed",
                                        "live",
                                    ].includes(activeDraft?.status || ""),
                                    active:
                                        activeDraft?.status === "submitted" ||
                                        activeDraft?.status ===
                                            "in_estimation" ||
                                        activeDraft?.status === "quoted",
                                },
                                {
                                    step: "4",
                                    title: "DevScope AI Build",
                                    desc:
                                        activeDraft?.status === "completed" ||
                                        activeDraft?.status === "live"
                                            ? "Autonomous Build Completed"
                                            : activeDraft?.status ===
                                                "deploying"
                                              ? "VPS Container Provisioning"
                                              : activeDraft?.status ===
                                                  "approved"
                                                ? "Ready for Code Synthesis"
                                                : "Staging Pipeline",
                                    done:
                                        activeDraft?.status === "completed" ||
                                        activeDraft?.status === "live",
                                    active:
                                        activeDraft?.status === "approved" ||
                                        activeDraft?.status ===
                                            "in_development" ||
                                        activeDraft?.status === "deploying",
                                },
                                {
                                    step: "5",
                                    title: "Live Production",
                                    desc:
                                        activeDraft?.status === "completed" ||
                                        activeDraft?.status === "live"
                                            ? "Cloud VPS & Domain Active"
                                            : "Production Launch Gate",
                                    done:
                                        activeDraft?.status === "completed" ||
                                        activeDraft?.status === "live",
                                    active: activeDraft?.status === "deploying",
                                },
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                                        item.done
                                            ? "bg-teal-50/70 border-teal-200 text-teal-950"
                                            : item.active
                                              ? "bg-amber-50/80 border-amber-300 text-amber-950 ring-2 ring-amber-300/40 shadow-xs"
                                              : "bg-slate-50/70 border-slate-200 text-slate-400"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        {item.done ? (
                                            <span className="h-5 w-5 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                                                <Check className="h-3 w-3" />
                                            </span>
                                        ) : item.active ? (
                                            <span className="h-5 w-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                                {item.step}
                                            </span>
                                        ) : (
                                            <span className="h-5 w-5 rounded-full bg-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                                                {item.step}
                                            </span>
                                        )}
                                        <span className="text-sm font-bold truncate text-slate-900">
                                            {item.title}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 pl-7 leading-snug">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Active Project Draft Card */}
                    {activeDraft ? (
                        <div className="bg-white rounded-xl p-6 border border-[#dce5e9] shadow-xs space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#dce5e9] gap-4">
                                <div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-dudos-primary">
                                            <FolderKanban className="h-5 w-5" />
                                        </div>
                                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                                            {activeDraft.title}
                                        </h2>
                                        <Badge
                                            className={`text-xs px-2.5 py-1 font-semibold ${
                                                activeDraft.status ===
                                                    "completed" ||
                                                activeDraft.status === "live"
                                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                                    : activeDraft.status ===
                                                        "deploying"
                                                      ? "bg-teal-100 text-teal-800 border-teal-300"
                                                      : activeDraft.status ===
                                                          "approved"
                                                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                                        : activeDraft.status ===
                                                            "quoted"
                                                          ? "bg-purple-100 text-purple-800 border-purple-300"
                                                          : activeDraft.status ===
                                                              "submitted"
                                                            ? "bg-teal-100 text-teal-800 border-teal-300"
                                                            : "bg-amber-100 text-amber-800 border-amber-300"
                                            }`}
                                        >
                                            {activeDraft.status ===
                                                "completed" ||
                                            activeDraft.status === "live"
                                                ? "Live in Production 🚀"
                                                : activeDraft.status ===
                                                    "deploying"
                                                  ? "Deploying to VPS"
                                                  : activeDraft.status ===
                                                      "approved"
                                                    ? "Approved & Staged"
                                                    : activeDraft.status ===
                                                        "quoted"
                                                      ? "Quotation Dispatched"
                                                      : activeDraft.status ===
                                                          "submitted"
                                                        ? "In Tech Estimation"
                                                        : "Intake Specifications"}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-2 flex-wrap">
                                        <span>
                                            Workspace:{" "}
                                            <strong className="text-slate-700 font-semibold">
                                                {activeDraft.workspace ||
                                                    workspaceName ||
                                                    workspace}
                                            </strong>
                                        </span>
                                        <span>•</span>
                                        <span>
                                            Ref ID:{" "}
                                            <span className="font-mono text-slate-600 font-medium">
                                                {activeDraft.id}
                                            </span>
                                        </span>
                                        <span>•</span>
                                        <span>
                                            Last Updated:{" "}
                                            <span className="text-slate-600">
                                                {new Date(
                                                    activeDraft.updatedAt ||
                                                        activeDraft.savedAt,
                                                ).toLocaleDateString()}
                                            </span>
                                        </span>
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleOpenEditProject}
                                        className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-teal-600/40 text-teal-800 bg-teal-50/60 hover:bg-teal-100 transition-colors"
                                        title="Edit project scope, stack, budget, or timeline"
                                    >
                                        <Pencil className="h-3.5 w-3.5 text-teal-700" />
                                        <span>Edit Project Scope</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowSrsModal(true)}
                                        className="text-xs sm:text-sm font-semibold flex items-center gap-1.5"
                                    >
                                        <FileText className="h-3.5 w-3.5 text-dudos-primary" />
                                        <span>View Generated SRS</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowQaModal(true)}
                                        className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-teal-300 text-teal-800 bg-teal-50/50 hover:bg-teal-50"
                                    >
                                        <Sliders className="h-3.5 w-3.5 text-teal-700" />
                                        <span>Refine AI Q&A</span>
                                    </Button>

                                    {activeDraft.status === "draft" && (
                                        <Button
                                            size="sm"
                                            onClick={
                                                handleConfirmSpecifications
                                            }
                                            className="bg-dudos-primary hover:bg-dudos-primary-hover text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs"
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                            <span>Confirm Specifications</span>
                                        </Button>
                                    )}

                                    {activeDraft.status === "approved" && (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                setShowDeploymentModal(true)
                                            }
                                            className="bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs"
                                        >
                                            <Rocket className="h-3.5 w-3.5" />
                                            <span>Request Live Deployment</span>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Project Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                        Business Domain
                                    </span>
                                    <p className="text-sm font-bold text-slate-900 leading-snug">
                                        {activeDraft.businessDomain}
                                    </p>
                                    {activeDraft.siteUrl && (
                                        <a
                                            href={activeDraft.siteUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-teal-700 hover:underline flex items-center gap-1 mt-1.5 font-medium"
                                        >
                                            <span>
                                                Ref: {activeDraft.siteUrl}
                                            </span>
                                            <ExternalLink className="h-3 w-3 shrink-0" />
                                        </a>
                                    )}
                                </div>

                                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                        Target Architecture
                                    </span>
                                    <p className="text-sm font-bold text-slate-900 leading-snug">
                                        {activeDraft.targetStack}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1.5 font-medium">
                                        {editableQa.multiTenant === "yes"
                                            ? "Multi-Tenant Isolation"
                                            : "Single Tenant Instance"}
                                    </p>
                                </div>

                                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                        Commercial Expectations
                                    </span>
                                    <p className="text-sm font-bold text-slate-900 leading-snug">
                                        {activeDraft.budgetExpectation}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1.5 font-medium">
                                        Timeline: {activeDraft.expectedTimeline}
                                    </p>
                                </div>

                                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                        Contact Stakeholder
                                    </span>
                                    <p className="text-sm font-bold text-slate-900 leading-snug">
                                        {activeDraft.contactName ||
                                            activeDraft.organizationName ||
                                            "Client Stakeholder"}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1.5 font-mono">
                                        {activeDraft.email}
                                    </p>
                                </div>
                            </div>

                            {/* Business Scope Statement */}
                            <div className="bg-slate-50/90 p-5 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
                                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <FolderKanban className="h-4 w-4 text-dudos-primary" />
                                        Project Scope Statement
                                    </span>
                                    <button
                                        onClick={handleOpenEditProject}
                                        className="text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                        <Pencil className="h-3 w-3" />
                                        Edit Scope Details
                                    </button>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-normal">
                                    {activeDraft.projectScope}
                                </p>
                            </div>

                            {/* AI-Guided Q&A Final Summary Pill */}
                            <div className="bg-teal-50/60 border border-teal-200 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="p-2.5 rounded-lg bg-teal-600 text-white shrink-0">
                                        <Sparkles className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <h4 className="text-sm font-bold text-teal-950">
                                            AI-Guided Q&A Final Specification
                                        </h4>
                                        <p className="text-xs sm:text-sm text-teal-800 mt-1 font-medium flex flex-wrap gap-x-3 gap-y-0.5">
                                            <span>
                                                Multi-Tenancy:{" "}
                                                <strong>
                                                    {editableQa.multiTenant ===
                                                    "yes"
                                                        ? "Enabled"
                                                        : "Single Tenant"}
                                                </strong>
                                            </span>
                                            <span>·</span>
                                            <span>
                                                Gateways:{" "}
                                                <strong>
                                                    {editableQa.paymentGateway}
                                                </strong>
                                            </span>
                                            <span>·</span>
                                            <span>
                                                Scale:{" "}
                                                <strong>
                                                    {editableQa.userScale}
                                                </strong>
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowQaModal(true)}
                                    className="text-xs sm:text-sm bg-white border-teal-300 text-teal-900 hover:bg-teal-100/60 font-semibold"
                                >
                                    <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                                    <span>Modify Q&A Responses</span>
                                </Button>
                            </div>

                            {/* Phase 3: Commercial Gate (Pricing Exists vs Does Not Exist) */}
                            {activeDraft.status === "submitted" &&
                                !relevantInvoice && (
                                    <div className="p-5 rounded-xl border border-amber-300 bg-amber-50/60 space-y-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-amber-700" />
                                                    <span>
                                                        Commercial Phase:
                                                        Pricing & Technical
                                                        Estimation Gate
                                                    </span>
                                                </h4>
                                                <p className="text-xs text-amber-800 mt-1">
                                                    Your specifications are
                                                    locked. Choose whether to
                                                    activate standard build
                                                    staging via
                                                    <strong>
                                                        {" "}
                                                        1,000 Credits
                                                    </strong>
                                                    , or await formal custom
                                                    technical estimation from
                                                    the Tech Team.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                                            <Button
                                                size="sm"
                                                onClick={
                                                    handleActivateViaCredits
                                                }
                                                className="bg-dudos-primary hover:bg-dudos-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                                            >
                                                <Coins className="h-3.5 w-3.5" />
                                                <span>
                                                    Activate Build via 1,000
                                                    Credits
                                                </span>
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={
                                                    handleSimulateAdminQuotation
                                                }
                                                className="text-xs bg-white border-amber-300 text-amber-900 hover:bg-amber-100/80 flex items-center gap-1.5"
                                            >
                                                <Zap className="h-3.5 w-3.5 text-amber-600" />
                                                <span>
                                                    Request Technical Quotation
                                                </span>
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    setShowCreditModal(true)
                                                }
                                                className="text-xs text-amber-900"
                                            >
                                                <span>
                                                    Purchase Credits / View
                                                    Packages →
                                                </span>
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
                                                Project Approved · DevScope
                                                Builder Staged
                                            </h4>
                                            <p className="text-xs text-emerald-800 mt-0.5">
                                                Commercial milestone paid and
                                                verified. Your project
                                                architecture is approved and
                                                queued in DevScope AI Builder.
                                            </p>
                                            {activeDraft.buildId && (
                                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-emerald-900 font-mono">
                                                    <span className="px-2 py-0.5 rounded bg-emerald-200/80 font-bold">
                                                        Build ID:{" "}
                                                        {activeDraft.buildId}
                                                    </span>
                                                    {activeDraft.devscopeStatus && (
                                                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase text-[10px] font-bold">
                                                            {
                                                                activeDraft.devscopeStatus
                                                            }
                                                        </span>
                                                    )}
                                                    {activeDraft.previewUrl && (
                                                        <a
                                                            href={
                                                                activeDraft.previewUrl
                                                            }
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
                                        onClick={() =>
                                            setShowDeploymentModal(true)
                                        }
                                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                                    >
                                        <Server className="h-3.5 w-3.5" />
                                        <span>
                                            Launch Managed Deployment Ticket
                                        </span>
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
                                                    Managed Deployment in
                                                    Progress · Tech Team
                                                    Provisioning
                                                </h4>
                                                <p className="text-xs text-teal-800 mt-0.5">
                                                    Target Domain:{" "}
                                                    <strong>
                                                        {activeDraft.domainName ||
                                                            "Custom Domain"}
                                                    </strong>{" "}
                                                    · Infrastructure:{" "}
                                                    <strong>
                                                        Daffodil Cloud Linux VPS
                                                    </strong>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                onClick={
                                                    handleSimulateDeployLive
                                                }
                                                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                                            >
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                <span>
                                                    Simulate Tech Team
                                                    Deployment (Mark Live)
                                                </span>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white/90 rounded-xl border border-teal-200 text-xs text-teal-900 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <span className="text-xs text-teal-800 uppercase font-bold tracking-wide block mb-1">
                                                DNS CNAME / A Target
                                            </span>
                                            <span className="font-mono font-bold text-slate-800 text-sm">
                                                {activeDraft.domainName ||
                                                    "domain.com"}{" "}
                                                ➔ 103.145.118.42
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-teal-800 uppercase font-bold tracking-wide block mb-1">
                                                DNS Verification Status
                                            </span>
                                            <span className="font-semibold text-amber-700 flex items-center gap-1.5 text-xs sm:text-sm">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>
                                                    Awaiting Tech Verification /
                                                    Propagation
                                                </span>
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-teal-800 uppercase font-bold tracking-wide block mb-1">
                                                Security / SSL
                                            </span>
                                            <span className="font-semibold text-teal-800 flex items-center gap-1.5 text-xs sm:text-sm">
                                                <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                                                <span>
                                                    Auto-Provisioning 256-bit
                                                    TLS
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Phase 4: Live in Production Banner */}
                            {(activeDraft.status === "completed" ||
                                activeDraft.status === "live") && (
                                <div className="p-6 rounded-2xl border border-emerald-300 bg-emerald-50/80 space-y-4">
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="p-3 rounded-2xl bg-emerald-600 text-white shadow-xs">
                                                <Globe className="h-6 w-6" />
                                            </span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-base font-extrabold text-emerald-950">
                                                        Project Live in
                                                        Production 🚀
                                                    </h4>
                                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">
                                                        Production Ready
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-emerald-800 mt-1">
                                                    Your website application is
                                                    successfully deployed and
                                                    running on high-availability
                                                    Daffodil Cloud Linux
                                                    infrastructure.
                                                </p>
                                            </div>
                                        </div>

                                        <a
                                            href={
                                                activeDraft.liveUrl ||
                                                (activeDraft.domainName
                                                    ? `https://${activeDraft.domainName}`
                                                    : "#")
                                            }
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
                                        <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                                            <span className="text-xs uppercase font-bold text-slate-500 tracking-wide block mb-1">
                                                Live Domain
                                            </span>
                                            <span className="font-bold text-slate-900 font-mono text-sm truncate block">
                                                {activeDraft.domainName ||
                                                    "portal.daffodil.family"}
                                            </span>
                                            <span className="text-xs text-emerald-700 font-medium mt-1 block">
                                                HTTPS / TLS 1.3
                                            </span>
                                        </div>

                                        <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                                            <span className="text-xs uppercase font-bold text-slate-500 tracking-wide block mb-1">
                                                Server Target & IP
                                            </span>
                                            <span className="font-bold text-slate-900 font-mono text-sm block">
                                                {activeDraft.vpsIp ||
                                                    "103.145.118.42"}
                                            </span>
                                            <span className="text-xs text-slate-600 mt-1 block">
                                                Daffodil Cloud Linux VPS
                                            </span>
                                        </div>

                                        <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                                            <span className="text-xs uppercase font-bold text-slate-500 tracking-wide block mb-1">
                                                SSL Certificate
                                            </span>
                                            <span className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
                                                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                                <span>Active (256-bit)</span>
                                            </span>
                                            <span className="text-xs text-slate-600 mt-1 block">
                                                Auto-Renewed TLS
                                            </span>
                                        </div>

                                        <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                                            <span className="text-xs uppercase font-bold text-slate-500 tracking-wide block mb-1">
                                                System Health
                                            </span>
                                            <span className="font-bold text-emerald-800 text-sm block">
                                                200 OK · 99.98%
                                            </span>
                                            <span className="text-xs text-emerald-700 font-medium mt-1 block">
                                                Response: 38ms
                                            </span>
                                        </div>
                                    </div>

                                    {/* Handover & SRS quick actions */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-emerald-200/80">
                                        <span className="text-xs text-emerald-900 font-medium">
                                            Deployed on:{" "}
                                            {activeDraft.deployedAt
                                                ? new Date(
                                                      activeDraft.deployedAt,
                                                  ).toLocaleString()
                                                : new Date().toLocaleString()}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setShowSrsModal(true)
                                                }
                                                className="text-xs bg-white text-emerald-950 border-emerald-300 hover:bg-emerald-100/50"
                                            >
                                                <FileText className="h-3 w-3 mr-1" />
                                                View Handover Documentation &
                                                SRS
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
                                <h3 className="text-base font-bold text-dudos-text">
                                    No Active Project Draft Found
                                </h3>
                                <p className="text-xs text-dudos-text-secondary max-w-md mx-auto mt-1">
                                    Start by submitting your project
                                    specifications through our customer
                                    onboarding form. Your data will be
                                    automatically saved and fed into this
                                    workspace.
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-3 flex-wrap">
                                <Link
                                    href={
                                        lang
                                            ? `/${lang}/transform`
                                            : "/transform"
                                    }
                                >
                                    <Button
                                        size="sm"
                                        className="bg-dudos-primary hover:bg-dudos-primary-hover text-white text-xs font-semibold"
                                    >
                                        <Plus className="h-3.5 w-3.5 mr-1" />
                                        <span>
                                            {lang === "bn"
                                                ? "অ্যাসেসমেন্ট শুরু করুন (/transform)"
                                                : "Start Assessment Wizard"}
                                        </span>
                                    </Button>
                                </Link>
                                <Link
                                    href={
                                        lang
                                            ? `/${lang}/onboarding`
                                            : "/onboarding"
                                    }
                                >
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-[#dce5e9] text-xs font-semibold"
                                    >
                                        <span>
                                            {lang === "bn"
                                                ? "অনবোর্ডিং ফর্ম"
                                                : "Custom Onboarding Flow"}
                                        </span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* 4. Dispatched Formal Quotations / Billing Invoices */}
                    {relevantInvoice && (
                        <div className="bg-white rounded-xl p-6 border border-[#dce5e9] shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-[#dce5e9]">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <DollarSign className="h-5 w-5 text-emerald-600" />
                                    <h3 className="text-base font-bold text-slate-900">
                                        Formal Tech Estimation Quotation (
                                        {relevantInvoice.id})
                                    </h3>
                                    <Badge
                                        className={`text-xs px-2.5 py-0.5 font-semibold ${
                                            relevantInvoice.status === "paid"
                                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                                : "bg-purple-100 text-purple-800 border-purple-300"
                                        }`}
                                    >
                                        {relevantInvoice.status === "paid"
                                            ? "Quotation Accepted & Paid"
                                            : "Quotation Dispatched"}
                                    </Badge>
                                </div>

                                <span className="text-xs text-slate-500 font-mono">
                                    Dispatched:{" "}
                                    {new Date(
                                        relevantInvoice.dispatchedAt,
                                    ).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                        Total Man-Hours
                                    </span>
                                    <span className="text-lg font-bold text-slate-900 font-mono">
                                        {relevantInvoice.totalHours} hrs
                                    </span>
                                    <p className="text-xs text-slate-600 mt-1">
                                        Frontend:{" "}
                                        {relevantInvoice.manHours.frontend}h ·
                                        Backend:{" "}
                                        {relevantInvoice.manHours.backend}h
                                    </p>
                                </div>

                                <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                        Blended Hourly Rate
                                    </span>
                                    <span className="text-lg font-bold text-slate-900 font-mono">
                                        ৳
                                        {relevantInvoice.hourlyRate.toLocaleString()}{" "}
                                        / hr
                                    </span>
                                    <p className="text-xs text-slate-600 mt-1">
                                        Standard DUDOS Tech Rate
                                    </p>
                                </div>

                                <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                        Infrastructure & Cloud
                                    </span>
                                    <span className="text-lg font-bold text-slate-900 font-mono">
                                        ৳
                                        {relevantInvoice.infrastructureCost.toLocaleString()}
                                    </span>
                                    <p className="text-xs text-slate-600 mt-1">
                                        PostgreSQL & Staging VPS
                                    </p>
                                </div>

                                <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200">
                                    <span className="text-xs text-emerald-800 uppercase tracking-wider block mb-1 font-bold">
                                        Total Quotation (BDT)
                                    </span>
                                    <span className="text-2xl font-black text-emerald-700 font-mono">
                                        ৳
                                        {relevantInvoice.totalQuotationBDT.toLocaleString()}
                                    </span>
                                    <p className="text-xs text-emerald-800 mt-1 font-medium">
                                        Includes taxes & margin
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <p className="text-xs text-dudos-text-secondary">
                                    Quotation approved by DUDOS System
                                    Administrator. Acceptance triggers build
                                    repository staging.
                                </p>
                                {relevantInvoice.status !== "paid" ? (
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            setShowPaymentModal(true)
                                        }
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                        <span>
                                            Review & Pay Quotation (৳
                                            {relevantInvoice.totalQuotationBDT.toLocaleString()}
                                            )
                                        </span>
                                    </Button>
                                ) : (
                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 py-1 px-3">
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                        <span>
                                            Development Milestone Active & Paid
                                        </span>
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Support & Assistance Tickets Card */}
                    <div className="bg-white rounded-xl p-5 border border-[#dce5e9] shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#eef3f6]">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-[#edf7f4] text-[#087f79]">
                                    <LifeBuoy className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#162c38]">
                                        {lang === "bn"
                                            ? "গ্রাহক সহায়তা ও সাপোর্ট টিকিট"
                                            : "Customer Support & Assistance Tickets"}
                                    </h3>
                                    <p className="text-xs text-[#5b6f7b]">
                                        {lang === "bn"
                                            ? "প্রযুক্তিগত সমস্যা, ডেপ্লয়মেন্ট সহায়তা বা বিলিং সংক্রান্ত প্রশ্ন এখানে ট্র্যাক করুন।"
                                            : "Track technical issues, deployment help, or billing questions with our engineering team."}
                                    </p>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => setShowSupportModal(true)}
                                className="bg-[#087f79] hover:bg-[#066762] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>
                                    {lang === "bn"
                                        ? "নতুন টিকিট"
                                        : "New Support Ticket"}
                                </span>
                            </Button>
                        </div>

                        {supportTickets.length === 0 ? (
                            <div className="py-6 text-center text-xs text-[#5b6f7b] bg-[#f8fafb] rounded-xl border border-dashed border-[#dce5e9]">
                                <p className="font-medium text-[#162c38]">
                                    No active support tickets.
                                </p>
                                <p className="text-[11px] mt-1">
                                    Need help with DNS, APIs, or Billing? Submit
                                    a ticket anytime and our team will assist
                                    you within SLA.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {supportTickets.map((t) => (
                                    <div
                                        key={t.id}
                                        className="p-4 rounded-xl border border-[#dce5e9] bg-[#f8fafb] hover:bg-white transition-colors space-y-2 text-xs"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-[#162c38] text-sm">
                                                    {t.subject}
                                                </span>
                                                <span className="text-[10px] font-mono text-[#5b6f7b]">
                                                    #
                                                    {t.id
                                                        .slice(-6)
                                                        .toUpperCase()}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] uppercase font-semibold border-[#dce5e9] text-[#5b6f7b]"
                                                >
                                                    {t.category}
                                                </Badge>
                                                <Badge
                                                    className={`text-[10px] uppercase font-semibold ${
                                                        t.priority ===
                                                        "critical"
                                                            ? "bg-red-100 text-red-800 border-red-200"
                                                            : t.priority ===
                                                                "high"
                                                              ? "bg-amber-100 text-amber-800 border-amber-200"
                                                              : "bg-slate-100 text-slate-700 border-slate-200"
                                                    }`}
                                                >
                                                    {t.priority}
                                                </Badge>
                                            </div>
                                            <Badge
                                                className={`text-xs font-semibold ${
                                                    t.status === "resolved" ||
                                                    t.status === "closed"
                                                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                                        : t.status ===
                                                            "in_progress"
                                                          ? "bg-blue-100 text-blue-800 border-blue-300"
                                                          : "bg-amber-100 text-amber-800 border-amber-300"
                                                }`}
                                            >
                                                {t.status === "in_progress"
                                                    ? "In Progress"
                                                    : t.status === "resolved"
                                                      ? "Resolved"
                                                      : "Open"}
                                            </Badge>
                                        </div>

                                        <p className="text-[#5b6f7b] text-xs leading-relaxed">
                                            {t.message}
                                        </p>

                                        {t.adminResponse && (
                                            <div className="p-3 bg-[#edf7f4] rounded-lg border border-[#c2e2dc] text-xs space-y-1 mt-2">
                                                <div className="flex items-center justify-between text-[11px] font-bold text-[#087f79]">
                                                    <span>
                                                        Technical Team Response:
                                                    </span>
                                                    {t.resolvedAt && (
                                                        <span className="text-[#5b6f7b] font-normal text-[10px]">
                                                            Resolved:{" "}
                                                            {new Date(
                                                                t.resolvedAt,
                                                            ).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[#162c38] text-xs">
                                                    {t.adminResponse}
                                                </p>
                                            </div>
                                        )}

                                        <div className="text-[10px] text-[#5b6f7b] pt-1 border-t border-[#eef3f6] flex items-center justify-between">
                                            <span>
                                                Created:{" "}
                                                {new Date(
                                                    t.createdAt,
                                                ).toLocaleString()}
                                            </span>
                                            {t.projectId && (
                                                <span className="font-mono">
                                                    Project: {t.projectId}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* 2. Focused Section: My Projects */}
            {activeSection === "projects" && (
                <div className="space-y-6">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">
                                <span />
                                {lang === "bn"
                                    ? "পোর্টফোলিও ও প্রজেক্ট"
                                    : "PORTFOLIO & SOLUTIONS"}
                            </p>
                            <h1>
                                {lang === "bn"
                                    ? "আমার প্রজেক্ট ও ওয়ার্কস্পেস"
                                    : "My Projects & Solutions"}
                            </h1>
                            <p>
                                {lang === "bn"
                                    ? "আপনার সমস্ত ক্লায়েন্ট প্রজেক্ট দেখুন, সক্রিয় প্রজেক্ট পরিবর্তন করুন এবং এসআরএস স্পেসিফিকেশন পরিচালনা করুন।"
                                    : "Manage your client projects portfolio, inspect SRS requirements, and launch DevScope AI builds."}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <Link href="/onboarding">
                                <Button
                                    size="sm"
                                    className="bg-[#087f79] hover:bg-[#066762] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>
                                        {lang === "bn"
                                            ? "নতুন প্রজেক্ট অনবোর্ডিং"
                                            : "New Project Onboarding"}
                                    </span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#dce5e9] shadow-xs">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <Input
                                placeholder="Search projects by name, stack, domain..."
                                value={projectSearch}
                                onChange={(e) =>
                                    setProjectSearch(e.target.value)
                                }
                                className="pl-8 text-xs bg-[#f8fafb] border-[#dce5e9] h-8"
                            />
                        </div>
                        <div className="text-xs text-[#5b6f7b]">
                            Total Projects:{" "}
                            <strong>{displayedProjects.length}</strong>
                        </div>
                    </div>

                    {/* Projects Grid */}
                    {displayedProjects.length === 0 ? (
                        <div className="p-8 text-center rounded-xl border border-dashed border-[#dce5e9] bg-white space-y-3">
                            <FolderKanban className="h-8 w-8 text-[#5b6f7b] mx-auto" />
                            <p className="text-xs font-medium text-[#162c38]">
                                No projects registered yet.
                            </p>
                            <p className="text-[11px] text-[#5b6f7b] max-w-sm mx-auto">
                                Submit an onboarding draft to launch your first
                                custom software solution.
                            </p>
                            <Link href="/onboarding">
                                <Button
                                    size="sm"
                                    className="bg-[#087f79] text-white text-xs mt-2"
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                    Start Onboarding Flow
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {displayedProjects
                                .filter((p) => {
                                    if (!projectSearch.trim()) return true;
                                    const q = projectSearch.toLowerCase();
                                    return (
                                        (p.title &&
                                            p.title
                                                .toLowerCase()
                                                .includes(q)) ||
                                        (p.name &&
                                            p.name.toLowerCase().includes(q)) ||
                                        (p.targetStack &&
                                            p.targetStack
                                                .toLowerCase()
                                                .includes(q)) ||
                                        (p.target_stack &&
                                            p.target_stack
                                                .toLowerCase()
                                                .includes(q)) ||
                                        (p.businessDomain &&
                                            p.businessDomain
                                                .toLowerCase()
                                                .includes(q))
                                    );
                                })
                                .map((p) => {
                                    const isActive = activeDraft?.id === p.id;
                                    const isLive =
                                        p.status === "completed" ||
                                        p.status === "live";
                                    const isDeploying =
                                        p.status === "deploying";
                                    const isApproved = p.status === "approved";
                                    const pTitle = p.title || p.name;
                                    const pStack =
                                        p.targetStack ||
                                        p.target_stack ||
                                        "Next.js 16 + FastAPI";
                                    const pDomain =
                                        p.domainName || p.domain_name;
                                    const pBuildId = p.buildId || p.build_id;
                                    const pLiveUrl = p.liveUrl || p.live_url;

                                    return (
                                        <div
                                            key={p.id}
                                            className={`p-5 rounded-2xl border transition-all ${
                                                isActive
                                                    ? "bg-teal-50/30 border-teal-400 ring-2 ring-teal-200"
                                                    : "bg-white border-[#dce5e9] shadow-xs hover:border-slate-300"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#eef3f6]">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-sm text-[#162c38]">
                                                            {pTitle}
                                                        </h3>
                                                        {isActive && (
                                                            <Badge className="bg-[#087f79] text-white text-[10px]">
                                                                Active Project
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-[#5b6f7b] mt-0.5 font-mono text-[11px]">
                                                        ID: {p.id} ·{" "}
                                                        {p.businessDomain ||
                                                            p.category ||
                                                            "Custom Software"}
                                                    </p>
                                                </div>

                                                <Badge
                                                    className={
                                                        isLive
                                                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]"
                                                            : isDeploying
                                                              ? "bg-teal-100 text-teal-800 border-teal-300 text-[10px]"
                                                              : isApproved
                                                                ? "bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]"
                                                                : p.status ===
                                                                    "quoted"
                                                                  ? "bg-purple-100 text-purple-800 border-purple-300 text-[10px]"
                                                                  : "bg-amber-100 text-amber-800 border-amber-300 text-[10px]"
                                                    }
                                                >
                                                    {isLive
                                                        ? "Live in Production 🚀"
                                                        : isDeploying
                                                          ? "Deploying to VPS"
                                                          : isApproved
                                                            ? "Approved & Staged"
                                                            : p.status ===
                                                                "quoted"
                                                              ? "Quotation Dispatched"
                                                              : p.status ===
                                                                  "submitted"
                                                                ? "In Tech Estimation"
                                                                : "Draft / Scoping"}
                                                </Badge>
                                            </div>

                                            <div className="py-3 space-y-2 text-xs text-[#5b6f7b]">
                                                <div className="flex items-center justify-between">
                                                    <span>
                                                        Target Architecture:
                                                    </span>
                                                    <span className="font-semibold text-[#162c38]">
                                                        {pStack}
                                                    </span>
                                                </div>
                                                {pDomain && (
                                                    <div className="flex items-center justify-between">
                                                        <span>
                                                            Target Domain:
                                                        </span>
                                                        <span className="font-mono text-[#087f79] font-bold">
                                                            {pDomain}
                                                        </span>
                                                    </div>
                                                )}
                                                {pBuildId && (
                                                    <div className="flex items-center justify-between">
                                                        <span>
                                                            DevScope Build ID:
                                                        </span>
                                                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-bold text-slate-800">
                                                            {pBuildId}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#eef3f6]">
                                                <div className="flex items-center gap-1.5">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            switchActiveProject(
                                                                p.id,
                                                            );
                                                            setShowSrsModal(
                                                                true,
                                                            );
                                                        }}
                                                        className="text-xs h-7 px-2.5 bg-white border-[#dce5e9] text-[#162c38]"
                                                    >
                                                        <FileText className="h-3 w-3 mr-1 text-[#087f79]" />
                                                        SRS Specs
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            switchActiveProject(
                                                                p.id,
                                                            );
                                                            setShowQaModal(
                                                                true,
                                                            );
                                                        }}
                                                        className="text-xs h-7 px-2.5 bg-white border-[#dce5e9] text-[#162c38]"
                                                    >
                                                        <Sliders className="h-3 w-3 mr-1 text-[#087f79]" />
                                                        AI Q&A
                                                    </Button>
                                                </div>

                                                <div>
                                                    {!isActive ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                switchActiveProject(
                                                                    p.id,
                                                                )
                                                            }
                                                            className="text-xs h-7 bg-[#087f79] hover:bg-[#066762] text-white"
                                                        >
                                                            Switch to this
                                                            Project
                                                        </Button>
                                                    ) : isLive && pLiveUrl ? (
                                                        <a
                                                            href={pLiveUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                                                        >
                                                            <span>
                                                                Visit Live URL
                                                            </span>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    ) : isApproved ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                switchActiveProject(
                                                                    p.id,
                                                                );
                                                                setShowDeploymentModal(
                                                                    true,
                                                                );
                                                            }}
                                                            className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        >
                                                            Deploy to VPS
                                                        </Button>
                                                    ) : (
                                                        <span className="text-[11px] text-teal-700 font-semibold">
                                                            Active Selection
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            )}

            {/* 3. Focused Section: Deployments & Domains */}
            {activeSection === "deployments" && (
                <div className="space-y-6">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">
                                <span />
                                {lang === "bn"
                                    ? "ইনফ্রাস্ট্রাকচার ও ডোমেন"
                                    : "INFRASTRUCTURE & FLEET"}
                            </p>
                            <h1>
                                {lang === "bn"
                                    ? "প্রোডাকশন ডিপ্লয়মেন্ট ও ডোমেন"
                                    : "Production Deployments & Managed Domains"}
                            </h1>
                            <p>
                                {lang === "bn"
                                    ? "আপনার কাস্টম ডোমেন ম্যাপিং, ডিএনএস রুট ও ভিপিএস সার্ভার ডিপ্লয়মেন্ট স্ট্যাটাস পরিচালনা করুন।"
                                    : "Manage custom domain mapping, verify DNS CNAME propagation, and track Daffodil Cloud Linux VPS deployments."}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <Button
                                size="sm"
                                onClick={() => setShowDeploymentModal(true)}
                                className="bg-[#087f79] hover:bg-[#066762] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                            >
                                <Server className="h-3.5 w-3.5" />
                                <span>
                                    {lang === "bn"
                                        ? "নতুন ডোমেন ডিপ্লয়মেন্ট টিকিট"
                                        : "Request Domain Deployment"}
                                </span>
                            </Button>
                        </div>
                    </div>

                    {/* DNS Target Routing Banner */}
                    <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-teal-800 block mb-0.5">
                                DNS CNAME / A Target
                            </span>
                            <span className="font-mono font-bold text-slate-800">
                                yourdomain.com ➔ 103.145.118.42
                            </span>
                            <p className="text-[10px] text-teal-700 mt-0.5">
                                Daffodil Cloud Linux VPS
                            </p>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-teal-800 block mb-0.5">
                                TLS / SSL Protection
                            </span>
                            <span className="font-bold text-emerald-700 flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Auto 256-bit TLS (Let's Encrypt)</span>
                            </span>
                            <p className="text-[10px] text-teal-700 mt-0.5">
                                Automated Certificate Manager
                            </p>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-teal-800 block mb-0.5">
                                High-Availability Proxy
                            </span>
                            <span className="font-bold text-slate-800">
                                Nginx Reverse Proxy & Load Balancer
                            </span>
                            <p className="text-[10px] text-teal-700 mt-0.5">
                                Ports 80 / 443 with HTTP2
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#dce5e9] shadow-xs">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <Input
                                placeholder="Search deployments by domain or project..."
                                value={deploymentSearch}
                                onChange={(e) =>
                                    setDeploymentSearch(e.target.value)
                                }
                                className="pl-8 text-xs bg-[#f8fafb] border-[#dce5e9] h-8"
                            />
                        </div>
                        <div className="text-xs text-[#5b6f7b]">
                            Total Deployment Tickets:{" "}
                            <strong>{deploymentTickets.length}</strong>
                        </div>
                    </div>

                    {/* Deployments List */}
                    {deploymentTickets.length === 0 ? (
                        <div className="p-8 text-center rounded-xl border border-dashed border-[#dce5e9] bg-white space-y-3">
                            <Rocket className="h-8 w-8 text-[#5b6f7b] mx-auto" />
                            <p className="text-xs font-medium text-[#162c38]">
                                No domain deployments requested yet.
                            </p>
                            <p className="text-[11px] text-[#5b6f7b] max-w-sm mx-auto">
                                Once your project specifications are approved,
                                request domain mapping to connect your VPS
                                server.
                            </p>
                            <Button
                                size="sm"
                                onClick={() => setShowDeploymentModal(true)}
                                className="bg-[#087f79] text-white text-xs mt-2"
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Submit Deployment Request
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {deploymentTickets
                                .filter((t) => {
                                    if (!deploymentSearch.trim()) return true;
                                    const q = deploymentSearch.toLowerCase();
                                    return (
                                        (t.domainName &&
                                            t.domainName
                                                .toLowerCase()
                                                .includes(q)) ||
                                        (t.projectTitle &&
                                            t.projectTitle
                                                .toLowerCase()
                                                .includes(q))
                                    );
                                })
                                .map((t) => {
                                    const isLive = t.status === "live";
                                    const isDnsVerified =
                                        t.dnsStatus === "verified" || isLive;
                                    const liveUrl =
                                        t.liveUrl || `https://${t.domainName}`;

                                    return (
                                        <div
                                            key={t.id}
                                            className={`p-5 rounded-2xl border transition-all ${
                                                isLive
                                                    ? "bg-emerald-50/30 border-emerald-300"
                                                    : "bg-white border-[#dce5e9] shadow-xs"
                                            }`}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#eef3f6]">
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`p-2.5 rounded-xl ${
                                                            isLive
                                                                ? "bg-emerald-600 text-white"
                                                                : "bg-slate-100 text-slate-700"
                                                        }`}
                                                    >
                                                        <Globe className="h-5 w-5" />
                                                    </span>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-bold text-[#162c38] font-mono">
                                                                {t.domainName}
                                                            </h4>
                                                            {isLive ? (
                                                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                                                                    Live in
                                                                    Production
                                                                    🚀
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">
                                                                    Pending Tech
                                                                    Review
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-[#5b6f7b] mt-0.5">
                                                            Project:{" "}
                                                            <strong>
                                                                {t.projectTitle}
                                                            </strong>{" "}
                                                            · Target:{" "}
                                                            <strong>
                                                                {t.serverTarget ||
                                                                    "Daffodil Cloud Linux"}
                                                            </strong>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] text-[#5b6f7b] font-mono">
                                                        Ticket: #
                                                        {t.id
                                                            .slice(-6)
                                                            .toUpperCase()}
                                                    </span>
                                                    {isLive && (
                                                        <a
                                                            href={liveUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                                                        >
                                                            <span>
                                                                Visit Production
                                                                URL
                                                            </span>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 text-xs">
                                                <div className="p-3 bg-white/80 rounded-xl border border-slate-200">
                                                    <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">
                                                        DNS Status
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span
                                                            className={`w-2 h-2 rounded-full ${isDnsVerified ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}
                                                        />
                                                        <span className="font-semibold text-slate-800">
                                                            {isDnsVerified
                                                                ? "CNAME Verified & Routed"
                                                                : "Pending Propagation"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-white/80 rounded-xl border border-slate-200">
                                                    <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">
                                                        Assigned VPS IP
                                                    </span>
                                                    <span className="font-mono font-bold text-slate-800">
                                                        {t.assignedIp ||
                                                            "103.145.118.42"}
                                                    </span>
                                                </div>
                                                <div className="p-3 bg-white/80 rounded-xl border border-slate-200">
                                                    <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">
                                                        SSL TLS Certificate
                                                    </span>
                                                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                                                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                                        <span>
                                                            {isLive
                                                                ? "256-bit TLS Active"
                                                                : "Auto-Provisioning"}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>

                                            {t.specialInstructions && (
                                                <p className="text-[11px] text-amber-900 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200">
                                                    <strong>Note:</strong>{" "}
                                                    {t.specialInstructions}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            )}

            {/* 4. Focused Section: Customer Support & Helpdesk */}
            {activeSection === "support" && (
                <div className="space-y-6">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">
                                <span />
                                {lang === "bn"
                                    ? "সহায়তা ও গ্রাহক সেবা"
                                    : "CUSTOMER CARE & SLA"}
                            </p>
                            <h1>
                                {lang === "bn"
                                    ? "গ্রাহক সহায়তা ও সাপোর্ট হেল্পডেস্ক"
                                    : "Customer Support & Technical Helpdesk"}
                            </h1>
                            <p>
                                {lang === "bn"
                                    ? "প্রযুক্তিগত সমস্যা, ডেপ্লয়মেন্ট সহায়তা বা বিলিং সংক্রান্ত প্রশ্ন এখানে ট্র্যাক করুন।"
                                    : "Track technical issues, deployment assistance, and communicate directly with the DUDOS engineering team."}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <Button
                                size="sm"
                                onClick={() => setShowSupportModal(true)}
                                className="bg-[#087f79] hover:bg-[#066762] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>
                                    {lang === "bn"
                                        ? "নতুন সাপোর্ট টিকিট"
                                        : "New Support Ticket"}
                                </span>
                            </Button>
                        </div>
                    </div>

                    {/* Search & Filter Toolbar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#dce5e9] shadow-xs">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <Input
                                placeholder="Search subject, message, or ticket ID..."
                                value={supportSearch}
                                onChange={(e) =>
                                    setSupportSearch(e.target.value)
                                }
                                className="pl-8 text-xs bg-[#f8fafb] border-[#dce5e9] h-8"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={supportFilter}
                                onChange={(e) =>
                                    setSupportFilter(e.target.value)
                                }
                                className="text-xs h-8 px-2.5 rounded-lg bg-[#f8fafb] border border-[#dce5e9] text-[#162c38] outline-none"
                            >
                                <option value="all">All Statuses</option>
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                            <span className="text-xs text-[#5b6f7b]">
                                Total: <strong>{supportTickets.length}</strong>{" "}
                                tickets
                            </span>
                        </div>
                    </div>

                    {/* Tickets List */}
                    {supportTickets.length === 0 ? (
                        <div className="p-8 text-center rounded-xl border border-dashed border-[#dce5e9] bg-white space-y-3">
                            <LifeBuoy className="h-8 w-8 text-[#5b6f7b] mx-auto" />
                            <p className="text-xs font-medium text-[#162c38]">
                                No active support tickets.
                            </p>
                            <p className="text-[11px] text-[#5b6f7b] max-w-sm mx-auto">
                                Need help with DNS, APIs, billing, or custom
                                modules? Submit a ticket anytime.
                            </p>
                            <Button
                                size="sm"
                                onClick={() => setShowSupportModal(true)}
                                className="bg-[#087f79] text-white text-xs mt-2"
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Open Support Ticket
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {supportTickets
                                .filter((t) => {
                                    if (
                                        supportFilter !== "all" &&
                                        t.status !== supportFilter
                                    )
                                        return false;
                                    if (!supportSearch.trim()) return true;
                                    const q = supportSearch.toLowerCase();
                                    return (
                                        (t.subject &&
                                            t.subject
                                                .toLowerCase()
                                                .includes(q)) ||
                                        (t.message &&
                                            t.message
                                                .toLowerCase()
                                                .includes(q)) ||
                                        (t.id && t.id.toLowerCase().includes(q))
                                    );
                                })
                                .map((t) => (
                                    <div
                                        key={t.id}
                                        className="p-5 rounded-2xl border border-[#dce5e9] bg-white shadow-xs space-y-3 text-xs"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#eef3f6]">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-[#162c38] text-sm">
                                                    {t.subject}
                                                </span>
                                                <span className="font-mono text-[10px] text-[#5b6f7b]">
                                                    #
                                                    {t.id
                                                        .slice(-6)
                                                        .toUpperCase()}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] uppercase font-semibold border-[#dce5e9]"
                                                >
                                                    {t.category}
                                                </Badge>
                                                <Badge
                                                    className={`text-[10px] uppercase font-semibold ${
                                                        t.priority ===
                                                        "critical"
                                                            ? "bg-red-100 text-red-800 border-red-200"
                                                            : t.priority ===
                                                                "high"
                                                              ? "bg-amber-100 text-amber-800 border-amber-200"
                                                              : "bg-slate-100 text-slate-700 border-slate-200"
                                                    }`}
                                                >
                                                    {t.priority}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    className={`text-xs font-semibold ${
                                                        t.status ===
                                                            "resolved" ||
                                                        t.status === "closed"
                                                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                                            : t.status ===
                                                                "in_progress"
                                                              ? "bg-blue-100 text-blue-800 border-blue-300"
                                                              : "bg-amber-100 text-amber-800 border-amber-300"
                                                    }`}
                                                >
                                                    {t.status === "in_progress"
                                                        ? "In Progress"
                                                        : t.status ===
                                                            "resolved"
                                                          ? "Resolved"
                                                          : "Open"}
                                                </Badge>
                                                <span className="text-[11px] text-[#5b6f7b]">
                                                    {new Date(
                                                        t.createdAt,
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-[#162c38] text-xs leading-relaxed bg-[#f8fafb] p-3 rounded-xl border border-[#eef3f6]">
                                            {t.message}
                                        </p>

                                        {t.adminResponse && (
                                            <div className="p-3 bg-[#edf7f4] rounded-xl border border-[#c2e2dc] text-xs space-y-1">
                                                <div className="flex items-center justify-between text-[11px] font-bold text-[#087f79]">
                                                    <span>
                                                        Technical Team Response:
                                                    </span>
                                                    {t.resolvedAt && (
                                                        <span className="text-[#5b6f7b] font-normal text-[10px]">
                                                            Resolved:{" "}
                                                            {new Date(
                                                                t.resolvedAt,
                                                            ).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[#162c38] text-xs">
                                                    {t.adminResponse}
                                                </p>
                                            </div>
                                        )}

                                        <div className="text-[10px] text-[#5b6f7b] pt-1 border-t border-[#eef3f6] flex items-center justify-between">
                                            <span>
                                                Submitted by:{" "}
                                                <strong>
                                                    {t.customerEmail ||
                                                        t.userId}
                                                </strong>
                                            </span>
                                            {t.projectId && (
                                                <span className="font-mono">
                                                    Project: {t.projectId}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            )}

            {/* 5. Phase 3: Quotation Payment Modal Dialog */}
            <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-emerald-600" />
                            <span>
                                Commercial Payment: Quotation{" "}
                                {relevantInvoice?.id}
                            </span>
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Select payment method to pay the approved commercial
                            milestone for {relevantInvoice?.projectTitle}.
                        </DialogDescription>
                    </DialogHeader>

                    {relevantInvoice && (
                        <div className="space-y-4 py-2 text-xs">
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                                <div>
                                    <span className="text-[11px] text-emerald-800 block">
                                        Total Payable:
                                    </span>
                                    <span className="text-lg font-bold text-emerald-900 font-mono">
                                        ৳
                                        {relevantInvoice.totalQuotationBDT.toLocaleString()}
                                    </span>
                                </div>
                                <Badge
                                    variant="outline"
                                    className="bg-white text-emerald-800 border-emerald-300"
                                >
                                    {relevantInvoice.totalHours} Estimated Hours
                                </Badge>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-semibold text-dudos-text">
                                    Select Payment Gateway / Method:
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        {
                                            id: "bkash",
                                            label: "bKash / Nagad MFS",
                                            desc: "Local Instant Gateway",
                                        },
                                        {
                                            id: "card",
                                            label: "Debit / Credit Card",
                                            desc: "Visa / Mastercard",
                                        },
                                        {
                                            id: "credits",
                                            label: "Wallet Credits",
                                            desc: "Deduct 1,000 credits",
                                        },
                                        {
                                            id: "bank",
                                            label: "Corporate Bank Wire",
                                            desc: "Invoice / PO Net-30",
                                        },
                                    ].map((m) => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() =>
                                                setPaymentMethod(m.id as any)
                                            }
                                            className={`p-3 rounded-xl border text-left transition-all ${
                                                paymentMethod === m.id
                                                    ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-300/40"
                                                    : "border-[#dce5e9] bg-white text-dudos-text hover:bg-slate-50"
                                            }`}
                                        >
                                            <span className="font-bold block">
                                                {m.label}
                                            </span>
                                            <span className="text-[10px] text-dudos-text-secondary">
                                                {m.desc}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {paymentMethod === "bkash" && (
                                <div className="space-y-1.5 p-3 rounded-xl bg-pink-50/50 border border-pink-200">
                                    <Label className="text-[11px] font-semibold text-pink-950 flex items-center gap-1">
                                        <Phone className="h-3 w-3 text-pink-600" />
                                        <span>
                                            bKash / Nagad Wallet Number:
                                        </span>
                                    </Label>
                                    <Input
                                        value={mfsPhone}
                                        onChange={(e) =>
                                            setMfsPhone(e.target.value)
                                        }
                                        placeholder="017XXXXXXXX"
                                        className="h-8 text-xs bg-white"
                                    />
                                    <span className="text-[10px] text-pink-800 block">
                                        Instant sandbox simulation: Confirms
                                        immediately without OTP.
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
                            <span>
                                Generated Software Requirements Specification
                                (SRS)
                            </span>
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Autonomous SRS generated from your onboarding data
                            and AI-guided Q&A answers.
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
                                        navigator.clipboard.writeText(
                                            generateSrsMarkdown(activeDraft),
                                        );
                                        showToast.success(
                                            "SRS copied to clipboard!",
                                        );
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
                            Update answers to automatically recalibrate
                            technical requirements and stack estimations.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2 text-xs">
                        <div className="space-y-1.5">
                            <Label className="font-semibold text-dudos-text">
                                Multi-Tenancy & Data Isolation:
                            </Label>
                            <select
                                value={editableQa.multiTenant}
                                onChange={(e) =>
                                    setEditableQa({
                                        ...editableQa,
                                        multiTenant: e.target.value,
                                    })
                                }
                                className="w-full h-9 px-3 rounded-lg border border-[#dce5e9] text-xs bg-white text-dudos-text"
                            >
                                <option value="yes">
                                    Yes - Strict Multi-Tenant Data Isolation
                                    (Row-Level Security)
                                </option>
                                <option value="no">
                                    No - Single-Tenant Dedicated Database
                                </option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="font-semibold text-dudos-text">
                                Primary Payment Gateway Requirement:
                            </Label>
                            <select
                                value={editableQa.paymentGateway}
                                onChange={(e) =>
                                    setEditableQa({
                                        ...editableQa,
                                        paymentGateway: e.target.value,
                                    })
                                }
                                className="w-full h-9 px-3 rounded-lg border border-[#dce5e9] text-xs bg-white text-dudos-text"
                            >
                                <option value="bKash, Nagad & Online Gateway">
                                    bKash, Nagad & Local MFS (Bangladesh)
                                </option>
                                <option value="Stripe & Global Credit Cards">
                                    Stripe & International Credit Cards (USD /
                                    EUR)
                                </option>
                                <option value="Dual Currency (bKash + Stripe)">
                                    Dual Currency (bKash + Stripe)
                                </option>
                                <option value="No Payment Gateway">
                                    No Payment Gateway Required (Catalog /
                                    Inquiry only)
                                </option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="font-semibold text-dudos-text">
                                Expected Daily Active Users & Concurrency:
                            </Label>
                            <select
                                value={editableQa.userScale}
                                onChange={(e) =>
                                    setEditableQa({
                                        ...editableQa,
                                        userScale: e.target.value,
                                    })
                                }
                                className="w-full h-9 px-3 rounded-lg border border-[#dce5e9] text-xs bg-white text-dudos-text"
                            >
                                <option value="1,000 - 5,000 users">
                                    Startup Tier: 1,000 - 5,000 DAU
                                </option>
                                <option value="10,000 - 50,000 users">
                                    Growth Tier: 10,000 - 50,000 DAU
                                </option>
                                <option value="100,000+ users">
                                    Enterprise Tier: 100,000+ High-Concurrency
                                    Scale
                                </option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="font-semibold text-dudos-text">
                                Database Engine Preference:
                            </Label>
                            <select
                                value={editableQa.databaseChoice}
                                onChange={(e) =>
                                    setEditableQa({
                                        ...editableQa,
                                        databaseChoice: e.target.value,
                                    })
                                }
                                className="w-full h-9 px-3 rounded-lg border border-[#dce5e9] text-xs bg-white text-dudos-text"
                            >
                                <option value="PostgreSQL with Row-Level Security">
                                    PostgreSQL 16 (Recommended for RLS &
                                    FastAPI)
                                </option>
                                <option value="Supabase / Cloud Managed PG">
                                    Supabase Managed Cloud Postgres
                                </option>
                                <option value="MySQL 8.0">
                                    MySQL 8.0 Enterprise
                                </option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-[#dce5e9]">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowQaModal(false)}
                            className="text-xs"
                        >
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

            {/* Edit Project Scope & Specifications Modal */}
            <Dialog
                open={showEditProjectModal}
                onOpenChange={setShowEditProjectModal}
            >
                <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Pencil className="h-5 w-5 text-dudos-primary" />
                            <span>Edit Project Scope & Specifications</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Update your project details, architecture
                            preferences, timeline, and functional requirements.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">
                                    Project Title *
                                </Label>
                                <Input
                                    value={editProjectForm.title}
                                    onChange={(e) =>
                                        setEditProjectForm({
                                            ...editProjectForm,
                                            title: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Daffodil Enterprise ERP"
                                    className="text-sm h-10"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">
                                    Organization / Company Name
                                </Label>
                                <Input
                                    value={editProjectForm.organizationName}
                                    onChange={(e) =>
                                        setEditProjectForm({
                                            ...editProjectForm,
                                            organizationName: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Daffodil Group Ltd."
                                    className="text-sm h-10"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">
                                    Business Domain / Industry
                                </Label>
                                <Input
                                    value={editProjectForm.businessDomain}
                                    onChange={(e) =>
                                        setEditProjectForm({
                                            ...editProjectForm,
                                            businessDomain: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Supply Chain & Logistics, Healthcare, FinTech"
                                    className="text-sm h-10"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">
                                    Target Architecture / Stack
                                </Label>
                                <Input
                                    value={editProjectForm.targetStack}
                                    onChange={(e) =>
                                        setEditProjectForm({
                                            ...editProjectForm,
                                            targetStack: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Next.js 16 + FastAPI + PostgreSQL 16"
                                    className="text-sm h-10"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">
                                    Commercial Budget Expectation
                                </Label>
                                <Input
                                    value={editProjectForm.budgetExpectation}
                                    onChange={(e) =>
                                        setEditProjectForm({
                                            ...editProjectForm,
                                            budgetExpectation: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. ৳150,000 – ৳350,000 BDT or $2,500 – $5,000 USD"
                                    className="text-sm h-10"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">
                                    Expected Delivery Timeline
                                </Label>
                                <Input
                                    value={editProjectForm.expectedTimeline}
                                    onChange={(e) =>
                                        setEditProjectForm({
                                            ...editProjectForm,
                                            expectedTimeline: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. 4-8 Weeks"
                                    className="text-sm h-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700">
                                Reference Website or System URL
                            </Label>
                            <Input
                                value={editProjectForm.siteUrl}
                                onChange={(e) =>
                                    setEditProjectForm({
                                        ...editProjectForm,
                                        siteUrl: e.target.value,
                                    })
                                }
                                placeholder="https://example.com or existing web app URL"
                                className="text-sm h-10"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700">
                                Comprehensive Project Scope Statement *
                            </Label>
                            <Textarea
                                rows={5}
                                value={editProjectForm.projectScope}
                                onChange={(e) =>
                                    setEditProjectForm({
                                        ...editProjectForm,
                                        projectScope: e.target.value,
                                    })
                                }
                                placeholder="Describe your desired outcomes, modules & scope, existing integrations, user roles, and business rules..."
                                className="text-sm leading-relaxed p-3"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowEditProjectModal(false)}
                            className="text-xs sm:text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSaveProject}
                            className="bg-dudos-primary hover:bg-dudos-primary-hover text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5"
                        >
                            <Check className="h-4 w-4" />
                            <span>Save & Update Scope</span>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 8. Credit Wallet Modal Integration */}
            <CreditWalletModal
                open={activeSection === "billing" || showCreditModal}
                onOpenChange={(open) => {
                    setShowCreditModal(open);
                    if (!open && activeSection === "billing") {
                        router.push(`/${lang}/app/overview`);
                    }
                }}
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

            {/* 10. Customer Support Modal Integration */}
            <CustomerSupportModal
                open={showSupportModal}
                onOpenChange={setShowSupportModal}
                projects={allProjects}
                currentProjectId={activeDraft?.id}
                onSubmitted={() => loadWorkspaceData()}
                lang={lang}
            />
        </div>
    );
}
