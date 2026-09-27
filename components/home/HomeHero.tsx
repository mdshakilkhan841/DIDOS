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
  const [sector, setSector] = useState(content.industries[0]?.id || "");

  const goalOptions = [
    ["website", "Better website", "উন্নত ওয়েবসাইট"],
    ["commerce", "Sell online", "অনলাইনে বিক্রি"],
    ["operations", "Connect operations", "পরিচালনা সংযোগ"],
    ["ai", "Work with AI", "এআই সহায়তা"],
  ];

  return (
    <section className="home-hero">
      <div className="hero-copy">
        <p className="eyebrow">
          <span />
          {lang === "bn"
            ? "আপনার পরবর্তী ডিজিটাল অধ্যায়"
            : "YOUR NEXT DIGITAL CHAPTER"}
        </p>
        <h1 className="dynamic-headline">{t(content.home.headline, lang)}</h1>
        <p className="hero-description">{t(content.home.description, lang)}</p>
        <div className="hero-links">
          <Button asChild size="lg">
            <Link href={`/${lang}/transform`}>
              {lang === "bn" ? "মূল্যায়ন শুরু করুন" : "Start your assessment"}
              <ArrowUpRight size={16} />
            </Link>
          </Button>
          <Link href={`/${lang}/solutions`}>
            {lang === "bn" ? "সব সমাধান দেখুন" : "Explore solutions"}
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="hero-note">
          <Check size={15} />
          {lang === "bn"
            ? "নতুন ওয়েবসাইট অথবা বর্তমান সিস্টেম—দুই ক্ষেত্রেই"
            : "For a new beginning or the systems you already use"}
        </div>
      </div>

      <div className="goal-panel">
        <div className="panel-top">
          <span className="micro-label">
            DUDOS / {lang === "bn" ? "সমাধান নির্মাতা" : "SOLUTION BUILDER"}
          </span>
          <Sparkles size={18} />
        </div>
        <h2>
          {lang === "bn" ? "আপনি কী পরিবর্তন চান?" : "What’s your next move?"}
        </h2>
        <p>
          {lang === "bn"
            ? "আপনার লক্ষ্য বেছে নিন। আমরা সেখান থেকেই পরিধি তৈরি করব।"
            : "Choose a goal. Shape the right solution around it."}
        </p>

        <div className="goal-grid">
          {goalOptions.map(([id, en, bn], i) => {
            const Icon = icons[i % icons.length];
            return (
              <button
                type="button"
                className={"goal-option " + (goal === id ? "selected" : "")}
                key={id}
                onClick={() => setGoal(id)}
                aria-pressed={goal === id}
              >
                <Icon size={22} />
                <span>{lang === "bn" ? bn : en}</span>
                {goal === id && <Check size={15} />}
              </button>
            );
          })}
        </div>

        <label className="field-label">
          {lang === "bn" ? "আপনার ব্যবসার ধরন" : "Your business"}
        </label>
        <Choose
          value={sector}
          onChange={setSector}
          options={content.industries.map((x: any) => ({
            id: x.id,
            label: t(x.title, lang),
          }))}
          label="Business sector"
        />

        <Button className="goal-submit" asChild>
          <Link href={`/${lang}/transform?goal=${goal}&sector=${sector}`}>
            {lang === "bn"
              ? "আমার সমাধান পরিকল্পনা করুন"
              : "Plan my solution"}
            <ArrowRight size={16} />
          </Link>
        </Button>

        <div className="panel-foot">
          <ShieldCheck size={15} />
          {lang === "bn"
            ? "মূল্যায়ন থেকে স্পষ্ট পরবর্তী পদক্ষেপ"
            : "From a focused assessment to a clear next step"}
        </div>
      </div>
    </section>
  );
}
