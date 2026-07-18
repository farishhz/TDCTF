'use client'

import * as React from 'react'
import { PencilLine } from 'lucide-react'

import { Button } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

type EditActionButtonProps = React.ComponentPropsWithoutRef<typeof Button> & {
  label: string
}

const EditActionButton = React.forwardRef<HTMLButtonElement, EditActionButtonProps>(
  ({ label, className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="outline"
      className={cn(
        'h-9 gap-2 rounded-full px-4 text-xs font-bold uppercase tracking-wider text-gray-600 sm:h-10 sm:text-sm dark:text-gray-400',
        className
      )}
      {...props}
    >
      <PencilLine size={14} aria-hidden="true" />
      {label}
    </Button>
  )
  }
)

EditActionButton.displayName = 'EditActionButton'

export default EditActionButton
