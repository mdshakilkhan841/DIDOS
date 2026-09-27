"use client";

import React, { useState } from "react";
import Link from "@/components/dudos-link";
import { ArrowUpRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/dudos-ui";

export function FloatingGuide({ lang = "en" }: { lang?: string }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  async function ask() {
    setBusy(true);
    try {
      const r = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, lang }),
      });
      setAnswer(await r.json());
    } catch {
      setAnswer({ error: "The guide is unavailable. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        className="guide-launch"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {open ? <X size={19} /> : <Sparkles size={19} />}
        <span>{lang === "bn" ? "সেবা ও সহায়তা" : "Services & help"}</span>
      </Button>

      {open && (
        <aside className="guide-popover" aria-label="DUDOS guide">
          <Button asChild className="sales-guide-link">
            <Link href={`/${lang}/sales-agent`}>
              {lang === "bn"
                ? "সেবা ও বিক্রয় এজেন্ট খুলুন"
                : "Open Service & Sales Agent"}
              <ArrowUpRight size={16} />
            </Link>
          </Button>

          <div className="guide-heading">
            <strong>
              {lang === "bn" ? "আপনার প্রশ্ন করুন" : "How can we help?"}
            </strong>
            <Badge variant="secondary">
              {lang === "bn" ? "প্রকাশিত তথ্য" : "Public knowledge"}
            </Badge>
          </div>

          <p>
            {lang === "bn"
              ? "প্রকাশিত গাইডে খুঁজুন। এটি জেনারেটিভ এআই নয়।"
              : "Search the published guide. This is a scripted knowledge assistant."}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ask();
            }}
          >
            <Input
              aria-label="Your question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={700}
              placeholder={lang === "bn" ? "আপনার প্রশ্ন..." : "Ask about DUDOS…"}
            />
            <Button disabled={busy || !question.trim()} type="submit">
              {busy ? "…" : lang === "bn" ? "খুঁজুন" : "Ask"}
            </Button>
          </form>

          <div aria-live="polite">
            {answer?.error && <Notice tone="error">{answer.error}</Notice>}
            {answer?.message && <p>{answer.message}</p>}
            {answer?.results?.map((r: any, i: number) => (
              <article key={i}>
                <p>{r.answer}</p>
                <Link href={r.route}>{r.source}</Link>
              </article>
            ))}
          </div>
        </aside>
      )}
    </>
  );
}
