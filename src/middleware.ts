import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, MAINTENANCE_MODE } from './_vars/const'

// Cache untuk menyimpan status maintenance
let maintenanceCache: {
  isActive: boolean
  errorType: 'manual' | 'database' | null
  errorMessage: string
  lastCheck: number
} = {
  isActive: false,
  errorType: null,
  errorMessage: '',
  lastCheck: 0
}

const CACHE_TTL = 30000 // 30 detik
const FETCH_TIMEOUT_MS = 5000 // 5 detik timeout per attempt
const FETCH_RETRIES = 2 // jumlah percobaan
const STARTUP_GRACE_MS = 15000 // abaikan fetch error dalam 15 detik pertama startup
const START_TIME = Date.now()

type SupabaseRestError = {
  code?: string
  message?: string
  details?: string
  hint?: string
}

async function parseSupabaseRestError(response: Response): Promise<SupabaseRestError> {
  try {
    return await response.json()
  } catch {
    return {
      message: await response.text().catch(() => `HTTP ${response.status}`),
    }
  }
}

async function checkKeepAliveTable(): Promise<SupabaseRestError | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      message: 'Supabase URL or anon key is not configured',
      code: 'SUPABASE_CONFIG',
    }
  }

  const restUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/keep-alive?select=id&limit=1`

  let lastError: SupabaseRestError | null = null

  for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
      const response = await fetch(restUrl, {
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      })
      clearTimeout(timeout)

      if (response.ok) return null // sukses
      lastError = await parseSupabaseRestError(response)

      // Jika error bukan network (mis. 401, 403), langsung return tanpa retry
      if (response.status < 500) return lastError
    } catch (e) {
      clearTimeout(timeout)
      const msg = e instanceof Error ? `${e.name}: ${e.message}` : 'fetch failed'
      lastError = { message: msg }

      if (attempt < FETCH_RETRIES) {
        // Tunggu sebentar sebelum retry
        await new Promise(r => setTimeout(r, 500 * attempt))
      }
    }
  }

  return lastError
}

async function checkMaintenance(): Promise<{ isActive: boolean; errorType: 'manual' | 'database' | null; errorMessage: string }> {
  const mode = MAINTENANCE_MODE

  // Mode manual (Force Maintenance)
  if (mode === 'yes') {
    return { isActive: true, errorType: 'manual', errorMessage: 'Manual maintenance mode enabled' }
  }

  // Jika tidak 'yes', kita selalu cek koneksi database (Auto Mode)
  // Check cache dulu
  const now = Date.now()
  if (now - maintenanceCache.lastCheck < CACHE_TTL) {
    return {
      isActive: maintenanceCache.isActive,
      errorType: maintenanceCache.errorType,
      errorMessage: maintenanceCache.errorMessage
    }
  }

  // Check database connection
  try {
    const error = await checkKeepAliveTable()

    let errorMessage = ''
    let hasConnectionError = false

    if (error) {
      const errorCode = error.code || ''
      const errorMsg = error.message || 'Unknown database error'
      const errorDetails = error.details || ''
      const errorHint = error.hint || ''

      // 👉 ignore permission error
      const isIgnorable =
        errorCode === '42501' ||
        errorMsg.includes('permission denied')

      // hanya log kalau bukan ignorable
      if (!isIgnorable) {
        console.log('Maintenance check error:', error)
      }

      hasConnectionError = (
        errorMsg.includes('fetch') ||
        errorMsg.includes('network') ||
        errorMsg.includes('Failed to fetch') ||
        errorMsg.includes('TypeError') ||
        errorCode === 'SUPABASE_CONFIG' ||
        errorCode === 'PGRST301' ||
        errorCode === 'PGRST204'
      )

      // kalau ignorable, paksa jadi bukan error koneksi
      if (isIgnorable) {
        hasConnectionError = false
      }

      // Build message cuma kalau beneran error koneksi
      if (hasConnectionError) {
        if (!errorCode && errorMsg.includes('TypeError')) {
          errorMessage = errorMsg
        } else if (!errorCode && errorMsg.includes('fetch failed')) {
          errorMessage = 'Network Error: ' + errorMsg
        } else if (errorCode) {
          errorMessage = `[${errorCode}] ${errorMsg}`
        } else {
          errorMessage = errorMsg
        }

        if (errorDetails && !errorDetails.includes('fetch failed')) {
          errorMessage += ` | Details: ${errorDetails.substring(0, 100)}`
        }
        if (errorHint) {
          errorMessage += ` | Hint: ${errorHint}`
        }
      }
    }

    // Update cache
    maintenanceCache = {
      isActive: hasConnectionError,
      errorType: hasConnectionError ? 'database' : null,
      errorMessage: errorMessage,
      lastCheck: now
    }

    return {
      isActive: hasConnectionError,
      errorType: hasConnectionError ? 'database' : null,
      errorMessage: errorMessage
    }
  } catch (e) {
    console.error('Middleware catch error:', e)
    const errorMessage = e instanceof Error
      ? `${e.name}: ${e.message}`
      : 'Failed to connect to database - Unknown exception'

    // Dalam grace period startup, abaikan error dan anggap DB OK
    if (Date.now() - START_TIME < STARTUP_GRACE_MS) {
      console.log('Middleware: ignoring error during startup grace period')
      return { isActive: false, errorType: null, errorMessage: '' }
    }

    // Update cache dengan error
    maintenanceCache = {
      isActive: true,
      errorType: 'database',
      errorMessage: errorMessage,
      lastCheck: now
    }

    return { isActive: true, errorType: 'database', errorMessage: errorMessage }
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Biarkan SEO crawlers dan file verifikasi Google Search Console lewat tanpa terganggu maintenance
  if (
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.webmanifest' ||
    pathname.startsWith('/google')
  ) {
    return NextResponse.next()
  }

  const { isActive, errorType, errorMessage } = await checkMaintenance()

  if (isActive) {
    const url = request.nextUrl.clone()

    // Jika sudah di /maintenance, biarkan lewat dengan header pathname
    if (url.pathname === '/maintenance') {
      const response = NextResponse.next()
      response.headers.set('x-pathname', url.pathname)
      return response
    }

    // Redirect ke /maintenance tanpa query params
    url.pathname = '/maintenance'
    url.search = '' // hapus semua query params

    // Set cookie untuk menyimpan error type dan message
    const response = NextResponse.redirect(url)
    response.cookies.set('maintenance-type', errorType || 'unknown', {
      path: '/',
      maxAge: 60 * 5, // 5 menit
      sameSite: 'lax',
      httpOnly: true,  // Tidak bisa diakses JavaScript
      secure: process.env.NODE_ENV === 'production', // Hanya via HTTPS di production
    })

    // Sanitasi pesan error sebelum disimpan di cookie (jangan bocorkan detail internal DB)
    const safeErrorMsg = (errorMessage || 'Unknown error')
      .replace(/PGRST\d+/g, '[DB_ERR]')   // hapus kode error PostgREST
      .replace(/password/gi, '[REDACTED]') // hapus kata password jika ada
      .substring(0, 200)                   // batasi panjang
    const encodedError = encodeURIComponent(safeErrorMsg).substring(0, 4000)
    response.cookies.set('maintenance-error', encodedError, {
      path: '/',
      maxAge: 60 * 5, // 5 menit
      sameSite: 'lax',
      httpOnly: true,  // Tidak bisa diakses JavaScript
      secure: process.env.NODE_ENV === 'production', // Hanya via HTTPS di production
    })

    console.log('Setting maintenance cookies:', { errorType, errorMessage: errorMessage.substring(0, 100) })
    return response
  }

  // Maintenance tidak aktif - redirect dari /maintenance ke home jika ada yang stuck
  if (request.nextUrl.pathname === '/maintenance') {
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.delete('maintenance-type')
    return response
  }

  // Set pathname header untuk semua request
  const response = NextResponse.next()
  response.headers.set('x-pathname', request.nextUrl.pathname)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml, manifest.webmanifest (SEO endpoints)
     * - google*.html (Google Search Console verification)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|google.*\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
