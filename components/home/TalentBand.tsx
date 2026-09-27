"use client";

import React from "react";
import Link from "@/components/dudos-link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TalentBand({ lang = "en" }: { lang?: string }) {
  const tracks = [
    ["01", "Industry challenges", "শিল্পখাতের চ্যালেঞ্জ"],
    ["02", "Student & alumni projects", "শিক্ষার্থী ও অ্যালামনাই প্রকল্প"],
    ["03", "Research to products", "গবেষণা থেকে পণ্য"],
  ];

  return (
    <section className="talent-band">
      <div>
        <p className="eyebrow">
          {lang === "bn" ? "ধারণা থেকে প্রভাব" : "FROM IDEAS TO IMPACT"}
        </p>
        <h2>
          {lang === "bn"
            ? "প্রতিভাকে বাস্তব সমস্যার সঙ্গে যুক্ত করুন।"
            : "Bring great talent to real problems."}
        </h2>
        <p>
          {lang === "bn"
            ? "শিক্ষার্থী প্রকল্প, গবেষণা, শিল্প চ্যালেঞ্জ ও নতুন সমাধানের জন্য একসঙ্গে কাজের ক্ষেত্র।"
            : "A shared path for student projects, research, industry challenges and solutions worth building."}
        </p>
        <Button asChild variant="outline">
          <Link href={`/${lang}/talent`}>
            {lang === "bn" ? "সুযোগগুলো দেখুন" : "Explore talent & research"}
            <ArrowUpRight size={16} />
          </Link>
        </Button>
      </div>

      <div className="talent-tracks">
        {tracks.map(([n, en, bn]) => (
          <Link key={n} href={`/${lang}/talent`}>
            <span>{n}</span>
            <strong>{lang === "bn" ? bn : en}</strong>
            <ArrowUpRight size={20} />
          </Link>
        ))}
      </div>
    </section>
  );
}
