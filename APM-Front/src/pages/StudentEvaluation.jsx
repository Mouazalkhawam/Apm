import React, { useState, useEffect } from 'react';
import './StudentEvaluation.css';
import ProjectHeader from '../components/Header/ProjectHeader';
import axios from 'axios';

const StudentEvaluation = () => {
  const [activeTab, setActiveTab] = useState('students-evaluation');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [workQuality, setWorkQuality] = useState(0);
  const [technicalSupport, setTechnicalSupport] = useState(0);
  const [students, setStudents] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);
  
  const [formValues, setFormValues] = useState({
    teamwork: '',
    deadlines: '',
    initiative: '',
    comments: '',
    supervisionQuality: '',
    feedback: '',
    availability: '',
    supervisorComments: ''
  });

  // Get data from localStorage
  const selectedGroupId = localStorage.getItem('selectedGroupId');
  const accessToken = localStorage.getItem('access_token');

  // Fetch students from API
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
          // Ensure each student has a unique ID and key
          const studentsWithIds = response.data.data.map((student, index) => ({
            ...student,
            id: student.userId || student.id || `temp-student-${index}`,
            uniqueKey: `student-${student.userId || student.id || index}`
          }));
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

    if (selectedGroupId && accessToken) {
      fetchStudents();
    } else if (!accessToken) {
      setError('يجب تسجيل الدخول أولاً');
      setLoading(false);
    } else {
      setError('لم يتم تحديد مجموعة');
      setLoading(false);
    }
  }, [selectedGroupId, accessToken]);

  // Fetch supervisors when supervisor tab is active
  useEffect(() => {
    const fetchSupervisors = async () => {
      if (activeTab === 'supervisor-evaluation' && selectedGroupId) {
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
            // Ensure each supervisor has a unique ID and key
            const supervisorsWithIds = response.data.data.map((supervisor, index) => ({
              ...supervisor,
              id: supervisor.supervisorId || supervisor.id || `temp-supervisor-${index}`,
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
  }, [activeTab, selectedGroupId, accessToken]);

  const handleStudentSelect = (studentId) => {
    setSelectedStudent(studentId);
    setSelectedSupervisor(null);
    setWorkQuality(0);
    setFormValues({
      ...formValues,
      teamwork: '',
      deadlines: '',
      initiative: '',
      comments: ''
    });
  };

  const handleSupervisorSelect = (supervisorId) => {
    setSelectedSupervisor(supervisorId);
    setSelectedStudent(null);
    setTechnicalSupport(0);
    setFormValues({
      ...formValues,
      supervisionQuality: '',
      feedback: '',
      availability: '',
      supervisorComments: ''
    });
  };

  const handleRatingSelect = (value, setter) => {
    setter(value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/evaluations',
        {
          evaluated_user_id: selectedStudent,
          group_id: selectedGroupId,
          criteria_id: 1,
          rate: workQuality,
          comments: formValues.comments,
          teamwork: formValues.teamwork,
          deadlines: formValues.deadlines,
          initiative: formValues.initiative
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        alert('تم إرسال تقييم الطالب بنجاح. شكرًا لك!');
        setFormValues({
          ...formValues,
          teamwork: '',
          deadlines: '',
          initiative: '',
          comments: ''
        });
        setWorkQuality(0);
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
      const response = await axios.post(
        'http://127.0.0.1:8000/api/evaluations',
        {
          evaluated_user_id: selectedSupervisor,
          group_id: selectedGroupId,
          criteria_id: 2,
          rate: technicalSupport,
          comments: formValues.supervisorComments,
          supervision_quality: formValues.supervisionQuality,
          feedback_quality: formValues.feedback,
          availability: formValues.availability
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        alert('تم إرسال تقييم المشرف بنجاح. شكرًا لك!');
        setFormValues({
          ...formValues,
          supervisionQuality: '',
          feedback: '',
          availability: '',
          supervisorComments: ''
        });
        setTechnicalSupport(0);
        setSelectedSupervisor(null);
      }
    } catch (err) {
      console.error('Error submitting supervisor evaluation:', err);
      alert('حدث خطأ أثناء إرسال التقييم: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="evaluation-system">
        <ProjectHeader 
          title="نظام التقييم"
          description={"تقييم أعضاء الفريق والمشرفين"}
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
          title="نظام التقييم"
          description={"تقييم أعضاء الفريق والمشرفين"}
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
        title="نظام التقييم"
        description={"تقييم أعضاء الفريق والمشرفين"}
      />

      <div className="container">
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'students-evaluation' ? 'active' : ''}`}
            onClick={() => setActiveTab('students-evaluation')}
          >
            تقييم الطلاب
          </button>
          <button 
            className={`tab-btn ${activeTab === 'supervisor-evaluation' ? 'active' : ''}`}
            onClick={() => setActiveTab('supervisor-evaluation')}
          >
            تقييم المشرفين
          </button>
        </div>

        <div className={`tab-content ${activeTab === 'students-evaluation' ? 'active' : ''}`}>
          <h2 className="section-title">تقييم الطلاب المشاركين</h2>
          
          <div className="students-list">
            {students.length > 0 ? (
              students.map((student) => (
                <div 
                  className={`student-card ${selectedStudent === student.id ? 'selected' : ''}`} 
                  key={student.uniqueKey}
                >
                  <div className="student-info">
                    <div className="student-name">{student.name}</div>
                    <div className="student-role">{student.major || 'لا يوجد تخصص'}</div>
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
              <p className="no-data-message">لا يوجد طلاب في هذه المجموعة</p>
            )}
          </div>

          {selectedStudent && (
            <div className="evaluation-form-container">
              <div className="evaluation-card gold-theme">
                <h3 className="card-title">
                  تقييم الطالب: {students.find(s => s.id === selectedStudent)?.name}
                </h3>
                
                <form className="evaluation-form" onSubmit={handleStudentSubmit}>
                  <div className="form-group">
                    <label>مستوى التعاون والعمل الجماعي</label>
                    <select
                      name="teamwork"
                      value={formValues.teamwork}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">اختر التقييم</option>
                      <option value="5">ممتاز - التعاون دائمًا وبناء</option>
                      <option value="4">جيد جدًا - متعاون معظم الوقت</option>
                      <option value="3">جيد - تعاون بشكل مقبول</option>
                      <option value="2">ضعيف - يحتاج لتحسين</option>
                      <option value="1">سيء - عدم تعاون</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>جودة العمل المقدم</label>
                    <div className="rating-container">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={`work-quality-${selectedStudent}-star-${star}`}
                          className={`star ${workQuality >= star ? 'filled' : ''}`}
                          onClick={() => setWorkQuality(star)}
                        >
                          ★
                        </span>
                      ))}
                      <span className="rating-text">{workQuality} من 5</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>الإلتزام بالمواعيد النهائية</label>
                    <select
                      name="deadlines"
                      value={formValues.deadlines}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">اختر التقييم</option>
                      <option value="5">دائمًا يلتزم بالمواعيد</option>
                      <option value="4">غالبًا يلتزم بالمواعيد</option>
                      <option value="3">أحيانًا يتأخر قليلاً</option>
                      <option value="2">غالبًا يتأخر</option>
                      <option value="1">دائمًا يتأخر</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>المبادرة وتحمل المسؤولية</label>
                    <select
                      name="initiative"
                      value={formValues.initiative}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">اختر التقييم</option>
                      <option value="5">قائد ويمتلك روح المبادرة</option>
                      <option value="4">يظهر مبادرات جيدة</option>
                      <option value="3">يقوم بما يُطلب منه</option>
                      <option value="2">يحتاج للتوجيه المستمر</option>
                      <option value="1">غير مسؤول</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>ملاحظات إضافية</label>
                    <textarea
                      name="comments"
                      value={formValues.comments}
                      onChange={handleInputChange}
                      placeholder="أي ملاحظات إضافية أو نقاط تستحق التقدير..."
                    ></textarea>
                  </div>

                  <button type="submit" className="submit-btn">إرسال التقييم</button>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className={`tab-content ${activeTab === 'supervisor-evaluation' ? 'active' : ''}`}>
          <h2 className="section-title">تقييم المشرفين على المشروع</h2>
          
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
                  <p className="no-data-message">لا يوجد مشرفين لهذه المجموعة</p>
                )}
              </div>

              {selectedSupervisor && (
                <div className="evaluation-form-container">
                  <div className="evaluation-card purple-theme">
                    <h3 className="card-title">
                      تقييم المشرف: {supervisors.find(s => s.id === selectedSupervisor)?.name}
                    </h3>
                    
                    <form className="evaluation-form" onSubmit={handleSupervisorSubmit}>
                      <div className="form-group">
                        <label>جودة الإشراف والمتابعة</label>
                        <select
                          name="supervisionQuality"
                          value={formValues.supervisionQuality}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">اختر التقييم</option>
                          <option value="5">إشراف ممتاز ومتابعة دقيقة</option>
                          <option value="4">إشراف جيد جدًا</option>
                          <option value="3">إشراف جيد</option>
                          <option value="2">إشراف مقبول</option>
                          <option value="1">إشراف ضعيف</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>الدعم الفني المقدم</label>
                        <div className="rating-container">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={`tech-support-${selectedSupervisor}-star-${star}`}
                              className={`star ${technicalSupport >= star ? 'filled' : ''}`}
                              onClick={() => setTechnicalSupport(star)}
                            >
                              ★
                            </span>
                          ))}
                          <span className="rating-text">{technicalSupport} من 5</span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>جودة الملاحظات والتغذية الراجعة</label>
                        <select
                          name="feedback"
                          value={formValues.feedback}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">اختر التقييم</option>
                          <option value="5">ملاحظات بناءة وقيمة للغاية</option>
                          <option value="4">ملاحظات جيدة ومفيدة</option>
                          <option value="3">ملاحظات مقبولة</option>
                          <option value="2">ملاحظات سطحية</option>
                          <option value="1">لا توجد ملاحظات</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>التوافر والاستجابة</label>
                        <select
                          name="availability"
                          value={formValues.availability}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">اختر التقييم</option>
                          <option value="5">دائمًا متاح ومستجيب بسرعة</option>
                          <option value="4">غالبًا متاح</option>
                          <option value="3">متاح في الأوقات المتفق عليها</option>
                          <option value="2">أحيانًا غير متاح</option>
                          <option value="1">صعب التواصل معه</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>ملاحظات إضافية</label>
                        <textarea
                          name="supervisorComments"
                          value={formValues.supervisorComments}
                          onChange={handleInputChange}
                          placeholder="أي ملاحظات إضافية أو اقتراحات للتحسين..."
                        ></textarea>
                      </div>

                      <button type="submit" className="submit-btn">إرسال التقييم</button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentEvaluation;