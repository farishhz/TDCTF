import { NextResponse } from 'next/server'

// Fallback version string computed on server boot/build
const SERVER_BUILD_ID =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.VERCEL_DEPLOYMENT_ID ||
  process.env.NEXT_PUBLIC_BUILD_ID ||
  `build-${Date.now()}`

export async function GET() {
  return NextResponse.json(
    {
      version: SERVER_BUILD_ID,
      timestamp: Date.now(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  )
}
