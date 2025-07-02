import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      }
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false
      }
    
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken()
      const user = authService.getUser()
      
      if (token && user) {
        // If offline, trust local storage data
        if (!navigator.onLine) {
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { user, token } 
          })
          return
        }
        
        try {
          // Verify token is still valid when online
          const currentUser = await authService.getCurrentUser()
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { user: currentUser, token } 
          })
        } catch (error) {
          // Only logout if we're online and get a definitive auth error
          if (navigator.onLine && error.response?.status === 401) {
            console.log('Token invalid, logging out')
            authService.logout()
            dispatch({ type: 'LOGOUT' })
          } else {
            // Keep using cached data if network error or offline
            console.log('Network error during auth check, using cached auth')
            dispatch({ 
              type: 'LOGIN_SUCCESS', 
              payload: { user, token } 
            })
          }
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    checkAuth()
  }, [])

  // Handle network status changes
  useEffect(() => {
    const handleOnline = () => {
      // When coming back online, try to sync auth state
      const token = authService.getToken()
      const user = authService.getUser()
      
      if (token && user && state.isAuthenticated) {
        // Optionally re-verify token when coming back online
        authService.getCurrentUser().catch(error => {
          if (error.response?.status === 401) {
            authService.logout()
            dispatch({ type: 'LOGOUT' })
          }
        })
      }
    }

    const handleOffline = () => {
      // When going offline, we don't need to do anything special
      // The user should remain authenticated with cached data
      console.log('Gone offline - using cached authentication')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [state.isAuthenticated])

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await authService.login(credentials)
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: response.user, token: response.token } 
      })
      // Debug log
      console.log('AuthContext: LOGIN_SUCCESS', { user: response.user, token: response.token })
      return response
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || error.message })
      throw error
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await authService.register(userData)
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: response.user, token: response.token } 
      })
      return response
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || error.message })
      throw error
    }
  }

  const logout = async () => {
    try {
      // Only try to logout from server if online
      if (navigator.onLine) {
        await authService.logout()
      } else {
        // If offline, just clear local storage
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    } finally {
      dispatch({ type: 'LOGOUT' })
    }
  }

  const logoutAll = async () => {
    try {
      // Only try to logout from server if online
      if (navigator.onLine) {
        await authService.logoutAll()
      } else {
        // If offline, just clear local storage
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    } finally {
      dispatch({ type: 'LOGOUT' })
    }
  }

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    logoutAll,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
