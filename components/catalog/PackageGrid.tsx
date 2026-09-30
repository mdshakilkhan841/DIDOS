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
  type DudosPackage,
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
  useEffect(() => {
    let cancelled = false;
    void fetchPackages("public").then((result) => {
      if (!cancelled && result && result.length > 0) setLive(result);
    });
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
    </>
  );
}
