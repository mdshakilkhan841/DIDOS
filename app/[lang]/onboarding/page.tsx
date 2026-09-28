import { redirect, notFound } from "next/navigation";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!["en", "bn"].includes(lang)) notFound();

  redirect(`/${lang}/transform`);
}
