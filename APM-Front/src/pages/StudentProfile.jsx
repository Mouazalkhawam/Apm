import React, { useState, useEffect, useRef } from 'react';
import './StudentProfile.css';
import axios from 'axios';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';

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
      
      localStorage.clear();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.clear();
      navigate('/login');
    }
  };

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

  useEffect(() => {
    fetchStudentProfile();

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
            onProfileUpdate={fetchStudentProfile}
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

const ProfileSidebar = ({ studentData, onProfileUpdate }) => {
  const [showEditModal, setShowEditModal] = useState(false);

  const getProfileImageUrl = () => {
    if (!studentData.profile_picture) return null;
    
    if (studentData.profile_picture.startsWith('http')) return studentData.profile_picture;
    
    return studentData.profile_picture.includes('images/users/') 
      ? `http://127.0.0.1:8000/${studentData.profile_picture}`
      : studentData.profile_picture;
  };

  const profileImageUrl = getProfileImageUrl();

  const parseExperiences = () => {
    if (!studentData.student?.experience) return [];
    
    if (typeof studentData.student.experience === 'string') {
      return [{
        title: 'الخبرة الأكاديمية',
        date: 'بدون تاريخ',
        description: studentData.student.experience
      }];
    }
    
    if (Array.isArray(studentData.student.experience)) {
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
    }
    
    return [{
      title: 'الخبرة الأكاديمية',
      date: 'بدون تاريخ',
      description: 'لا توجد معلومات متاحة'
    }];
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
        <button 
          className="edit-profile-btn"
          onClick={() => setShowEditModal(true)}
        >
          <i className="fas fa-edit"></i> تعديل الملف الشخصي
        </button>
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

      {showEditModal && (
        <EditProfileModal 
          studentData={studentData}
          setShowEditModal={setShowEditModal}
          onProfileUpdate={onProfileUpdate}
        />
      )}
    </div>
  );
};

const EditProfileModal = ({ studentData, setShowEditModal, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    name: studentData.name || '',
    email: studentData.email || '',
    phone: studentData.phone || '',
    universityNumber: studentData.student?.university_number || '',
    major: studentData.student?.major || '',
    academicYear: studentData.student?.academic_year || '1',
    gpa: studentData.student?.gpa || '0.00',
    experience: studentData.student?.experience || '',
    password: '',
    confirmPassword: '',
    profile_picture: null,
    skills: studentData.student?.skills?.map(skill => skill.id) || []
  });
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(
    studentData.profile_picture 
      ? studentData.profile_picture.startsWith('http') 
        ? studentData.profile_picture 
        : `http://127.0.0.1:8000/${studentData.profile_picture}`
      : null
  );
  const [loading, setLoading] = useState(false);
  const [skillsOptions, setSkillsOptions] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        // جلب المهارات المتاحة من API
        const skillsResponse = await axios.get('http://127.0.0.1:8000/api/all-skills', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // جلب مهارات الطالب الحالية
        const studentSkillsResponse = await axios.get('http://127.0.0.1:8000/api/student/profile/skills', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setAvailableSkills(skillsResponse.data.data.map(skill => ({
          value: skill.id,
          label: skill.name
        })));

        setSkillsOptions(studentSkillsResponse.data.data.map(skill => ({
          value: skill.id,
          label: skill.name
        })));
      } catch (err) {
        console.error('Error fetching skills:', err);
      }
    };

    fetchSkills();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      skills: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({
        ...prev,
        profile_picture: file
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'الاسم مطلوب';
    if (!formData.email) newErrors.email = 'البريد الإلكتروني مطلوب';
    if (!formData.universityNumber) newErrors.universityNumber = 'الرقم الجامعي مطلوب';
    if (!formData.major) newErrors.major = 'التخصص مطلوب';
    
    if (formData.gpa && (isNaN(formData.gpa) || formData.gpa < 0 || formData.gpa > 4)) {
      newErrors.gpa = 'المعدل يجب أن يكون بين 0 و 4';
    }
    
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      if (formData.password) {
        formDataToSend.append('password', formData.password);
        formDataToSend.append('password_confirmation', formData.confirmPassword);
      }
      if (formData.profile_picture) formDataToSend.append('profile_picture', formData.profile_picture);
      formDataToSend.append('_method', 'PUT');
      
      const userResponse = await axios.post(
        'http://127.0.0.1:8000/api/profile/update',
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      const studentDataToSend = {
        university_number: formData.universityNumber,
        major: formData.major,
        academic_year: formData.academicYear,
        gpa: formData.gpa,
        experience: formData.experience,
        skills: formData.skills,
        _method: 'PUT' 
      };
      
      await axios.post(
        'http://127.0.0.1:8000/api/student/profile/update',
        studentDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      setShowEditModal(false);
      onProfileUpdate();
    } catch (err) {
      console.error('Update error:', err);
      if (err.response?.data?.errors) {
        const laravelErrors = err.response.data.errors;
        const formattedErrors = {};
        
        Object.keys(laravelErrors).forEach(key => {
          formattedErrors[key] = laravelErrors[key][0];
        });
        
        setErrors(formattedErrors);
      } else {
        setErrors({ submit: 'حدث خطأ أثناء تحديث الملف الشخصي' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay-profile">
      <div className="modal-content">
        <span className="close-modal" onClick={() => setShowEditModal(false)}>
          <i className="fas fa-times"></i>
        </span>
        <h2 className="modal-title">تعديل المعلومات الشخصية</h2>
        
        {errors.submit && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle"></i> {errors.submit}
          </div>
        )}
        
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-row">
            <div className="form-group-register half-width">
              <label htmlFor="name" className="form-label">الاسم الكامل</label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-input-profile-edit ${errors.name ? 'error' : ''}`}
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="الاسم الثلاثي"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group-register half-width">
              <label htmlFor="email" className="form-label">البريد الجامعي</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input-profile-edit ${errors.email ? 'error' : ''}`}
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@university.edu.sy"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group-register half-width">
              <label htmlFor="phone" className="form-label">رقم الجوال</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className={`form-input-profile-edit ${errors.phone ? 'error' : ''}`}
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="05XXXXXXXX"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
            
            <div className="form-group-register half-width">
              <label htmlFor="universityNumber" className="form-label">الرقم الجامعي</label>
              <input
                type="text"
                id="universityNumber"
                name="universityNumber"
                className={`form-input-profile-edit ${errors.universityNumber ? 'error' : ''}`}
                required
                value={formData.universityNumber}
                onChange={handleInputChange}
                placeholder="الرقم الجامعي"
              />
              {errors.universityNumber && <span className="error-message">{errors.universityNumber}</span>}
            </div>
            
            <div className="form-group-register half-width">
              <label htmlFor="major" className="form-label">التخصص</label>
              <input
                type="text"
                id="major"
                name="major"
                className={`form-input-profile-edit ${errors.major ? 'error' : ''}`}
                required
                value={formData.major}
                onChange={handleInputChange}
                placeholder="التخصص الدراسي"
              />
              {errors.major && <span className="error-message">{errors.major}</span>}
            </div>

            <div className="form-group-register half-width">
              <label htmlFor="academicYear" className="form-label">السنة الدراسية</label>
              <select
                id="academicYear"
                name="academicYear"
                className="form-input-profile-edit"
                required
                value={formData.academicYear}
                onChange={handleInputChange}
              >
                <option value="1">الأولى</option>
                <option value="2">الثانية</option>
                <option value="3">الثالثة</option>
                <option value="4">الرابعة</option>
                <option value="5">الخامسة</option>
              </select>
            </div>

            <div className="form-group-register half-width">
              <label htmlFor="gpa" className="form-label">المعدل التراكمي</label>
              <input
                type="number"
                id="gpa"
                name="gpa"
                step="0.01"
                min="0"
                max="4"
                className={`form-input-profile-edit ${errors.gpa ? 'error' : ''}`}
                value={formData.gpa}
                onChange={handleInputChange}
                placeholder="0.00 - 4.00"
              />
              {errors.gpa && <span className="error-message">{errors.gpa}</span>}
            </div>

            <div className="form-group-register half-width">
              <label htmlFor="experience" className="form-label">الخبرة الأكاديمية</label>
              <textarea
                id="experience"
                name="experience"
                className={`form-input-profile-edit ${errors.experience ? 'error' : ''}`}
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="أدخل خبراتك الأكاديمية"
                rows="3"
              ></textarea>
              {errors.experience && <span className="error-message">{errors.experience}</span>}
            </div>

            <div className="form-group-register half-width">
              <label htmlFor="skills" className="form-label">المهارات</label>
              <Select
                id="skills"
                name="skills"
                isMulti
                options={availableSkills}
                value={availableSkills.filter(option => formData.skills.includes(option.value))}
                onChange={handleSkillsChange}
                placeholder="اختر المهارات..."
                noOptionsMessage={() => "لا توجد مهارات متاحة"}
                className="react-select-container"
                classNamePrefix="react-select"
                isRtl={true}
              />
              {errors.skills && <span className="error-message">{errors.skills}</span>}
            </div>

            <div className="form-group-register half-width">
              <label htmlFor="password" className="form-label">كلمة المرور الجديدة</label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-input-profile-edit ${errors.password ? 'error' : ''}`}
                minLength="6"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="اتركه فارغًا إذا كنت لا تريد التغيير"
              />
              <small className="form-note">6 أحرف على الأقل</small>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group-register half-width">
              <label htmlFor="confirmPassword" className="form-label">تأكيد كلمة المرور</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`form-input-profile-edit ${errors.confirmPassword ? 'error' : ''}`}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="تأكيد كلمة المرور الجديدة"
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <div className="form-group-register">
              <label className="form-label">الصورة الشخصية</label>
              <div className="photo-upload" onClick={triggerFileInput}>
                {photoPreview ? (
                  <img src={photoPreview} alt="صورة الطالب" className="photo-preview" />
                ) : (
                  <>
                    <i className="fas fa-user-circle photo-icon"></i>
                    <p className="photo-text">انقر لرفع الصورة</p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  hidden
                  onChange={handlePhotoUpload}
                />
              </div>
            </div>
          </div>
          
          <button 
            className="btn-profile btn-primary-profile" 
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> جاري الحفظ...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> حفظ التغييرات
              </>
            )}
          </button>
        </form>
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