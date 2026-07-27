// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // App Router sudah default di Next.js 14, tidak perlu experimental.appDir
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const securityHeaders = [
  // Mencegah clickjacking — hanya izinkan framing dari origin yang sama
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Mencegah MIME-sniffing di browser lama
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Paksa HTTPS selama 2 tahun (hanya aktif saat production via HTTPS)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Kontrol informasi Referer yang dikirim ke pihak ketiga
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Batasi fitur browser yang tidak dibutuhkan
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  // Content Security Policy:
  // - 'unsafe-inline' untuk style karena Tailwind + React inline styles
  // - 'unsafe-inline' untuk script HANYA untuk theme-detection di layout.tsx (static, tidak ada user input)
  // - Supabase realtime membutuhkan wss:// ke *.supabase.co
  // - Cloudflare Turnstile membutuhkan challenges.cloudflare.com
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com",
      "frame-src 'self' https://challenges.cloudflare.com",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
]

const nextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",

  reactStrictMode: true,

  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },

  images: {
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        // Terapkan ke semua route kecuali _next internal assets
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },
};

module.exports = withBundleAnalyzer(nextConfig);
