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
    // Handle offline: queue the request and return success for GET requests
    if (!window.navigator.onLine || error.code === 'ERR_INTERNET_DISCONNECTED') {
      const originalRequest = error.config;
      
      // For non-GET requests, queue them for later sync
      if (originalRequest.method && originalRequest.method.toLowerCase() !== 'get') {
        await queueRequest({
          ...originalRequest,
          url: originalRequest.url,
          method: originalRequest.method,
          data: originalRequest.data,
          headers: originalRequest.headers,
        });
        
        return Promise.resolve({
          data: { 
            offline: true, 
            message: 'Saved locally. Will sync when online.',
            queued: true 
          },
          status: 200,
          statusText: 'Offline',
          headers: {},
          config: originalRequest,
        });
      }
      
      // For GET requests, return empty data to allow fallback to cache
      return Promise.resolve({
        data: { 
          offline: true, 
          message: 'Loading from cache',
          [getDataKey(originalRequest.url)]: []
        },
        status: 200,
        statusText: 'Offline',
        headers: {},
        config: originalRequest,
      });
    }
    
    // Only handle 401 errors when online to avoid unnecessary logouts
    if (error.response?.status === 401 && window.navigator.onLine) {
      // Token expired or invalid - only when we're sure it's a server response
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Don't redirect if we're already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to determine the data key for different endpoints
function getDataKey(url) {
  if (url.includes('/trips') && url.includes('/expenses')) return 'expenses';
  if (url.includes('/trips')) return 'trips';
  if (url.includes('/categories')) return 'categories';
  if (url.includes('/user')) return 'user';
  return 'data';
}

export default api;
