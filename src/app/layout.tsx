import type { Metadata } from 'next'
import { headers } from 'next/headers'
// @ts-ignore: side-effect CSS import without type declarations
import 'react-medium-image-zoom/dist/styles.css'
// @ts-ignore: side-effect CSS import without type declarations
import './globals.css'

import { Toaster } from "react-hot-toast"
import Navbar from '@/_layouts/Navbar'
import ScrollToggle from '@/_layouts/components/ScrollToggle'
import AppUpdateNotifier from '@/shared/components/AppUpdateNotifier'
import { AnnouncementEngineHost } from '@/features/announcements'
import { AuthProvider } from '@/shared/contexts/AuthContext'
import { ThemeProvider } from '@/shared/contexts/ThemeContext'
import { CategoriesProvider } from '@/shared/contexts/CategoriesContext'
import { SystemSettingsProvider } from '@/shared/contexts/SystemSettingsContext'
import { PresenceProvider } from '@/shared/contexts'
import { getPageMinHeightStyle, PAGE_BG_BASE_CLASS } from '@/shared/styles/page-background'
import { THEME_PRIMARY_SELECTION_CLASS } from '@/shared/styles/theme-colors'
import APP from '@/config'
import { BASE_URL } from '@/_vars/const'
import {
  getWebsiteJsonLd,
  getOrganizationJsonLd,
  getSoftwareApplicationJsonLd,
  getFaqPageJsonLd,
} from '@/shared/lib/seo-structured-data'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${APP.shortName} | Capture The Flag Platform - Cybersecurity Competition`,
    template: `%s | ${APP.shortName} - Capture The Flag`,
  },
  description: APP.description,
  keywords: [
    'Capture The Flag',
    'CTF',
    'TDCTF',
    'Tradevis CTF',
    'CTF Platform',
    'Capture The Flag Indonesia',
    'Cybersecurity Competition',
    'Ethical Hacking Challenges',
    'Web Exploitation',
    'Cryptography',
    'Reverse Engineering',
    'Digital Forensics',
    'Binary Exploitation',
    'Pwn',
    'Blockchain CTF',
    'Jeopardy CTF',
    'CTF Time',
    'Security Training',
    'Dynamic Scoring CTF',
    'Docker CTF Container',
    'tdctl',
    'Cybersecurity Arena',
  ],
  authors: [{ name: 'Alfarisi Azmir', url: 'https://github.com/farishhz' }],
  creator: 'Alfarisi Azmir',
  publisher: 'Tradevis CTF / Tenka Developer',
  applicationName: `${APP.shortName} Platform`,
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'googlee2e132e5e265367a.html',
    other: {
      'google-site-verification': ['googlee2e132e5e265367a.html', 'e2e132e5e265367a'],
    },
  },
  openGraph: {
    title: `${APP.shortName} | Capture The Flag Platform - Cybersecurity Competition`,
    description: APP.description,
    url: BASE_URL,
    siteName: `${APP.shortName} - Capture The Flag Platform`,
    images: [
      {
        url: `${BASE_URL}/${APP.image_preview}`,
        width: 1200,
        height: 630,
        alt: `${APP.shortName} - Modern Capture The Flag (CTF) Platform`,
        type: 'image/png',
      },
    ],
    locale: 'id_ID',
    alternateLocale: ['en_US'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP.shortName} | Capture The Flag Platform - Cybersecurity Competition`,
    description: APP.description,
    images: [`${BASE_URL}/${APP.image_preview}`],
    creator: '@farishhz',
  },
  alternates: {
    canonical: BASE_URL,
  },
  category: 'technology',
  classification: 'Cybersecurity & Capture The Flag Competitions',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isMaintenancePage = pathname === '/maintenance'

  const websiteJsonLd = getWebsiteJsonLd()
  const organizationJsonLd = getOrganizationJsonLd()
  const appJsonLd = getSoftwareApplicationJsonLd()
  const faqJsonLd = getFaqPageJsonLd()

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var settings = JSON.parse(localStorage.getItem('tdctf_settings_v1'));
                  var theme = settings ? settings.theme : 'dark';
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`antialiased ${THEME_PRIMARY_SELECTION_CLASS}`} suppressHydrationWarning>
        {isMaintenancePage ? (
          // Maintenance mode: no navbar, no providers, just raw content
          children
        ) : (
          // Normal mode: with navbar and providers
          <div className={PAGE_BG_BASE_CLASS} style={getPageMinHeightStyle()}>
            <ThemeProvider>
              <SystemSettingsProvider>
                <AuthProvider>
                  <PresenceProvider>
                    <CategoriesProvider>
                      <Navbar />
                      <div className="pt-14">{children}</div>
                      <Toaster position="top-right" reverseOrder={false} />
                      <ScrollToggle />
                      <AppUpdateNotifier />
                      <AnnouncementEngineHost />
                    </CategoriesProvider>
                  </PresenceProvider>
                </AuthProvider>
              </SystemSettingsProvider>
            </ThemeProvider>
          </div>
        )}
      </body>
    </html>
  )
}
