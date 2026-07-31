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
    const fileResponse = await fetch(attachment.url, {
      headers: {
        'User-Agent': 'TDCTF-Downloader/1.0',
      },
    })

    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: `Failed to download file from source (status: ${fileResponse.status})` },
        { status: 502 }
      )
    }

    // Construct streaming headers
    const headers = new Headers()
    const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream'
    headers.set('Content-Type', contentType)

    const finalFilename = attachment.name || filename || 'download'
    const safeFilename = encodeURIComponent(finalFilename).replace(/['()]/g, escape)
    headers.set('Content-Disposition', `attachment; filename*=UTF-8''${safeFilename}`)

    const contentLength = fileResponse.headers.get('content-length')
    if (contentLength) {
      headers.set('Content-Length', contentLength)
    }

    const arrayBuffer = await fileResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new Response(buffer, {
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
