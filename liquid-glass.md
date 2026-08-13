---
version: "alpha"
name: "Liquid Glass"
description: "Premium liquid glass effect with morphing shapes, flowing animations, chromatic aberration, iridescent gradients, smooth 400-600ms transitions. Ideal for landing pages, saas. AI-ready template."
colors:
  primary: "#1A1A1A"
  secondary: "#4A4A4A"
  tertiary: "#0066FF"
  neutral: "#FFFFFF"
typography:
  h1:
    fontFamily: System UI stack
    fontSize: 2.25rem
    fontWeight: 700
  body-md:
    fontFamily: System UI stack
    fontSize: 1rem
    fontWeight: 400
  label-caps:
    fontFamily: System UI stack
    fontSize: 0.75rem
    fontWeight: 500
---

## Overview

Premium liquid glass effect with morphing shapes, flowing animations, chromatic aberration, iridescent gradients, smooth 400-600ms transitions. Ideal for landing pages, saas. AI-ready template. Glassmorphism landed around 2020 as a static effect — frosted panels, backdrop-blur, maybe a subtle border. It looked gorgeous in Dribbble shots and fell apart in production. The blur was expensive, the layering was fragile, and honestly? It got stale fast. But the underlying idea — depth through translucency — had legs.

Apple pushed it forward with visionOS in 2023. Their fluid materials weren't just blurred backgrounds; they morphed, responded to light, shifted with viewing angle. Suddenly glass wasn't a surface treatment, it was a living material. That changed the conversation entirely. Designers started asking: what if the glass itself moved?

CSS @property and Houdini made it buildable. You could finally animate gradient stops, interpolate complex values, create organic shape transitions without JavaScript hammering the main thread. By 2025 the tooling caught up to the vision. Then Apple went all-in with iOS 26's Liquid Glass system-wide, and the pattern graduated from experimental to expected. In 2026, this is the premium default — not a trend, but infrastructure.

- Density: 5/10 — Balanced
- Variance: 4/10 — Moderate
- Motion: 6/10 — Expressive

- **Style:** Translucent, Fluid, Reflective, Modern
- **Keywords:** Flowing glass, morphing, smooth transitions, fluid effects, translucent, animated blur, iridescent, chromatic aberration
- **Era:** 2020s Modern
- **Light/Dark:** ✓ Full / ✓ Full

## Colors

- Palette derived from style keywords and era context


## Typography

- **Display / Hero:** System UI stack (-apple-system, sans-serif) — Weight 700, tight tracking, used for headline impact
- **Body:** System UI stack (-apple-system, sans-serif) — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** System UI stack (-apple-system, sans-serif) — 0.875rem, weight 500, slight letter-spacing
- **Monospace:** JetBrains Mono — Used for code, metadata, and technical values

Scale:
- Hero: clamp(2.5rem, 5vw, 4rem)
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem


## Layout

- **Grid:** CSS Grid primary. Max-width containment: 1280px centered with 1.5rem side padding.
- **Spacing rhythm:** Balanced. Base unit: 0.5rem (8px).
- **Section vertical gaps:** clamp(4rem, 8vw, 8rem).
- **Hero layout:** Split-screen (text left, visual right).
- **Feature sections:** Zig-zag alternating text+image rows. No 3-equal-columns.
- **Mobile collapse:** All multi-column layouts collapse below 768px. No horizontal overflow.
- **z-index contract:** base (0) / sticky-nav (100) / overlay (200) / modal (300) / toast (500).


## Elevation & Depth

Morphing elements (SVG/CSS), fluid animations (400-600ms curves), dynamic blur (backdrop-filter), color transitions

- **Physics:** Spring — stiffness 120, damping 20. Confident, weighted transitions.
- **Entry animations:** Fade + translate-Y (16px → 0) over 480ms ease-out. Staggered cascades for lists: 100ms between items.
- **Hover states:** Scale(1.03) + shadow lift over 200ms.
- **Page transitions:** Fade + slide (300ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.


## Shapes

Base corner radius: 12px. See rounded tokens in front matter for the full scale.


## Components

- **Primary Button:** Moderately rounded (0.75rem) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Moderately rounded (0.75rem) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
- **Inputs:** Label above input. 1px border stroke. Focus ring: 2px accent color offset 2px. Error text below in semantic red. No floating labels.
- **Navigation:** Primary surface background. Active item: accent color indicator. Font weight 500 when active.
- **Skeletons:** Shimmer animation matching component dimensions. No circular spinners.
- **Empty States:** Icon-based composition with descriptive text and action button.


## Do's and Don'ts

- No emojis in UI — use icon system only (Lucide, Heroicons)
- No pure black (#000000) — use off-black or charcoal variants
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos

- Do Morphing animations 400-600ms
- Do Chromatic aberration applied
- Do Dynamic blur active
- Do Iridescent gradients
- Do Smooth color transitions
- Do Premium feel achieved


## Use Case

Landing pages, SaaS
