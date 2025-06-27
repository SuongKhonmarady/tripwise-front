import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import chatService from '../services/chatService';
import pusher from '../services/pusherClient';
import TripChat from '../components/TripChat';
import { ArrowLeft } from 'lucide-react';

export default function TripChatPage() {
  const { id } = useParams(); // trip ID
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (!id) return;

    const loadMessages = async () => {
      setChatLoading(true);
      const res = await chatService.getMessages(id);
      if (Array.isArray(res)) {
        setChatMessages(res);
      } else {
        console.error(res.error || 'Failed to load messages');
        setChatMessages([]);
      }
      setChatLoading(false);
    };

    loadMessages();

    // Subscribe to Pusher
    const channel = pusher.subscribe(`private-trip-chat.${id}`);

    const handleNewMessage = (data) => {
      setChatMessages((prev) => {
        const isDuplicate = prev.some((msg) => msg.id === data.id);
        return isDuplicate ? prev : [...prev, data];
      });
    };

    const handleTyping = (data) => {
      if (!data.user || data.user.id === currentUser?.id) return;

      const name = data.user.name;
      setTypingUsers((prev) => {
        if (prev.includes(name)) return prev;
        return [...prev, name];
      });

      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((n) => n !== name));
      }, 2000);
    };

    channel.bind('new-message', handleNewMessage);
    channel.bind('typing', handleTyping);

    return () => {
      channel.unbind('new-message', handleNewMessage);
      channel.unbind('typing', handleTyping);
      pusher.unsubscribe(`private-trip-chat.${id}`);
    };
  }, [id, currentUser]);

  const handleSendChat = async (text) => {
    if (!text.trim()) return;

    try {
      await chatService.sendMessage(id, text);
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
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100">
      <div className="max-w-4xl w-full mx-auto flex flex-col flex-grow px-4 sm:px-6 md:px-8 py-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/collaborate/${id}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 text-sm font-medium px-3 py-2 rounded-md transition-colors"
          aria-label="Back to Trip"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Trip</span>
        </button>

        {/* Chat Container */}
        <div className="flex flex-col flex-grow mt-3 bg-white rounded-2x1 shadow-lg border border-gray-200 overflow-hidden min-h-0">

          {/* Container with TripChat */}
          <div className="flex flex-col flex-grow min-h-0 overflow-hidden">
            <TripChat
              messages={chatMessages}
              onSend={handleSendChat}
              currentUser={currentUser}
              loading={chatLoading}
              onTyping={handleTyping}
              typingUsers={typingUsers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
