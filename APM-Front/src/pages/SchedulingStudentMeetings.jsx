import React, { useState } from 'react';
import './SchedulingStudentMeetings.css';
import ProjectHeader from '../components/Header/ProjectHeader';
const SchedulingStudentMeetings = () => {
  // بيانات المشرفين والمواعيد
  const supervisors = {
    1: {
      name: "د. سامي عبدالله السالم",
      title: "مشرف أكاديمي - قسم علوم الحاسب",
      email: "s.alsalem@university.edu",
      phone: "0112345678",
      office: "مبنى 3 - مكتب 210",
      avatar: "س",
      workingHours: [
        "الأحد - الثلاثاء: 9 صباحاً - 12 ظهراً",
        "الأربعاء - الخميس: 2 عصراً - 4 عصراً",
        "الجمعة والسبت: إجازة"
      ],
      availableDates: [
        { id: 1, day: "الأحد", date: "19 نوفمبر 2023", time: "9:00 صباحاً - 10:00 صباحاً", dataDate: "2023-11-19", dataTime: "9:00 - 10:00", note: "آخر موعد متاح" },
        { id: 2, day: "الاثنين", date: "20 نوفمبر 2023", time: "10:00 صباحاً - 11:00 صباحاً", dataDate: "2023-11-20", dataTime: "10:00 - 11:00", note: "" },
        { id: 3, day: "الثلاثاء", date: "21 نوفمبر 2023", time: "11:00 صباحاً - 12:00 ظهراً", dataDate: "2023-11-21", dataTime: "11:00 - 12:00", note: "" },
        { id: 4, day: "الأربعاء", date: "22 نوفمبر 2023", time: "2:00 مساءً - 3:00 مساءً", dataDate: "2023-11-22", dataTime: "14:00 - 15:00", note: "إجتماع أسبوعي", unavailable: false },
        { id: 5, day: "الخميس", date: "23 نوفمبر 2023", time: "3:00 مساءً - 4:00 مساءً", dataDate: "2023-11-23", dataTime: "15:00 - 16:00", note: "", unavailable: true }
      ],
      previousAppointments: [
        { day: "الثلاثاء", date: "7 نوفمبر 2023", time: "11:00 صباحاً - 12:00 ظهراً", purpose: "مناقشة المشروع النهائي", notes: "تم مناقشة المرحلة الأولى من المشروع" },
        { day: "الأحد", date: "22 أكتوبر 2023", time: "9:00 صباحاً - 10:00 صباحاً", purpose: "مراجعة الخطة الدراسية", notes: "تم تحديث الخطة حسب التوجيهات" },
        { day: "الاثنين", date: "9 أكتوبر 2023", time: "10:00 صباحاً - 11:00 صباحاً", purpose: "استشارة أكاديمية", notes: "تمت الإجابة عن جميع الاستفسارات" }
      ]
    },
    2: {
      name: "د. نورة محمد الفهد",
      title: "مشرف أكاديمي - قسم الذكاء الاصطناعي",
      email: "n.alfahad@university.edu",
      phone: "0118765432",
      office: "مبنى 2 - مكتب 115",
      avatar: "ن",
      workingHours: [
        "الأحد - الثلاثاء: 8 صباحاً - 11 صباحاً",
        "الأربعاء - الخميس: 1 ظهراً - 3 عصراً",
        "الجمعة والسبت: إجازة"
      ],
      availableDates: [
        { id: 1, day: "الاثنين", date: "20 نوفمبر 2023", time: "8:00 صباحاً - 9:00 صباحاً", dataDate: "2023-11-20", dataTime: "8:00 - 9:00", note: "" },
        { id: 2, day: "الثلاثاء", date: "21 نوفمبر 2023", time: "10:00 صباحاً - 11:00 صباحاً", dataDate: "2023-11-21", dataTime: "10:00 - 11:00", note: "آخر موعد متاح" },
        { id: 3, day: "الأربعاء", date: "22 نوفمبر 2023", time: "1:00 مساءً - 2:00 مساءً", dataDate: "2023-11-22", dataTime: "13:00 - 14:00", note: "" },
        { id: 4, day: "الخميس", date: "23 نوفمبر 2023", time: "2:00 مساءً - 3:00 مساءً", dataDate: "2023-11-23", dataTime: "14:00 - 15:00", note: "فقط للمشاريع النهائية" }
      ],
      previousAppointments: [
        { day: "الأحد", date: "12 نوفمبر 2023", time: "9:00 صباحاً - 10:00 صباحاً", purpose: "مراجعة البحث", notes: "تم تقديم ملاحظات على منهجية البحث" },
        { day: "الخميس", date: "26 أكتوبر 2023", time: "2:00 مساءً - 3:00 مساءً", purpose: "استشارة في خوارزميات التعلم الآلي", notes: "تمت الإجابة عن جميع الاستفسارات" }
      ]
    },
    3: {
      name: "د. خالد أحمد الراشد",
      title: "مشرف أكاديمي - قسم الشبكات",
      email: "k.alrashed@university.edu",
      phone: "0115678123",
      office: "مبنى 4 - مكتب 305",
      avatar: "خ",
      workingHours: [
        "الأحد - الأربعاء: 10 صباحاً - 1 ظهراً",
        "الخميس: 3 عصراً - 5 عصراً",
        "الجمعة والسبت: إجازة"
      ],
      availableDates: [
        { id: 1, day: "الأحد", date: "19 نوفمبر 2023", time: "11:00 صباحاً - 12:00 ظهراً", dataDate: "2023-11-19", dataTime: "11:00 - 12:00", note: "" },
        { id: 2, day: "الاثنين", date: "20 نوفمبر 2023", time: "12:00 ظهراً - 1:00 مساءً", dataDate: "2023-11-20", dataTime: "12:00 - 13:00", note: "" },
        { id: 3, day: "الثلاثاء", date: "21 نوفمبر 2023", time: "10:00 صباحاً - 11:00 صباحاً", dataDate: "2023-11-21", dataTime: "10:00 - 11:00", note: "للمقابلات فقط" },
        { id: 4, day: "الأربعاء", date: "22 نوفمبر 2023", time: "1:00 مساءً - 1:30 مساءً", dataDate: "2023-11-22", dataTime: "13:00 - 13:30", note: "مدة النصف ساعة فقط" }
      ],
      previousAppointments: [
        { day: "الأربعاء", date: "15 نوفمبر 2023", time: "12:00 ظهراً - 1:00 مساءً", purpose: "مراجعة تصميم الشبكة", notes: "تمت الموافقة على التصميم المبدئي" },
        { day: "الاثنين", date: "30 أكتوبر 2023", time: "10:00 صباحاً - 11:00 صباحاً", purpose: "مناقشة المشاكل التقنية", notes: "تم حل المشكلات الفنية" },
        { day: "الأحد", date: "15 أكتوبر 2023", time: "11:00 صباحاً - 12:00 ظهراً", purpose: "تسليم التقرير الأول", notes: "تم تسليم التقرير الأول بنجاح" }
      ]
    }
  };

  // الحالة
  const [currentSupervisorId, setCurrentSupervisorId] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAppointmentStatus, setShowAppointmentStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');

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
    
    // في تطبيق حقيقي، هنا ستتم إضافة الكود لإرسال البيانات إلى الخادم
  };

  // إلغاء الحجز
  const handleCancelAppointment = () => {
    setShowConfirmation(false);
  };

  // إتمام العملية
  const handleDone = () => {
    setShowAppointmentStatus(false);
    setSelectedDate(null);
    
    // في تطبيق حقيقي، هنا سيتم تحديث البيانات من الخادم
    alert('تم حجز الموعد بنجاح. سيتم إرسال تأكيد إلى بريدك الإلكتروني.');
  };

  // تغيير التبويب
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // عرض المواعيد المتاحة
  const renderAvailableDates = () => {
    return supervisors[currentSupervisorId].availableDates.map((date) => (
      <div
        key={date.id}
        className={`date-card ${date.unavailable ? 'unavailable' : ''} ${selectedDate?.id === date.id ? 'selected' : ''}`}
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
    return supervisors[currentSupervisorId].previousAppointments.map((appointment, index) => (
      <div key={index} className="date-card completed">
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

  return (
    <div className="container-meeting">
        {/* Header Component */}
                      <ProjectHeader 
                        title=" أعضاء المجموعة"
                        description="هذا المشروع يهدف إلى تطوير نظام متكامل لإدارة مشاريع المجموعات في الجامعة، حيث يمكن توزيع المهام ومتابعة التقدم والإنجاز بشكل فعال."
                        teamMembers={5}
                        startDate="01/01/2023"
                        endDate="15/06/2023"
                      />
      <div className='container-meeting2'>
      <div className="content">
        <div className="supervisors-list-meeting">
          <h2 className="selection-title" >اختر مشرفك الأكاديمي</h2>
          <div className="supervisors-cards">
            {Object.keys(supervisors).map((supervisorId) => (
              <div
                key={supervisorId}
                className={`supervisor-card-meeting ${parseInt(supervisorId) === currentSupervisorId ? 'selected' : ''}`}
                onClick={() => handleSupervisorSelect(parseInt(supervisorId))}
              >
                <div className="supervisor-details">
                  <h3>{supervisors[supervisorId].name}</h3>
                  <p>{supervisors[supervisorId].title}</p>
                  <p>البريد الإلكتروني: {supervisors[supervisorId].email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="supervisor-info-meeting" id="selected-supervisor">
          <div className="supervisor-header">
         
          </div>


          <div className="tabs">
            <div
              className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => handleTabChange('schedule')}
            >
              جدولة موعد جديد
            </div>
            <div
              className={`tab ${activeTab === 'previous' ? 'active' : ''}`}
              onClick={() => handleTabChange('previous')}
            >
              المواعيد السابقة
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'schedule' ? 'active' : ''}`} id="schedule-tab">
            <h2 className="selection-title">المواعيد المتاحة للمراجعة</h2>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
              يرجى اختيار موعد واحد من القائمة أدناه
            </p>

            <div className="available-dates" id="available-dates">
              {renderAvailableDates()}
            </div>

            <div className={`confirmation ${showConfirmation ? 'show' : ''}`} id="confirmation">
              <h3>تأكيد الموعد المحدد</h3>
              <p>هل أنت متأكد من حجز الموعد التالي للمراجعة مع مشرفك الأكاديمي؟</p>
              {selectedDate && (
                <div id="selected-date-info" style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#791770', marginBottom: '5px' }}>
                    {selectedDate.day} - {selectedDate.date}
                  </p>
                  <p style={{ fontSize: '1rem', color: '#666' }}>
                    الوقت: {selectedDate.time}
                  </p>
                </div>
              )}
              <div className="action-buttons">
                <button className="btn btn-primary" onClick={handleConfirmAppointment}>
                  تأكيد الحجز
                </button>
                <button className="btn btn-secondary" onClick={handleCancelAppointment}>
                  إلغاء
                </button>
              </div>
            </div>

            <div className={`appointment-status ${showAppointmentStatus ? 'show' : ''}`} id="appointment-status">
              <div className="status-icon">✓</div>
              <h3 className="status-title">تم حجز الموعد بنجاح</h3>
              {selectedDate && (
                <p className="status-details" id="status-details">
                  تم حجز موعد المراجعة في يوم {selectedDate.day} الموافق {selectedDate.date} من الساعة {selectedDate.time}
                </p>
              )}
              <button className="btn btn-primary" onClick={handleDone}>
                تم
              </button>
            </div>

            <div className="action-buttons">
              <button
                className="btn btn-primary"
                id="select-date-btn"
                disabled={!selectedDate}
                onClick={() => setShowConfirmation(true)}
              >
                تحديد الموعد
              </button>
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'previous' ? 'active' : ''}`} id="previous-tab">
            <div className="previous-appointments">
              <h3>المواعيد السابقة</h3>
              <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
                قائمة بالمواعيد التي تمت مراجعتها سابقاً
              </p>

              <div className="appointments-list" id="previous-appointments">
                {renderPreviousAppointments()}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SchedulingStudentMeetings;