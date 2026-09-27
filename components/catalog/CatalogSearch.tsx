"use client";

import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Choose } from "@/components/dudos-ui";
import { t } from "@/lib/i18n";

export function CatalogSearch({
  query,
  onQueryChange,
  lang,
  category,
  onCategoryChange,
  categories,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  lang: string;
  category?: string;
  onCategoryChange?: (v: string) => void;
  categories?: string[];
}) {
  return (
    <div className="catalog-tools">
      <div className="search-input">
        <Search size={18} />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t("catalog.searchPlaceholder", lang)}
          aria-label="Search catalogue"
        />
      </div>

      {categories && onCategoryChange && (
        <Choose
          value={category || "all"}
          onChange={onCategoryChange}
          options={["all", ...categories]}
          label="Category"
        />
      )}

      <span>{t("catalog.chooseScope", lang)}</span>
    </div>
  );
}
