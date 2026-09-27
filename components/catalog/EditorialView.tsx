"use client";

import React from "react";
import Link from "@/components/dudos-link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/dudos-ui";
import { t } from "@/lib/i18n";

export function EditorialView({
  page,
  lang,
  root,
}: {
  page: any;
  lang: string;
  root: string;
}) {
  const isLegalOrTrust = ["trust", "legal", "accessibility"].includes(root);

  return (
    <>
      <div className="prose-grid">
        {(page.sections || []).map((s: any, i: number) => (
          <article key={i}>
            <span className="section-number">0{i + 1}</span>
            <h2>{t(s.heading, lang)}</h2>
            <p>{t(s.body, lang)}</p>
          </article>
        ))}
      </div>

      {isLegalOrTrust && (
        <Notice>
          {lang === "bn"
            ? "এটি সীমিত প্রবেশাধিকারযুক্ত মূল্যায়ন সংস্করণ। চূড়ান্ত আইনগত শর্ত, ডেটা ধারণনীতি ও অ্যাক্সেসিবিলিটি অনুমোদন বাকি।"
            : "Final legal terms, retention policy and accessibility approval remain pending."}
        </Notice>
      )}

      {page.primary_cta && (
        <Button asChild>
          <Link href={`/${lang}${page.primary_cta.route}`}>
            {t(page.primary_cta.label, lang)}
            <ArrowUpRight size={16} />
          </Link>
        </Button>
      )}
    </>
  );
}
