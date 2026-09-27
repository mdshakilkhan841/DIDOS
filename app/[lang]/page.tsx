import { getPublicContent } from "@/lib/dudos/cms-server";
import { HomePublicLayout } from "@/components/home/HomePublicLayout";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LangPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!["en", "bn"].includes(lang)) {
    notFound();
  }

  const content = await getPublicContent();
  return <HomePublicLayout content={content} lang={lang} />;
}
