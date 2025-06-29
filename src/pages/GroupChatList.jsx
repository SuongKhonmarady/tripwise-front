
import React, { useEffect, useState } from 'react';
import pusher from '../services/pusherClient';
import { Link } from 'react-router-dom';
import { MessageCircle, Users } from 'lucide-react';
import { tripsService } from '../services/tripsService';
import chatService from '../services/chatService';

export default function GroupChatList() {
  const [groupChats, setGroupChats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch and update group chat list
  const fetchChats = async () => {
    setLoading(true);
    try {
      const trips = await tripsService.getTrips();
      // For each trip, fetch the last message using chatService.getLastMessageDirect
      const chats = await Promise.all(trips.map(async trip => {
        let lastMessageObj = null;
        let lastMessage = trip.lastMessage || '';
        let lastMessageUser = '';
        let lastActive = trip.lastActive || trip.updatedAt || trip.updated_at || trip.createdAt || trip.created_at;
        // If not present, fetch from API (using /last-message endpoint)
        if (!lastMessage) {
          try {
            const msg = await chatService.getLastMessageDirect(trip.id);
            if (msg) {
              lastMessageObj = msg;
              lastMessage = msg.message;
              lastMessageUser = msg.user?.name || '';
              lastActive = msg.created_at || lastActive;
            }
          } catch {}
        }
        return {
          id: trip.id,
          name: trip.name,
          members: trip.participants?.length || 1,
          lastMessage: lastMessage || 'No messages yet',
          lastMessageUser,
          lastActive,
        };
      }));
      // Sort so the group with the most recent lastActive is at the top
      chats.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
      setGroupChats(chats);
    } catch (err) {
      setGroupChats([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChats();
    // Subscribe to all trip chat channels for real-time updates
    let channels = [];
    let isMounted = true;
    (async () => {
      const trips = await tripsService.getTrips();
      channels = trips.map(trip => pusher.subscribe(`private-trip-chat.${trip.id}`));
      channels.forEach(channel => {
        channel.bind('new-message', (data) => {
          if (!isMounted) return;
          // DEBUG: log the data to ensure event is received
          // console.log('Pusher new-message event:', data);
          setGroupChats(prev => {
            const idx = prev.findIndex(c => c.id === data.trip_id || c.id === data.trip?.id);
            if (idx === -1) return prev;
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              lastMessage: data.message,
              lastMessageUser: data.user?.name || '',
              lastActive: data.created_at || updated[idx].lastActive,
            };
            // Move updated chat to top
            const [chatObj] = updated.splice(idx, 1);
            return [chatObj, ...updated];
          });
        });
      });
    })();
    return () => {
      isMounted = false;
      channels.forEach(channel => {
        channel.unbind('new-message');
        pusher.unsubscribe(channel.name);
      });
    };
    // eslint-disable-next-line
  }, []);


function formatTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-blue-600" /> Group Chats
      </h1>
      <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : groupChats.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No group chats yet.</div>
        ) : (
          groupChats.map(chat => (
            <Link
              to={`/chat/${chat.id}`}
              key={chat.id}
              className="flex items-center px-5 py-4 hover:bg-blue-50 transition group"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mr-4">
                <MessageCircle className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 text-lg">{chat.name}</span>
                  <span className="text-xs text-gray-400">{formatTime(chat.lastActive)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">{chat.members} members</span>
                  <span className="text-xs text-gray-400 ml-2 truncate max-w-xs">
                    {chat.lastMessageUser ? `${chat.lastMessageUser}: ` : ''}
                    {chat.lastMessage}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
