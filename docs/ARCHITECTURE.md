# DUDOS — System Architecture & Engineering Blueprint

> **Document Version**: 2.0.0  
> **Repository**: `dudos`  
> **Framework**: Next.js 16 (App Router) + React 19 + Tailwind CSS 4  
> **UI Layer**: Reusable Modular Components + Sonner Toasts + Lucide Icons  

---

## 1. Architectural Philosophy

The redesigned `dudos` codebase eliminates the anti-patterns of the earlier iteration (20KB+ monolithic components, inline minified logic, untyped state bags) in favor of **Domain-Driven Modular Architecture**:

1. **Separation of Concerns**: Pure UI primitives are isolated in `components/ui/`, domain-specific views in `components/<feature>/`, business rules in `lib/`, and state providers in `context/`.
2. **Predictable Component Size**: Component files target < 250 lines. Large views are broken into sub-components (header, table, filter bar, drawer, modal).
3. **Pluggable Dynamic Services**: All data operations flow through typed service contracts in `lib/services/`. Initially powered by deterministic mock state, they are designed for instant drop-in replacement with FastAPI / DevScope endpoints.
4. **Resilient Toast & Error Pipelines**: Every asynchronous action is wrapped with structured error handling and Sonner toast dispatches.

---

## 2. Directory Structure

```text
dudos/
├── app/                               # Next.js 16 App Router
│   ├── (auth)/                        # Grouped authentication routes
│   │   ├── login/                     # Split-screen multi-stakeholder login
│   │   ├── register/                  # Stakeholder-aware onboarding
│   │   └── forgot-password/           # Password recovery flow
│   ├── (public)/                      # Public portal & marketing showcase
│   │   ├── [lang]/                    # Bilingual routes (/en, /bn)
│   │   └── page.tsx                   # Default redirect or landing root
│   ├── (workbench)/                   # Authenticated operations workspace
│   │   └── app/                       # /app - Control plane & module views
│   │       ├── records/               # 30+ enterprise operational modules
│   │       ├── studio/                # Prompt Studio DAG compiler
│   │       └── devscope/              # DevScope AI builds tracker
│   ├── builder/                       # /builder - 5-step website generator
│   ├── api/                           # BFF route handlers & mock proxies
│   ├── globals.css                    # Tailwind 4 directives & DUDOS theme tokens
│   ├── layout.tsx                     # Root layout with providers & Sonner Toaster
│   ├── error.tsx                      # Global graceful error boundary
│   └── not-found.tsx                  # Branded 404 page
│
├── components/                        # Reusable Component Library
│   ├── ui/                            # Atomic design system primitives
│   │   ├── sonner.tsx                 # Pre-configured Sonner toaster
│   │   ├── button.tsx                 # Button with DUDOS primary/accent variants
│   │   ├── input.tsx                  # Accessible styled inputs
│   │   ├── label.tsx                  # Form labels
│   │   ├── badge.tsx                  # Status badges (success, warning, error, info)
│   │   ├── card.tsx                   # Surface cards with subtle borders
│   │   ├── tabs.tsx                   # Stakeholder and section tabs
│   │   └── notice.tsx                 # In-form contextual notices
│   ├── auth/                          # Multi-stakeholder auth components
│   │   ├── AuthBrandPanel.tsx         # Left-side brand panel with radial glow
│   │   ├── LoginForm.tsx              # Modular sign-in form with stakeholder switch
│   │   ├── RegisterForm.tsx           # Stakeholder-specific dynamic registration
│   │   └── StakeholderSelector.tsx    # Role card/tab selection component
│   ├── layout/                        # Shell and navigation wrappers
│   │   ├── Navbar.tsx                 # Public responsive header with navigation
│   │   ├── Footer.tsx                 # Standard DUDOS footer
│   │   └── WorkbenchShell.tsx         # Workbench sidebar, topbar, and workspace switcher
│   ├── modules/                       # Operational module components
│   └── builder/                       # Website builder wizard components
│
├── context/                           # React Context Providers
│   ├── auth-context.tsx               # Active stakeholder, user session & mock switch
│   └── workspace-context.tsx          # Active workspace, tenant ID & preferences
│
├── lib/                               # Core Business Logic & Infrastructure
│   ├── toast.ts                       # Typed Sonner notification helpers
│   ├── utils.ts                       # Class names merge (`cn`) and string utils
│   ├── constants/                     # Color tokens, stakeholder profiles, modules
│   ├── mock/                          # Mock datasets for records, users, and specs
│   └── services/                      # API / Data services (pluggable backend layer)
│
├── types/                             # TypeScript Type Definitions
│   ├── auth.ts                        # Stakeholder roles, user model, session types
│   ├── modules.ts                     # Enterprise modules (tasks, quotes, tickets, etc.)
│   └── builder.ts                     # Builder 480 matrix, wizard state, and ZIP types
│
├── color template/                    # Management Design Color System Reference
│   ├── DUDOS_COLOR_SYSTEM.md          # Visual identity specifications
│   ├── DUDOS_COLOR_TEMPLATE.html      # HTML visual swatch preview
│   └── dudos-theme.css                # Raw CSS variable definitions
│
├── PRD.md                             # Product Requirements Document
├── ARCHITECTURE.md                    # This document
├── RULES.md                           # Agentic coding & developer conventions
├── DESIGN.md                          # Design tokens, color system, and UI guidelines
└── MEMORY.md                          # Phase tracking, changelog, and active state
```

---

## 3. Multi-Stakeholder Identity & RBAC Flow

```mermaid
flowchart TD
    User([User visits /login or /register]) --> Choice{Action}
    
    Choice -->|Sign In| LoginScreen[Multi-Stakeholder Login Form]
    Choice -->|Sign Up| StakeholderSelect[Select Stakeholder Persona]
    
    StakeholderSelect --> RoleOptions[Options: Client / Merchant / Partner / Academy / Staff / Executive]
    RoleOptions --> DynamicFields[Render Stakeholder-Specific Profile Fields]
    
    DynamicFields --> Validate[Zod Form Validation]
    Validate -->|Error| SonnerError[Sonner Toast: Validation Error]
    Validate -->|Success| MockSession[Create Stakeholder Session]
    
    LoginScreen --> CredentialAuth[Authenticate Email & Password]
    CredentialAuth -->|Valid| MockSession
    
    MockSession --> ToastSuccess[Sonner Toast: Welcome back]
    ToastSuccess --> RouteGuard{Role Routing}
    
    RouteGuard -->|Client| ClientDash[/app/records/project]
    RouteGuard -->|Merchant| MerchantDash[/app/records/product]
    RouteGuard -->|Partner| PartnerDash[/app/records/partner]
    RouteGuard -->|Academy| AcademyDash[/app/records/challenge]
    RouteGuard -->|Staff| StaffDash[/app/records/task]
    RouteGuard -->|Executive| ExecDash[/app/records/decision]
```

---

## 4. UI Layer & Toast Notification Architecture

### Sonner Toast Standards
All asynchronous notifications must use the centralized `showToast` abstraction in `lib/toast.ts` wrapping `sonner`:
- **Success**: Emerald/Teal accented toasts with checkmark icon for saved records, successful logins, and approved versions.
- **Error**: Crimson-toned toasts with error reason, descriptive details, and actionable guidance.
- **Warning**: Amber toasts for confirmations, destructive actions, or unsaved draft alerts.
- **Info / Loading**: Navy/Teal informational notifications and promise toasts during async operations.

### Error Handling Hierarchy
1. **Field-Level Validation**: Managed by React Hook Form + Zod, displaying inline helper errors below inputs.
2. **Form-Level Feedback**: Contextual `<Notice tone="error">` banners for credential rejections or network errors.
3. **Action-Level Feedback**: Sonner toast alerts informing the user of background activity or failures.
4. **Page-Level Boundary**: `app/error.tsx` catching unexpected render exceptions with a retry button and telemetry logger.

---

## 5. Integration Boundary with `devscope-ai-builder`

When backend services and DevScope AI integrations are activated:
1. `lib/services/devscope.ts` will manage HTTP communication via server-to-server REST to DevScope's FastAPI port (`:8001` or `:8000`).
2. Build triggers will transmit the immutable composite payload `(workspace_id, record_id, record_version)`.
3. DevScope's 11-stage autonomous execution (`queued` → `planning` → `building` → `validating` → `deploying` → `success`) will be reported back to DUDOS via HMAC-SHA256 verified webhooks or polling endpoints, which update the live milestone tracker.
