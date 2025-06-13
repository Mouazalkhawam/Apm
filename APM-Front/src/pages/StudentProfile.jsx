import React, { useState, useEffect } from 'react';
import './StudentProfile.css';
import Header from '../components/Header/Header';
import axios from 'axios';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useNavigate } from 'react-router-dom';

const animatedComponents = makeAnimated();

const StudentProfile = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTasksPage, setShowTasksPage] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post('http://127.0.0.1:8000/api/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      // Clear local storage and redirect to login
      localStorage.clear();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout even if API call fails
      localStorage.clear();
      navigate('/login');
    }
  };

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
        handleLogout={handleLogout}
      />

      <div className="container-profile">
        <div className="profile-container">
          <ProfileSidebar 
            studentData={studentData}
          />

          <div className="profile-content">
            <StatsCard />
            <ProjectsCard 
              setShowTasksPage={setShowTasksPage} 
              setShowProjectModal={setShowProjectModal}
            />
            {showTasksPage && <TasksPage setShowTasksPage={setShowTasksPage} projectId={showTasksPage} />}
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
              <span>{studentData.student?.gpa || '0.00'}</span> من 4
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

const StatsCard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://127.0.0.1:8000/api/tasks/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setStats({
          totalTasks: response.data.total_tasks,
          completedTasks: response.data.completed_tasks,
          inProgressTasks: response.data.total_tasks - response.data.completed_tasks
        });
      } catch (err) {
        setError('فشل في تحميل إحصائيات المهام');
        console.error('Error fetching task stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskStats();
  }, []);

  if (loading) {
    return (
      <div className="card animate delay-2">
        <div className="card-header">
          <h2 className="card-title">إحصائياتي</h2>
        </div>
        <div className="card-body">
          <div className="loading-spinner">جاري تحميل الإحصائيات...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card animate delay-2">
        <div className="card-header">
          <h2 className="card-title">إحصائياتي</h2>
        </div>
        <div className="card-body">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate delay-2">
      <div className="card-header">
        <h2 className="card-title">إحصائياتي</h2>
      </div>
      <div className="card-body">
        <div className="stats-grid-profile">
          <div className="stat-card-profile">
            <i className="fas fa-project-diagram stat-icon"></i>
            <div className="stat-value">{stats.totalTasks}</div>
            <div className="stat-label">المهام الكلية</div>
          </div>
          <div className="stat-card-profile">
            <i className="fas fa-check-circle stat-icon"></i>
            <div className="stat-value">{stats.completedTasks}</div>
            <div className="stat-label">مهام مكتملة</div>
          </div>
          <div className="stat-card-profile">
            <i className="fas fa-clock stat-icon"></i>
            <div className="stat-value">{stats.inProgressTasks}</div>
            <div className="stat-label">مهام قيد العمل</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectsCard = ({ setShowTasksPage, setShowProjectModal }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentProjects = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://127.0.0.1:8000/api/student/projects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setProjects(response.data.data);
      } catch (err) {
        setError('فشل في تحميل المشاريع');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProjects();
  }, []);

  const calculateDaysRemaining = (endDate) => {
    const today = new Date();
    const dueDate = new Date(endDate);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateProgress = (project) => {
    return Math.floor(Math.random() * 50) + 50;
  };

  if (loading) {
    return (
      <div className="card animate delay-3">
        <div className="card-header">
          <h2 className="card-title">مشاريعي الحالية</h2>
        </div>
        <div className="card-body">
          <div className="loading-spinner">جاري تحميل المشاريع...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card animate delay-3">
        <div className="card-header">
          <h2 className="card-title">مشاريعي الحالية</h2>
        </div>
        <div className="card-body">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate delay-3">
      <div className="card-header">
        <h2 className="card-title">مشاريعي الحالية</h2>
        <button 
          className="btn-profile btn-primary-profile btn-sm" 
          onClick={() => setShowProjectModal(true)}
        >
          <i className="fas fa-plus"></i> مشروع جديد
        </button>
      </div>
      <div className="card-body">
        <div className="projects-grid-profile">
          {projects.length > 0 ? (
            projects.map(project => {
              const daysRemaining = calculateDaysRemaining(project.enddate);
              const progress = calculateProgress(project);
              
              return (
                <div key={project.projectid} className="project-card">
                  <div className="project-header-profile">
                    <span>{project.type === 'graduation' ? 'مشروع التخرج' : 'مشروع فصلي'}</span>
                    <span className={`project-status ${
                      project.status === 'completed' ? 'completed' : 
                      project.status === 'in_progress' ? 'in-progress' : 'pending'
                    }`}>
                      {project.status === 'completed' ? 'مكتمل' : 
                       project.status === 'in_progress' ? 'قيد التنفيذ' : 'قيد الانتظار'}
                    </span>
                  </div>
                  <div className="project-body">
                    <h3 className="project-title-profile">{project.title}</h3>
                    <p className="project-description-profile">
                      {project.description || 'لا يوجد وصف للمشروع'}
                    </p>
                    <div className="project-deadline">
                      <i className="fas fa-clock"></i>
                      <span>{daysRemaining} يوم متبقي للتسليم</span>
                    </div>
                    <div className="project-progress">
                      <div className="progress-info">
                        <span>التقدم</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="progress-bar-profile">
                        <div 
                          className="progress-fill-profile" 
                          style={{width: `${progress}%`}}
                        ></div>
                      </div>
                    </div>
                    <div className="project-actions">
                      <button 
                        className="btn-profile btn-outline btn-sm"
                        onClick={() => {
                          localStorage.setItem('selectedGroupId', project.group.groupid);
                          window.location.href = '/group-project-management';
                        }}
                      >
                        <i className="fas fa-eye"></i> معاينة
                      </button>
                      <button 
                        className="btn-profile btn-primary-profile btn-sm" 
                        onClick={() => setShowTasksPage(project.projectid)} 
                      >
                        <i className="fas fa-tasks"></i> المهام
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-projects">
              <i className="fas fa-folder-open"></i>
              <p>لا يوجد لديك مشاريع حالية</p>
            </div>
          )}

          <div className="add-project" onClick={() => setShowProjectModal(true)}>
            <i className="fas fa-plus-circle"></i>
            <h3>إضافة مشروع جديد</h3>
            <p>انقر هنا لبدء مشروع جديد</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TasksPage = ({ setShowTasksPage, projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectTitle, setProjectTitle] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        const response = await axios.get(
          `http://127.0.0.1:8000/api/student/projects/${projectId}/tasks`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setTasks(response.data.data);
          
          if (response.data.data.length > 0 && response.data.data[0].stage?.project) {
            setProjectTitle(response.data.data[0].stage.project.title);
          } else {
            const projectsResponse = await axios.get(
              'http://127.0.0.1:8000/api/student/projects',
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            const project = projectsResponse.data.data.find(p => p.projectid == projectId);
            if (project) {
              setProjectTitle(project.title);
            }
          }
        }
      } catch (err) {
        setError('فشل في تحميل مهام المشروع');
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
  };

  if (loading) {
    return (
      <div className="card animate delay-4" id="tasksPage">
        <div className="card-body">
          <div className="loading-spinner">جاري تحميل المهام...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card animate delay-4" id="tasksPage">
        <div className="card-body">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate delay-4" id="tasksPage">
      <div className="card-body">
        <div className="tasks-header">
          <h2 className="tasks-title">مهام مشروع: {projectTitle || 'غير معروف'}</h2>
          <button 
            className="create-project-btn" 
            onClick={() => setShowTasksPage(false)}
          >
            <i className="fas fa-arrow-right"></i> العودة للمشاريع
          </button>
        </div>

        <div className="task-list">
          {tasks.length > 0 ? (
            tasks.map(task => (
              <div key={task.id} className="task-item">
                <input 
                  type="checkbox" 
                  className="task-checkbox" 
                  checked={task.status === 'completed'}
                  onChange={() => {}}
                />
                <div className="task-details">
                  <h3 className="task-title">{task.title}</h3>
                  <p className="task-description">{task.description || 'لا يوجد وصف للمهمة'}</p>
                  <p className="task-date-profile">
                    <i className="fas fa-calendar-alt"></i>
                    مستحق: {formatDate(task.due_date)}
                  </p>
                  {task.stage && (
                    <p className="task-stage">
                      <i className="fas fa-layer-group"></i>
                      المرحلة: {task.stage.title}
                    </p>
                  )}
                  {task.assigner && (
                    <p className="task-assigner">
                      <i className="fas fa-user-tie"></i>
                      المسند من: {task.assigner.name}
                    </p>
                  )}
                </div>
                <span className={`task-priority ${getPriorityClass(task.priority)}`}>
                  {task.priority === 'high' ? 'عالي' : 
                   task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                </span>
              </div>
            ))
          ) : (
            <div className="no-tasks">
              <i className="fas fa-tasks"></i>
              <p>لا توجد مهام مسندة لك في هذا المشروع</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AchievementsCard = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://127.0.0.1:8000/api/honor-board/achievements', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setAchievements(response.data.data);
        } else {
          setError('فشل في تحميل الإنجازات');
        }
      } catch (err) {
        setError('حدث خطأ أثناء جلب الإنجازات');
        console.error('Error fetching achievements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="card animate delay-5">
        <div className="card-header">
          <h2 className="card-title">إنجازاتي الأكاديمية</h2>
        </div>
        <div className="card-body">
          <div className="loading-spinner">جاري تحميل الإنجازات...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card animate delay-5">
        <div className="card-header">
          <h2 className="card-title">إنجازاتي الأكاديمية</h2>
        </div>
        <div className="card-body">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate delay-5">
      <div className="card-header">
        <h2 className="card-title">إنجازاتي الأكاديمية</h2>
      </div>
      <div className="card-body">
        <div className="achievements-grid">
          {achievements.length > 0 ? (
            achievements.map((achievement, index) => (
              <div key={index} className="achievement-item">
                <div className="achievement-icon">
                  <i className="fas fa-trophy"></i>
                </div>
                <div className="achievement-info">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.notes || 'إنجاز أكاديمي مميز'}</p>
                  <div className="achievement-meta">
                    <span className="achievement-date">
                      <i className="fas fa-calendar-alt achievement-date-icon"></i>
                      {new Date(achievement.featured_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-achievements">
              <i className="fas fa-trophy"></i>
              <p>لا توجد إنجازات مسجلة حتى الآن</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProjectModal = ({ setShowProjectModal }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'semester',
    students: [],
    supervisors: []
  });
  const [studentsOptions, setStudentsOptions] = useState([]);
  const [supervisorsOptions, setSupervisorsOptions] = useState([]);
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
        
        const formattedStudents = (studentsResponse.data.data || []).map(student => ({
          value: student.studentId,
          label: `${student.name}`
        }));
        
        const formattedSupervisors = (supervisorsResponse.data.data || []).map(supervisor => ({
          value: supervisor.supervisorId,
          label: `${supervisor.name}`
        }));
        
        setStudentsOptions(formattedStudents);
        setSupervisorsOptions(formattedSupervisors);
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

  const handleStudentsChange = (selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      students: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));
  };

  const handleSupervisorsChange = (selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      supervisors: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      
      const requestData = {
        title: formData.title,
        description: formData.description || null,
        students: formData.students,
        supervisors: formData.supervisors,
        type: formData.type
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
        window.location.reload();
      } else {
        throw new Error(response.data.message || 'فشل في إنشاء المشروع');
      }
    } catch (err) {
      console.error('Error details:', err);
      let errorMessage = 'حدث خطأ أثناء إنشاء المشروع';
      
      if (err.response?.data?.errors) {
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
    <div className="modal-overlay-profile">
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
            <label>نوع المشروع *</label>
            <select
              className="form-input-profile"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              <option value="semester">مشروع فصلي</option>
              <option value="graduation">مشروع تخرج</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>اختر الطلاب *</label>
            <Select
              closeMenuOnSelect={false}
              components={animatedComponents}
              isMulti
              options={studentsOptions}
              onChange={handleStudentsChange}
              placeholder="ابحث واختر الطلاب..."
              noOptionsMessage={() => "لا توجد خيارات متاحة"}
              className="react-select-container"
              classNamePrefix="react-select"
              isRtl={true}
              required
            />
          </div>

          <div className="form-group">
            <label>اختر المشرفين *</label>
            <Select
              closeMenuOnSelect={false}
              components={animatedComponents}
              isMulti
              options={supervisorsOptions}
              onChange={handleSupervisorsChange}
              placeholder="ابحث واختر المشرفين..."
              noOptionsMessage={() => "لا توجد خيارات متاحة"}
              className="react-select-container"
              classNamePrefix="react-select"
              isRtl={true}
              required
            />
          </div>
          
          <button 
            className="btn-profile btn-primary-profile" 
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