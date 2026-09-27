import { notFound } from "next/navigation";
import { CustomerOnboardingWizard } from "@/components/onboarding/CustomerOnboardingWizard";

export const metadata = {
  title: "Client Onboarding & Project Intake | DUDOS",
  description: "DUDOS customer lifecycle onboarding, technical estimation review, and billing gate.",
};

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!["en", "bn"].includes(lang)) notFound();

  return <CustomerOnboardingWizard lang={lang} />;
}
