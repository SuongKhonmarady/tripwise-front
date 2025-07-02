import api from './api';
import { cacheTrips, getCachedTrips, cacheData, getCachedData } from './db';

export const tripsService = {
  // Get all user trips (only owned or accepted)
  async getTrips() {
    // If offline, return cached data immediately
    if (!navigator.onLine) {
      return await getCachedTrips();
    }
    
    try {
      const response = await api.get('/trips');
      
      // Handle offline response from interceptor
      if (response.data.offline) {
        return await getCachedTrips();
      }
      
      const trips = response.data.trips;
      
      // Cache the trips for offline use
      await cacheTrips(trips);
      
      return trips;
    } catch (error) {
      // If API fails, try to return cached data
      console.log('API failed, using cached trips:', error.message);
      try {
        return await getCachedTrips();
      } catch (cacheError) {
        console.error('No cached trips available:', cacheError);
        return []; // Return empty array instead of throwing
      }
    }
  },

  // Get pending invitations
  async getPendingInvitations() {
    // If offline, return cached data
    if (!navigator.onLine) {
      return await getCachedData('pending-invitations') || [];
    }
    
    try {
      const response = await api.get('/pending-invitations');
      const invitations = response.data.invitations;
      
      // Cache for offline use
      await cacheData('pending-invitations', invitations);
      
      return invitations;
    } catch (error) {
      // Fallback to cache
      try {
        return await getCachedData('pending-invitations') || [];
      } catch (cacheError) {
        throw error;
      }
    }
  },

  // Get trip details for pending invitation (limited info)
  async getPendingInvitationTrip(tripId) {
    // If offline, return cached data
    if (!navigator.onLine) {
      return await getCachedData(`pending-invitation-${tripId}`);
    }
    
    try {
      const response = await api.get(`/pending-invitations/${tripId}`);
      const tripData = response.data;
      
      // Cache for offline use
      await cacheData(`pending-invitation-${tripId}`, tripData);
      
      return tripData;
    } catch (error) {
      // Fallback to cache
      try {
        return await getCachedData(`pending-invitation-${tripId}`);
      } catch (cacheError) {
        throw error;
      }
    }
  },

  // Get single trip
  async getTrip(tripId) {
    // If offline, return cached data
    if (!navigator.onLine) {
      return await getCachedData(`trip-${tripId}`);
    }
    
    try {
      const response = await api.get(`/trips/${tripId}`);
      const trip = response.data.trip;
      
      // Cache for offline use
      await cacheData(`trip-${tripId}`, trip);
      
      return trip;
    } catch (error) {
      // Fallback to cache
      try {
        return await getCachedData(`trip-${tripId}`);
      } catch (cacheError) {
        throw error;
      }
    }
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
