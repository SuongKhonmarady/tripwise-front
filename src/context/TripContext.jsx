import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { tripsService, expensesService, itineraryService, categoriesService } from '../services'
import { useAuth } from './AuthContext'
import { 
  cacheTrips, 
  getCachedTrips, 
  cacheExpenses, 
  getCachedExpenses,
  cacheData,
  getCachedData
} from '../services/db'

const TripContext = createContext()

const initialState = {
  trips: [],
  expenses: [],
  itineraries: [],
  categories: [],
  selectedTrip: null,
  loading: false,
  error: null
}

function tripReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    case 'SET_TRIPS':
      return { ...state, trips: action.payload, loading: false }
    
    case 'SET_SELECTED_TRIP':
      return { ...state, selectedTrip: action.payload }
    
    case 'ADD_TRIP':
      return { 
        ...state, 
        trips: [...state.trips, action.payload],
        loading: false
      }
    
    case 'UPDATE_TRIP':
      return {
        ...state,
        trips: state.trips.map(trip => 
          trip.id === action.payload.id ? action.payload : trip
        ),
        selectedTrip: state.selectedTrip?.id === action.payload.id ? action.payload : state.selectedTrip,
        loading: false
      }
    
    case 'DELETE_TRIP':
      return {
        ...state,
        trips: state.trips.filter(trip => trip.id !== action.payload),
        selectedTrip: state.selectedTrip?.id === action.payload ? null : state.selectedTrip,
        loading: false
      }
    
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload, loading: false }
    
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [...state.expenses, action.payload],
        loading: false
      }
    
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        ),
        loading: false
      }
    
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
        loading: false
      }
    
    case 'SET_ITINERARIES':
      return { ...state, itineraries: action.payload, loading: false }
    
    case 'ADD_ITINERARY':
      return {
        ...state,
        itineraries: [...state.itineraries, action.payload],
        loading: false
      }
    
    case 'UPDATE_ITINERARY':
      return {
        ...state,
        itineraries: state.itineraries.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
        loading: false
      }
    
    case 'DELETE_ITINERARY':
      return {
        ...state,
        itineraries: state.itineraries.filter(item => item.id !== action.payload),
        loading: false
      }
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload, loading: false }
    
    default:
      return state
  }
}

export function TripProvider({ children }) {
  const [state, dispatch] = useReducer(tripReducer, initialState)
  const { user, isAuthenticated } = useAuth()

  // Load categories once on mount
  useEffect(() => {
    loadCategories()
  }, [])

  // Load trips when authentication changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadTrips()
    }
  }, [isAuthenticated, user])

  // API Functions
  const loadTrips = async () => {
    if (!isAuthenticated || !user) {
      dispatch({ type: 'SET_TRIPS', payload: [] })
      return
    }
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // If offline, load from cache
      if (!navigator.onLine) {
        const cachedTrips = await getCachedTrips()
        dispatch({ type: 'SET_TRIPS', payload: cachedTrips })
        return
      }
      
      // Online: fetch from API and cache the result
      const trips = await tripsService.getTrips()
      dispatch({ type: 'SET_TRIPS', payload: trips })
      
      // Cache the trips for offline use
      await cacheTrips(trips)
    } catch (error) {
      // On error, try to load from cache
      console.log('Trip loading error, trying cache:', error.message)
      try {
        const cachedTrips = await getCachedTrips()
        dispatch({ type: 'SET_TRIPS', payload: cachedTrips })
      } catch (cacheError) {
        console.error('No cached trips available:', cacheError)
        dispatch({ type: 'SET_TRIPS', payload: [] })
        // Only set error if no cached data available
        if (!navigator.onLine) {
          dispatch({ type: 'SET_ERROR', payload: 'No cached trips available offline' })
        } else {
          dispatch({ type: 'SET_ERROR', payload: error.message })
        }
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const loadTripDetails = async (tripId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const trip = await tripsService.getTrip(tripId)
      dispatch({ type: 'SET_SELECTED_TRIP', payload: trip })
      
      // Load trip expenses and itineraries
      await Promise.all([
        loadExpenses(tripId),
        loadItineraries(tripId)
      ])
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const loadExpenses = async (tripId) => {
    try {
      // If offline, load from cache
      if (!navigator.onLine) {
        const cachedExpenses = await getCachedExpenses(tripId)
        dispatch({ type: 'SET_EXPENSES', payload: cachedExpenses })
        return
      }
      
      // Online: fetch from API and cache the result
      const expenses = await expensesService.getExpenses(tripId)
      dispatch({ type: 'SET_EXPENSES', payload: expenses })
      
      // Cache the expenses for offline use
      await cacheExpenses(tripId, expenses)
    } catch (error) {
      // On error, try to load from cache
      try {
        const cachedExpenses = await getCachedExpenses(tripId)
        dispatch({ type: 'SET_EXPENSES', payload: cachedExpenses })
      } catch (cacheError) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
      }
    }
  }

  const loadItineraries = async (tripId) => {
    try {
      // If offline, load from cache
      if (!navigator.onLine) {
        const cachedItineraries = await getCachedData(`itineraries-${tripId}`)
        dispatch({ type: 'SET_ITINERARIES', payload: cachedItineraries || [] })
        return
      }
      
      // Online: fetch from API and cache the result
      const itineraries = await itineraryService.getItineraries(tripId)
      dispatch({ type: 'SET_ITINERARIES', payload: itineraries })
      
      // Cache the itineraries for offline use
      await cacheData(`itineraries-${tripId}`, itineraries)
    } catch (error) {
      // On error, try to load from cache
      try {
        const cachedItineraries = await getCachedData(`itineraries-${tripId}`)
        dispatch({ type: 'SET_ITINERARIES', payload: cachedItineraries || [] })
      } catch (cacheError) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
      }
    }
  }

  const loadCategories = async () => {
    try {
      // If offline, load from cache
      if (!navigator.onLine) {
        const cachedCategories = await getCachedData('categories')
        dispatch({ type: 'SET_CATEGORIES', payload: cachedCategories || [] })
        return
      }
      
      // Online: fetch from API and cache the result
      const categories = await categoriesService.getCategories()
      dispatch({ type: 'SET_CATEGORIES', payload: categories })
      
      // Cache the categories for offline use
      await cacheData('categories', categories)
    } catch (error) {
      // On error, try to load from cache
      try {
        const cachedCategories = await getCachedData('categories')
        dispatch({ type: 'SET_CATEGORIES', payload: cachedCategories || [] })
      } catch (cacheError) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
      }
    }
  }

  // Trip CRUD operations
  const createTrip = async (tripData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const trip = await tripsService.createTrip(tripData)
      dispatch({ type: 'ADD_TRIP', payload: trip })
      return trip
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const updateTrip = async (tripId, tripData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const trip = await tripsService.updateTrip(tripId, tripData)
      dispatch({ type: 'UPDATE_TRIP', payload: trip })
      return trip
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const deleteTrip = async (tripId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      await tripsService.deleteTrip(tripId)
      dispatch({ type: 'DELETE_TRIP', payload: tripId })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  // Expense CRUD operations
  const createExpense = async (tripId, expenseData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const expense = await expensesService.createExpense(tripId, expenseData)
      dispatch({ type: 'ADD_EXPENSE', payload: expense })
      return expense
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const updateExpense = async (tripId, expenseId, expenseData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const expense = await expensesService.updateExpense(tripId, expenseId, expenseData)
      dispatch({ type: 'UPDATE_EXPENSE', payload: expense })
      return expense
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const deleteExpense = async (tripId, expenseId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      await expensesService.deleteExpense(tripId, expenseId)
      dispatch({ type: 'DELETE_EXPENSE', payload: expenseId })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  // Itinerary CRUD operations
  const createItinerary = async (tripId, itineraryData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const itinerary = await itineraryService.createItinerary(tripId, itineraryData)
      dispatch({ type: 'ADD_ITINERARY', payload: itinerary })
      return itinerary
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const updateItinerary = async (tripId, itineraryId, itineraryData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const itinerary = await itineraryService.updateItinerary(tripId, itineraryId, itineraryData)
      dispatch({ type: 'UPDATE_ITINERARY', payload: itinerary })
      return itinerary
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const deleteItinerary = async (tripId, itineraryId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      await itineraryService.deleteItinerary(tripId, itineraryId)
      dispatch({ type: 'DELETE_ITINERARY', payload: itineraryId })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const value = {
    ...state,
    // API functions
    loadTrips,
    loadTripDetails,
    loadExpenses,
    loadItineraries,
    loadCategories,
    // CRUD operations
    createTrip,
    updateTrip,
    deleteTrip,
    createExpense,
    updateExpense,
    deleteExpense,
    createItinerary,
    updateItinerary,
    deleteItinerary,
    // Helper functions
    setSelectedTrip: (trip) => dispatch({ type: 'SET_SELECTED_TRIP', payload: trip }),
    clearError: () => dispatch({ type: 'SET_ERROR', payload: null })
  }

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  )
}

export function useTrip() {
  const context = useContext(TripContext)
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider')
  }
  return context
}
