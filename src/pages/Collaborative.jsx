import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTrip } from '../context/TripContext'
import { useAuth } from '../context/AuthContext'
import { tripsService } from '../services/tripsService'
import participantsService from '../services/participantsService'
import { 
  Users, 
  Plus, 
  Mail, 
  Share2, 
  Crown, 
  Edit,
  Trash2,
  DollarSign,
  CheckCircle,
  AlertCircle,
  User,
  UserPlus,
  MoreVertical,
  Check,
  X,
  Bell,
  BellRing,
  Calendar,
  MapPin,
  FileText,
  ExternalLink,
  ArrowLeft
} from 'lucide-react'
import { format } from 'date-fns'

export default function Collaborative() {
  const { trips } = useTrip()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams() // Get trip ID from URL if present
  
  // State for both regular trips and pending invitations
  const [pendingInvitations, setPendingInvitations] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [selectedPendingTrip, setSelectedPendingTrip] = useState(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditTripModal, setShowEditTripModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activeTab, setActiveTab] = useState('members')
  const [showNotifications, setShowNotifications] = useState(false)
  const [viewMode, setViewMode] = useState(id ? 'detail' : 'list') // Auto-switch to detail view if trip ID in URL
  
  // Real data from API
  const [participants, setParticipants] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load data when component mounts
  useEffect(() => {
    loadPendingInvitations()
  }, [])

  // Handle URL parameter changes - load specific trip if ID provided
  useEffect(() => {
    if (id) {
      const loadTripFromUrl = async () => {
        try {
          setLoading(true)
          // First try to find trip in context
          const contextTrip = trips.find(t => t.id === parseInt(id))
          if (contextTrip) {
            setSelectedTrip(contextTrip)
            setViewMode('detail')
          } else {
            // If not in context, fetch from API
            const tripData = await tripsService.getTrip(id)
            setSelectedTrip(tripData)
            setViewMode('detail')
          }
        } catch (err) {
          setError('Failed to load trip details')
          console.error('Error loading trip:', err)
          // Navigate back to list view if trip not found
          navigate('/collaborate', { replace: true })
        } finally {
          setLoading(false)
        }
      }

      loadTripFromUrl()
    } else {
      // No ID in URL, show list view
      setViewMode('list')
      setSelectedTrip(null)
    }
  }, [id, trips, navigate])

  // Load participants when trip changes
  useEffect(() => {
    if (selectedTrip && !selectedPendingTrip && viewMode === 'detail') {
      loadParticipants()
      loadPlans()
    }
  }, [selectedTrip, viewMode])

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-dropdown')) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications])

  // Load pending invitations
  const loadPendingInvitations = async () => {
    try {
      console.log('Loading pending invitations...')
      const invitations = await tripsService.getPendingInvitations()
      console.log('Pending invitations:', invitations)
      setPendingInvitations(invitations)
      
      // If user has pending invitations, load the first one
      if (invitations.length > 0) {
        console.log('Loading trip details for pending invitation:', invitations[0].trip.id)
        const invitationTrip = await tripsService.getPendingInvitationTrip(invitations[0].trip.id)
        console.log('Invitation trip details:', invitationTrip)
        setSelectedPendingTrip(invitationTrip)
      }
    } catch (error) {
      console.error('Error loading pending invitations:', error)
    }
  }

  const loadParticipants = async () => {
    if (!selectedTrip) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await participantsService.getParticipants(selectedTrip.id)
      if (result.success) {
        setParticipants(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to load participants')
      console.error('Error loading participants:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadPlans = async () => {
    if (!selectedTrip) return
    
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

  const handleTripNavigation = (tripId) => {
    // Navigate to trip details using URL parameters
    navigate(`/collaborate/${tripId}`)
  }

  const handleViewTrip = (trip) => {
    // Navigate to trip details using URL parameters
    navigate(`/collaborate/${trip.id}`)
  }

  const handleBackToList = () => {
    // Navigate back to main collaborative page
    navigate('/collaborate')
  }

  const handleInviteUser = async (email, role) => {
    if (!selectedTrip) return

    try {
      const result = await participantsService.inviteParticipant(selectedTrip.id, email, role)
      if (result.success) {
        setParticipants(prev => [...prev, result.data])
        setShowInviteModal(false)
      } else {
        alert(result.error)
      }
    } catch (err) {
      console.error('Error inviting user:', err)
      alert('Failed to invite user')
    }
  }

  const handleUpdateParticipant = async (participantId, updates) => {
    if (!selectedTrip) return

    try {
      const result = await participantsService.updateParticipant(selectedTrip.id, participantId, updates)
      if (result.success) {
        setParticipants(prev => 
          prev.map(p => p.id === participantId ? result.data : p)
        )
      } else {
        alert(result.error)
      }
    } catch (err) {
      console.error('Error updating participant:', err)
      alert('Failed to update participant')
    }
  }

  const handleAcceptInvitation = async (tripId) => {
    try {
      console.log('Accepting invitation for trip ID:', tripId)
      const result = await participantsService.acceptInvitation(tripId)
      console.log('Accept invitation result:', result)
      if (result.success) {
        setSelectedPendingTrip(null)
        setPendingInvitations(prev => prev.filter(inv => inv.trip.id !== tripId))
        setShowNotifications(false)
        window.location.reload()
        alert('Welcome to the trip! You can now access all collaborative features.')
      } else {
        console.error('Failed to accept invitation:', result.error)
        alert(result.error)
      }
    } catch (err) {
      console.error('Error accepting invitation:', err)
      alert('Failed to accept invitation')
    }
  }

  const handleDeclineInvitation = async (tripId) => {
    if (!confirm('Are you sure you want to decline this invitation? You won\'t be able to access this trip.')) return
    
    try {
      const result = await participantsService.declineInvitation(tripId)
      if (result.success) {
        setPendingInvitations(prev => prev.filter(inv => inv.trip.id !== tripId))
        setShowNotifications(false)
        
        if (selectedPendingTrip?.trip?.id === tripId) {
          setSelectedPendingTrip(null)
        }
        
        alert('Invitation declined.')
      } else {
        alert(result.error)
      }
    } catch (err) {
      console.error('Error declining invitation:', err)
      alert('Failed to decline invitation')
    }
  }

  const handleRemoveParticipant = async (participantId) => {
    if (!selectedTrip) return
    if (!confirm('Are you sure you want to remove this participant?')) return

    try {
      const result = await participantsService.removeParticipant(selectedTrip.id, participantId)
      if (result.success) {
        setParticipants(prev => prev.filter(p => p.id !== participantId))
      } else {
        alert(result.error)
      }
    } catch (err) {
      console.error('Error removing participant:', err)
      alert('Failed to remove participant')
    }
  }

  const handleUpdateTrip = async (tripData) => {
    if (!selectedTrip) return

    try {
      const result = await tripsService.updateTrip(selectedTrip.id, tripData)
      setSelectedTrip(result)
      setShowEditTripModal(false)
      alert('Trip updated successfully!')
    } catch (err) {
      console.error('Error updating trip:', err)
      alert('Failed to update trip')
    }
  }

  const handleDeleteTrip = async () => {
    if (!selectedTrip) return
    setShowDeleteModal(true)
  }

  const confirmDeleteTrip = async (confirmationText) => {
    if (confirmationText !== 'DELETE') {
      return false
    }
    
    try {
      await tripsService.deleteTrip(selectedTrip.id)
      setShowDeleteModal(false)
      
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
      return true
      
    } catch (err) {
      console.error('Error deleting trip:', err)
      return false
    }
  }

  // Get current user's participation status
  const getCurrentUserParticipation = () => {
    if (!currentUser || !participants.length) return null
    return participants.find(p => p.user?.id === currentUser.id)
  }

  const currentUserParticipation = getCurrentUserParticipation()
  
  // Check if current user can manage participants
  const canManageParticipants = () => {
    if (!selectedTrip || !currentUser) return false
    
    // Trip owner can always manage
    if (selectedTrip.user_id === currentUser.id) return true
    
    // Check if user is an organizer with accepted status
    const userParticipant = participants.find(p => 
      p.user?.id === currentUser.id && p.status === 'accepted'
    )
    return userParticipant && userParticipant.role === 'organizer'
  }

  // Check if current user can edit trip details
  const canEditTrip = () => {
    if (!selectedTrip || !currentUser) return false
    
    // Trip owner can always edit
    if (selectedTrip.user_id === currentUser.id) return true
    
    // Check if user is an organizer with accepted status
    const userParticipant = participants.find(p => 
      p.user?.id === currentUser.id && p.status === 'accepted'
    )
    return userParticipant && userParticipant.role === 'organizer'
  }

  // Get role display text
  const getRoleDisplay = (role) => {
    switch (role) {
      case 'organizer': return 'Organizer'
      case 'participant': return 'Participant' 
      case 'viewer': return 'Viewer'
      default: return role
    }
  }

  // Get status display
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'accepted': return 'Active'
      case 'pending': return 'Pending'
      case 'declined': return 'Declined'
      default: return status
    }
  }

  if (!trips.length && !pendingInvitations.length) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Trips Found</h2>
        <p className="text-gray-600 mb-6">Create your first trip to start collaborating</p>
        <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
          Create New Trip
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Collaborative Planning</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Plan trips together and split expenses</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
            {/* Notification Bell */}
            <div className="relative z-30 notification-dropdown">
              <button
                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setShowNotifications((prev) => !prev)}
                aria-label="Show notifications"
              >
                <Bell className="h-6 w-6 text-gray-500" />
                {pendingInvitations.length > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5 shadow">{pendingInvitations.length}</span>
                )}
              </button>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div
                    className="fixed left-1/2 -translate-x-1/2 top-20 w-[95vw] max-w-xs sm:absolute sm:left-auto sm:right-0 sm:translate-x-0 sm:top-auto sm:mt-2 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                    style={{ minWidth: '0' }}
                  >
                    <div className="py-3 px-4 border-b border-gray-100 font-semibold text-gray-700">Notifications</div>
                    <div className="max-h-80 overflow-y-auto">
                      {pendingInvitations.length === 0 ? (
                        <div className="py-6 text-center text-gray-400 text-sm">No notifications</div>
                      ) : pendingInvitations.map((invitation) => (
                        <div key={invitation.id} className="px-4 py-3 border-b border-gray-50 last:border-b-0 text-gray-700 text-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 mr-3">
                              <h4 className="font-medium text-gray-900 truncate">{invitation.trip.name}</h4>
                              <p className="text-sm text-gray-600 truncate">{invitation.trip.destination}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {format(new Date(invitation.trip.start_date), 'MMM dd')} - {format(new Date(invitation.trip.end_date), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <button
                                onClick={() => {
                                  handleAcceptInvitation(invitation.trip.id)
                                  setShowNotifications(false)
                                }}
                                className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center space-x-1"
                              >
                                <Check className="h-3 w-3" />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleDeclineInvitation(invitation.trip.id)
                                  setShowNotifications(false)
                                }}
                                className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 transition-colors flex items-center space-x-1"
                              >
                                <X className="h-3 w-3" />
                                <span>Decline</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* View Mode Toggle and Actions */}
            {viewMode === 'detail' && selectedTrip && (
              <button
                onClick={() => setViewMode('list')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 text-sm whitespace-nowrap"
              >
                <MapPin className="h-4 w-4" />
                <span>All Trips</span>
              </button>
            )}
            {viewMode === 'detail' && selectedTrip && canManageParticipants() && (
              <button 
                onClick={() => setShowInviteModal(true)}
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">បន្ថែមសមាជិក</span>
                <span className="sm:hidden">Invite</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conditional Content: Trip List or Trip Details */}
      {viewMode === 'list' ? (
        /* Trip List View */
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Trips</h2>
              <p className="text-sm text-gray-600">{trips.length} trip{trips.length !== 1 ? 's' : ''}</p>
            </div>
            
            {trips.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips yet</h3>
                <p className="text-gray-600 mb-4">Create your first trip to get started with collaborative planning</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Create Trip
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.map((trip) => (
                  <div key={trip.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg truncate">{trip.name}</h3>
                        <p className="text-gray-600 text-sm truncate">{trip.destination}</p>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        {trip.user_id === currentUser.id && (
                          <div className="bg-yellow-100 p-1 rounded-full">
                            <Crown className="h-4 w-4 text-yellow-600" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {format(new Date(trip.start_date), 'MMM dd')} - {format(new Date(trip.end_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          Created by {trip.user_id === currentUser.id ? 'You' : trip.created_by || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {format(new Date(trip.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      {trip.budget && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">Budget: ${trip.budget.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      
                      <button
                        onClick={() => handleTripNavigation(trip.id)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm font-medium"
                      >
                        <span>Manage and View Details</span>
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : selectedTrip ? (
        /* Trip Details View */
        <>
          {/* Trip Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{selectedTrip.name}</h2>
                      <p className="text-gray-600 text-sm sm:text-base truncate">{selectedTrip.destination}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0">
                        <span className="truncate">{format(new Date(selectedTrip.start_date), 'MMM dd, yyyy')} - {format(new Date(selectedTrip.end_date), 'MMM dd, yyyy')}</span>
                        {selectedTrip.budget && (
                          <span className="truncate">Budget: ${selectedTrip.budget.toLocaleString()}</span>
                        )}
                      </div>
                      {selectedTrip.description && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">{selectedTrip.description}</p>
                      )}
                    </div>
                    
                    {/* Edit Button for Organizers */}
                    {canEditTrip() && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowEditTripModal(true)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 text-sm whitespace-nowrap"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="hidden sm:inline">Edit Trip</span>
                          <span className="sm:hidden">Edit</span>
                        </button>
                        <button
                          onClick={handleDeleteTrip}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 text-sm whitespace-nowrap"
                          title="Delete Trip (Permanent)"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{participants.length}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Members</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{selectedTrip.expenses?.length || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Expenses</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{participants.filter(p => p.status === 'pending').length}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab('members')}
                  className={`px-4 sm:px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'members'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Team Members
                </button>
                <button
                  onClick={() => setActiveTab('plans')}
                  className={`px-4 sm:px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'plans'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Plans
                </button>
                <button
                  onClick={() => setActiveTab('expenses')}
                  className={`px-4 sm:px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'expenses'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Expenses
                </button>
              </nav>
            </div>

            <div className="p-4 sm:p-6">
              {/* Members Tab */}
              {activeTab === 'members' && (
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading participants...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Participants</h3>
                      <p className="text-gray-600 mb-4">{error}</p>
                      <button
                        onClick={loadParticipants}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : participants.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members yet</h3>
                      <p className="text-gray-600 mb-4">Invite friends and family to plan together</p>
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Invite First Member</span>
                      </button>
                    </div>
                  ) : (
                    participants.map((participant) => (
                      <div key={participant.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{participant.user.name}</h4>
                                <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
                                  {(selectedTrip.user_id === participant.user?.id || participant.role === 'organizer') && (
                                    <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
                                  )}
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                    participant.status === 'accepted' 
                                      ? 'bg-green-100 text-green-800'
                                      : participant.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {getStatusDisplay(participant.status)}
                                  </span>
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex-shrink-0">
                                    {getRoleDisplay(participant.role)}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{participant.user.email}</p>
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
                  {plans.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No plans yet</h3>
                      <p className="text-gray-600 mb-4">Create your first plan to organize your trip</p>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto">
                        <Plus className="h-4 w-4" />
                        <span>Create First Plan</span>
                      </button>
                    </div>
                  ) : (
                    plans.map((plan) => (
                      <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                              <h4 className="font-semibold text-gray-900 truncate">{plan.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                plan.status === 'active' 
                                  ? 'bg-green-100 text-green-800'
                                  : plan.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {plan.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{plan.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>By {plan.created_by}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(plan.created_at), 'MMM dd, yyyy')}</span>
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => window.location.href = `/plan/${plan.id}`}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg transition-colors flex items-center space-x-1 text-sm font-medium flex-shrink-0"
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
                  {selectedTrip.expenses?.length === 0 || !selectedTrip.expenses ? (
                    <div className="text-center py-8 sm:py-12">
                      <DollarSign className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No expenses yet</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4">Start adding expenses to track your trip budget</p>
                      <a 
                        href="/expenses"
                        className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <DollarSign className="h-4 w-4" />
                        <span>Add First Expense</span>
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedTrip.expenses.slice(0, 10).map((expense) => (
                        <div key={expense.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{expense.title || expense.description}</h4>
                                {expense.is_shared && (
                                  <span className="flex items-center space-x-1 text-blue-600 text-xs sm:text-sm">
                                    <Users className="h-3 w-3" />
                                    <span>Shared</span>
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600 mt-1">
                                <span className="capitalize">{expense.category?.name}</span>
                                <span>{format(new Date(expense.expense_date || expense.date), 'MMM dd, yyyy')}</span>
                                <span className="truncate">{expense.user?.name}</span>
                                {expense.status && expense.status !== 'approved' && (
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    expense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {expense.status}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right sm:text-left flex-shrink-0">
                              <p className="font-semibold text-gray-900 text-sm sm:text-base">${parseFloat(expense.amount).toFixed(2)}</p>
                              <p className="text-xs sm:text-sm text-gray-500">{expense.currency || 'USD'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="text-center pt-4">
                        <a 
                          href="/expenses"
                          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          <span>View All Expenses</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* No Trip Selected */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Trip Selected</h3>
          <p className="text-gray-600">Create or select a trip to start collaborative planning</p>
        </div>
      )}
    </div>
  )
}

// Modal Components would be imported from separate files in a real app
function InviteModal({ isOpen, onClose, onInvite, tripName }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('participant')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onInvite(email, role)
      setEmail('')
      setRole('participant')
    } catch (error) {
      console.error('Error inviting user:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full z-10">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Invite to {tripName}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="participant">Participant</option>
                  <option value="organizer">Organizer</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

// Placeholder modal components - these would be separate files in a real app
function EditTripModal({ isOpen, onClose, onUpdate, trip }) {
  if (!isOpen) return null
  return <div>Edit Trip Modal Placeholder</div>
}

function DeleteTripModal({ isOpen, onClose, onConfirm, trip, participantCount, expenseCount }) {
  if (!isOpen) return null
  return <div>Delete Trip Modal Placeholder</div>
}
