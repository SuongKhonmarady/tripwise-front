// src/components/TripChatWrapper.jsx
import React, { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import TripChat from './TripChat';
import chatService from '../services/chatService';

const TripChatWrapper = ({ tripId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch messages and setup Pusher
  useEffect(() => {
    let pusher;
    let channel; // Declare channel in the outer scope

    const fetchMessages = async () => {
      const result = await chatService.getMessages(tripId);
      if (Array.isArray(result)) {
        setMessages(result);
      } else {
        console.error(result.error);
      }
    };

    const initPusher = () => {
      pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER,
        authEndpoint: '/broadcasting/auth', // Laravel's default broadcasting auth endpoint
        auth: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        },
      });
      
      // Fixed: Use correct channel name (without 'private-' prefix)
      channel = pusher.subscribe(`private-trip-chat.${tripId}`);

      // Listen for the custom event name
      channel.bind('new-message', (data) => {
        console.log('🔥 new-message:', data);
        setMessages((prev) => {
          // avoid duplicate
          if (prev.some(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
      });
    };

    fetchMessages();
    initPusher();

    return () => {
      // Fixed: Now channel is properly defined in scope
      if (channel) {
        channel.unbind('new-message');
        pusher.unsubscribe(`private-trip-chat.${tripId}`);
      }
      if (pusher) {
        pusher.disconnect();
      }
    };
  }, [tripId]);

  const sendMessage = async (text) => {
    setLoading(true);
    try {
      console.log('📤 Sending message:', { tripId, text });
      const result = await chatService.sendMessage(tripId, text);
      console.log('📥 Send message result:', result);
      
      if (!result.success) {
        console.error('❌ Send message failed:', result.error);
        // Optionally show user error message
      } else {
        console.log('✅ Message sent successfully');
      }
    } catch (error) {
      console.error('💥 Send message exception:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TripChat
      messages={messages}
      onSend={sendMessage}
      currentUser={currentUser}
      loading={loading}
    />
  );
};

export default TripChatWrapper;