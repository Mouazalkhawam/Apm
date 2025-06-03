import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NewProjectForm.css';

const NewProjectForm = () => {
  // الحالات (States)
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisors, setSelectedSupervisors] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // جلب البيانات من الباكند
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // جلب قائمة الطلاب للقائمة المنسدلة
        const studentsResponse = await axios.get('/api/students', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        setStudents(studentsResponse.data || []);
        
        // جلب قائمة المشرفين للقائمة المنسدلة
        const supervisorsResponse = await axios.get('/api/supervisors', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        setSupervisors(supervisorsResponse.data || []);
        
      } catch (err) {
        setError('فشل في جلب البيانات من الخادم');
        console.error('حدث خطأ أثناء جلب البيانات:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // إضافة طالب إلى القائمة المختارة
  const addStudent = (studentId) => {
    if (!studentId) return;
    
    const student = students.find(s => s.id == studentId);
    if (student && !selectedStudents.some(s => s.id == studentId)) {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  // إضافة مشرف إلى القائمة المختارة
  const addSupervisor = (supervisorId) => {
    if (!supervisorId) return;
    
    const supervisor = supervisors.find(s => s.id == supervisorId);
    if (supervisor && !selectedSupervisors.some(s => s.id == supervisorId)) {
      setSelectedSupervisors([...selectedSupervisors, supervisor]);
    }
  };

  // إزالة طالب من القائمة المختارة
  const removeStudent = (studentId) => {
    setSelectedStudents(selectedStudents.filter(s => s.id !== studentId));
  };

  // إزالة مشرف من القائمة المختارة
  const removeSupervisor = (supervisorId) => {
    setSelectedSupervisors(selectedSupervisors.filter(s => s.id !== supervisorId));
  };

  // إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!projectName || !projectDesc || !startDate) {
      alert('الرجاء إكمال جميع الحقول المطلوبة');
      return;
    }
    
    if (selectedStudents.length === 0) {
      alert('الرجاء اختيار طلاب على الأقل للمشروع');
      return;
    }
    
    if (selectedSupervisors.length === 0) {
      alert('الرجاء اختيار مشرف على الأقل للمشروع');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/projects/create', {
        title: projectName,
        description: projectDesc,
        startdate: startDate,
        enddate: endDate || null,
        students: selectedStudents.map(s => s.id),
        supervisors: selectedSupervisors.map(s => s.id)
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      setShowSuccessModal(true);
    } catch (err) {
      setError('فشل في إنشاء المشروع');
      console.error('حدث خطأ أثناء إنشاء المشروع:', err);
    } finally {
      setLoading(false);
    }
  };

  // إعادة تعيين النموذج
  const resetForm = () => {
    setProjectName('');
    setProjectDesc('');
    setStartDate('');
    setEndDate('');
    setSelectedStudents([]);
    setSelectedSupervisors([]);
  };

  // إلغاء النموذج
  const handleCancel = () => {
    const confirmCancel = window.confirm('هل أنت متأكد من إلغاء إنشاء المشروع؟ سيتم فقدان جميع البيانات المدخلة.');
    if (confirmCancel) {
      resetForm();
    }
  };

  if (loading && students.length === 0 && supervisors.length === 0) {
    return <div className="loading">جاري تحميل البيانات...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>إعادة المحاولة</button>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="primary-bg">
        <div className="header-container">
          <div className="header-content">
            <h1 className="header-title">إنشاء مشروع جديد</h1>
            <div className="header-actions">
              <div className="profile-container">
                <div className="profile-avatar">
                  {localStorage.getItem('userName')?.charAt(0) || ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="project-form-container fade-in">
          <div className="form-header">
            <h2>معلومات المشروع الأساسية</h2>
          </div>

          <form onSubmit={handleSubmit} className="form-content">
            <div className="form-group">
              <label htmlFor="projectName">
                <i className="fas fa-project-diagram"></i> اسم المشروع
              </label>
              <input 
                type="text" 
                id="projectName" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="projectDesc">
                <i className="fas fa-align-left"></i> وصف المشروع
              </label>
              <textarea 
                id="projectDesc" 
                rows="5" 
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="startDate">
                <i className="fas fa-calendar-alt"></i> تاريخ البدء
              </label>
              <input 
                type="date" 
                id="startDate" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">
                <i className="fas fa-calendar-alt"></i> تاريخ الانتهاء (اختياري)
              </label>
              <input 
                type="date" 
                id="endDate" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-user-tie"></i> المشرفون
              </label>
              
              <div className="dropdown-selection">
                <select 
                  className="form-dropdown"
                  onChange={(e) => addSupervisor(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>اختر مشرف...</option>
                  {supervisors.map(supervisor => (
                    <option key={supervisor.id} value={supervisor.id}>
                      {supervisor.name} - {supervisor.specialization || 'غير محدد'}
                    </option>
                  ))}
                </select>
                
                <div className="selected-items">
                  <h4 className="selected-header">
                    <i className="fas fa-user-check"></i>
                    المشرفون المختارون:
                    <span className="selected-count">{selectedSupervisors.length}</span>
                  </h4>
                  <div className="selected-list">
                    {selectedSupervisors.length === 0 ? (
                      <p className="no-items">لم يتم اختيار أي مشرفين حتى الآن</p>
                    ) : (
                      <ul>
                        {selectedSupervisors.map(supervisor => (
                          <li key={supervisor.id} className="selected-item">
                            <span>{supervisor.name} - {supervisor.specialization || 'غير محدد'}</span>
                            <button 
                              className="remove-btn"
                              onClick={() => removeSupervisor(supervisor.id)}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-users"></i> الطلاب المشتركين
              </label>
              
              <div className="dropdown-selection">
                <select 
                  className="form-dropdown"
                  onChange={(e) => addStudent(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>اختر طالب...</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.student_id} - {student.major || 'غير محدد'}
                    </option>
                  ))}
                </select>
                
                <div className="selected-items">
                  <h4 className="selected-header">
                    <i className="fas fa-user-check"></i>
                    الطلاب المختارون:
                    <span className="selected-count">{selectedStudents.length}</span>
                  </h4>
                  <div className="selected-list">
                    {selectedStudents.length === 0 ? (
                      <p className="no-items">لم يتم اختيار أي طلاب حتى الآن</p>
                    ) : (
                      <ul>
                        {selectedStudents.map(student => (
                          <li key={student.id} className="selected-item">
                            <span>{student.name} - {student.student_id} - {student.major || 'غير محدد'}</span>
                            <button 
                              className="remove-btn"
                              onClick={() => removeStudent(student.id)}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="btn btn-cancel" disabled={loading}>
                <i className="fas fa-times"></i> إلغاء
              </button>
              <button type="submit" className="btn btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> جاري الحفظ...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i> إنشاء المشروع
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3 className="modal-title">تم بنجاح!</h3>
            <p className="modal-message">
              تم إنشاء المشروع "<span className="project-name">{projectName}</span>" بنجاح
            </p>
            <button 
              className="modal-close-btn"
              onClick={() => {
                setShowSuccessModal(false);
                resetForm();
              }}
            >
              <i className="fas fa-check"></i> تم
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewProjectForm;