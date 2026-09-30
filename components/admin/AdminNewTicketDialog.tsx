"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { UserProfile } from "@/types/auth";
import { getAuthToken } from "@/lib/dudos/assessment-sync";
import { showToast } from "@/lib/toast";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

// Same options as the client-side ticket form.
const CATEGORIES = [
    ["technical", "Technical Support"],
    ["billing", "Billing & Credits"],
    ["deployment", "Deployment & Domain"],
    ["feature", "Feature Request"],
    ["general", "General Inquiry"],
] as const;

const PRIORITIES = [
    ["low", "Low"],
    ["normal", "Normal"],
    ["high", "High"],
    ["critical", "Critical"],
] as const;

type ClientProject = { id: string; name: string; userId: string };

const EMPTY_FORM = {
    userId: "",
    projectId: "",
    category: "technical",
    priority: "normal",
    subject: "",
    message: "",
};

const selectClass =
    "h-9 w-full rounded-md border border-dudos-border bg-white px-3 text-sm text-dudos-text";

/** Admin opens a ticket on behalf of a client; it appears in their Support page. */
export function AdminNewTicketDialog({
    open,
    onOpenChange,
    clients,
    onCreated,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clients: UserProfile[];
    onCreated: () => void;
}) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [projects, setProjects] = useState<ClientProject[]>([]);
    const [saving, setSaving] = useState(false);

    // Projects let the ticket point at a specific order.
    useEffect(() => {
        if (!open) return;
        const token = getAuthToken();
        let cancelled = false;
        fetch(`${API_BASE}/admin/projects`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                if (!cancelled && Array.isArray(data)) setProjects(data);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [open]);

    const clientProjects = projects.filter(
        (project) => project.userId === form.userId,
    );
    const canSubmit =
        Boolean(form.userId) &&
        form.subject.trim().length > 0 &&
        form.message.trim().length > 0;

    const close = (next: boolean) => {
        if (!next) setForm(EMPTY_FORM);
        onOpenChange(next);
    };

    const submit = async () => {
        if (!canSubmit) return;
        setSaving(true);
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_BASE}/admin/support/tickets`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    ...form,
                    projectId: form.projectId || null,
                    subject: form.subject.trim(),
                    message: form.message.trim(),
                }),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                showToast.error("Could not create ticket", {
                    description:
                        res.status === 401 || res.status === 403
                            ? "Sign in with an administrator account."
                            : body?.detail,
                });
                return;
            }
            showToast.success("Ticket created", {
                description: `Visible in ${body.customerName || "the client"}'s Support page.`,
            });
            onCreated();
            close(false);
        } catch {
            showToast.error("Could not reach the DUDOS backend");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto bg-white">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold">
                        New support ticket
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Open a ticket on behalf of a client. It appears in their
                        Support & Helpdesk page.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 text-sm">
                    <div className="space-y-1.5">
                        <Label htmlFor="ticket-client" className="text-xs font-semibold">
                            Client
                        </Label>
                        <select
                            id="ticket-client"
                            value={form.userId}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    userId: event.target.value,
                                    projectId: "",
                                })
                            }
                            className={selectClass}
                        >
                            <option value="">Select a client…</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.displayName} · {client.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ticket-project" className="text-xs font-semibold">
                            Project (optional)
                        </Label>
                        <select
                            id="ticket-project"
                            value={form.projectId}
                            disabled={!form.userId}
                            onChange={(event) =>
                                setForm({ ...form, projectId: event.target.value })
                            }
                            className={selectClass}
                        >
                            <option value="">General account inquiry (no project)</option>
                            {clientProjects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name.replace(/\s+—\s+Transformation Project$/, "")}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="ticket-category" className="text-xs font-semibold">
                                Category
                            </Label>
                            <select
                                id="ticket-category"
                                value={form.category}
                                onChange={(event) =>
                                    setForm({ ...form, category: event.target.value })
                                }
                                className={selectClass}
                            >
                                {CATEGORIES.map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="ticket-priority" className="text-xs font-semibold">
                                Priority
                            </Label>
                            <select
                                id="ticket-priority"
                                value={form.priority}
                                onChange={(event) =>
                                    setForm({ ...form, priority: event.target.value })
                                }
                                className={selectClass}
                            >
                                {PRIORITIES.map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ticket-subject" className="text-xs font-semibold">
                            Subject
                        </Label>
                        <Input
                            id="ticket-subject"
                            value={form.subject}
                            maxLength={200}
                            onChange={(event) =>
                                setForm({ ...form, subject: event.target.value })
                            }
                            className="h-9 text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ticket-message" className="text-xs font-semibold">
                            Message to the client
                        </Label>
                        <Textarea
                            id="ticket-message"
                            value={form.message}
                            rows={4}
                            onChange={(event) =>
                                setForm({ ...form, message: event.target.value })
                            }
                            className="text-sm"
                        />
                    </div>

                    <div className="flex justify-end gap-2 border-t border-dudos-border pt-3">
                        <Button size="sm" variant="outline" onClick={() => close(false)}>
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            disabled={!canSubmit || saving}
                            onClick={() => void submit()}
                        >
                            {saving ? "Creating…" : "Create ticket"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
