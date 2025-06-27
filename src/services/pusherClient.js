import Pusher from 'pusher-js';

window.Pusher = Pusher;
window.Pusher.logToConsole = true;

const PUSHER_APP_KEY = import.meta.env.VITE_PUSHER_APP_KEY || 'your-app-key';
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'mt1';

const pusher = new Pusher(PUSHER_APP_KEY, {
  cluster: PUSHER_CLUSTER,
  forceTLS: true,
  authEndpoint: 'http://localhost:8000/api/broadcasting/auth',
  authorizer: (channel, options) => {
    return {
      authorize: (socketId, callback) => {
        fetch('http://localhost:8000/api/broadcasting/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channel.name,
          }),
        })
          .then(response => response.json())
          .then(data => {
            callback(false, data);
          })
          .catch(error => {
            callback(true, error);
          });
      },
    };
  },
});

export default pusher;
