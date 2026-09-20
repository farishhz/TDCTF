# TDCTF - SEO and Technical Audit Report

Platform: TDCTF (Tradevis CTF) - Capture The Flag Platform
Audit date: 2026-09-20
Framework: Next.js 14.2.35 (App Router)

Canonical platform domain: https://ctf.tdctf.my.id
Founder / Developer: Alfarisi Azmir
Founder personal website: https://www.alfarisiazmir.my.id

Every claim is categorized as IMPLEMENTED, MEASURED, TARGET, or UNVERIFIED.

---

## 1. Domain Mapping (IMPLEMENTED + MEASURED)

CORRECT MAPPING:

  TDCTF Platform (CTF website)
    Canonical:  https://ctf.tdctf.my.id
    Used for:   BASE_URL, tdctf_url, WebSite @id, Organization @id,
                Person @id (inside TDCTF graph), sitemap host,
                robots host, og:url, OG image base URL,
                canonical link tags

  Alfarisi Azmir (Person / Developer)
    Personal site: https://www.alfarisiazmir.my.id
    Used for:   Person.url, Person.sameAs, footer links, developer links
    NOT used as TDCTF BASE_URL or any TDCTF canonical reference

MEASURED: Full repository grep results:

  alfarisiazmir.my.id occurrences:
    const.ts:10     tdctf_docs     = https://www.alfarisiazmir.my.id   CORRECT (Person/developer link)
    const.ts:11     tdctf_developer= https://www.alfarisiazmir.my.id   CORRECT (Person/developer link)
    const.ts:50     template text  (inert example string)               CORRECT (not a URL)
    Footer.tsx:26   href personal  = https://www.alfarisiazmir.my.id   CORRECT (visible personal link)
    Footer.tsx:48   href personal  = https://www.alfarisiazmir.my.id   CORRECT (visible personal link)
    seo-structured-data.ts:42  Person.url fallback  www.alfarisiazmir  CORRECT (Person entity only)
    seo-structured-data.ts:45  Person.sameAs fallback www.alfarisiazmir CORRECT (Person entity only)
    seo-structured-data.ts:111 comment                                  CORRECT (inert)

  ctf.tdctf.my.id occurrences:
    const.ts:3     tdctf_url      = https://ctf.tdctf.my.id            CORRECT
    const.ts:35    BASE_URL fallback = https://ctf.tdctf.my.id         CORRECT

  Zero TDCTF canonical references use www.alfarisiazmir.my.id.
  Zero stale old-domain (ctf.tenkadeveloper.web.id) occurrences.

---

## 2. const.ts Domain State (IMPLEMENTED)

  tdctf_url:       https://ctf.tdctf.my.id          (TDCTF platform)
  tdctf_discord:   https://discord.gg/DUU439SAg     (TDCTF Discord)
  tdctf_github:    https://github.com/farishhz      (personal GitHub -> Person.sameAs)
  tdctf_github_org:https://github.com/tenka-developer (TDCTF GitHub org -> Organization.sameAs)
  tdctf_author:    https://github.com/farishhz      (personal GitHub -> Person.sameAs)
  tdctf_docs:      https://www.alfarisiazmir.my.id  (personal site -> Person.url)
  tdctf_developer: https://www.alfarisiazmir.my.id  (personal site -> Person.url/sameAs)

  BASE_URL = NEXT_PUBLIC_SITE_URL (if set and not localhost)
           = https://ctf.tdctf.my.id (production fallback)
           = http://localhost:3000 (development)

---

## 3. Structured Data Entity Graph (IMPLEMENTED)

File: src/shared/lib/seo-structured-data.ts
Injected sitewide via: src/app/layout.tsx

  WebSite
    @id:  ctf.tdctf.my.id/#website
    url:  ctf.tdctf.my.id
    publisher: { @id: ctf.tdctf.my.id/#organization }

  Organization
    @id:  ctf.tdctf.my.id/#organization
    name: TDCTF
    alternateName: [Tradevis CTF]
    url:  ctf.tdctf.my.id
    sameAs:
      - github.com/tenka-developer   (official TDCTF GitHub org)
      - discord.gg/DUU439SAg         (official TDCTF Discord)
    founder: { @id: ctf.tdctf.my.id/#person-alfarisi-azmir }

  SoftwareApplication
    @id:  ctf.tdctf.my.id/#application
    author: { @id: ctf.tdctf.my.id/#person-alfarisi-azmir }

  FAQPage
    @id:  ctf.tdctf.my.id/#faq

  Person  - ONE canonical instance in root layout.tsx only
    @id:  ctf.tdctf.my.id/#person-alfarisi-azmir
    name: Alfarisi Azmir
    url:  https://www.alfarisiazmir.my.id   (personal website)
    sameAs:
      - github.com/farishhz              (personal GitHub)
      - www.alfarisiazmir.my.id          (personal website)
    jobTitle: Founder and Lead Developer
    worksFor: { @id: ctf.tdctf.my.id/#organization }

Entity separation rules (IMPLEMENTED):
  Organization.sameAs = TDCTF organizational profiles only (tenka-developer, Discord)
  Person.sameAs       = personal profiles only (farishhz, www.alfarisiazmir.my.id)
  github.com/farishhz is in Person.sameAs ONLY - not in Organization.sameAs
  All cross-entity references use @id only - no inline re-declarations

Person entity rules (IMPLEMENTED):
  Declared once in root layout.tsx - sitewide
  /info/layout.tsx does NOT inject a duplicate Person block
  /info page reinforces founder context through visible content only

---

## 4. Route Access Audit (MEASURED from source code)

| Route | Auth guard | Classification |
|-------|-----------|----------------|
| / | None | PUBLIC + INDEXABLE |
| /info | useAuth for loader only | PUBLIC + INDEXABLE |
| /rules | useAuth for loader only | PUBLIC + INDEXABLE |
| /challenges | router.push('/login') useChallengesPageData.ts:147 | PRIVATE |
| /scoreboard | router.push('/login') useScoreboardPageData.ts:91 | PRIVATE |
| /teams | router.push('/login') TeamsPage.tsx | PRIVATE |
| /teams/[name] | router.push('/login') TeamDetailPage.tsx:26 | PRIVATE |
| /logs | router.push('/login') LogsPageContent.tsx:36 | PRIVATE |
| /profile | auth-required | PRIVATE |
| /user/[username] | auth-required | PRIVATE |
| /join/[id] | team invite | PRIVATE |
| /login | auth flow | NOT INDEXABLE |
| /register | auth flow | NOT INDEXABLE |
| /admin/* | admin-only | NOT INDEXABLE |
| /api/* | API endpoints | NOT INDEXABLE |
| /maintenance | maintenance bypass | NOT INDEXABLE |

Note: Auth is client-side only (router.push). Middleware handles maintenance mode only.

---

## 5. Sitemap (IMPLEMENTED)

File: src/app/sitemap.ts
priority and changeFrequency intentionally omitted - Google ignores both.

3 verified public entries:

  https://ctf.tdctf.my.id/
  https://ctf.tdctf.my.id/info
  https://ctf.tdctf.my.id/rules

Excluded (auth-required - verified from source code):
  /challenges /scoreboard /teams /teams/[name] /logs /login /register

Production output (TARGET): https://ctf.tdctf.my.id/sitemap.xml

---

## 6. Robots.txt (IMPLEMENTED)

File: src/app/robots.ts
Applied to *, Googlebot, bingbot.

Disallowed:
  /admin/ /api/ /auth/ /forgot-password
  /challenges /scoreboard /teams /profile /user/ /logs /join/ /maintenance

robots.txt is a crawling directive ONLY - NOT authentication or authorization.

Production output (TARGET): https://ctf.tdctf.my.id/robots.txt

---

## 7. Page Metadata - Public Pages (IMPLEMENTED)

  /      - Canonical: https://ctf.tdctf.my.id
  /info  - Canonical: https://ctf.tdctf.my.id/info
  /rules - Canonical: https://ctf.tdctf.my.id/rules

Google verification token: e2e132e5e265367a (corrected from filename)

---

## 8. Build and Code Quality (MEASURED)

  npm run build    - Exit 0 - 37/37 pages, no errors
  npx tsc --noEmit - Exit 0 - Zero type errors
  npm run lint     - Exit 0 - Zero new warnings

---

## 9. Production Environment Variable

Required Vercel setting:

  NEXT_PUBLIC_SITE_URL=https://ctf.tdctf.my.id

This is the TDCTF platform URL - NOT www.alfarisiazmir.my.id (which is the developer's personal portfolio).

Status: UNVERIFIED - must be confirmed in Vercel project settings.

---

## 10. Remaining Issues

  NEXT_PUBLIC_SITE_URL in Vercel unconfirmed    - CRITICAL  - Set to https://ctf.tdctf.my.id
  Client-side-only auth on private pages        - Medium    - Consider middleware-level protection
  og-image.png 2.1MB                            - Medium    - Regenerate <= 300KB
  logo-no-bg.svg 2.78MB                         - Medium    - Audit usage, run SVGO
  Template-WU.docx in /public                   - Low       - Remove from repo
  CommunityShowcase GitHub API fetch on mount   - Medium    - Defer to IntersectionObserver

---

## 11. Validation Checklist

  npm run build exit 0                                      - MEASURED
  npx tsc --noEmit exit 0                                   - MEASURED
  npm run lint exit 0                                       - MEASURED
  Zero old-domain (ctf.tenkadeveloper.web.id) occurrences   - MEASURED
  Zero www.alfarisiazmir.my.id as TDCTF canonical           - MEASURED
  BASE_URL/tdctf_url = ctf.tdctf.my.id                     - IMPLEMENTED
  tdctf_developer/tdctf_docs = www.alfarisiazmir.my.id     - IMPLEMENTED
  Single canonical Person entity (root layout only)         - IMPLEMENTED
  /info does NOT duplicate Person JSON-LD                   - IMPLEMENTED
  All cross-entity refs use @id only                        - IMPLEMENTED
  Organization.sameAs = organizational profiles only        - IMPLEMENTED
  Person.sameAs = personal profiles only (no farishhz in Org) - IMPLEMENTED
  Person.url = www.alfarisiazmir.my.id                     - IMPLEMENTED
  Sitemap host = ctf.tdctf.my.id                           - IMPLEMENTED
  Sitemap: 3 verified public entries only                   - IMPLEMENTED
  Robots host = ctf.tdctf.my.id                            - IMPLEMENTED
  priority/changeFrequency removed from sitemap             - IMPLEMENTED
  Google verification token corrected                       - IMPLEMENTED
  No visual redesign                                        - CONFIRMED
  NEXT_PUBLIC_SITE_URL=https://ctf.tdctf.my.id in Vercel   - UNVERIFIED
  Production /robots.txt verified                           - UNVERIFIED
  Production /sitemap.xml verified                          - UNVERIFIED
  Production JSON-LD @id verified (ctf.tdctf.my.id)        - UNVERIFIED
  Rich Results Test passed                                  - UNVERIFIED

---

## 12. Final Status

  READY FOR PRODUCTION - PENDING PRODUCTION CONFIGURATION

Blocking action:

  1. Go to Vercel -> Project -> Settings -> Environment Variables -> Production
  2. Set: NEXT_PUBLIC_SITE_URL = https://ctf.tdctf.my.id
  3. Redeploy

After deploying, verify:
  - https://ctf.tdctf.my.id/robots.txt
  - https://ctf.tdctf.my.id/sitemap.xml
  - View page source: check @id values contain ctf.tdctf.my.id not localhost
  - https://search.google.com/test/rich-results
  - Submit sitemap in Google Search Console
