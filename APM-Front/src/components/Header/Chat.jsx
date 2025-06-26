import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

const Chat = ({ showChat, toggleChat }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState({
    conversations: true,
    messages: false
  });
  const [error, setError] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const pusherRef = useRef(null);

  // Initialize Pusher and subscribe to channels
  useEffect(() => {
    if (!user || !showChat) return;

    const initializePusher = () => {
      const pusher = new Pusher(process.env.REACT_APP_PUSHER_APP_KEY, {
        cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
        forceTLS: true,
        authEndpoint: `${process.env.REACT_APP_API_URL}/broadcasting/auth`,
        auth: {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      });

      // Subscribe to private channel for the user
      const channel = pusher.subscribe(`private-chat.${user.userId}`);
      
      // Listen for new messages
      channel.bind('new.message', (data) => {
        if (data.receiver.id === user.userId) {
          // Add to unread count if not viewing this conversation
          if (!activeConversation || activeConversation.userId !== data.sender.id) {
            setUnreadCounts(prev => ({
              ...prev,
              [data.sender.id]: (prev[data.sender.id] || 0) + 1
            }));
          }
          
          // Add message to current view if conversation is active
          if (activeConversation && activeConversation.userId === data.sender.id) {
            setMessages(prev => [...prev, {
              id: data.message_id,
              content: data.content,
              sender: data.sender,
              receiver: data.receiver,
              created_at: data.created_at,
              is_read: false
            }]);
          }
        }
      });

      // Listen for message read events
      channel.bind('message.read', (data) => {
        setMessages(prev => prev.map(msg => 
          msg.id === data.message_id ? { ...msg, is_read: true } : msg
        ));
      });

      pusherRef.current = pusher;

      return () => {
        channel.unbind_all();
        channel.unsubscribe();
        pusher.disconnect();
      };
    };

    initializePusher();

    return () => {
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, [user, showChat, activeConversation]);

  // Fetch conversations on component mount or when chat is opened
  useEffect(() => {
    if (!showChat) return;

    const fetchConversations = async () => {
      try {
        setLoading(prev => ({ ...prev, conversations: true }));
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/messages/conversations`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (response.data.success) {
          setConversations(response.data.data);
          // Initialize unread counts
          const counts = {};
          response.data.data.forEach(conv => {
            counts[conv.conversation_id] = conv.unread_count;
          });
          setUnreadCounts(counts);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load conversations');
        console.error('Error fetching conversations:', err);
      } finally {
        setLoading(prev => ({ ...prev, conversations: false }));
      }
    };

    fetchConversations();
  }, [showChat]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        setLoading(prev => ({ ...prev, messages: true }));
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/messages/conversation/${activeConversation.userId}`, 
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        );

        if (response.data.success) {
          setMessages(response.data.messages);
          // Reset unread count for this conversation
          setUnreadCounts(prev => ({
            ...prev,
            [activeConversation.userId]: 0
          }));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load messages');
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(prev => ({ ...prev, messages: false }));
      }
    };

    fetchMessages();
  }, [activeConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/messages`,
        {
          receiver_id: activeConversation.userId,
          content: newMessage
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (response.data.success) {
        setNewMessage('');
        // The message will be added via Pusher event
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Mark messages as read when conversation is opened
  const handleOpenConversation = (conversation) => {
    setActiveConversation({
      userId: conversation.conversation_id,
      user: conversation.other_user
    });
    setUnreadCounts(prev => ({
      ...prev,
      [conversation.conversation_id]: 0
    }));
  };

  return (
    <div className={`chat-container ${showChat ? 'show' : ''}`}>
      <div className="chat-header">
        <div className="chat-title">
          {activeConversation ? (
            <>
              <button 
                className="back-button"
                onClick={() => setActiveConversation(null)}
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <span>{activeConversation.user.name}</span>
            </>
          ) : (
            'المحادثات'
          )}
        </div>
        <button className="close-chat" onClick={toggleChat}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="chat-body">
        {!activeConversation ? (
          // Conversations list
          <div className="conversations-list">
            {loading.conversations ? (
              <div className="loading-messages">
                <i className="fas fa-spinner fa-spin"></i> جاري تحميل المحادثات...
              </div>
            ) : error ? (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i> {error}
              </div>
            ) : conversations.length === 0 ? (
              <div className="empty-messages">
                <i className="fas fa-comment-slash"></i> لا توجد محادثات
              </div>
            ) : (
              conversations.map(conversation => (
                <div 
                  key={conversation.conversation_id}
                  className={`conversation-item ${unreadCounts[conversation.conversation_id] > 0 ? 'unread' : ''}`}
                  onClick={() => handleOpenConversation(conversation)}
                >
                  <div className="user-avatar">
                    <img 
                      src={conversation.other_user.avatar || '/default-avatar.png'} 
                      alt={conversation.other_user.name}
                    />
                    {unreadCounts[conversation.conversation_id] > 0 && (
                      <span className="unread-badge">
                        {unreadCounts[conversation.conversation_id]}
                      </span>
                    )}
                  </div>
                  <div className="conversation-details">
                    <div className="user-name">{conversation.other_user.name}</div>
                    <div className="last-message">
                      {conversation.messages[0]?.content.substring(0, 30)}...
                    </div>
                  </div>
                  <div className="message-time">
                    {formatTime(conversation.messages[0]?.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Messages view
          <div className="messages-view">
            {loading.messages ? (
              <div className="loading-messages">
                <i className="fas fa-spinner fa-spin"></i> جاري تحميل الرسائل...
              </div>
            ) : error ? (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i> {error}
              </div>
            ) : messages.length === 0 ? (
              <div className="empty-messages">
                <i className="fas fa-comment-slash"></i> لا توجد رسائل بعد
              </div>
            ) : (
              <div className="messages-list">
                {messages.map(message => (
                  <div 
                    key={message.id}
                    className={`message ${message.sender.id === user.userId ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      {message.content}
                      <div className="message-time">
                        {formatTime(message.created_at)}
                        {message.is_read && message.sender.id === user.userId && (
                          <i className="fas fa-check-double read-icon"></i>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        )}
      </div>

      {activeConversation && (
        <form className="chat-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
          />
          <button type="submit" disabled={!newMessage.trim()}>
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      )}
    </div>
  );
};

export default Chat;