"use client";

import React from "react";
import Link from "@/components/dudos-link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t, human } from "@/lib/i18n";

export function DetailView({
  details,
  lang,
}: {
  details: any;
  lang: string;
}) {
  const tags = details.features || details.modules || [];

  return (
    <div className="detail-grid">
      <article>
        <h2>{t("catalog.shapeNeeds", lang)}</h2>
        <p className="detail-body">
          {t(details.body || details.description, lang)}
        </p>

        {details.eligibility && (
          <>
            <h3>Eligibility</h3>
            <p>{t(details.eligibility, lang)}</p>
          </>
        )}

        {details.rights_terms && (
          <>
            <h3>Participation & rights</h3>
            <p>{t(details.rights_terms, lang)}</p>
          </>
        )}

        {details.deadline && <p>Deadline: {details.deadline}</p>}
        {details.audience && <p>{t(details.audience, lang)}</p>}

        {tags.length > 0 && (
          <div className="tags">
            {tags.map((v: string) => (
              <span key={v}>{human(v)}</span>
            ))}
          </div>
        )}
      </article>

      <aside className="scope-card">
        <h3>{t("catalog.nextStep", lang)}</h3>
        <p>{t("catalog.nextStepDesc", lang)}</p>
        <Button asChild>
          <Link href={`/${lang}${details.cta_route || "/transform"}`}>
            {t("catalog.continue", lang)}
            <ArrowUpRight size={16} />
          </Link>
        </Button>
      </aside>
    </div>
  );
}
