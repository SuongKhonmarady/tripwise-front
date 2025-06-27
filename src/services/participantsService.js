import api from './api'

export const participantsService = {
  // Get all participants for a trip
  async getParticipants(tripId) {
    try {
      const response = await api.get(`/trips/${tripId}/participants`)
      return {
        success: true,
        data: response.data.participants
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch participants'
      }
    }
  },

  // Invite a user to a trip
  async inviteParticipant(tripId, email, role = 'participant') {
    try {
      const response = await api.post(`/trips/${tripId}/participants`, {
        email,
        role
      })
      return {
        success: true,
        data: response.data.participant,
        message: response.data.message
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to invite participant'
      }
    }
  },

  // Update participant role or status
  async updateParticipant(tripId, participantId, updates) {
    try {
      const response = await api.put(`/trips/${tripId}/participants/${participantId}`, updates)
      return {
        success: true,
        data: response.data.participant,
        message: response.data.message
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update participant'
      }
    }
  },

  // Remove a participant from a trip
  async removeParticipant(tripId, participantId) {
    try {
      const response = await api.delete(`/trips/${tripId}/participants/${participantId}`)
      return {
        success: true,
        message: response.data.message
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove participant'
      }
    }
  },

  // Accept an invitation to join a trip
  async acceptInvitation(tripId) {
    try {
      const response = await api.post(`/trips/${tripId}/participants/accept`)
      return {
        success: true,
        data: response.data.participant,
        message: response.data.message
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to accept invitation'
      }
    }
  },

  // Decline an invitation to join a trip
  async declineInvitation(tripId) {
    try {
      const response = await api.post(`/trips/${tripId}/participants/decline`)
      return {
        success: true,
        message: response.data.message
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to decline invitation'
      }
    }
  }
}

export default participantsService
