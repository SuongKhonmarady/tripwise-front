import React, { useEffect, useRef } from 'react';
import { Bot, Send, Users, ArrowLeft } from 'lucide-react';

export default function TripChat({ messages = [], onSend, currentUser, loading, onTyping, typingUsers = [] }) {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend?.(input);
      setInput('');
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (onTyping) {
      onTyping();
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        onTyping(true);
      }, 2000);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[90vh] bg-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Trip Chat</h1>
              <p className="text-sm text-gray-500">Stay connected with your group</p>
            </div>
          </div>
          {typingUsers.length > 0 && (
            <div className="hidden sm:flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-xs text-green-700 font-medium">
                {typingUsers.length === 1 ? `${typingUsers[0]} is typing` : `${typingUsers.length} people typing`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="px-4 py-6 sm:px-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Trip Chat!</h3>
              <p className="text-gray-500 max-w-sm">Start the conversation by sending your first message to the group.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.user?.id === currentUser?.id;
              const isBot = msg.user?.role === 'assistant' || msg.user?.isBot || msg.user?.name === 'Assistant' || msg.user?.name === 'Bot';

              return (
                <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-xs sm:max-w-md lg:max-w-lg ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 ${isMe ? 'space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    {!isMe && (
                      <div className="flex-shrink-0 mb-1">
                        {isBot ? (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white text-xs font-semibold">
                              {(msg.user?.name || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className="flex flex-col">
                      {/* User name for non-me messages */}
                      {!isMe && (
                        <div className="px-1 mb-1">
                          <span className="text-xs font-medium text-gray-600">
                            {isBot ? 'Assistant' : msg.user?.name || 'Unknown'}
                          </span>
                        </div>
                      )}

                      {/* Message content */}
                      <div className={`px-4 py-3 rounded-2xl shadow-sm ${isMe
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-md'
                          : isBot
                            ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 border border-gray-200 rounded-bl-md'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                        }`}>
                        <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                      </div>

                      {/* Timestamp */}
                      <div className={`px-1 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                        <span className="text-xs text-gray-400">
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing indicator for mobile */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2 bg-gray-200 px-4 py-2 rounded-2xl rounded-bl-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-600">
                  {typingUsers.length === 1
                    ? `${typingUsers[0]} is typing...`
                    : `${typingUsers.length} people are typing...`
                  }
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-4 sm:px-6">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow shadow-sm text-sm placeholder-gray-400"
              placeholder="Type your message..."
              value={input}
              onChange={handleInputChange}
              disabled={loading}
              rows="1"
              style={{
                minHeight: '48px',
                maxHeight: '120px',
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
          </div>

          <button
            onClick={handleSend}
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${loading || !input.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:shadow-xl hover:scale-105 active:scale-95'
              }`}
            disabled={loading || !input.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}