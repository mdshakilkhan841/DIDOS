"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Notice } from "@/components/ui/notice";
import { showToast } from "@/lib/toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      showToast.error("Invalid email address.");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 800));
      setSubmitted(true);
      showToast.success("Recovery link dispatched", {
        description: `Check your inbox at ${email}`,
      });
    } catch {
      setErrorMsg("Could not send recovery instructions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      <AuthBrandPanel activeRole="client" />

      <div className="flex w-full flex-1 flex-col justify-between px-6 py-8 sm:px-12 md:w-1/2 lg:px-16 overflow-y-auto">
        <div className="w-full max-w-md mx-auto mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-dudos-text-secondary hover:text-dudos-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto my-auto py-4">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-dudos-text">
              Reset Your Password
            </h2>
            <p className="mt-1.5 text-sm text-dudos-text-secondary">
              Enter the corporate or institutional email associated with your account.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4">
              <Notice tone="error">{errorMsg}</Notice>
            </div>
          )}

          {submitted ? (
            <div className="rounded-xl border border-dudos-primary/30 bg-dudos-surface-mint/70 p-6 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dudos-primary/15 text-dudos-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-dudos-text">Check Your Inbox</h3>
                <p className="mt-1 text-xs text-dudos-text-secondary leading-relaxed">
                  We have sent password recovery instructions to{" "}
                  <strong className="text-dudos-text">{email}</strong>. If you do not see it within a few minutes, check your spam filter.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => setSubmitted(false)}
              >
                Send Again or Try Another Email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" required>
                  Registered Email Address
                </Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dudos-text-secondary" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@daffodil.family"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2"
              >
                <span>Send Recovery Instructions</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-dudos-border text-center text-sm text-dudos-text-secondary">
            Remember your credentials?{" "}
            <Link href="/login" className="font-semibold text-dudos-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto pt-6 text-center text-xs text-dudos-text-secondary border-t border-dudos-border/60">
          © {new Date().getFullYear()} DUDOS Authentication Governance
        </div>
      </div>
    </div>
  );
}
