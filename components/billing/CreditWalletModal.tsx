"use client";

import React, { useEffect, useState } from "react";
import { Coins, Plus, Check, ShieldCheck, Loader2, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getAuthToken } from "@/lib/dudos/assessment-sync";
import {
  API_BASE,
  authHeaders,
  fetchPackages,
  formatBdt,
  formatUsd,
  packageDescription,
  packageName,
  unitLabel,
  type DudosPackage,
} from "@/lib/dudos/packages";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Used only when the backend is unreachable; admins manage the live packs
// under Packages & Pricing.
const FALLBACK_CREDIT_PACKAGES: DudosPackage[] = [
  {
    id: "pkg_1k",
    kind: "credit",
    name: "Starter Builder Pack",
    credits: 1000,
    priceBdt: 1500,
    priceUsd: 15,
    description: "Ideal for 10 website generations or 20 AI SRS drafts.",
    features: ["10 Website Code Generations", "20 AI SRS Requirement Specs", "Standard Deployment Support"],
    sortOrder: 0,
    active: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "pkg_5k",
    kind: "credit",
    name: "Growth Agency Pack",
    credits: 5000,
    priceBdt: 6000,
    priceUsd: 60,
    badge: "Most popular",
    description: "For active businesses and multi-project teams (20% bonus).",
    features: ["60 Website Code Generations", "Unlimited AI SRS Specifications", "Priority Technical Estimation", "Domain Mapping Assistance"],
    sortOrder: 1,
    active: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "pkg_15k",
    kind: "credit",
    name: "Enterprise ERP Pack",
    credits: 15000,
    priceBdt: 15000,
    priceUsd: 150,
    description: "High-volume operations, Facebook Ad integration & full custom development.",
    features: ["Full Source Code Downloads", "Direct Tech Team Architecture Review", "Dedicated Deployment Engineer", "Facebook Ad Engine Integration"],
    sortOrder: 2,
    active: true,
    createdAt: "",
    updatedAt: "",
  },
];

type PendingPayment = { invoiceId: string; paymentUrl: string; pkg: DudosPackage };

/** Top-up packs and the PayStation hand-off, shared by the wallet modal and page. */
export function CreditWalletPanel({
  lang = "en",
  active = true,
}: {
  lang?: string;
  /** Load packs and poll a pending payment only while visible. */
  active?: boolean;
}) {
  const { addCredits, applyServerBalance } = useAuth();
  const [packages, setPackages] = useState<DudosPackage[]>(FALLBACK_CREDIT_PACKAGES);
  const [selectedPkg, setSelectedPkg] = useState<string>("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  // A PayStation top-up open in another tab, until it is paid or given up.
  const [pending, setPending] = useState<PendingPayment | null>(null);
  const [checking, setChecking] = useState(false);

  // Live packs from Packages & Pricing; keep the fallback if the API is down.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    void fetchPackages("credit").then((live) => {
      if (!cancelled && live && live.length > 0) setPackages(live);
    });
    return () => {
      cancelled = true;
    };
  }, [active]);

  const selectedId =
    selectedPkg ||
    packages.find((pkg) => pkg.badge)?.id ||
    packages[0]?.id ||
    "";

  const settle = (payment: PendingPayment, status: string, totalCredits: number) => {
    const { pkg } = payment;
    if (status === "paid") {
      applyServerBalance(totalCredits, pkg.credits || 0, `Purchased ${pkg.name} (${formatBdt(pkg.priceBdt)})`);
      showToast.success(
        lang === "bn"
          ? "পেমেন্ট সম্পন্ন হয়েছে। ওয়ালেটে ব্যালেন্স যোগ হয়েছে।"
          : `Payment received. ${(pkg.credits || 0).toLocaleString()} ${unitLabel(pkg.unit, lang)} added.`,
      );
    } else if (status === "cancelled") {
      showToast.info(lang === "bn" ? "পেমেন্ট বাতিল হয়েছে।" : "Payment cancelled. Nothing was charged.");
    } else if (status === "failed") {
      showToast.error(lang === "bn" ? "পেমেন্ট ব্যর্থ হয়েছে।" : "Payment failed. Nothing was added to your wallet.");
    } else {
      return false;
    }
    setPending(null);
    return true;
  };

  const checkPending = async (action: "status" | "cancel", quiet = false) => {
    if (!pending) return;
    const payment = pending;
    setChecking(true);
    try {
      const res = await fetch(`${API_BASE}/payments/paystation/${payment.invoiceId}/${action}`, {
        method: action === "cancel" ? "POST" : "GET",
        headers: authHeaders(),
        cache: "no-store",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.detail);
      if (!settle(payment, body.status, body.totalCredits) && !quiet) {
        showToast.info(lang === "bn" ? "পেমেন্ট এখনও সম্পন্ন হয়নি।" : "Not paid yet. Finish the payment in the PayStation tab.");
      }
    } catch {
      if (!quiet) showToast.error(lang === "bn" ? "সার্ভারে সংযোগ হয়নি" : "Could not reach the server");
    } finally {
      setChecking(false);
    }
  };

  // While the client pays in the other tab, check every few seconds.
  useEffect(() => {
    if (!active || !pending) return;
    const timer = window.setInterval(() => void checkPending("status", true), 5000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, pending]);

  const handlePurchase = async (pkg: DudosPackage) => {
    const reason = `Purchased ${pkg.name} (${formatBdt(pkg.priceBdt)})`;
    setProcessingId(pkg.id);
    // Open the tab now, inside the click, so the browser doesn't block it.
    const tab = getAuthToken() ? window.open("", "_blank") : null;
    try {
      if (!getAuthToken()) {
        // Offline mode: no backend session, top up the local wallet.
        addCredits(pkg.credits || 0, reason);
        showToast.success(`${(pkg.credits || 0).toLocaleString()} ${unitLabel(pkg.unit, lang)} added`);
        return;
      }
      const res = await fetch(`${API_BASE}/credits/purchase`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({ packageId: pkg.id }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        tab?.close();
        showToast.error(lang === "bn" ? "ক্রয় সম্পন্ন হয়নি" : "Purchase failed", {
          description: body?.detail,
        });
        return;
      }
      if (body.paymentUrl) {
        if (!tab) {
          // Pop-up blocked: pay in this tab instead.
          window.location.assign(body.paymentUrl);
          return;
        }
        tab.location.href = body.paymentUrl;
        setPending({ invoiceId: body.invoiceId, paymentUrl: body.paymentUrl, pkg });
        return;
      }
      tab?.close();
      applyServerBalance(body.totalCredits, body.added, reason);
      showToast.success(
        lang === "bn" ? "ক্রেডিট যোগ হয়েছে" : `${Number(body.added).toLocaleString()} ${unitLabel(pkg.unit, lang)} added`,
      );
    } catch {
      tab?.close();
      showToast.error(lang === "bn" ? "সার্ভারে সংযোগ হয়নি" : "Could not reach the server");
    } finally {
      setProcessingId(null);
    }
  };

  return pending ? (
      <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm">
        <div className="flex items-start gap-3">
          <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-amber-600" />
          <div>
            <p className="font-bold text-dudos-text">
              {lang === "bn" ? "পেমেন্টের অপেক্ষায়" : "Waiting for your payment"}
            </p>
            <p className="mt-1 text-xs text-dudos-text-secondary">
              {lang === "bn"
                ? `নতুন ট্যাবে PayStation-এ ${formatBdt(pending.pkg.priceBdt)} পরিশোধ করুন। সম্পন্ন হলে এখানে স্বয়ংক্রিয়ভাবে আপডেট হবে।`
                : `Pay ${formatBdt(pending.pkg.priceBdt)} for ${packageName(pending.pkg, lang)} in the PayStation tab. This updates on its own when the payment goes through. If PayStation shows an error, close that tab and cancel here.`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => window.open(pending.paymentUrl, "_blank")}>
            <ExternalLink className="mr-1 h-3.5 w-3.5" />
            {lang === "bn" ? "PayStation আবার খুলুন" : "Reopen PayStation"}
          </Button>
          <Button size="sm" variant="outline" disabled={checking} onClick={() => void checkPending("cancel")}>
            {lang === "bn" ? "পেমেন্ট বাতিল" : "Cancel payment"}
          </Button>
          <Button size="sm" disabled={checking} onClick={() => void checkPending("status")}>
            {checking ? (lang === "bn" ? "যাচাই হচ্ছে…" : "Checking…") : lang === "bn" ? "স্ট্যাটাস দেখুন" : "Check status"}
          </Button>
        </div>
      </div>
    ) : (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {packages.map((pkg) => {
          const isSelected = selectedId === pkg.id;
          return (
            <div
              key={pkg.id}
              onClick={() => setSelectedPkg(pkg.id)}
              className={`relative p-5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? "border-dudos-primary bg-dudos-surface-mint/60 shadow-sm ring-1 ring-dudos-primary"
                  : "border-dudos-border bg-white hover:border-dudos-primary/50"
              }`}
            >
              {pkg.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-dudos-primary text-white text-[10px] font-bold uppercase tracking-wider">
                  {pkg.badge}
                </span>
              )}

              <div>
                <h4 className="font-bold text-base text-dudos-text">{packageName(pkg, lang)}</h4>
                <p className="text-[11px] text-dudos-text-secondary mt-1">{packageDescription(pkg, lang)}</p>

                <div className="mt-3 mb-2">
                  <span className="text-2xl font-black text-dudos-text">{(pkg.credits || 0).toLocaleString()}</span>
                  <span className="text-xs text-dudos-text-secondary"> {unitLabel(pkg.unit, lang)}</span>
                  <div className="text-xs font-semibold text-dudos-primary mt-0.5">
                    {formatBdt(pkg.priceBdt)}{" "}
                    {pkg.priceUsd !== null && pkg.priceUsd !== undefined && (
                      <span className="text-[10px] text-dudos-text-secondary">({formatUsd(pkg.priceUsd)})</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-1.5 mt-3 pt-3 border-t border-dudos-border/50 text-xs text-dudos-text-secondary">
                  {pkg.features.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="h-3.5 w-3.5 text-dudos-primary shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                size="sm"
                disabled={processingId !== null}
                onClick={(e) => {
                  e.stopPropagation();
                  void handlePurchase(pkg);
                }}
                className="mt-5 h-9 w-full text-xs whitespace-normal"
                variant={isSelected ? "default" : "outline"}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                {processingId === pkg.id ? "Processing..." : `Get ${(pkg.credits || 0).toLocaleString()} ${unitLabel(pkg.unit, lang)}`}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-teal-600" />
          <span>
            {lang === "bn"
              ? "প্রজেক্টের বিল্ড পেমেন্টের সময় ক্রেডিট কাটা হয়।"
              : "Your balance is charged when you pay for a project build. Every top-up appears under Invoices & Payments."}
          </span>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {lang === "bn" ? "PayStation দিয়ে নিরাপদ পেমেন্ট" : "Secure payment via PayStation"}
        </Badge>
      </div>
    </div>
    );
}

export function CreditWalletModal({
  open,
  onOpenChange,
  lang = "en",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lang?: string;
}) {
  const { credits } = useAuth();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[calc(100%-2rem)] sm:max-w-4xl bg-white p-6 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-2 pr-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-dudos-primary">
                <Coins className="h-5 w-5" />
              </div>
              <div className="min-w-0 text-left">
                {/* !important: the site-wide h2 size would otherwise win. */}
                <DialogTitle className="!text-xl !leading-tight !tracking-normal font-bold text-dudos-text">
                  {lang === "bn" ? "ক্রেডিট ওয়ালেট" : "Credit Wallet"}
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs text-dudos-text-secondary">
                  {lang === "bn"
                    ? "ব্যালেন্স টপ-আপ করুন; প্রজেক্ট বিল্ডের পেমেন্ট এই ওয়ালেট থেকে কাটা হয়।"
                    : "Top up your balance. Project builds are paid from this wallet."}
                </DialogDescription>
              </div>
            </div>

            <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-right">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-dudos-text-secondary">
                {lang === "bn" ? "বর্তমান ব্যালেন্স" : "Current balance"}
              </span>
              <span className="text-2xl font-black text-dudos-primary">
                {credits.toLocaleString()}{" "}
                <span className="text-xs font-normal text-dudos-text-secondary">{unitLabel(null, lang)}</span>
              </span>
            </div>
          </div>
        </DialogHeader>

        <CreditWalletPanel lang={lang} active={open} />
      </DialogContent>
    </Dialog>
  );
}

export function CreditBadgeButton({
  lang = "en",
  className = "",
}: {
  lang?: string;
  className?: string;
}) {
  const { credits } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 hover:bg-teal-100 border border-teal-200 text-dudos-primary transition-all cursor-pointer ${className}`}
        title="View credit balance and top-up packages"
      >
        <Coins className="h-3.5 w-3.5 text-dudos-primary" />
        <span>{credits.toLocaleString()} Credits</span>
        <Plus className="h-3 w-3 text-dudos-primary/80" />
      </button>

      <CreditWalletModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        lang={lang}
      />
    </>
  );
}
