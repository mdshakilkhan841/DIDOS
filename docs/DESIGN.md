# DUDOS — Design System & Visual Specification

> **Source Reference**: Management Approved Design (`dudos/color template/DUDOS_COLOR_SYSTEM.md`)  
> **Brand Palette**: Deep Navy + DUDOS Teal + Mint + Cool Gray  
> **Target Ratio**: 70% Light Surfaces & White Space | 20% Deep Navy Structural Contrast | 10% Teal & Mint Accents  

---

## 1. Color Palette Tokens

### 1.1 Brand & Action Colors

| Token Name | CSS Variable | Hex Code | Visual Role |
|---|---|---|---|
| **Primary** | `--dudos-primary` | `#087F79` | Primary action buttons, active navigation, hyperlinks, brand accents |
| **Primary Hover** | `--dudos-primary-hover` | `#076E68` | Hover/active states on primary elements |
| **Primary Soft** | `--dudos-primary-soft` | `#EDF7F4` | Light tinted badges, active table rows, subtle button backgrounds |
| **Accent Mint** | `--dudos-accent` | `#53D3BD` | Vibrant highlights on dark surfaces, progress indicators, selected badges |
| **Accent Soft** | `--dudos-accent-soft` | `#71D4BB` | Light accents, call-to-actions placed over deep navy panels |

### 1.2 Dark Structural Surfaces

| Token Name | CSS Variable | Hex Code | Visual Role |
|---|---|---|---|
| **Navy 950** | `--dudos-navy-950` | `#101F2E` | Deepest sidebar background, terminal bars |
| **Navy 900** | `--dudos-navy-900` | `#112C3A` | Primary dark surface, hero panels, split-screen auth brand panel |
| **Navy 800** | `--dudos-navy-800` | `#183543` | Dark card containers, elevated dark surfaces |
| **Navy 700** | `--dudos-navy-700` | `#223B4B` | Subtle dividers and secondary borders on dark surfaces |
| **Navy 600** | `--dudos-navy-600` | `#39515D` | Muted dark accents and icon tints on dark panels |

### 1.3 Text & Content Colors

| Token Name | CSS Variable | Hex Code | Visual Role |
|---|---|---|---|
| **Ink (Body)** | `--dudos-text` | `#162C38` | Primary high-contrast body text, headings on light surfaces |
| **Text Secondary** | `--dudos-text-secondary` | `#5B6F7B` | Secondary descriptions, form labels, metadata |
| **Text on Dark** | `--dudos-text-on-dark` | `#FFFFFF` | Text on Navy 900/950 surfaces and Primary buttons |
| **Text on Dark Muted** | `--dudos-text-on-dark-muted` | `#B1C6D0` | Descriptions and captions on dark hero banners and auth panels |

### 1.4 Neutral Surfaces & Borders

| Token Name | CSS Variable | Hex Code | Visual Role |
|---|---|---|---|
| **Surface White** | `--dudos-bg` | `#FFFFFF` | Page canvas, card backgrounds, modal content |
| **Surface Gray** | `--dudos-surface` | `#F4F7F8` | Page sections, table headers, footer, outer canvas |
| **Surface Alt** | `--dudos-surface-alt` | `#F2F8F7` | Light hover state on table rows and secondary buttons |
| **Surface Mint** | `--dudos-surface-mint` | `#EDF7F4` | Icon badges, positive summary counters, selected rows |
| **Border Cool Gray** | `--dudos-border` | `#DCE5E9` | Card borders, input field borders, table cell dividers |

### 1.5 Semantic Feedback Colors

| Tone | Base Color | Soft Background | Icon / Text Usage |
|---|---|---|---|
| **Success** | `#087F79` | `#E8F5F1` | Verified status, completed tasks, successful saves |
| **Warning** | `#B78615` | `#FFF9DA` | Pending approval, caution notices, rate limits |
| **Error** | `#9E291E` | `#FFF4F4` | Form errors, rejected builds, destructive confirmations |
| **Info** | `#215465` | `#EFF5F8` | Informational callouts, system tips, version badges |

---

## 2. Component Design Specifications

### 2.1 Buttons
- **Primary Button**: `bg-[#087F79] hover:bg-[#076E68] text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#21A699]`
- **Secondary Button**: `bg-white hover:bg-[#F2F8F7] text-[#162C38] border border-[#DCE5E9] font-medium px-4 py-2 rounded-lg shadow-sm transition-all`
- **Outline Button**: `bg-transparent hover:bg-[#EDF7F4] text-[#087F79] border border-[#087F79]/30 font-medium px-4 py-2 rounded-lg transition-all`
- **Ghost Button**: `bg-transparent hover:bg-[#F4F7F8] text-[#5B6F7B] hover:text-[#162C38] font-medium px-3 py-1.5 rounded-lg transition-all`

### 2.2 Split-Screen Authentication Panel
- **Left Panel (Brand)**:
  - Background: `#112C3A` (Deep Navy) with radial glow blobs (`bg-[#087F79]/20` and `bg-[#53D3BD]/10`).
  - Logo: Teal/Mint rounded square `D` icon + white DUDOS lettering.
  - Tagline: *"Your digital work, organized in one workspace."*
  - Highlights: Checkmarks in `#53D3BD` (Mint) with white descriptive items.
- **Right Panel (Form)**:
  - Clean white canvas with max-w-md centered form.
  - Stakeholder role selector with pill/card toggle.
  - Clean input styling with clear label hierarchy and Sonner toast triggers.

### 2.3 Cards & Data Containers
- White background (`#FFFFFF`) with `#DCE5E9` border and `rounded-xl`.
- Subtle drop shadow: `shadow-[0_1px_3px_rgba(16,31,46,0.04)]`.
- Hover behavior: Subtle border shift to `border-[#087F79]/50` and micro-elevation.

### 2.4 Tables & Lists
- Table Header: `bg-[#F4F7F8] text-[#5B6F7B] text-xs font-semibold uppercase tracking-wider`.
- Table Rows: Alternating or white with `hover:bg-[#F2F8F7]` transition.
- Selected Row: `bg-[#E1F3ED] border-l-4 border-l-[#087F79]`.

---

## 3. Typography & Hierarchy

- **Font Family**: Inter, Geist, or modern system UI sans-serif (`font-sans`).
- **Heading 1**: `text-3xl md:text-4xl font-semibold tracking-tight text-[#162C38]`
- **Heading 2**: `text-2xl font-semibold tracking-tight text-[#162C38]`
- **Heading 3**: `text-lg font-semibold text-[#162C38]`
- **Body Regular**: `text-sm text-[#162C38] leading-relaxed`
- **Body Muted / Secondary**: `text-sm text-[#5B6F7B]`
- **Caption / Meta**: `text-xs text-[#5B6F7B] font-medium`
