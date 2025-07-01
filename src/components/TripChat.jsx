import React, { useEffect, useRef } from 'react';
import { Bot, Send, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TripChat({ messages = [], onSend, currentUser, loading, onTyping, typingUsers = [], tripName = 'Trip Chat', onLoadMore, hasMore, loadingMore }) {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeout = useRef();
  const lastTypingTime = useRef(0);
  const navigate = useNavigate();

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, []);

  // Only scroll to bottom on initial load or when a new message is added at the end (not when loading more at the top)
  const prevMessagesRef = useRef([]);
  const initialScrollDone = useRef(false);
  const lastMessageId = useRef(null);
  
  // Reset scroll state when messages array changes dramatically (e.g., switching chats)
  useEffect(() => {
    if (messages.length === 0) {
      initialScrollDone.current = false;
      lastMessageId.current = null;
    }
  }, [messages.length === 0]);
  
  useEffect(() => {
    const prev = prevMessagesRef.current;
    const currentLastMessage = messages[messages.length - 1];
    
    // On first load, scroll to bottom instantly (no animation)
    if (!initialScrollDone.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      initialScrollDone.current = true;
      lastMessageId.current = currentLastMessage?.id;
    } else if (
      messages.length > prev.length &&
      currentLastMessage?.id !== lastMessageId.current
    ) {
      // New message at the end, scroll smoothly
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      lastMessageId.current = currentLastMessage?.id;
    }
    
    prevMessagesRef.current = messages;
  }, [messages]);

  // Infinite scroll: call onLoadMore when scrolled to top
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !onLoadMore) return;
    const handleScroll = () => {
      if (container.scrollTop <= 32 && hasMore && !loadingMore) {
        onLoadMore();
      }
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [onLoadMore, hasMore, loadingMore]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      // Clear typing timeout when sending message
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
        typingTimeout.current = null;
      }
      
      onSend?.(input);
      setInput('');
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // Handle typing indicators with throttling
    if (onTyping) {
      const now = Date.now();
      
      // Only send typing indicator if it's been more than 1 second since last one
      if (now - lastTypingTime.current > 1000) {
        onTyping();
        lastTypingTime.current = now;
      }
      
      // Clear existing timeout
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      
      // Set timeout to stop typing indicator after 3 seconds of inactivity
      typingTimeout.current = setTimeout(() => {
        // Reset the typing time so next keystroke will send typing indicator
        lastTypingTime.current = 0;
      }, 3000);
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header - Improved for PC and Mobile */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Back Arrow */}
            <button
              onClick={() => navigate('/chat')}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </button>
            
            {/* Group Avatar */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            
            {/* Group Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{tripName}</h1>
              <p className="text-sm text-gray-500">Stay connected with your group</p>
            </div>
          </div>
          
          {/* Typing Indicator in Header - Responsive Design */}
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full border border-blue-200 shadow-md animate-fade-in">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-xs text-blue-700 font-semibold hidden sm:inline truncate max-w-20">
                {typingUsers.length === 1 ? typingUsers[0] : `${typingUsers.length} users`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container - Enhanced Clarity */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100" ref={messagesContainerRef}>
        <div className="px-4 py-6 sm:px-6 sm:py-8 space-y-6 max-w-4xl mx-auto">
          {loadingMore && (
            <div className="flex justify-center py-4">
              <div className="bg-white px-6 py-3 rounded-full shadow-md border border-gray-300">
                <span className="text-sm text-gray-700 font-medium">Loading older messages...</span>
              </div>
            </div>
          )}
          
          {messages.length === 0 ? (
            loading ? (
              // Improved loading state
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 text-base">Loading messages...</p>
              </div>
            ) : (
              // Improved welcome state
              <div className="flex flex-col items-center justify-center h-96 text-center px-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6 shadow-md">
                  <Bot className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Welcome to {tripName}!</h3>
                <p className="text-gray-600 text-base max-w-md leading-relaxed">Start the conversation by sending your first message to the group.</p>
              </div>
            )
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.user?.id === currentUser?.id;
              const isBot = msg.user?.role === 'assistant' || msg.user?.isBot || msg.user?.name === 'Assistant' || msg.user?.name === 'Bot';

              return (
                <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-6`}>
                  <div className={`flex max-w-[75%] sm:max-w-lg lg:max-w-xl ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end space-x-3 ${isMe ? 'space-x-reverse' : ''}`}>
                    
                    {/* Avatar - Enhanced design */}
                    {!isMe && (
                      <div className="flex-shrink-0 mb-2">
                        {isBot ? (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                            <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                            <span className="text-white text-base font-bold">
                              {(msg.user?.name || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Container - Improved layout */}
                    <div className="flex flex-col min-w-0 flex-1">
                      {/* User name - Enhanced visibility */}
                      {!isMe && (
                        <div className="px-1 mb-2">
                          <span className="text-sm font-semibold text-gray-800 bg-white px-2 py-1 rounded-full shadow-sm">
                            {isBot ? '🤖 Assistant' : msg.user?.name || 'Unknown'}
                          </span>
                        </div>
                      )}

                      {/* Message Bubble - Completely redesigned */}
                      <div className={`px-5 py-4 sm:px-6 sm:py-5 rounded-3xl shadow-lg border-2 ${
                        isMe
                          ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white border-blue-300 rounded-br-xl'
                          : isBot
                            ? 'bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900 border-indigo-200 rounded-bl-xl'
                            : 'bg-white text-gray-900 border-gray-200 rounded-bl-xl shadow-xl'
                      }`}>
                        <p className="text-base sm:text-lg leading-relaxed break-words font-medium">{msg.message}</p>
                      </div>

                      {/* Timestamp - Better positioning */}
                      <div className={`px-3 mt-3 ${isMe ? 'text-right' : 'text-left'}`}>
                        <span className="text-xs text-gray-600 font-semibold bg-white px-2 py-1 rounded-full shadow-sm">
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator in Messages - Enhanced Modern Design */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start mb-4 animate-fade-in-up">
              <div className="flex items-end space-x-2 max-w-xs">
                {/* Avatar for typing users */}
                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0 mb-1">
                  <span className="text-white text-xs font-bold">
                    {typingUsers.length === 1 ? typingUsers[0].charAt(0).toUpperCase() : typingUsers.length}
                  </span>
                </div>
                
                {/* Typing bubble container */}
                <div className="flex flex-col">
                  {/* User name */}
                  <div className="px-1 mb-1">
                    <span className="text-xs text-gray-600 font-medium">
                      {typingUsers.length === 1 
                        ? typingUsers[0] 
                        : `${typingUsers.length} people`}
                    </span>
                  </div>
                  
                  {/* Typing bubble */}
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-lg border border-gray-200 relative">
                    {/* Speech bubble tail */}
                    <div className="absolute left-0 bottom-2 w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-white border-b-4 border-b-transparent -ml-1"></div>
                    <div className="absolute left-0 bottom-2 w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-gray-200 border-b-4 border-b-transparent -ml-1.5"></div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Animated dots with smooth pulse effect */}
                      <div className="flex space-x-1">
                        <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-typing-pulse"></div>
                        <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-typing-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2.5 h-2.5 bg-gray-600 rounded-full animate-typing-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      
                      {/* Typing text */}
                      <span className="text-sm text-gray-600 font-medium italic">
                        typing...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Enhanced Design */}
      <div className="flex-shrink-0 bg-white border-t-4 border-gray-300 px-6 py-6 shadow-2xl">
        <div className="flex items-end space-x-4 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              className="w-full px-6 py-4 rounded-3xl border-3 border-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 resize-none transition-all shadow-lg text-lg placeholder-gray-600 bg-gray-50 focus:bg-white font-medium"
              placeholder="Type your message..."
              value={input}
              onChange={handleInputChange}
              disabled={loading}
              rows="1"
              style={{
                minHeight: '56px',
                maxHeight: '140px',
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
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
            className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all shadow-xl border-2 ${loading || !input.trim()
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed border-gray-300'
                : 'bg-gradient-to-br from-blue-500 to-blue-700 text-white hover:shadow-2xl hover:scale-110 active:scale-95 hover:from-blue-600 hover:to-blue-800 border-blue-300'
              }`}
            disabled={loading || !input.trim()}
          >
            <Send className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
        </div>
      </div>
    </div>
  );
}