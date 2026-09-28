import { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginClient } from "../login/LoginClient";

export const metadata: Metadata = {
  title: "Create Account — DUDOS Operations & Workspace",
  description: "Join the Daffodil Unified Digital Operating System ecosystem.",
};

function safeReturnTo(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/app";
  return raw;
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.return_to);

  // If accessed with signin/login mode, redirect cleanly to /login
  if (params.mode === "signin" || params.mode === "login") {
    const qs = returnTo && returnTo !== "/app" ? `?return_to=${encodeURIComponent(returnTo)}` : "";
    redirect(`/login${qs}`);
  }

  return <LoginClient initialMode="signup" returnTo={returnTo} />;
}
