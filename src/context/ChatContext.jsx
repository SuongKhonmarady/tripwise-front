import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { tripsService } from '../services/tripsService';
import chatService from '../services/chatService';
import pusher from '../services/pusherClient';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [groupChats, setGroupChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [pusherChannels, setPusherChannels] = useState([]);

  // Fetch and update group chat list
  const fetchChats = useCallback(async (force = false) => {
    // If already initialized and not forcing, don't fetch again
    if (initialized && !force) {
      return;
    }

    setLoading(true);
    
    try {
      const trips = await tripsService.getTrips();
      
      // For each trip, fetch the last message using chatService.getLastMessageDirect
      const chats = await Promise.all(trips.map(async trip => {
        let lastMessage = trip.lastMessage || '';
        let lastMessageUser = '';
        let lastActive = trip.lastActive || trip.updatedAt || trip.updated_at || trip.createdAt || trip.created_at;
        
        // If not present, fetch from API (using /last-message endpoint)
        if (!lastMessage) {
          try {
            const msg = await chatService.getLastMessageDirect(trip.id);
            if (msg) {
              lastMessage = msg.message;
              lastMessageUser = msg.user?.name || '';
              lastActive = msg.created_at || lastActive;
            }
          } catch (error) {
            console.log('Error fetching last message for trip', trip.id, ':', error);
          }
        }
        
        return {
          id: trip.id,
          name: trip.name,
          members: trip.participants?.length || 1,
          lastMessage: lastMessage || 'No messages yet',
          lastMessageUser,
          lastActive,
          unread: false, // Will be updated based on last visit
        };
      }));
      
      // Sort so the group with the most recent lastActive is at the top
      chats.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
      
      // Check for unread messages by comparing with last visit time
      const updatedChats = chats.map(chat => {
        const lastVisitKey = `lastVisit_${chat.id}`;
        const lastVisit = localStorage.getItem(lastVisitKey);
        const hasUnread = lastVisit ? new Date(chat.lastActive) > new Date(lastVisit) : chat.lastMessage !== 'No messages yet';
        
        return {
          ...chat,
          unread: hasUnread
        };
      });
      
      setGroupChats(updatedChats);
      setInitialized(true);
      return updatedChats;
    } catch (err) {
      console.error('Error fetching chats:', err);
      setGroupChats([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  // Update a specific chat with new message data
  const updateChatWithMessage = useCallback((messageData) => {
    console.log('ChatContext: Updating chat with message:', messageData);
    setGroupChats(prev => {
      console.log('ChatContext: Current chats:', prev.length);
      const tripId = messageData.trip_id || messageData.tripId || messageData.trip?.id;
      if (!tripId) {
        console.log('ChatContext: No trip ID found in message data', messageData);
        return prev;
      }
      
      console.log('ChatContext: Looking for trip ID:', tripId, 'type:', typeof tripId);
      console.log('ChatContext: Available chat IDs:', prev.map(c => ({ id: c.id, type: typeof c.id, name: c.name })));
      
      // Try both string and number comparison
      const idx = prev.findIndex(c => c.id == tripId || c.id === tripId || c.id === String(tripId) || c.id === Number(tripId));
      
      if (idx === -1) {
        console.log('ChatContext: Chat not found for trip ID:', tripId);
        return prev;
      }
      
      console.log('ChatContext: Found chat at index:', idx, 'updating...', prev[idx].name);
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        lastMessage: messageData.message || messageData.content || '',
        lastMessageUser: messageData.user?.name || messageData.sender?.name || '',
        lastActive: messageData.created_at || messageData.timestamp || new Date().toISOString(),
        unread: true, // Mark as unread when new message arrives
      };
      
      // Move updated chat to top
      const [chatObj] = updated.splice(idx, 1);  
      console.log('ChatContext: Updated chat moved to top:', chatObj.name);
      return [chatObj, ...updated];
    });
  }, []);

  // Mark a chat as read
  const markChatAsRead = useCallback((chatId) => {
    console.log('ChatContext: Marking chat as read:', chatId);
    const lastVisitKey = `lastVisit_${chatId}`;
    localStorage.setItem(lastVisitKey, new Date().toISOString());
    
    // Update the chat to remove unread status
    setGroupChats(prev => 
      prev.map(chat => 
        chat.id === chatId ? { ...chat, unread: false } : chat
      )
    );
  }, []);

  // Mark all chats as read
  const markAllAsRead = useCallback(() => {
    const now = new Date().toISOString();
    
    setGroupChats(prev => {
      // Mark all chats in localStorage
      prev.forEach(chat => {
        const lastVisitKey = `lastVisit_${chat.id}`;
        localStorage.setItem(lastVisitKey, now);
      });
      
      // Return updated state
      return prev.map(chat => ({ ...chat, unread: false }));
    });
  }, []);

  // Refresh chat list (force fetch)
  const refreshChats = useCallback(() => {
    return fetchChats(true);
  }, [fetchChats]);

  // Set up Pusher subscriptions when chats are initially loaded
  useEffect(() => {
    if (!initialized) return;

    // Check if user is authenticated
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.log('ChatContext: No auth token found, skipping Pusher subscriptions');
      return;
    }

    console.log('ChatContext: Setting up Pusher subscriptions...');
    
    const setupSubscriptions = async () => {
      try {
        // Get fresh trip data for subscriptions
        const trips = await tripsService.getTrips();
        if (trips.length === 0) {
          console.log('ChatContext: No trips found, skipping Pusher subscriptions');
          return;
        }

        console.log('ChatContext: Setting up Pusher subscriptions for', trips.length, 'trips');
        
        // Clean up existing channels
        pusherChannels.forEach(channel => {
          if (channel) {
            console.log('ChatContext: Unsubscribing from channel:', channel.name);
            pusher.unsubscribe(channel.name);
          }
        });

        // Set up new channels
        const newChannels = trips.map(trip => {
          const channelName = `private-trip-chat.${trip.id}`;
          console.log('ChatContext: Subscribing to channel:', channelName);
          const channel = pusher.subscribe(channelName);
          
          // Bind to multiple possible event names
          const eventNames = ['new-message', 'message-sent', 'chat-message', 'NewMessage'];
          
          eventNames.forEach(eventName => {
            channel.bind(eventName, (data) => {
              console.log(`ChatContext: Pusher ${eventName} event received for trip ${trip.id}:`, data);
              updateChatWithMessage(data);
            });
          });

          // Handle subscription success/error
          channel.bind('pusher:subscription_succeeded', () => {
            console.log('ChatContext: Successfully subscribed to channel:', channelName);
          });
          
          channel.bind('pusher:subscription_error', (error) => {
            console.error('ChatContext: Subscription error for channel:', channelName, error);
          });

          return channel;
        });

        setPusherChannels(newChannels);
        console.log('ChatContext: All Pusher subscriptions set up successfully');
      } catch (error) {
        console.error('ChatContext: Error setting up Pusher subscriptions:', error);
      }
    };

    setupSubscriptions();

    // Cleanup function
    return () => {
      console.log('ChatContext: Cleaning up Pusher subscriptions...');
      pusherChannels.forEach(channel => {
        if (channel) {
          console.log('ChatContext: Cleaning up channel:', channel.name);
          const eventNames = ['new-message', 'message-sent', 'chat-message', 'NewMessage'];
          eventNames.forEach(eventName => {
            channel.unbind(eventName);
          });
          channel.unbind('pusher:subscription_succeeded');
          channel.unbind('pusher:subscription_error');
          pusher.unsubscribe(channel.name);
        }
      });
    };
  }, [initialized, updateChatWithMessage]); // Only depend on initialized and updateChatWithMessage

  const value = {
    groupChats,
    loading,
    initialized,
    fetchChats,
    updateChatWithMessage,
    markChatAsRead,
    markAllAsRead,
    refreshChats
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
