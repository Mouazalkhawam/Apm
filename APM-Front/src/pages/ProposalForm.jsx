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
  const [formKey, setFormKey] = useState(Date.now());
  const [userRole, setUserRole] = useState(null);
  const [proposalStatus, setProposalStatus] = useState(null);
  const [isCoordinator, setIsCoordinator] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedGroupid = localStorage.getItem('selectedGroupId');
    
    if (!token) {
      navigate('/login');
    } else {
      setIsAuthenticated(true);
      setGroupid(storedGroupid);
      fetchUserData();
      
      if (storedGroupid) {
        checkProposalExists(storedGroupid);
      } else {
        setIsLoading(false);
      }
    }
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:8000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUserRole(response.data.role);
      setIsCoordinator(response.data.role === 'coordinator');
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const checkProposalExists = async (groupid) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`http://localhost:8000/api/proposals/check/${groupid}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.exists) {
        fetchProposalData(groupid);
      } else {
        setIsEditMode(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking proposal existence:', error);
      setIsLoading(false);
    }
  };

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
        setProposalStatus(proposalData.status);
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
            { name: 'Uploaded file', url: proposalData.mindmap_url } : null,
          experts: proposalData.experts || []
        });

        setFormKey(Date.now());
      }
    } catch (error) {
      console.error('Error fetching proposal data:', error);
      if (error.response && error.response.status === 404) {
        setIsEditMode(false);
      } else if (error.response && error.response.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveProposal = async () => {
    if (!window.confirm('هل أنت متأكد من قبول هذا المقترح؟')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const groupid = localStorage.getItem('selectedGroupId');
      
      if (!token || !groupid) {
        setError('يجب تسجيل الدخول أولاً والتأكد من وجود معرف المجموعة');
        return;
      }

      setIsSubmitting(true);
      const response = await axios.post(
        `http://localhost:8000/api/groups/${groupid}/proposal/approve`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.message) {
        alert(response.data.message);
        setProposalStatus('approved');
      } else {
        throw new Error('فشل في قبول المقترح');
      }
    } catch (error) {
      console.error('Error approving proposal:', error);
      setError(error.response?.data?.message || 'حدث خطأ أثناء قبول المقترح');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectProposal = async () => {
    if (!window.confirm('هل أنت متأكد من رفض هذا المقترح؟')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const groupid = localStorage.getItem('selectedGroupId');
      
      if (!token || !groupid) {
        setError('يجب تسجيل الدخول أولاً والتأكد من وجود معرف المجموعة');
        return;
      }

      setIsSubmitting(true);
      const response = await axios.post(
        `http://localhost:8000/api/groups/${groupid}/proposal/reject`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.message) {
        alert(response.data.message);
        setProposalStatus('needs_revision');
      } else {
        throw new Error('فشل في رفض المقترح');
      }
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      setError(error.response?.data?.message || 'حدث خطأ أثناء رفض المقترح');
    } finally {
      setIsSubmitting(false);
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (e) => {
    const { name, value } = e.target;
    const arrayValues = value.split(/[,،]\s*/)
      .map(item => item.trim())
      .filter(item => item !== '');
    setFormData(prev => ({
      ...prev,
      [name]: arrayValues
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const addExpert = () => {
    if (!currentExpert.name.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      experts: [...prev.experts, currentExpert]
    }));
    
    setCurrentExpert({
      name: '',
      phone: '',
      specialization: ''
    });
  };

  const removeExpert = (index) => {
    setFormData(prev => ({
      ...prev,
      experts: prev.experts.filter((_, i) => i !== index)
    }));
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

    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
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

    const requiredFields = {
      title: 'عنوان المشروع',
      problem_description: 'وصف المشكلة',
      problem_background: 'خلفية المشكلة',
      problem_studies: 'الدراسات المرجعية للمشكلة',
      solution_studies: 'دراسة مرجعية للحلول',
      proposed_solution: 'الحل المقترح',
      management_plan: 'خطة إدارة المشروع',
      team_roles: 'توزيع الأدوار'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([field]) => !formData[field]?.toString().trim())
      .map(([_, name]) => name);

    if (missingFields.length > 0) {
      setError(`الرجاء تعبئة الحقول المطلوبة: ${missingFields.join('، ')}`);
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
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

      formData.experts.forEach((expert, index) => {
        formDataToSend.append(`experts[${index}][name]`, expert.name);
        formDataToSend.append(`experts[${index}][phone]`, expert.phone || '');
        formDataToSend.append(`experts[${index}][specialization]`, expert.specialization || '');
      });

      if (formData.problem_mindmap && formData.problem_mindmap instanceof File) {
        formDataToSend.append('problem_mindmap', formData.problem_mindmap);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      };

      let response;
      if (isEditMode) {
        formDataToSend.append('_method', 'PUT');
        response = await axios.post(
          `http://localhost:8000/api/proposals/${groupid}`,
          formDataToSend,
          config
        );
      } else {
        response = await axios.post(
          `http://localhost:8000/api/proposals/groups/${groupid}/proposals`,
          formDataToSend,
          config
        );
      }

      if (response.data.message) {
        alert(response.data.message);
        navigate('/proposal');
      } else {
        throw new Error('فشل في تقديم المقترح');
      }
    } catch (err) {
      console.error('Error details:', err.response?.data);
      if (err.response) {
        if (err.response.status === 401) {
          setError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
          localStorage.removeItem('access_token');
          navigate('/login');
        } else if (err.response.status === 422) {
          const errors = err.response.data.errors;
          const errorMessages = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
          setError(`بيانات غير صالحة: ${errorMessages}`);
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
        {isCoordinator && isEditMode && (
          <div className="coordinator-actions">
            {proposalStatus !== 'approved' && (
              <button 
                className="approve-proposal-btn"
                onClick={handleApproveProposal}
                disabled={isSubmitting}
              >
                <i className="fas fa-check-circle"></i> قبول المقترح
              </button>
            )}
            {proposalStatus !== 'needs_revision' && (
              <button 
                className="reject-proposal-btn"
                onClick={handleRejectProposal}
                disabled={isSubmitting}
              >
                <i className="fas fa-times-circle"></i> رفض المقترح
              </button>
            )}
          </div>
        )}

        {proposalStatus === 'approved' && (
          <div className="proposal-status-banner approved">
            <i className="fas fa-check-circle"></i>
            <span>هذا المقترح تم قبوله</span>
          </div>
        )}

        {proposalStatus === 'needs_revision' && (
          <div className="proposal-status-banner needs-revision">
            <i className="fas fa-exclamation-circle"></i>
            <span>هذا المقترح بحاجة إلى تعديلات</span>
          </div>
        )}

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

        <form key={formKey} className="proposal-form" onSubmit={handleSubmit} encType="multipart/form-data">
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
                <label htmlFor="title">عنوان المشروع *</label>
                <input 
                  type="text" 
                  id="title" 
                  name="title"
                  placeholder="أدخل عنوان المشروع" 
                  value={formData.title}
                  onChange={handleInputChange}
                  required 
                  disabled={isCoordinator}
                />
              </div>
            </div>
          </div>

          <div className="form-section-proposal">
            <h2 className="section-title-proposal">وصف المشكلة</h2>
            
            <div className="form-group-proposal">
              <label htmlFor="problem_description">وصف المشكلة *</label>
              <textarea 
                id="problem_description" 
                name="problem_description"
                placeholder="صِف المشكلة الأساسية التي يعالجها المشروع" 
                value={formData.problem_description}
                onChange={handleInputChange}
                required
                disabled={isCoordinator}
              ></textarea>
            </div>
            
            <div className="form-group-proposal">
              <label htmlFor="problem_background">خلفية المشكلة *</label>
              <textarea 
                id="problem_background" 
                name="problem_background"
                placeholder="اذكر الخلفية التاريخية أو السياق العام للمشكلة" 
                value={formData.problem_background}
                onChange={handleInputChange}
                required
                disabled={isCoordinator}
              ></textarea>
            </div>
            
            <div className="form-group-proposal">
              <label htmlFor="problem_studies">الدراسات المرجعية للمشكلة *</label>
              <textarea 
                id="problem_studies" 
                name="problem_studies"
                placeholder="اذكر الدراسات والأبحاث السابقة التي تناولت المشكلة" 
                value={formData.problem_studies}
                onChange={handleInputChange}
                required
                disabled={isCoordinator}
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
                  disabled={isCoordinator}
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
              <label htmlFor="solution_studies">دراسة مرجعية للحلول *</label>
              <textarea 
                id="solution_studies" 
                name="solution_studies"
                placeholder="اذكر الدراسات والأبحاث السابقة التي قدمت حلولاً للمشكلة" 
                value={formData.solution_studies}
                onChange={handleInputChange}
                required
                disabled={isCoordinator}
              ></textarea>
            </div>
            
            <div className="form-group-proposal">
              <label htmlFor="proposed_solution">الحل المقترح *</label>
              <textarea 
                id="proposed_solution" 
                name="proposed_solution"
                placeholder="صِف الحل الذي يقترحه المشروع بالتفصيل" 
                value={formData.proposed_solution}
                onChange={handleInputChange}
                required
                disabled={isCoordinator}
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
                    className="req-input" 
                    placeholder="أدخل متطلب وظيفي"
                    id="functional_requirements-input"
                    disabled={isCoordinator}
                  />
                  <button 
                    type="button" 
                    className="req-btn" 
                    onClick={() => addRequirement('functional', document.getElementById('functional_requirements-input').value)}
                    disabled={isCoordinator}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                <ul className="requirements-list">
                  {formData.functional_requirements.map((req, index) => (
                    <li key={index}>
                      {req}
                      {!isCoordinator && (
                        <button 
                          type="button" 
                          className="remove-req-btn"
                          onClick={() => removeRequirement('functional', index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
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
                    className="req-input" 
                    placeholder="أدخل متطلب غير وظيفي"
                    id="non_functional_requirements-input"
                    disabled={isCoordinator}
                  />
                  <button 
                    type="button" 
                    className="req-btn" 
                    style={{backgroundColor: "#10b981"}} 
                    onClick={() => addRequirement('non-functional', document.getElementById('non_functional_requirements-input').value)}
                    disabled={isCoordinator}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                <ul className="requirements-list">
                  {formData.non_functional_requirements.map((req, index) => (
                    <li key={index}>
                      {req}
                      {!isCoordinator && (
                        <button 
                          type="button" 
                          className="remove-req-btn"
                          onClick={() => removeRequirement('non-functional', index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
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
                  placeholder="مثل: ويب، موبايل، سطح مكتب"
                  value={formData.platform}
                  onChange={handleInputChange}
                  disabled={isCoordinator}
                />
              </div>
              
              <div className="form-group-proposal">
                <label htmlFor="tools">الأدوات</label>
                <input 
                  type="text" 
                  id="tools" 
                  name="tools"
                  placeholder="مثل: VS Code, Git, Figma (مفصولة بفواصل)"
                  value={formData.tools.join(', ')}
                  onChange={handleArrayInputChange}
                  disabled={isCoordinator}
                />
              </div>
              
              <div className="form-group-proposal">
                <label htmlFor="programming_languages">لغات البرمجة</label>
                <input 
                  type="text" 
                  id="programming_languages" 
                  name="programming_languages"
                  placeholder="مثل: JavaScript, Python, Java (مفصولة بفواصل)"
                  value={formData.programming_languages.join(', ')}
                  onChange={handleArrayInputChange}
                  disabled={isCoordinator}
                />
              </div>
              
              <div className="form-group-proposal">
                <label htmlFor="database">قاعدة البيانات</label>
                <input 
                  type="text" 
                  id="database" 
                  name="database"
                  placeholder="مثل: MySQL, MongoDB"
                  value={formData.database}
                  onChange={handleInputChange}
                  disabled={isCoordinator}
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
                disabled={isCoordinator}
              ></textarea>
            </div>
          </div>

          <div className="form-section-proposal">
            <h2 className="section-title-proposal">إدارة المشروع</h2>
            
            <div className="form-group-proposal">
              <label htmlFor="management_plan">خطة إدارة المشروع *</label>
              <textarea 
                id="management_plan" 
                name="management_plan"
                placeholder="صِف خطة إدارة المشروع وأساليب التنسيق بين الفريق"
                value={formData.management_plan}
                onChange={handleInputChange}
                required
                disabled={isCoordinator}
              ></textarea>
            </div>
            
            <div className="form-group-proposal">
              <label htmlFor="team_roles">توزيع الأدوار *</label>
              <textarea 
                id="team_roles" 
                name="team_roles"
                placeholder="وضح توزيع الأدوار والمهام بين أعضاء الفريق"
                value={formData.team_roles}
                onChange={handleInputChange}
                required
                disabled={isCoordinator}
              ></textarea>
            </div>
          </div>

          <div className="form-section-proposal">
            <h2 className="section-title-proposal">الخبراء المقترحون</h2>
            
            <div className="experts-form">
              <div className="form-grid form-grid-3">
                <div className="form-group-proposal">
                  <label htmlFor="expert-name">اسم الخبير *</label>
                  <input 
                    type="text" 
                    id="expert-name"
                    value={currentExpert.name}
                    onChange={(e) => setCurrentExpert({...currentExpert, name: e.target.value})}
                    placeholder="اسم الخبير"
                    disabled={isCoordinator}
                  />
                </div>
                
                <div className="form-group-proposal">
                  <label htmlFor="expert-phone">رقم الهاتف</label>
                  <input 
                    type="text" 
                    id="expert-phone"
                    value={currentExpert.phone}
                    onChange={(e) => setCurrentExpert({...currentExpert, phone: e.target.value})}
                    placeholder="رقم الهاتف (اختياري)"
                    disabled={isCoordinator}
                  />
                </div>
                
                <div className="form-group-proposal">
                  <label htmlFor="expert-specialization">التخصص</label>
                  <input 
                    type="text" 
                    id="expert-specialization"
                    value={currentExpert.specialization}
                    onChange={(e) => setCurrentExpert({...currentExpert, specialization: e.target.value})}
                    placeholder="التخصص (اختياري)"
                    disabled={isCoordinator}
                  />
                </div>
              </div>
              
              {!isCoordinator && (
                <button 
                  type="button" 
                  className="add-expert-btn"
                  onClick={addExpert}
                  disabled={!currentExpert.name.trim()}
                >
                  <i className="fas fa-plus"></i> إضافة خبير
                </button>
              )}
              
              <div className="experts-list">
                {formData.experts.map((expert, index) => (
                  <div key={index} className="expert-item">
                    <div className="expert-info">
                      <span className="expert-name">{expert.name}</span>
                      {expert.phone && <span className="expert-phone">{expert.phone}</span>}
                      {expert.specialization && <span className="expert-specialization">{expert.specialization}</span>}
                    </div>
                    {!isCoordinator && (
                      <button 
                        type="button" 
                        className="remove-expert-btn"
                        onClick={() => removeExpert(index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {!isCoordinator && (
            <div className="submit-container">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting || proposalStatus === 'approved'}
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
          )}
        </form>
      </main>
    </div>
  );
};

export default ProposalForm;