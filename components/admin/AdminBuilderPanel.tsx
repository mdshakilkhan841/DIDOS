"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ExternalLink, FileText, Play, RefreshCw, RotateCcw, ScrollText, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_BASE, authHeaders } from "@/lib/dudos/packages";
import { showToast } from "@/lib/toast";

export type BuilderState = {
    slug?: string;
    status?: string;
    stage?: string;
    progress?: number;
    framework?: string;
    workflowMode?: string;
    workflowProfile?: string;
    executionTier?: string;
    failureCategory?: string;
    latestLog?: string;
    fixAttempts?: number;
    costUsd?: number;
    appUrl?: string;
    manualDecisionRequired?: boolean;
    unitsTotal?: number;
    unitsCompleted?: number;
    startedAt?: string;
    syncedAt?: string;
    retries?: number;
    error?: string;
    syncError?: string;
};

type Overview = {
    configured: boolean;
    autoStart: boolean;
    canStart: boolean;
    requirement: string;
    requirementSent: boolean;
    dashboardUrl?: string | null;
    state: BuilderState;
};

const ACTIVE = new Set([
    "pending", "queued", "preparing", "planning", "building", "running", "fixing",
    "validating", "deploying", "verifying", "testing", "publishing", "waiting_approval",
]);

/** Builder status as a badge, for the project table and this panel. */
export function builderBadge(state?: BuilderState | null): { label: string; className: string } {
    if (!state || (!state.slug && !state.error)) {
        return { label: "Not started", className: "border-slate-300 bg-slate-50 text-slate-600" };
    }
    if (!state.slug && state.error) {
        return { label: "Start failed", className: "border-rose-300 bg-rose-50 text-rose-800" };
    }
    const status = state.status || "queued";
    if (status === "success") return { label: "Build ready", className: "border-emerald-300 bg-emerald-50 text-emerald-800" };
    if (status === "failed") return { label: "Failed", className: "border-rose-300 bg-rose-50 text-rose-800" };
    if (status === "cancelled" || status === "stopped") {
        return { label: "Stopped", className: "border-slate-300 bg-slate-100 text-slate-700" };
    }
    if (status === "waiting_approval") {
        return { label: "Needs decision", className: "border-amber-300 bg-amber-50 text-amber-800" };
    }
    return {
        label: `${status.replace(/_/g, " ")}${state.progress ? ` · ${state.progress}%` : ""}`,
        className: "border-sky-300 bg-sky-50 text-sky-800 capitalize",
    };
}

const formatTime = (value?: string) => (value ? new Date(value).toLocaleString() : "—");

/**
 * Builder controls for one project: the brief sent to the builder, live status,
 * logs, and start / retry / stop. Starting a build spends builder tokens, so it
 * always asks for a second click.
 */
export function AdminBuilderPanel<T extends { id: string }>({
    projectId,
    onProjectChange,
}: {
    projectId: string;
    onProjectChange: (project: T) => void;
}) {
    const [overview, setOverview] = useState<Overview | null>(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState<string | null>(null);
    const [confirmStart, setConfirmStart] = useState(false);
    const [showBrief, setShowBrief] = useState(false);
    const [logLines, setLogLines] = useState<string[] | null>(null);

    const load = useCallback(async (): Promise<{ data: Overview | null; error: string }> => {
        try {
            const res = await fetch(`${API_BASE}/admin/projects/${projectId}/builder`, {
                headers: authHeaders(),
                cache: "no-store",
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) return { data: null, error: body?.detail || `Request failed (${res.status})` };
            return { data: body as Overview, error: "" };
        } catch {
            return { data: null, error: "Could not reach the DUDOS backend." };
        }
    }, [projectId]);

    const apply = useCallback((result: { data: Overview | null; error: string }) => {
        setOverview(result.data);
        setError(result.error);
    }, []);

    useEffect(() => {
        let cancelled = false;
        void load().then((result) => {
            if (!cancelled) apply(result);
        });
        return () => {
            cancelled = true;
        };
    }, [load, apply]);

    // Keep an active build's status fresh while the panel is open.
    const running = ACTIVE.has(overview?.state?.status || "");
    useEffect(() => {
        if (!running) return;
        const timer = window.setInterval(() => void load().then(apply), 15000);
        return () => window.clearInterval(timer);
    }, [running, load, apply]);

    const act = async (action: "start" | "stop" | "refresh") => {
        setBusy(action);
        setConfirmStart(false);
        try {
            const res = await fetch(`${API_BASE}/admin/projects/${projectId}/builder/${action}`, {
                method: "POST",
                headers: authHeaders(),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                showToast.error(action === "start" ? "Could not start the build" : "Builder request failed", {
                    description: body?.detail,
                });
            } else {
                onProjectChange(body as T);
                if (action === "start") showToast.success("Build queued", { description: "The builder is working on it." });
                if (action === "stop") showToast.info("Build stopped");
            }
        } catch {
            showToast.error("Could not reach the DUDOS backend");
        } finally {
            apply(await load());
            setBusy(null);
        }
    };

    const loadLogs = async () => {
        setBusy("logs");
        try {
            const res = await fetch(`${API_BASE}/admin/projects/${projectId}/builder-logs`, {
                headers: authHeaders(),
                cache: "no-store",
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body?.detail);
            setLogLines(body.lines || []);
        } catch (err) {
            showToast.error("Could not load the build log", { description: (err as Error).message });
        } finally {
            setBusy(null);
        }
    };

    if (error) {
        return <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p>;
    }
    if (!overview) {
        return <p className="rounded-lg border border-dudos-border p-3 text-xs text-dudos-text-secondary">Loading builder…</p>;
    }

    const state = overview.state || {};
    const badge = builderBadge(state);
    const status = state.status || "";
    const failed = ["failed", "cancelled", "stopped"].includes(status);
    const startLabel = state.slug && failed ? "Retry build" : "Start build";

    return (
        <section className="space-y-3 rounded-lg border border-dudos-border p-3" aria-label="Builder">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-dudos-text-secondary">Builder</p>
                    <Badge variant="outline" className={`text-[10px] ${badge.className}`}>
                        {badge.label}
                    </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {state.slug && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" disabled={busy !== null} onClick={() => void act("refresh")}>
                            <RefreshCw className={`mr-1 h-3.5 w-3.5 ${busy === "refresh" ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    )}
                    {running && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" disabled={busy !== null} onClick={() => void act("stop")}>
                            <Square className="mr-1 h-3.5 w-3.5" />
                            Stop
                        </Button>
                    )}
                    {overview.canStart && overview.configured && !confirmStart && (
                        <Button size="sm" className="h-7 text-xs" disabled={busy !== null} onClick={() => setConfirmStart(true)}>
                            {state.slug ? <RotateCcw className="mr-1 h-3.5 w-3.5" /> : <Play className="mr-1 h-3.5 w-3.5" />}
                            {startLabel}
                        </Button>
                    )}
                </div>
            </div>

            {confirmStart && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900">
                    <span>This runs the AI builder and uses builder tokens. {startLabel} now?</span>
                    <span className="flex gap-1.5">
                        <Button size="sm" variant="outline" className="h-7 bg-white text-xs" onClick={() => setConfirmStart(false)}>
                            Cancel
                        </Button>
                        <Button size="sm" className="h-7 text-xs" disabled={busy !== null} onClick={() => void act("start")}>
                            {busy === "start" ? "Starting…" : `Yes, ${startLabel.toLowerCase()}`}
                        </Button>
                    </span>
                </div>
            )}

            {!overview.configured && (
                <p className="rounded-md border border-dashed border-dudos-border p-2.5 text-xs text-dudos-text-secondary">
                    The builder is not connected. Set <code>BUILDER_API_KEY</code> (or <code>API_KEYS</code>) in the backend <code>.env</code>.
                </p>
            )}
            {overview.configured && !state.slug && !overview.canStart && (
                <p className="rounded-md border border-dashed border-dudos-border p-2.5 text-xs text-dudos-text-secondary">
                    The build can start once the client has paid and submitted the project.
                </p>
            )}
            {overview.configured && !state.slug && overview.canStart && (
                <p className="text-xs text-dudos-text-secondary">
                    {overview.autoStart
                        ? "Auto-start is on, but this build has not started yet. Start it here."
                        : "Auto-start is off (BUILDER_AUTO_START). Review the brief below, then start the build."}
                </p>
            )}
            {(state.error || state.syncError) && (
                <p className="rounded-md border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
                    {state.error || `Status check failed: ${state.syncError}`}
                </p>
            )}

            {state.slug && (
                <>
                    <div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-dudos-text">{state.stage || status}</span>
                            <span className="text-dudos-text-secondary">{state.progress ?? 0}%</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                            <div
                                className={`h-full rounded-full ${failed ? "bg-rose-500" : status === "success" ? "bg-emerald-500" : "bg-dudos-primary"}`}
                                style={{ width: `${Math.min(100, Math.max(0, state.progress ?? 0))}%` }}
                            />
                        </div>
                    </div>
                    {state.manualDecisionRequired && (
                        <p className="rounded-md border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900">
                            The builder is waiting for a decision. Answer it in the builder dashboard.
                        </p>
                    )}
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        {(
                            [
                                ["Build ID", <span key="slug" className="font-mono">{state.slug}</span>],
                                ["Workflow", [state.workflowMode, state.workflowProfile, state.executionTier].filter(Boolean).join(" · ") || "—"],
                                ["Framework", state.framework || "—"],
                                ["Cost", state.costUsd != null ? `$${Number(state.costUsd).toFixed(2)}` : "—"],
                                ["Started", formatTime(state.startedAt)],
                                ["Checked", formatTime(state.syncedAt)],
                                ...(state.unitsTotal ? [["Work units", `${state.unitsCompleted || 0} / ${state.unitsTotal}`] as const] : []),
                                ...(state.failureCategory ? [["Failure", state.failureCategory] as const] : []),
                            ] as [string, ReactNode][]
                        ).map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-dudos-text-secondary">{label}</dt>
                                <dd className="font-medium text-dudos-text">{value}</dd>
                            </div>
                        ))}
                    </dl>
                    {state.latestLog && (
                        <p className="rounded-md bg-slate-900 px-2.5 py-2 font-mono text-[11px] text-slate-100">{state.latestLog}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs">
                        {state.appUrl && (
                            <a href={state.appUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-dudos-primary hover:underline">
                                Open generated app <ExternalLink className="h-3 w-3" />
                            </a>
                        )}
                        {overview.dashboardUrl && (
                            <a href={overview.dashboardUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-dudos-primary hover:underline">
                                Builder dashboard <ExternalLink className="h-3 w-3" />
                            </a>
                        )}
                        <button type="button" onClick={() => void loadLogs()} disabled={busy !== null} className="inline-flex cursor-pointer items-center gap-1 font-semibold text-dudos-primary hover:underline">
                            <ScrollText className="h-3 w-3" />
                            {busy === "logs" ? "Loading log…" : logLines ? "Reload log" : "View build log"}
                        </button>
                    </div>
                    {logLines && (
                        <pre className="max-h-56 overflow-auto rounded-md bg-slate-900 p-2.5 text-[11px] leading-relaxed text-slate-100">
                            {logLines.length ? logLines.join("\n") : "No log lines yet."}
                        </pre>
                    )}
                </>
            )}

            <div>
                <button
                    type="button"
                    onClick={() => setShowBrief((open) => !open)}
                    className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-dudos-primary hover:underline"
                >
                    <FileText className="h-3 w-3" />
                    {showBrief ? "Hide" : "View"} {overview.requirementSent ? "brief sent to the builder" : "brief that will be sent"}
                </button>
                {showBrief && (
                    <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-dudos-border bg-[#f8fafb] p-2.5 text-[11px] leading-relaxed text-dudos-text">
                        {overview.requirement}
                    </pre>
                )}
            </div>
        </section>
    );
}
