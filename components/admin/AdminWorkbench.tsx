'use client';

import React, { useState } from 'react';
import Link from '@/components/dudos-link';
import {
  Users,
  FolderKanban,
  Server,
  Globe,
  Coins,
  LogOut,
  ArrowUpRight,
  Database,
  LifeBuoy,
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
import { AdminControlPanel } from './AdminControlPanel';
import { buildSubdomainUrl } from '@/lib/subdomains';

export default function AdminWorkbench({
  lang = 'en',
  section = [],
}: {
  lang: string;
  section: string[];
}) {
  const { user, registrations, logout } = useAuth();
  const [navSearch, setNavSearch] = useState('');
  const [supportCount, setSupportCount] = useState<number>(0);
  const [deploymentCount, setDeploymentCount] = useState<number>(0);

  // Map route section to active view
  const view = section[0] === 'tenant-admin' || section[0] === 'platform-admin'
    ? (section[1] || 'clients')
    : (section[0] || 'clients');

  const pendingCount = registrations.filter((r) => r.status === 'pending_review').length;
  const inScopingCount = registrations.filter((r) => r.status === 'in_scoping').length;

  React.useEffect(() => {
    fetch('http://localhost:8000/api/v1/admin/support/tickets')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const openCount = data.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
          setSupportCount(openCount);
        }
      })
      .catch(() => {});

    fetch('http://localhost:8000/api/v1/admin/deployments')
      .then((res) => res.json())
      .then((data) => {
        if (data.tickets && Array.isArray(data.tickets)) {
          const pending = data.tickets.filter((t: any) => t.status !== 'live').length;
          setDeploymentCount(pending);
        }
      })
      .catch(() => {});
  }, []);

  const handleSignOut = () => {
    logout();
    try {
      localStorage.removeItem('dudos_auth_session');
      localStorage.removeItem('dudos_jwt_token');
      sessionStorage.clear();
      const epoch = 'Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      // Host-only cookie on current subdomain (e.g. admin.localhost)
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
    window.location.href = buildSubdomainUrl('main', '/login');
  };

  // Admin Navigation Sections: 100% Workable Operations Connected to PostgreSQL
  const adminNavSections = [
    {
      group: 'PLATFORM OPERATIONS',
      items: [
        { id: 'clients', title: 'Client Intakes & Registrations', bn: 'ক্লায়েন্ট ইনটেক ও নিবন্ধন', icon: Users, badge: pendingCount > 0 ? String(pendingCount) : undefined },
        { id: 'scoping', title: 'Project Scoping & Quotations', bn: 'প্রজেক্ট স্কোপিং ও কোটেশন', icon: FolderKanban, badge: inScopingCount > 0 ? String(inScopingCount) : undefined },
        { id: 'deployments', title: 'VPS Fleet & Deployments', bn: 'সার্ভার ও ডিপ্লয়মেন্ট', icon: Server, badge: deploymentCount > 0 ? String(deploymentCount) : undefined },
        { id: 'support', title: 'Customer Support Tickets', bn: 'সাপোর্ট টিকিট কিউ', icon: LifeBuoy, badge: supportCount > 0 ? String(supportCount) : undefined },
        { id: 'ledger', title: 'Billing & Credit Ledger', bn: 'বিলিং ও ক্রেডিট লেজার', icon: Coins },
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
          <AdminControlPanel
            lang={lang}
            initialTab={
              view === 'scoping'
                ? 'quotes'
                : view === 'deployments' || view === 'servers'
                ? 'deployments'
                : view === 'ledger'
                ? 'ledger'
                : view === 'support'
                ? 'support'
                : 'queue'
            }
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
