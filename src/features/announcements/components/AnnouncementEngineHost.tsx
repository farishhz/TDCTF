'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAnnouncementEngine } from '../hooks/useAnnouncementEngine'
import AnnouncementModalPopup from './AnnouncementModalPopup'
import AnnouncementTopBanner from './AnnouncementTopBanner'
import AnnouncementFloatingCard from './AnnouncementFloatingCard'

export default function AnnouncementEngineHost() {
  const [mounted, setMounted] = useState(false)
  const {
    activeModal,
    activeBanner,
    activeCard,
    handleMarkAsRead,
    handleDismiss,
  } = useAnnouncementEngine()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Top Sticky Banner (rendered in normal flow or fixed) */}
      {activeBanner && (
        <AnnouncementTopBanner
          announcement={activeBanner}
          onMarkAsRead={handleMarkAsRead}
          onDismiss={handleDismiss}
        />
      )}

      {/* Portaled Overlays: Modal and Floating Card */}
      {createPortal(
        <>
          {activeModal && (
            <AnnouncementModalPopup
              announcement={activeModal}
              onMarkAsRead={handleMarkAsRead}
              onDismiss={handleDismiss}
            />
          )}

          {activeCard && !activeModal && (
            <AnnouncementFloatingCard
              announcement={activeCard}
              onMarkAsRead={handleMarkAsRead}
              onDismiss={handleDismiss}
            />
          )}
        </>,
        document.body
      )}
    </>
  )
}
