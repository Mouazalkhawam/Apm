import React, { useState } from 'react';
import './DiscussionsCoordinator.css';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';
const DiscussionsCoordinator = () => {
  const [activeTab, setActiveTab] = useState('phase');
  const [phaseDate, setPhaseDate] = useState('');
  const [phaseTime, setPhaseTime] = useState('');
  const [phaseHall, setPhaseHall] = useState('');
  const [graduationDate, setGraduationDate] = useState('');
  const [graduationTime, setGraduationTime] = useState('');
  const [graduationHall, setGraduationHall] = useState('');
  const [phaseDiscussions, setPhaseDiscussions] = useState([]);
  const [graduationDiscussions, setGraduationDiscussions] = useState([]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
  };

  const handleAddPhaseDiscussion = () => {
    if (!phaseDate ) {
      alert('الرجاء إدخال جميع البيانات المطلوبة');
      return;
    }

    const newDiscussion = {
      id: `phase-${Date.now()}`,
      date: phaseDate,
      time: phaseTime,
      hall: phaseHall,
      groups: [{
        name: '',
        time: phaseTime,
        hall: phaseHall,
        notes: '',
        type: 'normal'
      }]
    };

    setPhaseDiscussions([newDiscussion, ...phaseDiscussions]);
    setPhaseDate('');
   
  };

  const handleAddGraduationDiscussion = () => {
    if (!graduationDate || !graduationTime || !graduationHall) {
      alert('الرجاء إدخال جميع البيانات المطلوبة');
      return;
    }

    const newDiscussion = {
      id: `graduation-${Date.now()}`,
      date: graduationDate,
      time: graduationTime,
      hall: graduationHall,
      groups: [{
        name: '',
        time: graduationTime,
        hall: graduationHall,
        notes: '',
        type: 'normal'
      }]
    };

    setGraduationDiscussions([newDiscussion, ...graduationDiscussions]);
    setGraduationDate('');
    setGraduationTime('');
    setGraduationHall('');
  };

  const handleDeleteDiscussion = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المناقشة؟')) {
      if (id.startsWith('phase')) {
        setPhaseDiscussions(phaseDiscussions.filter(disc => disc.id !== id));
      } else {
        setGraduationDiscussions(graduationDiscussions.filter(disc => disc.id !== id));
      }
    }
  };

  const handleAddPhaseRow = (discussionId) => {
    const discussion = phaseDiscussions.find(disc => disc.id === discussionId);
    if (discussion) {
      const newGroup = {
        name: '',
        time: discussion.time,
        hall: discussion.hall,
        notes: '',
        type: 'normal'
      };
      
      const updatedDiscussions = phaseDiscussions.map(disc => {
        if (disc.id === discussionId) {
          return {
            ...disc,
            groups: [...disc.groups, newGroup]
          };
        }
        return disc;
      });
      
      setPhaseDiscussions(updatedDiscussions);
    }
  };

  const handleAddGraduationRow = (discussionId) => {
    const discussion = graduationDiscussions.find(disc => disc.id === discussionId);
    if (discussion) {
      const newGroup = {
        name: '',
        time: discussion.time,
        hall: discussion.hall,
        notes: '',
        type: 'normal'
      };
      
      const updatedDiscussions = graduationDiscussions.map(disc => {
        if (disc.id === discussionId) {
          return {
            ...disc,
            groups: [...disc.groups, newGroup]
          };
        }
        return disc;
      });
      
      setGraduationDiscussions(updatedDiscussions);
    }
  };

  const handleSaveDiscussion = (discussionId) => {
    if (discussionId.startsWith('phase')) {
      alert('تم حفظ المناقشة المرحلية بنجاح');
    } else {
      alert('تم حفظ مناقشة التخرج بنجاح');
    }
  };

  const handleGroupChange = (discussionId, groupIndex, field, value) => {
    if (discussionId.startsWith('phase')) {
      const updatedDiscussions = phaseDiscussions.map(disc => {
        if (disc.id === discussionId) {
          const updatedGroups = [...disc.groups];
          updatedGroups[groupIndex] = {
            ...updatedGroups[groupIndex],
            [field]: value
          };
          return {
            ...disc,
            groups: updatedGroups
          };
        }
        return disc;
      });
      setPhaseDiscussions(updatedDiscussions);
    } else {
      const updatedDiscussions = graduationDiscussions.map(disc => {
        if (disc.id === discussionId) {
          const updatedGroups = [...disc.groups];
          updatedGroups[groupIndex] = {
            ...updatedGroups[groupIndex],
            [field]: value
          };
          return {
            ...disc,
            groups: updatedGroups
          };
        }
        return disc;
      });
      setGraduationDiscussions(updatedDiscussions);
    }
  };

  return (
    <div className="container">
      <h1>نظام إدارة المناقشات الجامعية</h1>

      {/* Tabs Navigation */}
      <div className="tabs-container">
        <div className="tabs-group" role="group">
          <button
            type="button"
            className={`tabb-btn ${activeTab === 'phase' ? 'active' : ''}`}
            onClick={() => setActiveTab('phase')}
          >
            <i className="fas fa-calendar-alt"></i> المناقشات المرحلية
          </button>
          <button
            type="button"
            className={`tabb-btn ${activeTab === 'graduation' ? 'active' : ''}`}
            onClick={() => setActiveTab('graduation')}
          >
            <i className="fas fa-graduation-cap"></i> مناقشات التخرج
          </button>
        </div>
      </div>

      {/* Phase Discussions Section */}
      {activeTab === 'phase' && (
        <div className="fade-in">
          {/* Date Selection */}
          <div className="section">
            <h2>تحديد تاريخ المناقشة المرحلية</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phaseDate">التاريخ</label>
                <input
                  type="date"
                  id="phaseDate"
                  value={phaseDate}
                  onChange={(e) => setPhaseDate(e.target.value)}
                />
              </div>
             
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button className="btn btn-blue" onClick={handleAddPhaseDiscussion}>
                  <i className="fas fa-plus"></i> إضافة مناقشة
                </button>
              </div>
            </div>
          </div>

          {/* Phase Discussions Table */}
          <div className="section">
            <h2>جدول المناقشات المرحلية</h2>
            <div id="phaseDiscussionsContainer">
              {phaseDiscussions.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-calendar-times"></i>
                  <p>لا توجد مناقشات مرحلية مضافة بعد</p>
                </div>
              ) : (
                phaseDiscussions.map((discussion) => (
                  <div key={discussion.id} className="discussion-table">
                    <div className="table-header phase-header">
                      <h3>مناقشة مرحلية - {formatDate(discussion.date)}</h3>
                      <button
                        onClick={() => handleDeleteDiscussion(discussion.id)}
                        className="delete-btn"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>اسم المجموعة</th>
                            <th>وقت المناقشة</th>
                            <th>القاعة</th>
                            <th>ملاحظات</th>
                            <th>النوع</th>
                          </tr>
                        </thead>
                        <tbody>
                          {discussion.groups.map((group, index) => (
                            <tr key={index}>
                              <td>
                                <input
                                  type="text"
                                  className="table-input"
                                  placeholder="اسم المجموعة"
                                  value={group.name}
                                  onChange={(e) =>
                                    handleGroupChange(discussion.id, index, 'name', e.target.value)
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="time"
                                  className="table-input"
                                  value={group.time}
                                  onChange={(e) =>
                                    handleGroupChange(discussion.id, index, 'time', e.target.value)
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="table-input"
                                  value={group.hall}
                                  onChange={(e) =>
                                    handleGroupChange(discussion.id, index, 'hall', e.target.value)
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
                                    handleGroupChange(discussion.id, index, 'notes', e.target.value)
                                  }
                                ></textarea>
                              </td>
                              <td>
                                <select
                                  className="table-select"
                                  value={group.type}
                                  onChange={(e) =>
                                    handleGroupChange(discussion.id, index, 'type', e.target.value)
                                  }
                                >
                                  <option value="normal">عادية</option>
                                  <option value="urgent">عاجلة</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="table-footer">
                      <button
                        onClick={() => handleAddPhaseRow(discussion.id)}
                        className="btn-add-row"
                      >
                        <i className="fas fa-plus"></i> إضافة صف
                      </button>
                      <button
                        onClick={() => handleSaveDiscussion(discussion.id)}
                        className="btn-save"
                      >
                        <i className="fas fa-save"></i> حفظ
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Graduation Discussions Section */}
      {activeTab === 'graduation' && (
        <div className="fade-in">
          {/* Date Selection */}
          <div className="section">
            <h2>تحديد تاريخ مناقشة التخرج</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="graduationDate">التاريخ</label>
                <input
                  type="date"
                  id="graduationDate"
                  value={graduationDate}
                  onChange={(e) => setGraduationDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="graduationTime">الوقت</label>
                <input
                  type="time"
                  id="graduationTime"
                  value={graduationTime}
                  onChange={(e) => setGraduationTime(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="graduationHall">القاعة</label>
                <input
                  type="text"
                  id="graduationHall"
                  placeholder="أدخل اسم القاعة"
                  value={graduationHall}
                  onChange={(e) => setGraduationHall(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button className="btn btn-green" onClick={handleAddGraduationDiscussion}>
                  <i className="fas fa-plus"></i> إضافة مناقشة
                </button>
              </div>
            </div>
          </div>

          {/* Graduation Discussions Table */}
          <div className="section">
            <h2>جدول مناقشات التخرج</h2>
            <div id="graduationDiscussionsContainer">
              {graduationDiscussions.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-graduation-cap"></i>
                  <p>لا توجد مناقشات تخرج مضافة بعد</p>
                </div>
              ) : (
                graduationDiscussions.map((discussion) => (
                  <div key={discussion.id} className="discussion-table">
                    <div className="table-header graduation-header">
                      <h3>مناقشة تخرج - {formatDate(discussion.date)}</h3>
                      <button
                        onClick={() => handleDeleteDiscussion(discussion.id)}
                        className="delete-btn"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>اسم المجموعة</th>
                            <th>وقت المناقشة</th>
                            <th>القاعة</th>
                            <th>ملاحظات</th>
                            <th>النوع</th>
                          </tr>
                        </thead>
                        <tbody>
                          {discussion.groups.map((group, index) => (
                            <tr key={index}>
                              <td>
                                <input
                                  type="text"
                                  className="table-input"
                                  placeholder="اسم المجموعة"
                                  value={group.name}
                                  onChange={(e) =>
                                    handleGroupChange(discussion.id, index, 'name', e.target.value)
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="time"
                                  className="table-input"
                                  value={group.time}
                                  onChange={(e) =>
                                    handleGroupChange(discussion.id, index, 'time', e.target.value)
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="table-input"
                                  value={group.hall}
                                  onChange={(e) =>
                                    handleGroupChange(discussion.id, index, 'hall', e.target.value)
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
                                    handleGroupChange(discussion.id, index, 'notes', e.target.value)
                                  }
                                ></textarea>
                              </td>
                              <td>
                                <select
                                  className="table-select"
                                  value={group.type}
                                  onChange={(e) =>
                                    handleGroupChange(discussion.id, index, 'type', e.target.value)
                                  }
                                >
                                  <option value="normal">عادية</option>
                                  <option value="urgent">عاجلة</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="table-footer">
                      <button
                        onClick={() => handleAddGraduationRow(discussion.id)}
                        className="btn-add-row"
                      >
                        <i className="fas fa-plus"></i> إضافة صف
                      </button>
                      <button
                        onClick={() => handleSaveDiscussion(discussion.id)}
                        className="btn-save"
                      >
                        <i className="fas fa-save"></i> حفظ
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionsCoordinator;