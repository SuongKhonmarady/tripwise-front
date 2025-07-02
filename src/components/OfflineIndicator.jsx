import React from 'react'
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react'
import { useOnlineStatus, useSyncStatus } from '../hooks/useOffline'

export default function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus()
  const { hasPendingSync } = useSyncStatus()

  // Show reconnection success briefly
  if (wasOffline && isOnline && !hasPendingSync) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-green-500 text-white px-4 py-2 text-center text-xs sm:text-sm font-medium z-[60] flex items-center justify-center gap-2 animate-pulse">
        <CheckCircle size={16} className="flex-shrink-0" />
        <span>Back online and synced!</span>
      </div>
    )
  }

  // Show sync status when online but have pending operations
  if (isOnline && hasPendingSync) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white px-4 py-2 text-center text-xs sm:text-sm font-medium z-[60] flex items-center justify-center gap-2">
        <RefreshCw size={16} className="animate-spin flex-shrink-0" />
        <span className="truncate">Syncing your changes...</span>
      </div>
    )
  }

  // Show offline status
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-2 sm:px-4 py-2 text-center text-xs sm:text-sm font-medium z-[60] flex items-center justify-center gap-2">
        <WifiOff size={16} className="flex-shrink-0" />
        <span className="truncate">
          <span className="hidden sm:inline">You're offline. Your data is saved locally and will sync when reconnected.</span>
          <span className="sm:hidden">Offline - Data saved locally</span>
        </span>
      </div>
    )
  }

  return null
}

// Export the hooks for use in other components
export { useOnlineStatus, useSyncStatus }
