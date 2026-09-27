"use client";

import React from "react";
import Link from "@/components/dudos-link";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/dudos-ui";
import { t, human } from "@/lib/i18n";

export function PackageGrid({
  packages,
  lang,
}: {
  packages: any[];
  lang: string;
}) {
  return (
    <>
      <div className="package-intro">
        <p>{t("catalog.packageIntro", lang)}</p>
        <Badge variant="secondary">{t("catalog.assessmentQuotes", lang)}</Badge>
      </div>

      <div className="package-grid">
        {packages.map((b, i) => (
          <article
            className={`package-card ${i === 1 ? "featured" : ""}`}
            key={b.id}
          >
            <span className="micro-label">0{i + 1} / DUDOS</span>
            <h2>{t(b.title, lang)}</h2>
            <p>{t(b.description, lang)}</p>

            <div className="quote-price">
              {t("catalog.letScopeIt", lang)}
              <small>{t("catalog.pricingSubtitle", lang)}</small>
            </div>

            <ul>
              {(b.pricing_variables || []).map((v: string) => (
                <li key={v}>
                  <Check size={16} />
                  {human(v)}
                </li>
              ))}
            </ul>

            <Button asChild variant={i === 1 ? "default" : "outline"}>
              <Link href={`/${lang}/transform?package=${b.id}`}>
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
