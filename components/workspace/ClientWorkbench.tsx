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
  Building2,
  ChevronDown,
  Check,
  Plus,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { preferredWorkspace, rememberWorkspace } from '@/lib/dudos/workspace-preference';
import { api } from '@/lib/dudos/client';
import { showToast } from '@/lib/toast';

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

  // Multi-Workspace state
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('');
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [workspaceBusy, setWorkspaceBusy] = useState(false);

  const view = section[0] || 'overview';

  const getCleanName = (wName: string) => {
    if (
      !wName ||
      wName === 'Customer / Client' ||
      wName.toLowerCase().includes('customer / client') ||
      wName.toLowerCase() === 'client'
    ) {
      if (
        user?.organizationName &&
        user.organizationName !== 'Customer / Client' &&
        !user.organizationName.toLowerCase().includes('customer / client')
      ) {
        return user.organizationName;
      }
      if (user?.displayName && user.displayName !== 'Customer / Client') {
        return `${user.displayName}'s Workspace`;
      }
      if (user?.username && user.username !== 'Customer / Client') {
        return `${user.username}'s Workspace`;
      }
      return lang === 'bn' ? 'ব্যক্তিগত ওয়ার্কস্পেস' : 'Personal Workspace';
    }
    return wName;
  };

  const loadWorkspaces = async () => {
    try {
      const res = await api('/api/workspaces');
      const list = (res.workspaces || []).map((w: any) => ({
        ...w,
        name: getCleanName(w.name),
      }));
      setWorkspaces(list);
      const pref = preferredWorkspace();
      const current = list.find((w: any) => w.id === pref) || list[0];
      if (current) {
        setActiveWorkspaceId(current.id);
        rememberWorkspace(current.id);
      }
    } catch {}
  };

  useEffect(() => {
    void loadWorkspaces();
  }, [user]);

  const handleSelectWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
    rememberWorkspace(id);
    const target = workspaces.find((w) => w.id === id);
    showToast.info(
      lang === 'bn'
        ? `ওয়ার্কস্পেস পরিবর্তিত হয়েছে: ${target?.name || id}`
        : `Switched workspace: ${target?.name || id}`
    );
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim() || newWorkspaceName.trim().length < 2) return;
    setWorkspaceBusy(true);
    try {
      const clean = getCleanName(newWorkspaceName.trim());
      const res = await api('/api/workspaces', 'POST', { name: clean });
      const created = { ...res, name: getCleanName(res.name) };
      const updated = [...workspaces, created];
      setWorkspaces(updated);
      setActiveWorkspaceId(created.id);
      rememberWorkspace(created.id);
      setNewWorkspaceName('');
      setIsCreatingWorkspace(false);
      showToast.success(
        lang === 'bn' ? 'ওয়ার্কস্পেস সফলভাবে তৈরি হয়েছে' : 'Workspace created successfully'
      );
    } catch (err: any) {
      showToast.error(err.message || 'Failed to create workspace');
    } finally {
      setWorkspaceBusy(false);
    }
  };

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const activeWorkspaceDisplayName =
    activeWorkspace?.name ||
    (user?.organizationName && user.organizationName !== 'Customer / Client'
      ? user.organizationName
      : user?.displayName
      ? `${user.displayName}'s Workspace`
      : (lang === 'bn' ? 'আপনার কর্মপরিসর' : 'Your workspace'));

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('dudos_jwt_token') || localStorage.getItem('dudos_auth_token')
        : null;
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
            const openTickets = data.filter(
              (t: any) => t.status === 'open' || t.status === 'in_progress'
            ).length;
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
    window.location.href = buildSubdomainUrl('main', '/login');
  };

  // 100% Workable Customer Navigation Modules (No Dummy Pages)
  const clientNavSections = [
    {
      group: 'WORKSPACE OPERATIONS',
      items: [
        {
          id: 'overview',
          title: 'Workspace Overview',
          bn: 'ওয়ার্কস্পেস সংক্ষিপ্ত চিত্র',
          icon: LayoutDashboard,
        },
        {
          id: 'projects',
          title: 'My Projects',
          bn: 'আমার প্রজেক্ট',
          icon: FolderKanban,
          badge: projectCount > 0 ? String(projectCount) : undefined,
        },
        {
          id: 'deployments',
          title: 'Deployments & Domains',
          bn: 'ডিপ্লয়মেন্ট ও ডোমেন',
          icon: Rocket,
        },
        {
          id: 'support',
          title: 'Support & Helpdesk',
          bn: 'সাপোর্ট ও সহায়তা',
          icon: LifeBuoy,
          badge: supportCount > 0 ? String(supportCount) : undefined,
        },
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
          <div className="flex items-center justify-between px-1 py-0.5">
            <span className="sidebar-caption">CLIENT WORKSPACE</span>
            {workspaces.length > 1 && (
              <Badge variant="outline" className="text-[10px] h-4 font-mono text-teal-700 bg-teal-50 border-teal-200">
                {workspaces.length} active
              </Badge>
            )}
          </div>
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
                              <span
                                style={{
                                  marginLeft: 'auto',
                                  fontSize: '10px',
                                  background: '#eaf5f1',
                                  color: '#087f79',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 'bold',
                                }}
                              >
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
          <p className="sidebar-person">
            {user?.displayName ||
              (user?.organizationName && user.organizationName !== 'Customer / Client'
                ? user.organizationName
                : 'Client')}
          </p>
          <div className="sidebar-foot-links">
            <Link href={`/${lang === 'bn' ? 'en' : 'bn'}/app/${section.join('/')}`}>
              <Globe size={13} />
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'inherit',
              }}
            >
              <LogOut size={13} />
              {lang === 'bn' ? 'সাইন আউট' : 'Sign out'}
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="workbench-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <SidebarTrigger />
            <span className="header-divider" />

            {/* Interactive Multi-Workspace Selector Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#dce5e9] bg-[#f0f4f6]/80 hover:bg-[#e4ebef] text-[#162c38] font-bold text-xs transition-colors cursor-pointer shadow-2xs group"
                  title="Switch Workspace"
                >
                  <Building2 size={14} className="text-[#087f79]" />
                  <span className="max-w-[190px] truncate text-left">
                    {activeWorkspaceDisplayName}
                  </span>
                  <ChevronDown
                    size={13}
                    className="text-[#5b6f7b] group-hover:text-[#162c38] transition-transform group-data-[state=open]:rotate-180"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 bg-white border border-[#dce5e9] shadow-lg p-1.5 z-50">
                <DropdownMenuLabel className="text-[10px] font-semibold text-[#5b6f7b] uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                  <span>{lang === 'bn' ? 'আপনার ওয়ার্কস্পেস' : 'Workspaces'}</span>
                  <span className="text-[10px] font-mono bg-teal-50 text-[#087f79] px-1.5 py-0.2 rounded border border-teal-200">
                    {workspaces.length}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1 bg-[#dce5e9]" />
                <div className="max-h-56 overflow-y-auto space-y-0.5">
                  {workspaces.map((w) => (
                    <DropdownMenuItem
                      key={w.id}
                      onClick={() => handleSelectWorkspace(w.id)}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-md text-xs cursor-pointer ${
                        activeWorkspaceId === w.id
                          ? 'bg-[#edf7f4] text-[#087f79] font-bold'
                          : 'text-[#162c38] hover:bg-[#f4f7f8]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Building2
                          size={13}
                          className={activeWorkspaceId === w.id ? 'text-[#087f79]' : 'text-slate-400'}
                        />
                        <span className="truncate">{w.name}</span>
                      </div>
                      {activeWorkspaceId === w.id && (
                        <Check size={13} className="text-[#087f79] shrink-0 ml-2" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator className="my-1 bg-[#dce5e9]" />
                <DropdownMenuItem
                  onClick={() => setIsCreatingWorkspace(true)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-[#087f79] hover:bg-[#edf7f4] font-semibold cursor-pointer"
                >
                  <Plus size={13} />
                  <span>{lang === 'bn' ? 'নতুন ওয়ার্কস্পেস তৈরি করুন' : '+ New Workspace'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            workspace={activeWorkspaceId || 'client_ws'}
            workspaceName={activeWorkspaceDisplayName}
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

      {/* Create Workspace Modal */}
      <Dialog open={isCreatingWorkspace} onOpenChange={setIsCreatingWorkspace}>
        <DialogContent className="sm:max-w-md bg-white border border-[#dce5e9]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-dudos-text">
              {lang === 'bn' ? 'নতুন ওয়ার্কস্পেস তৈরি করুন' : 'Create New Workspace'}
            </DialogTitle>
            <DialogDescription className="text-xs text-dudos-text-secondary">
              {lang === 'bn'
                ? 'আপনার বিভিন্ন প্রতিষ্ঠান বা প্রজেক্টের জন্য পৃথক ওয়ার্কস্পেস পরিচালনা করুন।'
                : 'Create an isolated workspace to organize projects, AI Q&A specifications, and deployments.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateWorkspace} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-dudos-text">
                {lang === 'bn' ? 'ওয়ার্কস্পেসের নাম' : 'Workspace Name'}
              </Label>
              <Input
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: Daffodil Labs' : 'e.g. Daffodil Enterprise Platform'}
                maxLength={100}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreatingWorkspace(false)}>
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-dudos-primary hover:bg-dudos-primary-hover text-white"
                disabled={workspaceBusy || newWorkspaceName.trim().length < 2}
              >
                {workspaceBusy ? '…' : lang === 'bn' ? 'তৈরি করুন' : 'Create Workspace'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
