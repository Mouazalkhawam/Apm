import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProposalForm.css';
import Header from '../components/Header/Header';

const ProposalForm = () => {
  const navigate = useNavigate();
  const [projectType, setProjectType] = useState('term-project');
  const [formData, setFormData] = useState({
    title: '',
    problem_description: '',
    problem_background: '',
    problem_studies: '',
    solution_studies: '',
    proposed_solution: '',
    platform: '',
    tools: [],
    programming_languages: [],
    database: '',
    packages: '',
    management_plan: '',
    team_roles: '',
    functional_requirements: [],
    non_functional_requirements: [],
    technology_stack: [],
    problem_mindmap: null,
    experts: []
  });
  const [currentExpert, setCurrentExpert] = useState({
    name: '',
    phone: '',
    specialization: ''
  });
  const [groupid, setGroupid] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedGroupid = localStorage.getItem('selectedGroupId');
    
    if (!token) {
      navigate('/login');
    } else {
      setIsAuthenticated(true);
      setGroupid(storedGroupid);
      
      if (storedGroupid) {
        fetchProposalData(storedGroupid);
      } else {
        setIsLoading(false);
      }
    }
  }, [navigate]);

  const fetchProposalData = async (groupid) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`http://localhost:8000/api/proposals/group/${groupid}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        const proposalData = response.data;
        setProjectType(proposalData.project_type || 'term-project');
        setIsEditMode(true);
        
        setFormData({
          title: proposalData.title || '',
          problem_description: proposalData.problem_description || '',
          problem_background: proposalData.problem_background || '',
          problem_studies: proposalData.problem_studies || '',
          solution_studies: proposalData.solution_studies || '',
          proposed_solution: proposalData.proposed_solution || '',
          platform: proposalData.platform || '',
          tools: proposalData.tools || [],
          programming_languages: proposalData.programming_languages || [],
          database: proposalData.database || '',
          packages: proposalData.packages || '',
          management_plan: proposalData.management_plan || '',
          team_roles: proposalData.team_roles || '',
          functional_requirements: proposalData.functional_requirements || [],
          non_functional_requirements: proposalData.non_functional_requirements || [],
          technology_stack: proposalData.technology_stack || [],
          problem_mindmap: proposalData.mindmap_url ? 
            { name: 'تم تحميل الملف مسبقاً', url: proposalData.mindmap_url } : null,
          experts: proposalData.experts || []
        });
      }
    } catch (error) {
      console.error('Error fetching proposal data:', error);
      if (error.response && error.response.status === 404) {
        // No proposal exists yet, this is fine
        console.log('No existing proposal found, starting fresh');
        setIsEditMode(false);
      } else if (error.response && error.response.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotification = () => {
    setShowNotification(!showNotification);
    if (showChat) setShowChat(false);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    if (showNotification) setShowNotification(false);
  };

  const handleProjectTypeChange = (type) => {
    setProjectType(type);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleArrayInputChange = (e) => {
    const { name, value } = e.target;
    const arrayValues = value.split(/[,،]\s*/)
      .map(item => item.trim())
      .filter(item => item !== '');
    setFormData({ ...formData, [name]: arrayValues });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };

  const addRequirement = (type, value) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    const fieldName = type === 'functional' 
      ? 'functional_requirements' 
      : 'non_functional_requirements';

    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], trimmedValue]
    }));

    document.getElementById(`${fieldName}-input`).value = '';
  };

  const removeRequirement = (type, index) => {
    const fieldName = type === 'functional' 
      ? 'functional_requirements' 
      : 'non_functional_requirements';

    setFormData({
      ...formData,
      [fieldName]: formData[fieldName].filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const token = localStorage.getItem('access_token');
    const groupid = localStorage.getItem('selectedGroupId');
    
    if (!token || !groupid) {
      setError('يجب تسجيل الدخول أولاً والتأكد من وجود معرف المجموعة');
      setIsSubmitting(false);
      navigate('/login');
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // إضافة البيانات الأساسية
      formDataToSend.append('project_type', projectType);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('problem_description', formData.problem_description);
      formDataToSend.append('problem_background', formData.problem_background);
      formDataToSend.append('problem_studies', formData.problem_studies);
      formDataToSend.append('solution_studies', formData.solution_studies);
      formDataToSend.append('proposed_solution', formData.proposed_solution);
      formDataToSend.append('platform', formData.platform || '');
      formDataToSend.append('tools', JSON.stringify(formData.tools));
      formDataToSend.append('programming_languages', JSON.stringify(formData.programming_languages));
      formDataToSend.append('database', formData.database || '');
      formDataToSend.append('packages', formData.packages || '');
      formDataToSend.append('management_plan', formData.management_plan);
      formDataToSend.append('team_roles', formData.team_roles);
      formDataToSend.append('functional_requirements', JSON.stringify(formData.functional_requirements));
      formDataToSend.append('non_functional_requirements', JSON.stringify(formData.non_functional_requirements));
      formDataToSend.append('technology_stack', JSON.stringify(formData.technology_stack));
      formDataToSend.append('groupid', groupid);

      // إضافة الخبراء
      formData.experts.forEach((expert, index) => {
        formDataToSend.append(`experts[${index}][name]`, expert.name);
        if (expert.phone) formDataToSend.append(`experts[${index}][phone]`, expert.phone);
        if (expert.specialization) formDataToSend.append(`experts[${index}][specialization]`, expert.specialization);
      });

      // إضافة ملف الخريطة الذهنية إذا وجد
      if (formData.problem_mindmap && formData.problem_mindmap instanceof File) {
        formDataToSend.append('problem_mindmap', formData.problem_mindmap);
      }

      // تحديد إذا كان سيتم إنشاء جديد أو تحديث موجود
      const method = isEditMode ? 'put' : 'post';
      const url = isEditMode 
        ? `http://localhost:8000/api/proposals/${groupid}`
        : 'http://localhost:8000/api/proposals';

      const response = await axios({
        method,
        url,
        data: formDataToSend,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.message === 'تم إنشاء المقترح بنجاح' || response.data.message === 'تم تحديث المقترح بنجاح') {
        alert(response.data.message);
        navigate('/profile');
      } else {
        throw new Error(response.data.message || 'فشل في تقديم المقترح');
      }
    } catch (err) {
      console.error('Error details:', err.response?.data);
      if (err.response) {
        if (err.response.status === 401) {
          setError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
          localStorage.removeItem('access_token');
          navigate('/login');
        } else if (err.response.status === 422) {
          setError('بيانات غير صالحة: ' + 
            Object.entries(err.response.data.errors)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('; ')
          );
        } else {
          setError(err.response.data?.message || 'حدث خطأ أثناء تقديم المقترح');
        }
      } else {
        setError('حدث خطأ في الاتصال بالخادم');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-height-wrapper">
        <Header />
        <main className="container-proposal">
          <div className="auth-required-message">
            <i className="fas fa-exclamation-circle"></i>
            <h2>يجب تسجيل الدخول للوصول إلى هذه الصفحة</h2>
            <button 
              className="login-redirect-btn"
              onClick={() => navigate('/login')}
            >
              الانتقال إلى صفحة تسجيل الدخول
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-height-wrapper">
        <Header />
        <main className="container-proposal">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>جاري تحميل البيانات...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-height-wrapper">
      <Header 
        showNotification={showNotification}
        showChat={showChat}
        toggleNotification={toggleNotification}
        toggleChat={toggleChat}
      />
      
      <main className="container-proposal">
        <div className="project-type-card">
          <h2>نوع المشروع</h2>
          <div className="type-options">
            <div 
              className={`type-option ${projectType === 'term-project' ? 'active' : ''}`}
              onClick={() => handleProjectTypeChange('term-project')}
            >
              <i className="fas fa-book-open"></i>
              <h3>مشروع فصلي</h3>
              <p>مشروع يتم تنفيذه خلال فصل دراسي واحد</p>
            </div>
            <div 
              className={`type-option ${projectType === 'grad-project' ? 'active' : ''}`}
              onClick={() => handleProjectTypeChange('grad-project')}
            >
              <i className="fas fa-graduation-cap"></i>
              <h3>مشروع تخرج</h3>
              <p>مشروع متكامل يمثل متطلب للتخرج</p>
            </div>
          </div>
        </div>

        <form className="proposal-form" onSubmit={handleSubmit} encType="multipart/form-data" acceptCharset="UTF-8">
          {isEditMode && (
            <div className="existing-proposal-notice">
              <i className="fas fa-info-circle"></i>
              <span>أنت تقوم بتعديل مقترح موجود مسبقاً</span>
            </div>
          )}

          <div className="form-section-proposal">
            <h2 className="section-title-proposal">المعلومات الأساسية</h2>
            <div className="form-grid">
              <div className="form-group-proposal">
                <label htmlFor="title">عنوان المشروع</label>
                <input 
                  type="text" 
                  id="title" 
                  name="title"
                  placeholder="أدخل عنوان المشروع" 
                  className='input-proposal'
                  value={formData.title}
                  onChange={handleInputChange}
                  required 
                />
              </div>
           
            </div>
          </div>

          <div className="form-section-proposal">
            <h2 className="section-title-proposal">وصف المشكلة</h2>
            
            <div className="form-group-proposal">
              <label htmlFor="problem_description">وصف المشكلة</label>
              <textarea 
                id="problem_description" 
                name="problem_description"
                placeholder="صِف المشكلة الأساسية التي يعالجها المشروع" 
                value={formData.problem_description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group-proposal">
              <label htmlFor="problem_background">خلفية المشكلة</label>
              <textarea 
                id="problem_background" 
                name="problem_background"
                placeholder="اذكر الخلفية التاريخية أو السياق العام للمشكلة" 
                value={formData.problem_background}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group-proposal">
              <label htmlFor="problem_studies">الدراسات المرجعية للمشكلة</label>
              <textarea 
                id="problem_studies" 
                name="problem_studies"
                placeholder="اذكر الدراسات والأبحاث السابقة التي تناولت المشكلة" 
                value={formData.problem_studies}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <div className="form-group-proposal">
              <label htmlFor="problem_mindmap">خريطة ذهنية للمشكلة (اختياري)</label>
              <div className="file-upload-container">
                <input 
                  type="file"
                  id="problem_mindmap" 
                  name="problem_mindmap"
                  accept=".pdf,.jpg,.jpeg,.png,.xmind"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="problem_mindmap" className="file-upload-label">
                  <i className="fas fa-upload"></i> اختر ملف
                </label>
                {formData.problem_mindmap && (
                  <span className="file-name">
                    {formData.problem_mindmap.name}
                    {formData.problem_mindmap.url && (
                      <a 
                        href={formData.problem_mindmap.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-file-link"
                      >
                        <i className="fas fa-eye"></i> عرض الملف
                      </a>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section-proposal">
            <h2 className="section-title-proposal">الحل المقترح</h2>
            
            <div className="form-group-proposal">
              <label htmlFor="solution_studies">دراسة مرجعية للحلول</label>
              <textarea 
                id="solution_studies" 
                name="solution_studies"
                placeholder="اذكر الدراسات والأبحاث السابقة التي قدمت حلولاً للمشكلة" 
                value={formData.solution_studies}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group-proposal">
              <label htmlFor="proposed_solution">الحل المقترح</label>
              <textarea 
                id="proposed_solution" 
                name="proposed_solution"
                placeholder="صِف الحل الذي يقترحه المشروع بالتفصيل" 
                value={formData.proposed_solution}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
          </div>

          <div className="form-section-proposal">
            <h2 className="section-title-proposal">متطلبات المشروع</h2>
            
            <div className="form-grid">
              <div>
                <h3 className="section-title-proposal">
                  <i className="fas fa-cogs" style={{color: "#3b82f6", marginLeft: "8px"}}></i>المتطلبات الوظيفية
                </h3>
                <div className="req-input-group">
                  <input 
                    type="text" 
                    className="req-input input-proposal" 
                    placeholder="أدخل متطلب وظيفي"
                    id="functional_requirements-input"
                  />
                  <button 
                    type="button" 
                    className="req-btn" 
                    onClick={() => addRequirement('functional', document.getElementById('functional_requirements-input').value)}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                <ul className="requirements-list">
                  {formData.functional_requirements.map((req, index) => (
                    <li key={index}>
                      {req}
                      <button 
                        type="button" 
                        className="remove-req-btn"
                        onClick={() => removeRequirement('functional', index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="section-title-proposal">
                  <i className="fas fa-chart-line" style={{color: "#10b981", marginLeft: "8px"}}></i>المتطلبات غير الوظيفية
                </h3>
                <div className="req-input-group">
                  <input 
                    type="text" 
                    className="req-input input-proposal" 
                    placeholder="أدخل متطلب غير وظيفي"
                    id="non_functional_requirements-input"
                  />
                  <button 
                    type="button" 
                    className="req-btn" 
                    style={{backgroundColor: "#10b981"}} 
                    onClick={() => addRequirement('non-functional', document.getElementById('non_functional_requirements-input').value)}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                <ul className="requirements-list">
                  {formData.non_functional_requirements.map((req, index) => (
                    <li key={index}>
                      {req}
                      <button 
                        type="button" 
                        className="remove-req-btn"
                        onClick={() => removeRequirement('non-functional', index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="form-section-proposal">
            <h2 className="section-title-proposal">المواصفات الفنية</h2>
            
            <div className="form-grid form-grid-4">
              <div className="form-group-proposal">
                <label htmlFor="platform">المنصة</label>
                <input 
                  type="text" 
                  id="platform" 
                  name="platform"
                  className='input-proposal'
                  placeholder="مثل: ويب، موبايل، سطح مكتب"
                  value={formData.platform}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group-proposal">
                <label htmlFor="tools">الأدوات</label>
                <input 
                  type="text" 
                  id="tools" 
                  name="tools"
                  className='input-proposal'
                  placeholder="مثل: VS Code, Git, Figma (مفصولة بفواصل)"
                  value={formData.tools.join(', ')}
                  onChange={handleArrayInputChange}
                />
              </div>
              
              <div className="form-group-proposal">
                <label htmlFor="programming_languages">لغات البرمجة</label>
                <input 
                  type="text" 
                  id="programming_languages" 
                  name="programming_languages"
                  className='input-proposal'
                  placeholder="مثل: JavaScript, Python, Java (مفصولة بفواصل)"
                  value={formData.programming_languages.join(', ')}
                  onChange={handleArrayInputChange}
                />
              </div>
              
              <div className="form-group-proposal">
                <label htmlFor="database">قاعدة البيانات</label>
                <input 
                  type="text" 
                  id="database" 
                  className='input-proposal'
                  name="database"
                  placeholder="مثل: MySQL, MongoDB"
                  value={formData.database}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-group-proposal" style={{marginTop: "24px"}}>
              <label htmlFor="packages">الحزم والمكتبات</label>
              <textarea 
                id="packages" 
                name="packages"
                placeholder="أدخل الحزم والمكتبات المستخدمة في المشروع"
                value={formData.packages}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>

          <div className="form-section-proposal">
            <h2 className="section-title-proposal">إدارة المشروع</h2>
            
            <div className="form-group-proposal">
              <label htmlFor="management_plan">خطة إدارة المشروع</label>
              <textarea 
                id="management_plan" 
                name="management_plan"
                placeholder="صِف خطة إدارة المشروع وأساليب التنسيق بين الفريق"
                value={formData.management_plan}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group-proposal">
              <label htmlFor="team_roles">توزيع الأدوار</label>
              <textarea 
                id="team_roles" 
                name="team_roles"
                placeholder="وضح توزيع الأدوار والمهام بين أعضاء الفريق"
                value={formData.team_roles}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
          </div>

          {error && (
            <div className="error-message" style={{color: 'red', margin: '20px 0'}}>
              {error}
            </div>
          )}

          <div className="submit-container">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>جاري الإرسال...</span>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i> {isEditMode ? 'تحديث المقترح' : 'تقديم المقترح'}
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ProposalForm;