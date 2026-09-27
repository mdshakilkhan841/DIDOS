"use client";

import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useContent } from "@/components/dudos-content-context";
import { t } from "@/lib/i18n";

export function FaqSection({ lang = "en" }: { lang?: string }) {
  const content = useContent();

  return (
    <section className="section-wrap">
      <div className="section-heading">
        <h2>{t("faq.heading", lang)}</h2>
      </div>
      <Accordion type="single" collapsible className="faq">
        {(content.faq || []).map((f: any, i: number) => (
          <AccordionItem key={i} value={String(i)}>
            <AccordionTrigger>{t(f.question, lang)}</AccordionTrigger>
            <AccordionContent>{t(f.answer, lang)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
