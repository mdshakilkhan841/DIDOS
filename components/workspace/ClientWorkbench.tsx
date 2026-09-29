'use client';

import React, { useState, useEffect } from 'react';
import Link from '@/components/dudos-link';
import {
  LayoutDashboard,
  FolderKanban,
  Rocket,
  LifeBuoy,
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
import { buildSubdomainUrl } from '@/lib/subdomains';

export default function ClientWorkbench({
  lang = 'en',
  section = [],
}: {
  lang: string;
  section: string[];
}) {
  const { user, logout } = useAuth();
  const [navSearch, setNavSearch] = useState('');
  const [projectCount, setProjectCount] = useState<number>(0);
  const [supportCount, setSupportCount] = useState<number>(0);

  const view = section[0] || 'overview';

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('dudos_jwt_token') || localStorage.getItem('dudos_auth_token') : null;
    if (token) {
      fetch('http://localhost:8000/api/v1/projects', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setProjectCount(data.length);
        })
        .catch(() => {});

      fetch('http://localhost:8000/api/v1/support/tickets/my', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const openTickets = data.filter((t: any) => t.status === 'open' || t.status === 'in_progress').length;
            setSupportCount(openTickets);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleSignOut = () => {
    logout();
    try {
      localStorage.removeItem('dudos_auth_session');
      localStorage.removeItem('dudos_jwt_token');
      sessionStorage.clear();
      const epoch = 'Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie = `dudos_session=; path=/; max-age=0; expires=${epoch}`;
      document.cookie = `dudos_at=; path=/; max-age=0; expires=${epoch}`;
      if (typeof window !== 'undefined') {
        document.cookie = `dudos_session=; path=/; domain=${window.location.hostname}; max-age=0; expires=${epoch}`;
        document.cookie = `dudos_at=; path=/; domain=${window.location.hostname}; max-age=0; expires=${epoch}`;
      }
      document.cookie = `dudos_session=; path=/; domain=localhost; max-age=0; expires=${epoch}`;
      document.cookie = `dudos_at=; path=/; domain=localhost; max-age=0; expires=${epoch}`;
      document.cookie = `dudos_session=; path=/; domain=.localhost; max-age=0; expires=${epoch}`;
      document.cookie = `dudos_at=; path=/; domain=.localhost; max-age=0; expires=${epoch}`;
    } catch {}
    window.location.href = '/logout?return_to=/login';
  };

  // 100% Workable Customer Navigation Modules (No Dummy Pages)
  const clientNavSections = [
    {
      group: 'WORKSPACE OPERATIONS',
      items: [
        { id: 'overview', title: 'Workspace Overview', bn: 'ওয়ার্কস্পেস সংক্ষিপ্ত চিত্র', icon: LayoutDashboard },
        { id: 'projects', title: 'My Projects', bn: 'আমার প্রজেক্ট', icon: FolderKanban, badge: projectCount > 0 ? String(projectCount) : undefined },
        { id: 'deployments', title: 'Deployments & Domains', bn: 'ডিপ্লয়মেন্ট ও ডোমেন', icon: Rocket },
        { id: 'support', title: 'Support & Helpdesk', bn: 'সাপোর্ট ও সহায়তা', icon: LifeBuoy, badge: supportCount > 0 ? String(supportCount) : undefined },
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
            <Link href={`/${lang}/onboarding`} className="text-link">
              {lang === 'bn' ? 'নতুন প্রজেক্ট' : 'New Project'}
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </header>

        <main id="main" className="workbench-main">
          <CustomerUserPanel
            workspace="client_ws"
            lang={lang}
            activeSection={
              view === 'projects'
                ? 'projects'
                : view === 'deployments'
                ? 'deployments'
                : view === 'support'
                ? 'support'
                : 'overview'
            }
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
