# DESIGN.md

# TDCTF

## Performance, Mobile-First, SEO & Entity Architecture

> This document defines the engineering rules for the existing TDCTF Capture The Flag platform.
>
> It is an optimization specification, NOT a redesign specification.

---

# 1. PRIMARY WEBSITE ENTITY

The primary entity of this website is:

```text
TDCTF
```

Primary semantic meaning:

```text
TDCTF
Capture The Flag
CTF Platform
Cybersecurity Learning
CTF Challenges
CTF Competition
CTF Community
```

Secondary associated entity:

```text
Alfarisi Azmir
```

Relationship:

```text
Alfarisi Azmir
        ↓
Founder / Developer
        ↓
TDCTF
        ↓
Capture The Flag Platform
```

This relationship should exist because it is factually represented by the website, not merely because it is useful for SEO.

---

# 2. CORE OBJECTIVE

TDCTF must remain visually identical while becoming technically better.

```text
Existing TDCTF UI
        +
Performance Optimization
        +
Technical SEO
        +
Accessibility
        +
Better Resource Loading
        ↓
Optimized TDCTF
```

---

# 3. PERFORMANCE PRIORITY

Priority:

```text
1. Mobile
2. First load
3. Interaction responsiveness
4. Scroll smoothness
5. Core Web Vitals
6. Desktop
7. Secondary optimizations
```

---

# 4. MOBILE-FIRST

Required testing:

```text
390 × 844
412 × 915
```

Desktop:

```text
1366 × 768
1440 × 900
1920 × 1080
```

Mobile testing must include:

```text
Cold cache
Warm cache
CPU throttling
Network throttling
Scrolling
Touch interaction
Navigation
Challenge interaction
```

---

# 5. CORE WEB VITALS

Primary:

```text
LCP ≤ 2.5s
INP ≤ 200ms
CLS ≤ 0.1
```

Lab reports should also include:

```text
FCP
LCP
TBT
CLS
Speed Index
```

INP must not be fabricated from a page-load-only Lighthouse result.

---

# 6. INITIAL LOAD

The initial load should prioritize:

```text
HTML
Critical CSS
Critical fonts
LCP content
Necessary JavaScript
Critical interaction
```

Avoid loading:

```text
Large videos
Heavy dashboards
Non-critical API data
Unnecessary analytics
Unused JavaScript
Below-the-fold heavy resources
```

---

# 7. MEDIA STRATEGY

Large media is treated as an expensive resource.

Especially:

```text
MP4
WebM
Large animated assets
```

No large non-critical video should be downloaded simply because it exists in the DOM.

Preferred lifecycle:

```text
Page load
↓
Do not download non-critical video
↓
User approaches content
↓
Determine whether media is needed
↓
User interacts / relevant state
↓
Load media
```

---

# 8. JAVASCRIPT

Prefer:

```text
Server rendering
Small client boundaries
Dynamic imports
Code splitting
Deferred work
Lazy loading
Memoization when justified
```

Avoid:

```text
Massive global client bundles
Unnecessary hydration
Repeated API calls
Aggressive polling
Large synchronous work
```

---

# 9. CHALLENGE SYSTEM

Challenge pages may be significantly heavier than the homepage.

Optimize so that:

```text
Homepage
```

does not unnecessarily download resources required only for:

```text
Challenge detail
Submission
Scoreboard
Leaderboard
Advanced tools
```

The feature set must remain unchanged.

---

# 10. SCOREBOARD

The scoreboard must remain responsive.

Audit:

```text
Polling
Realtime requests
Sorting
Filtering
Rendering
Re-renders
Network traffic
```

Avoid excessive browser work.

---

# 11. API

Every initial API request must have a reason.

Questions:

```text
Is it critical?
Can it be cached?
Can it be deferred?
Can it be server-side?
Is it duplicated?
Does it block LCP?
```

---

# 12. SEO ENTITY STRATEGY

The website should clearly communicate:

```text
TDCTF = Capture The Flag / CTF platform
```

and, where factually represented:

```text
Alfarisi Azmir = Founder / Developer of TDCTF
```

These relationships should be clear in:

```text
Visible content
Metadata
Internal linking
Structured data
Social profiles
```

when appropriate.

---

# 13. PRIMARY SEARCH TOPICS

Natural topical coverage:

```text
TDCTF
TDCTF platform
TDCTF CTF
TDCTF Capture The Flag
Capture The Flag
CTF
CTF platform
CTF challenges
CTF competition
Cybersecurity CTF
TDCTF Academy
TDCTF challenges
```

Do not repeat keywords unnaturally.

---

# 14. FOUNDER SEARCH TOPICS

Natural entity coverage:

```text
Alfarisi Azmir
Alfarisi Azmir TDCTF
Alfarisi Azmir CTF
Founder TDCTF
Developer TDCTF
```

Do not create hidden or artificial keyword pages.

---

# 15. HOMEPAGE SEMANTIC MODEL

The homepage should communicate:

```text
TDCTF
↓
What it is
↓
Capture The Flag platform
↓
What users can do
↓
Challenges / learning / competition
↓
Community
↓
Founder/developer context where already present
```

Search engines should be able to understand the platform without relying solely on JSON-LD.

---

# 16. TITLE EXAMPLES

Possible title structures:

```text
TDCTF — Capture The Flag Platform
TDCTF Challenges — Capture The Flag
TDCTF Academy — Cybersecurity Learning
TDCTF Scoreboard
About TDCTF
Alfarisi Azmir — Founder & Developer of TDCTF
```

Use only the title that accurately matches the page.

---

# 17. STRUCTURED DATA MODEL

Conceptual graph:

```text
@graph
│
├── WebSite
│      │
│      └── TDCTF
│
├── Organization
│      │
│      ├── name: TDCTF
│      ├── url
│      ├── logo
│      ├── sameAs
│      └── founder → Person
│
└── Person
       │
       └── name: Alfarisi Azmir
```

Only use `Organization` if TDCTF is genuinely represented as an organization/team/entity by the site.

Do not fabricate corporate/legal information.

Google recommends using relevant organization properties such as name, URL, logo and applicable online presence details.

---

# 18. FOUNDER PROFILE PAGE

If the website contains a dedicated page whose primary focus is:

```text
Alfarisi Azmir
```

then evaluate `ProfilePage` structured data.

A homepage containing the entire CTF platform should not automatically be treated as a `ProfilePage`.

Google's guidance requires the profile page's primary focus to be a single person or organization affiliated with the overall site.

---

# 19. `sameAs`

Use `sameAs` only for genuine official profiles.

Possible examples:

```text
TDCTF GitHub
TDCTF official community
TDCTF official social account
Alfarisi Azmir GitHub
Alfarisi Azmir LinkedIn
```

Only use URLs that actually correspond to the entity.

---

# 20. OPEN GRAPH

Every indexable page should have appropriate:

```text
og:title
og:description
og:image
og:url
og:type
```

Challenge pages should represent the actual challenge when appropriate.

Homepage:

```text
TDCTF
```

not an unrelated founder-only preview.

---

# 21. CANONICAL

Canonical must point to the actual canonical version of the page.

Pay attention to:

```text
locale
query strings
filters
pagination
challenge parameters
trailing slash
duplicate paths
```

---

# 22. SITEMAP

Include only canonical, indexable public pages.

Do not include:

```text
/api/*
/admin/*
/dashboard/*
/login
/user-private/*
```

unless a route is intentionally public and indexable.

---

# 23. ROBOTS

Ensure Google can crawl the public TDCTF content.

Do not accidentally block:

```text
homepage
public challenges
academy pages
public about/founder content
```

---

# 24. SPAM PREVENTION

Never implement:

```text
hidden keyword text
keyword walls
fake pages
doorway pages
duplicate keyword pages
irrelevant structured data
fake statistics
fake reviews
fake organization information
```

Google's spam policies prohibit tactics intended to manipulate search visibility, and structured data must accurately represent page content.

---

# 25. VISUAL PROTECTION

The following must remain visually unchanged:

```text
TDCTF branding
logo
colors
layout
cards
challenge UI
scoreboard UI
navigation
buttons
typography
spacing
animations
responsive composition
```

Optimization must happen at the engineering layer.

---

# 26. ACCESSIBILITY

Maintain:

```text
semantic HTML
keyboard navigation
focus management
button labels
link labels
alt text
contrast
reduced-motion support
```

---

# 27. PERFORMANCE REPORT

Required file:

```text
PERFORMANCE_AUDIT.md
```

Must contain:

```text
Architecture
Baseline
Mobile
Desktop
Network
JavaScript
Images
Fonts
Video
API
Core Web Vitals
SEO
Structured Data
Before / After
Visual Regression
Remaining Issues
```

---

# 28. EVIDENCE STANDARD

Every numerical claim must identify its source.

Examples:

```text
Lighthouse
Chrome DevTools Network
Performance trace
Browser instrumentation
Search Console
Rich Results Test
URL Inspection
```

Never manufacture data.

---

# 29. DEFINITION OF DONE

```text
[ ] TDCTF loads quickly on mobile
[ ] No unnecessary large media during first load
[ ] LCP optimized
[ ] CLS controlled
[ ] Main-thread work reduced
[ ] Challenge pages optimized
[ ] Scoreboard remains responsive
[ ] Images optimized
[ ] Fonts optimized
[ ] API calls optimized
[ ] Public pages crawlable
[ ] Sitemap valid
[ ] Canonicals valid
[ ] Metadata unique
[ ] Open Graph valid
[ ] Structured data validated
[ ] TDCTF entity clearly represented
[ ] Alfarisi Azmir relationship represented accurately
[ ] No keyword stuffing
[ ] No visual redesign
[ ] Production build succeeds
```

---

# 30. FINAL IDENTITY

The end result should communicate this relationship clearly and naturally:

```text
TDCTF
Capture The Flag Platform
       │
       ├── Challenges
       ├── Learning
       ├── Competition
       └── Community
       
Founder / Developer
       │
       └── Alfarisi Azmir
```

The purpose of SEO is to make that real-world relationship understandable to search engines and users.

It is NOT to guarantee a specific Google ranking.
