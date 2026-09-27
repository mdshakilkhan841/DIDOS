import React from "react";
import Link from "next/link";
import { Shield, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-dudos-border bg-dudos-surface text-dudos-text-secondary text-xs">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand info */}
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-dudos-primary text-sm font-bold text-white">
                D
              </span>
              <span className="text-base font-bold text-dudos-navy-900">
                DUDOS<span className="text-dudos-primary">.</span>
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed max-w-sm text-dudos-text-secondary">
              Daffodil Unified Digital Operating System — the digital business engine connecting clients, merchants, partners, academy, and autonomous software generation for the Daffodil Family ecosystem.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-dudos-primary font-medium">
              <Shield className="h-3.5 w-3.5" />
              <span>Multi-Tenant Enterprise Isolation & Governance</span>
            </div>
          </div>

          {/* Column 1: Stakeholders */}
          <div>
            <h4 className="font-semibold text-dudos-text uppercase tracking-wider text-[11px] mb-3">
              Stakeholders
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="hover:text-dudos-primary">
                  Client & Enterprise
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-dudos-primary">
                  Merchant & Vendor
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-dudos-primary">
                  Partners & Agencies
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-dudos-primary">
                  Academy & Living Labs
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-dudos-primary">
                  Operations & Staff
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Platform Modules */}
          <div>
            <h4 className="font-semibold text-dudos-text uppercase tracking-wider text-[11px] mb-3">
              Core Planes
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="hover:text-dudos-primary">
                  Workbench Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-dudos-primary">
                  30+ ERP Modules
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-dudos-primary">
                  480 Matrix Site Builder
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-dudos-primary">
                  Prompt Studio (PS-016)
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-dudos-primary flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-dudos-accent" />
                  <span>DevScope AI Bridge</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Governance */}
          <div>
            <h4 className="font-semibold text-dudos-text uppercase tracking-wider text-[11px] mb-3">
              Trust & Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/terms" className="hover:text-dudos-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-dudos-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-dudos-primary">
                  Support Desk
                </Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-dudos-primary">
                  System Status
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-dudos-border/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            © {new Date().getFullYear()} Daffodil Family & DUDOS. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-dudos-text-secondary">
            <span>Built with Next.js 16 & React 19</span>
            <span>•</span>
            <span>Tailwind CSS 4</span>
            <span>•</span>
            <span className="text-dudos-primary font-medium">Industry Standard Reusable Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
