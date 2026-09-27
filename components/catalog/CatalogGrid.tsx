"use client";

import React from "react";
import { Empty } from "@/components/dudos-ui";
import { CatalogCard } from "./CatalogCard";
import { t } from "@/lib/i18n";

export function CatalogGrid({
  items,
  lang,
  root,
  mode = "default",
  resourceIds = [],
}: {
  items: any[];
  lang: string;
  root: string;
  mode?: "default" | "compact";
  resourceIds?: string[];
}) {
  if (!items.length) {
    return (
      <Empty title={t("catalog.noResults", lang)}>
        {t("catalog.tryAnotherSearch", lang)}
      </Empty>
    );
  }

  return (
    <div className={`catalog-grid ${mode === "compact" ? "compact" : ""}`}>
      {items.map((item, i) => (
        <CatalogCard
          key={item.id || i}
          item={item}
          lang={lang}
          root={root}
          resourceIds={resourceIds}
        />
      ))}
    </div>
  );
}
