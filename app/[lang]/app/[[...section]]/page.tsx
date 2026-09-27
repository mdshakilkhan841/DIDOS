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

  const aliases: Record<string, string> = {
    admin: "tenant-admin",
    platform: "platform-admin",
    leadership: "executive",
    talent: "records/application",
    research: "records/research",
  };

  if (aliases[section[0]]) redirect("/" + lang + "/app/" + aliases[section[0]]);

  const allowed = [
    "agent-controls",
    "cms",
    "inbox",
    "requests",
    "notifications",
    "team",
    "join",
    "overview",
    "studio",
    "assets",
    "reference",
    "documents",
    "audit",
    "records",
    "customer",
    "merchant",
    "partner",
    "staff",
    "finance",
    "executive",
    "academy",
    "tenant-admin",
    "platform-admin",
  ];

  if (section[0] && !allowed.includes(section[0])) notFound();
  if (section[0] === "records" && (!moduleById(section[1]) || section.length !== 2))
    notFound();

  return (
    <Workbench
      lang={lang}
      section={section}
      displayName="Operations Lead"
    />
  );
}
