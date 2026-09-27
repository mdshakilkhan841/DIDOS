# DUDOS — Master Execution Plan & Progress Tracker

> **File Location**: `dudos/PLAN.md`  
> **Purpose**: Single source of truth for all phases, tasks, status tracking, and step-by-step implementation.  
> **Last Updated**: 2026-09-27  

---

## 📊 Executive Progress Dashboard

| Phase | Phase Name | Scope / Focus | Status | Tasks | Progress |
|:---:|---|---|:---:|:---:|:---:|
| **0** | **Environment, Tokens & Design System** | Tailwind 4 tokens, Sonner, UI primitives, documentation | 🟢 Complete | 6 / 6 | 100% |
| **1** | **Multi-Stakeholder Auth & Onboarding** | Split-screen login, role registration, auth context | 🟢 Complete | 6 / 6 | 100% |
| **2** | **Public Portal & Landing Showcase** | Bilingual header, hero, catalog, offerings, footer | ⚪ Pending | 0 / 6 | 0% |
| **3** | **Operations Workbench Shell (`/app`)** | Topbar, sidebar (9 groups), workspace switcher, KPI stats | ⚪ Pending | 0 / 5 | 0% |
| **4** | **Dynamic Records Engine (30+ Modules)** | Filterable tables, inspector drawer, dynamic forms, services | ⚪ Pending | 0 / 6 | 0% |
| **5** | **In-Browser Website Builder (`/builder`)** | 5-step wizard, 480 matrix profiles, client ZIP packaging | ⚪ Pending | 0 / 6 | 0% |
| **6** | **AI Planes: Prompt Studio & Sales Agent** | PS-001 - PS-016 DAG solver, bilingual sales discovery bot | ⚪ Pending | 0 / 5 | 0% |
| **7** | **DevScope AI Integration & Final QA** | `devscope-ai-builder` bridge, milestone tracker, audit | ⚪ Pending | 0 / 4 | 0% |
| **TOTAL**| **Entire DUDOS Migration & Build** | **Full System Architecture** | 🟡 **Active** | **12 / 44** | **27%** |

---

## 🎯 Current Active Focus

> **Current Milestone**: Awaiting User Direction to Begin **Phase 2 (Public Portal & Landing Showcase)** or adjust **Phase 1 (Auth Review)**.  
> **Next Action**: Review the task lists below, confirm order of operations, and proceed step-by-step.

---

## 📋 Granular Phase-by-Phase Checklist

---

### Phase 0: Project Setup, Tokens & Design System Foundations
*Status: 🟢 Completed*

- [x] **P0-01: Dependency Installation**  
  - Packages: `sonner`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`, `zod`, `react-hook-form`, `@hookform/resolvers`, `next-themes`.  
  - Target: [`package.json`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/package.json)

- [x] **P0-02: DUDOS Color System Integration**  
  - Derived from: [`color template/DUDOS_COLOR_SYSTEM.md`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/color%20template/DUDOS_COLOR_SYSTEM.md) and [`color template/dudos-theme.css`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/color%20template/dudos-theme.css).  
  - Target: [`app/globals.css`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/app/globals.css) (CSS variables & `@theme` tokens for `#112C3A`, `#087F79`, `#53D3BD`, `#F4F7F8`, `#DCE5E9`).

- [x] **P0-03: Agentic AI Documentation Suite**  
  - Author comprehensive markdown guides directly in project root:  
    - [`PRD.md`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/PRD.md) (Product vision, stakeholder personas, module matrix)  
    - [`ARCHITECTURE.md`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/ARCHITECTURE.md) (System architecture, component tree, API boundaries)  
    - [`RULES.md`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/RULES.md) (Agent guidelines, < 250 LOC rule, Sonner standards)  
    - [`DESIGN.md`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/DESIGN.md) (70/20/10 ratio, typography, button/card specifications)  
    - [`MEMORY.md`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/MEMORY.md) (Living phase memory & architectural decision log)

- [x] **P0-04: Centralized Toast Notification System**  
  - Implement typed Sonner wrapper supporting `success`, `error`, `warning`, `info`, and `promise`.  
  - Target: [`lib/toast.ts`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/lib/toast.ts) & [`components/ui/sonner.tsx`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/components/ui/sonner.tsx)

- [x] **P0-05: Core Reusable UI Primitives**  
  - Modular atomic components:  
    - [`components/ui/button.tsx`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/components/ui/button.tsx) (primary, secondary, outline, ghost, dark, destructive)  
    - [`components/ui/input.tsx`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/components/ui/input.tsx) & [`components/ui/label.tsx`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/components/ui/label.tsx)  
    - [`components/ui/badge.tsx`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/components/ui/badge.tsx) (semantic badges)  
    - [`components/ui/card.tsx`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/components/ui/card.tsx) (header, title, content, footer)  
    - [`components/ui/notice.tsx`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/components/ui/notice.tsx) (contextual in-form alerts)

- [x] **P0-06: Error Boundaries & 404 Pages**  
  - Implement user-friendly recovery UI matching DUDOS design language.  
  - Target: [`app/error.tsx`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/app/error.tsx) & [`app/not-found.tsx`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/app/not-found.tsx)

---

### Phase 1: Multi-Stakeholder Registration & Authentication Flow
*Status: 🟢 Completed (Available for Review & Testing)*

- [x] **P1-01: Stakeholder Role Definitions & Schema**  
  - Models for 6 stakeholder personas: `client`, `merchant`, `partner`, `academy`, `staff`, `executive`.  
  - Target: [`types/auth.ts`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/types/auth.ts)

- [x] **P1-02: Multi-Stakeholder Authentication State Provider**  
  - Auth context managing active session, localStorage persistence, login/register/logout actions, and role-switching.  
  - Target: [`context/auth-context.tsx`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/context/auth-context.tsx)

- [x] **P1-03: Split-Screen Brand Panel Component**  
  - Left-hand side brand panel featuring `#112C3A` Navy background, ambient radial glows, brand mark, value bullets, and dynamic stakeholder badge highlight.  
  - Target: [`components/auth/AuthBrandPanel.tsx`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/components/auth/AuthBrandPanel.tsx)

- [x] **P1-04: Role Switcher Component**  
  - Interactive tabs and grid toggle for all 6 stakeholder personas.  
  - Target: [`components/auth/StakeholderSelector.tsx`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/components/auth/StakeholderSelector.tsx)

- [x] **P1-05: Multi-Stakeholder Sign-In Form**  
  - Sign-in form with stakeholder switch, password toggle, quick demo-fill button, remember-me checkbox, and Sonner feedback.  
  - Target: [`components/auth/LoginForm.tsx`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/components/auth/LoginForm.tsx)

- [x] **P1-06: Multi-Stakeholder Registration Form & Password Reset**  
  - Registration form with stakeholder selection grid, role-specific metadata fields (e.g. Student ID, Merchant Tax ID, Organization name), password strength meter, and password recovery.  
  - Target: [`components/auth/RegisterForm.tsx`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/components/auth/RegisterForm.tsx), [`app/login/`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/app/login), [`app/register/`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/app/register), [`app/forgot-password/`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/app/forgot-password)

---

### Phase 2: Public Portal & Landing Showcase (Bilingual `en` / `bn`)
*Status: ⚪ Pending User Review & Approval to Begin*

- [ ] **P2-01: Public Header & Navigation Component**  
  - Brand mark, solutions dropdown mega-menu, language toggle (`en` / `bn`), and authentication action buttons.  
  - Target: `components/public/Header.tsx` (reference: `DUDOS Original/components/dudos-public.tsx:L1-L150`)

- [ ] **P2-02: Hero Showcase Section**  
  - Deep Navy hero panel with ambient lighting, high-contrast headline, primary CTAs, and key metric chips.  
  - Target: `components/public/HeroSection.tsx`

- [ ] **P2-03: Solutions & Ecosystem Catalog**  
  - Service grid showcasing cloud hosting, data center, VPS, software engineering, and ERP solutions.  
  - Target: `components/public/SolutionsCatalog.tsx`

- [ ] **P2-04: 6-Stakeholder Interactive Preview Cards**  
  - Interactive portal explorer allowing visitors to preview each stakeholder's personalized capabilities.  
  - Target: `components/public/StakeholderShowcase.tsx`

- [ ] **P2-05: Public Content Data Store**  
  - Extract and structure clean JSON content for bilingual text, service descriptions, and marketing copy.  
  - Target: `lib/content/public-content.json` & `lib/services/cms-service.ts`

- [ ] **P2-06: Bilingual Route Shell (`/[lang]/...`)**  
  - Implement localized routing supporting `/en` and `/bn` paths with proper SEO metadata generation.  
  - Target: `app/[lang]/page.tsx` & `app/[lang]/layout.tsx`

---

### Phase 3: Authenticated Operations Workbench (`/app`)
*Status: ⚪ Pending*

- [ ] **P3-01: Workbench Top Navigation Bar**  
  - Active tenant selector, workspace switcher, global search command dialog, notification bell with Sonner popups, and user profile dropdown.  
  - Target: `components/workbench/WorkbenchTopbar.tsx`

- [ ] **P3-02: 9-Domain Operations Sidebar**  
  - Collapsible navigation sidebar covering: Staff, Customer, Finance, Merchant, Partner, Executive, Academy, Tenant Admin, Platform Admin.  
  - Target: `components/workbench/WorkbenchSidebar.tsx`

- [ ] **P3-03: Workspace Context & State**  
  - Multi-tenant workspace switcher context storing active workspace ID, tenant metadata, and user permissions.  
  - Target: `context/workspace-context.tsx`

- [ ] **P3-04: Summary KPI Dashboard & Metrics**  
  - Quick summary widgets: Active projects, open tickets, quote approvals, build statuses, and recent activity logs.  
  - Target: `components/workbench/WorkbenchDashboard.tsx`

- [ ] **P3-05: Workbench Page Shell Route**  
  - Assemble `/app` route with responsive sidebar, topbar, and main container.  
  - Target: `app/(workbench)/app/page.tsx` & `app/(workbench)/app/layout.tsx`

---

### Phase 4: Dynamic Records Engine & 30+ Enterprise Modules
*Status: ⚪ Pending*

- [ ] **P4-01: Enterprise Modules Definitions & Field Schemas**  
  - Type-safe definitions for all 30+ operational modules (tasks, field visits, assessments, quotes, invoices, products, orders, challenges, etc.).  
  - Target: `lib/constants/modules.ts` & `types/modules.ts`

- [ ] **P4-02: Filterable Records Data Table**  
  - Reusable data table with sortable columns, status badge renderers, pagination, and bulk actions.  
  - Target: `components/records/RecordsTable.tsx`

- [ ] **P4-03: Search & Filter Toolbar**  
  - Real-time search, status filter dropdowns, domain grouping, and "Create Record" action button.  
  - Target: `components/records/RecordToolbar.tsx`

- [ ] **P4-04: Record Inspector Slide-Over Drawer**  
  - Slide-out details drawer showing record history, version timeline, attributes, and transition actions.  
  - Target: `components/records/RecordInspector.tsx`

- [ ] **P4-05: Dynamic Record Creation & Edit Modal**  
  - Dynamic schema-driven modal form with Zod validation, file attachment field, and Sonner feedback.  
  - Target: `components/records/RecordFormModal.tsx`

- [ ] **P4-06: Records Data Service (Mock Layer ready for FastAPI)**  
  - Decoupled data service providing CRUD methods with mock storage, ready to swap with backend API calls.  
  - Target: `lib/services/records-service.ts`

---

### Phase 5: Deterministic In-Browser Website Builder (`/builder`)
*Status: ⚪ Pending*

- [ ] **P5-01: 480 Matrix Template Catalog**  
  - 15 Industries × 8 Structural Hero Blueprints × 4 Visual Styles (`ocean`, `midnight`, `ember`, `teal`).  
  - Target: `lib/builder/template-library.ts`

- [ ] **P5-02: 5-Step Guided Wizard Container**  
  - Step progress indicator, back/next navigation, step validation, and draft persistence.  
  - Target: `components/builder/BuilderWizard.tsx`

- [ ] **P5-03: Step 1 & 2 — Design & Tech Stack**  
  - Matrix style pickers and technology stack selector (React+FastAPI, Next.js, WordPress, Laravel, Angular, Odoo, HTML).  
  - Target: `components/builder/steps/StepDesign.tsx` & `StepTech.tsx`

- [ ] **P5-04: Step 3 & 4 — Pages, Domain & SRS Parser**  
  - Custom sitemap page hierarchy editor, domain DNS configuration, and `.docx` / `.md` SRS specification parser.  
  - Target: `components/builder/steps/StepPages.tsx` & `StepSRS.tsx`

- [ ] **P5-05: Step 5 — Live Preview & Approval Gate**  
  - Sandboxed iframe HTML/CSS preview, requirement lock checklist, and sign-off verification.  
  - Target: `components/builder/steps/StepPreview.tsx`

- [ ] **P5-06: Pure Client-Side ZIP Generator**  
  - In-browser ZIP writer compiling source files, database migrations, Docker Compose files, and QA scripts.  
  - Target: `lib/builder/generator.ts`

---

### Phase 6: AI Planes — Prompt Studio & Sales Discovery Agent
*Status: ⚪ Pending*

- [ ] **P6-01: Prompt Studio DAG Dependency Resolver**  
  - Topological sorting algorithm with cycle detection resolving prerequisite steps for 16 transformation recipes (`PS-001` - `PS-016`).  
  - Target: `lib/ai/selector-core.ts`

- [ ] **P6-02: Prompt Studio Interactive Workspace**  
  - Recipe card browser, recipe configuration form, dependency visualizer, and SHA-256 prompt package generator.  
  - Target: `components/studio/PromptStudioView.tsx`

- [ ] **P6-03: AI Sales Discovery Agent UI**  
  - Interactive bilingual conversational chatbot assisting clients with service discovery and quote drafting.  
  - Target: `components/sales/SalesAgentChat.tsx`

- [ ] **P6-04: Sandboxed Safety & Quota Governance**  
  - Input sanitizer stripping untrusted code, token rate-limiter, and session quota visualizer.  
  - Target: `lib/ai/sales-agent-guardrails.ts`

- [ ] **P6-05: W3C Web Model Context Protocol (WebMCP) Adapter**  
  - Browser agent integration hook (`window.modelContext`) for AI agent tool registration.  
  - Target: `lib/ai/webmcp.ts`

---

### Phase 7: DevScope AI Integration Bridge & Quality Assurance
*Status: ⚪ Pending*

- [ ] **P7-01: DevScope Client Contract & Types**  
  - Type definitions matching `devscope-ai-builder` API specs (idempotency key, project payload, build status).  
  - Target: `lib/services/devscope-client.ts` & `types/devscope.ts`

- [ ] **P7-02: DevScope Project Submission Drawer**  
  - Scope and SRS approval checklist, target stack confirmation, and "Submit for Autonomous Build" action.  
  - Target: `components/devscope/DevScopeSubmitDrawer.tsx`

- [ ] **P7-03: 11-Stage Live Milestone Tracker**  
  - Visual status tracker: `queued` → `preparing` → `planning` → `building` → `fixing` → `validating` → `deploying` → `verifying` → `testing` → `publishing` → `success`.  
  - Target: `components/devscope/DevScopeBuildTracker.tsx`

- [ ] **P7-04: End-to-End Build & Responsive QA Audit**  
  - Verify zero bundle errors, mobile/tablet layout responsiveness, keyboard accessibility, and full design fidelity.  
  - Target: Full workspace build verification (`pnpm build`).

---

## 📝 Change & Execution Log

| Date | Task ID | Description of Change | Modified Files |
|---|---|---|---|
| 2026-09-27 | `P0-01` - `P0-06` | Setup dependencies, Tailwind 4 DUDOS color tokens, Sonner toast, base UI primitives, error boundary, and full documentation suite (`PRD.md`, `ARCHITECTURE.md`, `RULES.md`, `DESIGN.md`, `MEMORY.md`). | `package.json`, `app/globals.css`, `lib/toast.ts`, `components/ui/*`, docs |
| 2026-09-27 | `P1-01` - `P1-06` | Multi-stakeholder auth flow implemented for 6 personas (`client`, `merchant`, `partner`, `academy`, `staff`, `executive`), split-screen login, role-specific onboarding form, forgot-password, and AuthContext. | `types/auth.ts`, `context/auth-context.tsx`, `components/auth/*`, `app/login/*`, `app/register/*`, `app/forgot-password/*` |
| 2026-09-27 | `PLAN-INIT` | Created persistent master tracking document [`dudos/PLAN.md`](file:///Users/shakil/Desktop/DaffodilGroup/DUDOS/dudos/PLAN.md) to preserve step-by-step progress and prevent plan loss across chat turns. | `dudos/PLAN.md` |
