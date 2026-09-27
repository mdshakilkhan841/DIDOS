"use client";

import React from "react";
import Link from "@/components/dudos-link";
import { useContent } from "@/components/dudos-content-context";
import { t, human } from "@/lib/i18n";

export function SiteFooter({ lang = "en" }: { lang?: string }) {
  const content = useContent();

  return (
    <footer className="site-footer">
      <div>
        <Link className="brand" href={`/${lang}`}>
          {content.brand?.name || "DUDOS"}
          <span className="brand-dot">.</span>
        </Link>
        <p>{t(content.brand?.tagline, lang)}</p>
        <small>{t("common.taglineSub", lang)}</small>
      </div>
      <div>
        <h3>{t("common.explore", lang)}</h3>
        {["solutions", "services", "integrations", "marketplace", "company"].map(
          (x) => (
            <Link key={x} href={`/${lang}/${x}`}>
              {human(x)}
            </Link>
          )
        )}
      </div>
      <div>
        <h3>{t("common.learnAndContribute", lang)}</h3>
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
        <h3>{t("common.helpAndTrust", lang)}</h3>
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
          © {new Date().getFullYear()} {content.brand?.name || "DUDOS"}
        </span>
        <span>{t("common.footerNotice", lang)}</span>
      </div>
    </footer>
  );
}
