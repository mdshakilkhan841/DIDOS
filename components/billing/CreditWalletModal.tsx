"use client";

import React, { useState } from "react";
import { Coins, Plus, Check, ArrowUpRight, History, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const CREDIT_PACKAGES = [
  {
    id: "pkg_1k",
    name: "Starter Builder Pack",
    credits: 1000,
    priceBDT: "৳1,500",
    priceUSD: "$15",
    description: "Ideal for 10 website generations or 20 AI SRS drafts.",
    popular: false,
    perks: ["10 Website Code Generations", "20 AI SRS Requirement Specs", "Standard Deployment Support"],
  },
  {
    id: "pkg_5k",
    name: "Growth Agency Pack",
    credits: 5000,
    priceBDT: "৳6,000",
    priceUSD: "$60",
    description: "For active businesses and multi-project teams (20% bonus).",
    popular: true,
    perks: ["60 Website Code Generations", "Unlimited AI SRS Specifications", "Priority Technical Estimation", "Domain Mapping Assistance"],
  },
  {
    id: "pkg_15k",
    name: "Enterprise ERP Pack",
    credits: 15000,
    priceBDT: "৳15,000",
    priceUSD: "$150",
    description: "High-volume operations, Facebook Ad integration & full custom development.",
    popular: false,
    perks: ["Full Source Code Downloads", "Direct Tech Team Architecture Review", "Dedicated Deployment Engineer", "Facebook Ad Engine Integration"],
  },
];

export function CreditWalletModal({
  open,
  onOpenChange,
  lang = "en",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lang?: string;
}) {
  const { credits, addCredits, creditTransactions } = useAuth();
  const [tab, setTab] = useState<"packages" | "history">("packages");
  const [selectedPkg, setSelectedPkg] = useState<string>("pkg_5k");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = (pkg: typeof CREDIT_PACKAGES[0]) => {
    setIsProcessing(true);
    setTimeout(() => {
      addCredits(pkg.credits, `Purchased ${pkg.name} (${pkg.priceBDT})`);
      setIsProcessing(false);
      setTab("history");
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white p-6 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-dudos-primary">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-dudos-text">
                  {lang === "bn" ? "ক্রেডিট ও মনিটাইজেশন ওয়ালেট" : "Credit & Monetization Wallet"}
                </DialogTitle>
                <DialogDescription className="text-xs text-dudos-text-secondary">
                  {lang === "bn"
                    ? "ওয়েবসাইট তৈরি ও কাস্টম প্রজেক্ট এস্টিমেশনের জন্য ক্রেডিট পরিচালনা করুন।"
                    : "Manage your credits for website generation, AI SRS tools, and custom projects."}
                </DialogDescription>
              </div>
            </div>

            {/* Current Balance Pill */}
            <div className="text-right">
              <span className="text-[11px] font-semibold text-dudos-text-secondary uppercase tracking-wider block">
                {lang === "bn" ? "বর্তমান ব্যালেন্স" : "Current Balance"}
              </span>
              <span className="text-2xl font-black text-dudos-primary">
                {credits.toLocaleString()} <span className="text-xs font-normal text-dudos-text-secondary">credits</span>
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Tab switch */}
        <div className="flex border-b border-dudos-border mb-5">
          <button
            type="button"
            onClick={() => setTab("packages")}
            className={`pb-2.5 text-sm font-semibold border-b-2 mr-6 transition-all ${
              tab === "packages"
                ? "border-dudos-primary text-dudos-primary"
                : "border-transparent text-dudos-text-secondary hover:text-dudos-text"
            }`}
          >
            {lang === "bn" ? "ক্রেডিট প্যাকেজ কিনুন" : "Buy Credit Packages"}
          </button>
          <button
            type="button"
            onClick={() => setTab("history")}
            className={`pb-2.5 text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-all ${
              tab === "history"
                ? "border-dudos-primary text-dudos-primary"
                : "border-transparent text-dudos-text-secondary hover:text-dudos-text"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            {lang === "bn" ? "লেনদেনের ইতিহাস" : "Transaction History"}
          </button>
        </div>

        {tab === "packages" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {CREDIT_PACKAGES.map((pkg) => {
                const isSelected = selectedPkg === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPkg(pkg.id)}
                    className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-dudos-primary bg-dudos-surface-mint/60 shadow-sm ring-1 ring-dudos-primary"
                        : "border-dudos-border bg-white hover:border-dudos-primary/50"
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-dudos-primary text-white text-[10px] font-bold uppercase tracking-wider">
                        Popular
                      </span>
                    )}

                    <div>
                      <h4 className="font-bold text-sm text-dudos-text">{pkg.name}</h4>
                      <p className="text-[11px] text-dudos-text-secondary mt-1">{pkg.description}</p>

                      <div className="mt-3 mb-2">
                        <span className="text-xl font-black text-dudos-text">{pkg.credits.toLocaleString()}</span>
                        <span className="text-xs text-dudos-text-secondary"> credits</span>
                        <div className="text-xs font-semibold text-dudos-primary mt-0.5">
                          {pkg.priceBDT} <span className="text-[10px] text-dudos-text-secondary">({pkg.priceUSD})</span>
                        </div>
                      </div>

                      <ul className="space-y-1.5 mt-3 pt-3 border-t border-dudos-border/50 text-[11px] text-dudos-text-secondary">
                        {pkg.perks.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="h-3.5 w-3.5 text-dudos-primary shrink-0 mt-0.5" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      size="sm"
                      disabled={isProcessing}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(pkg);
                      }}
                      className="mt-4 w-full text-xs"
                      variant={isSelected ? "default" : "outline"}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      {isProcessing ? "Processing..." : `Get ${pkg.credits.toLocaleString()} Credits`}
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                <span>
                  <strong>Usage Rates:</strong> Website Generation: 100 credits · AI SRS Generator: 50 credits · Managed Deployment Ticket: 200 credits
                </span>
              </div>
              <Badge variant="outline" className="text-[10px]">Instant Credit Top-up</Badge>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {creditTransactions.length > 0 ? (
              <div className="divide-y divide-dudos-border rounded-xl border border-dudos-border bg-white overflow-hidden text-xs">
                {creditTransactions.map((tx) => (
                  <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          tx.type === "credit"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {tx.type === "credit" ? "+" : "-"}
                      </div>
                      <div>
                        <p className="font-semibold text-dudos-text">{tx.reason}</p>
                        <span className="text-[10px] text-dudos-text-secondary">
                          {new Date(tx.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`font-bold text-sm ${
                        tx.type === "credit" ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {tx.type === "credit" ? "+" : "-"}{tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-dudos-text-secondary py-8">
                No credit transactions recorded yet.
              </p>
            )}
          </div>
        )}
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
