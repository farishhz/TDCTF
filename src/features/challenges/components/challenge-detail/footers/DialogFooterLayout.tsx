import React from 'react'

export interface DialogFooterLayoutProps {
  children: React.ReactNode
  className?: string
}

export const DialogFooterLayout: React.FC<DialogFooterLayoutProps> = ({ children, className }) => (
  <div
    className={`px-4 md:px-6 py-2.5 border-t border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/50 shrink-0 flex items-center ${className ?? ''}`}
  >
    <div className="w-full">{children}</div>
  </div>
)
