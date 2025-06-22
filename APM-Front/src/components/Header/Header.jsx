import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Header.css';

const Header = ({ 
  showNotification, 
  showChat, 
  toggleNotification, 
  toggleChat,
  handleLogout 
}) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const handleLogoutClick = (e) => {
    e.preventDefault();
    handleLogout();
  };

  // دالة لجلب الإشعارات من الخادم
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.get('http://127.0.0.1:8000/api/notifications', {
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

  // دالة لتحديد الإشعار كمقروء
  const markAsRead = async (notificationId, e) => {
    if (e) e.stopPropagation();
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await axios.put(`http://127.0.0.1:8000/api/notifications/${notificationId}/read`, {}, {
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

  // دالة لقبول العضوية
  const handleAcceptMembership = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token || !selectedNotification) return;

      const response = await axios.post('http://127.0.0.1:8000/api/projects/approve', {
        user_id: localStorage.getItem('user_id'),
        group_id: selectedNotification.extra_data.group_id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // تحديث حالة الإشعار
        markAsRead(selectedNotification.id);
        // إخفاء المودال
        setShowAcceptModal(false);
        // إعادة تحميل الإشعارات
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error accepting membership:', err);
    }
  };

  // دالة لتحديد جميع الإشعارات كمقروءة
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await axios.put('http://127.0.0.1:8000/api/notifications/read-all', {}, {
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

  // دالة لتنسيق الوقت المنقضي
  const formatTimeAgo = (dateString) => {
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

  // دالة للحصول على أيقونة حسب نوع الإشعار
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

  // دالة للتعامل مع النقر على الإشعار
  const handleNotificationClick = (notification) => {
    if (notification.type === 'PROJECT_INVITATION' && notification.extra_data?.group_id) {
      setSelectedNotification(notification);
      setShowAcceptModal(true);
    } else {
      markAsRead(notification.id);
    }
  };

  // جلب الإشعارات عند فتح القائمة أو عند التحميل الأولي
  useEffect(() => {
    if (showNotification) {
      fetchNotifications();
    }
  }, [showNotification]);

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
              <div className="notification-badge">1</div>
            </div>
            
            {/* قائمة الدردشة */}
            <div className={`chat-dropdown ${showChat ? 'show' : ''}`}>
              <div className="chat-header">
                <div className="chat-title">الدردشة الأكاديمية</div>
                <div className="chat-close" onClick={toggleChat}>
                  <i className="fas fa-times"></i>
                </div>
              </div>
              <div className="chat-body">
                <div className="message-item received">
                  <div className="message-content">
                    مرحباً أحمد،
                  </div>
                  <div className="message-time">10:30 ص</div>
                </div>
                <div className="message-item sent">
                  <div className="message-content">
                   السلام عليكم 
                  </div>
                  <div className="message-time">10:35 ص</div>
                </div>
              </div>
              <div className="chat-input">
                <input type="text" placeholder="اكتب رسالتك هنا..." />
                <button className="chat-send-btn">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
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
              <p>هل ترغب في قبول دعوة الانضمام إلى المشروع؟</p>
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
    </header>
  );
};

export default Header;