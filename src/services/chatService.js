import api from './api';

const chatService = {
  async getMessages(tripId, { limit = 20, beforeId } = {}) {
    try {
      let url = `/trips/${tripId}/messages?limit=${limit}`;
      if (beforeId) url += `&before_id=${beforeId}`;
      const res = await api.get(url);
      return res.data;
    } catch (err) {
      return { success: false, error: err?.response?.data?.message || 'Failed to fetch messages' };
    }
  },
  async sendMessage(tripId, message) {
    try {
      const res = await api.post(`/trips/${tripId}/messages`, { message });
      return res.data;
    } catch (err) {
      return { success: false, error: err?.response?.data?.message || 'Failed to send message' };
    }
  },
  async getLastMessage(tripId) {
    try {
      const res = await api.get(`/trips/${tripId}/messages?limit=1`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data[0];
      }
      return null;
    } catch (err) {
      return null;
    }
  },
  async getLastMessageDirect(tripId) {
    try {
      const res = await api.get(`/trips/${tripId}/messages/last?trip=${tripId}`);
      return res.data;
    } catch (err) {
      return null;
    }
  },
  async typing(tripId) {
    try {
      const res = await api.post(`/trips/${tripId}/typing`);
      return res.data;
    } catch (err) {
      console.error('Failed to send typing indicator:', err);
      return { success: false, error: err?.response?.data?.message || 'Failed to send typing indicator' };
    }
  }
};

export default chatService;
