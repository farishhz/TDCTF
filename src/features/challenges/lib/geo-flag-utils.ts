import type { ChallengeWithSolve } from '@/shared/types'
import type { GeoCoordinates } from '../types'

/**
 * Checks if a challenge is a GeoGuessr-type challenge
 * (determined by the has_geo_flag computed field from the DB)
 */
export function isGeoChallenge(challenge: ChallengeWithSolve): boolean {
  return !!(challenge as any).has_geo_flag
}

/**
 * Formats coordinates for display
 */
export function formatGeoCoords(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`
}

/**
 * Validates that given coordinates are within valid WGS84 range
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

/**
 * Formats a distance for display (auto-switches km/m)
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  return `${km.toFixed(2)} km`
}

/**
 * Parses a geo flag string on the CLIENT side.
 * Used only in admin panel for validation/preview.
 * Format: prefix{geo:lat,lng,radius_km}
 */
export function parseGeoFlagClient(flag: string): {
  prefix: string
  lat: number
  lng: number
  radius_km: number
} | null {
  if (!flag) return null
  const match = flag.match(/^([^{]+)\{geo:([-0-9.]+),([-0-9.]+),([-0-9.]+)\}$/)
  if (!match) return null

  const lat = parseFloat(match[2])
  const lng = parseFloat(match[3])
  const radius_km = parseFloat(match[4])

  if (isNaN(lat) || isNaN(lng) || isNaN(radius_km)) return null
  if (lat < -90 || lat > 90) return null
  if (lng < -180 || lng > 180) return null
  if (radius_km <= 0) return null

  return { prefix: match[1], lat, lng, radius_km }
}

/**
 * Builds a geo flag string from parts.
 * Used in admin panel when constructing a geo flag.
 */
export function buildGeoFlag(prefix: string, coords: GeoCoordinates, radius_km: number): string {
  return `${prefix}{geo:${coords.lat.toFixed(6)},${coords.lng.toFixed(6)},${radius_km.toFixed(3)}}`
}
