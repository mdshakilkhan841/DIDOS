"use client";

import React from "react";
import Link from "@/components/dudos-link";
import { ArrowUpRight, Code2, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { t, human } from "@/lib/i18n";

export function CatalogCard({
  item,
  lang,
  root,
  resourceIds = [],
}: {
  item: any;
  lang: string;
  root: string;
  resourceIds?: string[];
}) {
  const isIntegration = item.id?.startsWith("INT");
  const isResource = resourceIds.includes(item.id);

  let targetHref = `/${lang}`;
  if (item.route) {
    targetHref = `/${lang}${item.route}`;
  } else if (item.cta_route) {
    targetHref = `/${lang}${item.cta_route}`;
  } else if (isResource) {
    targetHref = `/${lang}/resources/${item.id}`;
  } else if (root === "integrations") {
    targetHref = `/${lang}/app/records/integration`;
  } else if (root === "partners") {
    targetHref = `/${lang}/partners/apply`;
  } else if (root === "talent" || root === "competitions" || root === "research") {
    targetHref = `/${lang}/talent/apply`;
  } else {
    targetHref = `/${lang}/transform`;
  }

  const ctaLabel =
    t(item.cta, lang) ||
    t(item.cta?.label, lang) ||
    t("catalog.exploreScope", lang);

  return (
    <article className="catalog-card">
      <div className="catalog-kicker">
        <span>{isIntegration ? <Link2 size={19} /> : <Code2 size={19} />}</span>
        {item.state && <Badge variant="secondary">{human(item.state)}</Badge>}
        {item.enrollment_open === false && (
          <Badge variant="secondary">{t("catalog.proposed", lang)}</Badge>
        )}
      </div>

      <h3>{t(item.title, lang)}</h3>
      <p>{t(item.description, lang)}</p>

      {item.audience && <small>{t(item.audience, lang)}</small>}

      {item.features && Array.isArray(item.features) && (
        <div className="tags">
          {item.features.map((x: string) => (
            <span key={x}>{human(x)}</span>
          ))}
        </div>
      )}

      {item.price_label && (
        <p className="price-note">{t(item.price_label, lang)}</p>
      )}

      <Link className="card-link" href={targetHref}>
        {ctaLabel}
        <ArrowUpRight size={16} />
      </Link>
    </article>
  );
}
