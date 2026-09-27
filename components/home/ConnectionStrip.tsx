"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export function ConnectionStrip({ lang = "en" }: { lang?: string }) {
  const steps = [
    ["Discover", "প্রয়োজন"],
    ["Build", "নির্মাণ"],
    ["Operate", "পরিচালনা"],
    ["Improve", "উন্নয়ন"],
  ];

  return (
    <section className="connection-strip">
      <span>
        {lang === "bn"
          ? "একটি সংযুক্ত অভিজ্ঞতা"
          : "ONE CONNECTED EXPERIENCE"}
      </span>
      {steps.map(([en, bn], i) => (
        <React.Fragment key={en}>
          <b>
            <span>0{i + 1}</span>
            {lang === "bn" ? bn : en}
          </b>
          {i < 3 && <ArrowRight size={18} />}
        </React.Fragment>
      ))}
    </section>
  );
}
