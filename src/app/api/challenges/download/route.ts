import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/_vars/const'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const challengeId = searchParams.get('challengeId')
    const indexStr = searchParams.get('index')
    const filename = searchParams.get('filename')

    if (!challengeId || indexStr === null) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const index = parseInt(indexStr, 10)
    if (isNaN(index)) {
      return NextResponse.json({ error: 'Invalid index parameter' }, { status: 400 })
    }

    // Get auth token from request to respect Row Level Security (RLS)
    const authorization = request.headers.get('authorization') || ''
    const [scheme, token] = authorization.split(' ')
    const bearerToken = scheme?.toLowerCase() === 'bearer' ? token?.trim() : ''

    // Create Supabase client with the user's access token if available
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        headers: bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {},
      },
    })

    // Fetch challenge details
    const { data: challenge, error } = await client
      .from('challenges')
      .select('id, attachments, is_active')
      .eq('id', challengeId)
      .single()

    if (error || !challenge) {
      return NextResponse.json({ error: 'Challenge not found or access denied' }, { status: 404 })
    }

    const attachments = (challenge.attachments as any[]) || []
    const attachment = attachments[index]

    if (!attachment || attachment.type !== 'file' || !attachment.url) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 })
    }

    // Fetch the raw file from source (GitHub raw, etc.) server-side
    // Use AbortController to prevent indefinite hangs on slow/unresponsive sources
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30_000) // 30-second timeout

    let fileResponse: Response
    try {
      fileResponse = await fetch(attachment.url, {
        headers: { 'User-Agent': 'TDCTF-Downloader/1.0' },
        signal: controller.signal,
      })
    } catch (fetchErr: any) {
      clearTimeout(timeoutId)
      if (fetchErr?.name === 'AbortError') {
        return NextResponse.json({ error: 'Upstream file fetch timed out' }, { status: 504 })
      }
      throw fetchErr
    } finally {
      clearTimeout(timeoutId)
    }

    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: `Failed to download file from source (status: ${fileResponse.status})` },
        { status: 502 }
      )
    }

    if (!fileResponse.body) {
      return NextResponse.json({ error: 'No response body from source' }, { status: 502 })
    }

    // Build response headers
    const headers = new Headers()

    // Always force octet-stream so the browser triggers a file download instead of
    // trying to render the content inline (this fixes .txt files getting "stuck").
    headers.set('Content-Type', 'application/octet-stream')

    const finalFilename = attachment.name || filename || 'download'
    const safeFilename = encodeURIComponent(finalFilename).replace(/['()]/g, escape)
    headers.set('Content-Disposition', `attachment; filename*=UTF-8''${safeFilename}`)

    // Forward Content-Length when available so the browser can show a progress bar.
    const contentLength = fileResponse.headers.get('content-length')
    if (contentLength) {
      headers.set('Content-Length', contentLength)
    }

    // Stream directly from the upstream source to the client — no full-file buffering.
    // This means the first bytes arrive at the client as soon as GitHub starts sending
    // them, instead of waiting for the entire file to be buffered on the server first.
    return new Response(fileResponse.body, {
      status: 200,
      headers,
    })
  } catch (error: any) {
    console.error('Error in proxy download API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
