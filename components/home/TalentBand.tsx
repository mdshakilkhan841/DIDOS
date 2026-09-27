"use client";

import React from "react";
import Link from "@/components/dudos-link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

export function TalentBand({ lang = "en" }: { lang?: string }) {
  const trackIds = ["01", "02", "03"];

  return (
    <section className="talent-band">
      <div>
        <p className="eyebrow">{t("talent.eyebrow", lang)}</p>
        <h2>{t("talent.heading", lang)}</h2>
        <p>{t("talent.description", lang)}</p>
        <Button asChild variant="outline">
          <Link href={`/${lang}/talent`}>
            {t("talent.exploreCta", lang)}
            <ArrowUpRight size={16} />
          </Link>
        </Button>
      </div>

      <div className="talent-tracks">
        {trackIds.map((n) => (
          <Link key={n} href={`/${lang}/talent`}>
            <span>{n}</span>
            <strong>{t(`talent.tracks.${n}`, lang)}</strong>
            <ArrowUpRight size={20} />
          </Link>
        ))}
      </div>
    </section>
  );
}
