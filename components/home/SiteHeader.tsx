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

  const links: [string, string, string][] = (content.navigation || []).map(
    (x: any) => [
      x.route.replace(/^\//, ""),
      x.label?.en || "",
      x.label?.bn || "",
    ]
  );

  return (
    <>
      <a className="skip-link" href="#main">
        {lang === "bn" ? "মূল কনটেন্টে যান" : "Skip to content"}
      </a>
      <header className="site-header">
        <Link className="brand" href={"/" + lang}>
          <span className="brand-symbol">D</span>
          <span>
            {content.brand.name}
            <span className="brand-dot">.</span>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {links.slice(0, 5).map(([url, en, bn]) => (
            <Link
              key={url}
              href={`/${lang}/${url}`}
              className={path.startsWith(url) ? "active" : ""}
            >
              {lang === "bn" ? bn : en}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link
            className="language"
            href={`/${lang === "en" ? "bn" : "en"}/${path}`}
            lang={lang === "en" ? "bn" : "en"}
          >
            <Globe2 size={15} />
            {lang === "en" ? "বাংলা" : "EN"}
          </Link>
          <Link className="desktop-login" href={`/${lang}/app`}>
            {lang === "en" ? "Workspace" : "ওয়ার্কস্পেস"}
          </Link>
          <Button asChild className="header-cta">
            <Link href={`/${lang}/builder`}>
              {lang === "en" ? "Website builder" : "ওয়েবসাইট বিল্ডার"}
              <ArrowUpRight size={16} />
            </Link>
          </Button>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mobile-menu"
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{content.brand.name}</SheetTitle>
              </SheetHeader>
              <nav
                className="mobile-links"
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("a")) setMenuOpen(false);
                }}
              >
                {links.map(([url, en, bn]) => (
                  <Link key={url} href={`/${lang}/${url}`}>
                    {lang === "bn" ? bn : en}
                  </Link>
                ))}
                <Link href={`/${lang}/transform`}>Transformation</Link>
                <Link href={`/${lang}/app`}>Workspace</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
