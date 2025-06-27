import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTrip } from '../context/TripContext'
import { itineraryService } from '../services'
import { 
  Calendar, 
  Plus, 
  Clock, 
  MapPin, 
  Edit,
  Trash2,
  Plane,
  Hotel,
  Utensils,
  Camera
} from 'lucide-react'
import { format, addDays, isSameDay } from 'date-fns'

export default function TripScheduler() {
  const { trips } = useTrip()
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [itineraries, setItineraries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Auto-select first trip when trips load
  useEffect(() => {
    if (trips.length > 0 && !selectedTrip) {
      setSelectedTrip(trips[0])
    }
  }, [trips, selectedTrip])

  // Load itineraries when trip changes
  useEffect(() => {
    if (selectedTrip) {
      loadItineraries()
    }
  }, [selectedTrip])

  const loadItineraries = async () => {
    if (!selectedTrip) return
    
    try {
      setLoading(true)
      setError(null)
      const data = await itineraryService.getItineraries(selectedTrip.id)
      setItineraries(data)
    } catch (err) {
      console.error('Error loading itineraries:', err)
      setError('Failed to load itineraries')
      setItineraries([])
    } finally {
      setLoading(false)
    }
  }

  const eventIcons = {
    flight: Plane,
    hotel: Hotel,
    meal: Utensils,
    activity: Camera,
    transport: Plane,
    meeting: Clock
  }

  const eventColors = {
    flight: 'bg-blue-100 text-blue-800 border-blue-200',
    hotel: 'bg-green-100 text-green-800 border-green-200',
    meal: 'bg-orange-100 text-orange-800 border-orange-200',
    activity: 'bg-purple-100 text-purple-800 border-purple-200',
    transport: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    meeting: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getDaysArray = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = []
    let currentDate = start

    while (currentDate <= end) {
      days.push(new Date(currentDate))
      currentDate = addDays(currentDate, 1)
    }
    return days
  }

  const getEventsForDate = (date) => {
    return itineraries.filter(item => 
      isSameDay(new Date(item.date), date)
    )
  }

  const addScheduleEvent = async (eventData) => {
    try {
      setError(null) // Clear any previous errors
      console.log('Adding event with data:', eventData)
      
      // Convert the form data to match backend expectations
      const itineraryData = {
        title: eventData.title,
        notes: eventData.notes || null,
        date: eventData.date,
        time: eventData.time, // Send time as time to backend
        location: eventData.location || null,
        type: eventData.type
      }
      
      console.log('Sending to backend:', itineraryData)
      
      const newItinerary = await itineraryService.createItinerary(selectedTrip.id, itineraryData)
      console.log('Received from backend:', newItinerary)
      
      setItineraries(prev => [...prev, newItinerary])
      setError(null) // Success, clear any errors
    } catch (err) {
      console.error('Error adding event:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error'
      const validationErrors = err.response?.data?.errors
      
      if (validationErrors) {
        const errorDetails = Object.values(validationErrors).flat().join(', ')
        setError(`Validation failed: ${errorDetails}`)
      } else {
        setError(`Failed to add event: ${errorMessage}`)
      }
    }
  }

  const deleteScheduleEvent = async (eventId) => {
    try {
      await itineraryService.deleteItinerary(selectedTrip.id, eventId)
      setItineraries(prev => prev.filter(item => item.id !== eventId))
    } catch (err) {
      console.error('Error deleting event:', err)
      setError('Failed to delete event')
    }
  }

  if (!selectedTrip && trips.length === 0) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Trips Found</h2>
        <p className="text-gray-600 mb-6">Create your first trip to start planning your schedule</p>
        <Link 
          to="/create-trip"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Trip</span>
        </Link>
      </div>
    )
  }

  const tripDays = selectedTrip ? getDaysArray(selectedTrip.start_date, selectedTrip.end_date) : []

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">កាលវិភាគគ្រប់គ្រងដំណើរកម្សាន្ត</h1>
            <p className="text-gray-600 mt-2">Plan your day-by-day itinerary</p>
          </div>
          
          {/* Trip Selector */}
          <div className="flex items-center space-x-4">
            {trips.length > 0 && (
              <select
                value={selectedTrip?.id || ''}
                onChange={(e) => setSelectedTrip(trips.find(t => t.id === parseInt(e.target.value)))}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {trips.map(trip => (
                  <option key={trip.id} value={trip.id}>{trip.name}</option>
                ))}
              </select>
            )}
            
            {selectedTrip && (
              <button 
                onClick={() => setShowEventModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Event</span>
              </button>
            )}
          </div>
        </div>

        {/* Trip Info */}
        {selectedTrip && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedTrip.name}</h2>
                <div className="flex items-center space-x-2 text-gray-600 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedTrip.destination}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold text-gray-900">
                  {format(new Date(selectedTrip.start_date), 'MMM dd')} - 
                  {format(new Date(selectedTrip.end_date), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Calendar View */}
      {selectedTrip && tripDays.length > 0 ? (
        <div className="grid gap-4">
          {tripDays.map((day, index) => {
            const dayEvents = getEventsForDate(day)
            const isToday = isSameDay(day, new Date())
            
            return (
              <div key={day.toISOString()} className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className={`p-4 border-b border-gray-200 ${isToday ? 'bg-primary-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      ថ្ងៃទី {index + 1} - {format(day, 'EEEE, MMMM dd')}
                    </h3>
                    {isToday && (
                      <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full mt-1">
                        ថ្ងៃនេះ
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDate(day)
                      setShowEventModal(true)
                    }}
                    className="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                {dayEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No events planned for this day</p>
                    <button
                      onClick={() => {
                        setSelectedDate(day)
                        setShowEventModal(true)
                      }}
                      className="text-green-600 hover:text-green-700 text-sm mt-2"
                    >
                      Add your first event
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dayEvents
                      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                      .map((event) => {
                        const IconComponent = eventIcons[event.type] || Clock
                        return (
                          <div
                            key={event.id}
                            className={`border rounded-lg p-4 ${eventColors[event.type] || eventColors.meeting}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <IconComponent className="h-5 w-5 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="font-semibold">{event.title}</h4>
                                  {event.notes && (
                                    <p className="text-sm mt-1 opacity-80">{event.notes}</p>
                                  )}
                                  <div className="flex items-center space-x-4 text-sm mt-2">
                                    <div className="flex items-center space-x-1">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        {event.time ? (
                                          event.time.includes('T') ? 
                                            format(new Date(event.time), 'HH:mm') : 
                                            event.time.substring(0, 5)
                                        ) : 'No time set'}
                                      </span>
                                    </div>
                                    {event.location && (
                                      <div className="flex items-center space-x-1">
                                        <MapPin className="h-3 w-3" />
                                        <span>{event.location}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <button className="p-1 hover:bg-white hover:bg-opacity-50 rounded">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteScheduleEvent(event.id)}
                                  className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Trip Selected</h2>
          <p className="text-gray-600 mb-6">Select a trip from above to view and manage its schedule</p>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && selectedTrip && (
        <EventModal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          tripId={selectedTrip.id}
          selectedDate={selectedDate}
          onSave={addScheduleEvent}
        />
      )}
    </div>
  )
}

function EventModal({ isOpen, onClose, tripId, selectedDate, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    type: 'activity',
    time: '09:00',
    location: '',
    date: format(selectedDate, 'yyyy-MM-dd')
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...formData,
      tripId
    })
    onClose()
    setFormData({
      title: '',
      notes: '',
      type: 'activity',
      time: '09:00',
      location: '',
      date: format(selectedDate, 'yyyy-MM-dd')
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-white bg-opacity-40 backdrop-blur-md" onClick={onClose} />
        
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full z-10">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Event</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Visit Eiffel Tower"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="activity">Activity</option>
                  <option value="flight">Flight</option>
                  <option value="hotel">Hotel</option>
                  <option value="meal">Meal</option>
                  <option value="transport">Transport</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Champ de Mars, Paris"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="3"
                  placeholder="Optional notes about this event..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
