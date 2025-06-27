import React, { useState, useEffect } from 'react'
import { useTrip } from '../context/TripContext'
import { useAuth } from '../context/AuthContext'
import { expensesService } from '../services/expensesService'
import { 
  Calendar, 
  DollarSign, 
  MapPin, 
  Clock, 
  TrendingUp,
  Plus,
  ArrowRight,
  Loader
} from 'lucide-react'
import { format, differenceInDays, parseISO, isAfter, isBefore } from 'date-fns'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { trips: allTrips, expenses, loading, error, loadTrips, categories } = useTrip()
  const { user } = useAuth()
  const [allExpenses, setAllExpenses] = useState([])
  const [loadingExpenses, setLoadingExpenses] = useState(false)
  // Currency filter state
  const [currencyView, setCurrencyView] = useState('USD'); // 'USD' or 'KHR'

  useEffect(() => {
    loadTrips()
  }, [])

  useEffect(() => {
    loadAllExpenses()
  }, [allTrips])

  const loadAllExpenses = async () => {
    if (allTrips.length === 0) return
    
    setLoadingExpenses(true)
    try {
      const expensePromises = allTrips.map(trip => 
        expensesService.getExpenses(trip.id).catch(() => [])
      )
      const expenseArrays = await Promise.all(expensePromises)
      const flatExpenses = expenseArrays.flat()
      setAllExpenses(flatExpenses)
    } catch (err) {
      console.error('Error loading expenses:', err)
      setAllExpenses([])
    } finally {
      setLoadingExpenses(false)
    }
  }

  // Filter trips to only show those where user is owner or accepted participant
  const trips = allTrips.filter(trip => {
    // User is trip owner
    if (trip.user_id === user?.id) return true
    
    // User is accepted participant
    const userParticipant = trip.participants?.find(p => p.user?.id === user?.id)
    return userParticipant && userParticipant.status === 'accepted'
  })

  if (loading && trips.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
        <div className="text-center">
          <Loader className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600 mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">Loading your trips...</p>
        </div>
      </div>
    )
  }

  const now = new Date()
  const upcomingTrips = trips.filter(trip => isAfter(parseISO(trip.start_date), now))
  const currentTrips = trips.filter(trip => {
    const startDate = parseISO(trip.start_date)
    const endDate = parseISO(trip.end_date)
    return !isAfter(startDate, now) && !isBefore(endDate, now)
  })

  // Helper to convert any amount to USD
  const toUSD = (amount, currency) => {
    if (!amount) return 0;
    if (currency === 'KHR') return parseFloat(amount) / 4000;
    return parseFloat(amount);
  };

  // Helper to convert any amount to KHR
  const toKHR = (amount, currency) => {
    if (!amount) return 0;
    if (currency === 'USD') return parseFloat(amount) * 4000;
    return parseFloat(amount);
  };

  // Calculate totals in USD and KHR
  const totalBudgetUSD = trips.reduce((sum, trip) => sum + toUSD(trip.budget, trip.currency), 0);
  const totalBudgetKHR = trips.reduce((sum, trip) => sum + toKHR(trip.budget, trip.currency), 0);
  const totalSpentUSD = allExpenses.reduce((sum, expense) => sum + toUSD(expense.amount, expense.currency), 0);
  const totalSpentKHR = allExpenses.reduce((sum, expense) => sum + toKHR(expense.amount, expense.currency), 0);
  const budgetLeftUSD = totalBudgetUSD - totalSpentUSD;
  const budgetLeftKHR = totalBudgetKHR - totalSpentKHR;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div className="flex-1">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-1">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 text-lg">Manage your travel plans and expenses</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="inline-flex rounded-lg shadow-sm border border-gray-200 bg-white">
            <button
              className={`px-5 py-2 rounded-l-lg font-semibold text-base ${currencyView === 'USD' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setCurrencyView('USD')}
            >
              USD ($)
            </button>
            <button
              className={`px-5 py-2 rounded-r-lg font-semibold text-base ${currencyView === 'KHR' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setCurrencyView('KHR')}
            >
              KHR (៛)
            </button>
          </div>
          <Link
            to="/create-trip"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors font-semibold shadow-lg text-lg"
          >
            <Plus className="h-5 w-5" />
            <span>New Trip</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-base">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center gap-4 transition-all hover:shadow-xl">
          <div className="flex-1">
            <p className="text-base font-medium text-gray-500 mb-1">Total Trips</p>
            <p className="text-2xl font-extrabold text-gray-900">{trips.length}</p>
          </div>
          <div className="bg-indigo-100 p-3 rounded-xl">
            <Calendar className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center gap-4 transition-all hover:shadow-xl">
          <div className="flex-1">
            <p className="text-base font-medium text-gray-500 mb-1">Total Budget</p>
            <p className="text-2xl font-extrabold text-gray-900">
              {currencyView === 'USD'
                ? `$${totalBudgetUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                : `៛${totalBudgetKHR.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-xl">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center gap-4 transition-all hover:shadow-xl">
          <div className="flex-1">
            <p className="text-base font-medium text-gray-500 mb-1">Total Spent</p>
            <p className="text-2xl font-extrabold text-gray-900">
              {currencyView === 'USD'
                ? `$${totalSpentUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                : `៛${totalSpentKHR.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
            </p>
          </div>
          <div className="bg-red-100 p-3 rounded-xl">
            <TrendingUp className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center gap-4 transition-all hover:shadow-xl">
          <div className="flex-1">
            <p className="text-base font-medium text-gray-500 mb-1">Budget Left</p>
            <p className={`text-2xl font-extrabold ${budgetLeftUSD >= 0 ? 'text-green-600' : 'text-red-600'}`}> 
              {currencyView === 'USD'
                ? `$${Math.abs(budgetLeftUSD).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                : `៛${Math.abs(budgetLeftKHR).toLocaleString(undefined, {maximumFractionDigits: 0})}`}
            </p>
          </div>
          <div className="bg-purple-100 p-3 rounded-xl">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Current Trips */}
        {currentTrips.length > 0 && (
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-8 text-white flex flex-col min-h-[340px] shadow-xl">
            <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-2">
              <span><Calendar className="inline h-7 w-7 mr-2 text-blue-100" /></span>
              Current Trips
            </h2>
            {currentTrips.map((trip, index) => (
              <div key={trip.id} className={index > 0 ? 'mt-8 pt-8 border-t border-blue-200 border-opacity-30' : ''}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold">{trip.name}</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="h-5 w-5 text-blue-100" />
                  <span className="text-lg">{trip.destination}</span>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="h-5 w-5 text-blue-100" />
                  <span className="text-lg">{format(parseISO(trip.start_date), 'MMM dd')} - {format(parseISO(trip.end_date), 'MMM dd, yyyy')}</span>
                </div>
                {trip.budget && (
                  <div className="bg-blue-800 bg-opacity-70 rounded-2xl p-5 border border-blue-200 border-opacity-30">
                    {(() => {
                      const tripExpenses = allExpenses.filter(exp => exp.trip_id === trip.id)
                      const tripSpent = tripExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0)
                      const tripBudget = parseFloat(trip.budget) || 0
                      const progress = tripBudget > 0 ? (tripSpent / tripBudget) * 100 : 0
                      return (
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-white text-lg">Budget Progress</span>
                            <span className="font-semibold text-white text-lg">${tripSpent.toLocaleString()} / ${tripBudget.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-blue-200 bg-opacity-40 rounded-full h-3">
                            <div 
                              className="bg-white h-3 rounded-full transition-all duration-300 shadow-sm"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upcoming Trips */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Upcoming Trips</h2>
              <Link 
                to="/scheduler"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 self-start sm:self-auto"
              >
                <span className="text-sm sm:text-base">View All</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            {upcomingTrips.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">No upcoming trips planned</p>
                <Link 
                  to="/create-trip"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto text-sm sm:text-base"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Plan New Trip</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {upcomingTrips.slice(0, 3).map((trip) => {
                  const daysLeft = differenceInDays(parseISO(trip.start_date), new Date())
                  return (
                    <div key={trip.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-sm transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{trip.name}</h3>
                          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 mt-1">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{trip.destination}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 mt-1">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>{daysLeft} days left</span>
                          </div>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <p className="text-xs sm:text-sm text-gray-600">Budget</p>
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            {trip.currency === 'KHR' ? `៛${parseFloat(trip.budget || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}` : `$${parseFloat(trip.budget || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Expenses</h2>
              <Link 
                to="/expense-tracker"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 self-start sm:self-auto"
              >
                <span className="text-sm sm:text-base">View All</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            {loadingExpenses ? (
              <div className="text-center py-6 sm:py-8">
                <Loader className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm sm:text-base">Loading expenses...</p>
              </div>
            ) : allExpenses.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <DollarSign className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">No expenses recorded yet</p>
                <Link 
                  to="/expense-tracker"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto text-sm sm:text-base"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Add Expense</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {allExpenses
                  .sort((a, b) => new Date(b.created_at || b.expense_date) - new Date(a.created_at || a.expense_date))
                  .slice(0, 5)
                  .map((expense) => {
                    const trip = trips.find(t => t.id === expense.trip_id)
                    const category = categories.find(c => c.id === expense.category_id)
                    const categoryColors = {
                      1: 'bg-blue-100 text-blue-800',
                      2: 'bg-green-100 text-green-800', 
                      3: 'bg-orange-100 text-orange-800',
                      4: 'bg-purple-100 text-purple-800',
                      5: 'bg-pink-100 text-pink-800',
                      6: 'bg-yellow-100 text-yellow-800'
                    }
                    
                    return (
                      <div key={expense.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 last:border-b-0 gap-2 sm:gap-4">
                        <div className="flex items-start sm:items-center space-x-3 min-w-0 flex-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${categoryColors[expense.category_id] || 'bg-gray-100 text-gray-800'}`}>
                            {category?.name || `Category ${expense.category_id}`}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{expense.title}</p>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">{trip?.name || 'Unknown Trip'}</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0 self-start sm:self-auto">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            {expense.currency === 'KHR' ? '៛' : '$'}{parseFloat(expense.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {format(new Date(expense.expense_date || expense.created_at), 'MMM dd')}
                          </p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
