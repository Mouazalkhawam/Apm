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
import { useNavigate } from 'react-router-dom';
import './GroupProjectManagement.css';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';
const GroupManagementSupervisor = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set animation delays programmatically
    const cards = document.querySelectorAll('.group-nav-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${0.1 + (index * 0.1)}s`;
    });
  }, []);

  return ( 
     <div className="dashboard-container-dash">
        
       
         <Sidebar />
    <div className="group-project-container" dir="rtl">
     
      <TopNav/>
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
            <button 
              className="group-nav-button"
              onClick={() => navigate('/proposal')}
            >
              عرض المقترح
            </button>
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
            <button 
              className="group-nav-button"
              onClick={() => navigate('/supervisors-management')}
            >
              عرض المشرفون
            </button>
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
    <button 
      className="group-nav-button"
      onClick={() => navigate('/team-members')}
    >
      عرض المجموعة
    </button>
  </div>
</div>
        
        {/* Project Progress Card */}
        <div className="group-nav-card group-card-yellow" style={{ animationDelay: '0.4s' }}>
          <div className="group-nav-card-content">
            <div className="group-icon-container">
              <FontAwesomeIcon icon={faChartBar} className="group-nav-icon" />
            </div>
            <h3 className="group-nav-title">تقييم فريق المشروع </h3>
            <p className="group-nav-desc"> تقييم كافة أعضاء الفريق والمشرفين المسؤولين عن متابعة تقديم العمل</p>
            <button 
              className="group-nav-button"
              onClick={() => navigate('/student-evaluation')}
            >
              عرض التقييم
            </button>
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
            <button 
              className="group-nav-button"
              onClick={() => navigate('/student-project-management')}
            >
              عرض المراحل
            </button>
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
            <button 
              className="group-nav-button"
              onClick={() => navigate('/scheduling-student-meetings')}
            >
              عرض الجدول
            </button>
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
            <button 
              className="group-nav-button"
               onClick={() => navigate('/discussion-student')}
            >
              عرض المواعيد
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default GroupManagementSupervisor;