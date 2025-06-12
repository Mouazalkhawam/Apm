import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef } from 'react';
import { 
  faPlus, 
  faArrowLeft, 
  faTimes, 
  faEdit, 
  faTrash,
  faUsers,
  faCalendarAlt,
  faTachometerAlt,
  faProjectDiagram,
  faCalendarCheck,
  faFileAlt,
  faComments
} from '@fortawesome/free-solid-svg-icons';
import './SchedulingSupervisorsMeetings.css';
import TopNav from "../components/TopNav/TopNav";
import Sidebar from "../components/Sidebar/Sidebar";
import axios from 'axios';

const SchedulingSupervisorsMeetings = () => {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  const [datetimeInputs, setDatetimeInputs] = useState(['']);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  // Fetch groups from API
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get('http://localhost:8000/api/supervisor/groups', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.data.success) {
          throw new Error('API request was not successful');
        }

        const groupsData = response.data.data;
        const groupsArray = Object.keys(groupsData).map(groupId => ({
          value: groupId,
          label: groupsData[groupId]
        }));
        
        setGroups(groupsArray);
        setLoadingGroups(false);
        
      } catch (error) {
        console.error('Failed to fetch groups:', error);
        setLoadingGroups(false);
        alert('فشل في جلب المجموعات. يرجى التحقق من اتصالك بالإنترنت أو إعادة تسجيل الدخول');
      }
    };
    
    fetchGroups();
  }, []);

  // Fetch meetings from API
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get('http://localhost:8000/api/supervisor/meetings', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.data.success) {
          throw new Error('API request was not successful');
        }

        const formattedMeetings = response.data.data.map(meeting => ({
          id: meeting.id,
          group: meeting.group_name,
          datetime: meeting.meeting_time,
          description: meeting.description || '-',
          status: meeting.status
        }));
        
        setMeetings(formattedMeetings);
        setLoadingMeetings(false);
        
      } catch (error) {
        console.error('Failed to fetch meetings:', error);
        setLoadingMeetings(false);
        alert('فشل في جلب الاجتماعات. يرجى التحقق من اتصالك بالإنترنت أو إعادة تسجيل الدخول');
      }
    };
    
    fetchMeetings();
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const addDatetimeInput = () => {
    if (datetimeInputs.length < 5) {
      setDatetimeInputs([...datetimeInputs, '']);
    }
  };

  const removeDatetimeInput = (index) => {
    if (datetimeInputs.length > 1) {
      const newInputs = [...datetimeInputs];
      newInputs.splice(index, 1);
      setDatetimeInputs(newInputs);
    } else {
      // If it's the last input, just clear the value
      const newInputs = [...datetimeInputs];
      newInputs[0] = '';
      setDatetimeInputs(newInputs);
    }
  };

  const handleDatetimeChange = (index, value) => {
    const newInputs = [...datetimeInputs];
    newInputs[index] = value;
    setDatetimeInputs(newInputs);
  };

  const formatDatetimeForDisplay = (datetimeStr) => {
    if (!datetimeStr) return '';
    
    const date = new Date(datetimeStr);
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleString('ar-EG', options);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedGroup) {
      alert('الرجاء اختيار المجموعة');
      return;
    }
    
    const validTimes = datetimeInputs.filter(time => time);
    if (validTimes.length === 0) {
      alert('الرجاء تحديد موعد واحد على الأقل');
      return;
    }
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const requestData = {
        group_id: selectedGroup,
        proposed_times: validTimes,
        description: meetingDescription || null
      };

      const response = await axios.post(
        'http://localhost:8000/api/supervisor/meetings/propose',
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status !== 201 || !response.data.success) {
        throw new Error('Failed to create meeting proposals');
      }

      // Update local state with the new meetings
      const newMeetings = response.data.data.map(meeting => ({
        id: meeting.id,
        group: meeting.group_name,
        datetime: meeting.meeting_time,
        description: meeting.description || '-',
        status: meeting.status
      }));

      setMeetings([...newMeetings, ...meetings]);

      // Reset form
      setDatetimeInputs(['']);
      setSelectedGroup('');
      setMeetingDescription('');

      // Show confirmation
      const selectedGroupObj = groups.find(group => group.value === selectedGroup);
      const groupName = selectedGroupObj ? selectedGroupObj.label : '';
      
      setConfirmationData({
        groupName: groupName,
        times: validTimes.map(time => formatDatetimeForDisplay(time)).join('، ')
      });
      setShowConfirmation(true);
      
    } catch (error) {
      console.error('Failed to submit meeting proposals:', error);
      alert('فشل في إرسال مقترحات الاجتماع. يرجى التحقق من البيانات والمحاولة مرة أخرى');
    }
  };

  const deleteMeeting = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الاجتماع؟')) {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.delete(
          `http://localhost:8000/api/supervisor/meetings/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        if (response.status !== 200 || !response.data.success) {
          throw new Error('Failed to delete meeting');
        }

        setMeetings(meetings.filter(meeting => meeting.id !== id));
      } catch (error) {
        console.error('Failed to delete meeting:', error);
        alert('فشل في حذف الاجتماع. يرجى المحاولة مرة أخرى');
      }
    }
  };

  const editMeeting = (id) => {
    const meetingToEdit = meetings.find(meeting => meeting.id === id);
    
    // Find the group in our groups list that matches the meeting's group name
    const group = groups.find(g => g.label === meetingToEdit.group);
    setSelectedGroup(group ? group.value : '');
    
    setMeetingDescription(meetingToEdit.description === '-' ? '' : meetingToEdit.description);
    
    // For editing, we'll just show the first datetime (API may need adjustment for multiple times)
    setDatetimeInputs([meetingToEdit.datetime]);
    
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
    <div className="dashboard-container-dash">
      <Sidebar />
      <div className="scheduling-container">
        {/* Top Navigation */}
        <TopNav 
          user={{
            name: "د.عفاف",
            image: "https://randomuser.me/api/portraits/women/44.jpg"
          }}
          notifications={{
            bell: 3,
            envelope: 7
          }}
          searchPlaceholder="ابحث عن مشاريع، طلاب، مهام..."
        />
      {/* Schedule Form */}
        <div className="card schedule-form">
          <h3 className="form-title">جدولة اجتماع جديد</h3>
          <form id="scheduleForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="groupSelect">المجموعة</label>
              {loadingGroups ? (
                <div className="loading-message">جاري تحميل المجموعات...</div>
              ) : groups.length > 0 ? (
                <select 
                  id="groupSelect" 
                  className="form-control" 
                  required
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  <option value="">اختر المجموعة</option>
                  {groups.map(group => (
                    <option key={group.value} value={group.value}>
                      {group.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="error-message">
                  لا توجد مجموعات متاحة. يرجى التحقق من اتصالك بالخادم.
                </div>
              )}
            </div>

            <div className="form-group">
              <label>إضافة المواعيد المقترحة (يسمح بحد أقصى 5 مواعيد)</label>
              <div id="datetimeInputsContainer">
                {datetimeInputs.map((datetime, index) => (
                  <div className="form-control" key={index}>
                    <input 
                      type="datetime-local" 
                      className="datetime-input" 
                      required
                      value={datetime}
                      onChange={(e) => handleDatetimeChange(index, e.target.value)}
                      min={new Date(new Date().getTime() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                      max={new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                    />
                    {index > 0 && (
                      <FontAwesomeIcon 
                        icon={faTimes} 
                        className="remove-datetime" 
                        onClick={() => removeDatetimeInput(index)}
                      />
                    )}
                  </div>
                ))}
              </div>
              {datetimeInputs.length < 5 && (
                <button 
                  type="button" 
                  className="add-datetime-btn" 
                  id="addDatetimeBtn"
                  onClick={addDatetimeInput}
                >
                  <FontAwesomeIcon icon={faPlus} /> إضافة وقت آخر
                </button>
              )}

              <div 
                className="selected-datetimes-list" 
                id="selectedDatetimesList" 
                style={{ display: datetimeInputs.some(dt => dt) ? 'block' : 'none' }}
              >
                {datetimeInputs.filter(datetime => datetime).map((datetime, index) => (
                  <div className="datetime-slot-item" key={index}>
                    <span>{formatDatetimeForDisplay(datetime)}</span>
                    <FontAwesomeIcon 
                      icon={faTimes} 
                      className="remove-datetime" 
                      onClick={() => removeDatetimeInput(index)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="meetingDescription">وصف الاجتماع (اختياري)</label>
              <input 
                type="text" 
                id="meetingDescription" 
                className="form-control" 
                placeholder="مثال: مناقشة المشروع النهائي"
                value={meetingDescription}
                onChange={(e) => setMeetingDescription(e.target.value)}
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
            {loadingMeetings ? (
              <div className="loading-message">جاري تحميل الاجتماعات...</div>
            ) : meetings.length > 0 ? (
              <table className="meetings-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>المجموعة</th>
                    <th>الموعد</th>
                    <th>الوصف</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((meeting, index) => (
                    <tr key={meeting.id}>
                      <td data-label="#">{index + 1}</td>
                      <td data-label="المجموعة">{meeting.group}</td>
                      <td data-label="الموعد">{formatDatetimeForDisplay(meeting.datetime)}</td>
                      <td data-label="الوصف">{meeting.description}</td>
                      <td data-label="الحالة">
                        <span className={`badge ${meeting.status === 'approved' ? 'badge-success' : 
                                         meeting.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                          {meeting.status === 'approved' ? 'مقبول' : 
                           meeting.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
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
            ) : (
              <div className="no-meetings-message">لا توجد اجتماعات مجدولة</div>
            )}
          </div>
        </div>

        {/* Confirmation Message */}
        {showConfirmation && (
          <>
            <div className="overlay" onClick={closeConfirmation}></div>
            <div className="confirmation-message">
              <h3>تمت الجدولة بنجاح</h3>
              <p id="messageContent">
                تم جدولة الاجتماع للمجموعة <span id="groupName">{confirmationData.groupName}</span> في المواعيد التالية:
                <br />
                <span id="meetingTimes">{confirmationData.times}</span>
              </p>
              <div className="message-buttons">
                <button className="btn" onClick={closeConfirmation}>إغلاق</button>
                <button className="btn btn-primary" onClick={viewSchedule}>مشاهدة الجدولة</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SchedulingSupervisorsMeetings;