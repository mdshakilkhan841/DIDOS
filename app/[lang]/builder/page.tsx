import Builder from "@/components/builder/Builder";
import "@/components/builder/builder.css";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Website Builder | DUDOS",
  description:
    "Configure and generate an editable website with complete source and a portable installation package.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!["en", "bn"].includes(lang)) {
    notFound();
  }
  return <Builder lang={lang} />;
}
