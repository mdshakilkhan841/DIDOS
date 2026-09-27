"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { t } from "@/lib/i18n";

export function ConnectionStrip({ lang = "en" }: { lang?: string }) {
  const stepKeys = ["discover", "build", "operate", "improve"];

  return (
    <section className="connection-strip">
      <span>{t("connectionStrip.eyebrow", lang)}</span>
      {stepKeys.map((stepKey, i) => (
        <React.Fragment key={stepKey}>
          <b>
            <span>0{i + 1}</span>
            {t(`connectionStrip.steps.${stepKey}`, lang)}
          </b>
          {i < 3 && <ArrowRight size={18} />}
        </React.Fragment>
      ))}
    </section>
  );
}
