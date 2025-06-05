  import React, { useState, useEffect } from 'react';
  import './StudentProfile.css';
  import Header from '../components/Header/Header';
  import axios from 'axios';

  const StudentProfile = () => {
    const [showNotification, setShowNotification] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showTasksPage, setShowTasksPage] = useState(false);
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchStudentProfile = async () => {
        try {
          const token = localStorage.getItem('access_token');
          const response = await axios.get('http://127.0.0.1:8000/api/user', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          setStudentData(response.data);
        } catch (err) {
          setError('فشل في تحميل بيانات الطالب');
          console.error('Error fetching student profile:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchStudentProfile();

      // الكود الأصلي للتحريك
      const animateElements = document.querySelectorAll('.animate');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, { threshold: 0.1 });

      animateElements.forEach(el => observer.observe(el));

      document.querySelectorAll('.progress-fill').forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => bar.style.width = width, 300);
      });

      document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
          const taskItem = this.closest('.task-item');
          taskItem.style.opacity = this.checked ? '0.7' : '1';
        });
      });

      return () => animateElements.forEach(el => observer.unobserve(el));
    }, []);

    const toggleNotification = () => {
      setShowNotification(!showNotification);
      if (showChat) setShowChat(false);
    };

    const toggleChat = () => {
      setShowChat(!showChat);
      if (showNotification) setShowNotification(false);
    };

    if (loading) {
      return <div className="loading-spinner">جاري تحميل البيانات...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    if (!studentData) {
      return <div className="error-message">لا توجد بيانات للعرض</div>;
    }

    return (
      <div className="student-profile-container">
        <Header 
          showNotification={showNotification}
          showChat={showChat}
          toggleNotification={toggleNotification}
          toggleChat={toggleChat}
        />

        <div className="container-profile">
          <div className="profile-container">
            <ProfileSidebar 
              studentData={studentData}
            />

            <div className="profile-content">
              <StatsCard />

              <ProjectsCard 
                showTasksPage={showTasksPage}
                setShowTasksPage={setShowTasksPage}
                setShowProjectModal={setShowProjectModal}
              />

              {showTasksPage && <TasksPage setShowTasksPage={setShowTasksPage} />}

              <AchievementsCard />
            </div>
          </div>

          <footer>
            <p>© 2025 نظام إدارة المشاريع الأكاديمية. جميع الحقوق محفوظة.</p>
          </footer>
        </div>

        {showProjectModal && <ProjectModal setShowProjectModal={setShowProjectModal} />}
      </div>
    );
  };

  const ProfileSidebar = ({ studentData }) => {
    const getProfileImageUrl = () => {
      if (!studentData.profile_picture) {
        return null;
      }
      
      if (studentData.profile_picture.startsWith('http')) {
        return studentData.profile_picture;
      }
      
      if (studentData.profile_picture.includes('images/users/')) {
        return `http://127.0.0.1:8000/${studentData.profile_picture}`;
      }
      
      return studentData.profile_picture;
    };

    const profileImageUrl = getProfileImageUrl();

    const parseExperiences = () => {
      if (!studentData.student?.experience) return [];
      
      return studentData.student.experience.map(exp => {
        if (exp.type === 'text') {
          if (typeof exp.content === 'string' && !exp.content.startsWith('{')) {
            return {
              title: 'خبرة أكاديمية',
              date: 'بدون تاريخ',
              description: exp.content
            };
          }
          
          try {
            const content = typeof exp.content === 'string' ? JSON.parse(exp.content) : exp.content;
            return {
              title: content.title || 'خبرة أكاديمية',
              date: content.date || 'بدون تاريخ',
              description: content.description || exp.content
            };
          } catch (e) {
            return {
              title: 'خبرة أكاديمية',
              date: 'بدون تاريخ',
              description: exp.content
            };
          }
        }
        
        return {
          title: exp.type === 'image' ? 'صورة خبرة' : 'فيديو خبرة',
          date: 'بدون تاريخ',
          description: exp.type === 'image' ? 'صورة مرفوعة' : 'فيديو مرفوع'
        };
      });
    };

    return (
      <div className="profile-sidebar animate delay-1">
        <div className="profile-header">
          {profileImageUrl ? (
            <img 
              src={profileImageUrl}
              alt="صورة الطالب" 
              className="profile-pic" 
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'default-profile.png';
              }}
            />
          ) : (
            <div className="profile-pic-placeholder">
              <i className="fas fa-user-circle"></i>
            </div>
          )}
          <h2 className="profile-name">{studentData.name}</h2>
          <p className="profile-title">
            {studentData.student ? 
              ` ${studentData.student.major || 'بدون تخصص'} - السنة ${studentData.student.academic_year || 'غير محدد'}` 
              : 'طالب'
            }
          </p>
        </div>

        <div className="profile-info-section">
          <h3 className="info-title"><i className="fas fa-info-circle"></i> المعلومات الشخصية</h3>
          <div className="info-item">
            <i className="fas fa-id-card"></i>
            <div className="info-text">
              <p className="info-label">الرقم الجامعي</p>
              <p className="info-value">{studentData.student?.university_number || 'غير محدد'}</p>
            </div>
          </div>
          <div className="info-item">
            <i className="fas fa-envelope"></i>
            <div className="info-text">
              <p className="info-label">البريد الجامعي</p>
              <p className="info-value">{studentData.email}</p>
            </div>
          </div>
          <div className="info-item">
            <i className="fas fa-phone"></i>
            <div className="info-text">
              <p className="info-label">رقم الجوال</p>
              <p className="info-value">{studentData.phone || 'غير محدد'}</p>
            </div>
          </div>
          
          <div className="info-item">
            <i className="fas fa-chart-line"></i>
            <div className="info-text">
              <p className="info-label">المعدل التراكمي</p>
              <p className="info-value">
                <span>{studentData.student?.gpa || '0.00'}</span> من 5
              </p>
            </div>
          </div>
        </div>

        <div className="profile-info-section">
          <h3 className="info-title"><i className="fas fa-lightbulb"></i> المهارات</h3>
          <div className="skills-container">
            {studentData.student?.skills?.length > 0 ? (
              studentData.student.skills.map((skill, index) => (
                <div key={index} className="skill-tag">
                  {skill.name} <i className="fas fa-check" style={{marginRight:'5px'}}></i>
                </div>
              ))
            ) : (
              <p className="no-skills">لا توجد مهارات مسجلة</p>
            )}
          </div>  
        </div>

        <div className="profile-info-section">
          <h3 className="info-title"><i className="fas fa-briefcase"></i> الخبرات الأكاديمية</h3>
          {parseExperiences().length > 0 ? (
            parseExperiences().map((exp, index) => (
              <div key={index} className="experience-item">
                <div className="experience-header">
                  <h4 className="experience-title">{exp.title}</h4>
                  <span className="experience-date">{exp.date}</span>
                </div>
                <p className="experience-description">{exp.description}</p>
              </div>
            ))
          ) : (
            <p className="no-experiences">لا توجد خبرات مسجلة</p>
          )}
        </div>
      </div>
    );
  };

  const StatsCard = () => (
    <div className="card animate delay-2">
      <div className="card-header">
        <h2 className="card-title">إحصائياتي</h2>
      </div>
      <div className="card-body">
        <div className="stats-grid-profile">
          <div className="stat-card-profile">
            <i className="fas fa-project-diagram stat-icon"></i>
            <div className="stat-value">12</div>
            <div className="stat-label">المهام الكلية</div>
          </div>
          <div className="stat-card-profile">
            <i className="fas fa-check-circle stat-icon"></i>
            <div className="stat-value">5</div>
            <div className="stat-label">مهام مكتملة</div>
          </div>
          <div className="stat-card-profile">
            <i className="fas fa-clock stat-icon"></i>
            <div className="stat-value">7</div>
            <div className="stat-label">مهام قيد العمل</div>
          </div>
        </div>
      </div>
    </div>
  );

  const ProjectsCard = ({ setShowTasksPage, setShowProjectModal }) => (
    <div className="card animate delay-3">
      <div className="card-header">
        <h2 className="card-title">مشاريعي الحالية</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowProjectModal(true)}>
          <i className="fas fa-plus"></i> مشروع جديد
        </button>
      </div>
      <div className="card-body">
        <div className="projects-grid">
          <div className="project-card">
            <div className="project-header">
              <span>مشروع التخرج</span>
              <span className="project-status">قيد التنفيذ</span>
            </div>
            <div className="project-body">
              <h3 className="project-title">نظام إدارة المكتبة الرقمية</h3>
              <p className="project-description">نظام متكامل لإدارة الكتب والإعارة في المكتبة الجامعية مع لوحة تحكم متقدمة وواجهة مستخدم سهلة.</p>
              <div className="project-deadline">
                <i className="fas fa-clock"></i>
                <span>30 يوم متبقي للتسليم</span>
              </div>
              <div className="project-progress">
                <div className="progress-info">
                  <span>التقدم</span>
                  <span>82%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '82%'}}></div>
                </div>
              </div>
              <div className="project-actions">
                <button className="btn btn-outline btn-sm">
                  <i className="fas fa-eye"></i> معاينة
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowTasksPage(true)}>
                  <i className="fas fa-tasks"></i> المهام
                </button>
              </div>
            </div>
          </div>

          <div className="project-card">
            <div className="project-header">
              <span>مشروع فصلي</span>
              <span className="project-status">قيد التنفيذ</span>
            </div>
            <div className="project-body">
              <h3 className="project-title">روبوت الدردشة الذكية</h3>
              <p className="project-description">روبوت محادثة يعتمد على الذكاء الاصطناعي للرد على استفسارات الطلاب حول المقررات الدراسية.</p>
              <div className="project-deadline">
                <i className="fas fa-clock"></i>
                <span>45 يوم متبقي للتسليم</span>
              </div>
              <div className="project-progress">
                <div className="progress-info">
                  <span>التقدم</span>
                  <span>65%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '65%'}}></div>
                </div>
              </div>
              <div className="project-actions">
                <button className="btn btn-outline btn-sm">
                  <i className="fas fa-eye"></i> معاينة
                </button>
                <button className="btn btn-primary btn-sm">
                  <i className="fas fa-tasks"></i> المهام
                </button>
              </div>
            </div>
          </div>

          <div className="add-project" onClick={() => setShowProjectModal(true)}>
            <i className="fas fa-plus-circle"></i>
            <h3>إضافة مشروع جديد</h3>
            <p>انقر هنا لبدء مشروع جديد</p>
          </div>
        </div>
      </div>
    </div>
  );

  const TasksPage = ({ setShowTasksPage }) => (
    <div className="card animate delay-4" id="tasksPage">
      <div className="card-body">
        <div className="tasks-header">
          <h2 className="tasks-title">مهام مشروع: نظام إدارة المكتبة الرقمية</h2>
          <button className="create-project-btn" onClick={() => setShowTasksPage(false)}>
            <i className="fas fa-arrow-right"></i> العودة للمشاريع
          </button>
        </div>

        <div className="task-list">
          <div className="task-item">
            <input type="checkbox" className="task-checkbox" />
            <div className="task-details">
              <h3 className="task-title">تصميم واجهة المستخدم</h3>
              <p className="task-description">إنشاء واجهة المستخدم الرئيسية مع شريط التنقل والقوائم</p>
              <p className="task-date">
                <i className="fas fa-calendar-alt"></i>
                مستحق: 15/12/2023
              </p>
            </div>
            <span className="task-priority priority-high">عالي</span>
          </div>

          <div className="task-item">
            <input type="checkbox" className="task-checkbox" defaultChecked />
            <div className="task-details">
              <h3 className="task-title">إنشاء قاعدة البيانات</h3>
              <p className="task-description">تصميم الجداول الأساسية ونظم العلاقات بينها</p>
              <p className="task-date">
                <i className="fas fa-calendar-alt"></i>
                مستحق: 10/12/2023
              </p>
            </div>
            <span className="task-priority priority-high">عالي</span>
          </div>

          <div className="task-item">
            <input type="checkbox" className="task-checkbox" />
            <div className="task-details">
              <h3 className="task-title">برمجة نظام الإعارة</h3>
              <p className="task-description">تطبيق النظام الأساسي لعمليات الإعارة والإرجاع</p>
              <p className="task-date">
                <i className="fas fa-calendar-alt"></i>
                مستحق: 20/12/2023
              </p>
            </div>
            <span className="task-priority priority-medium">متوسط</span>
          </div>

          <div className="task-item">
            <input type="checkbox" className="task-checkbox" />
            <div className="task-details">
              <h3 className="task-title">إنشاء لوحة التحكم الإدارية</h3>
              <p className="task-description">تصميم الواجهة الإدارية لمدراء النظام</p>
              <p className="task-date">
                <i className="fas fa-calendar-alt"></i>
                مستحق: 25/12/2023
              </p>
            </div>
            <span className="task-priority priority-low">منخفض</span>
          </div>

          <div className="task-item">
            <input type="checkbox" className="task-checkbox" />
            <div className="task-details">
              <h3 className="task-title">كتابة الوثائق التقنية</h3>
              <p className="task-description">إعداد ملف التوثيق الخاص بالمشروع</p>
              <p className="task-date">
                <i className="fas fa-calendar-alt"></i>
                مستحق: 30/12/2023
              </p>
            </div>
            <span className="task-priority priority-medium">متوسط</span>
          </div>
        </div>
      </div>
    </div>
  );

  const AchievementsCard = () => (
    <div className="card animate delay-5">
      <div className="card-header">
        <h2 className="card-title">إنجازاتي الأكاديمية</h2>
      </div>
      <div className="card-body">
        <div className="achievements-grid">
          <div className="achievement-item">
            <div className="achievement-icon">
              <i className="fas fa-trophy"></i>
            </div>
            <div className="achievement-info">
              <h4> أفضل مشروع تخرج</h4>
              <p>مسابقة جامعة الشام الخاصة للتميز التقني 2023</p>
            </div>
          </div>

          <div className="achievement-item">
            <div className="achievement-icon">
              <i className="fas fa-medal"></i>
            </div>
            <div className="achievement-info">
              <h4>المركز الأول في المشاريع الفصلية</h4>
              <p>المشاريع الفصلية</p>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );

  const ProjectModal = ({ setShowProjectModal }) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      students: [],
      supervisors: [],
      startdate: new Date().toISOString().split('T')[0],
      enddate: ''
    });

    const [studentsList, setStudentsList] = useState([]);
    const [supervisorsList, setSupervisorsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchDropdownData = async () => {
        try {
          const token = localStorage.getItem('access_token');
          
          const [studentsResponse, supervisorsResponse] = await Promise.all([
            axios.get('http://127.0.0.1:8000/api/students', {
              headers: { 'Authorization': `Bearer ${token}` }
            }),
            axios.get('http://127.0.0.1:8000/api/supervisors', {
              headers: { 'Authorization': `Bearer ${token}` }
            })
          ]);
          
          setStudentsList(studentsResponse.data.data || []);
          setSupervisorsList(supervisorsResponse.data.data || []);
        } catch (err) {
          console.error('Error fetching dropdown data:', err);
          setError('فشل في تحميل قوائم الطلاب والمشرفين');
        }
      };

      fetchDropdownData();
    }, []);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSelectChange = (e) => {
      const { name, options } = e.target;
      const selectedValues = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
      
      setFormData(prev => ({
        ...prev,
        [name]: selectedValues
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('access_token');
        const currentUser = JSON.parse(localStorage.getItem('user'));
        
        

        // إعداد البيانات مع التحويل الصحيح للأنواع
        const requestData = {
          title: formData.title,
          description: formData.description || null,
          startdate: formData.startdate,
          enddate: formData.enddate || null,
          students: formData.students.map(Number),
          supervisors: formData.supervisors.map(Number)
        };

        const response = await axios.post(
          'http://127.0.0.1:8000/api/projects/create',
          requestData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          setShowProjectModal(false);
          // يمكنك هنا إضافة أي تفاعل بعد النجاح مثل تحديث قائمة المشاريع
          window.location.reload(); // أو استخدام state لإدارة المشاريع
        } else {
          throw new Error(response.data.message || 'فشل في إنشاء المشروع');
        }
      } catch (err) {
        console.error('Error details:', err);
        let errorMessage = 'حدث خطأ أثناء إنشاء المشروع';
        
        if (err.response?.data?.errors) {
          // معالجة أخطاء التحقق من الصحة من Laravel
          errorMessage = Object.values(err.response.data.errors)
            .flat()
            .join(', ');
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <span className="close-modal" onClick={() => setShowProjectModal(false)}>
            <i className="fas fa-times"></i>
          </span>
          <h2 className="modal-title">إنشاء مشروع جديد</h2>
          
          {error && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>اسم المشروع *</label>
              <input 
                type="text" 
                className="form-input-profile" 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="أدخل اسم المشروع"
              />
            </div>
            
            <div className="form-group">
              <label>وصف المشروع</label>
              <textarea 
                className="form-textarea" 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="أدخل وصف المشروع (اختياري)"
                rows="4"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>تاريخ البدء *</label>
              <input 
                type="date" 
                className="form-input-profile" 
                name="startdate"
                value={formData.startdate}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>تاريخ الانتهاء (اختياري)</label>
              <input 
                type="date" 
                className="form-input-profile" 
                name="enddate"
                value={formData.enddate}
                onChange={handleInputChange}
                min={formData.startdate}
              />
            </div>
            
            <div className="form-group">
              <label>اختر الطلاب (اختياري)</label>
              <select 
                className="form-input-profile"
                name="students"
                multiple
                onChange={handleSelectChange}
                size="4"
              >
                {studentsList.map(student => (
                  <option key={student.id} value={student.studentId}>
                    {student.name} - {student.university_number}
                  </option>
                ))}
              </select>
              <small className="form-text">اضغط مع الاستمرار على Ctrl لتحديد أكثر من طالب</small>
            </div>
            
            <div className="form-group">
              <label>اختر المشرفين *</label>
              <select 
                className="form-input-profile"
                name="supervisors"
                multiple
                onChange={handleSelectChange}
                required
                size="4"
              >
                {supervisorsList.map(supervisor => (
                  <option key={supervisor.id} value={supervisor.supervisorId}>
                    {supervisor.name} - {supervisor.department}
                  </option>
                ))}
              </select>
              <small className="form-text">اختر مشرف واحد على الأقل</small>
            </div>
            
            <button 
              className="btn btn-primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> جاري الإنشاء...
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i> إنشاء المشروع
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  };

  export default StudentProfile;