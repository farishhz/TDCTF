'use client'

import { Download, ExternalLink, FileText, Link as LinkIcon } from 'lucide-react'
import type { Attachment, ChallengeWithSolve } from '@/shared/types'
import type { KeyedBooleanMap } from '../../types'

const FILE_BUTTON_CLASS =
  "flex select-none items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 bg-gray-500/5 text-gray-700 border border-gray-200/80 hover:bg-100 hover:text-gray-900 dark:bg-gray-500/5 dark:text-gray-300 dark:border-gray-700/80 dark:hover:bg-gray-800/80 dark:hover:text-gray-100 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/40 focus-visible:ring-offset-0"

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
