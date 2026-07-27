/**
 * In-memory rate limiter untuk Next.js API routes.
 *
 * CATATAN: Karena Next.js di Vercel menggunakan serverless functions,
 * state ini tidak dibagi antar instance. Rate limiting ini efektif untuk
 * single-instance (dev/self-hosted). Di Vercel production, andalkan
 * Supabase built-in rate limiting + Cloudflare Turnstile untuk auth endpoints.
 *
 * Untuk production multi-instance, ganti dengan Redis/Upstash.
 */

type RateLimitEntry = {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

/**
 * Periksa apakah IP/key sudah melebihi batas request.
 * @param key    Identifier unik (biasanya IP address)
 * @param limit  Jumlah request maksimum per window
 * @param windowMs  Durasi window dalam milidetik
 * @returns true jika DIIZINKAN, false jika sudah melebihi batas
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now >= entry.resetAt) {
    // Window baru atau sudah expired
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) {
    return false // Limit exceeded
  }

  entry.count++
  return true
}

/**
 * Ambil IP dari request header (Vercel / reverse proxy aware).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}
