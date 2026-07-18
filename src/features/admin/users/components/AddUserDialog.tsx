"use client"

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Button, Input } from '@/shared/ui'
import ConfirmDialog from '@/shared/components/ConfirmDialog'
import { DIALOG_GLASS_CONTENT_MD_CLASS } from '@/shared/styles'
import { getEvents } from '@/features/events/services/event.service'
import { adminBatchCreateUsers } from '../services/admin-users.service'
import type { Event } from '@/shared/types'
import { useSystemSettings } from '@/shared/contexts/SystemSettingsContext'
import { updateSystemSettings } from '@/features/admin/services/admin.service'
import {
  User as UserIcon,
  Mail,
  Lock,
  Users as UsersIcon,
  Calendar,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  Loader2,
  Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function AddUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddUserDialogProps) {
  const { settings, refresh: refreshSystemSettings } = useSystemSettings()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  
  // Form states
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [team, setTeam] = useState('')
  
  // UI states
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showRegConfirm, setShowRegConfirm] = useState(false)
  
  // Success states
  const [createdUser, setCreatedUser] = useState<{
    username: string
    email: string
    password: string
    team: string | null
    success: boolean
    error: string | null
  } | null>(null)
  const [showSuccessPassword, setShowSuccessPassword] = useState(false)
  const [copied, setCopied] = useState(false)

  // Fetch events list on open
  useEffect(() => {
    if (open) {
      getEvents()
        .then((data) => {
          setEvents(data || [])
        })
        .catch((err) => {
          console.error('Failed to fetch events:', err)
        })
      // Reset form states
      setUsername('')
      setEmail('')
      setPassword('')
      setTeam('')
      setSelectedEventId('')
      setCreatedUser(null)
      setShowSuccessPassword(false)
      setCopied(false)
      setShowRegConfirm(false)
    }
  }, [open])

  const handleClose = (isOpen: boolean) => {
    onOpenChange(isOpen)
  }

  // Generate random password
  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let gen = ''
    for (let i = 0; i < 12; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(gen)
    setShowPassword(true)
  }

  // Form Validation
  const validateForm = () => {
    if (!username.trim()) {
      toast.error('Username required')
      return false
    }
    if (!/^[a-zA-Z0-9_. -]+$/.test(username)) {
      toast.error('Invalid username characters (only a-z, A-Z, 0-9, spaces, . _ - allowed)')
      return false
    }
    if (!email.trim()) {
      toast.error('Email required')
      return false
    }
    if (!/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/.test(email)) {
      toast.error('Invalid email format')
      return false
    }
    if (!password) {
      toast.error('Password required')
      return false
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    // If registration is disabled, show confirmation dialog instead of submitting directly
    if (settings.disable_signup) {
      setShowRegConfirm(true)
      return
    }

    // Registration is already enabled, proceed directly
    await executeRegistration(false)
  }

  // Actual registration logic, called directly or from ConfirmDialog
  const executeRegistration = async (needsTempEnable: boolean) => {
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

    setIsSubmitting(true)
    try {
      const payload = [{
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        team: team.trim() || null
      }]

      const result = await adminBatchCreateUsers(payload, selectedEventId || null)
      if (result.success && result.successCount === 1) {
        const userRes = result.results[0]
        setCreatedUser({
          username: userRes.username,
          email: userRes.email,
          password: password, // use the input password
          team: team.trim() || null,
          success: userRes.success,
          error: userRes.error
        })
        toast.success(`User ${userRes.username} registered successfully!`)
        onSuccess() // refresh users list
      } else {
        const errMsg = result.results?.[0]?.error || result.error || 'Failed to create user'
        toast.error(errMsg)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to register user')
    } finally {
      setIsSubmitting(false)
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

  // Copy success credentials
  const handleCopyCredentials = async () => {
    if (!createdUser) return
    const loginUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const credText = `Platform: ${loginUrl}\nUsername: ${createdUser.username}\nEmail: ${createdUser.email}\nPassword: ${createdUser.password}${createdUser.team ? `\nTeam: ${createdUser.team}` : ''}`
    try {
      await navigator.clipboard.writeText(credText)
      setCopied(true)
      toast.success('Credentials copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`${DIALOG_GLASS_CONTENT_MD_CLASS} border border-gray-200/50 dark:border-gray-800/60 bg-[#0d121f]/95 dark:bg-[#070a10]/95 max-w-md w-[92vw] overflow-y-auto max-h-[90vh]`}>
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <UserIcon className="text-blue-500 shrink-0" size={20} />
            <span>Add Single User</span>
          </DialogTitle>
        </DialogHeader>

        {/* Warning if Registration is Disabled */}
        {settings.disable_signup && !createdUser && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-amber-500">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span className="text-[11px] font-bold leading-normal">
              User registration is currently disabled globally. It will be temporarily enabled during submission and restored immediately after.
            </span>
          </div>
        )}

        {!createdUser ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <UserIcon size={12} /> Username
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. cyber_warrior"
                className="h-9 text-xs rounded-xl bg-white/5 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <Mail size={12} /> Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@domain.com"
                className="h-9 text-xs rounded-xl bg-white/5 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                  <Lock size={12} /> Password
                </label>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-[10px] font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1"
                >
                  <Sparkles size={10} /> Generate
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="h-9 text-xs rounded-xl bg-white/5 border-gray-200 dark:border-gray-800 pr-10 text-gray-900 dark:text-white placeholder:text-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Team */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <UsersIcon size={12} /> Assign Team (Optional)
              </label>
              <Input
                type="text"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder="Team name (will create if not exists)"
                className="h-9 text-xs rounded-xl bg-white/5 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500"
              />
            </div>

            {/* Event Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <Calendar size={12} /> Register to Event (Optional)
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full h-9 bg-white/5 dark:bg-[#151b2a] border border-gray-300 dark:border-gray-800 rounded-xl text-xs px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                <option value="">-- Do not register to Event --</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-200/10 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="h-9 text-xs rounded-xl font-bold border-gray-300 dark:border-gray-800 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 text-xs rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold min-w-[100px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin mr-1.5" />
                    Registering...
                  </>
                ) : (
                  'Register User'
                )}
              </Button>
            </div>
          </form>
        ) : (
          /* Success Credentials View */
          <div className="space-y-5 py-2">
            <div className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white mb-3 shadow-lg">
                <CheckCircle size={24} />
              </div>
              <p className="text-sm font-black text-emerald-500">
                User Registered Successfully!
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 max-w-[280px]">
                The account has been created. Use the credentials below to log in.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="rounded-xl border border-gray-200/10 bg-white/5 dark:bg-[#111622]/40 p-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-gray-200/5 dark:border-gray-800 pb-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Username</span>
                <span className="font-semibold text-gray-900 dark:text-white">{createdUser.username}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200/5 dark:border-gray-800 pb-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Email</span>
                <span className="text-gray-900 dark:text-white truncate max-w-[200px]">{createdUser.email}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200/5 dark:border-gray-800 pb-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Password</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 dark:text-white">
                    {showSuccessPassword ? createdUser.password : '••••••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSuccessPassword(!showSuccessPassword)}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    {showSuccessPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
              </div>
              {createdUser.team && (
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Team</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{createdUser.team}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyCredentials}
                className="h-9 text-xs rounded-xl font-bold flex items-center gap-1.5 border-gray-300 dark:border-gray-800 text-gray-700 dark:text-gray-300 w-full"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Credentials'}</span>
              </Button>
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-9 text-xs rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold w-1/3"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Confirm temporary registration enable */}
    <ConfirmDialog
      open={showRegConfirm}
      onOpenChange={setShowRegConfirm}
      title="Registration is Disabled"
      description="User registration is currently disabled globally. Registration will be temporarily enabled for this operation and automatically restored immediately after."
      confirmLabel="Enable & Register"
      cancelLabel="Cancel"
      verificationText="yes"
      verificationPlaceholder="Type 'yes' to confirm"
      variant="destructive"
      icon={<AlertCircle size={20} />}
      onConfirm={async () => {
        await executeRegistration(true)
      }}
    />
    </>
  )
}
