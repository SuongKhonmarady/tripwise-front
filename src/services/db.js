// src/services/db.js
// IndexedDB helper using idb-keyval for offline caching and queuing
import { set, get, del, keys } from 'idb-keyval';

const QUEUE_KEY = 'offline-queue';

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

// For caching data (e.g., trips, expenses)
export async function cacheData(key, data) {
  await set(key, data);
}

export async function getCachedData(key) {
  return await get(key);
}
