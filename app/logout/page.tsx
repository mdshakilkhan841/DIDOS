"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useSearchParams, useRouter } from "next/navigation";

export default function LogoutPage() {
  const { logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnTo = searchParams.get("return_to") || "/";

  useEffect(() => {
    logout();
    router.replace(returnTo);
  }, [logout, router, returnTo]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        <p className="text-sm text-[var(--muted-foreground)]">Signing out…</p>
      </div>
    </div>
  );
}
