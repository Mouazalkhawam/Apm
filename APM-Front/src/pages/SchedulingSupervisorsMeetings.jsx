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
  faComments,
  faCheck,
  faBan
} from '@fortawesome/free-solid-svg-icons';
import './SchedulingSupervisorsMeetings.css';
import TopNav from "../components/TopNav/TopNav";
import Sidebar from "../components/Sidebar/Sidebar";
import axios from 'axios';

const SidebarWithRef = React.forwardRef((props, ref) => (
  <Sidebar ref={ref} {...props} />
));

const SchedulingSupervisorsMeetings = () => {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  const [datetimeInputs, setDatetimeInputs] = useState(['']);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [proposedMeetings, setProposedMeetings] = useState([]);
  const [confirmedMeetings, setConfirmedMeetings] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [supervisorId, setSupervisorId] = useState(localStorage.getItem('supervisor_id') || null);
  const [errors, setErrors] = useState({});
  const [supervisorInfo, setSupervisorInfo] = useState({
    name: '',
    image: ''
  });
  const [activeTab, setActiveTab] = useState('proposed'); // 'proposed' or 'confirmed'

  // API Client Configuration
  const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    timeout: 10000,
  });

  // Add request interceptor
  apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, error => {
    return Promise.reject(error);
  });

  // Add response interceptor
  apiClient.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const fetchSupervisorData = async () => {
      try {
        const response = await apiClient.get('/api/check-supervisor');
        
        if (!response.data.is_supervisor) {
          throw new Error('المستخدم الحالي ليس مشرفًا');
        }

        setSupervisorInfo({
          name: response.data.name,
          image: response.data.profile_picture || 'https://randomuser.me/api/portraits/women/44.jpg'
        });

        setSupervisorId(response.data.supervisor_id);
        localStorage.setItem('supervisor_id', response.data.supervisor_id);

      } catch (error) {
        console.error('حدث خطأ أثناء جلب بيانات المشرف:', error);
      }
    };

    fetchSupervisorData();
  }, []);

  // Fetch groups from API
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await apiClient.get('/api/supervisor/groups');

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

  // Fetch meetings based on active tab
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        if (!supervisorId) return;

        setLoadingMeetings(true);
        
        if (activeTab === 'proposed') {
          const response = await apiClient.get('/api/meetings/proposed');
          const formattedMeetings = response.data.data.map(meeting => ({
            id: meeting.id,
            group_id: meeting.group_id,
            group: meeting.group.name,
            datetime: meeting.meeting_time,
            end_time: meeting.end_time,
            description: meeting.description || '-',
            status: meeting.status,
            students: meeting.group.students || []
          }));
          setProposedMeetings(formattedMeetings);
        } else {
          const response = await apiClient.get('/api/meetings/confirmed');
          const formattedMeetings = response.data.data.map(meeting => ({
            id: meeting.id,
            group_id: meeting.group_id,
            group: meeting.group.name,
            datetime: meeting.meeting_time,
            end_time: meeting.end_time,
            description: meeting.description || '-',
            status: meeting.status,
            students: meeting.group.students || []
          }));
          setConfirmedMeetings(formattedMeetings);
        }
        
        setLoadingMeetings(false);
        
      } catch (error) {
        console.error(`Failed to fetch ${activeTab} meetings:`, error);
        setLoadingMeetings(false);
        if (activeTab === 'proposed') {
          setProposedMeetings([]);
        } else {
          setConfirmedMeetings([]);
        }
      }
    };

    if (supervisorId) {
      fetchMeetings();
    }
  }, [supervisorId, activeTab]);

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

  const formatDatetimeForAPI = (datetimeStr) => {
    if (!datetimeStr) return '';
    const date = new Date(datetimeStr);
    return date.toISOString().replace('T', ' ').slice(0, 19);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!selectedGroup) {
      setErrors(prev => ({...prev, group: 'الرجاء اختيار المجموعة'}));
      return;
    }
    
    const validTimes = datetimeInputs.filter(time => time);
    if (validTimes.length === 0) {
      setErrors(prev => ({...prev, times: 'الرجاء تحديد موعد واحد على الأقل'}));
      return;
    }
    
    try {
      const requestData = {
        group_id: parseInt(selectedGroup),
        proposed_times: validTimes.map(formatDatetimeForAPI),
        description: meetingDescription || null
      };

      const response = await apiClient.post(
        `/api/supervisors/${supervisorId}/meetings/propose`,
        requestData
      );

      // Update local state with the new meetings
      const newMeetings = response.data.data.map(meeting => ({
        id: meeting.id,
        group_id: meeting.group_id,
        group: groups.find(g => g.value === meeting.group_id.toString())?.label || meeting.group_id.toString(),
        datetime: meeting.meeting_time,
        end_time: meeting.end_time,
        description: meeting.description || '-',
        status: meeting.status
      }));

      setProposedMeetings(prev => [...newMeetings, ...prev]);

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
      
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors || {};
        const errorMessages = {};
        
        Object.keys(validationErrors).forEach(key => {
          errorMessages[key] = validationErrors[key][0];
        });
        
        setErrors(errorMessages);
        alert('يوجد أخطاء في البيانات المدخلة: ' + Object.values(errorMessages).join('، '));
      } else {
        alert('فشل في إرسال مقترحات الاجتماع. يرجى التحقق من البيانات والمحاولة مرة أخرى');
      }
    }
  };

  const deleteMeeting = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الاجتماع؟')) {
      try {
        await apiClient.delete(`/api/meetings/${id}`);
        if (activeTab === 'proposed') {
          setProposedMeetings(proposedMeetings.filter(meeting => meeting.id !== id));
        } else {
          setConfirmedMeetings(confirmedMeetings.filter(meeting => meeting.id !== id));
        }
      } catch (error) {
        console.error('Failed to delete meeting:', error);
        alert('فشل في حذف الاجتماع. يرجى المحاولة مرة أخرى');
      }
    }
  };

  const confirmMeeting = async (id) => {
    try {
      await apiClient.put(`/api/meetings/${id}/confirm`);
      
      // Move meeting from proposed to confirmed
      const meetingToConfirm = proposedMeetings.find(m => m.id === id);
      if (meetingToConfirm) {
        setConfirmedMeetings([...confirmedMeetings, {...meetingToConfirm, status: 'confirmed'}]);
        setProposedMeetings(proposedMeetings.filter(m => m.id !== id));
      }
      
      alert('تم تأكيد الاجتماع بنجاح');
    } catch (error) {
      console.error('Failed to confirm meeting:', error);
      alert('فشل في تأكيد الاجتماع. يرجى المحاولة مرة أخرى');
    }
  };

  const rejectMeeting = async (id) => {
    const reason = window.prompt('الرجاء إدخال سبب الرفض:');
    if (reason === null) return;
    
    try {
      await apiClient.put(`/api/meetings/${id}/reject`, { rejection_reason: reason });
      setProposedMeetings(proposedMeetings.filter(m => m.id !== id));
      alert('تم رفض الاجتماع بنجاح');
    } catch (error) {
      console.error('Failed to reject meeting:', error);
      alert('فشل في رفض الاجتماع. يرجى المحاولة مرة أخرى');
    }
  };

  const editMeeting = (id) => {
    const meetings = activeTab === 'proposed' ? proposedMeetings : confirmedMeetings;
    const meetingToEdit = meetings.find(meeting => meeting.id === id);
    
    const group = groups.find(g => g.value === meetingToEdit.group_id.toString());
    
    if (!group) {
      alert('لا يمكن العثور على المجموعة المرتبطة بهذا الاجتماع');
      return;
    }
    
    setSelectedGroup(group.value);
    setMeetingDescription(meetingToEdit.description === '-' ? '' : meetingToEdit.description);
    setDatetimeInputs([meetingToEdit.datetime]);
    setEditingId(id);
    
    document.querySelector('.schedule-form').scrollIntoView({ behavior: 'smooth' });
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
  };

  const viewSchedule = () => {
    setShowConfirmation(false);
    document.querySelector('.scheduled-meetings').scrollIntoView({ behavior: 'smooth' });
  };

  const renderMeetingsTable = () => {
    const meetings = activeTab === 'proposed' ? proposedMeetings : confirmedMeetings;
    
    if (loadingMeetings) {
      return <div className="loading-message">جاري تحميل الاجتماعات...</div>;
    }

    if (meetings.length === 0) {
      return <div className="no-meetings-message">لا توجد اجتماعات {activeTab === 'proposed' ? 'مقترحة' : 'مؤكدة'}</div>;
    }

    return (
      <table className="meetings-table">
        <thead>
          <tr>
            <th>#</th>
            <th>المجموعة</th>
            <th>الموعد</th>
            <th>وقت الانتهاء</th>
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
              <td data-label="وقت الانتهاء">{formatDatetimeForDisplay(meeting.end_time)}</td>
              <td data-label="الوصف">{meeting.description}</td>
              <td data-label="الحالة">
                <span className={`badge ${
                  meeting.status === 'confirmed' ? 'badge-success' : 
                  meeting.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                }`}>
                  {meeting.status === 'confirmed' ? 'مؤكد' : 
                   meeting.status === 'rejected' ? 'مرفوض' : 'مقترح'}
                </span>
              </td>
              <td data-label="الإجراءات" className="actions">
                {activeTab === 'proposed' && (
                  <>
                    <FontAwesomeIcon 
                      icon={faCheck} 
                      title="تأكيد" 
                      className="text-success mr-2"
                      onClick={() => confirmMeeting(meeting.id)}
                    />
                    <FontAwesomeIcon 
                      icon={faBan} 
                      title="رفض" 
                      className="text-danger mr-2"
                      onClick={() => rejectMeeting(meeting.id)}
                    />
                  </>
                )}
                <FontAwesomeIcon 
                  icon={faEdit} 
                  title="تعديل" 
                  className="text-primary mr-2"
                  onClick={() => editMeeting(meeting.id)}
                />
                <FontAwesomeIcon 
                  icon={faTrash} 
                  title="حذف" 
                  className="text-danger"
                  onClick={() => deleteMeeting(meeting.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="dashboard-container-dash-sup">
      <SidebarWithRef 
        ref={sidebarRef}
        user={{
          name: supervisorInfo.name || "د.عفاف",
          role: "مشرف",
          image: supervisorInfo.image
        }}
        navItems={[
          { icon: faTachometerAlt, text: "اللوحة الرئيسية", path: "/supervisors-dashboard" },
          { icon: faProjectDiagram, text: "المشاريع", path: "/supervisor-project" },
          { icon: faUsers, text: "الطلاب", path:"/students" },
          { icon: faCalendarCheck, text: "المهام", alert: true, path: "/tasks" },
          { icon: faFileAlt, text: "التقارير", path: "/reports" },
          { icon: faComments, text: "جدولة الاجتماعات", badge: 3, active: true, path: "/scheduling-supervisors-meetings" }
        ]}
      />
      <div className="main-container">
        <div className='supervisor-dashboard'>
          <TopNav 
            user={{
              name: supervisorInfo.name || "د.عفاف",
              image: supervisorInfo.image
            }}
            notifications={{
              bell: 3,
              envelope: 7
            }}
            searchPlaceholder="ابحث عن مشاريع، طلاب، مهام..."
          />
        
          {/* Schedule Form */}
          <div className="card schedule-form">
            <h3 className="form-title-ti">جدولة اجتماع جديد</h3>
            <form id="scheduleForm" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="groupSelect">المجموعة</label>
                {errors.group && <div className="error-text">{errors.group}</div>}
                {loadingGroups ? (
                  <div className="loading-message">جاري تحميل المجموعات...</div>
                ) : groups.length > 0 ? (
                  <select 
                    id="groupSelect" 
                    className={`form-control ${errors.group ? 'is-invalid' : ''}`}
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
                {errors.times && <div className="error-text">{errors.times}</div>}
                {errors.proposed_times && <div className="error-text">{errors.proposed_times}</div>}
                <div id="datetimeInputsContainer">
                  {datetimeInputs.map((datetime, index) => (
                    <div className={`form-control ${errors.proposed_times ? 'is-invalid' : ''}`} key={index}>
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

          {/* Meetings Tabs */}
          <div className="card scheduled-meetings">
            <div className="meetings-tabs">
              <button 
                className={`tab-btn ${activeTab === 'proposed' ? 'active' : ''}`}
                onClick={() => setActiveTab('proposed')}
              >
                الاجتماعات المقترحة
              </button>
              <button 
                className={`tab-btn ${activeTab === 'confirmed' ? 'active' : ''}`}
                onClick={() => setActiveTab('confirmed')}
              >
                الاجتماعات المؤكدة
              </button>
            </div>
            
            <div className="table-responsive">
              {renderMeetingsTable()}
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
    </div>
  );
};

export default SchedulingSupervisorsMeetings;