"use client";

import React from "react";
import Link from "@/components/dudos-link";
import {
  ArrowUpRight,
  Globe2,
  ShoppingBag,
  Workflow,
  BarChart3,
  GraduationCap,
  Code2,
} from "lucide-react";
import { useContent } from "@/components/dudos-content-context";
import { t } from "@/lib/i18n";

const icons = [Globe2, ShoppingBag, Workflow, BarChart3, GraduationCap, Code2];

export function SolutionGrid({ lang = "en" }: { lang?: string }) {
  const content = useContent();

  return (
    <section className="section-wrap">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t("solutions.eyebrow", lang)}</p>
          <h2>{t("solutions.heading", lang)}</h2>
        </div>
        <Link className="text-link" href={`/${lang}/solutions`}>
          {t("solutions.allSolutions", lang)}
          <ArrowUpRight size={17} />
        </Link>
      </div>

      <div className="solution-grid">
        {(content.home_outcomes || []).map((item: any, i: number) => {
          const Icon = icons[i % icons.length];
          return (
            <Link
              key={item.id}
              href={`/${lang}/transform?goal=${item.id}`}
              className="solution-card"
            >
              <span className="icon-box">
                <Icon size={23} />
              </span>
              <h3>{t(item.title, lang)}</h3>
              <p>{t(item.description, lang)}</p>
              <span className="card-link">
                {t("solutions.explorePath", lang)}
                <ArrowUpRight size={17} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
