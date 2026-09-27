"use client";

import React from "react";
import { HomeHero } from "./HomeHero";
import { ConnectionStrip } from "./ConnectionStrip";
import { SolutionGrid } from "./SolutionGrid";
import { TalentBand } from "./TalentBand";
import { FaqSection } from "./FaqSection";

export function HomeView({ lang = "en" }: { lang?: string }) {
  return (
    <>
      <HomeHero lang={lang} />
      <ConnectionStrip lang={lang} />
      <SolutionGrid lang={lang} />
      <TalentBand lang={lang} />
      <FaqSection lang={lang} />
    </>
  );
}
