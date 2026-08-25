import type { Metadata } from "next"
import APP from "@/config"
import { BASE_URL } from "@/_vars/const"
import PageBackground from "@/shared/components/PageBackground"
import Footer from "@/_layouts/Footer"
import HomeHero from "@/shared/components/HomeHero"
import CtfCategoriesSection from "@/shared/components/CtfCategoriesSection"
import EcosystemSection from "@/shared/components/EcosystemSection"
import CtfFaqSection from "@/shared/components/CtfFaqSection"
import CommunityShowcase from "@/shared/components/CommunityShowcase"
import { THEME_PRIMARY_SELECTION_CLASS } from "@/shared/styles"

export const metadata: Metadata = {
  title: "TDCTF | Capture The Flag Platform - Cybersecurity Competition Arena",
  description: APP.description,
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "TDCTF | Capture The Flag Platform - Cybersecurity Competition Arena",
    description: APP.description,
    url: BASE_URL,
    siteName: "TDCTF - Capture The Flag Platform",
    images: [
      {
        url: `${BASE_URL}/${APP.image_preview}`,
        width: 1200,
        height: 630,
        alt: "TDCTF - Capture The Flag Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TDCTF | Capture The Flag Platform - Cybersecurity Competition Arena",
    description: APP.description,
    images: [`${BASE_URL}/${APP.image_preview}`],
  },
}

export default function Home() {
  return (
    <PageBackground
      className="flex flex-col overflow-hidden"
      selectionClassName={THEME_PRIMARY_SELECTION_CLASS}
    >
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-4 sm:px-6 py-8 lg:py-12">
        {/* HERO SECTION */}
        <HomeHero />

        {/* CTF DISCIPLINES & ARENAS */}
        <CtfCategoriesSection />

        {/* CORE PLATFORM ECOSYSTEM */}
        <EcosystemSection />

        {/* CTF FAQ SECTION */}
        <CtfFaqSection />

        {/* COMMUNITY & CREATOR SHOWCASE */}
        <CommunityShowcase />
      </main>

      <Footer />
    </PageBackground>
  )
}
