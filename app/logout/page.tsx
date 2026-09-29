"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useSearchParams } from "next/navigation";
import { buildSubdomainUrl } from "@/lib/subdomains";
import { showToast } from "@/lib/toast";

export default function LogoutPage() {
  const { logout } = useAuth();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("return_to") || "/login";

  useEffect(() => {
    logout();
    showToast.dismiss();
    try {
      localStorage.removeItem("dudos_auth_session");
      localStorage.removeItem("dudos_jwt_token");
      sessionStorage.clear();
      const epoch = "expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      document.cookie = `dudos_session=; path=/; max-age=0; ${epoch}`;
      document.cookie = `dudos_at=; path=/; max-age=0; ${epoch}`;
      if (typeof window !== "undefined") {
        document.cookie = `dudos_session=; path=/; domain=${window.location.hostname}; max-age=0; ${epoch}`;
        document.cookie = `dudos_at=; path=/; domain=${window.location.hostname}; max-age=0; ${epoch}`;
        document.cookie = `dudos_session=; path=/; domain=.${window.location.hostname}; max-age=0; ${epoch}`;
        document.cookie = `dudos_at=; path=/; domain=.${window.location.hostname}; max-age=0; ${epoch}`;
      }
      document.cookie = `dudos_session=; path=/; domain=localhost; max-age=0; ${epoch}`;
      document.cookie = `dudos_at=; path=/; domain=localhost; max-age=0; ${epoch}`;
      document.cookie = `dudos_session=; path=/; domain=.localhost; max-age=0; ${epoch}`;
      document.cookie = `dudos_at=; path=/; domain=.localhost; max-age=0; ${epoch}`;
    } catch {}

    const dest = returnTo.startsWith("http") ? returnTo : buildSubdomainUrl("main", returnTo);
    window.location.replace(dest);
  }, [logout, returnTo]); // Run once on mount

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        <p className="text-sm text-[var(--muted-foreground)]">Signing out across all workspaces…</p>
      </div>
    </div>
  );
}
