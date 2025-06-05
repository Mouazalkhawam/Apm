import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProposalForm.css';
import Header from '../components/Header/Header';

const ProposalForm = () => {
  const navigate = useNavigate();
  const [projectType, setProjectType] = useState('term-project');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [formData, setFormData] = useState({
    projectTitle: '',
    problemDescription: '',
    problemStudies: '',
    solutionStudies: '',
    proposedSolution: '',
    platform: '',
    tools: '',
    languages: '',
    database: '',
    packages: '',
    managementPlan: '',
    timeline: '',
    teamRoles: ''

    
  });
  const [showNotification, setShowNotification] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const toggleNotification = () => {
    setShowNotification(!showNotification);
    if (showChat) setShowChat(false);
  };
  
  const toggleChat = () => {
    setShowChat(!showChat);
    if (showNotification) setShowNotification(false);
  };


  // بيانات الأعضاء
  const membersData = [
    { id: 1, name: "أحمد محمد", department: "هندسة البرمجيات", image: "https://randomuser.me/api/portraits/men/1.jpg" },
    { id: 2, name: "سارة عبد الله", department: "علوم الحاسب", image: "https://randomuser.me/api/portraits/women/2.jpg" },
    { id: 3, name: "خالد حسن", department: "نظم المعلومات", image: "https://randomuser.me/api/portraits/men/3.jpg" },
    { id: 4, name: "ليلى عمر", department: "هندسة البرمجيات", image: "https://randomuser.me/api/portraits/women/4.jpg" },
    { id: 5, name: "محمد علي", department: "علوم الحاسب", image: "https://randomuser.me/api/portraits/men/5.jpg" },
    { id: 6, name: "نورا سعيد", department: "نظم المعلومات", image: "https://randomuser.me/api/portraits/women/6.jpg" }
  ];

  // تغيير نوع المشروع
  const handleProjectTypeChange = (type) => {
    setProjectType(type);
  };

  // البحث عن الأعضاء
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const results = membersData.filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      member.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSearchResults(results);
    setShowResults(true);
  };

  // إضافة عضو للفريق
  const addTeamMember = (memberId) => {
    const member = membersData.find(m => m.id === memberId);
    if (!member || selectedMembers.some(m => m.id === memberId)) {
      return;
    }

    setSelectedMembers([...selectedMembers, { ...member, role: 'عضو' }]);
    setShowResults(false);
    setSearchTerm('');
  };

  // إزالة عضو من الفريق
  const removeTeamMember = (memberId) => {
    setSelectedMembers(selectedMembers.filter(member => member.id !== memberId));
  };

  // تغيير دور العضو
  const changeMemberRole = (memberId, newRole) => {
    setSelectedMembers(selectedMembers.map(member => 
      member.id === memberId ? { ...member, role: newRole } : member
    ));
  };

  // إضافة متطلب جديد
  const addRequirement = (type, value) => {
    if (value.trim() === '') return;
    // يمكنك إضافة منطق لحفظ المتطلبات إذا لزم الأمر
  };

  // تغيير بيانات النموذج
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // إرسال النموذج
  const handleSubmit = (e) => {
    e.preventDefault();
    // هنا يمكنك إضافة منطق لإرسال البيانات إلى الخادم
    alert('تم تقديم المقترح بنجاح! سيتصل بك المشرف قريبًا.');
    navigate('/profile'); // توجيه المستخدم إلى صفحة البروفايل بعد الإرسال
  };

  useEffect(() => {
    if (searchTerm.trim() !== '') {
      handleSearch();
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchTerm]);

  return (
    <div className="min-height-wrapper">
      {/* الرأس */}
      <Header 
        showNotification={showNotification}
        showChat={showChat}
        toggleNotification={toggleNotification}
        toggleChat={toggleChat}
      />
      {/* المحتوى الرئيسي */}
      <main className="container-proposal">
        {/* اختيار نوع المشروع */}
        <div className="project-type-card">
          <h2>نوع المشروع</h2>
          <div className="type-options">
            <div 
              id="term-project-btn" 
              className={`type-option ${projectType === 'term-project' ? 'active' : ''}`}
              onClick={() => handleProjectTypeChange('term-project')}
            >
              <i className="fas fa-book-open"></i>
              <h3>مشروع فصلي</h3>
              <p>مشروع يتم تنفيذه خلال فصل دراسي واحد</p>
            </div>
            <div 
              id="grad-project-btn" 
              className={`type-option ${projectType === 'grad-project' ? 'active' : ''}`}
              onClick={() => handleProjectTypeChange('grad-project')}
            >
              <i className="fas fa-graduation-cap"></i>
              <h3>مشروع تخرج</h3>
              <p>مشروع متكامل يمثل متطلب للتخرج</p>
            </div>
          </div>
        </div>

        {/* نموذج المقترح */}
        <form id="project-proposal-form" className="proposal-form" onSubmit={handleSubmit}>
          {/* المعلومات الأساسية */}
          <div className="form-section-proposal">
            <h2 className="section-title-proposal">المعلومات الأساسية</h2>
            <div className="form-grid">
              {/* عنوان المشروع */}
              <div className="form-group-proposal">
                <label htmlFor="project-title">عنوان المشروع</label>
                <input 
                  type="text" 
                  id="project-title" 
                  name="projectTitle"
                  placeholder="أدخل عنوان المشروع" 
                  className='input-proposal'
                  value={formData.projectTitle}
                  onChange={handleInputChange}
                  required 
                />
              </div>
            
            </div>
          </div>

          {/* وصف المشكلة */}
          <div className="form-section-proposal">
            <h2 className="section-title-proposal">وصف المشكلة</h2>
            
            <div className="form-group-proposal">
              <label htmlFor="problem-description">وصف المشكلة</label>
              <textarea 
                id="problem-description" 
                name="problemDescription"
                placeholder="صِف المشكلة الأساسية التي يعالجها المشروع" 
                value={formData.problemDescription}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group-proposal">
              <label htmlFor="problem-studies">الدراسات المرجعية للمشكلة</label>
              <textarea 
                id="problem-studies" 
                name="problemStudies"
                placeholder="اذكر الدراسات والأبحاث السابقة التي تناولت المشكلة" 
                value={formData.problemStudies}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
          </div>

          {/* الحل المقترح */}
          <div className="form-section-proposal">
            <h2 className="section-title-proposal">الحل المقترح</h2>
            
            <div className="form-group-proposal">
              <label htmlFor="solution-studies">دراسة مرجعية للحلول</label>
              <textarea 
                id="solution-studies" 
                name="solutionStudies"
                placeholder="اذكر الدراسات والأبحاث السابقة التي قدمت حلولاً للمشكلة" 
                value={formData.solutionStudies}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group-proposal">
              <label htmlFor="proposed-solution">الحل المقترح</label>
              <textarea 
                id="proposed-solution" 
                name="proposedSolution"
                placeholder="صِف الحل الذي يقترحه المشروع بالتفصيل" 
                value={formData.proposedSolution}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
          </div>

          {/* متطلبات المشروع */}
          <div className="form-section-proposal">
            <h2 className="section-title-proposal">متطلبات المشروع</h2>
            
            <div className="form-grid">
              <div>
                <h3 className="section-title-proposal">
                  <i className="fas fa-cogs" style={{color: "#3b82f6", marginLeft: "8px"}}></i>المتطلبات الوظيفية
                </h3>
                <div id="functional-req-container">
                  <div className="req-input-group">
                    <input 
                      type="text" 
                      className="req-input input-proposal" 
                      placeholder="أدخل متطلب وظيفي"
                      id="functional-req-input"
                    />
                    <button 
                      type="button" 
                      className="req-btn" 
                      onClick={() => addRequirement('functional', document.getElementById('functional-req-input').value)}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="section-title-proposal">
                  <i className="fas fa-chart-line" style={{color: "#10b981", marginLeft: "8px"}}></i>المتطلبات غير الوظيفية
                </h3>
                <div id="non-functional-req-container">
                  <div className="req-input-group ">
                    <input 
                      type="text" 
                      className="req-input input-proposal" 
                      placeholder="أدخل متطلب غير وظيفي"
                      id="non-functional-req-input"
                    />
                    <button 
                      type="button" 
                      className="req-btn" 
                      style={{backgroundColor: "#10b981"}} 
                      onClick={() => addRequirement('non-functional', document.getElementById('non-functional-req-input').value)}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* المواصفات الفنية */}
          <div className="form-section-proposal">
            <h2 className="section-title-proposal">المواصفات الفنية</h2>
            
            <div className="form-grid form-grid-4">
              {/* المنصة */}
              <div className="form-group-proposal">
                <label htmlFor="platform">المنصة</label>
                <input 
                  type="text" 
                  id="platform" 
                  name="platform"
                  className='input-proposal'
                  placeholder="أدخل الأدوات المستخدمة"
                  value={formData.platform}
                  onChange={handleInputChange}
                />
              </div>
              
              {/* الأدوات */}
              <div className="form-group-proposal">
                <label htmlFor="tools">الأدوات</label>
                <input 
                  type="text" 
                  id="tools" 
                  name="tools"
                  className='input-proposal'
                  placeholder="أدخل الأدوات المستخدمة"
                  value={formData.tools}
                  onChange={handleInputChange}
                />
              </div>
              
              {/* لغات البرمجة */}
              <div className="form-group-proposal">
                <label htmlFor="languages">لغات البرمجة</label>
                <input 
                  type="text" 
                  id="languages" 
                  name="languages"
                  className='input-proposal'
                  placeholder="أدخل لغات البرمجة"
                  value={formData.languages}
                  onChange={handleInputChange}
                />
              </div>
              
              {/* قاعدة البيانات */}
              <div className="form-group-proposal">
                <label htmlFor="database">قاعدة البيانات</label>
                <input 
                  type="text" 
                  id="database" 
                  className='input-proposal'
                  name="database"
                  placeholder="أدخل نظام قاعدة البيانات"
                  value={formData.database}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            {/* الحزم والمكتبات */}
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

          {/* إدارة المشروع */}
          <div className="form-section-proposal">
            <h2 className="section-title-proposal">إدارة المشروع</h2>
            
            <div className="form-group-proposal">
              <label htmlFor="management-plan">خطة إدارة المشروع</label>
              <textarea 
                id="management-plan" 
                name="managementPlan"
                placeholder="صِف خطة إدارة المشروع وأساليب التنسيق بين الفريق"
                value={formData.managementPlan}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            
            <div className="form-grid">
              {/* الجدول الزمني */}
              
            </div>
          </div>

         

            
            <div className="form-group-proposal">
              <label htmlFor="team-roles">توزيع الأدوار</label>
              <textarea 
                id="team-roles" 
                name="teamRoles"
                placeholder="وضح توزيع الأدوار والمهام بين أعضاء الفريق"
                value={formData.teamRoles}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
          

          {/* زر الإرسال */}
          <div className="submit-container">
            <button type="submit" className="submit-btn">
              <i className="fas fa-paper-plane"></i>تقديم المقترح
            </button>
          </div>
        </form>
      </main>

      {/* التذييل */}
     
    </div>
  );
};

export default ProposalForm;