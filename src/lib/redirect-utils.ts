/**
 * Safe redirect utility — mencegah open redirect ke domain eksternal.
 * Hanya izinkan path relatif yang dimulai dengan "/" (bukan "//").
 */
export function getSafeRedirectPath(
  redirectTo: string | null | undefined,
  fallback = '/challenges'
): string {
  if (!redirectTo) return fallback

  try {
    // Jika nilai bisa diparse sebagai URL absolut, cek apakah origin-nya sama
    const parsed = new URL(redirectTo, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    if (typeof window !== 'undefined' && parsed.origin !== window.location.origin) {
      return fallback
    }
    // Kembalikan hanya path + search, bukan full URL
    return parsed.pathname + parsed.search
  } catch {
    // URL.parse gagal — bisa jadi path relatif yang valid
    if (redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
      return redirectTo
    }
    return fallback
  }
}
