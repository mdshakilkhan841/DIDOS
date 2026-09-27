"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Shield, Sparkles, Building2, User } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { STAKEHOLDER_CONFIGS } from "@/types/auth";
import { CreditBadgeButton } from "@/components/billing/CreditWalletModal";

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
              href="/onboarding"
              className="text-dudos-primary font-bold hover:text-dudos-primary-hover transition-colors flex items-center gap-1"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span>Start Onboarding</span>
            </Link>
            <Link
              href="/services"
              className="hover:text-dudos-primary transition-colors"
            >
              Solutions & Services
            </Link>
            <Link
              href="/#pricing"
              className="hover:text-dudos-primary transition-colors"
            >
              Pricing & Credits
            </Link>
            {isAuthenticated && user?.role === "admin" && (
              <Link
                href="/app/tenant-admin"
                className="hover:text-dudos-primary transition-colors text-amber-700 font-bold"
              >
                Admin Panel
              </Link>
            )}
            {isAuthenticated && user?.role === "client" && (
              <Link
                href="/app"
                className="hover:text-dudos-primary transition-colors"
              >
                User Workspace
              </Link>
            )}
          </nav>
        </div>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <CreditBadgeButton />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dudos-border bg-dudos-surface text-xs">
                <span className="h-2 w-2 rounded-full bg-dudos-success animate-pulse" />
                <span className="font-semibold text-dudos-text">{user.displayName}</span>
                <span className="text-[11px] text-dudos-primary font-medium bg-dudos-surface-mint px-1.5 py-0.5 rounded">
                  {STAKEHOLDER_CONFIGS[activeRole].badge}
                </span>
              </div>
              {user.role === "admin" ? (
                <Link href="/en/app/tenant-admin">
                  <Button variant="primary" size="sm" className="bg-[#112C3A] hover:bg-[#1a3f52] text-white">
                    <Shield className="h-3.5 w-3.5 mr-1 text-teal-400" />
                    <span>Admin Panel</span>
                  </Button>
                </Link>
              ) : user.status === "pending_review" ? (
                <Link href="/en/onboarding">
                  <Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                    <span>Onboarding Status</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              ) : (
                <Link href="/en/app">
                  <Button variant="primary" size="sm">
                    <span>Workspace</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              )}
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
              href="/onboarding"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-dudos-primary font-bold hover:text-dudos-primary-hover flex items-center gap-1.5"
            >
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span>Start Onboarding</span>
            </Link>
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-dudos-primary"
            >
              Solutions & Services
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-dudos-primary"
            >
              Pricing & Credits
            </Link>
            {isAuthenticated && (
              <Link
                href={user?.role === "admin" ? "/app/tenant-admin" : "/app"}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 font-bold text-teal-800"
              >
                {user?.role === "admin" ? "Admin Panel" : "User Workspace"}
              </Link>
            )}
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
