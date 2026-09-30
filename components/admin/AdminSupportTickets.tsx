"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LifeBuoy, Plus, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { UserProfile } from "@/types/auth";
import { getAuthToken } from "@/lib/dudos/assessment-sync";
import { showToast } from "@/lib/toast";
import { AdminNewTicketDialog } from "./AdminNewTicketDialog";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

type Ticket = {
    id: string;
    userId: string;
    projectId?: string | null;
    category: string;
    subject: string;
    message: string;
    priority: string;
    status: string;
    adminResponse?: string | null;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string | null;
    customerEmail?: string | null;
    customerName?: string | null;
};

// Must match TICKET_STATUSES / TICKET_PRIORITIES in the backend.
const STATUSES = [
    { id: "open", label: "Open", className: "border-amber-300 bg-amber-50 text-amber-800" },
    { id: "in_progress", label: "In progress", className: "border-sky-300 bg-sky-50 text-sky-800" },
    { id: "resolved", label: "Resolved", className: "border-emerald-300 bg-emerald-50 text-emerald-800" },
    { id: "closed", label: "Closed", className: "border-slate-300 bg-slate-50 text-slate-600" },
] as const;

const PRIORITIES = [
    { id: "low", label: "Low", className: "text-slate-500" },
    { id: "normal", label: "Normal", className: "text-slate-700" },
    { id: "high", label: "High", className: "font-semibold text-amber-700" },
    { id: "critical", label: "Critical", className: "font-semibold text-rose-700" },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
    technical: "Technical",
    billing: "Billing & credits",
    deployment: "Deployment & domain",
    feature: "Feature request",
    general: "General",
};

// Open work first, then most recently updated.
const STATUS_ORDER: Record<string, number> = { open: 0, in_progress: 1, resolved: 2, closed: 3 };

const statusMeta = (status: string) =>
    STATUSES.find((item) => item.id === status) || STATUSES[0];
const priorityMeta = (priority: string) =>
    PRIORITIES.find((item) => item.id === priority) || PRIORITIES[1];
const formatDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString() : "—";

function authHeaders(json = false): Record<string, string> {
    const token = getAuthToken();
    return {
        ...(json ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

type LoadResult = { tickets: Ticket[]; projectNames: Record<string, string>; error: string };

async function fetchTickets(): Promise<LoadResult> {
    try {
        const [ticketRes, projectRes] = await Promise.all([
            fetch(`${API_BASE}/admin/support/tickets`, { headers: authHeaders(), cache: "no-store" }),
            fetch(`${API_BASE}/admin/projects`, { headers: authHeaders(), cache: "no-store" }),
        ]);
        if (ticketRes.status === 401 || ticketRes.status === 403) {
            return { tickets: [], projectNames: {}, error: "Sign in with an administrator account to view tickets." };
        }
        if (!ticketRes.ok) throw new Error(String(ticketRes.status));
        const tickets = await ticketRes.json();
        const projects = projectRes.ok ? await projectRes.json() : [];
        const projectNames: Record<string, string> = {};
        for (const project of Array.isArray(projects) ? projects : []) {
            projectNames[project.id] = String(project.name || "").replace(
                /\s+—\s+Transformation Project$/,
                "",
            );
        }
        return { tickets: Array.isArray(tickets) ? tickets : [], projectNames, error: "" };
    } catch {
        return {
            tickets: [],
            projectNames: {},
            error: "Could not reach the DUDOS backend. Check that the API server is running.",
        };
    }
}

export function AdminSupportTickets({ clients }: { clients: UserProfile[] }) {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [projectNames, setProjectNames] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<"all" | string>("all");
    const [search, setSearch] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [selected, setSelected] = useState<Ticket | null>(null);
    const [form, setForm] = useState({ status: "open", priority: "normal", reply: "" });
    const [saving, setSaving] = useState(false);

    const apply = useCallback((result: LoadResult) => {
        setTickets(result.tickets);
        setProjectNames(result.projectNames);
        setError(result.error);
        setLoading(false);
    }, []);

    const reload = () => {
        setLoading(true);
        void fetchTickets().then(apply);
    };

    useEffect(() => {
        let cancelled = false;
        void fetchTickets().then((result) => {
            if (!cancelled) apply(result);
        });
        return () => {
            cancelled = true;
        };
    }, [apply]);

    const counts = useMemo(() => {
        const result: Record<string, number> = { all: tickets.length };
        for (const ticket of tickets) result[ticket.status] = (result[ticket.status] || 0) + 1;
        return result;
    }, [tickets]);

    const query = search.trim().toLowerCase();
    const visible = tickets
        .filter(
            (ticket) =>
                (filter === "all" || ticket.status === filter) &&
                (!query ||
                    [ticket.subject, ticket.message, ticket.customerName, ticket.customerEmail, ticket.id]
                        .some((value) => (value || "").toLowerCase().includes(query))),
        )
        .sort(
            (a, b) =>
                (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0) ||
                String(b.updatedAt).localeCompare(String(a.updatedAt)),
        );

    const openTicket = (ticket: Ticket) => {
        setSelected(ticket);
        setForm({ status: ticket.status, priority: ticket.priority, reply: ticket.adminResponse || "" });
    };

    const unchanged =
        !selected ||
        (form.status === selected.status &&
            form.priority === selected.priority &&
            form.reply.trim() === (selected.adminResponse || "").trim());

    const save = async () => {
        if (!selected || unchanged) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/admin/support/tickets/${selected.id}`, {
                method: "PATCH",
                headers: authHeaders(true),
                body: JSON.stringify({
                    status: form.status !== selected.status ? form.status : undefined,
                    priority: form.priority !== selected.priority ? form.priority : undefined,
                    adminResponse:
                        form.reply.trim() !== (selected.adminResponse || "").trim()
                            ? form.reply
                            : undefined,
                }),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                showToast.error("Ticket not updated", {
                    description:
                        res.status === 401 || res.status === 403
                            ? "Sign in with an administrator account."
                            : body?.detail,
                });
                return;
            }
            setTickets((prev) => prev.map((ticket) => (ticket.id === body.id ? body : ticket)));
            setSelected(null);
            showToast.success("Ticket updated", {
                description: `${statusMeta(body.status).label} · the client sees this in their Support page.`,
            });
        } catch {
            showToast.error("Could not reach the DUDOS backend");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="space-y-5" aria-labelledby="admin-support-title">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">
                        <span />
                        DELIVERY & SUPPORT
                    </p>
                    <h1 id="admin-support-title">Customer Support Tickets</h1>
                    <p>Answer client tickets, set their status, or open a ticket on a client&apos;s behalf.</p>
                </div>
                <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline" onClick={reload} disabled={loading}>
                        <RefreshCw className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={() => setShowNew(true)}>
                        <Plus className="mr-1 h-4 w-4" />
                        New ticket
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by status">
                    {[{ id: "all", label: "All" }, ...STATUSES].map((item) => {
                        const isActive = filter === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setFilter(item.id)}
                                className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                    isActive
                                        ? "border-dudos-primary bg-dudos-primary text-white"
                                        : "border-dudos-border bg-white text-dudos-text-secondary hover:bg-slate-50"
                                }`}
                            >
                                {item.label}{" "}
                                <span className={isActive ? "text-white/80" : "text-slate-400"}>
                                    {counts[item.id] || 0}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                        aria-label="Search tickets"
                        placeholder="Search subject, client or ticket ID…"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="h-8 bg-white pl-8 text-xs"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-dudos-border bg-white">
                {error ? (
                    <p className="p-8 text-center text-sm text-rose-700">{error}</p>
                ) : loading && tickets.length === 0 ? (
                    <p className="p-8 text-center text-sm text-dudos-text-secondary">Loading tickets…</p>
                ) : visible.length === 0 ? (
                    <div className="p-8 text-center">
                        <LifeBuoy className="mx-auto h-8 w-8 text-slate-400" />
                        <p className="mt-2 text-sm text-dudos-text-secondary">
                            {tickets.length === 0 ? "No support tickets yet." : "No tickets match this filter."}
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ticket</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Updated</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visible.map((ticket) => {
                                const status = statusMeta(ticket.status);
                                const priority = priorityMeta(ticket.priority);
                                return (
                                    <TableRow
                                        key={ticket.id}
                                        onClick={() => openTicket(ticket)}
                                        className="cursor-pointer"
                                    >
                                        <TableCell className="max-w-xs">
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    openTicket(ticket);
                                                }}
                                                className="block max-w-full cursor-pointer truncate text-left font-semibold text-dudos-text hover:underline"
                                            >
                                                {ticket.subject}
                                            </button>
                                            <p className="truncate text-xs text-dudos-text-secondary">
                                                #{ticket.id.slice(-6).toUpperCase()}
                                                {ticket.projectId &&
                                                    ` · ${projectNames[ticket.projectId] || ticket.projectId}`}
                                                {ticket.adminResponse && " · replied"}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm text-dudos-text">{ticket.customerName || "—"}</p>
                                            <p className="text-xs text-dudos-text-secondary">{ticket.customerEmail}</p>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {CATEGORY_LABELS[ticket.category] || ticket.category}
                                        </TableCell>
                                        <TableCell className={`text-xs ${priority.className}`}>{priority.label}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={status.className}>
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs">{formatDateTime(ticket.updatedAt)}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>

            <AdminNewTicketDialog
                open={showNew}
                onOpenChange={setShowNew}
                clients={clients}
                onCreated={reload}
            />

            <Dialog
                open={Boolean(selected)}
                onOpenChange={(open) => {
                    if (!open) setSelected(null);
                }}
            >
                <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold">{selected?.subject}</DialogTitle>
                        <DialogDescription className="text-xs">
                            #{selected?.id.slice(-6).toUpperCase()} ·{" "}
                            {[selected?.customerName, selected?.customerEmail].filter(Boolean).join(" · ")}
                        </DialogDescription>
                    </DialogHeader>

                    {selected && (
                        <div className="space-y-4 text-sm">
                            <dl className="grid grid-cols-2 gap-3 rounded-lg border border-dudos-border bg-[#f8fafb] p-3 text-xs">
                                <div>
                                    <dt className="text-dudos-text-secondary">Category</dt>
                                    <dd className="font-medium">{CATEGORY_LABELS[selected.category] || selected.category}</dd>
                                </div>
                                <div>
                                    <dt className="text-dudos-text-secondary">Project</dt>
                                    <dd className="font-medium">
                                        {selected.projectId ? projectNames[selected.projectId] || selected.projectId : "General account"}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-dudos-text-secondary">Opened</dt>
                                    <dd className="font-medium">{formatDateTime(selected.createdAt)}</dd>
                                </div>
                                <div>
                                    <dt className="text-dudos-text-secondary">Resolved</dt>
                                    <dd className="font-medium">{formatDateTime(selected.resolvedAt)}</dd>
                                </div>
                            </dl>

                            <div>
                                <p className="text-xs font-semibold text-dudos-text-secondary">Message</p>
                                <p className="mt-1 whitespace-pre-line rounded-lg border border-dudos-border p-3 text-sm text-dudos-text">
                                    {selected.message}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="ticket-status" className="text-xs font-semibold">Status</Label>
                                    <select
                                        id="ticket-status"
                                        value={form.status}
                                        onChange={(event) => setForm({ ...form, status: event.target.value })}
                                        className="h-9 w-full rounded-md border border-dudos-border bg-white px-3 text-sm text-dudos-text"
                                    >
                                        {STATUSES.map((item) => (
                                            <option key={item.id} value={item.id}>{item.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="ticket-priority-edit" className="text-xs font-semibold">Priority</Label>
                                    <select
                                        id="ticket-priority-edit"
                                        value={form.priority}
                                        onChange={(event) => setForm({ ...form, priority: event.target.value })}
                                        className="h-9 w-full rounded-md border border-dudos-border bg-white px-3 text-sm text-dudos-text"
                                    >
                                        {PRIORITIES.map((item) => (
                                            <option key={item.id} value={item.id}>{item.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="ticket-reply" className="text-xs font-semibold">
                                    Reply to the client
                                </Label>
                                <Textarea
                                    id="ticket-reply"
                                    value={form.reply}
                                    rows={4}
                                    placeholder="Shown in the client's Support page."
                                    onChange={(event) => setForm({ ...form, reply: event.target.value })}
                                    className="text-sm"
                                />
                            </div>

                            <div className="flex justify-end gap-2 border-t border-dudos-border pt-3">
                                <Button size="sm" variant="outline" onClick={() => setSelected(null)}>
                                    Cancel
                                </Button>
                                <Button size="sm" disabled={unchanged || saving} onClick={() => void save()}>
                                    {saving ? "Saving…" : "Save changes"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}
