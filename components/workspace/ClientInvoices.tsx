"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Coins, Receipt, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { CreditWalletModal } from "@/components/billing/CreditWalletModal";
import { useAuth } from "@/context/auth-context";
import { API_BASE, authHeaders, formatBdt, unitLabel } from "@/lib/dudos/packages";
import { showToast } from "@/lib/toast";

type Invoice = {
    id: string;
    invoiceNumber: string;
    kind: "top_up" | "build";
    item?: string | null;
    projectId?: string | null;
    projectName?: string | null;
    amount: number;
    currency: string;
    units?: number | null;
    unit: string;
    status: string;
    method?: string | null;
    paidAt?: string | null;
    createdAt: string;
};

type LoadResult = { invoices: Invoice[]; error: string };

async function fetchInvoices(): Promise<LoadResult> {
    try {
        const res = await fetch(`${API_BASE}/invoices/my`, { headers: authHeaders(), cache: "no-store" });
        if (res.status === 401) return { invoices: [], error: "Sign in again to see your invoices." };
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        return { invoices: Array.isArray(data) ? data : [], error: "" };
    } catch {
        return { invoices: [], error: "Could not reach the DUDOS backend. Try again in a moment." };
    }
}

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : "—");

/** Client billing history: wallet top-ups (paid in BDT) and builds paid from the wallet. */
export function ClientInvoices({ lang }: { lang: string }) {
    const { credits, applyServerBalance } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [walletOpen, setWalletOpen] = useState(false);
    const bn = lang === "bn";

    const apply = useCallback((result: LoadResult) => {
        setInvoices(result.invoices);
        setError(result.error);
        setLoading(false);
    }, []);

    useEffect(() => {
        void fetchInvoices().then(apply);
    }, [apply]);

    // Back from PayStation (?payment=success|failed|cancelled|pending): tell the
    // client, sync the balance the server credited, and clean the URL.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const result = params.get("payment");
        if (!result) return;
        const messages: Record<string, [string, string]> = {
            success: ["Payment received. Your wallet has been topped up.", "পেমেন্ট সম্পন্ন হয়েছে। ওয়ালেটে ব্যালেন্স যোগ হয়েছে।"],
            cancelled: ["Payment cancelled. Nothing was charged.", "পেমেন্ট বাতিল হয়েছে।"],
            failed: ["Payment failed. Nothing was added to your wallet.", "পেমেন্ট ব্যর্থ হয়েছে।"],
            pending: ["Payment is being confirmed. Refresh in a minute.", "পেমেন্ট যাচাই করা হচ্ছে।"],
        };
        const [en, bnText] = messages[result] || messages.pending;
        const text = bn ? bnText : en;
        if (result === "success") showToast.success(text);
        else if (result === "pending") showToast.info(text);
        else showToast.error(text);
        void fetch(`${API_BASE}/credits/balance`, { headers: authHeaders(), cache: "no-store" })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data && typeof data.credits === "number") applyServerBalance(data.credits, 0, "");
            })
            .catch(() => {});
        params.delete("payment");
        params.delete("invoice");
        const query = params.toString();
        window.history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : ""));
        // Runs once on arrival.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const reload = () => {
        setLoading(true);
        void fetchInvoices().then(apply);
    };

    const topUps = invoices.filter((inv) => inv.kind === "top_up");
    const builds = invoices.filter((inv) => inv.kind === "build");
    const spentBdt = topUps.reduce((sum, inv) => sum + (inv.amount || 0), 0);

    const columns: DataTableColumn<Invoice>[] = [
        {
            id: "invoice",
            header: bn ? "ইনভয়েস" : "Invoice",
            exportValue: (inv) => inv.invoiceNumber,
            cell: (inv) => (
                <>
                    <p className="font-mono text-xs font-semibold text-dudos-text">{inv.invoiceNumber}</p>
                    <p className="text-[11px] text-dudos-text-secondary">{formatDate(inv.paidAt || inv.createdAt)}</p>
                </>
            ),
        },
        {
            id: "item",
            header: bn ? "বিবরণ" : "Description",
            exportValue: (inv) => inv.item || "",
            cell: (inv) => (
                <>
                    <p className="font-semibold text-dudos-text">
                        {inv.item || (inv.kind === "build" ? "Build package" : "Top-up pack")}
                    </p>
                    {inv.projectName && (
                        <p className="text-[11px] text-dudos-text-secondary">{inv.projectName}</p>
                    )}
                </>
            ),
        },
        {
            id: "type",
            header: bn ? "ধরন" : "Type",
            exportValue: (inv) => (inv.kind === "build" ? "Build payment" : "Wallet top-up"),
            cell: (inv) =>
                inv.kind === "build" ? (
                    <Badge variant="outline" className="border-sky-300 bg-sky-50 text-[10px] text-sky-800">
                        {bn ? "বিল্ড পেমেন্ট" : "Build payment"}
                    </Badge>
                ) : (
                    <Badge variant="outline" className="border-teal-300 bg-teal-50 text-[10px] text-teal-800">
                        {bn ? "ওয়ালেট টপ-আপ" : "Wallet top-up"}
                    </Badge>
                ),
        },
        {
            id: "wallet",
            header: bn ? "ওয়ালেট" : "Wallet",
            exportValue: (inv) => (inv.kind === "build" ? -(inv.units || 0) : inv.units || 0),
            cell: (inv) => (
                <span className={`font-bold ${inv.kind === "build" ? "text-rose-600" : "text-emerald-600"}`}>
                    {inv.kind === "build" ? "−" : "+"}
                    {(inv.units || 0).toLocaleString()} {unitLabel(inv.unit, lang)}
                </span>
            ),
        },
        {
            id: "amount",
            header: bn ? "পরিশোধ" : "Paid",
            exportValue: (inv) => (inv.currency === "CREDITS" ? "" : inv.amount),
            cell: (inv) =>
                inv.currency === "CREDITS" ? (
                    <span className="text-xs text-dudos-text-secondary">{bn ? "ওয়ালেট থেকে" : "From wallet"}</span>
                ) : (
                    <span className="font-semibold text-dudos-text">{formatBdt(inv.amount)}</span>
                ),
        },
        {
            id: "status",
            header: bn ? "অবস্থা" : "Status",
            exportValue: (inv) => inv.status,
            cell: (inv) => (
                <Badge
                    variant="outline"
                    className={
                        inv.status === "paid"
                            ? "border-emerald-300 bg-emerald-50 text-[10px] capitalize text-emerald-800"
                            : inv.status === "pending"
                              ? "border-amber-300 bg-amber-50 text-[10px] capitalize text-amber-800"
                              : "border-rose-300 bg-rose-50 text-[10px] capitalize text-rose-800"
                    }
                >
                    {inv.status}
                </Badge>
            ),
        },
    ];

    const stats = [
        { label: bn ? "বর্তমান ব্যালেন্স" : "Wallet balance", value: `${credits.toLocaleString()} ${unitLabel(null, lang)}` },
        { label: bn ? "মোট টপ-আপ" : "Total topped up", value: formatBdt(spentBdt) || "৳0" },
        { label: bn ? "টপ-আপ" : "Top-ups", value: String(topUps.length) },
        { label: bn ? "পরিশোধিত বিল্ড" : "Builds paid", value: String(builds.length) },
    ];

    return (
        <section className="space-y-5" aria-labelledby="client-invoices-title">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">
                        <span />
                        {bn ? "ক্রেডিট ও বিলিং" : "CREDITS & BILLING"}
                    </p>
                    <h1 id="client-invoices-title">{bn ? "ইনভয়েস ও পেমেন্ট" : "Invoices & Payments"}</h1>
                    <p>
                        {bn
                            ? "আপনার ওয়ালেট টপ-আপ এবং প্রজেক্ট বিল্ড পেমেন্টের সব লেনদেন।"
                            : "Every wallet top-up and project build payment on your account."}
                    </p>
                </div>
                <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline" onClick={reload} disabled={loading}>
                        <RefreshCw className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        {bn ? "রিফ্রেশ" : "Refresh"}
                    </Button>
                    <Button size="sm" onClick={() => setWalletOpen(true)}>
                        <Coins className="mr-1 h-4 w-4" />
                        {bn ? "টপ-আপ" : "Top up wallet"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-dudos-border bg-white p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-dudos-text-secondary">
                            {stat.label}
                        </p>
                        <p className="mt-1 text-lg font-bold text-dudos-text">{stat.value}</p>
                    </div>
                ))}
            </div>

            <DataTable
                label="invoices"
                rows={invoices}
                columns={columns}
                getRowId={(inv) => inv.id}
                exportFileName="dudos-invoices"
                loading={loading}
                error={error}
                empty={
                    <span className="flex flex-col items-center gap-2">
                        <Receipt className="h-8 w-8 text-slate-400" />
                        {bn ? "এখনও কোনো লেনদেন নেই।" : "No payments yet. Top up your wallet to get started."}
                    </span>
                }
            />

            <CreditWalletModal
                open={walletOpen}
                onOpenChange={(open) => {
                    setWalletOpen(open);
                    if (!open) reload();
                }}
                lang={lang}
            />
        </section>
    );
}
