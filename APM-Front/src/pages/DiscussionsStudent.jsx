import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faClock, 
  faDoorOpen, 
  faUserTie, 
  faClipboardCheck,
  faExclamationTriangle,
  faSyncAlt,
  faStickyNote
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './DiscussionsStudent.css';
import ProjectHeader from '../components/Header/ProjectHeader';

const DiscussionsStudent = () => {
  const [activeTab, setActiveTab] = useState('intermediate');
  const [intermediateDiscussions, setIntermediateDiscussions] = useState([]);
  const [finalDiscussions, setFinalDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getSupervisorName = (group) => {
    try {
      return group?.supervisors?.[0]?.supervisor?.name || 
             group?.supervisors?.[0]?.name || 
             'غير محدد';
    } catch {
      return 'غير محدد';
    }
  };

  const formatSchedules = (schedules) => {
    if (!Array.isArray(schedules)) return [];
    
    return schedules.map(schedule => {
      const defaultValues = {
        id: Date.now() + Math.random(),
        type: 'غير محدد',
        date: new Date().toISOString(),
        time: '00:00',
        location: 'غير محدد',
        notes: 'لا توجد ملاحظات',
        group: { name: 'المجموعة الدراسية' }
      };
      
      const safeSchedule = { ...defaultValues, ...schedule };
      
      return {
        id: safeSchedule.id,
        title: `مناقشة ${safeSchedule.type}`,
        date: new Date(safeSchedule.date).toLocaleDateString('ar-EG', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        groups: [{
          id: safeSchedule.id,
          name: safeSchedule.group?.name || 'المجموعة الدراسية',
          time: safeSchedule.time.substring(0, 5),
          hall: safeSchedule.location,
          supervisor: getSupervisorName(safeSchedule.group),
          notes: safeSchedule.notes || 'لا توجد ملاحظات'
        }]
      };
    });
  };

  const fetchDiscussionSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const groupId = localStorage.getItem('selectedGroupId');
      const token = localStorage.getItem('access_token');

      if (!groupId || !token) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await axios.get(`${apiUrl}/api/schedules/group/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('استجابة غير صالحة من الخادم');
      }

      if (response.data.success === false) {
        throw new Error(response.data.message || 'فشل في جلب البيانات');
      }

      const schedules = Array.isArray(response.data.data) ? response.data.data : [];
      
      const intermediate = schedules.filter(schedule => 
        ['مرحلية', 'تحليلية'].includes(schedule.type)
      );
      const final = schedules.filter(schedule => schedule.type === 'نهائية');
      
      setIntermediateDiscussions(formatSchedules(intermediate));
      setFinalDiscussions(formatSchedules(final));
      
    } catch (err) {
      let errorMessage = 'حدث خطأ أثناء جلب بيانات المناقشات';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'انتهت مهلة الاتصال بالخادم';
      } else if (err.response) {
        errorMessage = err.response.data?.message || 
                     `خطأ في الخادم (${err.response.status})`;
      } else if (err.request) {
        errorMessage = 'لا يوجد اتصال بالخادم';
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Error details:', {
        error: err,
        response: err.response,
        request: err.request
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussionSchedules();

    const interval = setInterval(fetchDiscussionSchedules, 60000);
    return () => clearInterval(interval);
  }, []);

  const openTab = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className="discussions-container" dir="rtl">
      <ProjectHeader 
        title="مشروع تطوير نظام إدارة المجموعات"
        description="هذا المشروع يهدف إلى تطوير نظام متكامل لإدارة مشاريع المجموعات في الجامعة"
        teamMembers={5}
        startDate="01/01/2023"
        endDate="15/06/2023"
      />
      
      {error && (
        <div className="error-alert">
          <div className="error-header">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <h4>حدث خطأ</h4>
          </div>
          <div className="error-body">{error}</div>
          <div className="error-actions">
            <button 
              onClick={fetchDiscussionSchedules}
              className="retry-btn"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faSyncAlt} spin={loading} />
              {loading ? ' جاري المحاولة...' : ' إعادة المحاولة'}
            </button>
            {error.includes('تسجيل الدخول') && (
              <button 
                onClick={() => window.location.href = '/login'}
                className="login-btn"
              >
                الذهاب إلى صفحة تسجيل الدخول
              </button>
            )}
          </div>
        </div>
      )}
    <div className='container-discussion'>
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'intermediate' ? 'active' : ''}`}
          onClick={() => openTab('intermediate')}
        >
          المناقشات المرحلية
        </button>
        <button 
          className={`tab-btn ${activeTab === 'final' ? 'active' : ''}`}
          onClick={() => openTab('final')}
        >
          المناقشات النهائية
        </button>
      </div>
      
      <div id="intermediate" className={`tab-content ${activeTab === 'intermediate' ? 'active' : ''}`}>
        {intermediateDiscussions.length > 0 ? (
          intermediateDiscussions.map((discussion) => (
            <div className="date-card" key={discussion.id}>
              <div className="date-header">
                <div className="date-title">{discussion.title}</div>
                <div className="date">{discussion.date}</div>
              </div>
              
              <div className="group-container">
                {discussion.groups.map((group) => (
                  <div className="group-card" key={group.id}>
                    <div className="group-title">
                      <FontAwesomeIcon icon={faUsers} />
                      {group.name}
                    </div>
                    <div className="group-details">
                      <div className="detail-item">
                        <FontAwesomeIcon icon={faClock} />
                        <span>الوقت: <span className="detail-value">{group.time}</span></span>
                      </div>
                      <div className="detail-item">
                        <FontAwesomeIcon icon={faDoorOpen} />
                        <span>القاعة: <span className="detail-value">{group.hall}</span></span>
                      </div>
                      <div className="detail-item">
                        <FontAwesomeIcon icon={faUserTie} />
                        <span>المشرف: <span className="detail-value">{group.supervisor}</span></span>
                      </div>
                      <div className="detail-item">
                        <FontAwesomeIcon icon={faStickyNote} />
                        <span>ملاحظات: <span className="detail-value">{group.notes}</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="no-data-message">
            {loading ? 'جاري التحميل...' : 'لا توجد مناقشات مرحلية مسجلة'}
          </div>
        )}
      </div>
      
      <div id="final" className={`tab-content ${activeTab === 'final' ? 'active' : ''}`}>
        {finalDiscussions.length > 0 ? (
          finalDiscussions.map((discussion) => (
            <div className="date-card" key={discussion.id}>
              <div className="date-header">
                <div className="date-title">{discussion.title}</div>
                <div className="date">{discussion.date}</div>
              </div>
              
              <div className="group-container">
                {discussion.groups.map((group) => (
                  <div className="group-card" key={group.id}>
                    <div className="group-title">
                      <FontAwesomeIcon icon={faUsers} />
                      {group.name}
                    </div>
                    <div className="group-details">
                      <div className="detail-item">
                        <FontAwesomeIcon icon={faClock} />
                        <span>الوقت: <span className="detail-value">{group.time}</span></span>
                      </div>
                      <div className="detail-item">
                        <FontAwesomeIcon icon={faDoorOpen} />
                        <span>القاعة: <span className="detail-value">{group.hall}</span></span>
                      </div>
                      <div className="detail-item">
                        <FontAwesomeIcon icon={faUserTie} />
                        <span>المشرف: <span className="detail-value">{group.supervisor}</span></span>
                      </div>
                      <div className="detail-item">
                        <FontAwesomeIcon icon={faStickyNote} />
                        <span>ملاحظات: <span className="detail-value">{group.notes}</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="no-data-message">
            {loading ? 'جاري التحميل...' : 'لا توجد مناقشات نهائية مسجلة'}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default DiscussionsStudent;