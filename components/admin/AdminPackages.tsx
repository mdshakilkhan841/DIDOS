"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Package, Pencil, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
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
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
    API_BASE,
    authHeaders,
    DEFAULT_UNIT,
    formatAmount,
    formatBdt,
    formatUsd,
    type DudosPackage,
    type PackageKind,
    UNIT_SUGGESTIONS,
} from "@/lib/dudos/packages";
import publicContent from "@/lib/dudos/public-content.json";
import { human } from "@/lib/i18n";
import { showToast } from "@/lib/toast";

const KINDS: { id: PackageKind; label: string; hint: string }[] = [
    {
        id: "build",
        label: "Build packages",
        hint: "What a client pays from their wallet (Credits, Tokens…) to send a project to the builder. The client picks one at the payment step.",
    },
    {
        id: "credit",
        label: "Top-up packs",
        hint: "Packs sold in the client's wallet: the amount granted (Credits, Tokens…) and the price in BDT/USD.",
    },
    {
        id: "public",
        label: "Website packages",
        hint: "Package cards on the public Packages page. Leave the price empty to show “Let’s scope it”.",
    },
];

type FormState = {
    name: string;
    nameBn: string;
    slug: string;
    description: string;
    descriptionBn: string;
    features: string;
    credits: string;
    unit: string;
    priceBdt: string;
    priceUsd: string;
    badge: string;
    sortOrder: string;
    active: boolean;
};

const emptyForm = (sortOrder: number): FormState => ({
    name: "",
    nameBn: "",
    slug: "",
    description: "",
    descriptionBn: "",
    features: "",
    credits: "",
    unit: DEFAULT_UNIT,
    priceBdt: "",
    priceUsd: "",
    badge: "",
    sortOrder: String(sortOrder),
    active: true,
});

const toForm = (pkg: DudosPackage): FormState => ({
    name: pkg.name,
    nameBn: pkg.nameBn || "",
    slug: pkg.slug || "",
    description: pkg.description || "",
    descriptionBn: pkg.descriptionBn || "",
    features: pkg.features.join("\n"),
    credits: pkg.credits?.toString() ?? "",
    unit: pkg.unit || DEFAULT_UNIT,
    priceBdt: pkg.priceBdt?.toString() ?? "",
    priceUsd: pkg.priceUsd?.toString() ?? "",
    badge: pkg.badge || "",
    sortOrder: String(pkg.sortOrder),
    active: pkg.active,
});

const numberOrNull = (value: string) => (value.trim() === "" ? null : Number(value));

type LoadResult = { packages: DudosPackage[]; error: string };

async function fetchAllPackages(): Promise<LoadResult> {
    try {
        const res = await fetch(`${API_BASE}/admin/packages`, {
            headers: authHeaders(),
            cache: "no-store",
        });
        if (res.status === 401 || res.status === 403) {
            return { packages: [], error: "Sign in with an administrator account to manage packages." };
        }
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        return { packages: Array.isArray(data) ? data : [], error: "" };
    } catch {
        return {
            packages: [],
            error: "Could not reach the DUDOS backend. Check that the API server is running.",
        };
    }
}

function priceText(pkg: DudosPackage): string {
    const money = [formatBdt(pkg.priceBdt), formatUsd(pkg.priceUsd)].filter(Boolean).join(" · ");
    if (pkg.kind === "build") return formatAmount(pkg.credits, pkg.unit);
    if (pkg.kind === "credit") return `${formatAmount(pkg.credits, pkg.unit)} for ${money || "—"}`;
    return money || "Custom quote";
}

export function AdminPackages() {
    const [packages, setPackages] = useState<DudosPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [kind, setKind] = useState<PackageKind>("build");
    const [editing, setEditing] = useState<DudosPackage | "new" | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm(0));
    const [saving, setSaving] = useState(false);
    const [busy, setBusy] = useState(false);

    const apply = useCallback((result: LoadResult) => {
        setPackages(result.packages);
        setError(result.error);
        setLoading(false);
    }, []);

    const reload = () => {
        setLoading(true);
        void fetchAllPackages().then(apply);
    };

    useEffect(() => {
        let cancelled = false;
        void fetchAllPackages().then((result) => {
            if (!cancelled) apply(result);
        });
        return () => {
            cancelled = true;
        };
    }, [apply]);

    const counts = useMemo(() => {
        const result: Record<string, number> = {};
        for (const pkg of packages) result[pkg.kind] = (result[pkg.kind] || 0) + 1;
        return result;
    }, [packages]);
    const rows = packages.filter((pkg) => pkg.kind === kind);
    const current = KINDS.find((item) => item.id === kind) || KINDS[0];

    const openNew = () => {
        const nextOrder = rows.length ? Math.max(...rows.map((pkg) => pkg.sortOrder)) + 1 : 0;
        setForm(emptyForm(nextOrder));
        setEditing("new");
    };
    const openEdit = (pkg: DudosPackage) => {
        setForm(toForm(pkg));
        setEditing(pkg);
    };

    const request = async (path: string, method: string, body?: unknown) => {
        const res = await fetch(`${API_BASE}${path}`, {
            method,
            headers: authHeaders(body !== undefined),
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.detail || `Request failed (${res.status})`);
        return data;
    };

    const save = async () => {
        if (!editing) return;
        setSaving(true);
        const payload = {
            name: form.name,
            nameBn: form.nameBn,
            slug: form.slug,
            description: form.description,
            descriptionBn: form.descriptionBn,
            features: form.features.split("\n"),
            credits: kind === "public" ? null : numberOrNull(form.credits),
            unit: kind === "public" ? null : form.unit,
            priceBdt: kind === "build" ? null : numberOrNull(form.priceBdt),
            priceUsd: kind === "build" ? null : numberOrNull(form.priceUsd),
            badge: form.badge,
            sortOrder: Number(form.sortOrder) || 0,
            active: form.active,
        };
        try {
            const saved: DudosPackage =
                editing === "new"
                    ? await request("/admin/packages", "POST", { ...payload, kind })
                    : await request(`/admin/packages/${editing.id}`, "PATCH", payload);
            setPackages((prev) =>
                editing === "new"
                    ? [...prev, saved]
                    : prev.map((pkg) => (pkg.id === saved.id ? saved : pkg)),
            );
            setEditing(null);
            showToast.success(editing === "new" ? "Package created" : "Package updated", {
                description: saved.active ? "Clients see it right away." : "Saved as inactive — hidden from clients.",
            });
        } catch (err) {
            showToast.error("Package not saved", { description: (err as Error).message });
        } finally {
            setSaving(false);
        }
    };

    const setActive = async (targets: DudosPackage[], active: boolean, done?: () => void) => {
        setBusy(true);
        const results = await Promise.all(
            targets
                .filter((pkg) => pkg.active !== active)
                .map((pkg) =>
                    request(`/admin/packages/${pkg.id}`, "PATCH", { active }).catch(() => null),
                ),
        );
        setBusy(false);
        const updated = results.filter(Boolean) as DudosPackage[];
        const byId = new Map(updated.map((pkg) => [pkg.id, pkg]));
        setPackages((prev) => prev.map((pkg) => byId.get(pkg.id) || pkg));
        showToast.success(
            `${updated.length} package${updated.length === 1 ? "" : "s"} ${active ? "activated" : "deactivated"}`,
        );
        done?.();
    };

    const remove = async (pkg: DudosPackage) => {
        if (!window.confirm(`Delete "${pkg.name}"? Past invoices keep their recorded name and price.`)) return;
        try {
            await request(`/admin/packages/${pkg.id}`, "DELETE");
            setPackages((prev) => prev.filter((item) => item.id !== pkg.id));
            showToast.success("Package deleted");
        } catch (err) {
            showToast.error("Package not deleted", { description: (err as Error).message });
        }
    };

    // One-time import of the packages that were hard-coded in the public site content.
    const importWebsitePackages = async () => {
        setBusy(true);
        const bundles = (publicContent as { capability_bundles?: Array<Record<string, unknown>> })
            .capability_bundles || [];
        type Localized = { en?: string; bn?: string };
        const created = await Promise.all(
            bundles.map((bundle, index) => {
                const title = (bundle.title || {}) as Localized;
                const description = (bundle.description || {}) as Localized;
                return request("/admin/packages", "POST", {
                    kind: "public",
                    slug: bundle.id,
                    name: title.en || String(bundle.id),
                    nameBn: title.bn,
                    description: description.en,
                    descriptionBn: description.bn,
                    features: ((bundle.pricing_variables as string[]) || []).map((v) => human(v)),
                    badge: index === 1 ? "Popular" : undefined,
                    sortOrder: index,
                }).catch(() => null);
            }),
        );
        setBusy(false);
        const added = created.filter(Boolean) as DudosPackage[];
        setPackages((prev) => [...prev, ...added]);
        showToast.success(`Imported ${added.length} website packages`);
    };

    const columns: DataTableColumn<DudosPackage>[] = [
        {
            id: "name",
            header: "Package",
            exportValue: (pkg) => pkg.name,
            cell: (pkg) => (
                <>
                    <p className="font-semibold text-dudos-text">
                        {pkg.name}
                        {pkg.badge && (
                            <Badge variant="outline" className="ml-2 border-teal-300 bg-teal-50 text-[10px] text-teal-800">
                                {pkg.badge}
                            </Badge>
                        )}
                    </p>
                    {pkg.description && (
                        <p className="line-clamp-1 max-w-sm text-xs text-dudos-text-secondary">{pkg.description}</p>
                    )}
                </>
            ),
        },
        {
            id: "price",
            header: "Price",
            className: "whitespace-nowrap text-sm",
            exportValue: priceText,
            cell: priceText,
        },
        {
            id: "features",
            header: "Features",
            className: "text-xs text-dudos-text-secondary",
            exportValue: (pkg) => pkg.features.join("; "),
            cell: (pkg) => (pkg.features.length ? `${pkg.features.length} listed` : "—"),
        },
        {
            id: "order",
            header: "Order",
            className: "text-xs tabular-nums",
            exportValue: (pkg) => pkg.sortOrder,
            cell: (pkg) => pkg.sortOrder,
        },
        {
            id: "status",
            header: "Status",
            exportValue: (pkg) => (pkg.active ? "Active" : "Inactive"),
            cell: (pkg) => (
                <Badge
                    variant="outline"
                    className={
                        pkg.active
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : "border-slate-300 bg-slate-50 text-slate-500"
                    }
                >
                    {pkg.active ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            headerClassName: "text-right",
            cell: (pkg) => (
                <div className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}>
                    <Button
                        size="sm"
                        variant="outline"
                        aria-label={`Edit ${pkg.name}`}
                        title="Edit"
                        onClick={() => openEdit(pkg)}
                        className="h-8 w-8 p-0"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        aria-label={`Delete ${pkg.name}`}
                        title="Delete"
                        onClick={() => void remove(pkg)}
                        className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const field = (key: keyof FormState, label: string, props: React.ComponentProps<typeof Input> = {}) => (
        <div className="space-y-1.5">
            <Label htmlFor={`pkg-${key}`} className="text-xs font-semibold">
                {label}
            </Label>
            <Input
                id={`pkg-${key}`}
                value={String(form[key])}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                className="h-9 text-sm"
                {...props}
            />
        </div>
    );

    return (
        <section className="space-y-5" aria-labelledby="admin-packages-title">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">
                        <span />
                        BILLING & ERP
                    </p>
                    <h1 id="admin-packages-title">Packages & Pricing</h1>
                    <p>Create and price the packages clients see. Changes apply immediately.</p>
                </div>
                <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline" onClick={reload} disabled={loading}>
                        <RefreshCw className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={openNew} disabled={Boolean(error)}>
                        <Plus className="mr-1 h-4 w-4" />
                        New package
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Package type">
                {KINDS.map((item) => {
                    const isActive = kind === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setKind(item.id)}
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
            <p className="text-sm text-dudos-text-secondary">{current.hint}</p>

            {kind === "public" && !loading && !error && rows.length === 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-dudos-border bg-white p-4 text-sm">
                    <span className="text-dudos-text-secondary">
                        The public Packages page still shows its built-in cards. Import them to edit them here.
                    </span>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => void importWebsitePackages()}>
                        <Upload className="mr-1 h-4 w-4" />
                        Import website packages
                    </Button>
                </div>
            )}

            <DataTable
                label="packages"
                rows={rows}
                columns={columns}
                getRowId={(pkg) => pkg.id}
                resetKey={kind}
                onRowClick={openEdit}
                exportFileName={`dudos-${kind}-packages`}
                loading={loading}
                error={error}
                bulkActions={(selected, clear) => (
                    <>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 bg-white text-xs"
                            disabled={busy}
                            onClick={() => void setActive(selected, true, clear)}
                        >
                            Activate
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 bg-white text-xs"
                            disabled={busy}
                            onClick={() => void setActive(selected, false, clear)}
                        >
                            Deactivate
                        </Button>
                    </>
                )}
                empty={
                    <span className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-slate-400" />
                        No {current.label.toLowerCase()} yet.
                    </span>
                }
            />

            <Dialog
                open={Boolean(editing)}
                onOpenChange={(open) => {
                    if (!open) setEditing(null);
                }}
            >
                <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold">
                            {editing === "new" ? `New ${current.label.replace(/s$/, "").toLowerCase()}` : `Edit ${editing ? editing.name : ""}`}
                        </DialogTitle>
                        <DialogDescription className="text-xs">{current.hint}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 text-sm">
                        {field("name", "Name", { maxLength: 120 })}
                        {kind === "public" && field("nameBn", "Name (বাংলা)", { maxLength: 120 })}

                        <div className="space-y-1.5">
                            <Label htmlFor="pkg-description" className="text-xs font-semibold">
                                Description
                            </Label>
                            <Textarea
                                id="pkg-description"
                                rows={2}
                                value={form.description}
                                onChange={(event) => setForm({ ...form, description: event.target.value })}
                                className="text-sm"
                            />
                        </div>
                        {kind === "public" && (
                            <div className="space-y-1.5">
                                <Label htmlFor="pkg-descriptionBn" className="text-xs font-semibold">
                                    Description (বাংলা)
                                </Label>
                                <Textarea
                                    id="pkg-descriptionBn"
                                    rows={2}
                                    value={form.descriptionBn}
                                    onChange={(event) => setForm({ ...form, descriptionBn: event.target.value })}
                                    className="text-sm"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            {kind !== "public" &&
                                field("credits", kind === "build" ? `Price (${form.unit || DEFAULT_UNIT})` : `${form.unit || DEFAULT_UNIT} granted`, {
                                    type: "number",
                                    min: 0,
                                    step: 1,
                                })}
                            {kind !== "public" &&
                                field("unit", "Unit", { list: "pkg-unit-options", placeholder: DEFAULT_UNIT, maxLength: 30 })}
                            <datalist id="pkg-unit-options">
                                {UNIT_SUGGESTIONS.map((unit) => (
                                    <option key={unit} value={unit} />
                                ))}
                            </datalist>
                            {kind !== "build" && field("priceBdt", "Price (BDT)", { type: "number", min: 0 })}
                            {kind !== "build" && field("priceUsd", "Price (USD)", { type: "number", min: 0 })}
                            {field("sortOrder", "Display order", { type: "number", step: 1 })}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="pkg-features" className="text-xs font-semibold">
                                Features (one per line)
                            </Label>
                            <Textarea
                                id="pkg-features"
                                rows={4}
                                value={form.features}
                                onChange={(event) => setForm({ ...form, features: event.target.value })}
                                className="text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {field("badge", "Badge (optional)", { placeholder: "e.g. Most popular", maxLength: 40 })}
                            {kind === "public" && field("slug", "Slug", { placeholder: "e.g. growth", maxLength: 60 })}
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.active}
                                onChange={(event) => setForm({ ...form, active: event.target.checked })}
                                className="h-4 w-4 accent-[#087f79]"
                            />
                            Active — visible to clients
                        </label>

                        <div className="flex justify-end gap-2 border-t border-dudos-border pt-3">
                            <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
                                Cancel
                            </Button>
                            <Button size="sm" disabled={saving || !form.name.trim()} onClick={() => void save()}>
                                {saving ? "Saving…" : editing === "new" ? "Create package" : "Save changes"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
}
