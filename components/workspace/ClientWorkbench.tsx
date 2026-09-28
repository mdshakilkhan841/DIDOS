'use client';

import React, { useState } from 'react';
import Link from '@/components/dudos-link';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Rocket,
  CreditCard,
  Coins,
  Sparkles,
  Layers3,
  Search,
  MessageSquare,
  Users,
  Bell,
  LogOut,
  Globe,
  ArrowUpRight,
} from 'lucide-react';
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
import { CreditBadgeButton } from '@/components/billing/CreditWalletModal';
import { CustomerUserPanel } from './CustomerUserPanel';
import { ProjectDashboard } from '@/components/projects/ProjectDashboard';
import { RequestsView, Notifications } from '@/components/dudos-requests';
import { Team } from '@/components/dudos-team';
import { AssetsView, RecordsView } from '@/components/dudos-records';
import { ReferenceExplorer } from '@/components/dudos-reference';
import Studio from '@/components/dudos-studio';
import modules, { moduleById } from '@/lib/dudos/modules';
import { buildSubdomainUrl } from '@/lib/subdomains';

export default function ClientWorkbench({
  lang = 'en',
  section = [],
}: {
  lang: string;
  section: string[];
}) {
  const { user } = useAuth();
  const [navSearch, setNavSearch] = useState('');

  const view = section[0] || 'overview';
  const kind = section[1];
  const mod = moduleById(kind);

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

  const clientNavSections = [
    {
      group: 'WORKSPACE & PROJECTS',
      items: [
        { id: 'overview', title: 'Overview & Dashboard', bn: 'সংক্ষিপ্ত চিত্র', icon: LayoutDashboard },
        { id: 'projects', title: 'My Projects & ERP', bn: 'আমার প্রজেক্ট ও ইআরপি', icon: FolderKanban },
        { id: 'scoping', title: 'AI Scoping & SRS', bn: 'এআই স্কোপিং ও এসআরএস', icon: Sparkles },
        { id: 'deployments', title: 'Deployments & Domains', bn: 'ডিপ্লয়মেন্ট ও ডোমেন', icon: Rocket },
      ],
    },
    {
      group: 'FINANCE & BILLING',
      items: [
        { id: 'invoices', title: 'Quotes & Invoices', bn: 'কোটেশন ও ইনভয়েস', icon: CreditCard },
        { id: 'billing', title: 'Credit Wallet', bn: 'ক্রেডিট ওয়ালেট', icon: Coins },
      ],
    },
    {
      group: 'AI TOOLS & RESOURCES',
      items: [
        { id: 'builder', title: 'DevScope AI Builder', bn: 'ডেভস্কোপ এআই বিল্ডার', icon: Sparkles },
        { id: 'assets', title: 'Source Files & Assets', bn: 'সোর্স ফাইল ও সম্পদ', icon: Layers3 },
        { id: 'reference', title: 'Requirements & Specs', bn: 'শর্তাবলী ও স্পেসিফিকেশন', icon: Search },
      ],
    },
    {
      group: 'COLLABORATION',
      items: [
        { id: 'requests', title: 'Support & Requests', bn: 'অনুরোধ ও সহায়তা', icon: MessageSquare },
        { id: 'notifications', title: 'Notifications', bn: 'নোটিফিকেশন', icon: Bell },
        { id: 'team', title: 'Team Members', bn: 'টিম মেম্বার', icon: Users },
      ],
    },
  ];

  const groups = [...new Set(modules.map((m) => m.group))];

  return (
    <SidebarProvider>
      <Sidebar className="dudos-sidebar">
        <SidebarHeader>
          <Link className="brand app-brand" href={`/${lang}`}>
            <span className="brand-symbol">D</span>DUDOS<span className="brand-dot">.</span>
          </Link>
          <span className="sidebar-caption">CLIENT WORKSPACE</span>
          <Input
            className="sidebar-search"
            aria-label="Find a workflow"
            placeholder={lang === 'bn' ? 'কর্মপ্রবাহ খুঁজুন…' : 'Find a workflow…'}
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
          />
        </SidebarHeader>

        <SidebarContent>
          {clientNavSections.map((sec) => {
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
                    const isActive = view === item.id;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={`/${lang}/app/${item.id}`}>
                            <Icon size={16} />
                            <span>{lang === 'bn' ? item.bn : item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroup>
            );
          })}

          {groups.map((g) => {
            const list = modules.filter(
              (m) =>
                m.group === g &&
                (m.title + ' ' + m.description).toLowerCase().includes(navSearch.toLowerCase())
            );
            return !list.length ? null : (
              <SidebarGroup key={g}>
                <SidebarGroupLabel>{g}</SidebarGroupLabel>
                <SidebarMenu>
                  {list.map((m) => (
                    <SidebarMenuItem key={m.id}>
                      <SidebarMenuButton asChild isActive={kind === m.id}>
                        <Link href={`/${lang}/app/records/${m.id}`}>
                          <Layers3 size={15} />
                          <span>{lang === 'bn' ? m.bn : m.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            );
          })}
        </SidebarContent>

        <SidebarFooter>
          <p className="sidebar-person">{user?.displayName || user?.organizationName || 'Client'}</p>
          <div className="sidebar-foot-links">
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
            <span>{user?.organizationName || (lang === 'bn' ? 'আপনার কর্মপরিসর' : 'Your workspace')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CreditBadgeButton lang={lang} />
            {user?.status === 'pending_review' ? (
              <Link href={`/${lang}/onboarding`}>
                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">
                  Intake In Review
                </Badge>
              </Link>
            ) : (
              <Badge variant="outline">Live workspace</Badge>
            )}
            <Link href={`/${lang}/transform`} className="text-link">
              {lang === 'bn' ? 'নতুন মূল্যায়ন' : 'New assessment'}
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </header>

        <main id="main" className="workbench-main">
          {view === 'projects' ? (
            <ProjectDashboard lang={lang} />
          ) : view === 'requests' ? (
            <RequestsView lang={lang} />
          ) : view === 'notifications' ? (
            <Notifications lang={lang} />
          ) : view === 'team' ? (
            <Team workspace="client_ws" lang={lang} />
          ) : view === 'assets' ? (
            <AssetsView workspace="client_ws" lang={lang} />
          ) : view === 'reference' ? (
            <ReferenceExplorer workspace="client_ws" lang={lang} />
          ) : view === 'builder' ? (
            <Studio workspace="client_ws" lang={lang} />
          ) : view === 'records' && mod ? (
            <RecordsView kind={kind} workspace="client_ws" lang={lang} />
          ) : (
            <CustomerUserPanel workspace="client_ws" lang={lang} />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
