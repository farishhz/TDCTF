'use client'

import { Download, ExternalLink, FileText, Link as LinkIcon } from 'lucide-react'
import type { Attachment, ChallengeWithSolve } from '@/shared/types'
import type { KeyedBooleanMap } from '../../types'

const FILE_BUTTON_CLASS =
  "flex select-none items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 bg-gradient-to-b from-white/40 to-white/10 dark:from-white/10 dark:to-white/5 text-gray-800 dark:text-gray-200 border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-[0_4px_16px_0_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[0_4px_16px_0_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:from-white/60 hover:to-white/20 dark:hover:from-white/20 dark:hover:to-white/10 hover:text-blue-600 dark:hover:text-blue-300 active:scale-[0.98] disabled:opacity-50"

const LINK_BUTTON_CLASS =
  "flex select-none items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 bg-gradient-to-b from-blue-400/20 to-blue-600/20 text-blue-600 dark:text-blue-300 border border-blue-500/30 backdrop-blur-xl shadow-[0_4px_16px_0_rgba(37,99,235,0.1),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:from-blue-400/35 hover:to-blue-600/35 active:scale-[0.98]"

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
