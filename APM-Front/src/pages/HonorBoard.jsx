import React, { useState, useEffect } from 'react';
import './HonorBoard.css';
import { 
  FaTrophy, FaMedal, FaUsers, FaUniversity, 
  FaStar, FaArrowLeft, FaSpinner
} from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // تأكد من تطابق هذا مع عنوان API الخاص بك

const HonorBoard = () => {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    projectsCount: 0,
    studentsCount: 0,
    typesCount: 0
  });

  // دالة لجلب التوكن من localStorage
  const getAuthToken = () => {
    return localStorage.getItem('access_token');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAuthToken();
        
        if (!token) {
          throw new Error('يجب تسجيل الدخول أولاً');
        }

        // جلب المشاريع المميزة من API مع إضافة header المصادقة
        const response = await axios.get(`${API_BASE_URL}/api/honor-board`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (response.data.success) {
          const projects = response.data.data;
          
          // تحويل البيانات لتتناسب مع الواجهة
          const formattedProjects = projects.map(project => ({
            id: project.id,
            title: project.project?.title || 'لا يوجد عنوان',
            type: project.type || project.project?.type || 'غير محدد',
            description: project.project?.description || project.notes || 'لا يوجد وصف',
            author: project.author || project.project?.author || 'مجهول',
            rating: project.rating || 4.5, // قيمة افتراضية إذا لم توجد
            featured_at: project.featured_at
          }));

          // فصل المشاريع المميزة (الأحدث)
          const sortedProjects = formattedProjects.sort((a, b) => 
            new Date(b.featured_at) - new Date(a.featured_at)
          );
          
          setFeaturedProjects(sortedProjects.slice(0, 3)); // أول 3 مشاريع كمشاريع مميزة
          setAllProjects(sortedProjects);
          
          // تحديث الإحصائيات
          setStats({
            projectsCount: sortedProjects.length,
            studentsCount: new Set(sortedProjects.map(p => p.author)).size,
            typesCount: new Set(sortedProjects.map(p => p.type)).size
          });
        }
      } catch (err) {
        let errorMessage = 'فشل في تحميل البيانات';
        
        if (err.response) {
          if (err.response.status === 401) {
            errorMessage = 'غير مصرح بالوصول. يرجى تسجيل الدخول';
          } else if (err.response.status === 403) {
            errorMessage = 'ليس لديك صلاحية لعرض هذه البيانات';
          } else {
            errorMessage = `خطأ في الخادم: ${err.response.status}`;
          }
        } else {
          errorMessage = err.message || 'حدث خطأ غير متوقع';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>حدث خطأ</h3>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="honor-board">
      {/* قسم البطل */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">
            <FaTrophy />
          </div>
          <h1 className="hero-title">لوحة الشرف الأكاديمية</h1>
          <p className="hero-description">
            هنا يتم عرض أفضل المشاريع الأكاديمية المتميزة سواء كانت فصلية أو مشاريع تخرج
          </p>
          <div className="hero-buttons">
            <button className="hero-btn primary-btn">تصفح المشاريع</button>
          </div>
        </div>
      </section>
      
      {/* قسم الإحصائيات */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-card-honor">
            <div className="stat-icon-honor">
              <FaMedal />
            </div>
            <h3 className="stat-number">{stats.projectsCount}</h3>
            <p className="stat-text">مشروع متميز</p>
          </div>
          
          <div className="stat-card-honor">
            <div className="stat-icon-honor">
              <FaUsers />
            </div>
            <h3 className="stat-number">{stats.studentsCount}</h3>
            <p className="stat-text">طالب مشارك</p>
          </div>
          
          <div className="stat-card-honor">
            <div className="stat-icon-honor">
              <FaUniversity />
            </div>
            <h3 className="stat-number">{stats.typesCount}</h3>
            <p className="stat-text">أنواع المشاريع</p>
          </div>
        </div>
      </section>
      
      {/* قسم المشاريع المميزة */}
      <section className="projects-section">
        <div className="section-title-honor">
          <h2>المشاريع المتميزة</h2>
          <p>أحدث المشاريع المضافة إلى لوحة الشرف</p>
        </div>
        
        {/* المشاريع المميزة */}
        <div className="top-projects">
          {featuredProjects.length > 0 ? (
            featuredProjects.map(project => (
              <div key={project.id} className="project-card-honor">
                <div className="project-content">
                  <div className="project-header-honor">
                    <h3 className="project-title-honor">{project.title}</h3>
                    <span className={`project-category ${project.type === 'تخرج' ? 'graduation' : 'semester'}`}>
                      {project.type}
                    </span>
                  </div>
                  <p className="project-description-honor">{project.description}</p>
                  <div className="project-footer">
                    <div className="project-author">
                      <div className="author-avatar">
                        {project.author.charAt(0)}
                      </div>
                      <span className="author-name">{project.author}</span>
                    </div>
                    <div className="project-rating">
                      <span className="rating-value">{project.rating.toFixed(1)}</span>
                      <FaStar className="star-icon" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-projects">
              <p>لا توجد مشاريع متميزة لعرضها</p>
            </div>
          )}
        </div>
        
        {/* جميع المشاريع */}
        <div className="all-projects-title">
          <h3>جميع المشاريع المتميزة</h3>
          <p>استكشف قائمة كاملة بالمشاريع المتميزة</p>
        </div>
        
        <div className="projects-grid">
          {allProjects.length > 0 ? (
            allProjects.map(project => (
              <div key={project.id} className="small-project-card">
                <div className="small-project-content">
                  <div className="small-project-header">
                    <h3 className="small-project-title-honor">{project.title}</h3>
                    <span className={`small-project-category ${project.type === 'تخرج' ? 'graduation' : 'semester'}`}>
                      {project.type}
                    </span>
                  </div>
                  <p className="small-project-description">{project.description}</p>
                  <div className="small-project-footer">
                    <div className="project-author">
                      <div className="small-author-avatar">
                        {project.author.charAt(0)}
                      </div>
                      <span className="small-author-name">{project.author}</span>
                    </div>
                    <div className="project-rating">
                      <span className="small-rating-value">{project.rating.toFixed(1)}</span>
                      <FaStar className="small-star-icon" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-projects">
              <p>لا توجد مشاريع لعرضها</p>
            </div>
          )}
        </div>
        
        {allProjects.length > 0 && (
          <div className="load-more">
            <button className="load-more-btn">
              <FaArrowLeft className="arrow-icon" />
              <span>عرض المزيد من المشاريع</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HonorBoard;