import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPublicContent } from "@/lib/dudos/cms-server";
import { HomePublicLayout } from "@/components/home/HomePublicLayout";
import { PublicCatalogLayout } from "@/components/catalog/PublicCatalogLayout";

export const dynamic = "force-dynamic";

const validRoots = new Set([
  "",
  "solutions",
  "products",
  "services",
  "industries",
  "packages",
  "integrations",
  "marketplace",
  "partners",
  "talent",
  "competitions",
  "research",
  "resources",
  "academy",
  "support",
  "contact",
  "status",
  "newsroom",
  "case-studies",
  "careers",
  "developers",
  "search",
  "demo",
  "company",
  "trust",
  "legal",
  "accessibility",
  "transform",
]);

const aliases: Record<string, string> = {
  about: "company",
  pricing: "packages",
  privacy: "legal/privacy",
  terms: "legal/terms",
  home: "",
  ecosystem: "products",
  career: "careers",
};

type Props = {
  params: Promise<{ lang: string; slug?: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug = [] } = await params;
  const content = await getPublicContent();
  const path = slug.join("/");

  const allItems = [
    ...(content.pages || []),
    ...(content.offers || []),
    ...(content.dol_services || []),
    ...(content.resources || []),
    ...(content.news || []),
    ...(content.case_studies || []),
    ...(content.job_openings || []),
    ...(content.opportunities || []),
    ...(content.marketplace_listings || []),
  ];

  const p = allItems.find((item: any) => item.route === "/" + path);
  const title =
    (p?.seo?.title || p?.title)?.[lang === "bn" ? "bn" : "en"] ||
    content.brand?.name ||
    "DUDOS";

  const description =
    (p?.seo?.description || p?.description)?.[lang === "bn" ? "bn" : "en"] ||
    content.brand?.tagline?.[lang === "bn" ? "bn" : "en"] ||
    "";

  return {
    title: `${title} — DUDOS`,
    description,
    openGraph: {
      title,
      siteName: "DUDOS",
      type: "website",
    },
  };
}

export default async function Page({ params }: Props) {
  const { lang, slug = [] } = await params;

  if (!["en", "bn"].includes(lang)) {
    notFound();
  }

  const path = slug.join("/");
  const root = slug[0] || "";

  // Handle aliases (e.g. /en/about -> /en/company, /en/pricing -> /en/packages)
  if (Object.hasOwn(aliases, root)) {
    redirect(
      `/${lang}/${aliases[root]}${slug.length > 1 ? "/" + slug.slice(1).join("/") : ""}`
    );
  }

  const content = await getPublicContent();

  // Root landing page: /en or /bn
  if (!path) {
    return <HomePublicLayout content={content} lang={lang} />;
  }

  // Check if valid page or detail record exists
  const exactPage = (content.pages || []).some((p: any) => p.route === "/" + path);

  const detailCollections = [
    "offers",
    "dol_services",
    "industries",
    "resources",
    "academy_paths",
    "integrations",
    "partner_categories",
    "opportunity_types",
    "capability_bundles",
    "news",
    "case_studies",
    "job_openings",
    "opportunities",
    "marketplace_listings",
  ];

  const exactDetail = detailCollections.some((c) =>
    (content[c] || []).some(
      (p: any) =>
        p.route === "/" + path ||
        (c === "resources" && path === "resources/" + p.id) ||
        (c === "dol_services" && path === "services/" + p.id)
    )
  );

  if (!validRoots.has(root) && !exactPage && !exactDetail) {
    notFound();
  }

  if (slug.length > 1 && !exactPage && !exactDetail) {
    notFound();
  }

  return <PublicCatalogLayout content={content} lang={lang} path={path} />;
}
