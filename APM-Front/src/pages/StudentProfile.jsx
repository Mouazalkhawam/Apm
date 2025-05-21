import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faProjectDiagram, faHome, faCalendarAlt, faSignOutAlt,
  faIdCard, faEnvelope, faPhone, faUniversity, faChartLine,
  faLightbulb, faBriefcase, faCheck, faCheckCircle, faClock,
  faCode, faMobileAlt, faRobot, faEdit, faEye, faPlus
} from '@fortawesome/free-solid-svg-icons';
import './StudentProfile.css';

const StudentProfile = () => {
  const skills = [
    "HTML/CSS", "JavaScript", "Python", "React.js", 
    "Node.js", "SQL", "UI/UX Design", "Git"
  ];
  
  const experiences = [
    {
      title: "مبرمج متدرب - شركة التقنية المتميزة",
      description: "صيف 2023 - تطوير تطبيقات ويب باستخدام React وNode.js"
    },
    {
      title: "مساعد باحث - جامعة الملك سعود",
      description: "2022 - بحث في تعلم الآلة ومعالجة اللغة الطبيعية"
    },
    {
      title: "قائد فريق - هاكاثون الجامعات",
      description: "2021 - تطوير حلول ذكاء اصطناعي للتعليم"
    }
  ];

  const projects = [
    {
      id: 1,
      title: "نظام إدارة المكتبة الرقمية",
      description: "نظام متكامل لإدارة الكتب والإعارة في المكتبة الجامعية مع لوحة تحكم متقدمة",
      progress: 82,
      daysLeft: 30,
      type: "web"
    },
    {
      id: 2,
      title: "تطبيق طلبات الطعام الذكي",
      description: "تطبيق متكامل لطلب الطعام من المطاعم المحلية مع نظام توصيل ذكي",
      progress: 45,
      daysLeft: 60,
      type: "mobile"
    },
    {
      id: 3,
      title: "روبوت الدردشة الذكية",
      description: "روبوت محادثة يعتمد على الذكاء الاصطناعي للرد على استفسارات الطلاب",
      progress: 28,
      daysLeft: 90,
      type: "ai"
    }
  ];

  useEffect(() => {
    const projectCards = document.querySelectorAll('.project-card');
    const skillTags = document.querySelectorAll('.skill-tag');

    projectCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        const progressFill = card.querySelector('.progress-fill');
        if (progressFill) progressFill.style.transform = 'scaleY(1.2)';
      });
      card.addEventListener('mouseleave', () => {
        const progressFill = card.querySelector('.progress-fill');
        if (progressFill) progressFill.style.transform = 'scaleY(1)';
      });
    });

    skillTags.forEach(tag => {
      tag.addEventListener('mouseenter', () => {
        tag.style.transform = 'translateY(-3px) rotate(2deg)';
      });
      tag.addEventListener('mouseleave', () => {
        tag.style.transform = 'translateY(0) rotate(0)';
      });
    });

    return () => {
      projectCards.forEach(card => card.removeEventListener('mouseenter', () => {}));
      skillTags.forEach(tag => tag.removeEventListener('mouseenter', () => {}));
    };
  }, []);

  return (
    <div className="container">
      <header>
        <div className="header-content">
          <div className="logo">
            <FontAwesomeIcon icon={faProjectDiagram} />
            نظام إدارة المشاريع
          </div>
          <div className="user-actions">
            <a href="#"><FontAwesomeIcon icon={faHome} /> الرئيسية</a>
            <a href="#"><FontAwesomeIcon icon={faCalendarAlt} /> الجدول الزمني</a>
            <a href="#"><FontAwesomeIcon icon={faSignOutAlt} /> تسجيل خروج</a>
          </div>
        </div>
      </header>
      
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-pic">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="صورة الطالب" />
          </div>
          <div className="profile-info">
            <h2>أحمد محمد علي</h2>
            <p>طالب علوم حاسوب - المستوى الرابع</p>
          </div>
          
          <div className="info-item">
            <FontAwesomeIcon icon={faIdCard} />
            <span>الرقم الجامعي: 20231001</span>
          </div>
          
          <div className="info-item">
            <FontAwesomeIcon icon={faEnvelope} />
            <span>ahmed.mohammed@uni.edu.sa</span>
          </div>
          
          <div className="info-item">
            <FontAwesomeIcon icon={faPhone} />
            <span>+966 50 123 4567</span>
          </div>
          
          <div className="info-item">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>تاريخ التسجيل: 01/09/2023</span>
          </div>
          
          <div className="info-item">
            <FontAwesomeIcon icon={faUniversity} />
            <span>كلية الحاسبات وتقنية المعلومات</span>
          </div>
          
          <div className="info-item">
            <FontAwesomeIcon icon={faChartLine} />
            <span>المعدل التراكمي: 4.75 من 5</span>
          </div>
          
          <div className="skills-section">
            <h3><FontAwesomeIcon icon={faLightbulb} /> المهارات</h3>
            <div className="skills-list">
              {skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill} <FontAwesomeIcon icon={faCheck} />
                </span>
              ))}
            </div>
          </div>
          
          <div className="skills-section" style={{ marginTop: '15px' }}>
            <h3><FontAwesomeIcon icon={faBriefcase} /> الخبرات العملية</h3>
            {experiences.map((exp, index) => (
              <div key={index} className="experience-item">
                <h4>{exp.title}</h4>
                <p>{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="main-content">
          <div className="card">
            <div className="card-header">
              <h3>إحصائياتي</h3>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <FontAwesomeIcon icon={faProjectDiagram} />
                <div className="stat-value">12</div>
                <div className="stat-label">المشاريع الكلية</div>
              </div>
              <div className="stat-card">
                <FontAwesomeIcon icon={faCheckCircle} />
                <div className="stat-value">5</div>
                <div className="stat-label">مشاريع مكتملة</div>
              </div>
              <div className="stat-card">
                <FontAwesomeIcon icon={faClock} />
                <div className="stat-value">7</div>
                <div className="stat-label">مشاريع قيد العمل</div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3>مشاريعي الحالية</h3>
              <button className="btn btn-primary">
                <FontAwesomeIcon icon={faPlus} /> مشروع جديد
              </button>
            </div>
            
            <div className="projects-grid">
              {projects.map(project => (
                <div key={project.id} className="project-card">
                  <div className="project-image">
                    <FontAwesomeIcon icon={
                      project.type === 'web' ? faCode : 
                      project.type === 'mobile' ? faMobileAlt : faRobot
                    } />
                  </div>
                  <div className="project-details">
                    <div className="project-title">{project.title}</div>
                    <div className="project-description">{project.description}</div>
                    <div className="project-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <div className="progress-text">
                        <span>{project.progress}% مكتمل</span>
                        <span>{project.daysLeft} يوم متبقي</span>
                      </div>
                    </div>
                    <div className="project-actions">
                      <button className="project-btn project-btn-edit">
                        <FontAwesomeIcon icon={faEdit} /> تعديل
                      </button>
                      <button className="project-btn project-btn-view">
                        <FontAwesomeIcon icon={faEye} /> معاينة
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <footer>
        <p>© 2023 نظام إدارة مشاريع الطلاب | جامعة الملك سعود | جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
};

export default StudentProfile;