'use client'

import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/shared/ui'
import { MapPin, Loader2 } from 'lucide-react'

const DynamicGeoMapSelector = dynamic(
  () => import('./GeoMapSelector'),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[500px] w-full gap-3 text-gray-400 dark:text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-xs font-mono">Loading map...</span>
      </div>
    ),
  }
)

interface GeoMapSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialFlag: string
  onConfirm: (flag: string) => void
}

export const GeoMapSelectorDialog: React.FC<GeoMapSelectorDialogProps> = ({
  open,
  onOpenChange,
  initialFlag,
  onConfirm,
}) => {
  // Preload the map bundle as soon as this dialog component mounts
  // so that by the time the user opens the dialog, it's already loaded
  useEffect(() => {
    import('./GeoMapSelector')
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-2xl p-5 gap-4 flex flex-col max-h-[90dvh] overflow-y-auto scroll-hidden">
        <DialogHeader className="pb-3 border-b dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2 font-semibold text-sm text-red-600 dark:text-red-400">
            <MapPin size={16} />
            <DialogTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
              GEOGUESSR LOCATION SELECTOR
            </DialogTitle>
          </div>
        </DialogHeader>

        {open && (
          <DynamicGeoMapSelector
            initialFlag={initialFlag}
            onConfirm={(newFlag) => {
              onConfirm(newFlag)
              onOpenChange(false)
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
