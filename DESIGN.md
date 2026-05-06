---
name: bangdori.kr
description: A minimal developer blog with a clean editorial aesthetic. Light and dark themes with a single blue accent.
colors:
  primary: "#0064ff"
  on-primary: "#ffffff"
  secondary: "#f5f7fa"
  on-secondary: "#222b38"
  accent: "#e8f3ff"
  on-accent: "#0064ff"
  background: "#ffffff"
  foreground: "#222b38"
  muted: "#f5f7fa"
  muted-foreground: "#7b8a99"
  card: "#ffffff"
  on-card: "#222b38"
  border: "#e5e8eb"
  destructive: "#ff3b30"
  code-bg: "#ededeb"
  code-text: "#f47067"
typography:
  h1:
    fontFamily: Pretendard Variable
    fontSize: 2.25rem
    fontWeight: "700"
    lineHeight: 1.3
  h2:
    fontFamily: Pretendard Variable
    fontSize: 1.875rem
    fontWeight: "700"
    lineHeight: 1.3
  h3:
    fontFamily: Pretendard Variable
    fontSize: 1.5rem
    fontWeight: "700"
    lineHeight: 1.4
  body-md:
    fontFamily: Pretendard Variable
    fontSize: 1rem
    fontWeight: "400"
    lineHeight: 1.6
  body-sm:
    fontFamily: Pretendard Variable
    fontSize: 0.875rem
    fontWeight: "400"
    lineHeight: 1.5
  label-md:
    fontFamily: Pretendard Variable
    fontSize: 0.875rem
    fontWeight: "500"
    lineHeight: 1.5
  label-sm:
    fontFamily: Pretendard Variable
    fontSize: 0.75rem
    fontWeight: "400"
    lineHeight: 1.4
  label-xs:
    fontFamily: Pretendard Variable
    fontSize: 0.625rem
    fontWeight: "400"
    lineHeight: 1.4
  code:
    fontFamily: Geist Mono
    fontSize: 0.95em
    fontWeight: "500"
rounded:
  sm: 0.25rem
  DEFAULT: 0.375rem
  md: 0.5rem
  lg: 0.625rem
  xl: 1rem
  full: 9999px
spacing:
  base: 16px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
  container-max-sm: 42rem
  container-max-md: 48rem
  container-max-lg: 56rem
  container-px: 16px
  container-py: 32px
  header-height: 56px
  sticky-offset: 24px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    height: 36px
  button-primary-hover:
    backgroundColor: "{colors.primary}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    height: 36px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    height: 36px
  button-ghost-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    height: 36px
  post-card:
    backgroundColor: transparent
    textColor: "{colors.on-card}"
    rounded: "{rounded.sm}"
    padding: 4px 2px
  post-card-hover:
    backgroundColor: "{colors.secondary}"
  post-card-meta:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label-xs}"
  toc-container:
    backgroundColor: "{colors.muted}"
    rounded: "{rounded.lg}"
    padding: 24px
  bookmark-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.on-secondary}"
    rounded: "{rounded.lg}"
  code-inline:
    backgroundColor: "{colors.code-bg}"
    textColor: "{colors.code-text}"
    rounded: "{rounded.DEFAULT}"
    padding: 2px 5px
  blockquote:
    backgroundColor: "{colors.muted-foreground}"
    rounded: "{rounded.sm}"
    padding: 4px 16px
  header:
    backgroundColor: "{colors.background}"
    height: "{spacing.header-height}"
  footer:
    backgroundColor: "{colors.background}"
    textColor: "{colors.muted-foreground}"
    height: "{spacing.header-height}"
  nav-link-active:
    textColor: "{colors.primary}"
  social-icon:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
  alert-error:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.on-primary}"
  divider:
    backgroundColor: "{colors.border}"
---

## Overview

bangdori.kr is a minimal, content-first developer blog. The design philosophy is **Editorial Minimalism** — clean lines, generous whitespace, and a single accent color. The UI avoids decoration in favor of readability and fast scanning.

The blog targets a developer audience who values clarity and substance. The emotional response should be calm and focused — a well-organized notebook rather than a magazine. Light and dark themes are fully supported with matching semantic tokens.

Font: **Pretendard Variable** (Korean-optimized sans-serif) as the sole display/body font, with **Geist Mono** for code blocks. The type scale is compact and practical, never ornamental.

## Colors

The palette follows a strict two-tone + accent strategy. White/dark backgrounds are paired with a single **vivid blue** (#0064ff / #339dff) accent. The tokens below represent the light theme; dark-mode counterparts are defined in `globals.css` under `.dark`.

- **Primary (#0064ff):** The sole accent color. Used for the active nav link, focus rings, chart-1, and brand identity. In dark mode, shifts to a brighter sky blue (#339dff) for contrast.
- **Foreground (#222b38):** Deep navy-ink for all body text. Not pure black — intentionally warm.
- **Secondary (#f5f7fa):** Subtle tinted background for tags, muted panels, and hover states.
- **Muted-foreground (#7b8a99):** Used for dates, metadata, captions, and secondary text. Provides comfortable reading hierarchy without competing with body text.
- **Border (#e5e8eb):** Thin, low-contrast borders on the header and inputs.
- **Accent (#e8f3ff):** Light-blue tint for hover states and social icon backgrounds. Paired with primary text color.
- **Destructive (#ff3b30):** Error states and destructive actions.
- **Code (#ededeb bg + #f47067 text):** Inline code uses a warm gray background with a coral-red text color.

## Typography

The entire UI uses **Pretendard Variable**, a Korean-optimized variable sans-serif. Its clean geometry and excellent CJK coverage make it ideal for a bilingual developer blog. Code uses **Geist Mono**.

- **Headlines (h1–h3):** Bold (700) at 2.25rem → 1.5rem. Used only for post titles and section headings. Responsive sizing via Tailwind (`text-2xl sm:text-3xl md:text-4xl` for h1).
- **Body (body-md):** 1rem / 400 / 1.6 line-height. The primary reading experience. The `prose` plugin handles long-form article typography.
- **Labels (label-sm, label-xs):** 0.75rem–0.625rem for dates, tags, metadata, and view counts. Always in `muted-foreground` color.
- **Code (code):** Geist Mono at 0.95em / 500. Inline code gets a coral-red color on warm-gray background. Code blocks use `rehype-pretty-code` with syntax highlighting.

## Layout & Spacing

The layout is a **single-column centered container** — no sidebars, no multi-column grids. Content width is constrained to ensure comfortable reading length.

- **Container:** `max-w-2xl` (42rem) by default, stepping up to `max-w-3xl` (48rem) at md and `max-w-4xl` (56rem) at lg. Horizontal padding: 16px. Vertical padding: 32px.
- **Header:** Fixed height of 56px (`--header-height: 3.5rem`). Contains nav links on the left, site stats + theme toggle on the right. Bordered bottom.
- **Footer:** Same height as header. Centered copyright text.
- **Post list:** Simple vertical stack with 8px gaps (`grid gap-2`). Each row is a single horizontal line: title + tag + comment count on the left, date on the right.
- **Article:** Vertical stack with 32px section gaps. Table of contents in a muted panel above the prose body.
- **Sticky offset:** `--sticky-offset: 1.5rem` — used for heading scroll margin so anchored headings don't hide under the header.

## Shapes

The shape language is **subtly rounded** — never sharp, never pill-shaped. Corner radii are small and functional.

- **Base radius:** `--radius: 0.625rem` (10px). All other radii derive from this via calc.
- **Buttons:** `rounded-md` (8px). Standard shadcn/ui default.
- **Cards/TOC:** `rounded-lg` (10px). Used for the table of contents panel and bookmark cards.
- **Post list items:** `rounded-sm` (6px). Minimal rounding on hover background.
- **Inline code:** `rounded` (0.3rem). Slightly rounded pill for inline code snippets.
- **Profile image:** `rounded-full` on the about page.
- **Blog images:** `rounded-lg` for all images and videos in prose content.

## Components

### Header

A clean horizontal bar with bottom border. Left side: nav links ("blog", "about") styled as plain text — active link in `primary` color, others gain `primary` on hover. Right side: site stats (visitor count) and a theme toggle dropdown button (outline variant).

### PostCard

A single-line row component. Title (base / medium weight) + tag label (10px, muted) + optional comment count on the left. Formatted date (xs, muted) on the right. The entire row is wrapped in a link with a subtle hover background (`hover:bg-gray-100 dark:hover:bg-gray-800`).

### CodeBlock

A `<pre>` wrapper with a copy-to-clipboard button. The button (gray-800 bg, white text) appears on group hover in the top-right corner. Uses `rehype-pretty-code` for syntax highlighting. Copy feedback swaps the clipboard icon for a green checkmark.

### Bookmark

An OG-card style link preview. Bordered container (`rounded-lg`) with title, description, favicon, and optional thumbnail image. Three states: loading (skeleton animation), error/blocked (favicon + URL fallback), and full (title + description + image). Hover state shifts background to `neutral-50`/`neutral-800`.

### Table of Contents

A muted panel (`bg-muted/60`, `rounded-lg`, `p-6`) with `backdrop-blur-sm`. Contains a "📚 목차" heading and a list of section links. Placed above the article body.

### Footer

Minimal centered bar matching header height. Single line of copyright text in `muted-foreground` at `text-xs`.

### ThemeToggle

A shadcn/ui `DropdownMenu` with an outline icon button trigger. Sun/Moon icons rotate and scale on theme transition. Three options: Light, Dark, System.

### About Page

Centered layout with a circular profile image (160×160, `rounded-full`), a bio paragraph in `muted-foreground`, a company link, and a row of social icon buttons (ghost variant with `bg-primary/10` background).

## Do's and Don'ts

### Do:
- **Do** use `primary` (#0064ff / #339dff) only for interactive elements — active nav links, focus rings, and brand accents. Never for body text or large surfaces.
- **Do** use `muted-foreground` for all secondary text (dates, metadata, captions). It provides consistent hierarchy across themes.
- **Do** use the `prose` Tailwind plugin for all long-form article content. It handles headings, lists, links, and paragraph spacing.
- **Do** keep the single-column layout. Content should never exceed `max-w-4xl` (56rem).
- **Do** support both light and dark themes. Every new color must have a dark-mode counterpart.
- **Do** use Pretendard Variable for all UI text. No mixing of display fonts.
- **Do** maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text).
- **Do** use semantic color tokens (`bg-background`, `text-foreground`, `border-border`) rather than raw hex values.

### Don't:
- **Don't** introduce additional accent colors. The single blue accent is intentional — it provides visual identity without complexity.
- **Don't** use shadows for cards or elevation. The design is flat with tonal differentiation (background vs. card vs. muted).
- **Don't** add decorative elements, gradients, or illustrations. The blog is content-first.
- **Don't** use `text-black` or `text-white` directly. Always use semantic tokens (`text-foreground`, `text-muted-foreground`).
- **Don't** make buttons pill-shaped (`rounded-full`). Buttons use `rounded-md` consistently.
- **Don't** use hardcoded pixel values for spacing. Use Tailwind's spacing scale which aligns with the 4px/8px grid.
- **Don't** mix font families. Pretendard for UI, Geist Mono for code. No exceptions.
- **Don't** override `prose` styles with one-off hacks. If the prose plugin doesn't cover a case, extend it in `globals.css`.
