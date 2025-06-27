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

    // Show the message optimistically
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      message: text,
      user: currentUser,
      created_at: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, optimisticMsg]);

    try {
      await chatService.sendMessage(id, text);
    } catch (err) {
      console.error(err);
      // Optionally show error or retry
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 pb-8">
      <div className="max-w-2xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pt-4">
        <button
          onClick={() => navigate(`/collaborate/${id}`)}
          className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 text-sm font-medium px-2 py-1 rounded transition-colors bg-white border border-gray-200 shadow-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Trip</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-3 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Trip Chat</h3>
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
