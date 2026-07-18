import React, { useState } from 'react'
import { Label, Input, Textarea, Button, Switch } from '@/shared/ui'
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical, Eye, PencilLine } from 'lucide-react'
import { SubChallengeFormRow } from '../../types'
import { MarkdownRenderer } from '@/shared/markdown/MarkdownRenderer'
import {
  ADMIN_FORM_FIELD_CLASS,
  ADMIN_FORM_HELPER_CLASS,
  ADMIN_MUTED_INPUT_CLASS,
  ADMIN_SWITCH_FIELD_CLASS,
} from '@/features/admin/ui/form-field-styles'

interface SubChallengesSectionProps {
  subChallenges: SubChallengeFormRow[]
  subChallengesSequential: boolean
  onAdd: () => void
  onUpdate: (i: number, field: keyof SubChallengeFormRow, value: any) => void
  onRemove: (i: number) => void
  onReorder: (from: number, to: number) => void
  onToggleSequential: (v: boolean) => void
  questionPreviewRows: Record<number, boolean>
  setQuestionPreviewRows: React.Dispatch<React.SetStateAction<Record<number, boolean>>>
  normalizeQuestionMarkdown: (v: string) => string
}

export const SubChallengesSection: React.FC<SubChallengesSectionProps> = ({
  subChallenges,
  subChallengesSequential,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
  onToggleSequential,
  questionPreviewRows,
  setQuestionPreviewRows,
  normalizeQuestionMarkdown
}) => {
  const [draggedSubChallengeIndex, setDraggedSubChallengeIndex] = useState<number | null>(null)

  return (
    <div className="md:col-span-2 space-y-4 rounded-2xl border border-gray-200/80 bg-white/50 p-4 dark:border-gray-800 dark:bg-gray-900/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Label className="text-sm font-bold text-gray-900 dark:text-gray-100">Sub-Challenges</Label>
          <p className={ADMIN_FORM_HELPER_CLASS}>Split a challenge into ordered question and answer steps.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Label className={`${ADMIN_SWITCH_FIELD_CLASS} text-sm`}>
            <Switch
              checked={subChallengesSequential}
              onCheckedChange={onToggleSequential}
              className="data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500 bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-500 transition-colors"
            />
            Sequential
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAdd}
            className="h-8 gap-1 rounded-xl"
          >
            <Plus size={14} />
            Add
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {subChallenges.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200/80 bg-gray-50/70 px-4 py-5 text-center dark:border-gray-800 dark:bg-gray-900/40">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">No sub-challenges yet</p>
            <p className={ADMIN_FORM_HELPER_CLASS}>Add a row when this challenge needs multiple answer steps.</p>
          </div>
        )}

        {subChallenges.map((row, idx) => (
          <div
            key={row.id || idx}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              if (draggedSubChallengeIndex === null) return
              onReorder(draggedSubChallengeIndex, idx)
              setDraggedSubChallengeIndex(null)
            }}
            className={`rounded-xl border bg-white/80 p-3 shadow-sm transition dark:bg-[#111622]/70 ${draggedSubChallengeIndex === idx
              ? 'border-blue-400 opacity-80 ring-2 ring-blue-500/20'
              : 'border-gray-200/80 hover:border-blue-500/30 dark:border-gray-800/90'
              }`}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/70 pb-2 dark:border-gray-800">
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 px-2 text-xs font-bold text-blue-600 dark:text-blue-300">
                  #{idx + 1}
                </span>
                <span className="truncate text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {row.question ? row.question : 'New sub-question'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = 'move'
                    setDraggedSubChallengeIndex(idx)
                  }}
                  onDragEnd={() => setDraggedSubChallengeIndex(null)}
                  className="inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 active:cursor-grabbing dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  title="Drag"
                  aria-label="Drag sub-challenge"
                >
                  <GripVertical size={16} />
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onReorder(idx, idx - 1)}
                  disabled={idx === 0}
                  className="h-8 w-8 rounded-lg"
                >
                  <ChevronUp size={15} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onReorder(idx, idx + 1)}
                  disabled={idx === subChallenges.length - 1}
                  className="h-8 w-8 rounded-lg"
                >
                  <ChevronDown size={15} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(idx)}
                  className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(220px,0.8fr)]">
              <div className={ADMIN_FORM_FIELD_CLASS}>
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs">Question</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuestionPreviewRows(prev => ({ ...prev, [idx]: !prev[idx] }))}
                    className="h-7 gap-1 rounded-lg px-2 text-[10px]"
                  >
                    {questionPreviewRows[idx] ? <PencilLine size={12} /> : <Eye size={12} />}
                    {questionPreviewRows[idx] ? 'Edit' : 'Preview'}
                  </Button>
                </div>
                {questionPreviewRows[idx] ? (
                  <div className="min-h-[84px] rounded-xl border border-gray-200/80 bg-gray-50/80 p-3 text-sm dark:border-gray-800 dark:bg-gray-900/40">
                    <div className="max-w-full overflow-hidden break-words text-sm font-semibold [&_p]:m-0 [&_p]:text-sm [&_p]:leading-snug [&_ul]:my-0 [&_ol]:my-0 [&_li]:my-0">
                      <MarkdownRenderer content={normalizeQuestionMarkdown(row.question || '*No question yet*')} className="max-w-full break-words" />
                    </div>
                  </div>
                ) : (
                  <Textarea
                    required
                    rows={3}
                    value={row.question}
                    onChange={e => onUpdate(idx, 'question', e.target.value)}
                    placeholder="Question text, markdown supported"
                    className={`h-28 min-h-[112px] resize-none overflow-y-auto ${ADMIN_MUTED_INPUT_CLASS}`}
                  />
                )}
              </div>

              <div className={ADMIN_FORM_FIELD_CLASS}>
                <Label className="text-xs">Answer</Label>
                <Input
                  required
                  value={row.answer}
                  onChange={e => onUpdate(idx, 'answer', e.target.value)}
                  placeholder="Plaintext answer"
                  className={ADMIN_MUTED_INPUT_CLASS}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
