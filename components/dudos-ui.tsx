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

import { t, human } from "@/lib/i18n";
export { t, human };

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
