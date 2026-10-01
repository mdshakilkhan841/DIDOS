"use client";

import React, { useState } from "react";
import { Server, Globe, ShieldCheck, Send, Check } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getAuthToken } from "@/lib/dudos/assessment-sync";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { showToast } from "@/lib/toast";

export function ManagedDeploymentModal({
  project,
  open,
  onOpenChange,
  onSubmitted,
  lang = "en",
}: {
  project?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: (ticket: any) => void;
  lang?: string;
}) {
  const { user, deductCredits } = useAuth();
  const [domainName, setDomainName] = useState("");
  const [dnsProvider, setDnsProvider] = useState("Cloudflare");
  const [serverTarget, setServerTarget] = useState("Daffodil Cloud Linux VPS");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainName.trim()) {
      showToast.error("Domain name is required for deployment mapping.");
      return;
    }

    const deducted = deductCredits(200, "Managed Deployment Support Ticket");
    if (!deducted) return;

    setIsSubmitting(true);

    const token =
      getAuthToken() ||
      (typeof window !== "undefined"
        ? localStorage.getItem("dudos_jwt_token") ||
          localStorage.getItem("dudos_auth_token")
        : null);

    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

    const ticket = {
      id: "dep_" + Date.now().toString(36),
      projectId: project?.id || "proj_self",
      projectTitle: project?.name || project?.title || "Website Project",
      clientEmail: user?.email || "client@daffodil.family",
      domainName,
      dnsProvider,
      serverTarget,
      specialInstructions,
      status: "pending_tech_review",
      createdAt: new Date().toISOString(),
    };

    // Submit ticket to FastAPI backend
    fetch(`${apiBase}/deployments/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        projectId: project?.id || "proj_self",
        projectTitle: project?.name || project?.title || "Website Project",
        domainName,
        dnsProvider,
        hostingTarget: serverTarget,
        specialInstructions,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          ticket.id = data.id;
        }
      })
      .catch((err) => console.error("FastAPI deployment ticket submit error:", err));

    try {
      const existing = JSON.parse(localStorage.getItem("dudos_deployment_tickets") || "[]");
      localStorage.setItem("dudos_deployment_tickets", JSON.stringify([ticket, ...existing]));

      // Synchronize with dudos_active_draft
      const activeDraftStr = localStorage.getItem("dudos_active_draft");
      if (activeDraftStr) {
        const activeDraft = JSON.parse(activeDraftStr);
        activeDraft.status = "deploying";
        activeDraft.deploymentTicket = ticket;
        activeDraft.domainName = domainName;
        activeDraft.updatedAt = new Date().toISOString();
        localStorage.setItem("dudos_active_draft", JSON.stringify(activeDraft));
      }

      // Synchronize with dudos_custom_projects
      const customProjectsStr = localStorage.getItem("dudos_custom_projects");
      if (customProjectsStr) {
        const customProjects = JSON.parse(customProjectsStr);
        const targetProjId = project?.id || (activeDraftStr ? JSON.parse(activeDraftStr).id : "proj_self");
        const updated = customProjects.map((p: any) =>
          p.id === targetProjId
            ? { ...p, status: "deploying", deploymentTicketId: ticket.id, domainName, updatedAt: new Date().toISOString() }
            : p
        );
        localStorage.setItem("dudos_custom_projects", JSON.stringify(updated));
      }
    } catch {}

    setTimeout(() => {
      setIsSubmitting(false);
      showToast.success("Deployment Assistance Ticket Created!", {
        description: "Our Tech Team has been notified for domain mapping and production setup.",
      });
      onSubmitted?.(ticket);
      onOpenChange(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white p-6 rounded-2xl shadow-xl">
        <DialogHeader className="border-b border-dudos-border pb-3">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-dudos-primary" />
            <DialogTitle className="text-lg font-bold text-dudos-text">
              Request Managed Deployment Support
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-dudos-text-secondary">
            Section 3.2 · Our technical team will assist with domain mapping, SSL certificates, and live hosting setup.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          <div>
            <Label htmlFor="domain" required>Target Domain Name</Label>
            <div className="relative mt-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dudos-text-secondary" />
              <Input
                id="domain"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value.trim().toLowerCase())}
                placeholder="e.g. www.mybusiness.com.bd"
                className="pl-9 text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="dns">DNS Provider / Registrar</Label>
              <Input
                id="dns"
                value={dnsProvider}
                onChange={(e) => setDnsProvider(e.target.value)}
                placeholder="e.g. Cloudflare, GoDaddy, BTCL"
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="target">Target Infrastructure</Label>
              <Input
                id="target"
                value={serverTarget}
                onChange={(e) => setServerTarget(e.target.value)}
                placeholder="e.g. Daffodil Cloud / VPS"
                className="mt-1 text-xs"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Special Requirements / Credentials Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Mention SSL preference, subdomains, database requirements, or specific CDN configurations..."
              className="mt-1 text-xs"
            />
          </div>

          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-slate-700 flex items-center justify-between">
            <span className="text-[11px]">
              <strong>Deployment Ticket Fee:</strong> 200 Credits deducted from balance.
            </span>
            <ShieldCheck className="h-4 w-4 text-teal-600" />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-dudos-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={isSubmitting || !domainName.trim()}>
              <Send className="h-3.5 w-3.5 mr-1" />
              {isSubmitting ? "Creating Ticket..." : "Submit Deployment Ticket"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
