import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProposalForm.css';

const ProposalForm = () => {
  const navigate = useNavigate();
  const [projectType, setProjectType] = useState('term-project');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [formData, setFormData] = useState({
    projectTitle: '',
    supervisor: '',
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
    deliverables: '',
    teamRoles: ''
  });

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
      <header>
        <div className="container header-content">
          <div className="logo">
            <i className="fas fa-lightbulb"></i>
            <h1>نظام مقترحات المشاريع</h1>
          </div>
          <div>
            <button className="login-btn">
              <i className="fas fa-user"></i>تسجيل الدخول
            </button>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="container">
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
          <div className="form-section">
            <h2 className="section-title">المعلومات الأساسية</h2>
            <div className="form-grid">
              {/* عنوان المشروع */}
              <div className="form-group">
                <label htmlFor="project-title">عنوان المشروع</label>
                <input 
                  type="text" 
                  id="project-title" 
                  name="projectTitle"
                  placeholder="أدخل عنوان المشروع" 
                  value={formData.projectTitle}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              
              {/* المشرف */}
              <div className="form-group">
                <label htmlFor="supervisor">المشرف على المشروع</label>
                <select 
                  id="supervisor" 
                  name="supervisor"
                  value={formData.supervisor}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" selected disabled>اختر المشرف</option>
                  <option value="dr-ahmed">د. أحمد محمد</option>
                  <option value="dr-sara">د. سارة عبد الله</option>
                  <option value="dr-khalid">د. خالد حسن</option>
                  <option value="dr-layla">د. ليلى عمر</option>
                </select>
              </div>
            </div>
          </div>

          {/* وصف المشكلة */}
          <div className="form-section">
            <h2 className="section-title">وصف المشكلة</h2>
            
            <div className="form-group">
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
            
            <div className="form-group">
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
          <div className="form-section">
            <h2 className="section-title">الحل المقترح</h2>
            
            <div className="form-group">
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
            
            <div className="form-group">
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
          <div className="form-section">
            <h2 className="section-title">متطلبات المشروع</h2>
            
            <div className="form-grid">
              <div>
                <h3 className="section-title">
                  <i className="fas fa-cogs" style={{color: "#3b82f6", marginLeft: "8px"}}></i>المتطلبات الوظيفية
                </h3>
                <div id="functional-req-container">
                  <div className="req-input-group">
                    <input 
                      type="text" 
                      className="req-input" 
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
                <h3 className="section-title">
                  <i className="fas fa-chart-line" style={{color: "#10b981", marginLeft: "8px"}}></i>المتطلبات غير الوظيفية
                </h3>
                <div id="non-functional-req-container">
                  <div className="req-input-group">
                    <input 
                      type="text" 
                      className="req-input" 
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
          <div className="form-section">
            <h2 className="section-title">المواصفات الفنية</h2>
            
            <div className="form-grid form-grid-4">
              {/* المنصة */}
              <div className="form-group">
                <label htmlFor="platform">المنصة</label>
                <select 
                  id="platform" 
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                >
                  <option value="" selected disabled>اختر المنصة</option>
                  <option value="web">ويب</option>
                  <option value="mobile">جوال</option>
                  <option value="desktop">سطح المكتب</option>
                  <option value="iot">إنترنت الأشياء</option>
                  <option value="ai">الذكاء الاصطناعي</option>
                </select>
              </div>
              
              {/* الأدوات */}
              <div className="form-group">
                <label htmlFor="tools">الأدوات</label>
                <input 
                  type="text" 
                  id="tools" 
                  name="tools"
                  placeholder="أدخل الأدوات المستخدمة"
                  value={formData.tools}
                  onChange={handleInputChange}
                />
              </div>
              
              {/* لغات البرمجة */}
              <div className="form-group">
                <label htmlFor="languages">لغات البرمجة</label>
                <input 
                  type="text" 
                  id="languages" 
                  name="languages"
                  placeholder="أدخل لغات البرمجة"
                  value={formData.languages}
                  onChange={handleInputChange}
                />
              </div>
              
              {/* قاعدة البيانات */}
              <div className="form-group">
                <label htmlFor="database">قاعدة البيانات</label>
                <input 
                  type="text" 
                  id="database" 
                  name="database"
                  placeholder="أدخل نظام قاعدة البيانات"
                  value={formData.database}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            {/* الحزم والمكتبات */}
            <div className="form-group" style={{marginTop: "24px"}}>
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
          <div className="form-section">
            <h2 className="section-title">إدارة المشروع</h2>
            
            <div className="form-group">
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
              <div className="form-group">
                <label htmlFor="timeline">الجدول الزمني</label>
                <textarea 
                  id="timeline" 
                  name="timeline"
                  placeholder="اذكر المراحل الرئيسية للمشروع مع تواريخ تقديرية"
                  value={formData.timeline}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              
              {/* المخرجات المتوقعة */}
              <div className="form-group">
                <label htmlFor="deliverables">المخرجات المتوقعة</label>
                <textarea 
                  id="deliverables" 
                  name="deliverables"
                  placeholder="اذكر المخرجات المتوقعة من المشروع"
                  value={formData.deliverables}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
          </div>

          {/* أعضاء الفريق */}
          <div className="form-section">
            <h2 className="section-title">أعضاء الفريق</h2>
            
            <div className="team-search-container">
              <div className="search-group">
                <input 
                  type="text" 
                  id="member-search" 
                  placeholder="ابحث عن أعضاء..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  type="button" 
                  id="search-btn"
                  onClick={handleSearch}
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
              
              {showResults && (
                <div id="search-results" className="custom-scrollbar">
                  {searchResults.length > 0 ? (
                    searchResults.map(member => (
                      <div key={member.id} className="member-result">
                        <img src={member.image} alt={member.name} />
                        <div className="member-info">
                          <div className="member-name">{member.name}</div>
                          <div className="member-department">{member.department}</div>
                        </div>
                        <button 
                          type="button" 
                          className="add-member-btn"
                          onClick={() => addTeamMember(member.id)}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="member-result">لا توجد نتائج</div>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <label style={{display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "8px"}}>
                أعضاء الفريق المختارون
              </label>
              <div id="selected-members" className="selected-members">
                {selectedMembers.map(member => (
                  <div key={member.id} className="member-chip" data-member-id={member.id}>
                    <img src={member.image} alt={member.name} />
                    <span className="member-chip-name">{member.name}</span>
                    <select 
                      className="member-role"
                      value={member.role}
                      onChange={(e) => changeMemberRole(member.id, e.target.value)}
                    >
                      <option value="عضو">عضو</option>
                      <option value="قائد الفريق">قائد الفريق</option>
                      <option value="مبرمج">مبرمج</option>
                      <option value="مصمم">مصمم</option>
                      <option value="محلل">محلل</option>
                      <option value="مدير مشروع">مدير مشروع</option>
                    </select>
                    <button 
                      type="button" 
                      className="remove-member-btn"
                      onClick={() => removeTeamMember(member.id)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group">
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
      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-info">
              <h3>نظام مقترحات المشاريع</h3>
              <p>منصة متكاملة لإدارة مقترحات المشاريع الأكاديمية</p>
            </div>
            <div className="social-links">
              <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
              <a href="#" className="social-link"><i className="fab fa-facebook"></i></a>
              <a href="#" className="social-link"><i className="fab fa-linkedin"></i></a>
            </div>
          </div>
          <div className="footer-copyright">
            © 2023 نظام مقترحات المشاريع. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProposalForm;