import { Metadata } from "next";
import { LoginClient } from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign In — DUDOS Operations & Workspace",
  description: "Sign in to your Daffodil Unified Digital Operating System workspace.",
};

function safeReturnTo(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/app";
  return raw;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const mode = params.mode === "signup" || params.mode === "register" ? "signup" : "signin";

  return (
    <LoginClient
      initialMode={mode}
      returnTo={safeReturnTo(params.return_to)}
    />
  );
}
