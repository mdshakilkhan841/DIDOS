"use client";

import React, { useEffect, useState } from "react";
import { Coins, Plus, Check, ShieldCheck } from "lucide-react";
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

const PHONE_KEY = "dudos_payment_phone";

export function CreditWalletModal({
  open,
  onOpenChange,
  lang = "en",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lang?: string;
}) {
  const { credits, addCredits, applyServerBalance } = useAuth();
  const [packages, setPackages] = useState<DudosPackage[]>(FALLBACK_CREDIT_PACKAGES);
  const [selectedPkg, setSelectedPkg] = useState<string>("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  // PayStation needs the payer's mobile number; remembered on this device.
  const [phone, setPhone] = useState(() => {
    try {
      return localStorage.getItem(PHONE_KEY) || "";
    } catch {
      return "";
    }
  });

  // Live packs from Packages & Pricing; keep the fallback if the API is down.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void fetchPackages("credit").then((live) => {
      if (!cancelled && live && live.length > 0) setPackages(live);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const selectedId =
    selectedPkg ||
    packages.find((pkg) => pkg.badge)?.id ||
    packages[0]?.id ||
    "";

  const handlePurchase = async (pkg: DudosPackage) => {
    const reason = `Purchased ${pkg.name} (${formatBdt(pkg.priceBdt)})`;
    setProcessingId(pkg.id);
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
        body: JSON.stringify({ packageId: pkg.id, phone: phone.trim() || undefined }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast.error(lang === "bn" ? "ক্রয় সম্পন্ন হয়নি" : "Purchase failed", {
          description: body?.detail,
        });
        return;
      }
      if (body.paymentUrl) {
        try {
          localStorage.setItem(PHONE_KEY, phone.trim());
        } catch {}
        showToast.info(lang === "bn" ? "PayStation-এ নিয়ে যাওয়া হচ্ছে…" : "Redirecting to PayStation…");
        window.location.assign(body.paymentUrl);
        return;
      }
      applyServerBalance(body.totalCredits, body.added, reason);
      showToast.success(
        lang === "bn" ? "ক্রেডিট যোগ হয়েছে" : `${Number(body.added).toLocaleString()} ${unitLabel(pkg.unit, lang)} added`,
      );
    } catch {
      showToast.error(lang === "bn" ? "সার্ভারে সংযোগ হয়নি" : "Could not reach the server");
    } finally {
      setProcessingId(null);
    }
  };

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

          <label className="flex flex-wrap items-center gap-3 rounded-xl border border-dudos-border bg-white p-3.5 text-xs">
            <span className="font-semibold text-dudos-text">
              {lang === "bn" ? "মোবাইল নম্বর (পেমেন্টের জন্য)" : "Mobile number (for payment)"}
            </span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="h-9 min-w-0 flex-1 rounded-md border border-dudos-border px-3 text-sm outline-none focus:border-dudos-primary"
            />
          </label>

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
