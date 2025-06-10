import React, { useState, useEffect } from 'react';
import './SchedulingStudentMeetings.css';
import ProjectHeader from '../components/Header/ProjectHeader';
import axios from 'axios';

const SchedulingStudentMeetings = () => {
  // جلب البيانات من localStorage
  const selectedGroupId = localStorage.getItem('selectedGroupId');
  const accessToken = localStorage.getItem('access_token');

  // حالات المكون
  const [supervisors, setSupervisors] = useState([]);
  const [currentSupervisorId, setCurrentSupervisorId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAppointmentStatus, setShowAppointmentStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // بيانات المواعيد (يمكن استبدالها بطلب API لاحقاً)
  const mockAppointmentsData = {
    1: {
      availableDates: [
        { id: 1, day: "الأحد", date: "19 نوفمبر 2023", time: "9:00 صباحاً - 10:00 صباحاً", dataDate: "2023-11-19", dataTime: "9:00 - 10:00", note: "آخر موعد متاح" },
        { id: 2, day: "الاثنين", date: "20 نوفمبر 2023", time: "10:00 صباحاً - 11:00 صباحاً", dataDate: "2023-11-20", dataTime: "10:00 - 11:00", note: "" },
      ],
      previousAppointments: [
        { day: "الثلاثاء", date: "7 نوفمبر 2023", time: "11:00 صباحاً - 12:00 ظهراً", purpose: "مناقشة المشروع النهائي", notes: "تم مناقشة المرحلة الأولى من المشروع" },
      ]
    }
  };

  // جلب بيانات المشرفين من API
  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/groups/${selectedGroupId}/supervisors`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success && response.data.data.length > 0) {
          setSupervisors(response.data.data);
          setCurrentSupervisorId(response.data.data[0].supervisorId);
        } else {
          setError('لا يوجد مشرفون متاحون لهذه المجموعة');
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
          // يمكن إضافة redirect لصفحة تسجيل الدخول هنا
        } else {
          setError('حدث خطأ أثناء جلب بيانات المشرفين');
        }
        console.error('Error fetching supervisors:', err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedGroupId && accessToken) {
      fetchSupervisors();
    } else if (!accessToken) {
      setError('يجب تسجيل الدخول أولاً');
      setLoading(false);
    } else {
      setError('لم يتم تحديد مجموعة');
      setLoading(false);
    }
  }, [selectedGroupId, accessToken]);

  // اختيار المشرف
  const handleSupervisorSelect = (supervisorId) => {
    setCurrentSupervisorId(supervisorId);
    setSelectedDate(null);
  };

  // اختيار الموعد
  const handleDateSelect = (date) => {
    if (!date.unavailable) {
      setSelectedDate(date);
    }
  };

  // تأكيد الحجز
  const handleConfirmAppointment = () => {
    setShowConfirmation(false);
    setShowAppointmentStatus(true);
  };

  // إلغاء الحجز
  const handleCancelAppointment = () => {
    setShowConfirmation(false);
  };

  // إتمام العملية
  const handleDone = () => {
    setShowAppointmentStatus(false);
    setSelectedDate(null);
    alert('تم حجز الموعد بنجاح. سيتم إرسال تأكيد إلى بريدك الإلكتروني.');
  };

  // تغيير التبويب
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // عرض المواعيد المتاحة
  const renderAvailableDates = () => {
    if (!currentSupervisorId || !mockAppointmentsData[currentSupervisorId]) return null;
    
    return mockAppointmentsData[currentSupervisorId].availableDates.map((date) => (
      <div
        key={date.id}
        className={`date-card-meeting ${date.unavailable ? 'unavailable' : ''} ${selectedDate?.id === date.id ? 'selected' : ''}`}
        onClick={() => handleDateSelect(date)}
      >
        <div className="date-day">{date.day}</div>
        <div className="date-date">{date.date}</div>
        <div className="date-time">{date.time}</div>
        {date.note && <div className="date-note">{date.note}</div>}
      </div>
    ));
  };

  // عرض المواعيد السابقة
  const renderPreviousAppointments = () => {
    if (!currentSupervisorId || !mockAppointmentsData[currentSupervisorId]) return null;
    
    return mockAppointmentsData[currentSupervisorId].previousAppointments.map((appointment, index) => (
      <div key={index} className="date-card-meeting completed">
        <div className="date-day">{appointment.day}</div>
        <div className="date-date">{appointment.date}</div>
        <div className="date-time">{appointment.time}</div>
        <div style={{ marginTop: '10px', width: '100%' }}>
          <strong>الغرض:</strong> {appointment.purpose}<br />
          <strong>ملاحظات:</strong> {appointment.notes}
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="container-meeting">
        <div className="loading-spinner"></div>
        <p>جاري تحميل بيانات المشرفين...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-meeting error-message">
        <div className="error-icon">!</div>
        <h3>{error}</h3>
        {error.includes('تسجيل الدخول') && (
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/login'}
          >
            الانتقال إلى صفحة تسجيل الدخول
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="container-meeting">
      <ProjectHeader 
        title="جدولة مواعيد الطلاب"
        description="قم بجدولة مواعيد مع مشرفيك الأكاديميين لمتابعة مشروعك"
        teamMembers={supervisors.length}
        startDate="01/01/2023"
        endDate="15/06/2023"
      />
      
      <div className='container-meeting2'>
        <div className="content">
          <div className="supervisors-list-meeting">
            <h2 className="selection-title">اختر مشرفك الأكاديمي</h2>
            <div className="supervisors-cards">
              {supervisors.map((supervisor) => (
                <div
                  key={supervisor.supervisorId}
                  className={`supervisor-card-meeting ${supervisor.supervisorId === currentSupervisorId ? 'selected' : ''}`}
                  onClick={() => handleSupervisorSelect(supervisor.supervisorId)}
                >
                  
                  <div className="supervisor-details">
                    <h3>{supervisor.name}</h3>
                    <p><i className="fas fa-envelope"></i> {supervisor.email}</p>
                    <p><i className="fas fa-clock"></i> مشرف منذ: {supervisor.since}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="supervisor-info-meeting">
            <div className="tabs-meeting">
              <button
                className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
                onClick={() => handleTabChange('schedule')}
              >
                <i className="fas fa-calendar-plus"></i> جدولة موعد جديد
              </button>
              <button
                className={`tab ${activeTab === 'previous' ? 'active' : ''}`}
                onClick={() => handleTabChange('previous')}
              >
                <i className="fas fa-history"></i> المواعيد السابقة
              </button>
            </div>

            <div className={`tab-content ${activeTab === 'schedule' ? 'active' : ''}`}>
              <h2 className="selection-title">المواعيد المتاحة للمراجعة</h2>
              <p className="instruction-text">
                يرجى اختيار موعد واحد من القائمة أدناه
              </p>

              <div className="available-dates">
                {renderAvailableDates()}
              </div>

              {selectedDate && (
                <div className="action-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowConfirmation(true)}
                  >
                    <i className="fas fa-check"></i> تأكيد الموعد المحدد
                  </button>
                </div>
              )}

              {showConfirmation && (
                <div className="confirmation-overlay">
                  <div className="confirmation-modal">
                    <h3>تأكيد حجز الموعد</h3>
                    <div className="selected-date-info">
                      <p><strong>اليوم:</strong> {selectedDate.day}</p>
                      <p><strong>التاريخ:</strong> {selectedDate.date}</p>
                      <p><strong>الوقت:</strong> {selectedDate.time}</p>
                    </div>
                    <p className="confirmation-question">هل أنت متأكد من حجز هذا الموعد؟</p>
                    <div className="modal-buttons">
                      <button 
                        className="btn btn-confirm"
                        onClick={handleConfirmAppointment}
                      >
                        <i className="fas fa-check"></i> تأكيد
                      </button>
                      <button 
                        className="btn btn-cancel"
                        onClick={handleCancelAppointment}
                      >
                        <i className="fas fa-times"></i> إلغاء
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showAppointmentStatus && (
                <div className="status-overlay">
                  <div className="status-modal">
                    <div className="status-icon success">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <h3>تم الحجز بنجاح</h3>
                    <p className="status-details">
                      تم تأكيد موعدك مع المشرف في:<br />
                      {selectedDate.day} الموافق {selectedDate.date}<br />
                      من الساعة {selectedDate.time}
                    </p>
                    <button 
                      className="btn btn-done"
                      onClick={handleDone}
                    >
                      <i className="fas fa-thumbs-up"></i> تم
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={`tab-content ${activeTab === 'previous' ? 'active' : ''}`}>
              <h2 className="selection-title">سجل المواعيد السابقة</h2>
              <p className="instruction-text">
                قائمة بالمواعيد التي تمت مع مشرفيك الأكاديميين
              </p>

              <div className="previous-appointments">
                {renderPreviousAppointments()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulingStudentMeetings;