import React from "react";
import { CheckCircle2, ShieldCheck, Sparkles, Building2, ShoppingBag, Handshake, GraduationCap, Wrench, Terminal } from "lucide-react";
import { StakeholderRole, STAKEHOLDER_CONFIGS } from "@/types/auth";

interface AuthBrandPanelProps {
  activeRole?: StakeholderRole;
}

const HIGHLIGHTS = [
  "Manage drafts, requests and custom software in one unified ecosystem",
  "Role-based control plane tailored for your business domain",
  "Automated code generation and continuous delivery tracking",
  "Enterprise-grade data isolation and governance for the Daffodil Family",
];

const ROLE_ICONS: Record<StakeholderRole, React.ReactNode> = {
  client: <Building2 className="h-5 w-5 text-dudos-accent" />,
  admin: <Terminal className="h-5 w-5 text-dudos-accent" />,
  merchant: <ShoppingBag className="h-5 w-5 text-dudos-accent" />,
  partner: <Handshake className="h-5 w-5 text-dudos-accent" />,
  academy: <GraduationCap className="h-5 w-5 text-dudos-accent" />,
  staff: <Wrench className="h-5 w-5 text-dudos-accent" />,
  executive: <ShieldCheck className="h-5 w-5 text-dudos-accent" />,
};

export function AuthBrandPanel({ activeRole = "client" }: AuthBrandPanelProps) {
  const currentConfig = STAKEHOLDER_CONFIGS[activeRole];

  return (
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-dudos-navy-900 px-12 py-12 text-white md:flex lg:px-16">
      {/* Background ambient radial blurs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-dudos-primary/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-dudos-accent/15 blur-3xl"
      />

      {/* Top Brand Logo */}
      <a href="/" className="relative z-10 flex items-center gap-2.5 text-lg font-semibold tracking-tight">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-xl font-bold text-white shadow-inner border border-white/10">
          D
        </span>
        <span className="text-white">
          DUDOS<span className="text-dudos-accent">.</span>
        </span>
        <span className="ml-2 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-normal text-dudos-text-on-dark-muted">
          v2.0
        </span>
      </a>

      {/* Center Copy */}
      <div className="relative z-10 max-w-md my-auto py-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-dudos-accent-soft mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Daffodil Unified Digital Operating System</span>
        </div>

        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white lg:text-4xl">
          Your digital work,
          <br />
          organized in one workspace.
        </h1>
        <p
          className="mt-4 text-sm leading-relaxed text-white/90"
          style={{ color: "rgba(255, 255, 255, 0.9)" }}
        >
          Connect your organization, team, and projects to the Daffodil Family operational control plane.
        </p>

        {/* Dynamic stakeholder card highlight */}
        <div className="mt-6 rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              {ROLE_ICONS[activeRole]}
            </div>
            <div>
              <div className="text-xs font-medium text-dudos-accent">
                {currentConfig.badge} Portal Focus
              </div>
              <div className="text-sm font-semibold text-white">
                {currentConfig.title}
              </div>
            </div>
          </div>
          <p
            className="mt-2 text-xs text-white/80 leading-relaxed"
            style={{ color: "rgba(255, 255, 255, 0.8)" }}
          >
            {currentConfig.description}
          </p>
        </div>

        {/* Value Highlights */}
        <ul className="mt-6 space-y-3">
          {HIGHLIGHTS.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-xs text-white/90">
              <CheckCircle2 className="h-4 w-4 flex-none text-dudos-accent mt-0.5" />
              <span className="leading-snug text-white/95" style={{ color: "rgba(255, 255, 255, 0.95)" }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div
        className="relative z-10 flex items-center justify-between text-xs text-white/75 border-t border-white/10 pt-4"
        style={{ color: "rgba(255, 255, 255, 0.75)" }}
      >
        <span>© {new Date().getFullYear()} Daffodil Family & DUDOS</span>
        <span className="text-[11px] opacity-75">Enterprise Operations & AI Builder</span>
      </div>
    </div>
  );
}
