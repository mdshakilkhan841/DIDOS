# DUDOS — Project Memory & Phase Tracker

> **Last Updated**: 2026-09-27  
> **Active Milestone**: Phase 1 & Phase 2 (Foundation, Tooling & Multi-Stakeholder Auth Flow)  
> **Backend Status**: Decoupled Mock Layer active; API connection with `devscope-ai-builder` scheduled for later.  

---

## 1. Phased Migration Roadmap

| Phase | Title | Scope & Key Deliverables | Status |
|---|---|---|---|
| **Phase 1** | **Foundation & Design System** | Tailwind 4 DUDOS theme tokens, `sonner` toast system, UI primitives, documentation suite (`PRD.md`, `ARCHITECTURE.md`, `RULES.md`, `DESIGN.md`, `MEMORY.md`). | 🟡 In Progress |
| **Phase 2** | **Multi-Stakeholder Auth & Onboarding** | Split-screen layout, role-based registration & login (`client`, `merchant`, `partner`, `academy`, `staff`, `executive`), auth context, password recovery, session mock state. | 🟡 In Progress |
| **Phase 3** | **Public Portal & Landing Showcase** | Bilingual Header (`en`/`bn`), Hero showcase, Service & Solution catalog, Offerings explorer, Footer, SEO meta. | ⚪ Pending |
| **Phase 4** | **Operations Workbench (`/app`)** | Workspace topbar, tenant selector, sidebar navigation for 9 operational domains, metrics & quick stats dashboard. | ⚪ Pending |
| **Phase 5** | **Dynamic Records Engine** | 30+ enterprise operational modules, filterable data tables, status badges, inspector drawer, creation modals with Zod validation. | ⚪ Pending |
| **Phase 6** | **Deterministic Website Builder (`/builder`)** | 5-step wizard, 480 matrix profiles (15 industries × 8 blueprints × 4 styles), live iframe preview, pure client-side ZIP generator. | ⚪ Pending |
| **Phase 7** | **AI Planes & DevScope Integration** | Prompt Studio DAG compiler (`PS-001` - `PS-016`), Sales Discovery Agent, `devscope-ai-builder` bridge & webhook listener. | ⚪ Pending |

---

## 2. Key Architectural Decisions Log

- **Decision 001 (Design System)**: Adopted exact CSS tokens from `dudos/color template/DUDOS_COLOR_SYSTEM.md`. Strict 70/20/10 ratio (Neutral surfaces / Deep Navy / DUDOS Teal & Mint).
- **Decision 002 (Feedback System)**: Standardized on `sonner` for all application toasts via `@/lib/toast.ts`. Browser native `alert()` is prohibited.
- **Decision 003 (Component Size Gate)**: Strict file size threshold (< 250 LOC). Monolithic files must be decomposed into sub-components.
- **Decision 004 (Multi-Stakeholder Support)**: All auth and operational screens must be parameterized by stakeholder role.
- **Decision 005 (Decoupled Backend)**: UI components must depend on `@/lib/services/` contracts with mock fallback, ready for future REST/FastAPI integration.

---

## 3. Active Context & Next Steps

1. Configure `app/globals.css` with the DUDOS color tokens and utility classes.
2. Create core UI atomic components: `Button`, `Input`, `Label`, `Badge`, `Card`, `Tabs`, `Notice`, `Sonner`.
3. Create `@/lib/toast.ts` utility for typed Sonner notifications.
4. Build the complete Multi-Stakeholder Registration & Login screens (`/login`, `/register`, `/forgot-password`).
5. Wire up the `AuthContext` to support active stakeholder simulation.
