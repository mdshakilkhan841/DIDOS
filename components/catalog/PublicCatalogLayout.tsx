"use client";

import React, { useState } from "react";
import { ContentContext } from "@/components/dudos-content-context";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import { FloatingGuide } from "@/components/home/FloatingGuide";
import { Notice } from "@/components/dudos-ui";
import { PageHeading } from "./PageHeading";
import { CatalogSearch } from "./CatalogSearch";
import { CatalogGrid } from "./CatalogGrid";
import { PackageGrid } from "./PackageGrid";
import { DetailView } from "./DetailView";
import { EditorialView } from "./EditorialView";
import { AssessmentWizard, QuickIntake } from "@/components/dudos-records";
import { FAQ } from "@/components/dudos-ui";
import { t, human } from "@/lib/i18n";

export function PublicCatalogLayout({
  content,
  lang = "en",
  path = "",
}: {
  content: any;
  lang?: string;
  path?: string;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const root = path.split("/")[0] || "";
  const page =
    content.pages?.find((p: any) => p.route === "/" + path) ||
    content.pages?.find((p: any) => p.route === "/" + root);

  const detailCollections = [
    ...(content.offers || []),
    ...(content.industries || []),
    ...(content.resources || []),
    ...(content.dol_services || []),
    ...(content.news || []),
    ...(content.case_studies || []),
    ...(content.job_openings || []),
    ...(content.opportunities || []),
    ...(content.capability_bundles || []),
    ...(content.integrations || []),
    ...(content.partner_categories || []),
    ...(content.opportunity_types || []),
    ...(content.academy_paths || []),
    ...(content.marketplace_listings || []),
  ];

  const details = detailCollections.find(
    (x: any) =>
      x.route === "/" + path ||
      path === "resources/" + x.id ||
      path === "services/" + x.id
  );

  const names: Record<string, [string, string]> = {
    solutions: ["Solutions built for your business", "ব্যবসার জন্য প্রস্তুত সমাধান"],
    products: ["A connected product ecosystem", "সংযুক্ত পণ্য ইকোসিস্টেম"],
    services: ["Services for your digital business", "ডিজিটাল ব্যবসার সেবা"],
    industries: ["Tailored for every industry", "প্রতিটি শিল্পের জন্য বিশেষায়িত"],
    packages: ["Capability bundles & pricing", "সক্ষমতা বান্ডল ও মূল্যপ্রস্তাব"],
    integrations: ["Connect with any system", "যেকোনো সিস্টেমের সাথে সংযোগ"],
    marketplace: ["Verified solutions & extensions", "যাচাইকৃত সমাধান ও এক্সটেনশন"],
    partners: ["Partner ecosystem & network", "পার্টনার ইকোসিস্টেম ও নেটওয়ার্ক"],
    talent: ["Talent, connected to opportunity", "প্রতিভা ও সুযোগের সংযোগ"],
    competitions: ["Challenges worth solving", "সমাধানযোগ্য চ্যালেঞ্জ"],
    research: ["From research to real outcomes", "গবেষণা থেকে বাস্তব ফলাফল"],
    resources: ["Knowledge & documentation", "জ্ঞান ও নথিপত্র"],
    support: ["Assistance, status & help", "সহায়তা, স্ট্যাটাস ও সেবা"],
  };

  let title = t(page?.title, lang) || human(root);
  let description = t(page?.description, lang);

  if (!page && names[root]) {
    title = lang === "bn" ? names[root][1] : names[root][0];
  }

  const isDark = ["partners", "talent", "competitions", "research"].includes(root);

  const resourceIds = (content.resources || []).map((r: any) => r.id);

  const matched = (items: any[]) =>
    items.filter((x: any) => {
      const matchSearch = JSON.stringify(x).toLowerCase().includes(q.toLowerCase());
      const matchFilter = filter === "all" || x.category === filter;
      return matchSearch && matchFilter;
    });

  const categories: string[] | undefined =
    root === "integrations"
      ? (Array.from(
          new Set(
            (content.integrations || [])
              .map((x: any) => String(x.category || ""))
              .filter(Boolean)
          )
        ) as string[])
      : undefined;

  return (
    <ContentContext.Provider value={content}>
      <SiteHeader lang={lang} path={path} />

      <main id="main">
        <PageHeading
          lang={lang}
          root={root}
          title={details ? t(details.title, lang) : title}
          description={details ? t(details.description, lang) : description}
          isDark={isDark}
        />

        <section className="section-wrap page-body">
          {root === "transform" ? (
            <AssessmentWizard lang={lang} />
          ) : root === "support" && path === "support/knowledge-base" ? (
            <FAQ lang={lang} />
          ) : root === "partners" && path.endsWith("/apply") ? (
            <QuickIntake kind="partner" lang={lang} />
          ) : ["talent", "competitions", "research"].includes(root) && path.endsWith("/apply") ? (
            <QuickIntake kind="application" lang={lang} />
          ) : details ? (
            <DetailView details={details} lang={lang} />
          ) : root === "packages" ? (
            <PackageGrid
              packages={content.capability_bundles || []}
              lang={lang}
            />
          ) : root === "services" ? (
            <>
              <Notice>{t("catalog.dolNotice", lang)}</Notice>
              <CatalogSearch
                query={q}
                onQueryChange={setQ}
                lang={lang}
              />
              <CatalogGrid
                items={matched(content.dol_services || [])}
                lang={lang}
                root={root}
                resourceIds={resourceIds}
              />
            </>
          ) : root === "industries" ? (
            <>
              <CatalogSearch
                query={q}
                onQueryChange={setQ}
                lang={lang}
              />
              <CatalogGrid
                items={matched(content.industries || [])}
                lang={lang}
                root={root}
                resourceIds={resourceIds}
              />
            </>
          ) : ["solutions", "products"].includes(root) ? (
            <>
              <CatalogSearch
                query={q}
                onQueryChange={setQ}
                lang={lang}
              />
              <CatalogGrid
                items={matched(content.offers || [])}
                lang={lang}
                root={root}
                resourceIds={resourceIds}
              />
            </>
          ) : root === "integrations" ? (
            <>
              <CatalogSearch
                query={q}
                onQueryChange={setQ}
                lang={lang}
                category={filter}
                onCategoryChange={setFilter}
                categories={categories}
              />
              <CatalogGrid
                items={matched(content.integrations || [])}
                lang={lang}
                root={root}
                mode="compact"
                resourceIds={resourceIds}
              />
            </>
          ) : page?.layout === "editorial" ? (
            <EditorialView page={page} lang={lang} root={root} />
          ) : (
            <>
              <CatalogSearch
                query={q}
                onQueryChange={setQ}
                lang={lang}
              />
              <CatalogGrid
                items={matched(content.offers || [])}
                lang={lang}
                root={root}
                resourceIds={resourceIds}
              />
            </>
          )}
        </section>
      </main>

      <SiteFooter lang={lang} />
      <FloatingGuide lang={lang} />
    </ContentContext.Provider>
  );
}
