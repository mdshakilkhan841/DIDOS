'use client';
import { safeJsonParse } from "@/lib/subdomains";

/**
 * Static client-side mock provider for DUDOS.
 * Provides offline/static state persistence via localStorage and in-memory mock data
 * without requiring any Next.js backend /api routes.
 */

// Initial seed data
const SEED_WORKSPACES = [
  { id: 'ws_daffodil', name: 'Daffodil Family Workspace', role: 'owner', created_at: new Date().toISOString() },
  { id: 'ws_innovation', name: 'Innovation & Research Lab', role: 'editor', created_at: new Date().toISOString() },
];

const SEED_RECORDS = [
  {
    id: 'rec_assessment_01',
    kind: 'assessment',
    workspace: 'ws_daffodil',
    title: 'Smart Campus Management Transformation',
    version: 1,
    status: 'draft',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    data: {
      organization: 'Daffodil International University',
      sector: 'Higher Education',
      modules: 'website, crm, billing, analytics',
      outcomes: 'Automate student onboarding and streamline administrative requests.',
      stakeholders: 'Students, Faculty, Administration, IT Operations',
      timeline: '6 months',
    },
  },
  {
    id: 'rec_service_02',
    kind: 'ticket',
    workspace: 'ws_daffodil',
    title: 'Cloud ERP Migration Scope',
    version: 2,
    status: 'in_progress',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
    data: {
      organization: 'Daffodil Computers Ltd.',
      summary: 'Migrate enterprise database clusters to private cloud infrastructure.',
      priority: 'high',
      assignee: 'Operations Team',
    },
  },
];

const SEED_REQUESTS = [
  {
    id: 'req_001',
    workspace: 'ws_daffodil',
    record_id: 'rec_assessment_01',
    record_version: 1,
    kind: 'assessment',
    title: 'Smart Campus Management Transformation',
    status: 'reviewing',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    snapshot: {
      data: {
        organization: 'Daffodil International University',
        sector: 'Higher Education',
        modules: 'website, crm, billing, analytics',
        outcomes: 'Automate student onboarding and streamline administrative requests.',
      },
    },
  },
];

const SEED_NOTIFICATIONS = [
  {
    id: 'notif_001',
    title: 'Assessment Received',
    body: 'Your Smart Campus Transformation assessment has been assigned to our operations team.',
    href: '/en/app/requests',
    read_at: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif_002',
    title: 'Workspace Initialized',
    body: 'Welcome to Daffodil Family Workspace. All 30 enterprise operational domains are active.',
    href: '/en/app',
    read_at: new Date(Date.now() - 7200000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const SEED_TEAM = [
  { id: 'mem_1', user_id: 'usr_dev_operator', role: 'owner', created_at: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: 'mem_2', user_id: 'director@daffodil.family', role: 'editor', created_at: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 'mem_3', user_id: 'engineer@daffodil.family', role: 'viewer', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
];

function getCurrentSession(): { user: any; activeRole: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem('dudos_auth_session');
    if (val) {
      const parsed = safeJsonParse(val);
      if (parsed?.user) return parsed;
    }
  } catch {}

  // Fallback to cookie
  try {
    const match = document.cookie.match(/(^|;\s*)dudos_session=([^;]*)/);
    if (match) {
      const parsed = safeJsonParse(match[2]);
      if (parsed) {
        return {
          user: {
            id: parsed.userId || parsed.id || 'usr_session',
            email: parsed.email || '',
            username: parsed.email?.split('@')[0] || 'user',
            displayName: parsed.displayName || parsed.email?.split('@')[0] || 'User',
            role: parsed.role || 'client',
            status: 'approved',
            credits: 0,
            organizationName: parsed.organizationName || '',
          },
          activeRole: parsed.role || 'client',
        };
      }
    }
  } catch {}

  return null;
}

function getStore<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const val = localStorage.getItem('dudos_static_' + key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setStore<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('dudos_static_' + key, JSON.stringify(value));
  } catch {}
}

export async function api(path: string, method = 'GET', data?: any): Promise<any> {
  // Normalize path without query params for routing
  const [urlPath, queryString] = path.split('?');
  const params = new URLSearchParams(queryString || '');

  // Simulate minimal natural network delay
  await new Promise((r) => setTimeout(r, 60));

  const session = getCurrentSession();
  const currentUser = session?.user;

  // --- ACCOUNT ---
  if (urlPath === '/api/account' || urlPath === 'account') {
    if (!currentUser) {
      return { id: 'usr_guest', name: 'Guest', email: '', role: 'client', platform_admin: false, credits: 0 };
    }
    return {
      id: currentUser.id,
      name: currentUser.displayName || currentUser.username,
      email: currentUser.email,
      role: currentUser.role,
      platform_admin: currentUser.role === 'admin',
      credits: currentUser.credits ?? 0,
      organization: currentUser.organizationName || '',
      status: currentUser.status || 'active',
    };
  }

  // --- WORKSPACES ---
  if (urlPath === '/api/workspaces' || urlPath === 'workspaces') {
    const storeKey = currentUser ? `workspaces_${currentUser.id}` : 'workspaces';
    const defaultWorkspaces = currentUser
      ? [
          {
            id: `ws_${currentUser.id}`,
            name: currentUser.organizationName
              ? currentUser.organizationName
              : `${currentUser.displayName || currentUser.username}'s Workspace`,
            role: 'owner',
            created_at: currentUser.createdAt || new Date().toISOString(),
          },
        ]
      : SEED_WORKSPACES;

    let ws = getStore(storeKey, defaultWorkspaces);
    if (!ws || !ws.length) {
      ws = defaultWorkspaces;
      setStore(storeKey, ws);
    }

    if (method === 'POST') {
      const newWs = {
        id: 'ws_' + Date.now().toString(36),
        name: data?.name || 'New Workspace',
        role: 'owner',
        created_at: new Date().toISOString(),
      };
      ws = [...ws, newWs];
      setStore(storeKey, ws);
      return newWs;
    }
    return { workspaces: ws };
  }

  // --- RECORDS ---
  if (urlPath === '/api/records' || urlPath === 'records') {
    const storeKey = currentUser ? `records_${currentUser.id}` : 'records';
    let records = getStore(storeKey, SEED_RECORDS);
    const workspace = params.get('workspace') || data?.workspace;
    const kind = params.get('kind') || data?.kind;

    if (params.get('summary')) {
      const filtered = workspace ? records.filter((r: any) => r.workspace === workspace) : records;
      const by_status: Record<string, number> = {};
      const by_kind: Record<string, number> = {};
      filtered.forEach((r: any) => {
        by_status[r.status] = (by_status[r.status] || 0) + 1;
        by_kind[r.kind] = (by_kind[r.kind] || 0) + 1;
      });
      return {
        total: filtered.length,
        by_status,
        by_kind,
        asset_count: getStore('assets', []).length,
      };
    }

    if (params.get('events')) {
      const filtered = workspace ? records.filter((r: any) => r.workspace === workspace) : records;
      const events = filtered.map((r: any, idx: number) => ({
        id: 'evt_' + r.id + '_' + idx,
        created_at: r.updated_at || r.created_at || new Date().toISOString(),
        action: r.status === 'draft' ? 'created_draft' : 'updated_record',
        record_id: r.id,
        actor_id: currentUser?.displayName || 'Workspace Member',
        detail: `Record [${r.title || r.id}] in status: ${r.status}`,
      }));
      return { events };
    }

    if (method === 'POST') {
      const newRec = {
        id: 'rec_' + Date.now().toString(36),
        kind: data.kind || 'general',
        workspace: data.workspace || (currentUser ? `ws_${currentUser.id}` : 'ws_daffodil'),
        title: data.title || 'Untitled Record',
        version: 1,
        status: data.status || 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        data: data.data || {},
      };
      records = [newRec, ...records];
      setStore(storeKey, records);
      return newRec;
    }

    if (method === 'PATCH') {
      const idx = records.findIndex((r: any) => r.id === data.id);
      if (idx !== -1) {
        const updated = {
          ...records[idx],
          ...data,
          version: (records[idx].version || 1) + 1,
          updated_at: new Date().toISOString(),
        };
        records[idx] = updated;
        setStore(storeKey, records);
        return updated;
      }
      return data;
    }

    let filtered = records;
    if (workspace) filtered = filtered.filter((r: any) => r.workspace === workspace);
    if (kind) filtered = filtered.filter((r: any) => r.kind === kind);
    return { records: filtered, total: filtered.length };
  }

  // --- REQUESTS ---
  if (urlPath === '/api/requests' || urlPath === 'requests') {
    let reqs = getStore('requests', SEED_REQUESTS);
    const id = params.get('id');

    if (id) {
      const found = reqs.find((r) => r.id === id) || reqs[0];
      return {
        request: found,
        messages: [
          {
            id: 'msg_1',
            author_kind: 'customer',
            created_at: found?.created_at || new Date().toISOString(),
            body: 'Assessment submitted for review.',
          },
          {
            id: 'msg_2',
            author_kind: 'operator',
            created_at: new Date().toISOString(),
            body: 'Thank you for your submission. An operations architect has been assigned to your scope.',
          },
        ],
      };
    }

    if (method === 'POST') {
      const newReq = {
        id: 'req_' + Date.now().toString(36),
        workspace: data.workspace,
        record_id: data.record_id,
        record_version: data.version || 1,
        kind: 'assessment',
        title: 'Transformation Request',
        status: 'received',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        snapshot: { data: data.data || {} },
      };
      reqs = [newReq, ...reqs];
      setStore('requests', reqs);
      return newReq;
    }

    if (method === 'PATCH') {
      const idx = reqs.findIndex((r) => r.id === data.id);
      if (idx !== -1) {
        reqs[idx] = { ...reqs[idx], status: data.status, updated_at: new Date().toISOString() };
        setStore('requests', reqs);
      }
      return { ok: true };
    }

    return { requests: reqs, total: reqs.length };
  }

  // --- NOTIFICATIONS ---
  if (urlPath === '/api/notifications' || urlPath === 'notifications') {
    let notifs = getStore('notifications', SEED_NOTIFICATIONS);
    if (method === 'PATCH') {
      if (data?.all) {
        notifs = notifs.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }));
      } else if (data?.id) {
        notifs = notifs.map((n) => (n.id === data.id ? { ...n, read_at: new Date().toISOString() } : n));
      }
      setStore('notifications', notifs);
      return { ok: true };
    }
    const unread = notifs.filter((n) => !n.read_at).length;
    return { notifications: notifs, unread };
  }

  // --- TEAM ---
  if (urlPath === '/api/team' || urlPath === 'team') {
    let members = getStore('team_members', SEED_TEAM);
    let invites = getStore('team_invites', [
      { id: 'inv_1', email: 'partner@daffodil.family', role: 'editor', created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 86400000 * 7).toISOString() },
    ]);

    if (method === 'POST') {
      if (data?.action === 'join') {
        return { ok: true, workspace: 'ws_daffodil' };
      }
      const inv = {
        id: 'inv_' + Date.now().toString(36),
        email: data.email,
        role: data.role || 'viewer',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000 * 7).toISOString(),
        token: 'dudos_tok_' + Math.random().toString(36).substring(2),
      };
      invites = [inv, ...invites];
      setStore('team_invites', invites);
      return inv;
    }

    if (method === 'PATCH') {
      if (data?.member_id) {
        if (data.role === 'remove') {
          members = members.filter((m) => m.id !== data.member_id);
        } else {
          members = members.map((m) => (m.id === data.member_id ? { ...m, role: data.role } : m));
        }
        setStore('team_members', members);
      }
      if (data?.invite_id) {
        invites = invites.filter((i) => i.id !== data.invite_id);
        setStore('team_invites', invites);
      }
      return { ok: true };
    }

    return {
      members,
      invites,
      can_manage: true,
      self: 'usr_dev_operator',
    };
  }

  // --- COMMENTS / NOTES ---
  if (urlPath === '/api/comments' || urlPath === 'comments') {
    let notes = getStore('notes', [
      { id: 'com_1', record_id: params.get('record_id'), actor_id: 'Operations Lead', body: 'Baseline audit verified. Ready for architecture scoping.', created_at: new Date().toISOString() },
    ]);

    if (method === 'POST') {
      const newNote = {
        id: 'com_' + Date.now().toString(36),
        record_id: data.record_id,
        actor_id: 'Operations Lead',
        body: data.body,
        created_at: new Date().toISOString(),
      };
      notes = [newNote, ...notes];
      setStore('notes', notes);
      return newNote;
    }

    return { comments: notes.filter((n) => !params.get('record_id') || n.record_id === params.get('record_id')) };
  }

  // --- ASSETS ---
  if (urlPath === '/api/assets' || urlPath === 'assets') {
    const assets = getStore('assets', [
      { id: 'ast_1', filename: 'Daffodil_System_Spec.pdf', size: 245000, status: 'text_ready', sha256: 'a1b2c3d4e5f678901234567890abcdef', created_at: new Date().toISOString() },
      { id: 'ast_2', filename: 'Campus_Workflow_Diagram.png', size: 104000, status: 'quarantined', sha256: 'fedcba09876543210987654321fedcba', created_at: new Date().toISOString() },
    ]);

    if (params.get('text')) {
      return { text: 'Daffodil Unified Digital Operating System Specification (Extracted Content)\n\nSection 1: Architecture\nSection 2: Stakeholder Workflows\nSection 3: Security & Data Boundaries' };
    }

    if (method === 'POST') {
      return { ok: true, note: 'Asset uploaded to local workspace quarantine for review.' };
    }

    return { assets, total: assets.length };
  }

  // --- CMS ---
  if (urlPath === '/api/cms' || urlPath === 'cms') {
    if (params.get('history')) {
      return {
        versions: [
          { version: 1, action: 'published', created_at: new Date(Date.now() - 86400000).toISOString(), body: { title: 'Welcome to DUDOS' } },
        ],
      };
    }
    return {
      entries: [
        { id: 'home', item_key: 'home', version: 1, status: 'published', body: { title: { en: 'DUDOS Homepage', bn: 'ডিউডস হোমপেজ' } } },
        { id: 'about', item_key: 'about', version: 1, status: 'draft', body: { title: { en: 'About Daffodil Group', bn: 'ড্যাফোডিল গ্রুপ পরিচিতি' } } },
      ],
    };
  }

  // --- DEVSCOPE ---
  if (urlPath === '/api/devscope' || urlPath === 'devscope') {
    return {
      status: 'idle',
      project_id: 'dsp_' + (data?.record_id || 'demo'),
      current_build: null,
      builds: [],
      approvals: [],
    };
  }

  // --- GENERATE PREVIEW ---
  if (urlPath === '/api/generate' || urlPath === 'generate') {
    return {
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Concept Preview</title><style>body{font-family:system-ui,-apple-system,sans-serif;margin:0;padding:40px;background:#f8fafc;color:#0f172a}header{border-bottom:1px solid #e2e8f0;padding-bottom:20px;margin-bottom:30px}h1{color:#112C3A;font-size:28px}p{color:#64748b;line-height:1.6}.card{background:#fff;border:1px solid #e2e8f0;padding:24px;border-radius:12px;box-shadow:0 4px 6px -1px rgb(0 0 0/0.05)}</style></head><body><header><h1>DUDOS Dynamic Transformation Concept</h1><p>Client-side verified concept preview matching institutional specifications.</p></header><div class="card"><h3>Generated Architecture Spec</h3><p>Status: Ready for technical validation and milestone planning.</p></div></body></html>`,
    };
  }

  // --- BUILDER AI DRAFT ---
  if (urlPath === '/api/builder-ai' || urlPath === 'builder-ai') {
    return {
      provider_configured: true,
      enabled: true,
      remaining_today: 100,
    };
  }

  // Fallback for any other path
  return { ok: true };
}
