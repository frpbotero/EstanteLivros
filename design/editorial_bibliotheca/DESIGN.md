---
name: Editorial Bibliotheca
colors:
  surface: '#f3fbf8'
  surface-dim: '#d3dcd9'
  surface-bright: '#f3fbf8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf5f2'
  surface-container: '#e7f0ec'
  surface-container-high: '#e2eae7'
  surface-container-highest: '#dce4e1'
  on-surface: '#151d1b'
  on-surface-variant: '#3f4947'
  inverse-surface: '#2a3230'
  inverse-on-surface: '#eaf3ef'
  outline: '#6f7977'
  outline-variant: '#bec9c6'
  surface-tint: '#176a60'
  primary: '#00453e'
  on-primary: '#ffffff'
  primary-container: '#005f56'
  on-primary-container: '#8cd6ca'
  inverse-primary: '#8ad4c8'
  secondary: '#45645d'
  on-secondary: '#ffffff'
  secondary-container: '#c8eae1'
  on-secondary-container: '#4b6a63'
  tertiary: '#7c0d14'
  on-tertiary: '#ffffff'
  tertiary-container: '#9d2728'
  on-tertiary-container: '#ffb6b1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a6f1e4'
  primary-fixed-dim: '#8ad4c8'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005048'
  secondary-fixed: '#c8eae1'
  secondary-fixed-dim: '#accdc5'
  on-secondary-fixed: '#00201b'
  on-secondary-fixed-variant: '#2e4c46'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ae'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#8b191d'
  background: '#f3fbf8'
  on-background: '#151d1b'
  surface-variant: '#dce4e1'
typography:
  headline-xl:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Newsreader
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Newsreader
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system is crafted for a sophisticated, modern literary management and book-sharing platform. It merges the tactile, warm authority of a traditional independent library with the frictionless utility of contemporary product design.

### Design Movement & Aesthetic
The style is **Modern Editorial Minimalism**. It pairs high-contrast literary serif typography with utilitarian sans-serif UI elements, set over a warm, tactile paper-white foundation. 

### Key Principles
- **Literary Authority:** Evoking the quiet reverence of curated archives and printed editions without feeling antiquated.
- **Utilitarian Clarity:** High-contrast text, clear visual hierarchy, and precise spacing ensure that managing loans, cataloging volumes, and tracking returns is effortless on handheld screens.
- **Tactile Warmth:** Eliminating cold synthetic whites in favor of warm paper tones, complemented by deep mineral emeralds and soft sage neutrals.

## Colors

The palette establishes an organic, literary tone centered on deep botanical emeralds, muted olive-sage secondary tones, warm paper grounds, and an urgent coral alert tone for overdue lending status.

### Color Roles
- **Primary (`#005F56`):** Deep emerald/teal. Applied to primary CTAs, active segmented filters, key links, brand focal points, and focused navigation states.
- **Secondary (`#4C6B64`):** Soft slate pine. Used for secondary action buttons, inactive chip borders, iconography, and contextual badges.
- **Tertiary / Alert (`#D9534F`):** Coral terracotta. Reserved for overdue loan states, destructive confirmations, and critical inventory warnings.
- **Neutral Primary (`#2B3331`):** Deep charcoal olive. Provides crisp, high-contrast legibility for titles and body text without the harshness of pure black.
- **Neutral Background Canvas:** `#FBFCFB` (Warm Paper) with an interior card surface of `#FFFFFF` and elevated bottom sheet tone of `#F8FAF9`.
- **Borders & Dividers:** Soft neutral parchment border (`#E5ECE9`), maintaining structure without visual noise.

### Status Indicators
- **Disponível (Available):** Forest tint pill (`#E6F4F1` background, `#005F56` text).
- **Emprestado (Loaned):** Muted sand/amber tint pill (`#FEF6E9` background, `#8C5815` text).
- **Pendente (Pending):** Soft slate tint pill (`#EEF2F1` background, `#4C6B64` text).
- **Atrasado (Overdue):** Coral alert pill (`#FDECEA` background, `#D9534F` text).

## Typography

The type system creates an editorial dichotomy between literary serif headers and rational, highly legible geometric sans-serif body copy.

- **Display & Headlines (`Newsreader`):** Optical serif with sturdy serifs, high contrast, and warm terminals. Used for page titles, section landmarks (e.g., "Acervo", "Reservas"), and book titles.
- **Body, UI, & Metadata (`Plus Jakarta Sans`):** Clean, humanist sans with open apertures. Ensures effortless scanning in book descriptions, input fields, tables, and dense loan metadata.
- **Case & Styling:** Pill badges and category markers use `label-sm` or `label-md` with slight letter tracking for rapid recognition.

## Layout & Spacing

A mobile-first fluid layout architecture optimized for handheld book browsing that expands into an organized editorial multi-column grid on desktop screens.

### Grid & Canvas Structure
- **Mobile (< 768px):** Single-column fluid container with a consistent outer margin of `1rem` (`16px`). Bottom-affixed action bars and bottom sheets take priority over nested navigation.
- **Tablet (768px - 1024px):** 6-column grid with `1.5rem` outer margins. Book collections render in a 2-column card arrangement.
- **Desktop (1024px+):** 12-column grid constrained to a max-width of `1200px` with `2.5rem` outer canvas margins. Collections reflow into 3- or 4-column catalog displays.

### Spacing Rhythm
- **Micro Spacing (`0.25rem` – `0.5rem`):** Icon-to-label gaps, chip padding, badge internal offsets.
- **Component Spacing (`1rem`):** Internal padding for inputs, list tiles, and book cards.
- **Section Spacing (`1.5rem` – `2.5rem`):** Separation between search modules, category filter tracks, and shelf sections.

## Elevation & Depth

Visual depth is achieved through tactile, low-opacity ambient shadows paired with razor-thin hairline borders, evoking crisp physical cardstock.

### Depth Tiers
- **Surface Level 0 (Base Canvas):** `#FBFCFB`. Flat, warm paper background.
- **Surface Level 1 (Card & Content Blocks):** `#FFFFFF` bordered by a 1px solid `#E5ECE9` outline. Subtle ambient cast: `0px 2px 6px rgba(0, 40, 35, 0.04)`.
- **Surface Level 2 (Sticky Headers & Navigation):** Blurry paper backdrop filter (`rgba(251, 252, 251, 0.88)` with `backdrop-filter: blur(12px)`) anchored with a border bottom `1px solid #E5ECE9`.
- **Surface Level 3 (Dropdowns & Popovers):** Elevated card surface with `0px 8px 24px rgba(0, 40, 35, 0.08)`.
- **Surface Level 4 (Bottom Sheets & Modals):** Top sheet radius with heavy soft scrim (`rgba(20, 30, 28, 0.45)`) and shadow `0px -8px 32px rgba(0, 40, 35, 0.12)`.

## Shapes

The design system uses moderate, balanced roundedness (`roundedness: 2`, `8px` / `0.5rem` default) to balance architectural rigor with approachable tactility.

### Shape Hierarchy
- **Base Components (`rounded-md`, 8px):** Form input fields, book card containers, action buttons, and modal dialog windows.
- **Secondary Containers (`rounded-lg`, 16px):** Featured hero cards, auth dialog boxes, and floating navigation menus.
- **Sheets & Drawer Sheets (`rounded-t-xl`, 24px top radius):** Bottom sheets for book details, lending forms, and filter drawer panels.
- **Status Pills & Chips (`rounded-full`, 9999px):** All interactive category filters and loan status pills ("Disponível", "Emprestado", "Pendente") retain full pill radiuses for rapid touch recognition.

## Components

### Buttons
- **Primary Action:** Solid `#005F56` emerald fill with `#FFFFFF` text in `label-lg`. 48px standard touch height, `rounded-md` (8px). Hover transitions smoothly to `#004D40`.
- **Secondary Action:** Outlined `#4C6B64` or soft slate fill (`#EEF2F1`) with `#2B3331` text. Used for secondary tools like "Relatório" or "Adicionar".
- **Ghost Action:** Pure transparent background with `#005F56` text and subtle underline on hover; used for text links like "Ainda não tenho conta".

### Input Fields & Search Bars
- Standard input fields feature a 48px height, a crisp `1px solid #E5ECE9` border, a clean `#FFFFFF` ground, and 16px horizontal padding.
- Focus state switches the border to `2px solid #005F56` with a faint `3px` focus ring tinted in `rgba(0, 95, 86, 0.15)`.
- Search bars include an embedded leading search icon (`20px`, `#4C6B64`) and an optional trailing clear button.

### Status Pills & Segmented Filters
- **Filter Chips:** Horizontally scrollable row on mobile. Inactive chips use a transparent background, `1px solid #E5ECE9`, and `#4C6B64` text. The active chip utilizes solid `#005F56` fill with crisp white text.
- **Status Pills:** Compact (`label-sm`), featuring high-contrast tinted pairings:
  - *Disponível:* Light teal (`#E6F4F1`) with `#005F56` typography.
  - *Emprestado:* Warm wheat (`#FEF6E9`) with `#8C5815` typography.
  - *Pendente:* Neutral stone (`#EEF2F1`) with `#4C6B64` typography.
  - *Atrasado:* Soft coral (`#FDECEA`) with `#D9534F` typography.

### Book Cards
- Formatted with a clean card container: book cover aspect ratio 2:3 with an inner `1px` inner shadow simulating page edges.
- Adjacent or stacked container featuring title in `headline-sm` (`Newsreader`), author in `body-sm` (`#4C6B64`), and status pill positioned at the bottom left or top right corner.

### Bottom Sheets & Modals
- **Mobile Bottom Sheet:** Draggable handle bar (`36px × 4px`, `#D1DDD9`), rounded top corners (`24px`), backdrop scrim `rgba(20, 30, 28, 0.45)`. Contains full lending history, borrower contact details, and checkout actions.
- **Desktop Modal:** Centered 480px–600px surface container, `rounded-lg` (16px), subtle ambient drop shadow.

### Sticky Navigation Header
- Compact 56px height, pinned to the top of the viewport. Translucent paper base (`rgba(251, 252, 251, 0.9)`) with blur.
- Minimalist layout displaying the centered editorial brandmark, quick search trigger, and public link sharing action button.