import React from 'react';
import './Header.css';

const Header = ({ showNotification, showChat, toggleNotification, toggleChat }) => (
  <header className="header">
    <div className="header-content-main">
      <div className="logo-header">
        <i className="fas fa-graduation-cap"></i>
        نظام إدارة المشاريع الأكاديمية
      </div>
      <div className="nav-links">
        <div className="notifications-wrapper">
          {/* زر الإشعارات */}
          <div className="notification-icon" onClick={toggleNotification}>
            <i className="fas fa-bell"></i>
            <div className="notification-badge">3</div>
          </div>
          
          {/* قائمة الإشعارات */}
          <div className={`notification-dropdown ${showNotification ? 'show' : ''}`}>
            <div className="notification-header">
              <div className="notification-title">الإشعارات</div>
              <div className="mark-all-read">تعيين الكل كمقروء</div>
            </div>
            <div className="notification-item unread">
              <div className="notification-icon-small">
                <i className="fas fa-exclamation"></i>
              </div>
              <div className="notification-content">
                <div className="notification-text">تم قبول مشروعك "نظام المكتبة الرقمية" للتقييم النهائي</div>
                <div className="notification-time">منذ ساعتين</div>
              </div>
            </div>
            <div className="notification-item">
              <div className="notification-icon-small">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="notification-content">
                <div className="notification-text">موعد تسليم مشروع الذكاء الاصطناعي بعد 5 أيام</div>
                <div className="notification-time">منذ يوم</div>
              </div>
            </div>
            <div className="notification-item unread">
              <div className="notification-icon-small">
                <i className="fas fa-comments"></i>
              </div>
              <div className="notification-content">
                <div className="notification-text">لديك رسالة جديدة من الدكتور أحمد</div>
                <div className="notification-time">منذ 3 أيام</div>
              </div>
            </div>
            <div className="notification-item">
              <div className="notification-icon-small">
                <i className="fas fa-tasks"></i>
              </div>
              <div className="notification-content">
                <div className="notification-text">تم تعيين مهمة جديدة لك في مشروع التخرج</div>
                <div className="notification-time">منذ أسبوع</div>
              </div>
            </div>
            <div className="notification-footer">
              <div className="view-all">عرض جميع الإشعارات</div>
            </div>
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
                  مرحباً أحمد، كيف مشروع التخرج؟ هل تحتاج مساعدة في أي جزء؟
                </div>
                <div className="message-time">10:30 ص</div>
              </div>
              <div className="message-item sent">
                <div className="message-content">
                  السلام عليكم دكتور، شكراً لسؤالك. التقدم جيد ولكن عندي استفسار بخصوص قاعدة البيانات
                </div>
                <div className="message-time">10:35 ص</div>
              </div>
              <div className="message-item received">
                <div className="message-content">
                  يمكنك تحديد موعد خلال الساعات القادمة وسأساعدك في ذلك
                </div>
                <div className="message-time">10:36 ص</div>
              </div>
              <div className="message-item sent">
                <div className="message-content">
                  ممتاز، أشكرك دكتور. سأراسلك لاحقاً لتحديد الموعد
                </div>
                <div className="message-time">10:38 ص</div>
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
        
        <a href="#" className="nav-link active"><i className="fas fa-user"></i> الصفحة الشخصية</a>
        <a href="#" className="nav-link"><i className="fas fa-project-diagram"></i> المشاريع</a>
        <a href="#" className="nav-link"><i className="fas fa-calendar-alt"></i> الجدول الزمني</a>
        <a href="#" className="nav-link"><i className="fas fa-sign-out-alt"></i> تسجيل خروج</a>
      </div>
    </div>
  </header>
);

export default Header;