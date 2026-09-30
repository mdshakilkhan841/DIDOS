"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpRight, Coins, Receipt } from "lucide-react";
import Link from "@/components/dudos-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditWalletPanel } from "@/components/billing/CreditWalletModal";
import { useAuth } from "@/context/auth-context";
import { API_BASE, authHeaders, formatBdt, unitLabel } from "@/lib/dudos/packages";

type Invoice = {
    id: string;
    invoiceNumber: string;
    kind: "top_up" | "build";
    item?: string | null;
    projectName?: string | null;
    amount: number;
    currency: string;
    units?: number | null;
    unit: string;
    status: string;
    paidAt?: string | null;
    createdAt: string;
};

const STATUS_STYLE: Record<string, string> = {
    paid: "border-emerald-300 bg-emerald-50 text-emerald-800",
    pending: "border-amber-300 bg-amber-50 text-amber-800",
};

/** Credit Wallet page: balance, top-up packs and the latest payments. */
export function ClientWallet({ lang }: { lang: string }) {
    const { credits } = useAuth();
    const [recent, setRecent] = useState<Invoice[] | null>(null);
    const bn = lang === "bn";

    // Refetch when the balance changes, so a finished top-up shows up here too.
    useEffect(() => {
        let cancelled = false;
        void fetch(`${API_BASE}/invoices/my`, { headers: authHeaders(), cache: "no-store" })
            .then((res) => (res.ok ? res.json() : []))
            .catch(() => [])
            .then((data) => {
                if (!cancelled) setRecent(Array.isArray(data) ? data.slice(0, 5) : []);
            });
        return () => {
            cancelled = true;
        };
    }, [credits]);

    const lastTopUp = recent?.find((inv) => inv.kind === "top_up" && inv.status === "paid");

    return (
        <section className="space-y-6" aria-labelledby="client-wallet-title">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">
                        <span />
                        {bn ? "ক্রেডিট ও বিলিং" : "CREDITS & BILLING"}
                    </p>
                    <h1 id="client-wallet-title">{bn ? "ক্রেডিট ওয়ালেট" : "Credit Wallet"}</h1>
                    <p>
                        {bn
                            ? "ব্যালেন্স টপ-আপ করুন। প্রজেক্ট বিল্ডের পেমেন্ট এই ওয়ালেট থেকে কাটা হয়।"
                            : "Top up your balance. Project builds are paid from this wallet."}
                    </p>
                </div>
                <Button asChild size="sm" variant="outline" className="shrink-0">
                    <Link href={`/${lang}/app/invoices`}>
                        <Receipt className="mr-1 h-4 w-4" />
                        {bn ? "ইনভয়েস ও পেমেন্ট" : "Invoices & Payments"}
                    </Link>
                </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-xl border border-teal-200 bg-teal-50 p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal-200 bg-white text-dudos-primary">
                        <Coins className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-dudos-text-secondary">
                            {bn ? "বর্তমান ব্যালেন্স" : "Current balance"}
                        </p>
                        <p className="text-3xl font-black text-dudos-primary">
                            {credits.toLocaleString()}{" "}
                            <span className="text-sm font-normal text-dudos-text-secondary">{unitLabel(null, lang)}</span>
                        </p>
                    </div>
                </div>
                <div className="rounded-xl border border-dudos-border bg-white p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-dudos-text-secondary">
                        {bn ? "সর্বশেষ টপ-আপ" : "Last top-up"}
                    </p>
                    {lastTopUp ? (
                        <>
                            <p className="mt-1 text-lg font-bold text-dudos-text">
                                +{(lastTopUp.units || 0).toLocaleString()} {unitLabel(lastTopUp.unit, lang)}
                            </p>
                            <p className="text-xs text-dudos-text-secondary">
                                {lastTopUp.item} · {formatBdt(lastTopUp.amount)} ·{" "}
                                {new Date(lastTopUp.paidAt || lastTopUp.createdAt).toLocaleDateString()}
                            </p>
                        </>
                    ) : (
                        <p className="mt-1 text-sm text-dudos-text-secondary">
                            {bn ? "এখনও কোনো টপ-আপ নেই।" : "No top-ups yet."}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <h2 className="!text-lg !tracking-normal font-bold text-dudos-text">
                    {bn ? "টপ-আপ প্যাক" : "Top-up packs"}
                </h2>
                <CreditWalletPanel lang={lang} />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="!text-lg !tracking-normal font-bold text-dudos-text">
                        {bn ? "সাম্প্রতিক পেমেন্ট" : "Recent payments"}
                    </h2>
                    <Link
                        href={`/${lang}/app/invoices`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-dudos-primary hover:underline"
                    >
                        {bn ? "সব দেখুন" : "View all"}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
                <div className="divide-y divide-dudos-border overflow-hidden rounded-xl border border-dudos-border bg-white text-sm">
                    {recent === null ? (
                        <p className="p-4 text-xs text-dudos-text-secondary">{bn ? "লোড হচ্ছে…" : "Loading…"}</p>
                    ) : recent.length === 0 ? (
                        <p className="p-4 text-xs text-dudos-text-secondary">
                            {bn ? "এখনও কোনো পেমেন্ট নেই।" : "No payments yet."}
                        </p>
                    ) : (
                        recent.map((inv) => (
                            <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                                <div className="min-w-0">
                                    <p className="font-semibold text-dudos-text">
                                        {inv.item || (inv.kind === "build" ? "Build package" : "Top-up pack")}
                                        {inv.projectName && (
                                            <span className="font-normal text-dudos-text-secondary"> · {inv.projectName}</span>
                                        )}
                                    </p>
                                    <p className="text-[11px] text-dudos-text-secondary">
                                        {inv.invoiceNumber} · {new Date(inv.paidAt || inv.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold ${inv.kind === "build" ? "text-rose-600" : "text-emerald-600"}`}>
                                        {inv.kind === "build" ? "−" : "+"}
                                        {(inv.units || 0).toLocaleString()} {unitLabel(inv.unit, lang)}
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] capitalize ${STATUS_STYLE[inv.status] || "border-rose-300 bg-rose-50 text-rose-800"}`}
                                    >
                                        {inv.status}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
