import axios from 'axios';
import {
  queueRequest,
  getQueuedRequests,
  clearQueuedRequests,
  removeFirstQueuedRequest,
  cacheData,
  getCachedData
} from './db';

// API Configuration
const API_BASE_URL = 'https://tripwise-api.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Replay queued requests when back online
window.addEventListener('online', async () => {
  const queued = await getQueuedRequests();
  for (const req of queued) {
    try {
      await api(req);
      await removeFirstQueuedRequest();
    } catch (e) {
      // If still fails, keep in queue
      break;
    }
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    // Handle offline: queue the request
    if (!window.navigator.onLine) {
      const originalRequest = error.config;
      await queueRequest({
        ...originalRequest,
        // Axios stores data in 'data', but method/url/headers are needed
        url: originalRequest.url,
        method: originalRequest.method,
        data: originalRequest.data,
        headers: originalRequest.headers,
      });
      // Optionally show a toast/notification here
      return Promise.resolve({
        data: { offline: true, message: 'Saved locally. Will sync when online.' },
        status: 200,
        statusText: 'Offline',
        headers: {},
        config: originalRequest,
      });
    }
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
