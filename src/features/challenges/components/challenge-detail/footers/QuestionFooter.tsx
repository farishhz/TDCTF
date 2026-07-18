import React, { useState } from 'react'
import { Copy, Loader2, RotateCcw, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { DialogFooterLayout } from './DialogFooterLayout'
import ConfirmDialog from '@/shared/components/ConfirmDialog'

export interface QuestionFooterProps {
  subChallengeCompleted: boolean
  subChallengeFlag: string | null
  onReset: () => void | Promise<unknown>
  onSubmitFlag?: () => void | Promise<unknown>
  submittingFlag?: boolean
}

export const QuestionFooter: React.FC<QuestionFooterProps> = ({
  subChallengeCompleted,
  subChallengeFlag,
  onReset,
  onSubmitFlag,
  submittingFlag = false,
}) => {
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)

  return (
    <>
      <DialogFooterLayout className="bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between gap-3 w-full">
          {/* Left Side: Flag Display & Copy Button */}
          <div className="flex-1 flex items-center min-w-0">
            {subChallengeCompleted ? (
              subChallengeFlag ? (
                <div className="flex items-center h-[38px] bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800/50 shadow-[0_2px_10px_rgba(34,197,94,0.1)] overflow-hidden max-w-[280px] sm:max-w-[360px] flex-1">
                  <div className="flex-1 px-4 font-mono text-xs sm:text-sm text-green-700 dark:text-green-300 truncate select-all font-bold tracking-wide">
                    {subChallengeFlag}
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(subChallengeFlag)
                      toast.success('Flag copied!', { icon: '📋' })
                    }}
                    className="flex h-full shrink-0 select-none items-center justify-center bg-green-500 hover:bg-green-600 px-4 text-white text-xs font-black uppercase tracking-widest active:scale-95 transition-all gap-1.5"
                    title="Copy Flag"
                  >
                    <Copy size={12} />
                    <span className="hidden sm:inline">Copy</span>
                  </button>
                </div>
              ) : (
                <div className="flex h-[38px] select-none items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 text-xs font-bold uppercase tracking-widest text-green-600 dark:border-green-800/50 dark:bg-green-900/20 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="truncate">All Questions Solved</span>
                </div>
              )
            ) : (
              <div className="flex h-[38px] select-none items-center rounded-xl border border-gray-200 bg-gray-200/50 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-500">
                <span className="truncate">Questions Not Solved</span>
              </div>
            )}
          </div>

          {/* Right Side: Action Buttons (Submit Flag & Reset) */}
          <div className="flex items-center gap-3 shrink-0">
            {subChallengeCompleted && subChallengeFlag && onSubmitFlag && (
              <button
                type="button"
                disabled={submittingFlag}
                onClick={async () => {
                  await onSubmitFlag()
                }}
                className="h-[38px] px-4 shrink-0 select-none rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/60 text-white text-xs font-black uppercase tracking-widest active:scale-95 transition-all gap-1.5 flex items-center justify-center shadow-md shadow-blue-500/10"
                title="Submit Flag to Challenge"
              >
                {submittingFlag ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Send size={12} />
                )}
                <span>{submittingFlag ? 'Submitting...' : 'Submit Flag'}</span>
              </button>
            )}

            <button
              onClick={() => setResetConfirmOpen(true)}
              className="h-[38px] px-4 shrink-0 select-none items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/10 text-xs font-black uppercase tracking-widest active:scale-95 transition-all flex gap-1.5"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </DialogFooterLayout>

      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title="Reset Progress"
        description="Are you sure you want to reset your progress? This will clear all your answers for this challenge."
        variant="destructive"
        confirmLabel="Reset"
        onConfirm={async () => { await onReset() }}
      />
    </>
  )
}
