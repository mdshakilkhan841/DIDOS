"use client";

import React from "react";
import { Layers3 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t, human } from "@/lib/i18n";
export { t, human };

export { SiteHeader as Header } from "@/components/home/SiteHeader";
export { SiteFooter as Footer } from "@/components/home/SiteFooter";

export function download(text: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([text], {
      type: name.endsWith(".html") ? "text/html" : "text/plain;charset=utf-8",
    })
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

export function Download({
  data,
  name,
  label = "Download JSON",
}: {
  data: any;
  name: string;
  label?: string;
}) {
  return (
    <Button
      variant="outline"
      onClick={() =>
        download(
          typeof data === "string" ? data : JSON.stringify(data, null, 2),
          name
        )
      }
    >
      {label}
      <ArrowUpRight size={15} />
    </Button>
  );
}


export function Choose({
  value,
  onChange,
  options,
  label,
  placeholder = "Select",
  ...props
}: {
  value: string;
  onChange: (v: string) => void;
  options: (string | { id: string; label: string })[];
  label?: string;
  placeholder?: string;
  [key: string]: any;
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger
        aria-label={label || placeholder}
        className="choice"
        {...props}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => {
          const id = typeof o === "string" ? o : o.id;
          return (
            <SelectItem key={id} value={id}>
              {typeof o === "string" ? human(o) : o.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export function Multi({
  value = [],
  onChange,
  options,
  label,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: (string | { id: string; label: string })[];
  label: string;
}) {
  return (
    <div className="multi-options" role="group" aria-label={label}>
      {options.map((o) => {
        const id = typeof o === "string" ? o : o.id;
        return (
          <label
            key={id}
            className={value.includes(id) ? "multi-option selected" : "multi-option"}
          >
            <Checkbox
              checked={value.includes(id)}
              onCheckedChange={(v) =>
                onChange(v ? [...value, id] : value.filter((x) => x !== id))
              }
            />
            <span>{typeof o === "string" ? human(o) : o.label}</span>
          </label>
        );
      })}
    </div>
  );
}

export function Notice({
  children,
  tone = "info",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <div
      className={"notice " + tone}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

export function Empty({
  title,
  children,
  action,
}: {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <Layers3 size={30} />
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useContent } from "./dudos-content-context";

export function FAQ({ lang }: { lang: string }) {
  const content = useContent();
  const faqList = content?.faq || [];
  return (
    <Accordion type="single" collapsible className="faq">
      {faqList.map((f: any, i: number) => (
        <AccordionItem key={i} value={String(i)}>
          <AccordionTrigger>{t(f.question, lang)}</AccordionTrigger>
          <AccordionContent>{t(f.answer, lang)}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
