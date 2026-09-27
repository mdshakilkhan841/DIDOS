# DUDOS — Product Requirements Document (PRD)

> **Document Version**: 2.0.0  
> **Status**: Approved for Frontend Re-architecture & Multi-Stakeholder Development  
> **Target Project**: `dudos` (Fresh, modular, industry-standard implementation)  
> **Reference Architecture**: `DUDOS Original` & `PROJECT_ARCHITECTURE_AND_WORKFLOW.md`  
> **Future Backend Service**: `devscope-ai-builder` (autonomous engine) & FastAPI Backend  

---

## 1. Executive Summary & Vision

**DUDOS (Daffodil Unified Digital Operating System)** is the centralized digital ecosystem and operational control plane designed for the Daffodil Family ecosystem, affiliated enterprises, educational institutions, partners, and clients.

The previous prototype (`DUDOS Original`) proved the comprehensive feature set—including 30+ ERP modules, a 480-matrix deterministic website generator, Prompt Studio, and bilingual portals—but suffered from architectural complexity, monolithic files, and tangled state logic.

This next-generation project (`dudos`) is engineered with:
1. **Strict Design Fidelity**: Adhering 100% to the approved management design (Deep Navy `#112C3A`, DUDOS Teal `#087F79`, Mint `#53D3BD`, and Slate neutrals).
2. **Modular Component Architecture**: Decoupling massive 20KB+ files into clean, testable, and reusable React 19 components with strict TypeScript types.
3. **Multi-Stakeholder Authentication & Onboarding**: First-class support for diverse platform actors with customized registration and dashboard experiences.
4. **Resilient Feedback & Error Handling**: Integrated `sonner` toast system, accessible form validation, and contextual error boundaries.
5. **Future-Ready Dynamic State**: Layered mock services and API adapters ready to connect with `devscope-ai-builder` and the backend API plane.

---

## 2. Multi-Stakeholder Persona Matrix

DUDOS serves six distinct primary stakeholder groups. Registration and authentication flows must adapt dynamically to capture stakeholder-specific metadata and direct them to their relevant operational environment:

| Stakeholder Persona | Description | Key Onboarding Attributes | Target Environment |
|---|---|---|---|
| **Client / Business** | Companies and organizations seeking digital transformation, custom software, ERP deployment, or managed cloud services. | Company Name, Industry, Organization Size, Business Domain | Client Workbench, Project Milestones, Support & Quotations |
| **Merchant / Vendor** | Merchants, retail partners, and suppliers managing catalogs, orders, hardware, or hosting services. | Merchant Name, Trade License/Tax ID, Product Category | Merchant Portal, Catalog Manager, Order Fulfillment |
| **Partner / Agency** | Digital agencies, consultants, system integrators, and affiliates collaborating on delivery. | Agency Name, Partnership Tier, Capability Specialization | Partner Dashboard, Commission Tracking, Marketplace Listings |
| **Academy / Student** | DIU students, faculty, interns, and academic researchers accessing living labs, innovation challenges, and computing resources. | University/Institution, Student/Faculty ID, Department, Skill Domain | Academy Hub, Challenge Submissions, Lab/GPU Bookings |
| **Staff / Operations** | Internal team members, field technicians, project managers, and operational staff. | Staff ID, Department, Operational Role, Supervisor Email | Staff Task Operations, Field Visits, Evidence Collector |
| **Executive / Admin** | Senior leadership and governance administrators overseeing commercial pipelines, compliance, and platform health. | Security Clearance Level, Department/Entity, Access Key | Executive Cockpit, Market Watch, Release Gates, Audit Logs |

---

## 3. Product Scope & Functional Modules

### 3.1 Authentication & Identity (Phase 1 & 2)
- **Split-Screen Design**: Left-side brand panel with glowing radial gradients and core value highlights; right-side interactive form.
- **Stakeholder Segmented Registration**: Interactive role selector that reveals context-sensitive onboarding fields.
- **Credential Validation**: Email format validation, password strength meter (minimum 8 characters, upper/lower/number/symbol), and confirmation matching via Zod.
- **Session & Role Switcher**: Mock dynamic session management enabling seamless local testing of all six stakeholder viewpoints before backend integration.
- **Feedback & Notifications**: Instant notifications powered by `sonner` toasts (success, warning, error, info).

### 3.2 Public Portal & Showcase (Phase 3)
- **Bilingual Content**: Support for English (`en`) and Bengali (`bn`) locales.
- **Responsive Navigation**: Header with mega-menu dropdowns for Solutions, Products, Services, Industries, and Academy.
- **Hero & Feature Banners**: Dark Navy hero panels with Light Mint highlights and crisp typography.
- **Offerings & Service Explorer**: Live searchable catalog of Daffodil digital offerings (Cloud hosting, VPS, data center, software engineering, ERP).

### 3.3 Operations Workbench (`/app`) (Phase 4 & 5)
- **Top Bar & Workspace Switcher**: Quick tenant switcher, global search, notification center, and active stakeholder badge.
- **30+ Enterprise Operational Modules**:
  - *Staff*: `task`, `field_visit`, `source_response`.
  - *Customer*: `assessment`, `project`, `software_project`, `preview`, `subscription`, `ticket`, `feedback`.
  - *Finance*: `quote`, `invoice`.
  - *Merchant*: `product`, `order`, `return`.
  - *Partner*: `partner`, `listing`, `commission`, `campaign`.
  - *Executive*: `opportunity`, `market_review`, `decision`.
  - *Academy*: `challenge`, `application`, `research`, `judging`, `booking`, `learning`.
  - *Tenant & Platform*: `country`, `integration`, `content`, `configuration`, `agent`, `incident`.
- **Dynamic Records Engine**: Filterable data tables, status badges, sortable columns, detail inspector drawers, and record creation modals.

### 3.4 In-Browser Website Builder (`/builder`) (Phase 6)
- **480-Matrix Configuration**: 15 Industries × 8 Hero Blueprints × 4 Visual Themes (`ocean`, `midnight`, `ember`, `teal`).
- **5-Step Wizard**:
  1. *Design*: Industry, layout, and visual theme selection.
  2. *Technology*: Stack selection (React+FastAPI, Next.js, WordPress, Laravel, Angular, Odoo, HTML).
  3. *Domain & Pages*: Page hierarchy and slug configuration.
  4. *SRS & Scope*: Specification input with support for uploading `.docx` and `.md` files.
  5. *Review & Generate*: Live interactive HTML iframe preview, approval lock, and client-side ZIP packaging with zero server requirements.

### 3.5 AI Planes & External Builders (Phase 7)
- **Prompt Studio (`PS-001` - `PS-016`)**: DAG dependency solver generating cryptographic SHA-256 prompt packs.
- **AI Sales Discovery Agent**: Bilingual pre-sales advisor with sandboxed guardrails.
- **DevScope Integration Plane**: Interface with `devscope-ai-builder` for automated code generation, test runs, container builds, and staging previews.

---

## 4. Non-Functional Requirements

1. **Performance**: Initial page load < 1.2s; client-side navigation < 100ms; ZIP packaging generated in under 3 seconds directly in browser memory.
2. **Visual Consistency**: Strict adherence to the 70% light surface / 20% dark navy / 10% teal accent rule.
3. **Accessibility**: WCAG 2.1 AA compliant color contrast, keyboard navigable forms, ARIA labeled dialogs, and screen-reader announcements via Sonner.
4. **Code Quality**: Zero `any` types in core domain contracts; modular files under 300 lines; components split by responsibility.
5. **State Management**: Predictable state flows using React Context and custom hooks, with offline/mock fallback for every API surface.

---

## 5. Success Metrics

- Clean, readable folder structure matching industry standards.
- 100% visual parity with the management-approved DUDOS design language.
- Functional multi-stakeholder login/register flow with role-aware onboarding.
- Smooth transition readiness for connecting backend endpoints and DevScope webhooks.
