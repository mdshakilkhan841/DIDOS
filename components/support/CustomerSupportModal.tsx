"use client";

import React, { useState } from "react";
import { LifeBuoy, Send, ShieldAlert, AlertCircle, HelpCircle } from "lucide-react";
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
      showToast.error(
        lang === "bn"
          ? "দয়া করে আপনার টিকেটের একটি বিষয় লিখুন।"
          : "Please enter a subject for your ticket."
      );
      return;
    }
    if (!message.trim()) {
      showToast.error(
        lang === "bn"
          ? "দয়া করে আপনার প্রশ্ন বা সমস্যাটি বিস্তারিত লিখুন।"
          : "Please describe your question or issue."
      );
      return;
    }

    setIsSubmitting(true);
    const token =
      getAuthToken() ||
      (typeof window !== "undefined"
        ? localStorage.getItem("dudos_jwt_token") ||
          localStorage.getItem("dudos_auth_token")
        : null);

    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

    const payload = {
      projectId: projectId || undefined,
      category,
      priority,
      subject: subject.trim(),
      message: message.trim(),
    };

    try {
      let createdTicket: any = null;
      if (token) {
        const res = await fetch(`${apiBase}/support/tickets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          createdTicket = await res.json();
        } else {
          const errJson = await res.json().catch(() => ({}));
          const errMsg = errJson?.detail || "Server rejected the ticket submission.";
          showToast.error(
            lang === "bn" ? "টিকেট জমা ব্যর্থ হয়েছে" : "Failed to submit support ticket",
            { description: errMsg }
          );
          setIsSubmitting(false);
          return;
        }
      } else {
        showToast.error(
          lang === "bn" ? "লগইন প্রয়োজন" : "Authentication required",
          {
            description:
              lang === "bn"
                ? "সাপোর্ট টিকিট জমা দিতে দয়া করে লগইন করুন।"
                : "Please sign in to submit a ticket to the engineering team.",
          }
        );
        setIsSubmitting(false);
        return;
      }

      // Sync with localStorage
      const existing = JSON.parse(localStorage.getItem("dudos_support_tickets") || "[]");
      const updated = [createdTicket, ...existing.filter((t: any) => t.id !== createdTicket.id)];
      localStorage.setItem("dudos_support_tickets", JSON.stringify(updated));

      showToast.success(
        lang === "bn"
          ? "সাপোর্ট টিকিট সফলভাবে জমা দেওয়া হয়েছে!"
          : "Support ticket submitted successfully!",
        {
          description:
            lang === "bn"
              ? `টিকেট #${createdTicket.id.slice(-6).toUpperCase()} কারিগরি টিমের কাছে পাঠানো হয়েছে।`
              : `Ticket #${createdTicket.id.slice(-6).toUpperCase()} has been forwarded to the technical team.`,
        }
      );

      if (onSubmitted) {
        onSubmitted(createdTicket);
      }

      // Reset form & close
      setSubject("");
      setMessage("");
      onOpenChange(false);
    } catch (err: any) {
      showToast.error(
        lang === "bn"
          ? "সাপোর্ট টিকিট জমা দেওয়া যায়নি। আবার চেষ্টা করুন।"
          : "Failed to submit support ticket. Please try again."
      );
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
                {lang === "bn" ? "সংশ্লিষ্ট প্রজেক্ট (ঐচ্ছিক)" : "Related Project (Optional)"}
              </Label>
              <select
                id="support-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full text-xs font-medium bg-[#f8fafb] border border-[#dce5e9] rounded-lg px-3 py-2 text-[#162c38] outline-none focus:border-[#087f79] focus:ring-1 focus:ring-[#087f79]"
              >
                <option value="">{lang === "bn" ? "সাধারণ অ্যাকাউন্ট অনুসন্ধান (কোনো প্রজেক্ট নেই)" : "General Account Inquiry (No Project)"}</option>
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
                {lang === "bn" ? "বিভাগ" : "Category"}
              </Label>
              <select
                id="support-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-medium bg-[#f8fafb] border border-[#dce5e9] rounded-lg px-3 py-2 text-[#162c38] outline-none focus:border-[#087f79] focus:ring-1 focus:ring-[#087f79]"
              >
                <option value="technical">{lang === "bn" ? "কারিগরি সহায়তা" : "Technical Support"}</option>
                <option value="billing">{lang === "bn" ? "বিলিং ও ক্রেডিট" : "Billing & Credits"}</option>
                <option value="deployment">{lang === "bn" ? "ডিপ্লয়মেন্ট ও ডোমেন" : "Deployment & Domain"}</option>
                <option value="feature">{lang === "bn" ? "ফিচার রিকোয়েস্ট" : "Feature Request"}</option>
                <option value="general">{lang === "bn" ? "সাধারণ জিজ্ঞাসা" : "General Inquiry"}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="support-priority" className="text-xs font-semibold text-[#162c38]">
                {lang === "bn" ? "অগ্রাধিকার স্তর" : "Priority Level"}
              </Label>
              <select
                id="support-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-xs font-medium bg-[#f8fafb] border border-[#dce5e9] rounded-lg px-3 py-2 text-[#162c38] outline-none focus:border-[#087f79] focus:ring-1 focus:ring-[#087f79]"
              >
                <option value="low">{lang === "bn" ? "কম (সাধারণ জিজ্ঞাসা)" : "Low (General Query)"}</option>
                <option value="normal">{lang === "bn" ? "স্বাভাবিক (স্ট্যান্ডার্ড SLA)" : "Normal (Standard SLA)"}</option>
                <option value="high">{lang === "bn" ? "উচ্চ (জরুরি সমস্যা)" : "High (Urgent Issue)"}</option>
                <option value="critical">{lang === "bn" ? "গুরুত্বপূর্ণ (সিস্টেম বিভ্রাট)" : "Critical (System Outage)"}</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="support-subject" className="text-xs font-semibold text-[#162c38]">
              {lang === "bn" ? "বিষয়" : "Subject"}
            </Label>
            <Input
              id="support-subject"
              placeholder={lang === "bn" ? "সমস্যার সংক্ষিপ্ত বিবরণ (যেমন: এসএসএল নবায়ন, পেমেন্ট রসিদ)..." : "Brief summary of the issue (e.g. SSL renewal, payment receipt)..."}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-xs font-medium bg-[#f8fafb] border-[#dce5e9] focus:border-[#087f79]"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="support-message" className="text-xs font-semibold text-[#162c38]">
              {lang === "bn" ? "বিস্তারিত বিবরণ" : "Detailed Description"}
            </Label>
            <Textarea
              id="support-message"
              placeholder={lang === "bn" ? "সমস্যা, প্রদর্শিত ত্রুটি বার্তা বা কাঙ্ক্ষিত ফলাফল ব্যাখ্যা করুন..." : "Explain the issue, error messages seen, steps to reproduce, or requested outcome..."}
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
                {lang === "bn"
                  ? "স্ট্যান্ডার্ড SLA প্রতিক্রিয়া সময় ২ থেকে ৪ ব্যবসায়িক ঘণ্টার মধ্যে। জরুরি সমস্যা সরাসরি অন-ডিউটি সিস্টেম ইঞ্জিনিয়ারদের কাছে পাঠানো হয়।"
                  : "Standard SLA response time is within 2 to 4 business hours. Critical issues are automatically escalated to on-duty systems engineers."}
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
              {lang === "bn" ? "বাতিল" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#087f79] hover:bg-[#066762] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <span>{lang === "bn" ? "জমা হচ্ছে..." : "Submitting..."}</span>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>{lang === "bn" ? "টিকিট জমা দিন" : "Submit Ticket"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
