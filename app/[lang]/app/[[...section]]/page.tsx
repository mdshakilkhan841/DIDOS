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

  // Server-side auth check: if no session cookie, redirect immediately to login
  const jar = await cookies();
  const sessionToken = jar.get("dudos_at")?.value || jar.get("dudos_session")?.value;
  if (!sessionToken) {
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
