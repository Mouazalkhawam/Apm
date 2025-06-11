import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faArrowLeft, 
  faTimes, 
  faEdit, 
  faTrash,
  faUsers,
  faCalendarAlt 
} from '@fortawesome/free-solid-svg-icons';
import './SchedulingSupervisorsMeetings.css';

const SchedulingSupervisorsMeetings = () => {
  const [timeInputs, setTimeInputs] = useState([{ start: '', end: '' }]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTopic, setMeetingTopic] = useState('');
  const [meetings, setMeetings] = useState([
    {
      id: 1,
      group: 'المجموعة 1 - تعليم أساسي',
      date: '14/06/2023',
      times: ['09:00 - 10:00', '11:00 - 12:00'],
      topic: 'مراجعة الدروس',
      status: 'active'
    },
    {
      id: 2,
      group: 'المجموعة 2 - تطوير الويب',
      date: '15/06/2023',
      times: ['10:00 - 11:00', '14:00 - 15:00'],
      topic: 'مناقشة المشاريع',
      status: 'active'
    },
    {
      id: 3,
      group: 'المجموعة 3 - علم البيانات',
      date: '16/06/2023',
      times: ['08:00 - 09:00'],
      topic: '-',
      status: 'pending'
    }
  ]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState({});
  const [editingId, setEditingId] = useState(null);

  const addTimeInput = () => {
    setTimeInputs([...timeInputs, { start: '', end: '' }]);
  };

  const removeTimeInput = (index) => {
    if (timeInputs.length > 1) {
      const newInputs = [...timeInputs];
      newInputs.splice(index, 1);
      setTimeInputs(newInputs);
    } else {
      // If it's the last input, just clear the values
      const newInputs = [...timeInputs];
      newInputs[0] = { start: '', end: '' };
      setTimeInputs(newInputs);
    }
  };

  const handleTimeChange = (index, field, value) => {
    const newInputs = [...timeInputs];
    newInputs[index][field] = value;
    setTimeInputs(newInputs);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedGroup) {
      alert('الرجاء اختيار المجموعة');
      return;
    }
    
    if (!meetingDate) {
      alert('الرجاء اختيار التاريخ');
      return;
    }
    
    const validTimes = timeInputs.filter(time => time.start && time.end);
    if (validTimes.length === 0) {
      alert('الرجاء تحديد موعد واحد على الأقل');
      return;
    }
    
    const groupName = document.getElementById('groupSelect').options[document.getElementById('groupSelect').selectedIndex].text;
    
    const newMeeting = {
      id: editingId || meetings.length + 1,
      group: groupName,
      date: new Date(meetingDate).toLocaleDateString('ar-EG'),
      times: validTimes.map(time => `${time.start} - ${time.end}`),
      topic: meetingTopic || '-',
      status: 'active'
    };
    
    if (editingId) {
      // Update existing meeting
      setMeetings(meetings.map(meeting => meeting.id === editingId ? newMeeting : meeting));
      setEditingId(null);
    } else {
      // Add new meeting
      setMeetings([newMeeting, ...meetings]);
    }
    
    // Reset form
    setTimeInputs([{ start: '', end: '' }]);
    setSelectedGroup('');
    setMeetingDate('');
    setMeetingTopic('');
    
    // Show confirmation
    setConfirmationData({
      groupName: groupName,
      times: validTimes.map(time => `${time.start} - ${time.end}`).join('، ')
    });
    setShowConfirmation(true);
  };

  const deleteMeeting = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الاجتماع؟')) {
      setMeetings(meetings.filter(meeting => meeting.id !== id));
    }
  };

  const editMeeting = (id) => {
    const meetingToEdit = meetings.find(meeting => meeting.id === id);
    
    setSelectedGroup(meetingToEdit.group.includes('المجموعة 1') ? 'group1' : 
                    meetingToEdit.group.includes('المجموعة 2') ? 'group2' : 
                    meetingToEdit.group.includes('المجموعة 3') ? 'group3' : 'group4');
    
    const [day, month, year] = meetingToEdit.date.split('/');
    setMeetingDate(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    
    setMeetingTopic(meetingToEdit.topic === '-' ? '' : meetingToEdit.topic);
    
    const newTimeInputs = meetingToEdit.times.map(time => {
      const [start, end] = time.split(' - ');
      return { start, end };
    });
    
    setTimeInputs(newTimeInputs);
    setEditingId(id);
    
    // Scroll to form
    document.querySelector('.schedule-form').scrollIntoView({ behavior: 'smooth' });
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
  };

  const viewSchedule = () => {
    setShowConfirmation(false);
    document.querySelector('.scheduled-meetings').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="scheduling-container">
      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="card stat-card">
          <div className="stat-details">
            <h3>عدد المستخدمين</h3>
            <p>24 مستخدم نشط</p>
          </div>
          <div className="stat-icon users">
            <FontAwesomeIcon icon={faUsers} size="lg" />
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-details">
            <h3>عدد المجموعات</h3>
            <p>4 مجموعات</p>
          </div>
          <div className="stat-icon groups">
            <FontAwesomeIcon icon={faUsers} size="lg" />
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-details">
            <h3>الاجتماعات المجدولة</h3>
            <p>3 اجتماعات هذا الأسبوع</p>
          </div>
          <div className="stat-icon schedule">
            <FontAwesomeIcon icon={faCalendarAlt} size="lg" />
          </div>
        </div>
      </div>

      {/* Schedule Form */}
      <div className="card schedule-form">
        <h3 className="form-title">جدولة اجتماع جديد</h3>
        <form id="scheduleForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="groupSelect">المجموعة</label>
            <select 
              id="groupSelect" 
              className="form-control" 
              required
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="">اختر المجموعة</option>
              <option value="group1">المجموعة 1 - تعليم أساسي</option>
              <option value="group2">المجموعة 2 - تطوير الويب</option>
              <option value="group3">المجموعة 3 - علم البيانات</option>
              <option value="group4">المجموعة 4 - الذكاء الاصطناعي</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="meetingDate">تاريخ الاجتماع</label>
            <input 
              type="date" 
              id="meetingDate" 
              className="form-control" 
              required
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>إضافة المواعيد</label>
            <div id="timeInputsContainer">
              {timeInputs.map((time, index) => (
                <div className="time-input-container" key={index}>
                  <input 
                    type="time" 
                    className="start-time" 
                    required
                    value={time.start}
                    onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                  />
                  <FontAwesomeIcon icon={faArrowLeft} />
                  <input 
                    type="time" 
                    className="end-time" 
                    required
                    value={time.end}
                    onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                  />
                  {index > 0 && (
                    <FontAwesomeIcon 
                      icon={faTimes} 
                      className="remove-time" 
                      onClick={() => removeTimeInput(index)}
                    />
                  )}
                </div>
              ))}
            </div>
            <button 
              type="button" 
              className="add-time-btn" 
              id="addTimeBtn"
              onClick={addTimeInput}
            >
              <FontAwesomeIcon icon={faPlus} /> إضافة وقت آخر
            </button>

            <div 
              className="selected-times-list" 
              id="selectedTimesList" 
              style={{ display: timeInputs.some(t => t.start && t.end) ? 'block' : 'none' }}
            >
              {timeInputs.filter(time => time.start && time.end).map((time, index) => (
                <div className="time-slot-item" key={index}>
                  <span>{time.start} - {time.end}</span>
                  <FontAwesomeIcon 
                    icon={faTimes} 
                    className="remove-time" 
                    onClick={() => removeTimeInput(index)}
                  />
                </div>
              ))}
            </div>
            <input 
              type="hidden" 
              id="selectedTimes" 
              name="selectedTimes" 
              value={timeInputs.filter(time => time.start && time.end).map(time => `${time.start} - ${time.end}`).join('; ')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="meetingTopic">موضوع الاجتماع (اختياري)</label>
            <input 
              type="text" 
              id="meetingTopic" 
              className="form-control" 
              placeholder="مثال: مناقشة المشروع النهائي"
              value={meetingTopic}
              onChange={(e) => setMeetingTopic(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            {editingId ? 'تحديث الجدولة' : 'حفظ الجدولة'}
          </button>
        </form>
      </div>

      {/* Scheduled Meetings */}
      <div className="card scheduled-meetings">
        <h3 className="form-title">الاجتماعات المجدولة</h3>
        <div className="table-responsive">
          <table className="meetings-table">
            <thead>
              <tr>
                <th>#</th>
                <th>المجموعة</th>
                <th>التاريخ</th>
                <th>المواعيد</th>
                <th>الموضوع</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting, index) => (
                <tr key={meeting.id}>
                  <td data-label="#">{index + 1}</td>
                  <td data-label="المجموعة">{meeting.group}</td>
                  <td data-label="التاريخ">{meeting.date}</td>
                  <td data-label="المواعيد">
                    {meeting.times.map((time, i) => (
                      <React.Fragment key={i}>
                        {time}
                        {i < meeting.times.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </td>
                  <td data-label="الموضوع">{meeting.topic}</td>
                  <td data-label="الحالة">
                    <span className={`badge ${meeting.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {meeting.status === 'active' ? 'نشطة' : 'قيد الانتظار'}
                    </span>
                  </td>
                  <td data-label="الإجراءات" className="actions">
                    <FontAwesomeIcon 
                      icon={faEdit} 
                      title="تعديل" 
                      onClick={() => editMeeting(meeting.id)}
                    />
                    <FontAwesomeIcon 
                      icon={faTrash} 
                      title="حذف" 
                      onClick={() => deleteMeeting(meeting.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Message */}
      {showConfirmation && (
        <>
          <div className="overlay" onClick={closeConfirmation}></div>
          <div className="confirmation-message">
            <h3>تمت الجدولة بنجاح</h3>
            <p id="messageContent">
              تم جدولة الاجتماع للمجموعة <span id="groupName">{confirmationData.groupName}</span> في المواعيد المحددة.
            </p>
            <div className="message-buttons">
              <button className="btn" onClick={closeConfirmation}>إغلاق</button>
              <button className="btn btn-primary" onClick={viewSchedule}>مشاهدة الجدولة</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SchedulingSupervisorsMeetings;