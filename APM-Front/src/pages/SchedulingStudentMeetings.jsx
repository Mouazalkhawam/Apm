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
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAppointmentStatus, setShowAppointmentStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // جلب بيانات المشرفين من API
  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/groups/${selectedGroupId}/supervisors`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
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

  // جلب المواعيد المتاحة للمشرف المحدد
  useEffect(() => {
    if (!currentSupervisorId || !selectedGroupId) return;
  
    const fetchAvailableTimes = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/supervisors/${currentSupervisorId}/available-times`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          }
        );
        
        if (response.data && response.data.success) {
          // تصفية المواعيد لتظهر فقط تلك التي تطابق group_id الحالي
          const filteredTimes = response.data.data.filter(time => 
            time.group_id == selectedGroupId || time.status === 'proposed'
          );
          setAvailableTimes(filteredTimes);
        } else {
          setAvailableTimes([]);
        }
      } catch (err) {
        console.error('Error fetching available times:', err);
        setAvailableTimes([]);
        setError('حدث خطأ أثناء جلب المواعيد المتاحة');
      }
    };
  
    fetchAvailableTimes();
  }, [currentSupervisorId, accessToken, selectedGroupId]);

  // اختيار المشرف
  const handleSupervisorSelect = (supervisorId) => {
    setCurrentSupervisorId(supervisorId);
    setSelectedDate(null);
  };

  // اختيار الموعد
  const handleDateSelect = (time) => {
    setSelectedDate(time);
  };

  // تأكيد الحجز
  const handleConfirmAppointment = async () => {
    if (!selectedDate || !currentSupervisorId || !selectedGroupId) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/groups/${selectedGroupId}/meetings/${selectedDate.id}/choose`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setShowConfirmation(false);
        setShowAppointmentStatus(true);
        // تحديث القائمة بعد الحجز
        const updatedTimes = availableTimes.filter(t => t.id !== selectedDate.id);
        setAvailableTimes(updatedTimes);
      } else {
        alert('حدث خطأ أثناء حجز الموعد: ' + (response.data.message || ''));
      }
    } catch (err) {
      console.error('Error confirming appointment:', err);
      alert('حدث خطأ أثناء حجز الموعد: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // إلغاء الحجز
  const handleCancelAppointment = () => {
    setShowConfirmation(false);
    setSelectedDate(null);
  };

  // إتمام العملية
  const handleDone = () => {
    setShowAppointmentStatus(false);
    setSelectedDate(null);
  };

  // تغيير التبويب
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // تنسيق التاريخ والوقت
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('ar-EG', options);
  };

  // عرض المواعيد المتاحة
  const renderAvailableDates = () => {
    if (!availableTimes || availableTimes.length === 0) {
      return (
        <div className="no-available-times">
          <i className="fas fa-calendar-times"></i>
          <p>لا توجد مواعيد متاحة حالياً لهذا المشرف</p>
        </div>
      );
    }

    return availableTimes.map((time) => {
      if (!time.meeting_time) return null;

      const formattedDateTime = formatDateTime(time.meeting_time);
      const [dayPart, datePart, timePart] = formattedDateTime.split('، ');
      
      return (
        <div
          key={time.id}
          className={`date-card-meeting ${selectedDate?.id === time.id ? 'selected' : ''}`}
          onClick={() => handleDateSelect(time)}
        >
          <div className="date-day">{dayPart}</div>
          <div className="date-date">{datePart}</div>
          <div className="date-time">{timePart}</div>
          {time.status === 'tentative' && (
            <div className="date-note">موعد مؤقت</div>
          )}
        </div>
      );
    });
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> جاري الحجز...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i> تأكيد الموعد المحدد
                      </>
                    )}
                  </button>
                </div>
              )}

              {showConfirmation && selectedDate && (
                <div className="confirmation-overlay">
                  <div className="confirmation-modal">
                    <h3>تأكيد حجز الموعد</h3>
                    <div className="selected-date-info">
                      <p><strong>المشرف:</strong> {supervisors.find(s => s.supervisorId === currentSupervisorId)?.name}</p>
                      <p><strong>التاريخ والوقت:</strong> {formatDateTime(selectedDate.meeting_time)}</p>
                    </div>
                    <p className="confirmation-question">هل أنت متأكد من حجز هذا الموعد؟</p>
                    <div className="modal-buttons">
                      <button 
                        className="btn btn-confirm"
                        onClick={handleConfirmAppointment}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i> جاري الحجز...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check"></i> تأكيد
                          </>
                        )}
                      </button>
                      <button 
                        className="btn btn-cancel"
                        onClick={handleCancelAppointment}
                        disabled={isSubmitting}
                      >
                        <i className="fas fa-times"></i> إلغاء
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showAppointmentStatus && selectedDate && (
                <div className="status-overlay">
                  <div className="status-modal">
                    <div className="status-icon success">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <h3>تم الحجز بنجاح</h3>
                    <p className="status-details">
                      تم تأكيد موعدك مع المشرف:<br />
                      <strong>{supervisors.find(s => s.supervisorId === currentSupervisorId)?.name}</strong><br />
                      في: {formatDateTime(selectedDate.meeting_time)}
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
              <div className="no-available-times">
                <i className="fas fa-info-circle"></i>
                <p>هذه الميزة قيد التطوير وسيتم تفعيلها قريباً</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulingStudentMeetings;