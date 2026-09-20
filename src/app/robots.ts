import { MetadataRoute } from 'next'
import { BASE_URL } from '@/_vars/const'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = BASE_URL.replace(/\/$/, '')

  // IMPORTANT SECURITY NOTE:
  // robots.txt is a crawling directive — it is NOT a security or access control mechanism.
  // Google explicitly states: URLs blocked by Disallow can still appear in search results
  // without a snippet if other pages link to them.
  //
  // All private routes below must be protected at the application and server level.
  // robots.txt only reduces unnecessary crawling overhead.
  //
  // Route access classification (verified from source code):
  //  - /admin/*        → protected by middleware auth check
  //  - /api/*          → API routes must validate session/tokens per request
  //  - /auth/*         → Supabase OAuth callback, not user-facing
  //  - /challenges     → auth-required: router.push('/login') [useChallengesPageData.ts]
  //  - /scoreboard     → auth-required: router.push('/login') [useScoreboardPageData.ts]
  //  - /teams          → auth-required: router.push('/login') [TeamsPage.tsx]
  //  - /profile        → auth-required: redirects to /login
  //  - /logs           → auth-required: router.push('/login') [LogsPageContent.tsx]
  //  - /join/[id]      → invite tokens must be validated server-side by the application
  //  - /user/[username]→ auth-required

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Admin & internal tooling
          '/admin/',
          // All API endpoints — server must enforce auth per route
          '/api/',
          // OAuth callback — not a content page
          '/auth/',
          // Auth flows — not content pages
          '/forgot-password',
          // Competition pages (auth-required — verified from source code)
          '/challenges',
          '/scoreboard',
          '/teams',
          // Private user pages
          '/profile',
          '/user/',
          // Auth-required activity feed
          '/logs',
          // Team invite links — app must validate token server-side
          '/join/',
          // Maintenance bypass page
          '/maintenance',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/forgot-password',
          '/challenges',
          '/scoreboard',
          '/teams',
          '/profile',
          '/user/',
          '/logs',
          '/join/',
          '/maintenance',
        ],
      },
      {
        userAgent: 'bingbot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/forgot-password',
          '/challenges',
          '/scoreboard',
          '/teams',
          '/profile',
          '/user/',
          '/logs',
          '/join/',
          '/maintenance',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
