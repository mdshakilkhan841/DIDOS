"use client";

import React, { useState } from "react";
import Link from "@/components/dudos-link";
import { ArrowUpRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/dudos-ui";
import { t } from "@/lib/i18n";

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
      setAnswer({ error: t("guide.unavailable", lang) });
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
        <span>{t("guide.launch", lang)}</span>
      </Button>

      {open && (
        <aside className="guide-popover" aria-label="DUDOS guide">
          <Button asChild className="sales-guide-link">
            <Link href={`/${lang}/sales-agent`}>
              {t("guide.salesAgent", lang)}
              <ArrowUpRight size={16} />
            </Link>
          </Button>

          <div className="guide-heading">
            <strong>{t("guide.howCanWeHelp", lang)}</strong>
            <Badge variant="secondary">{t("guide.publicKnowledge", lang)}</Badge>
          </div>

          <p>{t("guide.description", lang)}</p>

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
              placeholder={t("guide.placeholder", lang)}
            />
            <Button disabled={busy || !question.trim()} type="submit">
              {busy ? "…" : t("guide.askButton", lang)}
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
