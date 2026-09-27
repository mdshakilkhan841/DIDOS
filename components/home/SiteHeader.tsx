"use client";

import React, { useState, useEffect } from "react";
import Link from "@/components/dudos-link";
import { ArrowUpRight, Globe2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useContent } from "@/components/dudos-content-context";
import { t } from "@/lib/i18n";

export function SiteHeader({
  lang = "en",
  path = "",
}: {
  lang?: string;
  path?: string;
}) {
  const content = useContent();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [path, lang]);

  const links: [string, string][] = (content.navigation || []).map((x: any) => [
    x.route.replace(/^\//, ""),
    t(x.label, lang),
  ]);

  const nextLang = lang === "en" ? "bn" : "en";
  const switchTarget = `/${nextLang}${path ? `/${path}` : ""}`;

  return (
    <>
      <a className="skip-link" href="#main">
        {t("common.skipToContent", lang)}
      </a>
      <header className="site-header">
        <Link className="brand" href={"/" + lang}>
          <span className="brand-symbol">D</span>
          <span>
            {content.brand?.name || "DUDOS"}
            <span className="brand-dot">.</span>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {links.slice(0, 5).map(([url, label]) => (
            <Link
              key={url}
              href={`/${lang}/${url}`}
              className={path.startsWith(url) ? "active" : ""}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link
            className="language"
            href={switchTarget}
            lang={nextLang}
          >
            <Globe2 size={15} />
            <span>{t("common.switchLanguageLabel", lang)}</span>
          </Link>
          <Link className="desktop-login" href={`/${lang}/app`}>
            {t("nav.workspace", lang)}
          </Link>
          <Button asChild className="header-cta">
            <Link href={`/${lang}/builder`}>
              {t("nav.websiteBuilder", lang)}
              <ArrowUpRight size={16} />
            </Link>
          </Button>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mobile-menu"
                aria-label={t("nav.openNavigation", lang)}
              >
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{content.brand?.name || "DUDOS"}</SheetTitle>
              </SheetHeader>
              <nav
                className="mobile-links"
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("a")) setMenuOpen(false);
                }}
              >
                {links.map(([url, label]) => (
                  <Link key={url} href={`/${lang}/${url}`}>
                    {label}
                  </Link>
                ))}
                <Link href={`/${lang}/transform`}>{t("nav.transformation", lang)}</Link>
                <Link href={`/${lang}/app`}>{t("nav.workspace", lang)}</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
