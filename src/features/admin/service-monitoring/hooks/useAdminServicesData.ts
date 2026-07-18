"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/shared/contexts/AuthContext'
import { getAdminScope, type AdminScope } from '@/features/admin/services/admin.service'
import { getChallengesList } from '@/shared/lib'
import { getEvents } from '@/features/events/services/event.service'
import type { Event } from '@/shared/types'
import {
  buildNxctlHeaders,
  buildLiveServicesUrl,
  buildNxctlStatusHeaders,
  buildNxctlStatusUrl,
  buildServiceRows,
  getNxctlErrorMessage,
  getNxctlStatusMap,
  normalizeNxctlStatusList,
  normalizePlatformChallengeEntries,
} from '../lib/admin-services-utils'
import type {
  AdminNxctlActionTarget,
  AdminPlatformChallengeEntry,
  AdminRuntimeStatusSnapshot,
  AdminServiceAction,
  AdminServiceRow,
} from '../types'

const EMPTY_RUNTIME_STATUS: AdminRuntimeStatusSnapshot = {
  details: [],
  fetchedAt: null,
  error: null,
  isComplete: false,
}

export function useAdminServicesData() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const statusRunRef = useRef(0)

  const [adminScope, setAdminScope] = useState<AdminScope | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [serviceRows, setServiceRows] = useState<AdminServiceRow[]>([])
  const [platformEntries, setPlatformEntries] = useState<AdminPlatformChallengeEntry[]>([])
  const [platformError, setPlatformError] = useState<string | null>(null)
  const [runtimeStatus, setRuntimeStatus] = useState<AdminRuntimeStatusSnapshot>(EMPTY_RUNTIME_STATUS)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [accessReady, setAccessReady] = useState(true)
  const [actionLoading, setActionLoading] = useState<Record<string, AdminServiceAction | null>>({})
  const [globalActionLoading, setGlobalActionLoading] = useState<'up' | 'down' | null>(null)

  const isAllowed = Boolean(adminScope?.is_global_admin || adminScope?.event_ids.length)
  const isGlobalAdmin = Boolean(adminScope?.is_global_admin)

  const loadPlatformEntries = useCallback(async (accessToken?: string | null) => {
    if (!accessToken) {
      return {
        entries: [] as AdminPlatformChallengeEntry[],
        error: 'Admin session not found',
      }
    }

    try {
      const res = await fetch('/api/nxctl?action=admin-challenges', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      const data = await res.json()

      if (!res.ok || !Array.isArray(data)) {
        return {
          entries: [] as AdminPlatformChallengeEntry[],
          error: getNxctlErrorMessage(data),
        }
      }

      return {
        entries: normalizePlatformChallengeEntries(data),
        error: null,
      }
    } catch (error: any) {
      console.error('Failed to fetch NXCTL platform challenges', error)
      return {
        entries: [] as AdminPlatformChallengeEntry[],
        error: error?.message || 'Failed to fetch NXCTL platform challenges',
      }
    }
  }, [])

  const loadStatus = useCallback(async (rows: AdminServiceRow[], accessToken?: string | null) => {
    const runId = statusRunRef.current + 1
    statusRunRef.current = runId
    setStatusLoading(true)

    try {
      let data: unknown = null
      let statusError: string | null = null
      let isComplete = false

      if (accessToken) {
        const liveRes = await fetch(buildLiveServicesUrl([]), {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        data = await liveRes.json()
        if (statusRunRef.current !== runId) return

        if (liveRes.ok && Array.isArray(data)) {
          isComplete = true
        } else {
          statusError = getNxctlErrorMessage(data)
          data = null
        }
      }

      if (!Array.isArray(data) && rows.length > 0) {
        const res = await fetch(buildNxctlStatusUrl(rows), {
          headers: buildNxctlStatusHeaders(rows),
        })
        data = await res.json()
        if (statusRunRef.current !== runId) return

        if (!res.ok || !Array.isArray(data)) {
          statusError = getNxctlErrorMessage(data)
          data = []
        }
      }

      const fetchedAt = Date.now()
      const details = normalizeNxctlStatusList(data)
      setRuntimeStatus({
        details,
        fetchedAt,
        error: statusError,
        isComplete,
      })

      if (!Array.isArray(data) || details.length === 0) {
        const message = statusError || 'No NXCTL runtime data returned'
        setServiceRows(rows.map((row) => ({
          ...row,
          details: null,
          error: message,
          fetchedAt,
        })))
        return
      }

      const statusByName = getNxctlStatusMap(details)

      setServiceRows(rows.map((row) => {
        const detail = statusByName.get(row.service.name)
        return {
          ...row,
          details: detail ?? null,
          error: detail ? null : 'Service is not visible from NXCTL status. Check service name or challenge key.',
          fetchedAt,
        }
      }))
    } catch (error: any) {
      if (statusRunRef.current !== runId) return
      console.error('Failed to fetch NXCTL services status', error)
      const message = error?.message || 'Failed to fetch NXCTL services status'
      setRuntimeStatus({
        details: [],
        fetchedAt: Date.now(),
        error: message,
        isComplete: false,
      })
      setServiceRows(rows.map((row) => ({
        ...row,
        details: null,
        error: message,
        fetchedAt: Date.now(),
      })))
    } finally {
      if (statusRunRef.current === runId) setStatusLoading(false)
    }
  }, [])

  const initServicesData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true)
    else setIsRefreshing(true)

    try {
      const scope = await getAdminScope()
      setAdminScope(scope)
      setAccessReady(true)

      if (!scope.is_global_admin && scope.event_ids.length === 0) {
        router.push('/challenges')
        return
      }

      const [challengeList, eventList] = await Promise.all([
        getChallengesList(undefined, true, 'all'),
        getEvents(),
      ])
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token || null

      const allowedSet = new Set(scope.event_ids || [])
      const visibleEvents = scope.is_global_admin
        ? eventList
        : eventList.filter((event) => allowedSet.has(String(event.id)))
      const visibleChallenges = scope.is_global_admin
        ? challengeList
        : challengeList.filter((challenge) => {
          if (!challenge.event_id) return false
          return allowedSet.has(String(challenge.event_id))
        })

      setEvents(visibleEvents)
      const rows = buildServiceRows(visibleChallenges, visibleEvents)
      const platformResult = await loadPlatformEntries(accessToken)

      setPlatformEntries(platformResult.entries)
      setPlatformError(platformResult.error)
      setServiceRows(rows)
      setActionLoading(Object.fromEntries(rows.map((row) => [row.id, null])))
      await loadStatus(rows, accessToken)
    } catch (error) {
      console.error('Failed to load admin services data:', error)
      toast.error('Failed to load Services dashboard')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [loadPlatformEntries, loadStatus, router])

  const refresh = useCallback(async () => {
    await initServicesData(true)
  }, [initServicesData])

  const runNxctlAction = useCallback(async (target: AdminNxctlActionTarget, action: AdminServiceAction) => {
    setActionLoading((prev) => ({ ...prev, [target.id]: action }))
    const actionLabel = action === 'up' ? 'start' : action
    const toastId = toast.loading(`${actionLabel}ing ${target.name}...`)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      const res = await fetch('/api/nxctl', {
        method: 'POST',
        headers: buildNxctlHeaders(target.key, true, accessToken),
        body: JSON.stringify({ action, name: target.name, ...(target.force ? { force: true } : {}) }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(`Failed to ${actionLabel} ${target.name}: ${getNxctlErrorMessage(data)}`, { id: toastId })
        return
      }

      toast.success(`NXCTL service ${actionLabel} request completed`, { id: toastId })
      await new Promise((resolve) => setTimeout(resolve, 500))
      await loadStatus(serviceRows, accessToken)
    } catch (error) {
      console.error(`Failed to run NXCTL ${action} for ${target.name}`, error)
      toast.error(`Failed to ${actionLabel} ${target.name}`, { id: toastId })
    } finally {
      setActionLoading((prev) => ({ ...prev, [target.id]: null }))
    }
  }, [loadStatus, serviceRows])

  const runServiceAction = useCallback(async (row: AdminServiceRow, action: AdminServiceAction) => {
    await runNxctlAction({
      id: row.id,
      name: row.service.name,
      key: row.service.key,
      details: row.details,
      error: row.error,
      fetchedAt: row.fetchedAt,
    }, action)
  }, [runNxctlAction])

  const runGlobalServiceAction = useCallback(async (action: 'up' | 'down') => {
    setGlobalActionLoading(action)
    const actionLabel = action === 'up' ? 'Starting' : 'Stopping'
    const toastId = toast.loading(`${actionLabel} all NXCTL services...`)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      if (!accessToken) {
        toast.error('Admin session not found', { id: toastId })
        return
      }

      const res = await fetch('/api/nxctl', {
        method: 'POST',
        headers: buildNxctlHeaders(undefined, true, accessToken),
        body: JSON.stringify({ action, all: true }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(`NXCTL ${action} all failed: ${getNxctlErrorMessage(data)}`, { id: toastId })
        return
      }

      toast.success(`NXCTL ${action} all completed`, { id: toastId })
      await new Promise((resolve) => setTimeout(resolve, 500))
      await loadStatus(serviceRows, accessToken)
    } catch (error) {
      console.error(`Failed to run NXCTL ${action} all`, error)
      toast.error(`NXCTL ${action} all failed`, { id: toastId })
    } finally {
      setGlobalActionLoading(null)
    }
  }, [loadStatus, serviceRows])

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setAccessReady(true)
      router.push('/challenges')
      return
    }

    void initServicesData()
  }, [authLoading, initServicesData, router, user])

  useEffect(() => {
    if (!isAllowed || serviceRows.length === 0) return

    const interval = window.setInterval(async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token || null
      await loadStatus(serviceRows, accessToken)
    }, 30000)

    return () => window.clearInterval(interval)
  }, [isAllowed, loadStatus, serviceRows])

  return {
    user,
    authLoading,
    accessReady,
    isAllowed,
    isGlobalAdmin,
    adminScope,
    events,
    serviceRows,
    platformEntries,
    platformError,
    runtimeStatus,
    isLoading,
    isRefreshing,
    statusLoading,
    actionLoading,
    globalActionLoading,
    refresh,
    runServiceAction,
    runNxctlAction,
    runGlobalServiceAction,
  }
}
