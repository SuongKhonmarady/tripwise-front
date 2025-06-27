import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTrip } from '../context/TripContext'
import { useAuth } from '../context/AuthContext'
import { tripsService } from '../services/tripsService'
import participantsService from '../services/participantsService'
import chatService from '../services/chatService'
import pusher from '../services/pusherClient'
import { 
  Users, 
  Plus, 
  Crown, 
  Edit,
  Trash2,
  DollarSign,
  CheckCircle,
  AlertCircle,
  User,
  UserPlus,
  Calendar,
  MapPin,
  FileText,
  ExternalLink,
  ArrowLeft,
  Check,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import CreateTripModal from '../components/CreateTripModal'
import TripChat from '../components/TripChat'

export default function TripDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { trips } = useTrip()
  const { user: currentUser } = useAuth()
  
  const [trip, setTrip] = useState(null)
  const [participants, setParticipants] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('members')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteError, setInviteError] = useState("")
  const [inviteSuccess, setInviteSuccess] = useState("")

  useEffect(() => {
    const loadTripDetails = async () => {
      try {
        setLoading(true)
        // First try to find trip in context
        const contextTrip = trips.find(t => t.id === parseInt(id))
        if (contextTrip) {
          setTrip(contextTrip)
        } else {
          // If not in context, fetch from API
          const tripData = await tripsService.getTrip(id)
          setTrip(tripData)
        }
        await loadParticipants()
        await loadPlans()
      } catch (err) {
        setError('Failed to load trip details')
        console.error('Error loading trip:', err)
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      loadTripDetails()
    }
  }, [id, trips])

  const loadParticipants = async () => {
    try {
      const result = await participantsService.getParticipants(id)
      if (result.success) {
        setParticipants(result.data)
      } else {
        console.error('Failed to load participants:', result.error)
      }
    } catch (err) {
      console.error('Error loading participants:', err)
    }
  }

  const loadPlans = async () => {
    try {
      // Mock data for plans - replace with actual API call when backend is ready
      const mockPlans = [
        {
          id: 1,
          title: 'Day 1: Arrival & City Tour',
          description: 'Airport pickup, hotel check-in, and evening city walking tour',
          created_by: 'John Doe',
          created_at: '2024-12-20T10:30:00Z',
          type: 'itinerary',
          status: 'active'
        },
        {
          id: 2,
          title: 'Day 2: Museum & Cultural Sites',
          description: 'Visit local museums, historical sites, and cultural landmarks',
          created_by: 'Sarah Smith',
          created_at: '2024-12-21T14:15:00Z',
          type: 'itinerary',
          status: 'active'
        }
      ]
      setPlans(mockPlans)
    } catch (err) {
      console.error('Error loading plans:', err)
      setPlans([])
    }
  }

  // Permission helpers
  const canManageParticipants = () => {
    if (!trip || !currentUser) return false
    if (trip.user_id === currentUser.id) return true
    const userParticipant = participants.find(p => 
      p.user?.id === currentUser.id && p.status === 'accepted'
    )
    return userParticipant && userParticipant.role === 'organizer'
  }

  const canEditTrip = () => {
    return canManageParticipants()
  }

  // Status helpers
  const getRoleDisplay = (role) => {
    switch (role) {
      case 'organizer': return 'Organizer'
      case 'participant': return 'Participant' 
      case 'viewer': return 'Viewer'
      default: return role
    }
  }

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'accepted': return 'Active'
      case 'pending': return 'Pending'
      case 'declined': return 'Declined'
      default: return status
    }
  }

  // Open edit modal with current trip data
  const handleEditClick = () => {
    setEditForm({
      name: trip.name,
      destination: trip.destination,
      start_date: trip.start_date,
      end_date: trip.end_date,
      budget: trip.budget,
      description: trip.description
    })
    setShowEditModal(true)
  }

  // Handle form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      // Ensure budget is a number if present
      const payload = {
        ...editForm,
        budget: editForm.budget !== '' && editForm.budget !== null ? Number(editForm.budget) : null
      }
      const updated = await tripsService.updateTrip(id, payload)
      if (updated && updated.success !== false) {
        setTrip(updated)
        setShowEditModal(false)
      } else {
        setError(updated?.error || 'Failed to update trip')
      }
    } catch (err) {
      setError('Failed to update trip')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete trip
  const handleDeleteTrip = async () => {
    try {
      setLoading(true)
      await tripsService.deleteTrip(id)
      setShowDeleteModal(false)
      setDeleteConfirm("")
      navigate('/collaborate')
    } catch (err) {
      setError('Failed to delete trip')
    } finally {
      setLoading(false)
    }
  }

  // Handle invite submit
  const handleInviteSubmit = async (e) => {
    e.preventDefault()
    setInviteError("")
    setInviteSuccess("")
    if (!inviteEmail) {
      setInviteError("Please enter an email address.")
      return
    }
    try {
      setLoading(true)
      const result = await participantsService.inviteParticipant(id, inviteEmail)
      if (result.success) {
        setInviteSuccess("Invitation sent!")
        setInviteEmail("")
        await loadParticipants()
      } else {
        setInviteError(result.error || "Failed to send invitation.")
      }
    } catch (err) {
      setInviteError("Failed to send invitation.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip details...</p>
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Trip Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested trip could not be found.'}</p>
          <button
            onClick={() => navigate('/collaborate')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Trips
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 pb-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pt-4">
        {/* Header and Actions */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => navigate('/collaborate')}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 text-sm font-medium px-2 py-1 rounded transition-colors bg-white border border-gray-200 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to All Trips</span>
            </button>
          </div>
          <div className="flex items-center justify-between w-full">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{trip.name}</h1>
            {canEditTrip() && (
              <div className="flex items-center gap-2">
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm font-medium border border-gray-200"
                  onClick={handleEditClick}
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Trip</span>
                </button>
                <button
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-lg transition-colors flex items-center space-x-1 text-sm font-medium"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Trip Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 sm:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{trip.destination}</h2>
              <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 text-sm sm:text-base text-gray-600 mb-3">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {format(new Date(trip.start_date), 'MMM dd')} - {format(new Date(trip.end_date), 'MMM dd, yyyy')}
                  </span>
                </span>
                {trip.budget && (
                  <span className="flex items-center space-x-1">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-semibold">
                      Budget: {trip.currency === 'KHR' ? '៛' : '$'}{trip.budget.toLocaleString()}
                    </span>
                  </span>
                )}
              </div>
              {trip.description && (
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed">{trip.description}</p>
              )
              }
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 drop-shadow">{participants.length}</p>
                <p className="text-xs sm:text-sm text-gray-600">Members</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 drop-shadow">{trip.expenses?.length || 0}</p>
                <p className="text-xs sm:text-sm text-gray-600">Expenses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 drop-shadow">{plans.length}</p>
                <p className="text-xs sm:text-sm text-gray-600">Plans</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Toggle Button */}
        <div className="mb-4 flex justify-end">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            onClick={() => navigate(`/collaborate/${id}/chat`)}
          >
            Open Chat
          </button>
        </div>
        {/* End Chat Section (moved to dedicated page) */}

        {/* Tabs and Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex flex-nowrap">
              <button
                onClick={() => setActiveTab('members')}
                className={`px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'members'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Team Members ({participants.length})
              </button>
              <button
                onClick={() => setActiveTab('plans')}
                className={`px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'plans'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Plans ({plans.length})
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'expenses'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Expenses ({trip.expenses?.length || 0})
              </button>
            </nav>
          </div>
          <div className="p-3 sm:p-6">
            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                  {canManageParticipants() && (
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2" onClick={() => setShowInviteModal(true)}>
                      <Plus className="h-4 w-4" />
                      <span>Invite Member</span>
                    </button>
                  )}
                </div>
                
                {participants.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members yet</h3>
                    <p className="text-gray-600">Invite friends and family to plan together</p>
                  </div>
                ) : (
                  participants.map((participant) => (
                    <div key={participant.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900">{participant.user?.name}</h4>
                              {(trip.user_id === participant.user?.id || participant.role === 'organizer') && (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                participant.status === 'accepted' 
                                  ? 'bg-green-100 text-green-800'
                                  : participant.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {getStatusDisplay(participant.status)}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                {getRoleDisplay(participant.role)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{participant.user?.email}</p>
                            {participant.joined_at && (
                              <p className="text-xs text-gray-500 mt-1">
                                Joined {format(new Date(participant.joined_at), 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Plans Tab */}
            {activeTab === 'plans' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Trip Plans</h3>
                  {canManageParticipants() && (
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Add Plan</span>
                    </button>
                  )}
                </div>
                {plans.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No plans yet</h3>
                    <p className="text-gray-600">Start creating trip plans and itineraries</p>
                  </div>
                ) : (
                  plans.map((plan) => (
                    <div key={plan.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <h4 className="font-semibold text-gray-900">{plan.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              plan.status === 'active' 
                                ? 'bg-green-100 text-green-800'
                                : plan.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {plan.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>By {plan.created_by}</span>
                            <span>{format(new Date(plan.created_at), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => window.location.href = `/plan/${plan.id}`}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg transition-colors flex items-center space-x-1 text-sm font-medium"
                        >
                          <span>View</span>
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Trip Expenses</h3>
                  <a 
                    href="/expenses" 
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                  >
                    <span>Manage in Expense Tracker</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                
                {trip.expenses?.length === 0 || !trip.expenses ? (
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No expenses yet</h3>
                    <p className="text-gray-600 mb-4">Start adding expenses to track your trip budget</p>
                    <a 
                      href="/expenses"
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <DollarSign className="h-4 w-4" />
                      <span>Add First Expense</span>
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trip.expenses.map((expense) => (
                      <div key={expense.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{expense.title || expense.description}</h4>
                            <p className="text-sm text-gray-600">{expense.category?.name} • {expense.user?.name}</p>
                            <p className="text-xs text-gray-500">{format(new Date(expense.expense_date || expense.date), 'MMM dd, yyyy')}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{expense.currency === 'KHR' ? '៛' : '$'}{parseFloat(expense.amount).toFixed(2)}</p>
                            <p className="text-sm text-gray-500">{expense.currency || 'USD'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edit Trip Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <form
              onSubmit={handleEditSubmit}
              className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative"
            >
              <button
                type="button"
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                onClick={() => setShowEditModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold mb-4">Edit Trip</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Destination</label>
                  <input
                    type="text"
                    name="destination"
                    value={editForm.destination}
                    onChange={handleEditChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      value={editForm.start_date?.slice(0,10) || ''}
                      onChange={handleEditChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      value={editForm.end_date?.slice(0,10) || ''}
                      onChange={handleEditChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Budget</label>
                  <input
                    type="number"
                    name="budget"
                    value={editForm.budget || ''}
                    onChange={handleEditChange}
                    className="w-full border rounded px-3 py-2"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={editForm.description || ''}
                    onChange={handleEditChange}
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2"
                  disabled={loading}
                >
                  <Check className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
          </div>
        )}

        {/* Delete Trip Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button
                type="button"
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm("") }}
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold mb-4 text-red-600 flex items-center"><Trash2 className="h-5 w-5 mr-2" /> Delete Trip</h2>
              <p className="mb-4">Are you sure you want to delete this trip? This action cannot be undone.</p>
              <p className="mb-2">Please type <span className="font-mono font-bold">DELETE</span> to confirm:</p>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 mb-4"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirm("") }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center space-x-2"
                  onClick={handleDeleteTrip}
                  disabled={loading || deleteConfirm !== 'DELETE'}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          </div>
        )}

        {/* Invite Member Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <form
              onSubmit={handleInviteSubmit}
              className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative"
            >
              <button
                type="button"
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                onClick={() => { setShowInviteModal(false); setInviteEmail(""); setInviteError(""); setInviteSuccess("") }}
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold mb-4">Invite Member</h2>
              <label className="block text-sm font-medium mb-1">User Email</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2 mb-4"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                required
                autoFocus
              />
              {inviteError && <p className="text-red-500 mb-2">{inviteError}</p>}
              {inviteSuccess && <p className="text-green-600 mb-2">{inviteSuccess}</p>}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                  onClick={() => { setShowInviteModal(false); setInviteEmail(""); setInviteError(""); setInviteSuccess("") }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2"
                  disabled={loading}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Send Invite</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
