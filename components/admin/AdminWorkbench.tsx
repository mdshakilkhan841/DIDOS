'use client';

import React, { useState } from 'react';
import Link from '@/components/dudos-link';
import {
  Shield,
  Users,
  FolderKanban,
  Sparkles,
  Server,
  Globe,
  Coins,
  FileText,
  Activity,
  LogOut,
  Layers3,
  ArrowUpRight,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/auth-context';
import { AdminControlPanel } from './AdminControlPanel';
import Studio from '@/components/dudos-studio';
import { RequestsView } from '@/components/dudos-requests';
import Cms from '@/components/dudos-cms';
import { AgentControls } from '@/components/dudos-sales-agent';
import { buildSubdomainUrl } from '@/lib/subdomains';

export default function AdminWorkbench({
  lang = 'en',
  section = [],
}: {
  lang: string;
  section: string[];
}) {
  const { user, registrations } = useAuth();
  const [navSearch, setNavSearch] = useState('');

  // Map route section to active view
  const view = section[0] === 'tenant-admin' || section[0] === 'platform-admin'
    ? (section[1] || 'clients')
    : (section[0] || 'clients');

  const pendingCount = registrations.filter((r) => r.status === 'pending_review').length;
  const inScopingCount = registrations.filter((r) => r.status === 'in_scoping').length;

  const handleSignOut = () => {
    try {
      const epoch = 'Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = `dudos_session=; path=/; domain=localhost; max-age=0; expires=${epoch}`;
      document.cookie = `dudos_at=; path=/; domain=localhost; max-age=0; expires=${epoch}`;
      document.cookie = `dudos_session=; path=/; domain=.localhost; max-age=0; expires=${epoch}`;
      document.cookie = `dudos_at=; path=/; domain=.localhost; max-age=0; expires=${epoch}`;
    } catch {}
    window.location.href = buildSubdomainUrl('main', '/logout?return_to=/login');
  };

  // Admin Navigation Sections
  const adminNavSections = [
    {
      group: 'PLATFORM GOVERNANCE',
      items: [
        { id: 'clients', title: 'Client Management', bn: 'ক্লায়েন্ট ব্যবস্থাপনা', icon: Users, badge: pendingCount > 0 ? String(pendingCount) : undefined },
        { id: 'scoping', title: 'Project Scoping Queue', bn: 'প্রজেক্ট স্কোপিং কিউ', icon: FolderKanban, badge: inScopingCount > 0 ? String(inScopingCount) : undefined },
        { id: 'deployments', title: 'VPS Fleet & Deployments', bn: 'সার্ভার ও ডিপ্লয়মেন্ট', icon: Server },
        { id: 'ledger', title: 'Billing & Credit Ledger', bn: 'বিলিং ও ক্রেডিট লেজার', icon: Coins },
      ],
    },
    {
      group: 'AI & BUILDER CONTROLS',
      items: [
        { id: 'builder', title: 'DevScope AI Builder', bn: 'ডেভস্কোপ এআই বিল্ডার', icon: Sparkles },
        { id: 'studio', title: 'Prompt Studio & Recipes', bn: 'প্রম্পট স্টুডিও', icon: Layers3 },
        { id: 'agent-controls', title: 'AI Agent Controls', bn: 'এআই নিয়ন্ত্রণ', icon: Activity },
      ],
    },
    {
      group: 'OPERATIONS & CONTENT',
      items: [
        { id: 'inbox', title: 'Customer Inbox', bn: 'গ্রাহকের ইনবক্স', icon: FileText },
        { id: 'cms', title: 'Website Content', bn: 'ওয়েবসাইট কনটেন্ট', icon: Globe },
        { id: 'audit', title: 'Security & Audit Logs', bn: 'সিকিউরিটি ও অডিট লগ', icon: Shield },
      ],
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar className="dudos-sidebar">
        <SidebarHeader>
          <Link className="brand app-brand" href={`/${lang}`}>
            <span className="brand-symbol">D</span>DUDOS<span className="brand-dot">.</span>
          </Link>
          <span className="sidebar-caption">ADMIN WORKBENCH</span>
          <Input
            className="sidebar-search"
            aria-label="Find admin workflow"
            placeholder={lang === 'bn' ? 'অ্যাডমিন মেনু খুঁজুন…' : 'Find admin workflow…'}
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
          />
        </SidebarHeader>

        <SidebarContent>
          {adminNavSections.map((sec) => {
            const list = sec.items.filter((item) =>
              (item.title + ' ' + item.bn).toLowerCase().includes(navSearch.toLowerCase())
            );
            if (!list.length) return null;

            return (
              <SidebarGroup key={sec.group}>
                <SidebarGroupLabel>{sec.group}</SidebarGroupLabel>
                <SidebarMenu>
                  {list.map((item) => {
                    const Icon = item.icon;
                    const isActive = view === item.id || (view === 'tenant-admin' && item.id === 'clients');
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={`/${lang}/app/${item.id}`}>
                            <Icon size={16} />
                            <span>{lang === 'bn' ? item.bn : item.title}</span>
                            {item.badge && (
                              <span style={{ marginLeft: 'auto', fontSize: '10px', background: '#eaf5f1', color: '#087f79', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroup>
            );
          })}
        </SidebarContent>

        <SidebarFooter>
          <p className="sidebar-person">{user?.displayName || user?.username || 'Administrator'}</p>
          <div className="sidebar-foot-links">
            <a href="http://localhost:8000/db" target="_blank" rel="noreferrer">
              <Database size={13} />
              <span>DB Explorer</span>
            </a>
            <Link href={`/${lang === 'bn' ? 'en' : 'bn'}/app/${section.join('/')}`}>
              <Globe size={13} />
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'inherit' }}
            >
              <LogOut size={13} />
              {lang === 'bn' ? 'সাইন আউট' : 'Sign out'}
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="workbench-header">
          <div>
            <SidebarTrigger />
            <span className="header-divider" />
            <span>{lang === 'bn' ? 'প্ল্যাটফর্ম গভর্ন্যান্স কনসোল' : 'Platform Governance Console'}</span>
            <Badge variant="outline" className="bg-teal-50 text-teal-800 border-teal-200">
              Tech Admin Mode
            </Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Badge variant="outline" className="font-mono text-xs">
              VPS: 103.145.118.42
            </Badge>
            <a
              href="http://localhost:8000/db"
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              <span>PostgreSQL Viewer</span>
              <ArrowUpRight size={14} />
            </a>
          </div>
        </header>

        <main id="main" className="workbench-main">
          {view === 'builder' ? (
            <div className="space-y-6">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">DEVSCOPE AI ENGINE</p>
                  <h1>{lang === 'bn' ? 'অটোনোমাস সিস্টেম বিল্ডার' : 'Autonomous AI Builder Pipeline'}</h1>
                  <p>
                    {lang === 'bn'
                      ? 'ক্লায়েন্টের চাহিদা অনুযায়ী কোডবেস জেনারেট, ডকারাইজেশন ও ডিপ্লয়মেন্ট পরিচালনা করুন।'
                      : 'AI-assisted code generation, dockerization and production deployment management.'}
                  </p>
                </div>
              </div>
              <div className="workspace-feature">
                <div>
                  <Sparkles size={24} />
                  <h2>DevScope Engine v2.4 (FastAPI + Claude/Gemini)</h2>
                  <p>Ready to compile customer SRS into production multi-tenant applications.</p>
                </div>
                <Button asChild>
                  <Link href={`/${lang}/app/studio`}>
                    Open Prompt Studio <ArrowUpRight size={16} />
                  </Link>
                </Button>
              </div>
            </div>
          ) : view === 'studio' ? (
            <Studio workspace="admin_ws" lang={lang} />
          ) : view === 'inbox' ? (
            <RequestsView lang={lang} admin />
          ) : view === 'cms' ? (
            <Cms lang={lang} />
          ) : view === 'agent-controls' ? (
            <AgentControls lang={lang} />
          ) : (
            <AdminControlPanel
              lang={lang}
              initialTab={
                view === 'scoping'
                  ? 'quotes'
                  : view === 'deployments' || view === 'servers'
                  ? 'deployments'
                  : view === 'ledger'
                  ? 'ledger'
                  : 'queue'
              }
            />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
