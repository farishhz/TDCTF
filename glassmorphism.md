Act as a Senior Frontend Engineer and Expert UI Designer.
Your task is to code a complete Landing Page on the first attempt.
- Landing Page Theme: <INSERT THEME>
- Sections to add: <INSERT SECTIONS>

Generate the final code immediately following these definitions:

## Style

- **Name:** Glassmorphism
- **Type:** Translucent, Layered, Vibrant, Blurred
- **Keywords:** Frosted glass, transparent, blurred background, layered, vibrant background, light source, depth, multi-layer
- **Era:** 2020s Modern
- **Light/Dark:** ✓ Full / ✓ Full

## Color Palette

- **Primary:** Translucent white: rgba(255,255,255,0.1-0.3)
- **Secondary:** Vibrant: Electric Blue #0080FF, Neon Purple #8B00FF, Vivid Pink #FF1493, Teal #20B2AA

## Visual Effects

Backdrop blur (10-20px), subtle border (1px solid rgba white 0.2), light reflection, Z-depth

## AI Visual Direction

Design a glassmorphic interface with frosted glass effect. Use backdrop blur (10-20px), translucent overlays (rgba 10-30% opacity), vibrant background colors, subtle borders, light source reflection, layered depth. Perfect for modern overlays and cards.

## CSS Technical

```css
backdrop-filter: blur(15px), background: rgba(255, 255, 255, 0.15), border: 1px solid rgba(255,255,255,0.2), -webkit-backdrop-filter: blur(15px), z-index layering for depth
```

## Design System Variables

```css
--blur-amount: 15px, --glass-opacity: 0.15, --border-color: rgba(255,255,255,0.2), --background: vibrant color, --text-color: light/dark based on BG
```

## Implementation Checklist

- ☐ Backdrop-filter blur 10-20px
- ☐ Translucent white 15-30% opacity
- ☐ Subtle border 1px light
- ☐ Vibrant background verified
- ☐ Text contrast 4.5:1 checked

## Execution Rules

1. Strictly follow the defined visual style.
2. Use high-quality inline SVG icons (Heroicons or Lucide style) — NEVER use emojis as icons.
3. Add `cursor-pointer` and smooth `hover` states (transition-all) on all interactive elements.
4. Required Page Structure:
   - Navbar (Logo + Links + CTA)
   - Hero Section (Impactful Headline + Subtitle + 2 buttons + 3D/Abstract visual element via CSS)
   - Features (3 cards with icons)
   - Testimonials (3 cards)
   - Pricing (3 tiers, highlight the middle one)
   - Final CTA
   - Full Footer with social links, privacy policy, terms of use, contact and SEO links.
5. All text content must be in English.
6. The visual must be CLEARLY distinct — do not create a "default Bootstrap" design. Force the use of the provided design system variables.
7. Use `<style>` tags in the head for custom classes (especially for complex backdrop-filter effects and animations) that Tailwind CDN doesn't cover.
8. Full Responsiveness: Layout must adapt perfectly to Mobile, Tablet and Desktop (vertical stack on mobile).
9. Include basic SEO, Viewport and Open Graph meta tags in `<head>`.
10. Footer must contain: Copyright 2026, Secondary navigation links and Social media icons.
11. Make the creative decisions needed to deliver the complete, functional result now.