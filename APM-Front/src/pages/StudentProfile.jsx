 import React, { useState, useEffect } from 'react';
 import './StudentProfile.css';

const StudentProfile = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTasksPage, setShowTasksPage] = useState(false);
  const [studentData, setStudentData] = useState({
    name: "أحمد محمد علي",
    email: "ahmed.mohammed@uni.edu.sa",
    phone: "+966 50 123 4567",
    id: "20231001",
    college: "كلية الحاسبات وتقنية المعلومات",
    gpa: "4.75",
    registrationDate: "01/09/2023",
    photo: "https://randomuser.me/api/portraits/men/32.jpg"
  });
  const [skills] = useState(["HTML/CSS", "JavaScript", "Python", "React.js", "Node.js", "SQL", "UI/UX Design", "Git"]);
  const [experiences] = useState([
    {
      title: "مبرمج متدرب - شركة التقنية المتميزة",
      date: "صيف 2023",
      description: "تطوير تطبيقات ويب باستخدام React وNode.js"
    },
    {
      title: "مساعد باحث - جامعة الملك سعود",
      date: "2022",
      description: "بحث في تعلم الآلة ومعالجة اللغة الطبيعية"
    },
    {
      title: "قائد فريق - هاكاثون الجامعات",
      date: "2021",
      description: "تطوير حلول ذكاء اصطناعي للتعليم"
    }
  ]);

  useEffect(() => {
    // تأثيرات التمرير للعناصر
    const animateElements = document.querySelectorAll('.animate');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    animateElements.forEach(el => {
      observer.observe(el);
    });

    // تحريك أشرطة التقدم
    document.querySelectorAll('.progress-fill').forEach(bar => {
      const width = bar.style.width;
      bar.style.width = '0';

      setTimeout(() => {
        bar.style.width = width;
      }, 300);
    });

    // إضافة متابعة لعلامات المهام
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const taskItem = this.closest('.task-item');
        if (this.checked) {
          taskItem.style.opacity = '0.7';
        } else {
          taskItem.style.opacity = '1';
        }
      });
    });

    return () => {
      animateElements.forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  const toggleNotification = () => {
    setShowNotification(!showNotification);
    if (showChat) setShowChat(false);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    if (showNotification) setShowNotification(false);
  };

  return (
    <div className="student-profile-container">
      {/* الهيدر */}
      <Header 
        showNotification={showNotification}
        showChat={showChat}
        toggleNotification={toggleNotification}
        toggleChat={toggleChat}
      />

      {/* المحتوى الرئيسي */}
      <div className="container">
        <div className="profile-container">
          {/* الجانب الأيمن */}
          <ProfileSidebar 
            studentData={studentData}
            skills={skills}
            experiences={experiences}
          />

          {/* المحتوى الرئيسي */}
          <div className="profile-content">
            {/* الإحصائيات */}
            <StatsCard />

            {/* مشاريعي الحالية */}
            <ProjectsCard 
              showTasksPage={showTasksPage}
              setShowTasksPage={setShowTasksPage}
              setShowProjectModal={setShowProjectModal}
            />

            {/* صفحة مهام مشروع (تمثيلية) */}
            {showTasksPage && (
              <TasksPage setShowTasksPage={setShowTasksPage} />
            )}

            {/* الإنجازات */}
            <AchievementsCard />
          </div>
        </div>

        {/* الفوتر */}
        <footer>
          <p>© 2023 نظام إدارة المشاريع الأكاديمية. جميع الحقوق محفوظة.</p>
        </footer>
      </div>

      {/* نموذج إنشاء مشروع */}
      {showProjectModal && (
        <ProjectModal setShowProjectModal={setShowProjectModal} />
      )}
    </div>
  );
};

// مكونات فرعية

const Header = ({ showNotification, showChat, toggleNotification, toggleChat }) => (
  <header className="header">
    <div className="header-content">
      <div className="logo">
        <i className="fas fa-graduation-cap"></i>
        نظام إدارة المشاريع الأكاديمية
      </div>
      <div className="nav-links">
        <div className="notifications-wrapper">
          {/* زر الإشعارات */}
          <div className="notification-icon" onClick={toggleNotification}>
            <i className="fas fa-bell"></i>
            <div className="notification-badge">3</div>
          </div>
          
          {/* قائمة الإشعارات */}
          <div className={`notification-dropdown ${showNotification ? 'show' : ''}`}>
            <div className="notification-header">
              <div className="notification-title">الإشعارات</div>
              <div className="mark-all-read">تعيين الكل كمقروء</div>
            </div>
            <div className="notification-item unread">
              <div className="notification-icon-small">
                <i className="fas fa-exclamation"></i>
              </div>
              <div className="notification-content">
                <div className="notification-text">تم قبول مشروعك "نظام المكتبة الرقمية" للتقييم النهائي</div>
                <div className="notification-time">منذ ساعتين</div>
              </div>
            </div>
            <div className="notification-item">
              <div className="notification-icon-small">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="notification-content">
                <div className="notification-text">موعد تسليم مشروع الذكاء الاصطناعي بعد 5 أيام</div>
                <div className="notification-time">منذ يوم</div>
              </div>
            </div>
            <div className="notification-item unread">
              <div className="notification-icon-small">
                <i className="fas fa-comments"></i>
              </div>
              <div className="notification-content">
                <div className="notification-text">لديك رسالة جديدة من الدكتور أحمد</div>
                <div className="notification-time">منذ 3 أيام</div>
              </div>
            </div>
            <div className="notification-item">
              <div className="notification-icon-small">
                <i className="fas fa-tasks"></i>
              </div>
              <div className="notification-content">
                <div className="notification-text">تم تعيين مهمة جديدة لك في مشروع التخرج</div>
                <div className="notification-time">منذ أسبوع</div>
              </div>
            </div>
            <div className="notification-footer">
              <div className="view-all">عرض جميع الإشعارات</div>
            </div>
          </div>
          
          {/* زر الدردشة */}
          <div className="message-icon" onClick={toggleChat}>
            <i className="fas fa-comment-dots"></i>
            <div className="notification-badge">1</div>
          </div>
          
          {/* قائمة الدردشة */}
          <div className={`chat-dropdown ${showChat ? 'show' : ''}`}>
            <div className="chat-header">
              <div className="chat-title">الدردشة الأكاديمية</div>
              <div className="chat-close" onClick={toggleChat}>
                <i className="fas fa-times"></i>
              </div>
            </div>
            <div className="chat-body">
              <div className="message-item received">
                <div className="message-content">
                  مرحباً أحمد، كيف مشروع التخرج؟ هل تحتاج مساعدة في أي جزء؟
                </div>
                <div className="message-time">10:30 ص</div>
              </div>
              <div className="message-item sent">
                <div className="message-content">
                  السلام عليكم دكتور، شكراً لسؤالك. التقدم جيد ولكن عندي استفسار بخصوص قاعدة البيانات
                </div>
                <div className="message-time">10:35 ص</div>
              </div>
              <div className="message-item received">
                <div className="message-content">
                  يمكنك تحديد موعد خلال الساعات القادمة وسأساعدك في ذلك
                </div>
                <div className="message-time">10:36 ص</div>
              </div>
              <div className="message-item sent">
                <div className="message-content">
                  ممتاز، أشكرك دكتور. سأراسلك لاحقاً لتحديد الموعد
                </div>
                <div className="message-time">10:38 ص</div>
              </div>
            </div>
            <div className="chat-input">
              <input type="text" placeholder="اكتب رسالتك هنا..." />
              <button className="chat-send-btn">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
        
        <a href="#" className="nav-link active"><i className="fas fa-user"></i> الصفحة الشخصية</a>
        <a href="#" className="nav-link"><i className="fas fa-project-diagram"></i> المشاريع</a>
        <a href="#" className="nav-link"><i className="fas fa-calendar-alt"></i> الجدول الزمني</a>
        <a href="#" className="nav-link"><i className="fas fa-sign-out-alt"></i> تسجيل خروج</a>
      </div>
    </div>
  </header>
);

const ProfileSidebar = ({ studentData, skills, experiences }) => (
  <div className="profile-sidebar animate delay-1">
    <div className="profile-header">
      <img src={studentData.photo} alt="صورة الطالب" className="profile-pic" />
      <h2 className="profile-name">{studentData.name}</h2>
      <p className="profile-title">طالب علوم حاسوب - السنة الرابعة</p>
      <span className="verified-badge">
        <i className="fas fa-check-circle"></i>
        حساب موثق
      </span>
    </div>

    {/* المعلومات الشخصية */}
    <div className="profile-info-section">
      <h3 className="info-title"><i className="fas fa-info-circle"></i> المعلومات الشخصية</h3>
      <div className="info-item">
        <i className="fas fa-id-card"></i>
        <div className="info-text">
          <p className="info-label">الرقم الجامعي</p>
          <p className="info-value">{studentData.id}</p>
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
          <p className="info-value">{studentData.phone}</p>
        </div>
      </div>
      <div className="info-item">
        <i className="fas fa-calendar-alt"></i>
        <div className="info-text">
          <p className="info-label">تاريخ التسجيل</p>
          <p className="info-value">{studentData.registrationDate}</p>
        </div>
      </div>
      <div className="info-item">
        <i className="fas fa-university"></i>
        <div className="info-text">
          <p className="info-label">الكلية</p>
          <p className="info-value">{studentData.college}</p>
        </div>
      </div>
      <div className="info-item">
        <i className="fas fa-chart-line"></i>
        <div className="info-text">
          <p className="info-label">المعدل التراكمي</p>
          <p className="info-value"><span>{studentData.gpa}</span> من 5</p>
        </div>
      </div>
    </div>

    {/* المهارات */}
    <div className="profile-info-section">
      <h3 className="info-title"><i className="fas fa-lightbulb"></i> المهارات</h3>
      <div className="skills-container">
        {skills.map((skill, index) => (
          <div key={index} className="skill-tag">
            {skill} <i className="fas fa-check" style={{marginRight:'5px'}}></i>
          </div>
        ))}
      </div>
    </div>

    {/* الخبرات الأكاديمية */}
    <div className="profile-info-section">
      <h3 className="info-title"><i className="fas fa-briefcase"></i> الخبرات الأكاديمية</h3>
      {experiences.map((exp, index) => (
        <div key={index} className="experience-item">
          <div className="experience-header">
            <h4 className="experience-title">{exp.title}</h4>
            <span className="experience-date">{exp.date}</span>
          </div>
          <p className="experience-description">{exp.description}</p>
        </div>
      ))}
    </div>
  </div>
);

const StatsCard = () => (
  <div className="card animate delay-2">
    <div className="card-header">
      <h2 className="card-title">إحصائياتي</h2>
    </div>
    <div className="card-body">
      <div className="stats-grid">
        <div className="stat-card">
          <i className="fas fa-project-diagram stat-icon"></i>
          <div className="stat-value">12</div>
          <div className="stat-label">المشاريع الكلية</div>
        </div>
        <div className="stat-card">
          <i className="fas fa-check-circle stat-icon"></i>
          <div className="stat-value">5</div>
          <div className="stat-label">مشاريع مكتملة</div>
        </div>
        <div className="stat-card">
          <i className="fas fa-clock stat-icon"></i>
          <div className="stat-value">7</div>
          <div className="stat-label">مشاريع قيد العمل</div>
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
        {/* مشروع 1 */}
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

        {/* مشروع 2 */}
        <div className="project-card">
          <div className="project-header">
            <span>مادة الذكاء الاصطناعي</span>
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

        {/* زر إضافة مشروع جديد */}
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
        {/* مهمة 1 */}
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

        {/* مهمة 2 */}
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

        {/* مهمة 3 */}
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

        {/* مهمة 4 */}
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

        {/* مهمة 5 */}
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
        {/* إنجاز 1 */}
        <div className="achievement-item">
          <div className="achievement-icon">
            <i className="fas fa-trophy"></i>
          </div>
          <div className="achievement-info">
            <h4>جائزة أفضل مشروع تخرج</h4>
            <p>مسابقة جامعة الملك سعود للتميز التقني 2023</p>
          </div>
        </div>

        {/* إنجاز 2 */}
        <div className="achievement-item">
          <div className="achievement-icon">
            <i className="fas fa-medal"></i>
          </div>
          <div className="achievement-info">
            <h4>المركز الأول في مسابقة البرمجة</h4>
            <p>مسابقة جامعية للبرمجة التنافسية 2022</p>
          </div>
        </div>

        {/* إنجاز 3 */}
        <div className="achievement-item">
          <div className="achievement-icon">
            <i className="fas fa-award"></i>
          </div>
          <div className="achievement-info">
            <h4>أفضل مشروع مفتوح المصدر</h4>
            <p>مبادرة سوفتوير السعودية 2021</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProjectModal = ({ setShowProjectModal }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <span className="close-modal" onClick={() => setShowProjectModal(false)}>
        <i className="fas fa-times"></i>
      </span>
      <h2 className="modal-title">إنشاء مشروع جديد</h2>
      <div className="form-group">
        <label>اسم المشروع</label>
        <input type="text" className="form-input" placeholder="أدخل اسم المشروع" />
      </div>
      <div className="form-group">
        <label>وصف المشروع</label>
        <textarea className="form-textarea" placeholder="أدخل وصفاً مفصلاً للمشروع"></textarea>
      </div>
      <div className="form-group">
        <label>تاريخ التسليم</label>
        <input type="date" className="form-input" />
      </div>
      <div className="form-group">
        <label>المادة الدراسية</label>
        <select className="form-input">
          <option value="">اختر المادة الدراسية</option>
          <option value="ai">الذكاء الاصطناعي</option>
          <option value="ml">تعلم الآلة</option>
          <option value="se">هندسة البرمجيات</option>
          <option value="db">قواعد البيانات</option>
        </select>
      </div>
      <button className="btn btn-primary" style={{width: '100%', padding: '12px'}}>
        <i className="fas fa-plus"></i> إنشاء المشروع
      </button>
    </div>
  </div>
);

export default StudentProfile;