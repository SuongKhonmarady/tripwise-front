import React, { useEffect, useState } from 'react';
import pusher from '../services/pusherClient';
import { Link } from 'react-router-dom';
import { MessageCircle, Users, RefreshCw } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export default function GroupChatList() {
  const { 
    groupChats, 
    loading, 
    initialized, 
    fetchChats, 
    markChatAsRead, 
    markAllAsRead, 
    refreshChats 
  } = useChat();
  
  const [refreshing, setRefreshing] = useState(false);
  const [pusherConnected, setPusherConnected] = useState(false);
  const [pusherDisabled, setPusherDisabled] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshChats();
    setRefreshing(false);
  };

  // Initialize chat data when component mounts
  useEffect(() => {
    if (!initialized) {
      fetchChats();
    }
  }, [initialized, fetchChats]);

  // Monitor Pusher connection for UI display
  useEffect(() => {
    // Check if user is authenticated
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setPusherDisabled(true);
      return;
    }
    
    // Check if Pusher is properly configured
    const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
    if (!pusherKey || pusherKey === 'your-app-key') {
      setPusherDisabled(true);
      return;
    }
    
    // Monitor Pusher connection state for UI
    const handleConnected = () => setPusherConnected(true);
    const handleDisconnected = () => setPusherConnected(false);
    
    // Check current connection state
    setPusherConnected(pusher.connection.state === 'connected');
    
    pusher.connection.bind('connected', handleConnected);
    pusher.connection.bind('disconnected', handleDisconnected);
    
    return () => {
      pusher.connection.unbind('connected', handleConnected);
      pusher.connection.unbind('disconnected', handleDisconnected);
    };
  }, []);

  // Set up Pusher subscriptions for real-time chat updates
  useEffect(() => {
    if (pusherDisabled || !initialized || groupChats.length === 0) return;
    
    let channels = [];
    let isMounted = true;
    
    const eventNames = ['new-message', 'message-sent', 'chat-message', 'NewMessage'];
    
    try {
      channels = groupChats.map(chat => {
        const channelName = `private-trip-chat.${chat.id}`;
        const channel = pusher.subscribe(channelName);
        
        eventNames.forEach(eventName => {
          channel.bind(eventName, (data) => {
            if (!isMounted) return;
            
            const tripId = data.trip_id || data.tripId || data.trip?.id;
            if (tripId) {
              refreshChats();
            }
          });
        });
        
        channel.bind('pusher:subscription_succeeded', () => {
          setConnectionError(false);
        });
        
        channel.bind('pusher:subscription_error', () => {
          setConnectionError(true);
        });
        
        return channel;
      });
    } catch (error) {
      console.error('Error setting up Pusher subscriptions:', error);
      setConnectionError(true);
    }
    
    return () => {
      isMounted = false;
      channels.forEach(channel => {
        if (channel) {
          eventNames.forEach(eventName => channel.unbind(eventName));
          channel.unbind('pusher:subscription_succeeded');
          channel.unbind('pusher:subscription_error');
          pusher.unsubscribe(channel.name);
        }
      });
    };
  }, [pusherDisabled, initialized, groupChats, refreshChats]);

function formatTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

  // Count unread chats
  const unreadCount = groupChats.filter(chat => chat.unread).length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-blue-600" /> 
          Group Chats
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[1.5rem] h-6 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            {pusherDisabled ? (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Real-time disabled
              </div>
            ) : pusherConnected ? (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Real-time connected
              </div>
            ) : connectionError ? (
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                Connection lost
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-600">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                Connecting...
              </div>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
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
              className="flex items-center px-5 py-4 hover:bg-blue-50 transition group relative"
            >
              {/* Unread indicator */}
              {chat.unread && (
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
              )}
              
              <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mr-4 ${chat.unread ? 'ml-4' : ''}`}>
                <MessageCircle className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold text-gray-900 text-lg ${chat.unread ? 'font-bold' : ''}`}>
                    {chat.name}
                  </span>
                  <span className="text-xs text-gray-400">{formatTime(chat.lastActive)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">{chat.members} members</span>
                  <span className={`text-xs text-gray-400 ml-2 truncate max-w-xs ${chat.unread ? 'font-semibold text-gray-600' : ''}`}>
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
