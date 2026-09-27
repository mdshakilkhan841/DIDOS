import { notFound } from "next/navigation";
import { SalesPage } from "@/components/dudos-sales-agent";
import { getPublicContent } from "@/lib/dudos/cms-server";

export const metadata = {
  title: "Service & Sales Agent | DUDOS",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!["en", "bn"].includes(lang)) notFound();
  const data = await getPublicContent();
  return <SalesPage lang={lang} data={data} />;
}
