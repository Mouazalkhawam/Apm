import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProjectHeader from '../components/Header/ProjectHeader';
import './StudentEvaluation.css';

const StudentEvaluation = () => {
  // States for data and UI
  const [activeTab, setActiveTab] = useState('students-evaluation');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [students, setStudents] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSupervisor, setIsSupervisor] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);
  const [loadingCriteria, setLoadingCriteria] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingSupervisorCheck, setLoadingSupervisorCheck] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Rating states
  const [studentRatings, setStudentRatings] = useState({
    teamwork: 0,
    deadlines: 0,
    workQuality: 0,
    initiative: 0
  });

  const [supervisorRatings, setSupervisorRatings] = useState({
    supervisionQuality: 0,
    technicalSupport: 0,
    feedback: 0,
    availability: 0
  });

  // Get data from localStorage
  const selectedGroupId = localStorage.getItem('selectedGroupId');
  const accessToken = localStorage.getItem('access_token');

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/user', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });
        setCurrentUser(response.data);
      } catch (err) {
        console.error('Error fetching current user:', err);
        setError('حدث خطأ أثناء جلب بيانات المستخدم');
      } finally {
        setLoadingUser(false);
      }
    };

    if (accessToken) fetchCurrentUser();
    else setLoadingUser(false);
  }, [accessToken]);

  // Check if user is supervisor for this group
  useEffect(() => {
    const checkSupervisorStatus = async () => {
      if (selectedGroupId && accessToken && !loadingUser) {
        try {
          const response = await axios.get(
            `http://127.0.0.1:8000/api/groups/${selectedGroupId}/is-supervisor`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
              }
            }
          );
          
          if (response.data.success) {
            setIsSupervisor(response.data.is_supervisor);
          }
        } catch (err) {
          console.error('Error checking supervisor status:', err);
        } finally {
          setLoadingSupervisorCheck(false);
        }
      }
    };

    checkSupervisorStatus();
  }, [selectedGroupId, accessToken, loadingUser]);

  // Fetch evaluation criteria
  useEffect(() => {
    const fetchCriteria = async () => {
      try {
        const response = await axios.get(
          'http://127.0.0.1:8000/api/evaluation-criteria',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          }
        );
        setCriteria(response.data);
      } catch (err) {
        console.error('Error fetching evaluation criteria:', err);
        setError('حدث خطأ أثناء جلب معايير التقييم');
      } finally {
        setLoadingCriteria(false);
      }
    };

    if (accessToken) fetchCriteria();
  }, [accessToken]);

  // Fetch students from API (filter out current user)
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/groups/${selectedGroupId}/students`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          }
        );

        if (response.data.success) {
          let studentsWithIds = response.data.data.map((student) => ({
            ...student,
            id: student.userId.toString(), // استخدام userId بدلاً من studentId
            uniqueKey: `student-${student.userId}`
          }));

          // Filter out current user if they are a student
          if (currentUser?.role === 'student') {
            studentsWithIds = studentsWithIds.filter(student => student.userId !== currentUser.userId);
          }

          setStudents(studentsWithIds);
        } else {
          setError('لا يوجد طلاب في هذه المجموعة');
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
        } else {
          setError('حدث خطأ أثناء جلب بيانات الطلاب');
        }
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedGroupId && accessToken && !loadingUser && !loadingSupervisorCheck) {
      fetchStudents();
    } else if (!accessToken) {
      setError('يجب تسجيل الدخول أولاً');
      setLoading(false);
    } else if (!selectedGroupId) {
      setError('لم يتم تحديد مجموعة');
      setLoading(false);
    }
  }, [selectedGroupId, accessToken, currentUser, loadingUser, loadingSupervisorCheck]);

  // Fetch supervisors when supervisor tab is active (only for students)
  useEffect(() => {
    const fetchSupervisors = async () => {
      if (activeTab === 'supervisor-evaluation' && selectedGroupId && !loadingUser && !isSupervisor) {
        setLoadingSupervisors(true);
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

          if (response.data.success) {
            let supervisorsWithIds = response.data.data.map((supervisor) => ({
              ...supervisor,
              id: supervisor.userId.toString(), // استخدام userId بدلاً من supervisorId
              uniqueKey: `supervisor-${supervisor.userId}`
            }));

            setSupervisors(supervisorsWithIds);
          } else {
            setError('لا يوجد مشرفين لهذه المجموعة');
          }
        } catch (err) {
          if (err.response?.status === 401) {
            setError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
          } else {
            setError('حدث خطأ أثناء جلب بيانات المشرفين');
          }
          console.error('Error fetching supervisors:', err);
        } finally {
          setLoadingSupervisors(false);
        }
      }
    };

    fetchSupervisors();
  }, [activeTab, selectedGroupId, accessToken, currentUser, loadingUser, isSupervisor]);

  // Handler functions
  const handleStudentSelect = (studentId) => {
    setSelectedStudent(studentId);
    setSelectedSupervisor(null);
    setStudentRatings({
      teamwork: 0,
      deadlines: 0,
      workQuality: 0,
      initiative: 0
    });
  };

  const handleSupervisorSelect = (supervisorId) => {
    setSelectedSupervisor(supervisorId);
    setSelectedStudent(null);
    setSupervisorRatings({
      supervisionQuality: 0,
      technicalSupport: 0,
      feedback: 0,
      availability: 0
    });
  };

  const handleRatingSelect = (criteria, value, isStudent) => {
    if (isStudent) {
      setStudentRatings(prev => ({ ...prev, [criteria]: value }));
    } else {
      setSupervisorRatings(prev => ({ ...prev, [criteria]: value }));
    }
  };

  const submitEvaluation = async (evaluatedId, ratings, isStudent) => {
    try {
      // تحويل ID إلى سلسلة نصية
      const evaluatedIdStr = evaluatedId.toString();
      
      const criteriaRange = isStudent ? [1, 4] : [5, 8];
      
      for (let i = criteriaRange[0]; i <= criteriaRange[1]; i++) {
        const criteriaKey = isStudent ? 
          Object.keys(ratings)[i - criteriaRange[0]] : 
          Object.keys(ratings)[i - criteriaRange[0]];
        
        const submission = {
          evaluated_user_id: evaluatedIdStr, // استخدام النص مباشرة
          group_id: selectedGroupId.toString(),
          criteria_id: i,
          rate: ratings[criteriaKey]
        };

        console.log('Submitting evaluation:', submission);

        await axios.post('http://127.0.0.1:8000/api/evaluations', submission, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      }

      return true;
    } catch (err) {
      console.error('Error submitting evaluation:', err.response?.data || err.message);
      throw err;
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!selectedStudent) {
        alert('يرجى اختيار طالب لتقييمه');
        return;
      }

      if (Object.values(studentRatings).some(rating => rating === 0)) {
        alert('يرجى تقييم جميع المعايير');
        return;
      }

      await submitEvaluation(selectedStudent, studentRatings, true);
      alert('تم إرسال تقييم الطالب بنجاح. شكرًا لك!');
      setStudentRatings({
        teamwork: 0,
        deadlines: 0,
        workQuality: 0,
        initiative: 0
      });
      setSelectedStudent(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.errors?.join(', ') || 
                      err.message;
      alert(`حدث خطأ أثناء إرسال التقييم: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSupervisorSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!selectedSupervisor) {
        alert('يرجى اختيار مشرف لتقييمه');
        return;
      }

      if (Object.values(supervisorRatings).some(rating => rating === 0)) {
        alert('يرجى تقييم جميع المعايير');
        return;
      }

      await submitEvaluation(selectedSupervisor, supervisorRatings, false);
      alert('تم إرسال تقييم المشرف بنجاح. شكرًا لك!');
      setSupervisorRatings({
        supervisionQuality: 0,
        technicalSupport: 0,
        feedback: 0,
        availability: 0
      });
      setSelectedSupervisor(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.errors?.join(', ') || 
                      err.message;
      alert(`حدث خطأ أثناء إرسال التقييم: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading || loadingCriteria || loadingUser || loadingSupervisorCheck) {
    return (
      <div className="evaluation-system">
        <ProjectHeader 
          title="نظام التقييم"
          description="قم بتقييم زملائك والمشرفين في المجموعة"
          teamMembers={students.length}
        />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="evaluation-system">
        <ProjectHeader 
          title="نظام التقييم"
          description="قم بتقييم زملائك والمشرفين في المجموعة"
          teamMembers={students.length}
        />
        <div className="error-container">
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
      </div>
    );
  }

  // Main render
  return (
    <div className="evaluation-system">
      <ProjectHeader 
        title="نظام التقييم"
        description="قم بتقييم زملائك والمشرفين في المجموعة"
        teamMembers={students.length}
      />

      <div className="evaluation-container">
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'students-evaluation' ? 'active' : ''}`}
            onClick={() => setActiveTab('students-evaluation')}
          >
            تقييم الطلاب
          </button>
          
          {!isSupervisor && (
            <button 
              className={`tab-btn ${activeTab === 'supervisor-evaluation' ? 'active' : ''}`}
              onClick={() => setActiveTab('supervisor-evaluation')}
            >
              تقييم المشرفين
            </button>
          )}
        </div>

        {/* Students Evaluation Tab */}
        <div className={`tab-content ${activeTab === 'students-evaluation' ? 'active' : ''}`}>
          <h2 className="section-title">تقييم الطلاب المشاركين</h2>
          
          <div className="evaluation-list">
            {students.length > 0 ? (
              students.map((student) => (
                <div 
                  className={`evaluation-card ${selectedStudent === student.id ? 'selected' : ''}`} 
                  key={student.uniqueKey}
                >
                  <div className="user-info">
                    <div className="user-name">{student.name}</div>
                    <div className="user-details">
                      {student.major || 'لا يوجد تخصص'}
                      {student.is_leader && <span className="badge">قائد المجموعة</span>}
                    </div>
                  </div>
                  <button 
                    className={`btn ${selectedStudent === student.id ? 'active' : ''}`}
                    onClick={() => handleStudentSelect(student.id)}
                  >
                    {selectedStudent === student.id ? 'تم التحديد' : 'تقييم'}
                  </button>
                </div>
              ))
            ) : (
              <p className="no-data">لا يوجد طلاب متاحين للتقييم في هذه المجموعة</p>
            )}
          </div>

          {selectedStudent && (
            <div className="evaluation-form">
              <div className="form-container">
                <h3 className="form-title">
                  تقييم الطالب: {students.find(s => s.id === selectedStudent)?.name}
                </h3>
                
                <form onSubmit={handleStudentSubmit}>
                  {[1, 2, 3, 4].map((criteriaId) => {
                    const criteriaData = criteria.find(c => c.criteria_id === criteriaId);
                    const criteriaKey = [
                      'teamwork',
                      'deadlines',
                      'workQuality',
                      'initiative'
                    ][criteriaId - 1];

                    return (
                      <div className="evaluation-item" key={`student-criteria-${criteriaId}`}>
                        <label className="evaluation-label">
                          {criteriaData?.title || `المعيار ${criteriaId}`}
                          <span className="criteria-description">
                            ({criteriaData?.description || 'لا يوجد وصف'})
                          </span>
                        </label>
                        <div className="rating-container">
                          <div className="rating-options">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <div 
                                key={`student-${criteriaId}-${value}`}
                                className={`rating-option ${studentRatings[criteriaKey] >= value ? 'selected' : ''}`}
                                onClick={() => handleRatingSelect(criteriaKey, value, true)}
                              >
                                {value}
                              </div>
                            ))}
                          </div>
                          <span>من 5</span>
                        </div>
                      </div>
                    );
                  })}

                  <button 
                    type="submit" 
                    className="btn submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Supervisors Evaluation Tab */}
        {!isSupervisor && (
          <div className={`tab-content ${activeTab === 'supervisor-evaluation' ? 'active' : ''}`}>
            <h2 className="section-title">تقييم المشرفين على المشروع</h2>
            
            {loadingSupervisors ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>جاري تحميل بيانات المشرفين...</p>
              </div>
            ) : (
              <>
                <div className="evaluation-list">
                  {supervisors.length > 0 ? (
                    supervisors.map((supervisor) => (
                      <div 
                        className={`evaluation-card ${selectedSupervisor === supervisor.id ? 'selected' : ''}`} 
                        key={supervisor.uniqueKey}
                      >
                        <div className="user-info">
                          <div className="user-name">{supervisor.name}</div>
                          <div className="user-details">
                            {supervisor.department || 'لا يوجد قسم محدد'}
                          </div>
                        </div>
                        <button 
                          className={`btn ${selectedSupervisor === supervisor.id ? 'active' : ''}`}
                          onClick={() => handleSupervisorSelect(supervisor.id)}
                        >
                          {selectedSupervisor === supervisor.id ? 'تم التحديد' : 'تقييم'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">لا يوجد مشرفين متاحين للتقييم في هذه المجموعة</p>
                  )}
                </div>

                {selectedSupervisor && (
                  <div className="evaluation-form">
                    <div className="form-container">
                      <h3 className="form-title">
                        تقييم المشرف: {supervisors.find(s => s.id === selectedSupervisor)?.name}
                      </h3>
                      
                      <form onSubmit={handleSupervisorSubmit}>
                        {[5, 6, 7, 8].map((criteriaId) => {
                          const criteriaData = criteria.find(c => c.criteria_id === criteriaId);
                          const criteriaKey = [
                            'supervisionQuality',
                            'technicalSupport',
                            'feedback',
                            'availability'
                          ][criteriaId - 5];

                          return (
                            <div className="evaluation-item" key={`supervisor-criteria-${criteriaId}`}>
                              <label className="evaluation-label">
                                {criteriaData?.title || `المعيار ${criteriaId}`}
                                <span className="criteria-description">
                                  ({criteriaData?.description || 'لا يوجد وصف'})
                                </span>
                              </label>
                              <div className="rating-container">
                                <div className="rating-options">
                                  {[1, 2, 3, 4, 5].map((value) => (
                                    <div 
                                      key={`supervisor-${criteriaId}-${value}`}
                                      className={`rating-option ${supervisorRatings[criteriaKey] >= value ? 'selected' : ''}`}
                                      onClick={() => handleRatingSelect(criteriaKey, value, false)}
                                    >
                                      {value}
                                    </div>
                                  ))}
                                </div>
                                <span>من 5</span>
                              </div>
                            </div>
                          );
                        })}

                        <button 
                          type="submit" 
                          className="btn submit-btn"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentEvaluation;