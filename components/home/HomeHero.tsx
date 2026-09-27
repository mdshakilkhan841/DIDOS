"use client";

import React, { useState } from "react";
import Link from "@/components/dudos-link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Globe2,
  ShoppingBag,
  Workflow,
  BarChart3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContent } from "@/components/dudos-content-context";
import { Choose, t } from "@/components/dudos-ui";

const icons = [Globe2, ShoppingBag, Workflow, BarChart3];

export function HomeHero({ lang = "en" }: { lang?: string }) {
  const content = useContent();
  const [goal, setGoal] = useState("website");
  const [sector, setSector] = useState(content.industries?.[0]?.id || "");

  const goalKeys = ["website", "commerce", "operations", "ai"];

  return (
    <section className="home-hero">
      <div className="hero-copy">
        <p className="eyebrow">
          <span />
          {t("hero.eyebrow", lang)}
        </p>
        <h1 className="dynamic-headline">{t(content.home?.headline, lang)}</h1>
        <p className="hero-description">{t(content.home?.description, lang)}</p>
        <div className="hero-links">
          <Button asChild size="lg">
            <Link href={`/${lang}/transform`}>
              {t("hero.startAssessment", lang)}
              <ArrowUpRight size={16} />
            </Link>
          </Button>
          <Link href={`/${lang}/solutions`}>
            {t("hero.exploreSolutions", lang)}
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="hero-note">
          <Check size={15} />
          {t("hero.note", lang)}
        </div>
      </div>

      <div className="goal-panel">
        <div className="panel-top">
          <span className="micro-label">
            DUDOS / {t("goalPanel.microLabel", lang)}
          </span>
          <Sparkles size={18} />
        </div>
        <h2>{t("goalPanel.title", lang)}</h2>
        <p>{t("goalPanel.subtitle", lang)}</p>

        <div className="goal-grid">
          {goalKeys.map((id, i) => {
            const Icon = icons[i % icons.length];
            const isSelected = goal === id;
            return (
              <button
                type="button"
                className={"goal-option " + (isSelected ? "selected" : "")}
                key={id}
                onClick={() => setGoal(id)}
                aria-pressed={isSelected}
              >
                <Icon size={22} />
                <span>{t(`goalPanel.goals.${id}`, lang)}</span>
                {isSelected && <Check size={15} />}
              </button>
            );
          })}
        </div>

        <label className="field-label">
          {t("goalPanel.businessType", lang)}
        </label>
        <Choose
          value={sector}
          onChange={setSector}
          options={(content.industries || []).map((x: any) => ({
            id: x.id,
            label: t(x.title, lang),
          }))}
          label={t("goalPanel.businessSector", lang)}
        />

        <Button className="goal-submit" asChild>
          <Link href={`/${lang}/transform?goal=${goal}&sector=${sector}`}>
            {t("goalPanel.planSolution", lang)}
            <ArrowRight size={16} />
          </Link>
        </Button>

        <div className="panel-foot">
          <ShieldCheck size={15} />
          {t("goalPanel.panelFoot", lang)}
        </div>
      </div>
    </section>
  );
}
