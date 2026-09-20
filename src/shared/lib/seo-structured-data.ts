import APP from '@/config'
import { BASE_URL, TDCTF } from '@/_vars/const'

export interface FAQItem {
  question: string
  answer: string
}

export const CTF_FAQ_ITEMS: FAQItem[] = [
  {
    question: "Apa itu TDCTF (Tradevis CTF)?",
    answer: "TDCTF adalah platform kompetisi Capture The Flag (CTF) dan pelatihan cybersecurity modern. Platform ini menyediakan infrastruktur berbasis Next.js dan Supabase dengan dukungan orkestrasi container Docker via tdctl, dynamic scoring, dan realtime scoreboard untuk kompetisi individu maupun tim."
  },
  {
    question: "Apa saja kategori tantangan (challenges) yang ada di TDCTF?",
    answer: "TDCTF menyediakan berbagai kategori tantangan Capture The Flag yang komprehensif, meliputi: Web Exploitation, Cryptography, Reverse Engineering, Digital Forensics, Binary Exploitation (Pwn), Blockchain Security (Smart Contracts), dan Miscellaneous (OSINT/Steganography)."
  },
  {
    question: "Bagaimana sistem penilaian (scoring) dan First Blood di TDCTF?",
    answer: "TDCTF menggunakan sistem Dynamic Scoring di mana poin soal akan otomatis terdegradasi secara dinamis seiring bertambahnya solver. Selain itu, platform mencatat 'First Blood' bagi peserta atau tim yang berhasil menyelesaikan tantangan pertama kali."
  },
  {
    question: "Bagaimana cara mengikuti kompetisi di platform TDCTF?",
    answer: "Anda dapat mendaftar akun di TDCTF melalui halaman Register, baik sebagai peserta individu atau membuat/bergabung dengan Tim. Setelah masuk ke Arena Tantangan, peserta dapat meluncurkan environment challenge dan meng-submit flag yang ditemukan untuk memperoleh poin."
  },
  {
    question: "Apa itu ekosistem TDCTF (tdctl, tdbot, tdbcl)?",
    answer: "Ekosistem TDCTF terdiri dari komponen terintegrasi: TDCTF (platform web & manajemen event), TDCTL (CLI container orchestrator untuk challenge ber-TTL dan dynamic port), TDBOT (Discord bot terintegrasi dengan realtime solve announcement), dan TDBCL (Blockchain challenge launcher dengan RPC sandbox)."
  }
]

/**
 * Generate Schema.org Person JSON-LD for Alfarisi Azmir (founder / developer of TDCTF).
 * Use on pages that prominently feature the founder context.
 */
export function getPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${BASE_URL}/#person-alfarisi-azmir`,
    "name": "Alfarisi Azmir",
    "url": TDCTF.tdctf_developer || "https://www.alfarisiazmir.my.id",
    "sameAs": [
      TDCTF.tdctf_author || "https://github.com/farishhz",
      TDCTF.tdctf_developer || "https://www.alfarisiazmir.my.id",
    ].filter(Boolean),
    "jobTitle": "Founder & Lead Developer",
    "worksFor": {
      // Reference the canonical Organization entity.
      "@id": `${BASE_URL}/#organization`,
    },
  }
}

/**
 * Generate Schema.org WebSite JSON-LD with Sitelinks SearchBox.
 * publisher is linked via @id reference to the Organization entity.
 */
export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    "url": BASE_URL,
    "name": `${APP.shortName} - Capture The Flag Platform`,
    "alternateName": [
      "TDCTF",
      "Tradevis CTF",
      "Capture The Flag TDCTF",
      "TDCTF Platform",
      "CTF Indonesia"
    ],
    "description": APP.description,
    "inLanguage": ["id-ID", "en-US"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${BASE_URL}/challenges?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    // Link to the Organization entity by @id — avoids re-declaring it inline.
    "publisher": {
      "@id": `${BASE_URL}/#organization`,
    },
  }
}

/**
 * Generate Schema.org Organization JSON-LD.
 * - name uses the primary brand name; Tradevis CTF goes in alternateName.
 * - founder.name is the person's real name only; GitHub handle lives in sameAs.
 */
export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    "name": APP.shortName,
    "alternateName": [APP.fullName],
    "url": BASE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": `${BASE_URL}/${APP.image_logo}`,
      "width": 512,
      "height": 512,
    },
    "sameAs": [
      // Official TDCTF organizational profiles only.
      // Personal profiles (farishhz, alfarisiazmir.my.id) belong in the Person entity.
      TDCTF.tdctf_github_org || "https://github.com/tenka-developer",
      TDCTF.tdctf_discord || "https://discord.gg/DUU439SAg",
    ].filter(Boolean),
    "description": "Pengembang dan pengelola platform Capture The Flag (CTF) dan ekosistem keamanan siber TDCTF.",
    "founder": {
      // Reference the canonical Person entity instead of re-declaring.
      "@id": `${BASE_URL}/#person-alfarisi-azmir`,
    },
  }
}

/**
 * Generate Schema.org SoftwareApplication / WebApplication JSON-LD.
 */
export function getSoftwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${BASE_URL}/#application`,
    "name": "TDCTF Platform",
    "operatingSystem": "Web Browser, Linux, Windows, macOS",
    "applicationCategory": "EducationalApplication, SecurityApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Open-source Capture The Flag (CTF) competition & training platform with isolated Docker instances, realtime scoreboard, and multi-discipline cybersecurity challenges.",
    "softwareVersion": "0.8.0",
    "author": {
      // Reference the canonical Person entity.
      "@id": `${BASE_URL}/#person-alfarisi-azmir`,
    },
  }
}

/**
 * Generate Schema.org FAQPage JSON-LD.
 */
export function getFaqPageJsonLd(items: FAQItem[] = CTF_FAQ_ITEMS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${BASE_URL}/#faq`,
    "mainEntity": items.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  }
}

/**
 * Generate Schema.org BreadcrumbList JSON-LD.
 */
export function getBreadcrumbJsonLd(breadcrumbs: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url.startsWith("http") ? crumb.url : `${BASE_URL}${crumb.url}`
    }))
  }
}
