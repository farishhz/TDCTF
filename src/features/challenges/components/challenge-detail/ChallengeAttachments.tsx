'use client'

import { useState } from 'react'
import { ClipboardCopy, Download, ExternalLink, FileText, Link as LinkIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Attachment, ChallengeWithSolve } from '@/shared/types'
import type { KeyedBooleanMap } from '../../types'

const WGET_BUTTON_CLASS =
  "flex select-none items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-0"

const FILE_BUTTON_CLASS =
  "flex select-none items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 bg-gray-500/5 text-gray-700 border border-gray-200/80 hover:bg-gray-100 hover:text-gray-900 dark:bg-gray-500/5 dark:text-gray-300 dark:border-gray-700/80 dark:hover:bg-gray-800/80 dark:hover:text-gray-100 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/40 focus-visible:ring-offset-0"

const LINK_BUTTON_CLASS =
  "flex select-none items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:hover:bg-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-0"

type ChallengeAttachmentsProps = {
  challenge: ChallengeWithSolve
  downloading: KeyedBooleanMap
  downloadFile: (attachment: Attachment, attachmentKey: string) => void
}

export default function ChallengeAttachments({
  challenge,
  downloading,
  downloadFile,
}: ChallengeAttachmentsProps) {
  const [copiedAll, setCopiedAll] = useState<Record<string, boolean>>({})

  if (!challenge.attachments || challenge.attachments.length === 0) return null

  return (
    <div className="space-y-4">
      {challenge.attachments.some((attachment) => attachment.type === 'file') && (
        <div>
          <p className="select-none text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1.5 opacity-90">
            <FileText className="h-3.5 w-3.5 text-emerald-500/70" />
            <span>Files</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              key="copy-wget-all"
              type="button"
              title="Copy wget commands for all files"
              className={WGET_BUTTON_CLASS}
              onClick={(event) => {
                event.stopPropagation()
                const fileAttachments = challenge.attachments!.filter((attachment) => attachment.type === 'file' && (attachment.url || attachment.name))
                if (!fileAttachments.length) return
                const commands = fileAttachments.map((attachment, idx) => {
                  const url = attachment.url || ''
                  const filename = (attachment.name && attachment.name.trim()) || url.split('/').pop() || `file-${idx}`
                  const escUrl = url.replace(/'/g, "'\\'\'")
                  const escName = filename.replace(/'/g, "'\\'\'")
                  return `wget '${escUrl}' -O '${escName}'`
                })
                const joined = commands.join(' && ')
                if (!navigator.clipboard) {
                  toast.error('Clipboard not available')
                  return
                }
                navigator.clipboard.writeText(joined).then(() => {
                  const key = `${challenge.id}-copied`
                  setCopiedAll((prev) => ({ ...prev, [key]: true }))
                  setTimeout(() => setCopiedAll((prev) => ({ ...prev, [key]: false })), 2000)
                  toast.success('Copied wget commands to clipboard')
                }).catch((error) => {
                  console.error('Copy failed', error)
                  toast.error('Failed to copy to clipboard')
                })
              }}
            >
              <ClipboardCopy className="h-3.5 w-3.5" />
              <span className="font-mono text-xs uppercase tracking-wider">
                {copiedAll[`${challenge.id}-copied`] ? 'Copied!' : 'copy wget'}
              </span>
            </button>

            <span
              aria-hidden="true"
              className="mx-1 hidden h-4 w-px self-center bg-gray-200 dark:bg-gray-700 sm:block"
            />

            {challenge.attachments.filter((attachment) => attachment.type === 'file').map((attachment, idx) => {
              const displayName = attachment.name?.length > 40 ? attachment.name.slice(0, 37) + '...' : attachment.name || 'file'
              const key = `${challenge.id}-${idx}`
              return (
                <button
                  key={key}
                  type="button"
                  title={attachment.name}
                  className={FILE_BUTTON_CLASS}
                  onClick={(event) => {
                    event.stopPropagation()
                    downloadFile(attachment, key)
                  }}
                  disabled={downloading[key]}
                >
                  <Download className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                  <span>{downloading[key] ? 'Downloading...' : displayName}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {challenge.attachments.some((attachment) => attachment.type !== 'file') && (
        <div>
          <p className="select-none text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1.5 opacity-90">
            <LinkIcon className="h-3.5 w-3.5 text-blue-500/70" />
            <span>Links</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {challenge.attachments.filter((attachment) => attachment.type !== 'file').map((attachment, idx) => {
              const displayName = attachment.name?.length > 40 ? attachment.name.slice(0, 37) + '...' : attachment.name || (attachment.url ? attachment.url.slice(0, 40) + '...' : 'link')
              return (
                <a
                  key={idx}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={attachment.url}
                  className={LINK_BUTTON_CLASS}
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>{displayName}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
