"use client";

import React from "react";
import { ContentContext } from "@/components/dudos-content-context";
import { SiteHeader } from "./SiteHeader";
import { HomeView } from "./HomeView";
import { SiteFooter } from "./SiteFooter";
import { FloatingGuide } from "./FloatingGuide";

export function HomePublicLayout({
  content,
  lang = "en",
}: {
  content: any;
  lang?: string;
}) {
  return (
    <ContentContext.Provider value={content}>
      <SiteHeader lang={lang} path="" />
      <main id="main">
        <HomeView lang={lang} />
      </main>
      <SiteFooter lang={lang} />
      <FloatingGuide lang={lang} />
    </ContentContext.Provider>
  );
}
