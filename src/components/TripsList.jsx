import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { cacheData, getCachedData } from '../services/db';

function TripsList() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    async function loadTrips() {
      if (!navigator.onLine) {
        // Offline: load from cache
        const cached = await getCachedData('trips');
        setTrips(cached || []);
        setOffline(true);
        setLoading(false);
      } else {
        try {
          const response = await api.get('/trips');
          if (!response.data.offline) {
            await cacheData('trips', response.data); // Cache the data
          }
          setTrips(response.data);
          setOffline(false);
        } catch (error) {
          // If error, try to load from cache
          const cached = await getCachedData('trips');
          setTrips(cached || []);
          setOffline(true);
        } finally {
          setLoading(false);
        }
      }
    }
    loadTrips();
    // Listen for online/offline events
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      {offline && <div className="text-yellow-600 mb-2">Offline mode: showing cached trips</div>}
      {trips.length === 0 ? (
        <div>No trips found.</div>
      ) : (
        <ul className="space-y-2">
          {trips.map(trip => (
            <li key={trip.id} className="p-2 bg-white rounded shadow">
              {trip.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TripsList;
