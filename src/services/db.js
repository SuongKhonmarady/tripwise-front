// src/services/db.js
// IndexedDB helper using idb-keyval for offline caching and queuing
import { set, get, del, keys } from 'idb-keyval';

const QUEUE_KEY = 'offline-queue';
const USER_DATA_KEY = 'user-data';
const TRIPS_KEY = 'cached-trips';
const EXPENSES_KEY = 'cached-expenses';

// Request queuing functions
export async function queueRequest(request) {
  const queue = (await get(QUEUE_KEY)) || [];
  queue.push(request);
  await set(QUEUE_KEY, queue);
}

export async function getQueuedRequests() {
  return (await get(QUEUE_KEY)) || [];
}

export async function clearQueuedRequests() {
  await set(QUEUE_KEY, []);
}

export async function removeFirstQueuedRequest() {
  const queue = (await get(QUEUE_KEY)) || [];
  queue.shift();
  await set(QUEUE_KEY, queue);
}

// General data caching functions
export async function cacheData(key, data) {
  await set(key, data);
}

export async function getCachedData(key) {
  return await get(key);
}

// Specific caching functions for user data
export async function cacheUserData(userData) {
  await set(USER_DATA_KEY, {
    ...userData,
    cachedAt: Date.now()
  });
}

export async function getCachedUserData() {
  return await get(USER_DATA_KEY);
}

// Trip data caching
export async function cacheTrips(trips) {
  await set(TRIPS_KEY, {
    data: trips,
    cachedAt: Date.now()
  });
}

export async function getCachedTrips() {
  const cached = await get(TRIPS_KEY);
  return cached?.data || [];
}

// Expense data caching
export async function cacheExpenses(tripId, expenses) {
  const key = `${EXPENSES_KEY}-${tripId}`;
  await set(key, {
    data: expenses,
    cachedAt: Date.now()
  });
}

export async function getCachedExpenses(tripId) {
  const key = `${EXPENSES_KEY}-${tripId}`;
  const cached = await get(key);
  return cached?.data || [];
}

// Check if cached data is stale (older than specified minutes)
export function isCacheStale(cachedData, maxAgeMinutes = 60) {
  if (!cachedData || !cachedData.cachedAt) return true;
  const now = Date.now();
  const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
  return (now - cachedData.cachedAt) > maxAge;
}

// Clear all cached data
export async function clearAllCache() {
  const allKeys = await keys();
  await Promise.all(allKeys.map(key => del(key)));
}
