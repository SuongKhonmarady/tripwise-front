/**
 * HOW TO TEST OFFLINE MODE:
 * 
 * METHOD 1: Chrome DevTools (Recommended)
 * 1. Open your app in Chrome
 * 2. Press F12 to open DevTools
 * 3. Go to "Network" tab
 * 4. Check "Offline" checkbox at the top
 * 5. Refresh the page and test functionality
 * 
 * METHOD 2: Application Tab in DevTools
 * 1. Open DevTools (F12)
 * 2. Go to "Application" tab
 * 3. In left sidebar, find "Service Workers"
 * 4. Check "Offline" checkbox
 * 5. Test your app functionality
 * 
 * METHOD 3: Throttling
 * 1. Open DevTools Network tab
 * 2. Click "No throttling" dropdown
 * 3. Select "Offline"
 * 4. Test your app
 * 
 * METHOD 4: Disconnect WiFi/Internet
 * 1. Disable your internet connection
 * 2. Test the app (less reliable due to DNS caching)
 * 
 * WHAT TO TEST:
 * - User authentication persists
 * - Cached data loads (trips, expenses, etc.)
 * - Create/Edit operations queue for sync
 * - Offline indicator shows
 * - App remains functional
 * - Data syncs when back online
 */

// Utility functions for handling offline states and user feedback

export const OfflineUtils = {
  // Show user-friendly message when an action is queued for later sync
  showOfflineAction(actionType) {
    const messages = {
      'create': 'Created locally. Will sync when you\'re back online.',
      'update': 'Updated locally. Will sync when you\'re back online.',
      'delete': 'Deleted locally. Will sync when you\'re back online.',
      'default': 'Saved locally. Will sync when you\'re back online.'
    }
    
    return messages[actionType] || messages.default
  },

  // Check if we should allow certain actions offline
  canPerformOffline(actionType) {
    const allowedOfflineActions = [
      'view', 'read', 'create', 'update', 'delete'
    ]
    return allowedOfflineActions.includes(actionType)
  },

  // Get cached timestamp for data freshness
  getCacheTimestamp(cachedData) {
    if (cachedData && cachedData.cachedAt) {
      const cacheDate = new Date(cachedData.cachedAt)
      const now = new Date()
      const diffMinutes = Math.floor((now - cacheDate) / (1000 * 60))
      
      if (diffMinutes < 1) return 'Just now'
      if (diffMinutes < 60) return `${diffMinutes} minutes ago`
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`
      return `${Math.floor(diffMinutes / 1440)} days ago`
    }
    return 'Unknown'
  },

  // Format offline indicator message
  getOfflineMessage(dataType = 'data') {
    return `You're viewing cached ${dataType}. It will update when you're back online.`
  }
}

// Higher-order component to wrap components with offline handling
export function withOfflineHandling(WrappedComponent) {
  return function OfflineWrapper(props) {
    const isOnline = navigator.onLine
    
    return (
      <div className="relative">
        {!isOnline && (
          <div className="absolute top-0 left-0 right-0 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-4 z-10">
            <div className="flex items-center justify-center text-amber-800 text-sm">
              <span>📱 Offline mode - Your changes are saved locally</span>
            </div>
          </div>
        )}
        <div className={!isOnline ? 'mt-12' : ''}>
          <WrappedComponent {...props} isOnline={isOnline} />
        </div>
      </div>
    )
  }
}
