import React, { useState, useEffect } from 'react';
import './StudentEvaluation.css';
import ProjectHeader from '../components/Header/ProjectHeader';
import axios from 'axios';

const StudentEvaluation = () => {
  const [activeTab, setActiveTab] = useState('students-evaluation');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [students, setStudents] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);
  const [criteria, setCriteria] = useState([]);
  const [loadingCriteria, setLoadingCriteria] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [loadingSupervisorCheck, setLoadingSupervisorCheck] = useState(true);
  
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
        const response = await axios.get(
          'http://127.0.0.1:8000/api/user',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          }
        );
        setCurrentUser(response.data);
      } catch (err) {
        console.error('Error fetching current user:', err);
        setError('حدث خطأ أثناء جلب بيانات المستخدم');
      } finally {
        setLoadingUser(false);
      }
    };

    if (accessToken) {
      fetchCurrentUser();
    } else {
      setLoadingUser(false);
    }
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

    if (accessToken) {
      fetchCriteria();
    }
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
          let studentsWithIds = response.data.data.map((student, index) => ({
            ...student,
            id: student.userId || student.id || `student-${index}`,
            uniqueKey: `student-${student.userId || student.id || index}`
          }));

          // Filter out current user if they are a student
          if (currentUser && currentUser.role === 'student') {
            studentsWithIds = studentsWithIds.filter(student => student.userId !== currentUser.userId);
          }

          setStudents(studentsWithIds);
        } else {
          setError('لا يوجد طلاب في هذه المجموعة');
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
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

  // Fetch supervisors when supervisor tab is active (filter out current user and only for students)
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
            let supervisorsWithIds = response.data.data.map((supervisor, index) => ({
              ...supervisor,
              id: supervisor.supervisorId || supervisor.id || `supervisor-${index}`,
              uniqueKey: `supervisor-${supervisor.supervisorId || supervisor.id || index}`
            }));

            setSupervisors(supervisorsWithIds);
          } else {
            setError('لا يوجد مشرفين لهذه المجموعة');
          }
        } catch (err) {
          if (err.response && err.response.status === 401) {
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
      setStudentRatings(prev => ({
        ...prev,
        [criteria]: value
      }));
    } else {
      setSupervisorRatings(prev => ({
        ...prev,
        [criteria]: value
      }));
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      // Submit each criteria rating separately
      const submissions = [
        {
          evaluated_user_id: selectedStudent,
          group_id: selectedGroupId,
          criteria_id: 1, // Teamwork criteria
          rate: studentRatings.teamwork
        },
        {
          evaluated_user_id: selectedStudent,
          group_id: selectedGroupId,
          criteria_id: 2, // Deadlines criteria
          rate: studentRatings.deadlines
        },
        {
          evaluated_user_id: selectedStudent,
          group_id: selectedGroupId,
          criteria_id: 3, // Work quality criteria
          rate: studentRatings.workQuality
        },
        {
          evaluated_user_id: selectedStudent,
          group_id: selectedGroupId,
          criteria_id: 4, // Initiative criteria
          rate: studentRatings.initiative
        }
      ];

      const requests = submissions.map(submission => 
        axios.post('http://127.0.0.1:8000/api/evaluations', submission, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })
      );

      const responses = await Promise.all(requests);

      if (responses.every(res => res.data)) {
        alert('تم إرسال تقييم الطالب بنجاح. شكرًا لك!');
        setStudentRatings({
          teamwork: 0,
          deadlines: 0,
          workQuality: 0,
          initiative: 0
        });
        setSelectedStudent(null);
      }
    } catch (err) {
      console.error('Error submitting evaluation:', err);
      alert('حدث خطأ أثناء إرسال التقييم: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSupervisorSubmit = async (e) => {
    e.preventDefault();
    try {
      // Submit each criteria rating separately
      const submissions = [
        {
          evaluated_user_id: selectedSupervisor,
          group_id: selectedGroupId,
          criteria_id: 1, // Supervision quality (using teamwork criteria ID as example)
          rate: supervisorRatings.supervisionQuality
        },
        {
          evaluated_user_id: selectedSupervisor,
          group_id: selectedGroupId,
          criteria_id: 2, // Technical support (using deadlines criteria ID as example)
          rate: supervisorRatings.technicalSupport
        },
        {
          evaluated_user_id: selectedSupervisor,
          group_id: selectedGroupId,
          criteria_id: 3, // Feedback quality (using work quality criteria ID as example)
          rate: supervisorRatings.feedback
        },
        {
          evaluated_user_id: selectedSupervisor,
          group_id: selectedGroupId,
          criteria_id: 4, // Availability (using initiative criteria ID as example)
          rate: supervisorRatings.availability
        }
      ];

      const requests = submissions.map(submission => 
        axios.post('http://127.0.0.1:8000/api/evaluations', submission, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })
      );

      const responses = await Promise.all(requests);

      if (responses.every(res => res.data)) {
        alert('تم إرسال تقييم المشرف بنجاح. شكرًا لك!');
        setSupervisorRatings({
          supervisionQuality: 0,
          technicalSupport: 0,
          feedback: 0,
          availability: 0
        });
        setSelectedSupervisor(null);
      }
    } catch (err) {
      console.error('Error submitting supervisor evaluation:', err);
      alert('حدث خطأ أثناء إرسال التقييم: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading || loadingCriteria || loadingUser || loadingSupervisorCheck) {
    return (
      <div className="evaluation-system">
        <ProjectHeader 
          title="إدارة المشروع"
          description={"لا يوجد وصف للمشروع"}
          teamMembers={0}
          startDate="01/01/2023"
          endDate="15/06/2023"
        />
        <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="loading-spinner"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="evaluation-system">
        <ProjectHeader 
          title="إدارة المشروع"
          description={"لا يوجد وصف للمشروع"}
          teamMembers={0}
          startDate="01/01/2023"
          endDate="15/06/2023"
        />
        <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="error-message">
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
      </div>
    );
  }

  return (
    <div className="evaluation-system">
      <ProjectHeader 
        title="إدارة المشروع"
        description={"لا يوجد وصف للمشروع"}
        teamMembers={students.length}
        startDate="01/01/2023"
        endDate="15/06/2023"
      />

      <div className="container">
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

        <div className={`tab-content ${activeTab === 'students-evaluation' ? 'active' : ''}`} id="students-evaluation">
          <h2 style={{ color: 'var(--gold)', marginBottom: '1.5rem', textAlign: 'center' }}>تقييم الطلاب المشاركين</h2>
          
          <div className="students-list">
            {students.length > 0 ? (
              students.map((student) => (
                <div 
                  className={`student-card ${selectedStudent === student.id ? 'selected' : ''}`} 
                  key={student.uniqueKey}
                >
                  <div className="student-info">
                    <div className="student-name">{student.name}</div>
                    <div className="student-role">{student.major || student.role || 'لا يوجد تخصص'}</div>
                    {student.is_leader && <div className="leader-badge">قائد المجموعة</div>}
                  </div>
                  <button 
                    className={`btn ${selectedStudent === student.id ? 'btn-gold active' : 'btn-gold'}`}
                    onClick={() => handleStudentSelect(student.id)}
                  >
                    {selectedStudent === student.id ? 'تم التحديد' : 'تقييم'}
                  </button>
                </div>
              ))
            ) : (
              <p className="no-data-message">لا يوجد طلاب متاحين للتقييم في هذه المجموعة</p>
            )}
          </div>

          {selectedStudent && (
            <div id="student-evaluation-form">
              <div className="evaluation-card gold-theme">
                <h3 className="card-title">
                  <span>تقييم الطالب: {students.find(s => s.id === selectedStudent)?.name}</span>
                </h3>
                
                <form id="student-evaluation" onSubmit={handleStudentSubmit}>
                  <div className="evaluation-item">
                    <label className="evaluation-label">
                      {criteria.find(c => c.criteria_id === 1)?.title || 'التعاون في الفريق'}
                      <span className="criteria-description"> ({criteria.find(c => c.criteria_id === 1)?.description || 'مدى المشاركة الفعالة في أنشطة الفريق'})</span>
                    </label>
                    <div className="rating-container">
                      <div className="rating-options">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <div 
                            key={`teamwork-${selectedStudent}-${value}`}
                            className={`rating-option ${studentRatings.teamwork >= value ? 'selected' : ''}`}
                            onClick={() => handleRatingSelect('teamwork', value, true)}
                          >
                            {value}
                          </div>
                        ))}
                      </div>
                      <span>من 5</span>
                    </div>
                  </div>

                  <div className="evaluation-item">
                    <label className="evaluation-label">
                      {criteria.find(c => c.criteria_id === 2)?.title || 'الالتزام بالمواعيد'}
                      <span className="criteria-description"> ({criteria.find(c => c.criteria_id === 2)?.description || 'التسليم في الوقت المحدد'})</span>
                    </label>
                    <div className="rating-container">
                      <div className="rating-options">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <div 
                            key={`deadlines-${selectedStudent}-${value}`}
                            className={`rating-option ${studentRatings.deadlines >= value ? 'selected' : ''}`}
                            onClick={() => handleRatingSelect('deadlines', value, true)}
                          >
                            {value}
                          </div>
                        ))}
                      </div>
                      <span>من 5</span>
                    </div>
                  </div>

                  <div className="evaluation-item">
                    <label className="evaluation-label">
                      {criteria.find(c => c.criteria_id === 3)?.title || 'جودة العمل'}
                      <span className="criteria-description"> ({criteria.find(c => c.criteria_id === 3)?.description || 'دقة وإتقان المهام المكلف بها'})</span>
                    </label>
                    <div className="rating-container">
                      <div className="rating-options">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <div 
                            key={`workQuality-${selectedStudent}-${value}`}
                            className={`rating-option ${studentRatings.workQuality >= value ? 'selected' : ''}`}
                            onClick={() => handleRatingSelect('workQuality', value, true)}
                          >
                            {value}
                          </div>
                        ))}
                      </div>
                      <span>من 5</span>
                    </div>
                  </div>

                  <div className="evaluation-item">
                    <label className="evaluation-label">
                      {criteria.find(c => c.criteria_id === 4)?.title || 'المبادرة'}
                      <span className="criteria-description"> ({criteria.find(c => c.criteria_id === 4)?.description || 'تقديم أفكار جديدة وتحمل المسؤوليات الإضافية'})</span>
                    </label>
                    <div className="rating-container">
                      <div className="rating-options">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <div 
                            key={`initiative-${selectedStudent}-${value}`}
                            className={`rating-option ${studentRatings.initiative >= value ? 'selected' : ''}`}
                            onClick={() => handleRatingSelect('initiative', value, true)}
                          >
                            {value}
                          </div>
                        ))}
                      </div>
                      <span>من 5</span>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-gold">إرسال التقييم</button>
                </form>
              </div>
            </div>
          )}
        </div>

        {!isSupervisor && (
          <div className={`tab-content ${activeTab === 'supervisor-evaluation' ? 'active' : ''}`} id="supervisor-evaluation">
            <h2 style={{ color: 'var(--purple)', marginBottom: '1.5rem', textAlign: 'center' }}>تقييم المشرفين على المشروع</h2>
            
            {loadingSupervisors ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>جاري تحميل بيانات المشرفين...</p>
              </div>
            ) : (
              <>
                <div className="supervisors-list">
                  {supervisors.length > 0 ? (
                    supervisors.map((supervisor) => (
                      <div 
                        className={`supervisor-card ${selectedSupervisor === supervisor.id ? 'selected' : ''}`} 
                        key={supervisor.uniqueKey}
                      >
                        <div className="supervisor-info">
                          <div className="supervisor-name">{supervisor.name}</div>
                          <div className="supervisor-department">{supervisor.department || 'لا يوجد قسم محدد'}</div>
                        </div>
                        <button 
                          className={`btn ${selectedSupervisor === supervisor.id ? 'btn-purple active' : 'btn-purple'}`}
                          onClick={() => handleSupervisorSelect(supervisor.id)}
                        >
                          {selectedSupervisor === supervisor.id ? 'تم التحديد' : 'تقييم المشرف'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="no-data-message">لا يوجد مشرفين متاحين للتقييم في هذه المجموعة</p>
                  )}
                </div>

                {selectedSupervisor && (
                  <div id="supervisor-evaluation-form">
                    <div className="evaluation-card purple-theme">
                      <h3 className="card-title">
                        <span>تقييم المشرف: {supervisors.find(s => s.id === selectedSupervisor)?.name}</span>
                      </h3>
                      
                      <form id="supervisor-evaluation-form-content" onSubmit={handleSupervisorSubmit}>
                        <div className="evaluation-item">
                          <label className="evaluation-label">
                            جودة الإشراف والمتابعة
                            <span className="criteria-description"> (مدى فعالية الإشراف والمتابعة المستمرة)</span>
                          </label>
                          <div className="rating-container">
                            <div className="rating-options">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <div 
                                  key={`supervisionQuality-${selectedSupervisor}-${value}`}
                                  className={`rating-option ${supervisorRatings.supervisionQuality >= value ? 'selected' : ''}`}
                                  onClick={() => handleRatingSelect('supervisionQuality', value, false)}
                                >
                                  {value}
                                </div>
                              ))}
                            </div>
                            <span>من 5</span>
                          </div>
                        </div>

                        <div className="evaluation-item">
                          <label className="evaluation-label">
                            الدعم الفني المقدم
                            <span className="criteria-description"> (جودة الدعم الفني والإرشادات المقدمة)</span>
                          </label>
                          <div className="rating-container">
                            <div className="rating-options">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <div 
                                  key={`technicalSupport-${selectedSupervisor}-${value}`}
                                  className={`rating-option ${supervisorRatings.technicalSupport >= value ? 'selected' : ''}`}
                                  onClick={() => handleRatingSelect('technicalSupport', value, false)}
                                >
                                  {value}
                                </div>
                              ))}
                            </div>
                            <span>من 5</span>
                          </div>
                        </div>

                        <div className="evaluation-item">
                          <label className="evaluation-label">
                            جودة الملاحظات والتغذية الراجعة
                            <span className="criteria-description"> (فائدة الملاحظات المقدمة ووضوحها)</span>
                          </label>
                          <div className="rating-container">
                            <div className="rating-options">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <div 
                                  key={`feedback-${selectedSupervisor}-${value}`}
                                  className={`rating-option ${supervisorRatings.feedback >= value ? 'selected' : ''}`}
                                  onClick={() => handleRatingSelect('feedback', value, false)}
                                >
                                  {value}
                                </div>
                              ))}
                            </div>
                            <span>من 5</span>
                          </div>
                        </div>

                        <div className="evaluation-item">
                          <label className="evaluation-label">
                            التوافر والاستجابة
                            <span className="criteria-description"> (سرعة الاستجابة والتوفر عند الحاجة)</span>
                          </label>
                          <div className="rating-container">
                            <div className="rating-options">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <div 
                                  key={`availability-${selectedSupervisor}-${value}`}
                                  className={`rating-option ${supervisorRatings.availability >= value ? 'selected' : ''}`}
                                  onClick={() => handleRatingSelect('availability', value, false)}
                                >
                                  {value}
                                </div>
                              ))}
                            </div>
                            <span>من 5</span>
                          </div>
                        </div>

                        <button type="submit" className="btn btn-purple">إرسال التقييم</button>
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