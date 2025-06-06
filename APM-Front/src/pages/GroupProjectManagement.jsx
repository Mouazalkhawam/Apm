import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileAlt, 
  faUsers, 
  faUserFriends, 
  faChartBar, 
  faTasks, 
  faCalendarAlt, 
  faComments 
} from '@fortawesome/free-solid-svg-icons';
import './GroupProjectManagement.css';

const GroupProjectManagement = () => {
  useEffect(() => {
    // Set animation delays programmatically
    const cards = document.querySelectorAll('.group-nav-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${0.1 + (index * 0.1)}s`;
    });
    
    // Example of adding click handlers for each button
    const buttons = document.querySelectorAll('.group-nav-button');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        alert('هذه الوظيفة قيد التطوير');
      });
    });

    // Cleanup function
    return () => {
      buttons.forEach(button => {
        button.removeEventListener('click', () => {
          alert('هذه الوظيفة قيد التطوير');
        });
      });
    };
  }, []);

  return (
    <div className="group-project-container" dir="rtl">
      {/* Header Section */}
      <header className="group-header-gradient">
        <div className="group-header-content">
          <h1 className="group-header-title">مشروع تطوير نظام إدارة المجموعات</h1>
          <p className="group-header-desc">
            هذا المشروع يهدف إلى تطوير نظام متكامل لإدارة مشاريع المجموعات في الجامعة، حيث يمكن توزيع المهام ومتابعة التقدم والإنجاز بشكل فعال.
          </p>
        </div>
      </header>
      
      {/* Navigation Cards Section */}
      <div className="group-nav-grid">
        {/* Proposal Card */}
        <div className="group-nav-card group-card-purple" style={{ animationDelay: '0.1s' }}>
          <div className="group-nav-card-content">
            <div className="group-icon-container">
              <FontAwesomeIcon icon={faFileAlt} className="group-nav-icon" />
            </div>
            <h3 className="group-nav-title">عرض المقترح</h3>
            <p className="group-nav-desc">عرض الوثيقة الكاملة للمقترح البحثي</p>
            <button className="group-nav-button">عرض المقترح</button>
          </div>
        </div>
        
        {/* Supervisors Card */}
        <div className="group-nav-card group-card-blue" style={{ animationDelay: '0.2s' }}>
          <div className="group-nav-card-content">
            <div className="group-icon-container">
              <FontAwesomeIcon icon={faUsers} className="group-nav-icon" />
            </div>
            <h3 className="group-nav-title">عرض المشرفون</h3>
            <p className="group-nav-desc">قائمة بالمشرفين على المشروع ومعلومات الاتصال بهم</p>
            <button className="group-nav-button">عرض المشرفون</button>
          </div>
        </div>
        
        {/* Team Members Card */}
        <div className="group-nav-card group-card-green" style={{ animationDelay: '0.3s' }}>
          <div className="group-nav-card-content">
            <div className="group-icon-container">
              <FontAwesomeIcon icon={faUserFriends} className="group-nav-icon" />
            </div>
            <h3 className="group-nav-title">أعضاء المجموعة</h3>
            <p className="group-nav-desc">عرض قائمة أعضاء المجموعة وتخصصاتهم ومهامهم</p>
            <button className="group-nav-button">عرض المجموعة</button>
          </div>
        </div>
        
        {/* Project Progress Card */}
        <div className="group-nav-card group-card-yellow" style={{ animationDelay: '0.4s' }}>
          <div className="group-nav-card-content">
            <div className="group-icon-container">
              <FontAwesomeIcon icon={faChartBar} className="group-nav-icon" />
            </div>
            <h3 className="group-nav-title">تقدم المشروع</h3>
            <p className="group-nav-desc">متابعة تقدم المشروع وإنجازات كل مرحلة</p>
            <button className="group-nav-button">عرض التقدم</button>
          </div>
        </div>
        
        {/* Stages & Tasks Card */}
        <div className="group-nav-card group-card-red" style={{ animationDelay: '0.5s' }}>
          <div className="group-nav-card-content">
            <div className="group-icon-container">
              <FontAwesomeIcon icon={faTasks} className="group-nav-icon" />
            </div>
            <h3 className="group-nav-title">المراحل والمهام</h3>
            <p className="group-nav-desc">عرض جميع مراحل المشروع والمهام المطلوبة</p>
            <button className="group-nav-button">عرض المراحل</button>
          </div>
        </div>
        
        {/* Meetings Schedule Card */}
        <div className="group-nav-card group-card-indigo" style={{ animationDelay: '0.6s' }}>
          <div className="group-nav-card-content">
            <div className="group-icon-container">
              <FontAwesomeIcon icon={faCalendarAlt} className="group-nav-icon" />
            </div>
            <h3 className="group-nav-title">جدولة الاجتماعات</h3>
            <p className="group-nav-desc">جدولة مواعيد الاجتماعات مع المشرف</p>
            <button className="group-nav-button">عرض الجدول</button>
          </div>
        </div>
        
        {/* Discussions Schedule Card */}
        <div className="group-nav-card group-card-pink" style={{ animationDelay: '0.7s' }}>
          <div className="group-nav-card-content">
            <div className="group-icon-container">
              <FontAwesomeIcon icon={faComments} className="group-nav-icon" />
            </div>
            <h3 className="group-nav-title">المناقشات</h3>
            <p className="group-nav-desc">مواعيد المناقشات المرحلية والنهائية</p>
            <button className="group-nav-button">عرض المواعيد</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupProjectManagement;