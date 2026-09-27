"use client";

import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useContent } from "@/components/dudos-content-context";
import { t } from "@/components/dudos-ui";

export function FaqSection({ lang = "en" }: { lang?: string }) {
  const content = useContent();

  return (
    <section className="section-wrap">
      <div className="section-heading">
        <h2>
          {lang === "bn" ? "প্রশ্ন থেকে শুরু হোক।" : "A few questions, answered."}
        </h2>
      </div>
      <Accordion type="single" collapsible className="faq">
        {content.faq.map((f: any, i: number) => (
          <AccordionItem key={i} value={String(i)}>
            <AccordionTrigger>{t(f.question, lang)}</AccordionTrigger>
            <AccordionContent>{t(f.answer, lang)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
