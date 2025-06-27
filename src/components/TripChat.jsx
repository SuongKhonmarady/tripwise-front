import React, { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';

export default function TripChat({ messages, onSend, currentUser, loading, onTyping, typingUsers }) {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (onTyping) {
      onTyping();
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        onTyping(true); // signal stop typing
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-96 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-400">No messages yet. Start the conversation!</div>
        )}
        {messages.map((msg, idx) => {
          const isMe = msg.user?.id === currentUser?.id;
          const isBot = msg.user?.role === 'assistant' || msg.user?.isBot || msg.user?.name === 'Assistant' || msg.user?.name === 'Bot';
          return (
            <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
              {isBot && (
                <div className="flex items-end mr-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              )}
              <div className={`max-w-xs px-4 py-2 rounded-lg shadow text-sm ${
                isMe
                  ? 'bg-blue-600 text-white ml-auto'
                  : isBot
                  ? 'bg-gradient-to-br from-blue-50 to-blue-200 text-blue-900 border border-blue-200'
                  : 'bg-white border'
              }`}>
                <div className="font-semibold mb-1 flex items-center gap-1">
                  {isMe
                    ? 'You'
                    : isBot
                    ? (
                        <span className="flex items-center gap-1"><Bot className="h-4 w-4 text-blue-500" /> Assistant</span>
                      )
                    : msg.user?.name || 'Unknown'}
                  {!isMe && !isBot && (
                    <span className="text-xs text-gray-400">{msg.user?.email}</span>
                  )}
                </div>
                <div>{msg.message}</div>
                <div className="text-xs text-gray-300 mt-1 text-right">{msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}</div>
              </div>
            </div>
          );
        })}
        {typingUsers && typingUsers.length > 0 && (
          <div className="text-xs text-gray-400 italic mt-2">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex items-center border-t border-gray-200 p-2 bg-white rounded-b-lg">
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-400"
          placeholder="Type your message..."
          value={input}
          onChange={handleInputChange}
          disabled={loading}
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
