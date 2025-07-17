import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { 
  faBars, 
  faCalendarAlt, 
  faGraduationCap, 
  faTrashAlt, 
  faPlus, 
  faSave, 
  faSpinner 
} from '@fortawesome/free-solid-svg-icons';
import './DiscussionsCoordinator.css';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';

const DiscussionsCoordinator = () => {
  // States
  const [activeTab, setActiveTab] = useState('phase');
  const [selectedType, setSelectedType] = useState('');
  const [date, setDate] = useState('');
  const [phaseDiscussions, setPhaseDiscussions] = useState([]);
  const [graduationDiscussions, setGraduationDiscussions] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [semesterGroups, setSemesterGroups] = useState([]);
  const [graduationGroups, setGraduationGroups] = useState([]);
  const [discussionTypes, setDiscussionTypes] = useState([]);
  const [loading, setLoading] = useState({
    groups: false,
    types: false,
    saving: false,
    discussions: false
  });
  const [userInfo, setUserInfo] = useState({
    name: '',
    image: '',
    role: ''
  });

  // Sidebar functions
  const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);
  const closeMobileSidebar = () => setMobileSidebarOpen(false);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/api/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = response.data;
        setUserInfo({
          name: userData.name,
          image: userData.profile_picture || 'https://randomuser.me/api/portraits/women/44.jpg',
          role: userData.role
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Fetch data functions
  const fetchDiscussionTypes = async () => {
    try {
      setLoading(prev => ({ ...prev, types: true }));
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:8000/api/discussion-types', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setDiscussionTypes(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedType(response.data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching discussion types:', error);
      if (error.response?.status === 401) {
        alert('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      }
    } finally {
      setLoading(prev => ({ ...prev, types: false }));
    }
  };

  const fetchGroups = async () => {
    try {
      setLoading(prev => ({ ...prev, groups: true }));
      const token = localStorage.getItem('access_token');
      
      const [semesterRes, graduationRes] = await Promise.all([
        axios.get('http://localhost:8000/api/projects/current-semester', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/projects/current-graduation', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (semesterRes.data.success) {
        const formattedGroups = semesterRes.data.data.map(project => ({
          id: project.group?.id || 0,
          name: project.group?.name || 'غير معروف',
          title: project.title || 'بدون عنوان'
        }));
        setSemesterGroups(formattedGroups);
      }

      if (graduationRes.data.success) {
        const formattedGroups = graduationRes.data.data.map(project => ({
          id: project.group?.id || 0,
          name: project.group?.name || 'غير معروف',
          title: project.title || 'بدون عنوان'
        }));
        setGraduationGroups(formattedGroups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      if (error.response?.status === 401) {
        alert('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      }
    } finally {
      setLoading(prev => ({ ...prev, groups: false }));
    }
  };

  const fetchPreviousDiscussions = async () => {
    try {
      setLoading(prev => ({ ...prev, discussions: true }));
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:8000/api/schedules', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        const rawData = response.data.data;

        const grouped = {};

        rawData.forEach(item => {
          const type = item.schedule_info?.type;
          const date = item.schedule_info?.date;
          const projectType = item.project_info?.project_type;

          const key = `${projectType}_${type}_${date}`;
          if (!grouped[key]) {
            grouped[key] = {
              id: item.schedule_info?.id,
              type,
              date,
              hall: item.schedule_info?.location,
              groups: []
            };
          }

          grouped[key].groups.push({
            id: item.group_info?.group_id,
            name: item.group_info?.group_name,
            title: item.project_info?.title || 'بدون عنوان',
            time: item.schedule_info?.time,
            hall: item.schedule_info?.location,
            notes: item.schedule_info?.notes || '',
            type
          });
        });

        const phase = [];
        const graduation = [];

        Object.entries(grouped).forEach(([key, value]) => {
          if (key.startsWith('semester_')) {
            phase.push(value);
          } else if (key.startsWith('graduation_')) {
            graduation.push(value);
          }
        });

        setPhaseDiscussions(phase);
        setGraduationDiscussions(graduation);
      }
    } catch (error) {
      console.error('Error fetching previous discussions:', error);
      if (error.response?.status === 401) {
        alert('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      }
    } finally {
      setLoading(prev => ({ ...prev, discussions: false }));
    }
  };

  // Initialize data
  useEffect(() => {
    fetchDiscussionTypes();
    fetchGroups();
    fetchPreviousDiscussions();
    
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
  };

  // Discussion handlers
  const handleAddDiscussion = (type) => {
    const isPhase = type === 'phase';
    
    if (!selectedType || !date) {
      alert('الرجاء إدخال جميع البيانات المطلوبة');
      return;
    }

    const discussion = {
      id: `${type}-${Date.now()}`,
      type: selectedType,
      date: date,
      time: '08:00',
      hall: 'القاعة الرئيسية',
      groups: [{
        id: '',
        name: '',
        title: '',
        time: '08:00',
        hall: 'القاعة الرئيسية',
        notes: '',
        type: selectedType
      }]
    };

    if (isPhase) {
      setPhaseDiscussions(prev => [discussion, ...prev]);
    } else {
      setGraduationDiscussions(prev => [discussion, ...prev]);
    }
    
    setSelectedType(discussionTypes.length > 0 ? discussionTypes[0] : '');
    setDate('');
  };

  const handleDeleteDiscussion = async (id, isPhase) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المناقشة؟')) return;

    if (!id.startsWith('phase-') && !id.startsWith('graduation-')) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`http://localhost:8000/api/schedules/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Error deleting discussion:', error);
        if (error.response?.status === 401) {
          alert('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
          return;
        } else {
          alert('حدث خطأ أثناء حذف المناقشة من الخادم');
          return;
        }
      }
    }

    if (isPhase) {
      setPhaseDiscussions(prev => prev.filter(d => d.id !== id));
    } else {
      setGraduationDiscussions(prev => prev.filter(d => d.id !== id));
    }

    alert('تم حذف المناقشة بنجاح');
  };

  const handleAddRow = (discussionId, isPhase) => {
    const updateDiscussions = (discussions) => 
      discussions.map(d => 
        d.id === discussionId 
          ? { ...d, groups: [...d.groups, {
              id: `temp-${Date.now()}`,
              name: '',
              title: '',
              time: '08:00',
              hall: d.hall,
              notes: '',
              type: d.type
            }] }
          : d
      );

    if (isPhase) {
      setPhaseDiscussions(updateDiscussions(phaseDiscussions));
    } else {
      setGraduationDiscussions(updateDiscussions(graduationDiscussions));
    }
  };

  const handleSaveDiscussion = async (discussionId, isPhase) => {
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      const discussions = isPhase ? phaseDiscussions : graduationDiscussions;
      const discussion = discussions.find(d => d.id === discussionId);

      if (!discussion) {
        alert('المناقشة غير موجودة');
        return;
      }

      const invalidGroups = discussion.groups.filter(group => !group.id || !group.name);
      if (invalidGroups.length > 0) {
        const groupNumbers = invalidGroups.map((_, index) => index + 1).join('، ');
        throw new Error(`الرجاء اختيار مشروع للمجموعات التالية: ${groupNumbers}`);
      }

      const token = localStorage.getItem('access_token');

      const discussionDataArray = discussion.groups.map(group => ({
        date: discussion.date,
        type: group.type,
        group_id: group.id,
        time: group.time,
        location: group.hall,
        notes: group.notes || '',
        project_type: isPhase ? 'semester' : 'graduation'
      }));

      let response;

      if (discussionId.startsWith('phase-') || discussionId.startsWith('graduation-')) {
        response = await axios.post('http://localhost:8000/api/schedules', discussionDataArray, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        response = await Promise.all(
          discussionDataArray.map((data) =>
            axios.put(`http://localhost:8000/api/schedules/${discussionId}`, data, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
          )
        );
      }

      if (
        (Array.isArray(response) && response.every(res => res.data.success)) ||
        (response.data && response.data.success)
      ) {
        alert('تم حفظ المناقشة بنجاح');

        if (discussionId.startsWith('phase-') || discussionId.startsWith('graduation-')) {
          const updatedDiscussion = {
            ...discussion,
            id: Array.isArray(response) ? response[0].data.data.scheduledId : response.data.data[0].scheduledId,
            groups: discussion.groups.map((group, index) => ({
              ...group,
              id: Array.isArray(response)
                ? response[index].data.data.group_id
                : response.data.data[index].group_id,
              name: Array.isArray(response)
                ? response[index].data.data.group_name || group.name
                : response.data.data[index].group_name || group.name,
              title: Array.isArray(response)
                ? response[index].data.data.project_title || group.title
                : response.data.data[index].project_title || group.title
            }))
          };

          if (isPhase) {
            setPhaseDiscussions(prev =>
              prev.map(d => d.id === discussionId ? updatedDiscussion : d)
            );
          } else {
            setGraduationDiscussions(prev =>
              prev.map(d => d.id === discussionId ? updatedDiscussion : d)
            );
          }
        }
      }
    } catch (error) {
      console.error('Error saving discussion:', error);
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        let errorMessage = 'خطأ في التحقق من البيانات:\n';
        for (const key in errors) {
          errorMessage += `${errors[key].join(', ')}\n`;
        }
        alert(errorMessage);
      } else if (error.response?.status === 401) {
        alert('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      } else if (error.message) {
        alert(error.message);
      } else {
        alert('حدث خطأ أثناء حفظ المناقشة');
      }
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const handleGroupChange = (discussionId, groupIndex, field, value, isPhase) => {
    const groups = isPhase ? semesterGroups : graduationGroups;
    
    const updateDiscussions = (discussions) => 
      discussions.map(d => 
        d.id === discussionId
          ? {
              ...d,
              groups: d.groups.map((g, i) => 
                i === groupIndex
                  ? {
                      ...g,
                      [field]: value,
                      ...(field === 'name' ? {
                        id: groups.find(gr => gr.name === value)?.id || '',
                        title: groups.find(gr => gr.name === value)?.title || ''
                      } : {})
                    }
                  : g
              )
            }
          : d
      );

    if (isPhase) {
      setPhaseDiscussions(updateDiscussions(phaseDiscussions));
    } else {
      setGraduationDiscussions(updateDiscussions(graduationDiscussions));
    }
  };

  // Render functions
  const renderDiscussionForm = (isPhase) => {
    return (
      <div className="section">
        <h2>{isPhase ? 'إضافة مناقشة فصلية' : 'إضافة مناقشة تخرج'}</h2>
        <div className="form-row">
          <div className="form-group">
            <label>نوع المناقشة</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              disabled={loading.types}
            >
              {loading.types ? (
                <option value="">جاري التحميل...</option>
              ) : (
                <>
                  <option value="">اختر نوع المناقشة</option>
                  {discussionTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </>
              )}
            </select>
          </div>
          <div className="form-group">
            <label>التاريخ</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button 
              className={`btn ${isPhase ? 'btn-blue' : 'btn-green'}`}
              onClick={() => handleAddDiscussion(isPhase ? 'phase' : 'graduation')}
              disabled={!selectedType || !date}
            >
              <FontAwesomeIcon icon={faPlus} /> إضافة مناقشة
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDiscussionTable = (discussions, isPhase) => {
    const groups = isPhase ? semesterGroups : graduationGroups;

    return (
      <div className="section">
        <h2>جدول {isPhase ? 'المناقشات الفصلية' : 'مناقشات التخرج'}</h2>
        <div id={`${isPhase ? 'phase' : 'graduation'}DiscussionsContainer`}>
          {discussions.length === 0 ? (
            <div className="empty-state">
              <FontAwesomeIcon icon={isPhase ? faCalendarAlt : faGraduationCap} />
              <p>لا توجد مناقشات {isPhase ? 'فصلية' : 'تخرج'} مضافة بعد</p>
            </div>
          ) : (
            discussions.map((discussion) => (
              <div key={discussion.id} className="discussion-table">
                <div className={`table-header ${isPhase ? 'phase-header' : 'graduation-header'}`}>
                  <h3>
                    {isPhase ? 'مناقشة فصلية' : 'مناقشة تخرج'} - {formatDate(discussion.date)}
                  </h3>
                  <button
                    onClick={() => handleDeleteDiscussion(discussion.id, isPhase)}
                    className="delete-btn"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>اسم المشروع</th>
                        <th>وقت المناقشة</th>
                        <th>القاعة</th>
                        <th>ملاحظات</th>
                        <th>النوع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {discussion.groups.map((group, index) => (
                        <tr key={`${discussion.id}-${index}`}>
                          <td>
                            <select
                              className="table-select"
                              value={group.name}
                              onChange={(e) => {
                                const selectedValue = e.target.value;
                                handleGroupChange(discussion.id, index, 'name', selectedValue, isPhase);
                              }}
                              disabled={loading.groups}
                            >
                              {loading.groups ? (
                                <option value="">جاري تحميل المشاريع...</option>
                              ) : (
                                <>
                                  <option value="">اختر مشروع</option>
                                  {groups.map((g) => (
                                    <option key={`group-${g.id}`} value={g.name}>
                                      {g.title} - {g.name}
                                    </option>
                                  ))}
                                </>
                              )}
                            </select>
                          </td>
                          <td>
                            <input
                              type="time"
                              className="table-input"
                              value={group.time}
                              onChange={(e) =>
                                handleGroupChange(discussion.id, index, 'time', e.target.value, isPhase)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="table-input"
                              value={group.hall}
                              onChange={(e) =>
                                handleGroupChange(discussion.id, index, 'hall', e.target.value, isPhase)
                              }
                            />
                          </td>
                          <td>
                            <textarea
                              className="table-textarea"
                              rows="1"
                              placeholder="ملاحظات"
                              value={group.notes}
                              onChange={(e) =>
                                handleGroupChange(discussion.id, index, 'notes', e.target.value, isPhase)
                              }
                            ></textarea>
                          </td>
                          <td>
                            <select
                              className="table-select"
                              value={group.type}
                              onChange={(e) =>
                                handleGroupChange(discussion.id, index, 'type', e.target.value, isPhase)
                              }
                            >
                              {discussionTypes.map((type, idx) => (
                                <option key={idx} value={type}>{type}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="table-footer">
                  <button
                    onClick={() => handleAddRow(discussion.id, isPhase)}
                    className="btn-add-row"
                  >
                    <FontAwesomeIcon icon={faPlus} /> إضافة صف
                  </button>
                  <button
                    onClick={() => handleSaveDiscussion(discussion.id, isPhase)}
                    className="btn-save"
                    disabled={loading.saving}
                  >
                    {loading.saving ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin /> جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} /> حفظ
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container-dash-sup">
      <Sidebar user={userInfo} />
      <div className="main-container">
        <div className='supervisor-dashboard'>
          <TopNav user={userInfo} />

          <div className="discussions-coordinator-container">
            <button className="mobile-sidebar-toggle" onClick={toggleMobileSidebar}>
              <FontAwesomeIcon icon={faBars} />
            </button>
            
            <div className={`overlay ${mobileSidebarOpen ? 'active' : ''}`} onClick={closeMobileSidebar}></div>
            
            <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
              <div className="page-content">
                <div className="tabs-container">
                  <div className="tabs-group" role="group">
                    <button
                      type="button"
                      className={`tabb-btn ${activeTab === 'phase' ? 'active' : ''}`}
                      onClick={() => setActiveTab('phase')}
                    >
                      <FontAwesomeIcon icon={faCalendarAlt} /> مناقشات المشاريع الفصلية
                    </button>
                    <button
                      type="button"
                      className={`tabb-btn ${activeTab === 'graduation' ? 'active' : ''}`}
                      onClick={() => setActiveTab('graduation')}
                    >
                      <FontAwesomeIcon icon={faGraduationCap} /> مناقشات مشاريع التخرج
                    </button>
                  </div>
                </div>

                {loading.discussions ? (
                  <div className="loading-state">
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <p>جاري تحميل المناقشات السابقة...</p>
                  </div>
                ) : (
                  <>
                    {activeTab === 'phase' && (
                      <div className="fade-in">
                        {renderDiscussionForm(true)}
                        {renderDiscussionTable(phaseDiscussions, true)}
                      </div>
                    )}

                    {activeTab === 'graduation' && (
                      <div className="fade-in">
                        {renderDiscussionForm(false)}
                        {renderDiscussionTable(graduationDiscussions, false)}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionsCoordinator;