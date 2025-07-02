import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw, Database, Clock } from 'lucide-react'
import { useOnlineStatus } from './OfflineIndicator'
import { getCachedData, getQueuedRequests, clearQueuedRequests } from '../services/db'

export default function OfflineTestPanel() {
  const isOnline = useOnlineStatus()
  const [queuedRequests, setQueuedRequests] = useState([])
  const [cachedData, setCachedData] = useState({})
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    loadDebugInfo()
  }, [isOnline])

  const loadDebugInfo = async () => {
    try {
      const queued = await getQueuedRequests()
      setQueuedRequests(queued)

      // Load cached data info
      const trips = await getCachedData('cached-trips')
      const categories = await getCachedData('categories')
      
      setCachedData({
        trips: trips?.data?.length || 0,
        categories: categories?.length || 0,
        tripsAge: trips?.cachedAt ? new Date(trips.cachedAt).toLocaleString() : 'None',
        categoriesAge: categories?.cachedAt ? new Date(categories.cachedAt).toLocaleString() : 'None'
      })
    } catch (error) {
      console.error('Failed to load debug info:', error)
    }
  }

  const clearQueue = async () => {
    try {
      await clearQueuedRequests()
      await loadDebugInfo()
    } catch (error) {
      console.error('Failed to clear queue:', error)
    }
  }

  const simulateOfflineAction = () => {
    // Force queue a test request
    const testRequest = {
      url: '/api/test',
      method: 'POST',
      data: { test: 'offline functionality' },
      timestamp: Date.now()
    }
    // This would normally be handled by the API interceptor
    console.log('Simulated offline action:', testRequest)
  }

  // Only show in development
  if (process.env.NODE_ENV === 'production') return null

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg z-50 hover:bg-gray-700 transition-colors"
        title="Toggle Offline Debug Panel"
      >
        <Database size={20} />
      </button>

      {/* Debug Panel */}
      {showPanel && (
        <div className="fixed bottom-20 right-4 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-80 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Offline Debug Panel</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {/* Connection Status */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              {isOnline ? (
                <Wifi className="text-green-500" size={16} />
              ) : (
                <WifiOff className="text-red-500" size={16} />
              )}
              <span className={`font-medium ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Queued Requests */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Queued Requests</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {queuedRequests.length}
              </span>
            </div>
            {queuedRequests.length > 0 && (
              <button
                onClick={clearQueue}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Clear Queue
              </button>
            )}
          </div>

          {/* Cached Data */}
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-700 block mb-2">Cached Data</span>
            <div className="text-xs space-y-1 text-gray-600">
              <div>Trips: {cachedData.trips} items</div>
              <div>Categories: {cachedData.categories} items</div>
              <div className="flex items-center space-x-1">
                <Clock size={12} />
                <span>Last updated: {cachedData.tripsAge}</span>
              </div>
            </div>
          </div>

          {/* Test Actions */}
          <div className="space-y-2">
            <button
              onClick={loadDebugInfo}
              className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
            >
              <RefreshCw size={14} />
              <span>Refresh Info</span>
            </button>
            
            <button
              onClick={simulateOfflineAction}
              className="w-full bg-orange-500 text-white px-3 py-2 rounded text-sm hover:bg-orange-600 transition-colors"
            >
              Simulate Offline Action
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
            <div className="font-medium mb-1">Test Instructions:</div>
            <div>1. Open DevTools → Network → Check "Offline"</div>
            <div>2. Try creating/editing trips</div>
            <div>3. Check queue count increases</div>
            <div>4. Go back online and refresh</div>
            <div>5. Queue should process automatically</div>
          </div>
        </div>
      )}
    </>
  )
}
