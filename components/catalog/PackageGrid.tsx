"use client";

import React, { useEffect, useState } from "react";
import Link from "@/components/dudos-link";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/dudos-ui";
import { t, human } from "@/lib/i18n";
import {
  fetchPackages,
  formatBdt,
  formatUsd,
  packageDescription,
  packageName,
  unitLabel,
  type DudosPackage,
  type PackageKind,
} from "@/lib/dudos/packages";

type Card = {
  id: string;
  title: string;
  description: string;
  features: string[];
  price: string;
  badge?: string | null;
  featured: boolean;
};

export function PackageGrid({
  packages,
  lang,
}: {
  packages: any[];
  lang: string;
}) {
  // Admin-managed website packages replace the built-in content once any exist.
  const [live, setLive] = useState<DudosPackage[] | null>(null);
  const [build, setBuild] = useState<DudosPackage[]>([]);
  const [topUps, setTopUps] = useState<DudosPackage[]>([]);
  useEffect(() => {
    let cancelled = false;
    const load = (kind: PackageKind, apply: (items: DudosPackage[]) => void) =>
      void fetchPackages(kind).then((result) => {
        if (!cancelled && result && result.length > 0) apply(result);
      });
    load("public", setLive);
    load("build", setBuild);
    load("credit", setTopUps);
    return () => {
      cancelled = true;
    };
  }, []);

  const cards: Card[] = live
    ? live.map((pkg, i) => ({
        id: pkg.slug || pkg.id,
        title: packageName(pkg, lang),
        description: packageDescription(pkg, lang),
        features: pkg.features,
        price: [formatBdt(pkg.priceBdt), formatUsd(pkg.priceUsd)].filter(Boolean).join(" · "),
        badge: pkg.badge,
        featured: Boolean(pkg.badge) || (!live.some((p) => p.badge) && i === 1),
      }))
    : packages.map((b, i) => ({
        id: b.id,
        title: t(b.title, lang),
        description: t(b.description, lang),
        features: (b.pricing_variables || []).map((v: string) => human(v)),
        price: "",
        featured: i === 1,
      }));

  return (
    <>
      <div className="package-intro">
        <p>{t("catalog.packageIntro", lang)}</p>
        <Badge variant="secondary">{t("catalog.assessmentQuotes", lang)}</Badge>
      </div>

      <div className="package-grid">
        {cards.map((card, i) => (
          <article
            className={`package-card ${card.featured ? "featured" : ""}`}
            key={card.id}
          >
            <span className="micro-label">
              {card.badge || `0${i + 1} / DUDOS`}
            </span>
            <h2>{card.title}</h2>
            <p>{card.description}</p>

            <div className="quote-price">
              {card.price || t("catalog.letScopeIt", lang)}
              <small>{t("catalog.pricingSubtitle", lang)}</small>
            </div>

            <ul>
              {card.features.map((feature) => (
                <li key={feature}>
                  <Check size={16} />
                  {feature}
                </li>
              ))}
            </ul>

            <Button asChild variant={card.featured ? "default" : "outline"}>
              <Link href={`/${lang}/transform?package=${card.id}`}>
                {t("catalog.chooseScopeBtn", lang)}
                <ArrowUpRight size={16} />
              </Link>
            </Button>
          </article>
        ))}
      </div>

      <Notice>{t("catalog.packageNotice", lang)}</Notice>

      <LivePackageSection
        lang={lang}
        packages={build}
        title={lang === "bn" ? "বিল্ড প্যাকেজ" : "Build packages"}
        intro={
          lang === "bn"
            ? "অ্যাসেসমেন্ট নিশ্চিত করার পর আপনার ওয়ালেট থেকে এই মূল্য কাটা হয় এবং প্রজেক্টটি বিল্ডারে যায়।"
            : "After you confirm your assessment, this is charged from your wallet to send the project to the builder."
        }
        price={(pkg) => `${(pkg.credits || 0).toLocaleString()} ${unitLabel(pkg.unit, lang)}`}
        cta={lang === "bn" ? "অ্যাসেসমেন্ট শুরু করুন" : "Start an assessment"}
        href={`/${lang}/transform`}
      />

      <LivePackageSection
        lang={lang}
        packages={topUps}
        title={lang === "bn" ? "টপ-আপ প্যাক" : "Top-up packs"}
        intro={
          lang === "bn"
            ? "আপনার ওয়ার্কস্পেসের ওয়ালেটে ব্যালেন্স যোগ করুন।"
            : "Add balance to your workspace wallet."
        }
        price={(pkg) =>
          `${(pkg.credits || 0).toLocaleString()} ${unitLabel(pkg.unit, lang)} · ${
            [formatBdt(pkg.priceBdt), formatUsd(pkg.priceUsd)].filter(Boolean).join(" · ") || "—"
          }`
        }
        cta={lang === "bn" ? "ওয়ালেটে কিনুন" : "Buy in your wallet"}
        href={`/${lang}/app/billing`}
      />
    </>
  );
}

/** Build packages and top-up packs from Packages & Pricing; hidden when there are none. */
function LivePackageSection({
  lang,
  packages,
  title,
  intro,
  price,
  cta,
  href,
}: {
  lang: string;
  packages: DudosPackage[];
  title: string;
  intro: string;
  price: (pkg: DudosPackage) => string;
  cta: string;
  href: string;
}) {
  if (packages.length === 0) return null;
  const hasBadge = packages.some((pkg) => pkg.badge);
  return (
    <>
      <div className="package-intro" style={{ marginTop: 56 }}>
        <div>
          <h2>{title}</h2>
          <p>{intro}</p>
        </div>
      </div>
      <div className="package-grid">
        {packages.map((pkg, i) => {
          const featured = Boolean(pkg.badge) || (!hasBadge && packages.length > 2 && i === 1);
          return (
            <article className={`package-card ${featured ? "featured" : ""}`} key={pkg.id}>
              <span className="micro-label">{pkg.badge || `0${i + 1} / DUDOS`}</span>
              <h2>{packageName(pkg, lang)}</h2>
              <p>{packageDescription(pkg, lang)}</p>
              <div className="quote-price">{price(pkg)}</div>
              <ul>
                {pkg.features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild variant={featured ? "default" : "outline"}>
                <Link href={href}>
                  {cta}
                  <ArrowUpRight size={16} />
                </Link>
              </Button>
            </article>
          );
        })}
      </div>
    </>
  );
}
