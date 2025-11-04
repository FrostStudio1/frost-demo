// app/components/SafeSyncComponents.tsx
// Wrapper för sync-komponenter med error handling

'use client'

import { ErrorBoundary } from './ErrorBoundary'
import { SyncProgress } from './SyncProgress'
import { OfflineBanner } from './OfflineBanner'
import { OnlineStatusIndicator } from './OnlineStatusIndicator'

/**
 * Safe wrapper för sync-komponenter
 * Om IndexedDB har problem, renderas komponenterna inte
 */
export function SafeSyncComponents() {
  return (
    <>
      <ErrorBoundary fallback={null}>
        <OfflineBanner />
      </ErrorBoundary>
      <ErrorBoundary fallback={null}>
        <SyncProgress />
      </ErrorBoundary>
    </>
  )
}

/**
 * Safe wrapper för OnlineStatusIndicator
 */
export function SafeOnlineStatusIndicator() {
  return (
    <ErrorBoundary fallback={<div className="text-sm text-gray-500">Online</div>}>
      <OnlineStatusIndicator />
    </ErrorBoundary>
  )
}

