import { useState, useEffect } from 'react'
import { getCachedData, cacheData } from '../services/db'

// Hook for managing offline data with fallbacks
export function useOfflineData(key, fetchFunction, dependencies = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFromCache, setIsFromCache] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        if (!navigator.onLine) {
          // Offline: load from cache
          const cachedData = await getCachedData(key)
          setData(cachedData)
          setIsFromCache(true)
          setLoading(false)
          return
        }

        // Online: fetch fresh data
        try {
          const freshData = await fetchFunction()
          setData(freshData)
          setIsFromCache(false)
          
          // Cache the fresh data
          await cacheData(key, freshData)
        } catch (fetchError) {
          // If API fails, try to load from cache
          const cachedData = await getCachedData(key)
          if (cachedData) {
            setData(cachedData)
            setIsFromCache(true)
          } else {
            throw fetchError
          }
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, dependencies)

  const refetch = async () => {
    if (navigator.onLine) {
      setLoading(true)
      try {
        const freshData = await fetchFunction()
        setData(freshData)
        setIsFromCache(false)
        await cacheData(key, freshData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  return { data, loading, error, isFromCache, refetch }
}

// Hook for online status with additional functionality
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setWasOffline(false)
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, wasOffline }
}

// Hook for sync status and queued operations
export function useSyncStatus() {
  const [hasPendingSync, setHasPendingSync] = useState(false)

  useEffect(() => {
    const checkPendingSync = async () => {
      try {
        const { getQueuedRequests } = await import('../services/db')
        const queued = await getQueuedRequests()
        setHasPendingSync(queued.length > 0)
      } catch (error) {
        console.error('Error checking sync status:', error)
      }
    }

    // Check initially
    checkPendingSync()

    // Check periodically
    const interval = setInterval(checkPendingSync, 5000)

    // Check when coming online
    const handleOnline = () => {
      setTimeout(checkPendingSync, 1000) // Give sync a moment to happen
    }

    window.addEventListener('online', handleOnline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return { hasPendingSync }
}
