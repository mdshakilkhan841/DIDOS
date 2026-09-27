# DUDOS Color System

> Derived from the current DUDOS codebase (`app/globals.css`, `app/dudos.css`, and `components/builder/builder.css`). This document separates the **existing source colors** from a **normalized reusable token set**.

## 1. Brand Identity

DUDOS visually uses a **Deep Navy + Teal + Mint + Cool Gray** system.

| Role | Color | Hex | Typical use |
|---|---|---:|---|
| Brand Primary | DUDOS Teal | `#087F79` | Primary buttons, links, active states, highlights, brand mark |
| Brand Primary Dark | Deep Teal | `#076E68` | Hover/pressed states, darker links |
| Brand Accent | Mint | `#53D3BD` | Sidebar emphasis, progress, selected elements |
| Accent Soft | Light Mint | `#71D4BB` | CTA on dark surfaces |
| Brand Dark | Deep Navy | `#112C3A` | Hero panels, dark sections, major contrast surfaces |
| Sidebar Dark | Navy Black | `#101F2E` | Main application sidebar |
| Ink | Blue Charcoal | `#162C38` | Primary body text |
| Muted Text | Slate | `#5B6F7B` | Secondary text, descriptions, metadata |
| Border | Cool Gray | `#DCE5E9` | Cards, separators, form borders |
| Surface | Soft Gray | `#F4F7F8` | Footer, page sections, app background |
| Surface Mint | Pale Mint | `#EDF7F4` | Icon backgrounds, success/selected surfaces |
| White | White | `#FFFFFF` | Cards and primary content surfaces |

## 2. Recommended Reusable Tokens

These tokens normalize the colors already present in the project so future screens remain consistent.

```css
:root {
  /* Brand */
  --dudos-primary: #087f79;
  --dudos-primary-hover: #076e68;
  --dudos-primary-soft: #edf7f4;
  --dudos-accent: #53d3bd;
  --dudos-accent-soft: #71d4bb;

  /* Dark brand surfaces */
  --dudos-navy-950: #101f2e;
  --dudos-navy-900: #112c3a;
  --dudos-navy-800: #183543;
  --dudos-navy-700: #223b4b;
  --dudos-navy-600: #39515d;

  /* Text */
  --dudos-text: #162c38;
  --dudos-text-secondary: #5b6f7b;
  --dudos-text-on-dark: #ffffff;
  --dudos-text-on-dark-muted: #b1c6d0;

  /* Surfaces */
  --dudos-bg: #ffffff;
  --dudos-surface: #f4f7f8;
  --dudos-surface-alt: #f2f8f7;
  --dudos-surface-mint: #edf7f4;
  --dudos-border: #dce5e9;

  /* Semantic */
  --dudos-success: #087f79;
  --dudos-success-soft: #e8f5f1;
  --dudos-warning: #b78615;
  --dudos-warning-soft: #fff9da;
  --dudos-error: #9e291e;
  --dudos-error-soft: #fff4f4;
  --dudos-info: #215465;
  --dudos-info-soft: #eff5f8;

  /* Focus */
  --dudos-focus: #21a699;
}
```

## 3. Suggested Color Scale

### Teal

| Token | Hex |
|---|---:|
| Teal 50 | `#EDF7F4` |
| Teal 100 | `#DCEFE8` |
| Teal 200 | `#C8E6DC` |
| Teal 300 | `#8CE0CD` |
| Teal 400 | `#71D4BB` |
| Teal 500 | `#53D3BD` |
| Teal 600 | `#21A699` |
| Teal 700 | `#087F79` |
| Teal 800 | `#076E68` |
| Teal 900 | `#145A50` |

### Navy / Ink

| Token | Hex |
|---|---:|
| Navy 50 | `#F4F8F9` |
| Navy 100 | `#E1E8EC` |
| Navy 300 | `#A7BFC5` |
| Navy 500 | `#5B6F7B` |
| Navy 600 | `#39515D` |
| Navy 700 | `#223B4B` |
| Navy 800 | `#183543` |
| Navy 900 | `#112C3A` |
| Navy 950 | `#101F2E` |

## 4. Component Usage

### Primary Button
- Background: `#087F79`
- Text: `#FFFFFF`
- Hover: `#076E68`
- Focus ring: `#21A699`

### Secondary Button
- Background: `#FFFFFF`
- Text: `#162C38`
- Border: `#DCE5E9`
- Hover surface: `#F2F8F7`

### Dark CTA / Hero Panel
- Background: `#112C3A`
- Heading: `#FFFFFF`
- Paragraph: `#B1C6D0`
- Accent: `#71D4BB`

### Cards
- Background: `#FFFFFF`
- Border: `#DCE5E9`
- Heading: `#162C38`
- Body: `#5B6F7B`
- Hover border: `#087F79`
- Hover background: `#F6FBFA`

### Active / Selected Row
- Background: `#E1F3ED`
- Left accent: `#087F79`
- Strong text: `#162C38`

### Sidebar
- Background: `#101F2E` or `#112C3A`
- Text: `#E7F1F3`
- Selected/accent: `#53D3BD`
- Divider: `#2B4050`

## 5. Semantic States

| State | Main | Soft Background | Suggested use |
|---|---:|---:|---|
| Success / Complete | `#087F79` | `#E8F5F1` | Successful builds, completed tasks, active status |
| Warning / Review | `#B78615` | `#FFF9DA` | Approval needed, review state, caution |
| Error / Failed | `#9E291E` | `#FFF4F4` | Validation errors, failed builds |
| Information | `#215465` | `#EFF5F8` | Help, system information, neutral notices |

## 6. Builder-Specific Preview Themes

The Builder contains optional visual styles for generated websites. These are **not the main DUDOS product brand**.

| Theme | Main Accent | Dark | Soft Surface |
|---|---:|---:|---:|
| Ocean / default | `#087D73` | `#0D3342` | `#E9F5F0` |
| Midnight | `#4B51BB` | `#171E39` | `#ECEDFA` |
| Ember | `#A43F23` | `#3F2521` | `#FFF0E8` |
| Teal | Uses the core teal family | Deep teal/navy | Pale mint |

## 7. Recommended Rule

For the **DUDOS platform itself**, keep approximately:

- **70%** white / cool neutral surfaces
- **20%** navy / dark structural surfaces
- **10%** teal / mint accents

Use teal mainly for actions, active states, links, progress, selection, and brand emphasis. Avoid filling large content areas with strong teal because the current UI identity relies on white space and deep navy contrast.

## 8. Current-Code Note

`app/globals.css` includes a generic grayscale automatic dark mode. It does not fully follow the DUDOS teal/navy identity. If a branded dark mode is required later, it should be normalized around `#101F2E`, `#112C3A`, `#223B4B`, `#53D3BD`, and `#E7F1F3` instead of the current neutral grayscale palette.
