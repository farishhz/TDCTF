/**
 * Server-only secrets entrypoint.
 * Put truly secret values here (will not be committed if you add to .gitignore).
 * This file reads from env vars but centralizes access so other modules import from here.
 */

// Server-only secrets entrypoint.
// Only truly secret values belong here. Keep Supabase public values
// (NEXT_PUBLIC_*) out of this file; those are safe to read from env.

// TDCTL / other secret tokens (server-only)
export const TDCTL_API_URL = process.env.TDCTL_API_URL || ''
export const TDCTL_API_TOKEN = process.env.TDCTL_API_TOKEN || ''
export const TDCTL_API_ADMIN_SECRET = process.env.TDCTL_API_ADMIN_SECRET || ''

const SECRETS = {
  TDCTL_API_URL,
  TDCTL_API_TOKEN,
  TDCTL_API_ADMIN_SECRET,
}
export default SECRETS
