# DUDOS — Engineering Rules & Agent Guidelines

> **Target Audience**: AI Agents (Antigravity, Claude, Cursor) & Human Engineers  
> **Enforcement**: Strict — PRs and code commits must comply with these guidelines.  

---

## 1. Core Principles

1. **Design Preservation is Non-Negotiable**:
   - Management has approved the DUDOS visual identity.
   - Do NOT invent arbitrary color schemes (e.g. standard Tailwind `blue-600` or `indigo-500`).
   - All colors MUST be derived from the DUDOS Color System (`#112C3A`, `#087F79`, `#53D3BD`, `#DCE5E9`, etc.).
   - Follow the **70% Neutral Surfaces / 20% Dark Navy / 10% Teal Accent** rule.

2. **No Monolithic Components**:
   - The previous codebase contained 20KB+ files where state, forms, tables, and API proxies were mashed together.
   - Files MUST stay under **250 lines of code**. If a file grows beyond 250 lines, decompose it into sub-components, custom hooks, or utility helpers.

3. **Multi-Stakeholder First**:
   - Every auth and dashboard feature must support the 6 stakeholder personas:
     `client` | `merchant` | `partner` | `academy` | `staff` | `executive`.
   - Never assume a single hardcoded user type.

4. **Always Use Sonner Toasts for User Feedback**:
   - Do not use `alert()`, browser dialogs, or unstructured error messages.
   - Import and use `showToast` from `@/lib/toast`:
     ```typescript
     showToast.success("Profile updated successfully");
     showToast.error("Authentication failed", { description: "Invalid password." });
     ```

5. **Proper Error Handling & Validation**:
   - All form inputs MUST be validated with **Zod** schemas.
   - Always display inline validation errors beneath invalid form controls.
   - Asynchronous operations MUST be wrapped in `try ... catch` blocks with user-facing toasts and error state fallbacks.

6. **Decoupled Dynamic Services**:
   - Keep mock data and future API callers strictly inside `@/lib/services/` or `@/lib/mock/`.
   - UI components must consume services or hooks, making the transition to the future `devscope-ai-builder` and FastAPI backend seamless.

---

## 2. File Organization Rules

- **UI Primitives**: Place pure design system components in `components/ui/` (e.g., `button.tsx`, `input.tsx`, `badge.tsx`, `card.tsx`).
- **Domain Components**: Place feature-specific views in `components/<feature>/` (e.g., `components/auth/`, `components/layout/`, `components/workbench/`).
- **Pages**: Pages in `app/` should be lightweight orchestrators that handle routing, params, and render domain components.
- **Client vs Server Components**:
  - Keep components as Server Components by default.
  - Add `"use client"` ONLY when state (`useState`), effects (`useEffect`), event handlers, or browser APIs are required.

---

## 3. Styling & Token Rules

- Use the predefined CSS tokens in `app/globals.css`:
  - `bg-dudos-primary` (`#087F79`)
  - `bg-dudos-primary-hover` (`#076E68`)
  - `bg-dudos-navy-900` (`#112C3A`)
  - `bg-dudos-navy-950` (`#101F2E`)
  - `text-dudos-accent` (`#53D3BD`)
  - `border-dudos-border` (`#DCE5E9`)
  - `bg-dudos-surface` (`#F4F7F8`)
  - `bg-dudos-surface-mint` (`#EDF7F4`)
- Standard component radii: `rounded-lg` (8px) for buttons and inputs; `rounded-xl` (12px) for cards and modals.
- Focus outlines: `focus-visible:ring-2 focus-visible:ring-dudos-focus focus-visible:ring-offset-2`.

---

## 4. Documentation Maintenance Rule

Whenever a new phase or feature is completed:
1. Update `MEMORY.md` with completed items and current progress.
2. Ensure types are exported in `@/types/`.
3. Check for any regression in the build with `pnpm run build` or `pnpm run lint`.
