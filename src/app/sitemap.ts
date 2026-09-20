import { MetadataRoute } from 'next'
import { BASE_URL } from '@/_vars/const'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = BASE_URL.replace(/\/$/, '')
  const now = new Date()

  // NOTE on <priority> and <changefreq>:
  // Google officially ignores both fields. Only <lastmod> has any use
  // when it accurately reflects a meaningful content change on the page.
  // These fields are intentionally omitted to keep the sitemap honest.

  // ROUTE ACCESS AUDIT (verified from source code):
  //
  // PUBLIC (no auth guard):
  //   /          → no auth guard
  //   /info      → useAuth for loading spinner only, no router.push('/login')
  //   /rules     → useAuth for loading spinner only, no router.push('/login')
  //
  // PRIVATE (client-side auth guard → router.push('/login')):
  //   /challenges    → useChallengesPageData.ts:147
  //   /scoreboard    → useScoreboardPageData.ts:91
  //   /teams         → TeamsPage.tsx:~45
  //   /teams/[name]  → TeamDetailPage.tsx:26-28
  //   /logs          → LogsPageContent.tsx:36-38
  //   /profile       → auth-required
  //   /user/[username] → auth-required

  return [
    // Homepage — primary platform entry point
    {
      url: baseUrl,
      lastModified: now,
    },
    // Info — platform architecture, ecosystem, and founder context
    // PUBLIC: no auth guard (useAuth only for loading spinner)
    {
      url: `${baseUrl}/info`,
      lastModified: now,
    },
    // Rules — official competition rules & code of conduct
    // PUBLIC: no auth guard (useAuth only for loading spinner)
    {
      url: `${baseUrl}/rules`,
      lastModified: now,
    },
    // INTENTIONALLY EXCLUDED (auth-required — verified from source code):
    // /challenges    — router.push('/login') when unauthenticated
    // /scoreboard    — router.push('/login') when unauthenticated
    // /teams         — router.push('/login') when unauthenticated
    // /teams/[name]  — router.push('/login') when unauthenticated
    // /logs          — router.push('/login') when unauthenticated
    // /login         — auth flow, not a content page
    // /register      — auth flow, not a content page
  ]
}
