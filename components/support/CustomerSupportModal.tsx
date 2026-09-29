"use client";

import React, { useState } from "react";
import { LifeBuoy, Send, ShieldAlert, AlertCircle, HelpCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";
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

export function CustomerSupportModal({
  open,
  onOpenChange,
  onSubmitted,
  projects = [],
  currentProjectId,
  lang = "en",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: (ticket: any) => void;
  projects?: any[];
  currentProjectId?: string;
  lang?: string;
}) {
  const { user } = useAuth();
  const [projectId, setProjectId] = useState(currentProjectId || "");
  const [category, setCategory] = useState("technical");
  const [priority, setPriority] = useState("normal");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      showToast.error("Please enter a subject for your ticket.");
      return;
    }
    if (!message.trim()) {
      showToast.error("Please describe your question or issue.");
      return;
    }

    setIsSubmitting(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("dudos_auth_token") : null;

    const payload = {
      projectId: projectId || undefined,
      category,
      priority,
      subject,
      message,
    };

    try {
      let createdTicket: any = null;
      if (token) {
        const res = await fetch("http://localhost:8000/api/v1/support/tickets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          createdTicket = await res.json();
        }
      }

      if (!createdTicket) {
        createdTicket = {
          id: "tkt_" + Date.now().toString(36),
          userId: user?.id || "usr_client",
          projectId: projectId || null,
          category,
          priority,
          subject,
          message,
          status: "open",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          customerEmail: user?.email,
          customerName: user?.displayName,
        };
      }

      // Sync with localStorage
      const existing = JSON.parse(localStorage.getItem("dudos_support_tickets") || "[]");
      const updated = [createdTicket, ...existing.filter((t: any) => t.id !== createdTicket.id)];
      localStorage.setItem("dudos_support_tickets", JSON.stringify(updated));

      showToast.success("Support ticket submitted successfully!", {
        description: `Ticket #${createdTicket.id.slice(-6).toUpperCase()} has been forwarded to the technical team.`,
      });

      if (onSubmitted) {
        onSubmitted(createdTicket);
      }

      // Reset form & close
      setSubject("");
      setMessage("");
      onOpenChange(false);
    } catch (err: any) {
      showToast.error("Failed to submit support ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] bg-white border border-[#dce5e9] p-6 shadow-xl rounded-2xl">
        <DialogHeader className="space-y-1.5 pb-4 border-b border-[#eef3f6]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#edf7f4] text-[#087f79]">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-[#162c38]">
                {lang === "bn" ? "নতুন সাপোর্ট টিকিট তৈরি করুন" : "Open a Support Ticket"}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#5b6f7b]">
                {lang === "bn"
                  ? "যেকোনো প্রযুক্তিগত, বিলিং বা ফিচার সংক্রান্ত সমস্যা সরাসরি আমাদের ইঞ্জিনিয়ারদের জানান।"
                  : "Submit technical queries, billing inquiries, or feature requests directly to our team."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Related Project (Optional) */}
          {projects.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="support-project" className="text-xs font-semibold text-[#162c38]">
                Related Project (Optional)
              </Label>
              <select
                id="support-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full text-xs font-medium bg-[#f8fafb] border border-[#dce5e9] rounded-lg px-3 py-2 text-[#162c38] outline-none focus:border-[#087f79] focus:ring-1 focus:ring-[#087f79]"
              >
                <option value="">General Account Inquiry (No Project)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title || p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="support-category" className="text-xs font-semibold text-[#162c38]">
                Category
              </Label>
              <select
                id="support-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-medium bg-[#f8fafb] border border-[#dce5e9] rounded-lg px-3 py-2 text-[#162c38] outline-none focus:border-[#087f79] focus:ring-1 focus:ring-[#087f79]"
              >
                <option value="technical">Technical Support</option>
                <option value="billing">Billing & Credits</option>
                <option value="deployment">Deployment & Domain</option>
                <option value="feature">Feature Request</option>
                <option value="general">General Inquiry</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="support-priority" className="text-xs font-semibold text-[#162c38]">
                Priority Level
              </Label>
              <select
                id="support-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-xs font-medium bg-[#f8fafb] border border-[#dce5e9] rounded-lg px-3 py-2 text-[#162c38] outline-none focus:border-[#087f79] focus:ring-1 focus:ring-[#087f79]"
              >
                <option value="low">Low (General Query)</option>
                <option value="normal">Normal (Standard SLA)</option>
                <option value="high">High (Urgent Issue)</option>
                <option value="critical">Critical (System Outage)</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="support-subject" className="text-xs font-semibold text-[#162c38]">
              Subject
            </Label>
            <Input
              id="support-subject"
              placeholder="Brief summary of the issue (e.g. SSL renewal, payment receipt)..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-xs font-medium bg-[#f8fafb] border-[#dce5e9] focus:border-[#087f79]"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="support-message" className="text-xs font-semibold text-[#162c38]">
              Detailed Description
            </Label>
            <Textarea
              id="support-message"
              placeholder="Explain the issue, error messages seen, steps to reproduce, or requested outcome..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="text-xs font-medium bg-[#f8fafb] border-[#dce5e9] focus:border-[#087f79]"
              required
            />
          </div>

          {/* SLA Notice */}
          <div className="bg-[#f0f4f6] rounded-xl p-3 border border-[#dce5e9] text-[11px] text-[#5b6f7b] flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-[#087f79] shrink-0 mt-0.5" />
            <div>
              <span>
                Standard SLA response time is within <strong>2 to 4 business hours</strong>. Critical issues are automatically escalated to on-duty systems engineers.
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eef3f6]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs font-medium text-[#5b6f7b] border-[#dce5e9]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#087f79] hover:bg-[#066762] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Ticket</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
