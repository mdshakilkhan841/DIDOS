"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Building2,
  ShoppingBag,
  Handshake,
  GraduationCap,
  Wrench,
  ShieldCheck,
  Code2,
  Cpu,
  Layers,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StakeholderRole, STAKEHOLDER_CONFIGS } from "@/types/auth";
import { showToast } from "@/lib/toast";

const MODULE_GROUPS = [
  {
    group: "Customer & Transformation",
    modules: ["Assessment", "Software Projects", "Preview Reviews", "Subscriptions", "Tickets"],
    color: "border-dudos-primary/30 bg-dudos-surface-mint/60",
    badge: "Enterprise",
  },
  {
    group: "Merchant & Commerce",
    modules: ["Product Catalog", "Inventory", "Order Fulfillment", "Dispute Resolution"],
    color: "border-emerald-200 bg-emerald-50/50",
    badge: "Commerce",
  },
  {
    group: "Partner & Ecosystem",
    modules: ["Partner Applications", "Marketplace Listings", "Commissions", "Co-marketing Campaigns"],
    color: "border-teal-200 bg-teal-50/50",
    badge: "Partners",
  },
  {
    group: "Academy & Living Labs",
    modules: ["Innovation Challenges", "Talent Applications", "GPU/Lab Bookings", "Learning Paths"],
    color: "border-cyan-200 bg-cyan-50/50",
    badge: "Academic",
  },
  {
    group: "Staff & Operations",
    modules: ["Field Visits", "Task Execution", "Source Evidence Capture", "Customer Support"],
    color: "border-slate-200 bg-slate-50/70",
    badge: "Internal",
  },
  {
    group: "Executive Governance",
    modules: ["Opportunity Pipeline", "Market Watch", "Formal Release Gates", "Audit Logs"],
    color: "border-blue-200 bg-blue-50/50",
    badge: "Leadership",
  },
];

const ROLES: StakeholderRole[] = [
  "client",
  "merchant",
  "partner",
  "academy",
  "staff",
  "executive",
];

export default function HomePage() {
  const [activeTabRole, setActiveTabRole] = useState<StakeholderRole>("client");
  const selectedConfig = STAKEHOLDER_CONFIGS[activeTabRole];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* ================= HERO SECTION (20% Dark Navy Contrast) ================= */}
        <section className="relative overflow-hidden bg-dudos-navy-900 py-20 text-white md:py-28">
          {/* Ambient lighting blobs */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -left-32 h-[32rem] w-[32rem] rounded-full bg-dudos-primary/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -right-24 h-[36rem] w-[36rem] rounded-full bg-dudos-accent/15 blur-3xl"
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              {/* Top Tag */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs text-dudos-accent mb-6 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Next-Gen Operating System & AI Build Engine</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
                Digital business operations,
                <br />
                <span className="text-dudos-accent">unified in one control plane.</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-base text-dudos-text-on-dark-muted sm:text-lg leading-relaxed max-w-2xl">
                DUDOS bridges client discovery, commercial governance, multi-tenant workspace management, automated code generation, and autonomous software delivery for the Daffodil Family ecosystem.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/register">
                  <Button variant="primary" size="lg" className="shadow-lg shadow-dudos-primary/20">
                    <span>Create Stakeholder Account</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>

                <Link href="/login">
                  <Button variant="secondary" size="lg">
                    <span>Sign In to Workspace</span>
                  </Button>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    showToast.info("Website Builder preview ready", {
                      description: "480 matrix profile generator with pure browser ZIP export.",
                    });
                  }}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-dudos-accent-soft hover:underline cursor-pointer px-2"
                >
                  <Code2 className="h-4 w-4" />
                  <span>Explore 480 Matrix Builder</span>
                </button>
              </div>

              {/* Proof Metric Chips */}
              <div className="mt-12 grid grid-cols-2 gap-4 border-t border-white/15 pt-8 sm:grid-cols-4">
                <div>
                  <div className="text-2xl font-bold text-white">30+</div>
                  <div className="text-xs text-dudos-text-on-dark-muted">Enterprise Modules</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-dudos-accent">480</div>
                  <div className="text-xs text-dudos-text-on-dark-muted">Deterministic Profiles</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">6</div>
                  <div className="text-xs text-dudos-text-on-dark-muted">Stakeholder Portals</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-dudos-accent">100%</div>
                  <div className="text-xs text-dudos-text-on-dark-muted">Client-Side ZIP Gen</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= MULTI-STAKEHOLDER PORTAL SECTION ================= */}
        <section id="stakeholders" className="py-20 bg-dudos-surface border-b border-dudos-border/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="default" className="mb-3">
                Tailored Stakeholder Governance
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight text-dudos-text sm:text-4xl">
                One System. Six Specialized Experiences.
              </h2>
              <p className="mt-3 text-sm text-dudos-text-secondary leading-relaxed">
                Whether you are an enterprise client, retail vendor, affiliated agency, or academic researcher, DUDOS personalizes your workspace.
              </p>
            </div>

            {/* Stakeholder Tabs Bar */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {ROLES.map((role) => {
                const config = STAKEHOLDER_CONFIGS[role];
                const isActive = activeTabRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setActiveTabRole(role)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      isActive
                        ? "bg-dudos-primary text-white border-dudos-primary shadow-sm"
                        : "bg-white text-dudos-text border-dudos-border hover:bg-dudos-surface-alt"
                    }`}
                  >
                    <span>{config.title.split("/")[0]}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                        isActive ? "bg-white/20 text-white" : "bg-dudos-surface text-dudos-text-secondary"
                      }`}
                    >
                      {config.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Stakeholder Detail Card */}
            <div className="max-w-4xl mx-auto rounded-2xl border border-dudos-border bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-dudos-border">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full bg-dudos-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-dudos-primary">
                      {selectedConfig.badge} Workspace
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-dudos-text mt-1">
                    {selectedConfig.title}
                  </h3>
                  <p className="text-sm text-dudos-text-secondary mt-1 max-w-xl leading-relaxed">
                    {selectedConfig.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Link href={`/login?role=${activeTabRole}`}>
                    <Button variant="primary" size="md">
                      <span>Enter as {selectedConfig.badge}</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
                <div className="p-3.5 rounded-xl border border-dudos-border bg-dudos-surface">
                  <div className="font-semibold text-dudos-text mb-1">Key Focus</div>
                  <div className="text-dudos-text-secondary">{selectedConfig.shortDesc}</div>
                </div>
                <div className="p-3.5 rounded-xl border border-dudos-border bg-dudos-surface">
                  <div className="font-semibold text-dudos-text mb-1">Target Route</div>
                  <div className="font-mono text-dudos-primary">{selectedConfig.recommendedRoute}</div>
                </div>
                <div className="p-3.5 rounded-xl border border-dudos-border bg-dudos-surface">
                  <div className="font-semibold text-dudos-text mb-1">Organization Example</div>
                  <div className="text-dudos-text-secondary line-clamp-1">{selectedConfig.sampleOrgPlaceholder}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 30+ ENTERPRISE OPERATIONAL MODULES ================= */}
        <section id="modules" className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <Badge variant="default" className="mb-3">
                  Enterprise Modules
                </Badge>
                <h2 className="text-3xl font-semibold tracking-tight text-dudos-text sm:text-4xl">
                  Comprehensive Digital Operations
                </h2>
                <p className="mt-2 text-sm text-dudos-text-secondary max-w-xl">
                  Built to cover all operational aspects of modern multi-entity digital delivery and enterprise governance.
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    <span>View All 30+ Modules</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MODULE_GROUPS.map((item, idx) => (
                <Card key={idx} className="hover:border-dudos-primary/50 transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-dudos-surface-mint text-dudos-primary border border-dudos-primary/20">
                        {item.badge}
                      </span>
                      <span className="text-xs text-dudos-text-secondary font-mono">
                        {item.modules.length} Modules
                      </span>
                    </div>
                    <CardTitle className="text-base">{item.group}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {item.modules.map((m, mIdx) => (
                        <li key={mIdx} className="flex items-center gap-2 text-xs text-dudos-text-secondary">
                          <CheckCircle2 className="h-3.5 w-3.5 text-dudos-primary flex-shrink-0" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ================= WEBSITE BUILDER & DEVSCOPE BANNER ================= */}
        <section id="builder" className="py-20 bg-dudos-navy-950 text-white relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-dudos-accent mb-4">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>Dual Execution Engines</span>
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  From Quick Site Generator to Autonomous Custom Software.
                </h2>
                <p className="mt-4 text-sm text-dudos-text-on-dark-muted leading-relaxed">
                  DUDOS provides a deterministic in-browser website generator with 480 matrix combinations, and seamlessly delegates complex software builds to the DevScope AI autonomous engine.
                </p>

                <div className="mt-8 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-dudos-primary text-white text-xs font-bold mt-0.5">
                      1
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">480-Matrix Quick Generator</div>
                      <div className="text-xs text-dudos-text-on-dark-muted">
                        Select industry, layout blueprint, and visual style. Generate production-ready ZIP instantly in browser memory.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-dudos-accent text-dudos-navy-950 text-xs font-bold mt-0.5">
                      2
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">DevScope AI Autonomous Builder Bridge</div>
                      <div className="text-xs text-dudos-text-on-dark-muted">
                        Connect with `devscope-ai-builder` for full-stack autonomous coding, test execution, container builds, and QA.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <Link href="/login">
                    <Button variant="primary" size="md">
                      <span>Launch Builder Wizard</span>
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Visual preview representation */}
              <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono text-dudos-text-on-dark-muted ml-2">
                      generator.ts — in-browser zip compiler
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-dudos-accent">v1.2.0</span>
                </div>
                <div className="font-mono text-xs text-dudos-text-on-dark-muted space-y-1.5">
                  <div className="text-emerald-400 font-semibold">// Matrix Configuration</div>
                  <div>const matrix = {`{ industry: "healthcare", blueprint: "service-led", theme: "ocean" };`}</div>
                  <div className="text-dudos-accent font-semibold pt-2">// In-Memory ZIP Packaging</div>
                  <div>const zip = await generateClientZip(projectConfig);</div>
                  <div>downloadBlob(zip, "dudos-project.zip"); // 0 server roundtrips</div>
                  <div className="pt-2 text-white/50 text-[11px]">
                    Output: React/FastAPI, Next.js, WordPress, Laravel, or Static HTML.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
