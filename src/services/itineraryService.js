import api from './api';

export const itineraryService = {
  // Get trip itineraries
  async getItineraries(tripId) {
    const response = await api.get(`/trips/${tripId}/itineraries`);
    return response.data.itineraries;
  },

  // Get single itinerary
  async getItinerary(tripId, itineraryId) {
    const response = await api.get(`/trips/${tripId}/itineraries/${itineraryId}`);
    return response.data.itinerary;
  },

  // Create new itinerary item
  async createItinerary(tripId, itineraryData) {
    const response = await api.post(`/trips/${tripId}/itineraries`, itineraryData);
    return response.data.itinerary;
  },

  // Update itinerary item
  async updateItinerary(tripId, itineraryId, itineraryData) {
    const response = await api.put(`/trips/${tripId}/itineraries/${itineraryId}`, itineraryData);
    return response.data.itinerary;
  },

  // Delete itinerary item
  async deleteItinerary(tripId, itineraryId) {
    const response = await api.delete(`/trips/${tripId}/itineraries/${itineraryId}`);
    return response.data;
  }
};
