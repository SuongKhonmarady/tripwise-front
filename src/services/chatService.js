import api from './api';

const chatService = {
  async getMessages(tripId) {
    try {
      const res = await api.get(`/trips/${tripId}/messages`);
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
  }
};

export default chatService;
