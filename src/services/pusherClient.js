import Pusher from 'pusher-js';

window.Pusher = Pusher;
window.Pusher.logToConsole = true;

const PUSHER_APP_KEY = import.meta.env.VITE_PUSHER_APP_KEY || 'your-app-key';
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'mt1';

// Log the configuration for debugging
console.log('Pusher Config:', {
  key: PUSHER_APP_KEY,
  cluster: PUSHER_CLUSTER,
  keyValid: PUSHER_APP_KEY !== 'your-app-key'
});

const pusher = new Pusher(PUSHER_APP_KEY, {
  cluster: PUSHER_CLUSTER,
  forceTLS: true,
  authEndpoint: 'https://tripwise-api.onrender.com/api/broadcasting/auth',
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
    },
  },
  // Add connection timeout and retry configuration
  activityTimeout: 30000,
  pongTimeout: 6000,
  unavailableTimeout: 10000,
  authorizer: (channel, options) => {
    return {
      authorize: (socketId, callback) => {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          console.warn('No auth token found, skipping Pusher authorization');
          callback(true, { error: 'No auth token' });
          return;
        }

        fetch('https://tripwise-api.onrender.com/api/broadcasting/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channel.name,
          }),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            callback(false, data);
          })
          .catch(error => {
            console.error('Pusher auth error:', error);
            callback(true, error);
          });
      },
    };
  },
});

// Add connection state logging for debugging
pusher.connection.bind('connecting', () => {
  console.log('Pusher: Connecting...');
});

pusher.connection.bind('connected', () => {
  console.log('Pusher: Connected successfully');
});

pusher.connection.bind('disconnected', () => {
  console.log('Pusher: Disconnected');
});

pusher.connection.bind('failed', () => {
  console.error('Pusher: Connection failed');
});

pusher.connection.bind('error', (err) => {
  console.error('Pusher connection error:', err);
});

export default pusher;
