"use client";

import React from "react";
import Link from "@/components/dudos-link";
import { t, human } from "@/lib/i18n";

export function PageHeading({
  lang,
  root,
  title,
  description,
  isDark = false,
}: {
  lang: string;
  root: string;
  title: string;
  description?: string;
  isDark?: boolean;
}) {
  return (
    <section className={`page-heading ${isDark ? "dark-heading" : ""}`}>
      <div className="breadcrumbs">
        <Link href={`/${lang}`}>DUDOS</Link>
        <span>/</span>
        <span>{human(root)}</span>
      </div>
      <p className="eyebrow">DUDOS / {t("catalog.possibilities", lang)}</p>
      <h1>{title}</h1>
      <p>{description || t("catalog.defaultDescription", lang)}</p>
    </section>
  );
}
