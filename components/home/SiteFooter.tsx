"use client";

import React from "react";
import Link from "@/components/dudos-link";
import { useContent } from "@/components/dudos-content-context";
import { t, human } from "@/components/dudos-ui";

export function SiteFooter({ lang = "en" }: { lang?: string }) {
  const content = useContent();

  return (
    <footer className="site-footer">
      <div>
        <Link className="brand" href={`/${lang}`}>
          {content.brand.name}
          <span className="brand-dot">.</span>
        </Link>
        <p>{t(content.brand.tagline, lang)}</p>
        <small>
          {lang === "bn"
            ? "ডিজিটাল রূপান্তর ও পরিচালনা"
            : "Digital transformation & operations"}
        </small>
      </div>
      <div>
        <h3>{lang === "bn" ? "অনুসন্ধান" : "Explore"}</h3>
        {["solutions", "services", "integrations", "marketplace", "company"].map(
          (x) => (
            <Link key={x} href={`/${lang}/${x}`}>
              {human(x)}
            </Link>
          )
        )}
      </div>
      <div>
        <h3>{lang === "bn" ? "জ্ঞান ও সুযোগ" : "Learn & contribute"}</h3>
        {[
          "resources",
          "academy",
          "talent",
          "competitions",
          "research",
          "newsroom",
        ].map((x) => (
          <Link key={x} href={`/${lang}/${x}`}>
            {human(x)}
          </Link>
        ))}
      </div>
      <div>
        <h3>{lang === "bn" ? "সহায়তা" : "Help & trust"}</h3>
        {["support", "status", "trust", "accessibility", "legal", "contact"].map(
          (x) => (
            <Link key={x} href={`/${lang}/${x}`}>
              {human(x)}
            </Link>
          )
        )}
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {content.brand.name}
        </span>
        <span>
          {lang === "bn"
            ? "প্রস্তাবিত সেবা · মূল্যায়নভিত্তিক পরিধি"
            : "Service proposals · Scope confirmed through assessment"}
        </span>
      </div>
    </footer>
  );
}
