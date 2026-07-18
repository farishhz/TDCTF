import React from 'react'
import Image from 'next/image'
import { CalendarDays } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '@/shared/ui'
import { DIALOG_FORM_CONTENT_CLASS } from '@/shared/styles'
import { cn } from '@/shared/lib/utils'
import {
  ADMIN_FORM_FIELD_CLASS,
  ADMIN_FORM_HELPER_CLASS,
  ADMIN_FORM_SECTION_CLASS,
  ADMIN_INPUT_CLASS,
  ADMIN_SELECT_CONTENT_CLASS,
  ADMIN_SELECT_TRIGGER_CLASS,
  ADMIN_TEXTAREA_CLASS,
} from '@/features/admin/ui/form-field-styles'
import { normalizeEventImageUrl } from '@/features/challenges/lib'
import type { Event, EventFormData, EventJoinMode } from '../types'

interface EventFormDialogProps {
  open: boolean
  editing: Event | null
  formData: EventFormData
  submitting: boolean
  onOpenChange: (value: boolean) => void
  onChange: (data: EventFormData) => void
  onSubmit: (e?: React.FormEvent) => void
  onRegenerateJoinKey: () => void
}

const EventFormDialog: React.FC<EventFormDialogProps> = ({
  open,
  editing,
  formData,
  submitting,
  onOpenChange,
  onChange,
  onSubmit,
  onRegenerateJoinKey,
}) => {
  const previewImageUrl = normalizeEventImageUrl(formData.image_url)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(DIALOG_FORM_CONTENT_CLASS, "flex h-[85vh] max-h-[85vh] max-w-3xl flex-col overflow-hidden p-5 md:p-6")}
      >
        <DialogHeader className="shrink-0 border-b pb-3 dark:border-gray-800">
          <DialogTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {editing ? 'Edit Event' : 'Add Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col space-y-4 overflow-hidden">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 scroll-hidden">
            <section className="rounded-2xl border border-gray-200/80 bg-white/50 p-4 dark:border-gray-800 dark:bg-gray-900/20">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Event Details</h3>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Name, description, and public event artwork.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-[240px_minmax(0,1fr)]">
                <div className={ADMIN_FORM_SECTION_CLASS}>
                  <div className={ADMIN_FORM_FIELD_CLASS}>
                    <Label>Preview</Label>
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-gray-200/80 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-gray-800 dark:from-blue-950/20 dark:to-indigo-950/20">
                      {previewImageUrl ? (
                        <Image
                          src={previewImageUrl}
                          alt={formData.name || 'Event preview'}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-blue-500/35">
                          <CalendarDays className="h-8 w-8" />
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">No image URL</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={ADMIN_FORM_FIELD_CLASS}>
                    <Label>Image URL</Label>
                    <Input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image_url}
                      onChange={(e) => onChange({ ...formData, image_url: e.target.value })}
                      className={`${ADMIN_INPUT_CLASS} h-9 text-sm`}
                    />
                  </div>
                </div>

                <div className={ADMIN_FORM_SECTION_CLASS}>
                  <div className={ADMIN_FORM_FIELD_CLASS}>
                    <Label>Name</Label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => onChange({ ...formData, name: e.target.value })}
                      className={ADMIN_INPUT_CLASS}
                    />
                  </div>

                  <div className={ADMIN_FORM_FIELD_CLASS}>
                    <Label>Description</Label>
                    <Textarea
                      rows={7}
                      value={formData.description}
                      onChange={(e) => onChange({ ...formData, description: e.target.value })}
                      className={`${ADMIN_TEXTAREA_CLASS} min-h-[156px]`}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200/80 bg-white/50 p-4 dark:border-gray-800 dark:bg-gray-900/20">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Access</h3>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Control how users join this event.</p>
              </div>

              <div className={ADMIN_FORM_SECTION_CLASS}>
                <div className={`max-w-md ${ADMIN_FORM_FIELD_CLASS}`}>
                  <Label>Join Mode</Label>
                  <Select
                    value={formData.join_mode}
                    onValueChange={(value) => onChange({ ...formData, join_mode: value as EventJoinMode })}
                  >
                    <SelectTrigger className={ADMIN_SELECT_TRIGGER_CLASS}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={ADMIN_SELECT_CONTENT_CLASS}>
                      <SelectItem value="open">Open (direct join)</SelectItem>
                      <SelectItem value="request">Request (admin approval)</SelectItem>
                      <SelectItem value="key">Key (invite key)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.join_mode === 'key' && (
                  <div className="rounded-xl border border-gray-200/80 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-900/40">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div>
                        <Label>Join Key</Label>
                        <p className={ADMIN_FORM_HELPER_CLASS}>Users need this invite key to join the event.</p>
                      </div>
                      {editing?.id && (
                        <button type="button" onClick={onRegenerateJoinKey} className="shrink-0 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-300">
                          Regenerate
                        </button>
                      )}
                    </div>
                    <Input
                      value={formData.join_key}
                      onChange={(e) => onChange({ ...formData, join_key: e.target.value })}
                      placeholder="Enter custom join key"
                      className={ADMIN_INPUT_CLASS}
                    />
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200/80 bg-white/50 p-4 dark:border-gray-800 dark:bg-gray-900/20">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Schedule</h3>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Set event timing and post-event challenge visibility.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className={ADMIN_FORM_FIELD_CLASS}>
                  <div className="flex items-center justify-between">
                    <Label>Start Time</Label>
                    {formData.start_time && (
                      <button type="button" onClick={() => onChange({ ...formData, start_time: '' })} className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-300">
                        Clear
                      </button>
                    )}
                  </div>
                  <Input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => onChange({ ...formData, start_time: e.target.value })}
                    className={`${ADMIN_INPUT_CLASS} h-9 px-2 text-sm`}
                  />
                </div>

                <div className={ADMIN_FORM_FIELD_CLASS}>
                  <div className="flex items-center justify-between">
                    <Label>End Time</Label>
                    {formData.end_time && (
                      <button type="button" onClick={() => onChange({ ...formData, end_time: '' })} className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-300">
                        Clear
                      </button>
                    )}
                  </div>
                  <Input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => onChange({ ...formData, end_time: e.target.value })}
                    className={`${ADMIN_INPUT_CLASS} h-9 px-2 text-sm`}
                  />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200/80 bg-gray-50/70 px-3 py-2 dark:border-gray-800 dark:bg-gray-900/40 md:col-span-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Always show challenges</p>
                    <p className={ADMIN_FORM_HELPER_CLASS}>Show event challenges after the event ends.</p>
                  </div>
                  <Switch
                    checked={formData.always_show_challenges}
                    onCheckedChange={(checked) => onChange({ ...formData, always_show_challenges: checked })}
                  />
                </div>
              </div>
            </section>
          </div>

          <DialogFooter className="flex shrink-0 flex-col-reverse sm:flex-row items-center justify-end gap-2 border-t pt-3 dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-600 dark:text-white dark:hover:bg-primary-700">
              {submitting ? 'Saving...' : editing ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EventFormDialog
