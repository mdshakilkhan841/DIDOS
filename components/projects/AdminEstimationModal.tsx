"use client";

import React, { useState } from "react";
import {
  Calculator,
  Send,
  FileCheck,
  Check,
  Percent,
  Clock,
  DollarSign,
  Cpu,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { showToast } from "@/lib/toast";

export interface QuotationInvoice {
  id: string;
  projectId: string;
  projectTitle: string;
  clientEmail: string;
  framework: string;
  manHours: {
    frontend: number;
    backend: number;
    qa: number;
    devops: number;
  };
  totalHours: number;
  hourlyRate: number;
  laborCost: number;
  infrastructureCost: number;
  profitMarginPercent: number;
  totalQuotationBDT: number;
  status: "dispatched" | "accepted" | "declined" | "paid";
  dispatchedAt: string;
}

export function AdminEstimationModal({
  project,
  open,
  onOpenChange,
  onDispatched,
  lang = "en",
}: {
  project: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDispatched?: (invoice: QuotationInvoice) => void;
  lang?: string;
}) {
  const [framework, setFramework] = useState(project?.framework || "Next.js + FastAPI");
  const [frontendHours, setFrontendHours] = useState(40);
  const [backendHours, setBackendHours] = useState(60);
  const [qaHours, setQaHours] = useState(20);
  const [devopsHours, setDevopsHours] = useState(15);
  const [hourlyRate, setHourlyRate] = useState(1500); // BDT per hour
  const [infraCost, setInfraCost] = useState(12000); // BDT
  const [marginPercent, setMarginPercent] = useState(25); // %
  const [isDispatching, setIsDispatching] = useState(false);

  // Calculations
  const totalHours = Number(frontendHours) + Number(backendHours) + Number(qaHours) + Number(devopsHours);
  const laborCost = totalHours * Number(hourlyRate);
  const subtotal = laborCost + Number(infraCost);
  const profitMarginAmount = Math.round(subtotal * (Number(marginPercent) / 100));
  const grandTotalBDT = subtotal + profitMarginAmount;

  const handleDispatch = () => {
    setIsDispatching(true);

    const invoice: QuotationInvoice = {
      id: "inv_" + Date.now().toString(36),
      projectId: project?.id || "proj_generic",
      projectTitle: project?.title || "Custom Enterprise Build",
      clientEmail: project?.clientEmail || "client@daffodil.family",
      framework,
      manHours: {
        frontend: frontendHours,
        backend: backendHours,
        qa: qaHours,
        devops: devopsHours,
      },
      totalHours,
      hourlyRate,
      laborCost,
      infrastructureCost: infraCost,
      profitMarginPercent: marginPercent,
      totalQuotationBDT: grandTotalBDT,
      status: "dispatched",
      dispatchedAt: new Date().toISOString(),
    };

    // Save to localStorage invoices
    try {
      const existingInvoices = JSON.parse(localStorage.getItem("dudos_invoices") || "[]");
      localStorage.setItem("dudos_invoices", JSON.stringify([invoice, ...existingInvoices]));

      // Update project status to quoted
      const projects = JSON.parse(localStorage.getItem("dudos_custom_projects") || "[]");
      const updated = projects.map((p: any) =>
        p.id === project?.id ? { ...p, status: "quoted", quotationBDT: grandTotalBDT } : p
      );
      localStorage.setItem("dudos_custom_projects", JSON.stringify(updated));
    } catch {}

    setTimeout(() => {
      setIsDispatching(false);
      showToast.success("Formal Quotation & Invoice Dispatched!", {
        description: `Sent directly to ${project?.clientName || "Client"} (${project?.clientEmail || "workspace"}).`,
      });
      onDispatched?.(invoice);
      onOpenChange(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-dudos-border pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-dudos-primary" />
            <DialogTitle className="text-lg font-bold text-dudos-text">
              Technical Estimation & Auto-Quotation Tool
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-dudos-text-secondary">
            Section 3.4 · Calculate framework complexity, required man-hours, cost structure, and profit margins.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Project Summary Banner */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-dudos-text">{project?.title || "Custom Enterprise Scope"}</span>
              <span className="text-[11px] text-dudos-text-secondary">{project?.category || "IT Solutions"}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
              {project?.businessScope || "Multi-role automated operations system with online billing and AI assistance."}
            </p>
          </div>

          {/* Framework Analysis */}
          <div>
            <Label htmlFor="fw">Framework & Tech Stack Selection</Label>
            <Input
              id="fw"
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="mt-1 text-xs"
            />
          </div>

          {/* Man-Hours Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Required Man-Hours Breakdown</Label>
              <span className="font-bold text-dudos-primary text-xs">{totalHours} Total Hours</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <span className="text-[11px] text-dudos-text-secondary block">Frontend (Next.js)</span>
                <Input
                  type="number"
                  min={1}
                  value={frontendHours}
                  onChange={(e) => setFrontendHours(Number(e.target.value))}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] text-dudos-text-secondary block">Backend (FastAPI)</span>
                <Input
                  type="number"
                  min={1}
                  value={backendHours}
                  onChange={(e) => setBackendHours(Number(e.target.value))}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] text-dudos-text-secondary block">QA & Testing</span>
                <Input
                  type="number"
                  min={0}
                  value={qaHours}
                  onChange={(e) => setQaHours(Number(e.target.value))}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] text-dudos-text-secondary block">DevOps & Cloud</span>
                <Input
                  type="number"
                  min={0}
                  value={devopsHours}
                  onChange={(e) => setDevopsHours(Number(e.target.value))}
                  className="mt-1 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Cost Structure & Margin */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <Label htmlFor="rate">Developer Hourly Rate (BDT)</Label>
              <Input
                id="rate"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="infra">Infrastructure & Licensing (BDT)</Label>
              <Input
                id="infra"
                type="number"
                value={infraCost}
                onChange={(e) => setInfraCost(Number(e.target.value))}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="margin">Target Profit Margin (%)</Label>
              <Input
                id="margin"
                type="number"
                min={0}
                max={100}
                value={marginPercent}
                onChange={(e) => setMarginPercent(Number(e.target.value))}
                className="mt-1 text-xs"
              />
            </div>
          </div>

          {/* Live Calculation Receipt */}
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 space-y-2 mt-3">
            <div className="flex justify-between text-slate-600">
              <span>Labor Subtotal ({totalHours} hrs × ৳{hourlyRate.toLocaleString()}):</span>
              <span className="font-semibold">৳{laborCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Infrastructure / Setup Cost:</span>
              <span className="font-semibold">৳{infraCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Profit Margin ({marginPercent}%):</span>
              <span className="font-semibold text-emerald-700">+৳{profitMarginAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-dudos-text pt-2 border-t border-teal-200">
              <span>Automated Quotation Amount:</span>
              <span className="text-dudos-primary text-lg">৳{grandTotalBDT.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-dudos-border">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={isDispatching}
            onClick={handleDispatch}
            className="text-xs"
          >
            <Send className="h-3.5 w-3.5 mr-1" />
            {isDispatching ? "Dispatching..." : "Dispatch Formal Quotation & Invoice"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
