"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors
    console.error("DUDOS Unhandled Runtime Exception:", error);
    showToast.error("An unexpected error occurred", {
      description: error.message || "The application encountered a problem.",
    });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dudos-surface px-6 py-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-dudos-error-soft text-dudos-error shadow-sm mb-6 border border-dudos-error/20">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-dudos-text sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm text-dudos-text-secondary leading-relaxed">
        An unexpected error occurred while processing your request. Our telemetry has logged the event.
      </p>

      {error.digest && (
        <div className="mt-4 rounded-lg bg-white border border-dudos-border px-3 py-1.5 font-mono text-xs text-dudos-text-secondary">
          Error ID: {error.digest}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="primary"
          onClick={() => reset()}
          className="gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          <span>Try Again</span>
        </Button>
        <Link href="/">
          <Button variant="secondary" className="gap-2">
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </Button>
        </Link>
      </div>

      <div className="mt-12 text-xs text-dudos-text-secondary">
        If this problem persists, contact the Daffodil IT Support Desk.
      </div>
    </div>
  );
}
