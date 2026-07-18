"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Clock, Loader2, Play, Power, PowerOff, RefreshCcw, Server } from 'lucide-react'
import toast from 'react-hot-toast'
import { parseNxctlService, type NxctlServiceEntry } from '../lib/nxctl-services'
import {
  formatExtendWaitDuration,
  formatServiceSeconds,
  formatShortDuration,
  getChallengeServiceEndpoints,
  getExtendButtonAlertClass,
  getExtendState,
  getRestartState,
  getServiceDisplayName,
  getTimerClass,
  isNxctlNotFoundError,
  type ServiceAction,
  type ServiceActionLoadingState,
} from '../lib/challenge-service-panel-state'
import {
  buildNxctlServiceHeaders,
  buildNxctlStatusHeaders,
  buildNxctlStatusUrl,
  getNxctlErrorMessage,
  getNxctlStatusName,
  isHttpEndpoint,
  normalizeNxctlStatusDetail,
} from '../lib/nxctl-service-utils'

const EXTEND_REMINDER_SOUND = '/sounds/notif_ringtone.mp3'
const EXTEND_REMINDER_VOLUME = 0.25
const EXTEND_SOUND_COOLDOWN_MS = 60000
const STATUS_REFRESH_INTERVAL_MS = 5000

interface ChallengeServicesPanelProps {
  open: boolean
  services?: string[]
}

const ChallengeServicesPanel: React.FC<ChallengeServicesPanelProps> = ({
  open,
  services = [],
}) => {
  const startBtnClass =
    'inline-flex h-7 w-[76px] items-center justify-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-200 shrink-0'

  const restartBtnClass =
    'inline-flex h-7 w-[104px] items-center justify-center gap-1 rounded-lg bg-amber-500/10 px-2.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-200 shrink-0'

  const extendBtnClass =
    'inline-flex h-7 w-[104px] items-center justify-center gap-1 rounded-lg bg-cyan-500/10 px-2.5 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-200 shrink-0'

  const serviceActionButtonIconClass = 'shrink-0'
  const rawServicesKey = services.join('\u0000')
  const parsedServices = useMemo(
    () => (rawServicesKey ? rawServicesKey.split('\u0000') : [])
      .map(parseNxctlService)
      .filter((service) => service.name.trim() !== ''),
    [rawServicesKey]
  )
  const serviceListKey = useMemo(
    () => parsedServices.map((service) => `${service.name}:${service.key || ''}`).join('\u0000'),
    [parsedServices]
  )

  const [serviceDetails, setServiceDetails] = useState<Record<string, any>>({})
  const serviceDetailsRef = React.useRef(serviceDetails)
  serviceDetailsRef.current = serviceDetails
  const [serviceDetailsFetchTime, setServiceDetailsFetchTime] = useState<Record<string, number>>({})
  const [serviceActionLoading, setServiceActionLoading] = useState<Record<string, ServiceActionLoadingState>>({})
  const [serviceDetailsLoading, setServiceDetailsLoading] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    parsedServices.forEach((service) => {
      initial[service.name] = true
    })
    return initial
  })
  const [serviceDetailsError, setServiceDetailsError] = useState<Record<string, string | null>>({})
  const [hiddenServices, setHiddenServices] = useState<Record<string, boolean>>({})
  const [nowTick, setNowTick] = useState<number>(() => Date.now())
  const [lastGlobalFetchTime, setLastGlobalFetchTime] = useState<number>(0)
  const inspectRunRef = React.useRef(0)
  const openPrevRef = React.useRef(false)
  const fetchCompletedRef = React.useRef(!open)
  const lastUpTimestampsRef = React.useRef<Record<string, number>>({})
  const expiryReminderRef = React.useRef<Record<string, boolean>>({})
  const lastExtendSoundAtRef = React.useRef<Record<string, number>>({})
  const extendReminderAudioRef = React.useRef<HTMLAudioElement | null>(null)

  const stopExtendReminderSound = React.useCallback(() => {
    const audio = extendReminderAudioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    extendReminderAudioRef.current = null
  }, [])

  const playExtendReminderSound = React.useCallback(async () => {
    if (!open || document.visibilityState !== 'visible') return false

    const currentAudio = extendReminderAudioRef.current
    if (currentAudio && !currentAudio.paused && currentAudio.currentTime > 0) return true

    const audio = new Audio(EXTEND_REMINDER_SOUND)
    audio.volume = EXTEND_REMINDER_VOLUME
    extendReminderAudioRef.current = audio
    audio.addEventListener('ended', () => {
      if (extendReminderAudioRef.current === audio) {
        extendReminderAudioRef.current = null
      }
    }, { once: true })
    try {
      await audio.play()
      return true
    } catch {
      if (extendReminderAudioRef.current === audio) {
        extendReminderAudioRef.current = null
      }
      return false
    }
  }, [open])

  useEffect(() => {
    return () => stopExtendReminderSound()
  }, [stopExtendReminderSound])

  // Synchronously detect open transitions to prevent stale loading state
  // when dialog reopens during Radix animation (component stays mounted).
  const justOpened = open && !openPrevRef.current
  openPrevRef.current = open
  if (justOpened) {
    fetchCompletedRef.current = false
  }

  const visibleServices = useMemo(
    () => parsedServices.filter((service) => !hiddenServices[service.name]),
    [parsedServices, hiddenServices]
  )

  useEffect(() => {
    const activeNames = new Set(parsedServices.map((service) => service.name))

    setServiceDetails((prev) => {
      const next: Record<string, any> = {}
      Object.entries(prev).forEach(([name, details]) => {
        if (activeNames.has(name)) next[name] = details
      })
      return next
    })
    setServiceDetailsFetchTime((prev) => {
      const next: Record<string, number> = {}
      Object.entries(prev).forEach(([name, fetchTime]) => {
        if (activeNames.has(name)) next[name] = fetchTime
      })
      return next
    })
    setServiceDetailsLoading(() => {
      const next: Record<string, boolean> = {}
      parsedServices.forEach((service) => {
        next[service.name] = true
      })
      return next
    })
    setServiceDetailsError(() => {
      const next: Record<string, string | null> = {}
      parsedServices.forEach((service) => {
        next[service.name] = null
      })
      return next
    })
    setServiceActionLoading(() => {
      const next: Record<string, ServiceActionLoadingState> = {}
      parsedServices.forEach((service) => {
        next[service.name] = null
      })
      return next
    })
    setHiddenServices(() => {
      const next: Record<string, boolean> = {}
      parsedServices.forEach((service) => {
        next[service.name] = false
      })
      return next
    })
    expiryReminderRef.current = {}
  }, [serviceListKey, parsedServices])

  useEffect(() => {
    if (!open || parsedServices.length === 0) return

    const runId = inspectRunRef.current + 1
    inspectRunRef.current = runId
    const isCurrentRun = () => inspectRunRef.current === runId

    const loadStatus = async () => {
      const serviceNames = new Set(parsedServices.map((service) => service.name))
      setServiceDetailsLoading((prev) => {
        const next = { ...prev }
        let changed = false
        parsedServices.forEach((service) => {
          const hasData = serviceDetailsRef.current[service.name] !== undefined
          if (!hasData && !prev[service.name]) {
            next[service.name] = true
            changed = true
          } else if (hasData && prev[service.name]) {
            next[service.name] = false
            changed = true
          }
        })
        return changed ? next : prev
      })
      setServiceDetailsError((prev) => {
        const next = { ...prev }
        let changed = false
        parsedServices.forEach((service) => {
          if (!fetchCompletedRef.current && prev[service.name] !== null) {
            next[service.name] = null
            changed = true
          }
        })
        return changed ? next : prev
      })

      try {
        const res = await fetch(buildNxctlStatusUrl(parsedServices), {
          headers: buildNxctlStatusHeaders(parsedServices),
        })
        const data = await res.json()
        if (!isCurrentRun()) return

        if (!res.ok || !Array.isArray(data)) {
          const message = getNxctlErrorMessage(data)
          setServiceDetailsError((prev) => {
            const next = { ...prev }
            parsedServices.forEach((service) => {
              next[service.name] = message
            })
            return next
          })
          return
        }

        const statusByName = new Map<string, any>()
        data.forEach((item: any) => {
          const name = getNxctlStatusName(item)
          if (name) statusByName.set(name, normalizeNxctlStatusDetail(item))
        })

        const fetchedAt = Date.now()
        setLastGlobalFetchTime(fetchedAt)
        setServiceDetails((prev) => {
          const next = { ...prev }
          parsedServices.forEach((service) => {
            const detail = statusByName.get(service.name)
            if (detail) {
              next[service.name] = detail
            } else {
              delete next[service.name]
            }
          })
          return next
        })
        setServiceDetailsFetchTime((prev) => {
          const next = { ...prev }
          parsedServices.forEach((service) => {
            if (statusByName.has(service.name)) {
              next[service.name] = fetchedAt
            } else {
              delete next[service.name]
            }
          })
          return next
        })
        setServiceDetailsError((prev) => {
          const next = { ...prev }
          parsedServices.forEach((service) => {
            next[service.name] = statusByName.has(service.name)
              ? null
              : 'Service is not visible from NXCTL status. Check the service name or challenge key.'
          })
          return next
        })
        setHiddenServices((prev) => {
          const next = { ...prev }
          parsedServices.forEach((service) => {
            if (serviceNames.has(service.name)) next[service.name] = false
          })
          return next
        })
      } catch (error: any) {
        if (!isCurrentRun()) return
        console.error('Failed to fetch service status', error)
        setServiceDetailsError((prev) => {
          const next = { ...prev }
          parsedServices.forEach((service) => {
            next[service.name] = error.message || 'Failed to fetch service status'
          })
          return next
        })
      } finally {
        if (isCurrentRun()) {
          fetchCompletedRef.current = true
          setServiceDetailsLoading((prev) => {
            const next = { ...prev }
            let changed = false
            parsedServices.forEach((service) => {
              if (prev[service.name]) {
                next[service.name] = false
                changed = true
              }
            })
            return changed ? next : prev
          })
        }
      }
    }

    loadStatus()
    const intervalId = window.setInterval(loadStatus, STATUS_REFRESH_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
      inspectRunRef.current += 1
    }
  }, [open, parsedServices])

  // global ticking state to re-render countdowns every second while panel is open
  useEffect(() => {
    if (!open) return
    const id = setInterval(() => setNowTick(Date.now()), 1000)
    return () => clearInterval(id)
  }, [open])

  useEffect(() => {
    if (!open) {
      expiryReminderRef.current = {}
      lastExtendSoundAtRef.current = {}
      stopExtendReminderSound()
      return
    }

    const now = Date.now()
    visibleServices.forEach((service) => {
      const details = serviceDetails[service.name]
      const isRunning = details?.runtime?.status === 'running'
      const remainingSecFromApi = details?.runtime?.remaining_seconds ?? null
      const fetchTime = serviceDetailsFetchTime[service.name] ?? nowTick
      const timeSinceFetch = Math.max(0, (nowTick - fetchTime) / 1000)
      const remainingSec = remainingSecFromApi !== null ? Math.max(0, remainingSecFromApi - timeSinceFetch) : null
      const extendState = getExtendState(details, remainingSec, timeSinceFetch)
      const thresholdSec = extendState.thresholdSeconds
      const canExtend = extendState.canExtend

      // Reset toast state if no longer in extend window
      if (!isRunning || remainingSec === null || remainingSec <= 0 || !canExtend || remainingSec > thresholdSec) {
        expiryReminderRef.current[service.name] = false
        return
      }

      // Play sound at most once per EXTEND_SOUND_COOLDOWN_MS
      const lastSoundAt = lastExtendSoundAtRef.current[service.name] ?? 0
      if (now - lastSoundAt >= EXTEND_SOUND_COOLDOWN_MS) {
        lastExtendSoundAtRef.current[service.name] = now
        void playExtendReminderSound()
      }

      // Show toast once per dialog session
      if (expiryReminderRef.current[service.name]) return
      expiryReminderRef.current[service.name] = true
      toast(
        `${getServiceDisplayName(service.name)} expires in ${formatServiceSeconds(Math.floor(remainingSec))}. Extend it if needed.`,
        {
          icon: '!',
          duration: 7000,
          id: `nxctl-expiry-${service.name}`,
        }
      )
    })
  }, [open, visibleServices, serviceDetails, serviceDetailsFetchTime, nowTick, playExtendReminderSound, stopExtendReminderSound])

  const inspectService = React.useCallback(async (service: NxctlServiceEntry) => {
    setServiceDetailsLoading((prev) => ({ ...prev, [service.name]: true }))
    setServiceDetailsError((prev) => ({ ...prev, [service.name]: null }))
    try {
      const resInspect = await fetch(`/api/nxctl?action=inspect&name=${encodeURIComponent(service.name)}`, {
        headers: buildNxctlServiceHeaders(service),
      })
      const dataInspect = await resInspect.json()
      if (resInspect.ok) {
        setServiceDetails((prev) => ({ ...prev, [service.name]: normalizeNxctlStatusDetail(dataInspect) }))
        setServiceDetailsFetchTime((prev) => ({ ...prev, [service.name]: Date.now() }))
        setServiceDetailsError((prev) => ({ ...prev, [service.name]: null }))
      } else {
        if (isNxctlNotFoundError(resInspect.status, dataInspect)) {
          setHiddenServices((prev) => ({ ...prev, [service.name]: true }))
        } else {
          setServiceDetailsError((prev) => ({ ...prev, [service.name]: getNxctlErrorMessage(dataInspect) }))
        }
      }
    } catch (error: any) {
      console.error(`Failed to refresh service details for ${service.name}`, error)
      setServiceDetailsError((prev) => ({ ...prev, [service.name]: error.message || 'Failed to inspect service status' }))
    } finally {
      setServiceDetailsLoading((prev) => ({ ...prev, [service.name]: false }))
    }
  }, [])

  const handleServiceAction = async (service: NxctlServiceEntry, action: ServiceAction) => {
    const details = serviceDetails[service.name]
    const isRunning = details?.runtime?.status === 'running'

    if (action === 'up') {
      if (isRunning) {
        toast.error('Service is already running.')
        return
      }

      const lastUp = lastUpTimestampsRef.current[service.name]
      if (lastUp && Date.now() - lastUp < 10000) {
        toast.error('Service is still starting. Please wait a moment.')
        return
      }
      lastUpTimestampsRef.current[service.name] = Date.now()
    }

    if (action === 'restart') {
      const restartState = getRestartState(details)

      if (!restartState.enabled) {
        toast.error('Restart is disabled for this challenge.')
        return
      }

      if (!isRunning) {
        toast.error('Cannot restart: service is not running.')
        return
      }

      if (restartState.cooldownSeconds > 0) {
        toast.error(`Restart cooldown active. Wait ${formatServiceSeconds(restartState.cooldownSeconds)}.`)
        return
      }
    }

    setServiceActionLoading((prev) => ({ ...prev, [service.name]: action }))
    const serviceDisplayName = getServiceDisplayName(service.name)
    const toastId = toast.loading(`${action}ing ${serviceDisplayName}...`)

    try {
      const res = await fetch('/api/nxctl', {
        method: 'POST',
        headers: buildNxctlServiceHeaders(service, true),
        body: JSON.stringify({ action, name: service.name }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(`Successfully ${action}ed ${serviceDisplayName}`, { id: toastId })
        await new Promise((resolve) => setTimeout(resolve, 500))
        await inspectService(service)
      } else {
        toast.error(`Failed to ${action} ${serviceDisplayName}: ${getNxctlErrorMessage(data)}`, { id: toastId })
      }
    } catch (error) {
      console.error(`Failed to ${action} ${service.name}`, error)
      toast.error(`Error ${action}ing ${serviceDisplayName}`, { id: toastId })
    } finally {
      setServiceActionLoading((prev) => ({ ...prev, [service.name]: null }))
    }
  }

  if (visibleServices.length === 0) return null

  return (
    <div>
      <p className="select-none text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1.5 opacity-90">
        <Server className="h-3.5 w-3.5 text-indigo-500/70 shrink-0" />
        <span>NXCTL Services</span>
        {lastGlobalFetchTime > 0 && (() => {
          const elapsedMs = nowTick - lastGlobalFetchTime
          const remainingMs = Math.max(0, STATUS_REFRESH_INTERVAL_MS - elapsedMs)
          const remainingSec = Math.ceil(remainingMs / 1000)
          return (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-medium tabular-nums text-gray-500 dark:text-gray-600 opacity-80" title="Next refresh in">
              <RefreshCcw size={9} className={`shrink-0 ${remainingSec <= 1 ? 'animate-spin' : ''}`} />
              {remainingSec}s
            </span>
          )
        })()}
      </p>
      <div className="grid grid-cols-1 gap-2">
        {visibleServices.map((service, idx) => {
          const serviceDisplayName = getServiceDisplayName(service.name)
          const details = serviceDetails[service.name]
          const isRunning = details?.runtime?.status === 'running'
          const hasPublishedPort = Boolean(details?.challenge?.port) || (Array.isArray(details?.challenge?.ports) && details.challenge.ports.length > 0)
          const endpoints = getChallengeServiceEndpoints(service, details)

          // Use remaining_seconds directly from API and keep countdown local between refreshes.
          const remainingSecFromApi = details?.runtime?.remaining_seconds ?? null
          const fetchTime = serviceDetailsFetchTime[service.name] ?? nowTick
          const timeSinceFetch = Math.max(0, (nowTick - fetchTime) / 1000)
          const remainingSec = remainingSecFromApi !== null ? Math.max(0, remainingSecFromApi - timeSinceFetch) : null

          const extendState = getExtendState(details, remainingSec, timeSinceFetch)
          const thresholdSec = extendState.thresholdSeconds
          const canExtend = extendState.canExtend
          const restartState = getRestartState(details)
          const restartEnabled = restartState.enabled
          const restartCooldownSec = restartState.cooldownSeconds
          const restartCooldownLabel = formatShortDuration(restartCooldownSec)
          const restartDisabledLabel = !restartEnabled ? 'Off' : null
          const extendCooldownLabel = extendState.cooldownSeconds > 0
            ? formatShortDuration(extendState.cooldownSeconds)
            : null
          const extendDelayLabel = !canExtend
            ? extendCooldownLabel || formatExtendWaitDuration(extendState.waitSeconds)
            : null
          const extendButtonAlertClass = getExtendButtonAlertClass(canExtend, isRunning, remainingSec)
          const timerClass = getTimerClass(remainingSec, thresholdSec)
          const errorMessage = serviceDetailsError[service.name]
          const isLoading = ((serviceDetailsLoading[service.name] ?? (!details && open)) || (open && !fetchCompletedRef.current)) && !errorMessage
          const actionLoading = serviceActionLoading[service.name] ?? null
          const isActionLoading = actionLoading !== null
          const isContainerOnly = isRunning && !hasPublishedPort && endpoints.length === 0
          const statusLabel = !details
            ? 'Unknown'
            : isRunning
              ? isContainerOnly
                ? 'Container only'
                : 'Running'
              : 'Not running'
          const statusClass = !details
            ? 'border-gray-700/60 bg-gray-900/40 text-gray-500'
            : isRunning
              ? isContainerOnly
                ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
                : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
              : 'border-gray-600/40 bg-gray-800/30 text-gray-400'

          return (
            <div key={`${service.name}-${idx}`} className="group flex min-h-[74px] flex-col gap-2 px-3 py-2.5 rounded-xl border border-gray-200/50 bg-gray-50/30 hover:border-indigo-500/30 hover:shadow-[0_4px_20px_rgba(99,102,241,0.05)] dark:border-gray-800/60 dark:bg-[#0e1320]/30 transition-all duration-200">
              {/* Header: name + action buttons + timer */}
              <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 min-h-9">
                <div className="min-w-0 color-primary font-medium truncate">
                  {serviceDisplayName}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    className={startBtnClass}
                    onClick={() => handleServiceAction(service, 'up')}
                    title={(() => {
                      if (isLoading) return 'Checking status...'
                      if (errorMessage) return `Error: ${errorMessage}`
                      if (isActionLoading) return 'Please wait...'
                      if (isRunning) return 'Service is already running'
                      return 'Start Service'
                    })()}
                    disabled={
                      isLoading ||
                      !!errorMessage ||
                      isActionLoading ||
                      isRunning
                    }
                  >
                    {actionLoading === 'up' ? <Loader2 size={12} className={`${serviceActionButtonIconClass} animate-spin`} /> : <Play size={12} className={serviceActionButtonIconClass} />}
                    <span>Start</span>
                  </button>
                  <button
                    type="button"
                    className={restartBtnClass}
                    onClick={() => handleServiceAction(service, 'restart')}
                    title={(() => {
                      if (isLoading) return 'Checking status...'
                      if (errorMessage) return `Error: ${errorMessage}`
                      if (isActionLoading) return 'Please wait...'
                      if (!restartEnabled) return 'Restart is disabled for this challenge'
                      if (!isRunning) return 'Cannot restart: service is not running'
                      if (restartCooldownSec && restartCooldownSec > 0) return `Restart cooldown: ${formatServiceSeconds(restartCooldownSec)}`
                      return 'Restart Service'
                    })()}
                    disabled={
                      isLoading ||
                      !!errorMessage ||
                      isActionLoading ||
                      !restartEnabled ||
                      !isRunning ||
                      !!(restartCooldownSec && restartCooldownSec > 0)
                    }
                  >
                    {actionLoading === 'restart' ? <Loader2 size={12} className={`${serviceActionButtonIconClass} animate-spin`} /> : <RefreshCcw size={12} className={serviceActionButtonIconClass} />}
                    <span>Restart</span>
                    {restartCooldownLabel && (
                      <span className="rounded bg-yellow-500/10 px-1 text-[9px] font-bold text-yellow-300">
                        {restartCooldownLabel}
                      </span>
                    )}
                    {restartDisabledLabel && (
                      <span className="rounded bg-red-500/10 px-1 text-[9px] font-bold text-red-300">
                        {restartDisabledLabel}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    className={`${extendBtnClass} ${extendButtonAlertClass}`}
                    onClick={() => handleServiceAction(service, 'extend')}
                    title={(() => {
                      if (isLoading) return 'Checking status...'
                      if (errorMessage) return `Error: ${errorMessage}`
                      if (isActionLoading) return 'Please wait...'
                      if (!isRunning) return 'Cannot extend: service is not running'
                      if (remainingSec === null) return 'No expiration available to extend'
                      if (!canExtend) {
                        if (extendCooldownLabel) return `Extend cooldown: ${formatServiceSeconds(extendState.cooldownSeconds)}`
                        if (extendDelayLabel) return `Can extend in about ${extendDelayLabel}`
                        return `Can extend when remaining <= ${formatServiceSeconds(thresholdSec)}`
                      }
                      return `Extend service time`
                    })()}
                    disabled={
                      isLoading ||
                      !!errorMessage ||
                      isActionLoading ||
                      !isRunning ||
                      remainingSec === null ||
                      !canExtend
                    }
                  >
                    {actionLoading === 'extend' ? <Loader2 size={12} className={`${serviceActionButtonIconClass} animate-spin`} /> : <Clock size={12} className={serviceActionButtonIconClass} />}
                    <span>Extend</span>
                    {extendDelayLabel && (
                      <span className="rounded bg-cyan-500/10 px-1 text-[9px] font-bold text-cyan-300">
                        {extendDelayLabel}
                      </span>
                    )}
                  </button>
                </div>

                {isRunning && remainingSec !== null ? (
                  <span
                    className={`inline-flex h-7 w-[115px] select-none items-center justify-between gap-1 rounded-md border px-2 text-[10px] font-semibold tabular-nums ${timerClass}`}
                    title="Time remaining"
                  >
                    <Clock size={11} className="shrink-0 opacity-80" />
                    {formatServiceSeconds(Math.floor(remainingSec))}
                  </span>
                ) : (
                  <span
                    className={`inline-flex h-7 w-[115px] select-none items-center justify-between gap-1 rounded-md border px-2 text-[10px] font-semibold tabular-nums ${statusClass}`}
                    title="Runtime status"
                  >
                    {isRunning ? <Power size={11} className="shrink-0 opacity-80" /> : <Clock size={11} className="shrink-0 opacity-80" />}
                    {statusLabel}
                  </span>
                )}
              </div>

              {/* Per-service loading */}
              {isLoading && !details && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 select-none">
                  <Loader2 size={10} className="animate-spin text-blue-500" />
                  <span>Checking...</span>
                </div>
              )}

              {/* Per-service error */}
              {errorMessage && (
                <div className="flex items-center gap-1.5 text-[11px] select-none">
                  <AlertTriangle size={11} className="shrink-0 text-red-500/80" />
                  <span className="text-red-400 truncate flex-1">{errorMessage}</span>
                  {!errorMessage.includes('not visible') && (
                    <button
                      type="button"
                      className="text-[11px] text-blue-500 hover:text-blue-400 hover:underline font-medium flex items-center gap-0.5 shrink-0 disabled:opacity-50"
                      onClick={() => inspectService(service)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 size={9} className="animate-spin" />
                      ) : (
                        <RefreshCcw size={9} />
                      )}
                      Retry
                    </button>
                  )}
                </div>
              )}

              {/* Endpoints (only when running) */}
              {details && isRunning && (
                endpoints.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {endpoints.map((endpoint: any) => (
                      <div key={endpoint.key} className="flex min-w-0 flex-col gap-1">
                        {endpoint.isTcp || !isHttpEndpoint(endpoint.endpoint) ? (
                          <div className="flex min-w-0 flex-col gap-1">
                            <div className={`grid items-center gap-2 min-w-0 ${endpoint.isSsh && endpoint.password ? 'grid-cols-[minmax(0,1fr)_minmax(70px,120px)_auto]' : 'grid-cols-[minmax(0,1fr)_auto]'}`}>
                              <code className={`min-w-0 truncate rounded border px-2 py-1 font-mono text-[11px] ${endpoint.isSsh ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'}`}>
                                {endpoint.command}
                              </code>
                              {endpoint.isSsh && endpoint.password && (
                                <code
                                  className="min-w-0 truncate rounded border border-amber-500/20 bg-amber-500/10 px-2 py-1 font-mono text-[11px] text-amber-300"
                                  title={`Password: ${endpoint.password}`}
                                >
                                  <span className="select-none pr-1 text-[9px] font-bold uppercase tracking-wider text-amber-500/70">pw</span>
                                  {endpoint.password}
                                </code>
                              )}
                              <button
                                className={`select-none shrink-0 rounded px-2 py-1 text-[10px] font-bold transition duration-200 ${endpoint.isSsh ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'}`}
                                onClick={() => {
                                  navigator.clipboard.writeText(endpoint.copyText)
                                  toast.success(endpoint.copyMessage)
                                }}
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <a href={endpoint.endpoint} target="_blank" rel="noreferrer" className="col-span-2 block w-full truncate rounded border border-blue-500/15 bg-blue-500/5 px-2 py-1 text-[11px] font-medium text-blue-400 transition hover:text-blue-300 hover:underline">
                            {endpoint.endpoint}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  isContainerOnly ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 select-none">
                      <Power size={11} className="shrink-0 opacity-70" />
                      Running without published endpoint
                    </span>
                  ) : (
                    <span className="text-[11px] text-yellow-500">Waiting for endpoint allocation...</span>
                  )
                )
              )}

              {/* Stopped state - minimal */}
              {details && !isRunning && (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 select-none">
                  <PowerOff size={11} className="shrink-0 opacity-70" />
                  Stopped
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ChallengeServicesPanel
