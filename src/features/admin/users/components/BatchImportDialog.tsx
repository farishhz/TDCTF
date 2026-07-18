"use client"

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Button, Input } from '@/shared/ui'
import ConfirmDialog from '@/shared/components/ConfirmDialog'
import { DIALOG_CONTENT_CLASS_4XL } from '@/shared/styles'
import { getEvents } from '@/features/events/services/event.service'
import { adminBatchCreateUsers } from '../services/admin-users.service'
import type { Event } from '@/shared/types'
import { useSystemSettings } from '@/shared/contexts/SystemSettingsContext'
import { updateSystemSettings } from '@/features/admin/services/admin.service'
import {
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Loader2,
  HelpCircle,
  FileText,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react'
import toast from 'react-hot-toast'

interface BatchImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface ParsedUserRow {
  id: string
  username: string
  email: string
  password: string
  team: string
  error?: string | null
}

export default function BatchImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: BatchImportDialogProps) {
  const { settings, refresh: refreshSystemSettings } = useSystemSettings()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [users, setUsers] = useState<ParsedUserRow[]>([])
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    successCount: number
    failedCount: number
    results: Array<{ username: string; email: string; success: boolean; error: string | null }>
  } | null>(null)

  // Extra UI states
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({})
  const [copiedEmails, setCopiedEmails] = useState<Record<string, boolean>>({})
  const [copiedAll, setCopiedAll] = useState(false)
  const [showRegConfirm, setShowRegConfirm] = useState(false)

  // Fetch events list on mount/open
  useEffect(() => {
    if (open) {
      getEvents()
        .then((data) => {
          setEvents(data || [])
          if (data && data.length > 0) {
            // Default to first active event or empty
            setSelectedEventId(data[0].id)
          }
        })
        .catch((err) => {
          console.error('Failed to fetch events:', err)
        })
      // Reset state
      setStep(1)
      setUsers([])
      setImportResult(null)
      setImporting(false)
      setVisiblePasswords({})
      setCopiedEmails({})
      setCopiedAll(false)
      setShowRegConfirm(false)
    }
  }, [open])

  const handleClose = (isOpen: boolean) => {
    onOpenChange(isOpen)
  }

  // Custom CSV parser (RFC-4180 compliant)
  const parseCSV = (text: string): string[][] => {
    const lines = text.split(/\r?\n/)
    const result: string[][] = []

    for (let line of lines) {
      if (!line.trim()) continue
      const row: string[] = []
      let inQuotes = false
      let current = ''

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          row.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      row.push(current.trim())
      result.push(row)
    }
    return result
  }

  // Handle CSV file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const parsed = parseCSV(text)

        if (parsed.length <= 1) {
          toast.error('CSV file is empty or only contains headers')
          return
        }

        // Detect headers
        const headers = parsed[0].map(h => h.toLowerCase().trim())
        const usernameIdx = headers.indexOf('username')
        const emailIdx = headers.indexOf('email')
        const passwordIdx = headers.indexOf('password')
        const teamIdx = headers.indexOf('team')

        if (usernameIdx === -1 || emailIdx === -1 || passwordIdx === -1) {
          toast.error('CSV must contain "username", "email", and "password" headers')
          return
        }

        const rows: ParsedUserRow[] = []
        for (let i = 1; i < parsed.length; i++) {
          const rowData = parsed[i]
          if (rowData.length < 3) continue // Skip incomplete rows

          const username = (rowData[usernameIdx] || '').trim()
          const email = (rowData[emailIdx] || '').trim()
          const password = (rowData[passwordIdx] || '').trim()
          const team = teamIdx !== -1 ? (rowData[teamIdx] || '').trim() : ''

          // Skip rows where all required fields are empty (blank/None rows from Excel)
          if (!username && !email && !password) continue

          rows.push({
            id: `row-${Date.now()}-${i}-${Math.random()}`,
            username,
            email,
            password,
            team,
            error: null
          })
        }

        if (rows.length === 0) {
          toast.error('No valid rows found in CSV')
          return
        }

        setUsers(rows)
        setStep(2)
        toast.success(`Successfully parsed ${rows.length} rows!`)
      } catch (err) {
        toast.error('Failed to parse CSV file')
        console.error(err)
      }
    }
    reader.readAsText(file)
  }

  // Download CSV template
  const downloadTemplate = () => {
    const csvContent = 'username,email,password,team\nuser_demo1,demo1@nxctf.com,password123,Team Alpha\nuser_demo2,demo2@nxctf.com,password123,Team Beta'
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'nxctf_user_import_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Edit a cell inline
  const handleCellEdit = (rowId: string, field: keyof ParsedUserRow, value: string) => {
    setUsers((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    )
  }

  // Delete a row
  const handleDeleteRow = (rowId: string) => {
    setUsers((prev) => prev.filter((row) => row.id !== rowId))
  }

  // Add a new empty row
  const handleAddRow = () => {
    const newRow: ParsedUserRow = {
      id: `row-${Date.now()}-${Math.random()}`,
      username: '',
      email: '',
      password: '',
      team: '',
      error: null
    }
    setUsers((prev) => [...prev, newRow])
  }

  // Inline Client Validation
  const validateRows = (rows: ParsedUserRow[]) => {
    const errors: Record<string, string[]> = {}
    const emails = new Set<string>()
    const usernames = new Set<string>()

    rows.forEach((row) => {
      const rowErrors: string[] = []
      const email = row.email.trim().toLowerCase()
      const username = row.username.trim()
      const password = row.password

      if (!username) {
        rowErrors.push('Username required')
      } else if (!/^[a-zA-Z0-9_. -]+$/.test(username)) {
        rowErrors.push('Invalid username chars')
      } else if (usernames.has(username)) {
        rowErrors.push('Duplicate username')
      }
      usernames.add(username)

      if (!email) {
        rowErrors.push('Email required')
      } else if (!/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/.test(email)) {
        rowErrors.push('Invalid email format')
      } else if (emails.has(email)) {
        rowErrors.push('Duplicate email')
      }
      emails.add(email)

      if (!password) {
        rowErrors.push('Password required')
      } else if (password.length < 6) {
        rowErrors.push('Password < 6 chars')
      }

      if (rowErrors.length > 0) {
        errors[row.id] = rowErrors
      }
    })

    return errors
  }

  const rowValidationErrors = validateRows(users)
  const hasValidationErrors = Object.keys(rowValidationErrors).length > 0

  // Run Import
  const handleImport = async () => {
    if (users.length === 0) return
    if (hasValidationErrors) {
      toast.error('Please fix validation errors before importing')
      return
    }

    // If registration is disabled, show confirmation dialog
    if (settings.disable_signup) {
      setShowRegConfirm(true)
      return
    }

    // Registration is already enabled, proceed directly
    await executeImport(false)
  }

  // Actual import logic, called directly or from ConfirmDialog
  const executeImport = async (needsTempEnable: boolean) => {
    let wasTempEnabled = false

    if (needsTempEnable) {
      const res = await updateSystemSettings({ disable_signup: 'false' })
      if (res.success) {
        await refreshSystemSettings()
        wasTempEnabled = true
      } else {
        toast.error('Failed to temporarily enable registration.')
        return
      }
    }

    setImporting(true)
    try {
      // Map payload fields
      const payload = users.map((row) => ({
        username: row.username.trim(),
        email: row.email.trim().toLowerCase(),
        password: row.password,
        team: row.team.trim() || null
      }))

      const result = await adminBatchCreateUsers(payload, selectedEventId || null)
      if (result.success) {
        setImportResult({
          successCount: result.successCount,
          failedCount: result.failedCount,
          results: result.results
        })
        setStep(3)
        if (result.failedCount === 0) {
          toast.success(`Successfully imported all ${result.successCount} users!`)
        } else {
          toast(`Imported ${result.successCount} users. ${result.failedCount} failed.`, { icon: '⚠️' })
        }
      } else {
        toast.error(result.error || 'Failed to execute import batch')
      }
    } catch (err: any) {
      toast.error(err.message || 'Import failed')
    } finally {
      setImporting(false)
      if (wasTempEnabled) {
        try {
          await updateSystemSettings({ disable_signup: 'true' })
          await refreshSystemSettings()
          toast('Registration re-disabled.', { icon: '🔒' })
        } catch (err) {
          console.error('Failed to restore signup setting:', err)
        }
      }
    }
  }

  // Handle Drag & Drop
  const [dragActive, setDragActive] = useState(false)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
        toast.error('Only CSV files are supported')
        return
      }
      const eventMock = {
        target: {
          files: e.dataTransfer.files
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileChange(eventMock)
    }
  }

  // Match success users to include passwords
  const successfulRegisteredUsers = React.useMemo(() => {
    if (!importResult) return []
    return importResult.results
      .filter((r) => r.success)
      .map((r) => {
        const emailLower = r.email.trim().toLowerCase()
        const userMatch = users.find(
          (u) =>
            u.email.trim().toLowerCase() === emailLower ||
            u.username.trim() === r.username.trim()
        )
        return {
          username: r.username,
          email: r.email,
          password: userMatch ? userMatch.password : '••••••',
          team: userMatch ? userMatch.team : ''
        }
      })
  }, [importResult, users])

  // Toggle visible password
  const togglePasswordVisibility = (email: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [email]: !prev[email],
    }))
  }

  // Copy single user credentials
  const handleCopySingle = async (row: typeof successfulRegisteredUsers[0]) => {
    const loginUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const credText = `Platform: ${loginUrl}\nUsername: ${row.username}\nEmail: ${row.email}\nPassword: ${row.password}${row.team ? `\nTeam: ${row.team}` : ''}`
    try {
      await navigator.clipboard.writeText(credText)
      setCopiedEmails((prev) => ({ ...prev, [row.email]: true }))
      toast.success(`Copied credentials for ${row.username}`)
      setTimeout(() => {
        setCopiedEmails((prev) => ({ ...prev, [row.email]: false }))
      }, 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  // Copy all successful credentials
  const handleCopyAll = async () => {
    if (successfulRegisteredUsers.length === 0) return
    const loginUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const allCredsText = `Platform: ${loginUrl}\n\n` + successfulRegisteredUsers
      .map((u, idx) => `[#${idx + 1}] Username: ${u.username} | Email: ${u.email} | Password: ${u.password}${u.team ? ` | Team: ${u.team}` : ''}`)
      .join('\n')

    try {
      await navigator.clipboard.writeText(allCredsText)
      setCopiedAll(true)
      toast.success('Copied all credentials to clipboard!')
      setTimeout(() => setCopiedAll(false), 2000)
    } catch {
      toast.error('Failed to copy credentials')
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`${DIALOG_CONTENT_CLASS_4XL} w-[92vw] h-[85vh] flex flex-col p-0 overflow-hidden`}>
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-gray-200/50 dark:border-gray-800/60 bg-gray-50/50 dark:bg-[#070a10]/50 shrink-0">
          <DialogTitle className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="text-blue-500 shrink-0" size={22} />
            <span>Batch Register Users</span>
          </DialogTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Batch create user accounts, set passwords, assign teams, and register them to events using a spreadsheet.
          </p>
        </DialogHeader>

        {/* Warning if signup is disabled globally */}
        {settings.disable_signup && step !== 3 && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-amber-500 shrink-0">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="text-[11px] font-bold leading-normal">
              User registration is currently disabled globally. It will be temporarily enabled during import and restored immediately after.
            </span>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 scroll-hidden flex flex-col min-h-0 bg-white/40 dark:bg-transparent">
          {step === 1 && (
            <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full py-8 space-y-6">
              {/* Drag Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-150 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 scale-102'
                    : 'border-gray-300 dark:border-gray-700 hover:border-blue-500/40 hover:bg-gray-50/50 dark:hover:bg-[#111622]/40'
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 mb-4 animate-bounce">
                  <Upload size={26} />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Drag and drop your CSV file here
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-6">
                  or click to choose file from your device
                </p>
                <input
                  type="file"
                  id="csv-upload"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-blue-600/30 text-blue-600 dark:border-blue-500/30 dark:text-blue-400 pointer-events-none font-bold text-xs"
                >
                  Choose File
                </Button>
              </div>

              {/* Template Download */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200/60 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111622]/30 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                    <Download size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      Unduh Template CSV
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      Format kolom: username, email, password, team
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={downloadTemplate}
                  className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 shrink-0"
                >
                  Download
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-grow flex flex-col h-full min-h-0 space-y-3">
              {/* Event Setup Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-gray-200/60 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111622]/30 shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <AlertCircle size={13} className="text-blue-500 shrink-0" />
                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    Sandingkan Peserta ke Event:
                  </span>
                </div>
                <div className="w-full sm:w-[220px]">
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full bg-white dark:bg-[#151b2a] border border-gray-300 dark:border-gray-700 rounded-lg text-[11px] px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                  >
                    <option value="">-- Tidak disandingkan ke Event --</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data Table Grid */}
              <div className="flex-1 overflow-auto border border-gray-200/80 dark:border-gray-800 rounded-lg bg-[#090d16]/30 min-h-0 relative">
                <table className="w-full text-left border-collapse table-fixed min-w-[640px]">
                  <thead>
                    <tr className="sticky top-0 bg-gray-100 dark:bg-[#111622] text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 z-20">
                      <th className="w-10 px-2 py-2 text-center">#</th>
                      <th className="px-2 py-2" style={{ width: '22%' }}>Username</th>
                      <th className="px-2 py-2" style={{ width: '28%' }}>Email</th>
                      <th className="px-2 py-2" style={{ width: '20%' }}>Password</th>
                      <th className="px-2 py-2" style={{ width: '20%' }}>Team</th>
                      <th className="w-10 px-2 py-2 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/40 dark:divide-gray-800/60">
                    {users.map((row, idx) => {
                      const errors = rowValidationErrors[row.id] || []
                      const hasError = errors.length > 0

                      return (
                        <tr
                          key={row.id}
                          className={`group transition-colors ${
                            hasError ? 'bg-red-500/5 dark:bg-red-950/10' : 'hover:bg-gray-50/30 dark:hover:bg-[#111622]/20'
                          }`}
                        >
                          <td className="px-2 py-1 text-center text-[10px] text-gray-400 font-mono">
                            {idx + 1}
                          </td>
                          <td className="px-1.5 py-1">
                            <input
                              type="text"
                              value={row.username}
                              onChange={(e) => handleCellEdit(row.id, 'username', e.target.value)}
                              className={`w-full bg-transparent px-1.5 py-0.5 text-[11px] border border-transparent hover:border-gray-300 dark:hover:border-gray-700 focus:border-blue-500 focus:bg-white dark:focus:bg-[#151b2a] focus:ring-1 focus:ring-blue-500 rounded text-gray-900 dark:text-white font-semibold outline-none ${
                                errors.some(e => e.includes('username')) ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                              }`}
                            />
                          </td>
                          <td className="px-1.5 py-1">
                            <input
                              type="email"
                              value={row.email}
                              onChange={(e) => handleCellEdit(row.id, 'email', e.target.value)}
                              className={`w-full bg-transparent px-1.5 py-0.5 text-[11px] border border-transparent hover:border-gray-300 dark:hover:border-gray-700 focus:border-blue-500 focus:bg-white dark:focus:bg-[#151b2a] focus:ring-1 focus:ring-blue-500 rounded text-gray-900 dark:text-white outline-none ${
                                errors.some(e => e.includes('email')) ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                              }`}
                            />
                          </td>
                          <td className="px-1.5 py-1">
                            <input
                              type="text"
                              value={row.password}
                              onChange={(e) => handleCellEdit(row.id, 'password', e.target.value)}
                              className={`w-full bg-transparent px-1.5 py-0.5 text-[11px] font-mono border border-transparent hover:border-gray-300 dark:hover:border-gray-700 focus:border-blue-500 focus:bg-white dark:focus:bg-[#151b2a] focus:ring-1 focus:ring-blue-500 rounded text-gray-900 dark:text-white outline-none ${
                                errors.some(e => e.includes('password')) ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                              }`}
                            />
                          </td>
                          <td className="px-1.5 py-1">
                            <input
                              type="text"
                              value={row.team}
                              onChange={(e) => handleCellEdit(row.id, 'team', e.target.value)}
                              placeholder="—"
                              className="w-full bg-transparent px-1.5 py-0.5 text-[11px] border border-transparent hover:border-gray-300 dark:hover:border-gray-700 focus:border-blue-500 focus:bg-white dark:focus:bg-[#151b2a] focus:ring-1 focus:ring-blue-500 rounded text-gray-900 dark:text-white placeholder:text-gray-400 outline-none"
                            />
                          </td>
                          <td className="px-1.5 py-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(row.id)}
                              className="text-gray-400 hover:text-red-500 p-0.5 rounded hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddRow}
                    className="h-7 rounded-lg border-dashed border-gray-300 hover:border-blue-500 dark:border-gray-700 dark:hover:border-blue-500 text-[11px] px-2.5 font-bold"
                  >
                    <Plus size={12} className="mr-1" /> Add Row
                  </Button>
                  {hasValidationErrors && (
                    <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                      <AlertCircle size={10} /> Fix highlighted cells before importing.
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                  {users.length} user{users.length !== 1 ? 's' : ''} ready
                </div>
              </div>
            </div>
          )}

          {step === 3 && importResult && (
            <div className="flex-grow flex flex-col h-full min-h-0 space-y-4 py-2">
              {/* Import Card Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 select-none shrink-0">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0 shadow-lg">
                    <CheckCircle size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-emerald-500 leading-tight">
                      {importResult.successCount}
                    </span>
                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Berhasil Diimpor
                    </span>
                  </div>
                </div>

                <div className={`flex items-center gap-4 p-4 rounded-2xl border shadow-sm ${
                  importResult.failedCount > 0
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-gray-100/50 dark:bg-[#111622]/30 border-gray-200 dark:border-gray-800'
                }`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 shadow-lg ${
                    importResult.failedCount > 0 ? 'bg-red-500 text-white' : 'bg-gray-400 text-white'
                  }`}>
                    <AlertCircle size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xl font-black leading-tight ${
                      importResult.failedCount > 0 ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {importResult.failedCount}
                    </span>
                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Gagal Diimpor
                    </span>
                  </div>
                </div>
              </div>

              {/* Successful Users Credentials Table */}
              {importResult.successCount > 0 && (
                <div className="flex-1 flex flex-col min-h-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-500 uppercase tracking-wider select-none">
                      Daftar User Berhasil & Kredensial:
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCopyAll}
                      className="h-7 text-[10px] font-extrabold flex items-center gap-1 border-gray-300 dark:border-gray-800"
                    >
                      {copiedAll ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                      <span>{copiedAll ? 'Tersalin!' : 'Copy All Credentials'}</span>
                    </Button>
                  </div>

                  <div className="flex-1 overflow-auto border border-emerald-500/10 dark:border-emerald-950/20 bg-emerald-500/5 dark:bg-[#070a10]/40 rounded-xl min-h-0">
                    <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
                      <thead>
                        <tr className="sticky top-0 bg-emerald-500/10 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border-b border-emerald-500/25 z-10">
                          <th className="w-12 px-3 py-2 text-center">#</th>
                          <th className="w-1/4 px-3 py-2">Username</th>
                          <th className="w-1/3 px-3 py-2">Email</th>
                          <th className="w-1/4 px-3 py-2">Password</th>
                          <th className="w-1/6 px-3 py-2">Team</th>
                          <th className="w-12 px-3 py-2 text-center">Copy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-500/10">
                        {successfulRegisteredUsers.map((row, idx) => {
                          const isPassVisible = !!visiblePasswords[row.email]
                          const isCopied = !!copiedEmails[row.email]

                          return (
                            <tr key={row.email} className="text-xs text-gray-700 dark:text-gray-300 hover:bg-emerald-500/5 transition-colors">
                              <td className="px-3 py-1.5 text-center font-mono opacity-70">
                                {idx + 1}
                              </td>
                              <td className="px-3 py-1.5 font-bold truncate">{row.username}</td>
                              <td className="px-3 py-1.5 truncate text-[11px]">{row.email}</td>
                              <td className="px-3 py-1.5 font-mono text-[11px]">
                                <div className="flex items-center gap-1.5">
                                  <span>{isPassVisible ? row.password : '••••••••'}</span>
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(row.email)}
                                    className="text-gray-400 hover:text-gray-200"
                                  >
                                    {isPassVisible ? <EyeOff size={11} /> : <Eye size={11} />}
                                  </button>
                                </div>
                              </td>
                              <td className="px-3 py-1.5 truncate text-[11px] font-semibold">
                                {row.team || '—'}
                              </td>
                              <td className="px-3 py-1.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleCopySingle(row)}
                                  className="text-gray-400 hover:text-blue-500 p-0.5 rounded hover:bg-blue-500/10 transition-colors"
                                >
                                  {isCopied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Error list for failures */}
              {importResult.failedCount > 0 && (
                <div className="flex-1 flex flex-col min-h-0 space-y-2">
                  <div className="text-xs font-black text-red-500 uppercase tracking-wider select-none">
                    Daftar User yang Gagal Diimpor:
                  </div>
                  <div className="flex-1 overflow-auto border border-red-500/10 dark:border-red-950/20 bg-red-500/5 dark:bg-red-950/5 rounded-xl min-h-0">
                    <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
                      <thead>
                        <tr className="sticky top-0 bg-red-500/10 text-[10px] font-black uppercase tracking-wider text-red-700 dark:text-red-400 border-b border-red-500/25 z-10">
                          <th className="w-12 px-4 py-2.5 text-center">#</th>
                          <th className="w-1/3 px-4 py-2.5">Username</th>
                          <th className="w-1/3 px-4 py-2.5">Email</th>
                          <th className="w-1/2 px-4 py-2.5">Error Message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-500/15">
                        {importResult.results
                           .filter((r) => !r.success)
                           .map((row, idx) => (
                             <tr key={row.email} className="text-xs text-red-600 dark:text-red-300">
                               <td className="px-4 py-2 text-center font-mono opacity-70">
                                 {idx + 1}
                               </td>
                               <td className="px-4 py-2 font-bold">{row.username}</td>
                               <td className="px-4 py-2 truncate">{row.email}</td>
                               <td className="px-4 py-2 font-mono text-[11px] truncate" title={row.error || ''}>
                                 {row.error}
                               </td>
                             </tr>
                           ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importResult.failedCount === 0 && importResult.successCount === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 select-none">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-inner">
                    <CheckCircle size={36} />
                  </div>
                  <p className="text-base font-black text-gray-900 dark:text-white">
                    Semua akun berhasil dibuat!
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                    Seluruh peserta di dalam daftar Excel telah terdaftar di database, masuk ke tim, dan langsung berhak mengikuti kompetisi.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:px-6 border-t border-gray-200/50 dark:border-gray-800/60 bg-gray-50/50 dark:bg-[#070a10]/50 flex items-center justify-between shrink-0 select-none">
          <div>
            {step === 2 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                disabled={importing}
                className="h-9 text-xs rounded-xl font-bold text-gray-500 dark:text-gray-400"
              >
                Kembali
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={importing}
              className="h-9 text-xs rounded-xl font-bold border-gray-300 dark:border-gray-700"
            >
              {step === 3 ? 'Selesai' : 'Batal'}
            </Button>

            {step === 2 && (
              <Button
                type="button"
                onClick={handleImport}
                disabled={importing || users.length === 0 || hasValidationErrors}
                className="h-9 text-xs rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold min-w-[120px]"
              >
                {importing ? (
                  <>
                    <Loader2 size={13} className="animate-spin mr-1.5" />
                    Importing...
                  </>
                ) : (
                  `Import ${users.length} Users`
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Confirm temporary registration enable */}
    <ConfirmDialog
      open={showRegConfirm}
      onOpenChange={setShowRegConfirm}
      title="Registration is Disabled"
      description={`User registration is currently disabled globally. Registration will be temporarily enabled to import ${users.length} user(s) and automatically restored immediately after.`}
      confirmLabel="Enable & Import"
      cancelLabel="Cancel"
      verificationText="yes"
      verificationPlaceholder="Type 'yes' to confirm"
      variant="destructive"
      icon={<AlertCircle size={20} />}
      onConfirm={async () => {
        await executeImport(true)
      }}
    />
    </>
  )
}
