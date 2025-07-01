import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import chatService from '../services/chatService';
import pusher from '../services/pusherClient';
import TripChat from '../components/TripChat';
import { ArrowLeft } from 'lucide-react';
import { tripsService } from '../services/tripsService';

export default function TripChatPage() {
  const { id } = useParams(); // trip ID
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { markChatAsRead } = useChat();

  // Simple message cache to avoid refetching on quick navigation
  const messageCache = React.useRef(new Map());

  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tripName, setTripName] = useState('');
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true); // Flag for very first load
  useEffect(() => {
    if (!id) return;
    async function fetchTripName() {
      try {
        const trip = await tripsService.getTrip(id);
        setTripName(trip?.name || 'Trip Chat');
      } catch {
        setTripName('Trip Chat');
      }
    }
    fetchTripName();
    
    // Reset messagesLoaded when trip ID changes
    setMessagesLoaded(false);
    setChatMessages([]); // Clear previous messages
    setTypingUsers([]); // Clear typing indicators
    setHasMore(true); // Reset pagination
    
    // Clear all typing timeouts when switching trips
    Object.keys(window).forEach(key => {
      if (key.startsWith('typing-')) {
        clearTimeout(window[key]);
        delete window[key];
      }
    });
    
    // Check if we have cached messages for this trip
    const cachedMessages = messageCache.current.get(id);
    if (cachedMessages && cachedMessages.length > 0) {
      setChatMessages(cachedMessages);
      setMessagesLoaded(true); // Skip API call if we have cached messages
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    // Mark chat as read when entering the chat page
    markChatAsRead(parseInt(id));

    // Show empty chat UI immediately, then load messages in background
    if (!messagesLoaded) {
      // Only show loading spinner on the very first load
      if (initialLoad) {
        setChatLoading(true);
        setInitialLoad(false);
      }
      
      const PAGE_SIZE = 10;
      const loadMessages = async () => {
        try {
          const res = await chatService.getMessages(id, { limit: PAGE_SIZE });
          if (Array.isArray(res)) {
            setChatMessages(res);
            setHasMore(res.length === PAGE_SIZE);
            // Cache messages for faster subsequent loads
            messageCache.current.set(id, res);
          } else if (res && Array.isArray(res.data)) {
            setChatMessages(res.data);
            setHasMore(res.data.length === PAGE_SIZE);
            // Cache messages for faster subsequent loads
            messageCache.current.set(id, res.data);
          } else {
            console.error(res.error || 'Failed to load messages');
            setChatMessages([]);
            setHasMore(false);
          }
          setMessagesLoaded(true);
        } catch (error) {
          console.error('Error loading messages:', error);
          setChatMessages([]);
          setHasMore(false);
        }
        setChatLoading(false);
      };

      // Load messages immediately without delay
      loadMessages();
    }

    // Subscribe to Pusher
    const channel = pusher.subscribe(`private-trip-chat.${id}`);

    const handleNewMessage = (data) => {
      setChatMessages((prev) => {
        const isDuplicate = prev.some((msg) => msg.id === data.id);
        const newMessages = isDuplicate ? prev : [...prev, data];
        // Update cache with new message
        messageCache.current.set(id, newMessages);
        return newMessages;
      });
      
      // Update last visit time when receiving new messages while on this page
      markChatAsRead(parseInt(id));
    };

    const handleTyping = (data) => {
      if (!data.user || data.user.id === currentUser?.id) return;

      const name = data.user.name;
      
      setTypingUsers((prev) => {
        // Add user to typing list if not already there
        if (!prev.includes(name)) {
          return [...prev, name];
        }
        return prev;
      });

      // Clear any existing timeout for this user
      const timeoutKey = `typing-${data.user.id}`;
      if (window[timeoutKey]) {
        clearTimeout(window[timeoutKey]);
      }

      // Set a new timeout to remove this user from typing list
      window[timeoutKey] = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((n) => n !== name));
        delete window[timeoutKey];
      }, 4000); // 4 seconds timeout
    };

    channel.bind('new-message', handleNewMessage);
    channel.bind('typing', handleTyping);

    // Update last visit time every 30 seconds while on this page
    const updateLastVisit = () => {
      markChatAsRead(parseInt(id));
    };
    
    const visitInterval = setInterval(updateLastVisit, 30000); // Every 30 seconds

    return () => {
      channel.unbind('new-message', handleNewMessage);
      channel.unbind('typing', handleTyping);
      pusher.unsubscribe(`private-trip-chat.${id}`);
      clearInterval(visitInterval);
      
      // Clear all typing timeouts
      Object.keys(window).forEach(key => {
        if (key.startsWith('typing-')) {
          clearTimeout(window[key]);
          delete window[key];
        }
      });
      
      // Final update when leaving the page
      updateLastVisit();
    };
  }, [id, currentUser, markChatAsRead, messagesLoaded, initialLoad]);

  // Infinite scroll: load older messages when scrolled to top
  const handleLoadMore = async () => {
    if (!id || loadingMore || !hasMore || chatMessages.length === 0) return;
    setLoadingMore(true);
    const PAGE_SIZE = 7;
    const oldestId = chatMessages[0]?.id;
    const res = await chatService.getMessages(id, { limit: PAGE_SIZE, beforeId: oldestId });
    let newMessages = [];
    if (Array.isArray(res)) {
      newMessages = res;
    } else if (res && Array.isArray(res.data)) {
      newMessages = res.data;
    }
    setChatMessages((prev) => [...newMessages, ...prev]);
    setHasMore(newMessages.length === PAGE_SIZE);
    setLoadingMore(false);
  };

  const handleSendChat = async (text) => {
    if (!text.trim()) return;

    try {
      await chatService.sendMessage(id, text);
      
      // Mark this chat as read since user just sent a message
      markChatAsRead(parseInt(id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTyping = async () => {
    try {
      await chatService.typing(id); // POST to /api/trips/:id/typing
    } catch (err) {
      // Silent fail
    }
  };

  return (
    <div className="flex flex-col h-[90] bg-gradient-to-b from-blue-50 via-white to-blue-100">
      <div className="max-w-4xl w-full mx-auto flex flex-col flex-grow px-4 sm:px-6 md:px-8 py-4">

        {/* Chat Container */}
        <div className="flex flex-col flex-grow mt-3 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden min-h-0">

          {/* Container with TripChat */}
          <div className="flex flex-col flex-grow min-h-0 overflow-hidden">
            <TripChat
              messages={chatMessages}
              onSend={handleSendChat}
              currentUser={currentUser}
              loading={chatLoading}
              onTyping={handleTyping}
              typingUsers={typingUsers}
              tripName={tripName}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              loadingMore={loadingMore}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
