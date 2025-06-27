import api from './api';

export const tripsService = {
  // Get all user trips (only owned or accepted)
  async getTrips() {
    const response = await api.get('/trips');
    return response.data.trips;
  },

  // Get pending invitations
  async getPendingInvitations() {
    const response = await api.get('/pending-invitations');
    return response.data.invitations;
  },

  // Get trip details for pending invitation (limited info)
  async getPendingInvitationTrip(tripId) {
    const response = await api.get(`/pending-invitations/${tripId}`);
    return response.data;
  },

  // Get single trip
  async getTrip(tripId) {
    const response = await api.get(`/trips/${tripId}`);
    return response.data.trip;
  },

  // Create new trip
  async createTrip(tripData) {
    const response = await api.post('/trips', tripData);
    return response.data.trip;
  },

  // Update trip
  async updateTrip(tripId, tripData) {
    const response = await api.put(`/trips/${tripId}`, tripData);
    return response.data.trip;
  },

  // Delete trip
  async deleteTrip(tripId) {
    const response = await api.delete(`/trips/${tripId}`);
    return response.data;
  },

  // Get trip summary with statistics
  async getTripSummary(tripId) {
    const response = await api.get(`/trips/${tripId}/summary`);
    return response.data;
  }
};
