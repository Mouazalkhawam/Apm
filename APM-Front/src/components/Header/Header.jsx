import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Header.css';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// تكوين Pusher للاستخدام العام
window.Pusher = Pusher;

const Header = ({ 
  showNotification, 
  showChat, 
  toggleNotification, 
  toggleChat,
  handleLogout 
}) => {
  // حالات الإشعارات
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // حالات الدردشة
  const [activeChatTab, setActiveChatTab] = useState('conversations');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // حالات مودال إنشاء محادثة جديدة
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatUsers, setNewChatUsers] = useState([]);
  const [newChatName, setNewChatName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // تهيئة Echo/Pusher
  const [echo, setEcho] = useState(null);

  useEffect(() => {
    // تهيئة Pusher مع التعديلات المطلوبة
    if (import.meta.env.VITE_PUSHER_APP_KEY) {
      const echoInstance = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
        forceTLS: true,
        encrypted: true,
        authEndpoint: `${import.meta.env.VITE_API_URL}/pusher/auth`,
        auth: {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
          },
          params: {
            socket_id: (channel) => channel.socket_id,
            channel_name: (channel) => channel.name
          }
        },
        authorizer: (channel, options) => ({
          authorize: (socketId, callback) => {
            axios.post(`${import.meta.env.VITE_API_URL}/pusher/auth`, {
              socket_id: socketId,
              channel_name: channel.name
            }, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            })
            .then(response => {
              callback(false, response.data);
            })
            .catch(error => {
              callback(true, error);
            });
          }
        })
      });

      setEcho(echoInstance);

      return () => {
        echoInstance.disconnect();
      };
    }
  }, []);

  // جلب المحادثات من الخادم
  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const formattedConversations = response.data.data.map(conv => ({
          id: conv.conversation_id,
          name: conv.other_user.name,
          lastMessage: conv.messages[0]?.content || 'بداية المحادثة',
          time: formatTimeAgo(conv.messages[0]?.created_at) || 'الآن',
          unread: conv.unread_count > 0,
          avatar: `https://ui-avatars.com/api/?name=${conv.other_user.name}&background=791770&color=fff`,
          messages: conv.messages.map(msg => ({
            id: msg.id,
            text: msg.content,
            time: formatTime(msg.created_at),
            sent: msg.sender_id === parseInt(localStorage.getItem('user_id')),
            is_read: msg.is_read
          })).reverse()
        }));

        setConversations(formattedConversations);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  // جلب عدد الرسائل غير المقروءة
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/messages/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUnreadCount(response.data.unread_count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  // جلب رسائل محادثة محددة
  const fetchChatMessages = async (userId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/messages/conversation/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const messages = response.data.messages.map(msg => ({
          id: msg.message_id,
          text: msg.content,
          time: formatTime(msg.created_at),
          sent: msg.sender_id === parseInt(localStorage.getItem('user_id')),
          is_read: msg.is_read
        }));

        return messages;
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      return [];
    }
  };

  // جلب قائمة المستخدمين لإنشاء محادثة جديدة
  const fetchUsersForNewChat = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setNewChatUsers(response.data.data.map(user => ({
          id: user.userId,
          name: user.name,
          selected: false
        })));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // تنسيق التاريخ والوقت
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // تنسيق الوقت المنقضي
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'الآن';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'الآن';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقائق`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعات`;
    if (diffInSeconds < 2592000) return `منذ ${Math.floor(diffInSeconds / 86400)} أيام`;
    if (diffInSeconds < 31536000) return `منذ ${Math.floor(diffInSeconds / 2592000)} أشهر`;
    return `منذ ${Math.floor(diffInSeconds / 31536000)} سنوات`;
  };

  // دالة تسجيل الخروج
  const handleLogoutClick = (e) => {
    e.preventDefault();
    handleLogout();
  };

  // جلب الإشعارات من الخادم
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // تحديد الإشعار كمقروء
  const markAsRead = async (notificationId, e) => {
    if (e) e.stopPropagation();
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await axios.put(`${import.meta.env.VITE_API_URL}/notifications/${notificationId}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setNotifications(notifications.map(notification => 
        notification.id === notificationId ? { ...notification, read_at: new Date().toISOString() } : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  const handleAcceptMembership = async () => {
    const token = localStorage.getItem('access_token');
  
    if (!token || !selectedNotification?.extra_data?.group_id) {
      console.error('❌ Missing group_id in notification extra_data');
      return;
    }
  
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/projects/approve`, {
        user_id: localStorage.getItem('user_id'),
        group_id: selectedNotification.extra_data.group_id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.data.success) {
        markAsRead(selectedNotification.id);
        setShowAcceptModal(false);
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error accepting membership:', err);
    
      if (err.response && err.response.status === 422) {
        console.error('Validation errors:', err.response.data.errors);
      }
    }
  };
  
  // تحديد جميع الإشعارات كمقروءة
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await axios.put(`${import.meta.env.VITE_API_URL}/notifications/read-all`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setNotifications(notifications.map(notification => ({
        ...notification,
        read_at: notification.read_at || new Date().toISOString()
      })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // أيقونة حسب نوع الإشعار
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'PROJECT_INVITATION':
        return 'fa-users';
      case 'SYSTEM_NOTIFICATION':
        return 'fa-info-circle';
      case 'real_time':
        return 'fa-bolt';
      default:
        return 'fa-bell';
    }
  };

  // التعامل مع النقر على الإشعار
  const handleNotificationClick = (notification) => {
    if (notification.type === 'PROJECT_INVITATION') {
      setSelectedNotification(notification);
      setShowAcceptModal(true);
    } else {
      markAsRead(notification.id);
    }
  };

  // اختيار محادثة
  const handleSelectConversation = async (conversation) => {
    try {
      const messages = await fetchChatMessages(conversation.id);
      
      const updatedConversation = {
        ...conversation,
        messages: messages,
        unread: false
      };

      setSelectedConversation(updatedConversation);
      setActiveChatTab('chat');
      
      // تحديث حالة المحادثة كمقروءة
      const updatedConversations = conversations.map(conv => 
        conv.id === conversation.id ? { ...conv, unread: false } : conv
      );
      
      setConversations(updatedConversations);
      setUnreadCount(prev => prev - (conversation.unread ? 1 : 0));
      
      // تحديث الرسائل كمقروءة في الخادم
      await axios.patch(`${import.meta.env.VITE_API_URL}/messages/mark-all-read`, {
        conversation_id: conversation.id
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
    } catch (err) {
      console.error('Error selecting conversation:', err);
    }
  };

  // إرسال رسالة
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/messages`, {
        receiver_id: selectedConversation.id,
        content: message
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const newMessage = {
          id: response.data.data.message_id,
          text: message,
          time: 'الآن',
          sent: true,
          is_read: false
        };

        // تحديث المحادثة المحددة
        const updatedConversation = {
          ...selectedConversation,
          messages: [...selectedConversation.messages, newMessage],
          lastMessage: message,
          time: 'الآن'
        };

        setSelectedConversation(updatedConversation);
        
        // تحديث قائمة المحادثات
        const updatedConversations = conversations.map(conv => 
          conv.id === selectedConversation.id ? {
            ...conv,
            lastMessage: message,
            time: 'الآن'
          } : conv
        );
        
        setConversations(updatedConversations);
        setMessage('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // العودة إلى قائمة المحادثات
  const handleBackToConversations = () => {
    setActiveChatTab('conversations');
    setSelectedConversation(null);
  };

  // فتح مودال إنشاء محادثة جديدة
  const handleNewChatClick = async () => {
    await fetchUsersForNewChat();
    setShowNewChatModal(true);
  };

  // إغلاق مودال إنشاء محادثة جديدة
  const handleCloseNewChatModal = () => {
    setShowNewChatModal(false);
    setNewChatName('');
    setSearchTerm('');
    setNewChatUsers(newChatUsers.map(user => ({ ...user, selected: false })));
  };

  // اختيار/إلغاء اختيار مستخدم في مودال إنشاء محادثة
  const toggleUserSelection = (userId) => {
    setNewChatUsers(newChatUsers.map(user => 
      user.id === userId ? { ...user, selected: !user.selected } : user
    ));
  };

  // إنشاء محادثة جديدة
  const handleCreateNewChat = async () => {
    const selectedUsers = newChatUsers.filter(user => user.selected);
    if (selectedUsers.length === 0) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/messages`, {
        receiver_id: selectedUsers[0].id,
        content: 'بدأت المحادثة'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const chatName = newChatName || selectedUsers.map(user => user.name).join('، ');
        
        const newConversation = {
          id: selectedUsers[0].id,
          name: chatName,
          lastMessage: 'بدأت المحادثة',
          time: 'الآن',
          unread: false,
          avatar: `https://ui-avatars.com/api/?name=${chatName}&background=791770&color=fff`,
          messages: [
            { id: response.data.data.message_id, text: 'بدأت المحادثة', time: 'الآن', sent: true }
          ]
        };

        setConversations([newConversation, ...conversations]);
        setSelectedConversation(newConversation);
        setActiveChatTab('chat');
        handleCloseNewChatModal();
      }
    } catch (err) {
      console.error('Error creating new chat:', err);
    }
  };

  // البحث عن مستخدمين
  const filteredUsers = newChatUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // جلب البيانات الأولية
  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
    fetchNotifications();
  }, []);

  // الاشتراك في قنوات Pusher للرسائل الجديدة
  useEffect(() => {
    if (!echo) return;
  
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
  
    const channel = echo.private(`App.Models.User.${userId}`);
  
    channel.listen('.App\\Events\\NewMessageSent', (data) => {
      console.log('Received new message data:', data);
      
      // البيانات تأتي مباشرة ككائن الرسالة وليس ضمن خاصية message
      const messageData = data;
      
      if (!messageData.sender || !messageData.sender.userId) {
        console.error('Invalid message structure:', messageData);
        return;
      }
      
      // تحديث قائمة المحادثات وعدد الرسائل غير المقروءة
      fetchConversations();
      fetchUnreadCount();
      
      // إذا كانت المحادثة المفتوحة هي مع المرسل
      if (selectedConversation?.id === messageData.sender.userId) {
        const newMessage = {
          id: messageData.message_id,
          text: messageData.content,
          time: 'الآن',
          sent: false,
          is_read: false
        };
        
        setSelectedConversation(prev => ({
          ...prev,
          messages: [...prev.messages, newMessage],
          lastMessage: messageData.content,
          time: 'الآن'
        }));
      }
    });
  
    return () => {
      channel.stopListening('.App\\Events\\NewMessageSent');
    };
  }, [echo, selectedConversation]);

  return (
    <header className="header">
      <div className="header-content-main">
        <div className="logo-header">
          <i className="fas fa-graduation-cap"></i>
          نظام إدارة المشاريع الأكاديمية
        </div>
        <div className="nav-links-main">
          <div className="notifications-wrapper-main">
            {/* زر الإشعارات */}
            <div className="notification-icon" onClick={toggleNotification}>
              <i className="fas fa-bell"></i>
              {notifications.filter(n => !n.read_at).length > 0 && (
                <div className="notification-badge">
                  {notifications.filter(n => !n.read_at).length}
                </div>
              )}
            </div>
            
            {/* قائمة الإشعارات */}
            <div className={`notification-dropdown-main ${showNotification ? 'show' : ''}`}>
              <div className="notification-header-main">
                <div className="notification-title">الإشعارات</div>
                <div className="mark-all-read" onClick={markAllAsRead}>
                  تعيين الكل كمقروء
                </div>
              </div>

              {loading ? (
                <div className="notification-loading">
                  <i className="fas fa-spinner fa-spin"></i> جاري تحميل الإشعارات...
                </div>
              ) : error ? (
                <div className="notification-error">
                  <i className="fas fa-exclamation-triangle"></i> {error}
                </div>
              ) : notifications.length === 0 ? (
                <div className="notification-empty">
                  <i className="fas fa-bell-slash"></i> لا توجد إشعارات جديدة
                </div>
              ) : (
                <>
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item-main ${!notification.read_at ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-icon-small-main">
                        <i className={`fas ${getNotificationIcon(notification.type)}`}></i>
                      </div>
                      <div className="notification-content-main">
                        <div className="notification-text-main">
                          {notification.message}
                          {!notification.read_at && (
                            <button 
                              className="mark-as-read-btn"
                              onClick={(e) => markAsRead(notification.id, e)}
                            >
                              <i className="fas fa-check"></i> تعيين كمقروء
                            </button>
                          )}
                          {notification.read_at && (
                            <span className="read-badge">
                              <i className="fas fa-check-circle"></i> مقروء
                            </span>
                          )}
                        </div>
                        <div className="notification-time">
                          {formatTimeAgo(notification.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="notification-footer">
                    <div className="view-all">عرض جميع الإشعارات</div>
                  </div>
                </>
              )}
            </div>
            
            {/* زر الدردشة */}
            <div className="message-icon" onClick={toggleChat}>
              <i className="fas fa-comment-dots"></i>
              {unreadCount > 0 && (
                <div className="notification-badge">
                  {unreadCount}
                </div>
              )}
            </div>
            
            {/* قائمة الدردشة */}
            <div className={`chat-dropdown ${showChat ? 'show' : ''}`}>
              {activeChatTab === 'conversations' ? (
                <>
                  <div className="chat-header">
                    <div className="chat-title">المحادثات</div>
                    <div className="chat-actions">
                      <button className="new-chat-btn" onClick={handleNewChatClick}>
                        <i className="fas fa-plus"></i> جديد
                      </button>
                      <div className="chat-close" onClick={toggleChat}>
                        <i className="fas fa-times"></i>
                      </div>
                    </div>
                  </div>
                  
                  {loadingConversations ? (
                    <div className="chat-loading">
                      <i className="fas fa-spinner fa-spin"></i> جاري تحميل المحادثات...
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="chat-empty">
                      <i className="fas fa-comment-slash"></i> لا توجد محادثات
                    </div>
                  ) : (
                    <div className="conversations-list">
                      {conversations.map(conversation => (
                        <div 
                          key={conversation.id} 
                          className={`conversation-item ${conversation.unread ? 'unread' : ''}`}
                          onClick={() => handleSelectConversation(conversation)}
                        >
                          <div className="conversation-avatar">
                            <img src={conversation.avatar} alt={conversation.name} />
                          </div>
                          <div className="conversation-details">
                            <div className="conversation-name">{conversation.name}</div>
                            <div className="conversation-last-message">{conversation.lastMessage}</div>
                          </div>
                          <div className="conversation-time">
                            {conversation.time}
                            {conversation.unread && <div className="unread-badge"></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="chat-header">
                    <button className="back-button" onClick={handleBackToConversations}>
                      <i className="fas fa-arrow-right"></i>
                    </button>
                    <div className="chat-title">{selectedConversation?.name}</div>
                    <div className="chat-close" onClick={toggleChat}>
                      <i className="fas fa-times"></i>
                    </div>
                  </div>
                  
                  <div className="chat-body">
                    {selectedConversation?.messages.map(message => (
                      <div 
                        key={message.id} 
                        className={`message-item ${message.sent ? 'sent' : 'received'}`}
                      >
                        <div className="message-content">
                          {message.text}
                        </div>
                        <div className="message-time">
                          {message.time}
                          {message.sent && (
                            <span className="read-status">
                              {message.is_read ? (
                                <i className="fas fa-check-double read"></i>
                              ) : (
                                <i className="fas fa-check"></i>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="chat-input">
                    <input 
                      type="text" 
                      placeholder="اكتب رسالتك هنا..." 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button className="chat-send-btn" onClick={handleSendMessage}>
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* زر تسجيل الخروج */}
          <a href="#" className="nav-link-main" onClick={handleLogoutClick}>
            <i className="fas fa-sign-out-alt"></i> تسجيل خروج
          </a>
        </div>
      </div>

      {/* مودال قبول العضوية */}
      {showAcceptModal && (
        <div className="modal-overlay-accept">
          <div className="accept-modal">
            <div className="modal-header">
              <h3>قبول دعوة المشروع</h3>
              <button className="close-btn" onClick={() => setShowAcceptModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>هل ترغب في قبول دعوة الانضمام إلى المشروع "{selectedNotification?.data?.project_name}"؟</p>
              <div className="modal-actions">
                <button className="btn btn-cancel" onClick={() => setShowAcceptModal(false)}>
                  إلغاء
                </button>
                <button className="btn btn-confirm" onClick={handleAcceptMembership}>
                  قبول العضوية
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال إنشاء محادثة جديدة */}
      {showNewChatModal && (
        <div className="modal-overlay-accept">
          <div className="accept-modal">
            <div className="modal-header">
              <h3>إنشاء محادثة جديدة</h3>
              <button className="close-btn" onClick={handleCloseNewChatModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="new-chat-form">
                <div className="form-group">
                  <label>اسم المحادثة (اختياري)</label>
                  <input
                    type="text"
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    placeholder="أدخل اسم للمحادثة"
                  />
                </div>
                
                <div className="form-group">
                  <label>بحث عن أعضاء</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن أعضاء"
                  />
                </div>
                
                <div className="users-list">
                  {filteredUsers.map(user => (
                    <div 
                      key={user.id} 
                      className={`user-item ${user.selected ? 'selected' : ''}`}
                      onClick={() => toggleUserSelection(user.id)}
                    >
                      <div className="user-avatar">
                        <img src={`https://ui-avatars.com/api/?name=${user.name}&background=791770&color=fff`} alt={user.name} />
                      </div>
                      <div className="user-name">{user.name}</div>
                      <div className="user-check">
                        {user.selected && <i className="fas fa-check"></i>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="modal-actions">
                <button className="btn btn-cancel" onClick={handleCloseNewChatModal}>
                  إلغاء
                </button>
                <button 
                  className="btn btn-confirm" 
                  onClick={handleCreateNewChat}
                  disabled={newChatUsers.filter(u => u.selected).length === 0}
                >
                  إنشاء المحادثة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;