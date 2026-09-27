"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Shield, Sparkles, Building2, User } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { STAKEHOLDER_CONFIGS } from "@/types/auth";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, activeRole, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-dudos-border/70 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-dudos-primary text-white font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
              D
            </span>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-dudos-navy-900 leading-none">
                DUDOS<span className="text-dudos-primary">.</span>
              </span>
              <span className="text-[10px] text-dudos-text-secondary font-medium tracking-wide">
                Daffodil Operations
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-dudos-text-secondary">
            <Link
              href="/#stakeholders"
              className="hover:text-dudos-primary transition-colors"
            >
              Stakeholders
            </Link>
            <Link
              href="/#modules"
              className="hover:text-dudos-primary transition-colors"
            >
              Operations (30+)
            </Link>
            <Link
              href="/#builder"
              className="hover:text-dudos-primary transition-colors"
            >
              Website Builder
            </Link>
            <Link
              href="/#devscope"
              className="hover:text-dudos-primary transition-colors flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3 text-dudos-accent" />
              <span>DevScope AI</span>
            </Link>
          </nav>
        </div>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dudos-border bg-dudos-surface text-xs">
                <span className="h-2 w-2 rounded-full bg-dudos-success animate-pulse" />
                <span className="font-semibold text-dudos-text">{user.displayName}</span>
                <span className="text-[11px] text-dudos-primary font-medium bg-dudos-surface-mint px-1.5 py-0.5 rounded">
                  {STAKEHOLDER_CONFIGS[activeRole].badge}
                </span>
              </div>
              <Link href="/login">
                <Button variant="primary" size="sm">
                  <span>Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="shadow-sm">
                  <span>Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-dudos-text-secondary hover:text-dudos-text cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-dudos-border bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-dudos-text">
            <Link
              href="/#stakeholders"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-dudos-primary"
            >
              Stakeholder Portals
            </Link>
            <Link
              href="/#modules"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-dudos-primary"
            >
              Operations & Modules (30+)
            </Link>
            <Link
              href="/#builder"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-dudos-primary"
            >
              Website Builder
            </Link>
          </nav>
          <div className="pt-3 border-t border-dudos-border flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" className="w-full justify-center">
                Sign In
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" className="w-full justify-center">
                Register Stakeholder Account
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
