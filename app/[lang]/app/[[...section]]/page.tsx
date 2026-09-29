export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Workbench from "@/components/dudos-workbench";
import { moduleById } from "@/lib/dudos/modules";

export const metadata = {
  title: "Workspace | DUDOS",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; section?: string[] }>;
}) {
  const { lang, section = [] } = await params;
  if (!["en", "bn"].includes(lang)) notFound();

  // Server-side auth check: verify active session
  const jar = await cookies();
  const sessionToken = jar.get("dudos_at")?.value;
  const sessionCookie = jar.get("dudos_session")?.value;

  if (!sessionToken && !sessionCookie) {
    const returnTo = `/${lang}/app${section.length ? "/" + section.join("/") : ""}`;
    redirect(`/login?return_to=${encodeURIComponent(returnTo)}`);
  }

  // If token is present, ensure account actually exists in PostgreSQL
  const tokenToVerify = (sessionToken && !sessionToken.startsWith("token_"))
    ? sessionToken
    : (sessionCookie ? (() => {
        try {
          const parsed = JSON.parse(decodeURIComponent(sessionCookie));
          return parsed.token && !parsed.token.startsWith("token_") ? parsed.token : null;
        } catch {
          return null;
        }
      })() : null);

  if (tokenToVerify) {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
      const checkRes = await fetch(`${apiBase}/auth/me`, {
        headers: { Authorization: `Bearer ${tokenToVerify}` },
        cache: "no-store",
        signal: AbortSignal.timeout(1500),
      });
      if (!checkRes.ok) {
        // Backend says token is invalid or account was deleted in PostgreSQL
        const returnTo = `/${lang}/app${section.length ? "/" + section.join("/") : ""}`;
        redirect(`/login?return_to=${encodeURIComponent(returnTo)}`);
      }
    } catch (e: any) {
      if (e?.digest?.startsWith("NEXT_REDIRECT")) throw e;
    }
  } else if (sessionToken?.startsWith("token_")) {
    // Stale dummy token from older mock runs
    const returnTo = `/${lang}/app${section.length ? "/" + section.join("/") : ""}`;
    redirect(`/login?return_to=${encodeURIComponent(returnTo)}`);
  }

  const aliases: Record<string, string> = {
    admin: "tenant-admin",
    platform: "platform-admin",
    leadership: "executive",
    talent: "records/application",
    research: "records/research",
  };

  if (aliases[section[0]]) redirect("/" + lang + "/app/" + aliases[section[0]]);

  const allowed = [
    "overview",
    "projects",
    "scoping",
    "deployments",
    "invoices",
    "billing",
    "builder",
    "assets",
    "reference",
    "documents",
    "audit",
    "requests",
    "notifications",
    "team",
    "join",
    "settings",
    "tenant-admin",
    "platform-admin",
    "clients",
    "servers",
    "ledger",
    "support",
    "studio",
    "cms",
    "inbox",
    "agent-controls",
    "records",
    "customer",
    "merchant",
    "partner",
    "staff",
    "finance",
    "executive",
    "academy",
  ];

  if (section[0] && !allowed.includes(section[0])) notFound();
  if (section[0] === "records" && (!moduleById(section[1]) || section.length !== 2))
    notFound();

  return (
    <Workbench
      lang={lang}
      section={section}
    />
  );
}
