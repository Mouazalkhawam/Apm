import React from 'react';
import './HonorBoard.css';
import { 
  FaTrophy, FaMedal, FaUsers, FaUniversity, 
  FaCrown, FaStar, FaArrowLeft,
  FaStarHalfAlt
} from 'react-icons/fa';

const HonorBoard = () => {
  // بيانات المشاريع المتميزة
  const topProjects = [
    {
      id: 1,
      title: "منصة التعليم الإلكتروني",
      category: "هندسة البرمجيات",
      description: "منصة متكاملة للتعليم عن بعد تحتوي على فصول افتراضية ونظام متابعة للطلاب. تم تطوير المنصة باستخدام أحدث تقنيات الويب وتوفر تجربة تعليمية تفاعلية للطلاب والمعلمين.",
      author: "أحمد الخالد",
      rating: 5.0,
      rank: 1
    },
    {
      id: 2,
      title: "نظام إدارة المكتبات",
      category: "علوم الحاسوب",
      description: "نظام متكامل لإدارة المكتبات الجامعية مع واجهة سهلة الاستخدام وتقارير مفصلة. يمكن للنظام إدارة عمليات الإعارة والإرجاع والفهرسة والبحث بفعالية عالية.",
      author: "سارة محمد",
      rating: 4.8,
      rank: 2
    },
    {
      id: 3,
      title: "تحليل بيانات طبية",
      category: "الذكاء الاصطناعي",
      description: "نظام يستخدم خوارزميات التعلم الآلي للتنبؤ بالأمراض بناءً على البيانات الطبية. يحلل النظام البيانات التاريخية للتنبؤ بالتشخيصات مع دقة تصل إلى 92% في بعض الحالات.",
      author: "نورا عبدالله",
      rating: 4.6,
      rank: 3
    }
  ];

  // جميع المشاريع
  const allProjects = [
    {
      id: 4,
      title: "نظام حجز المواعيد",
      category: "تطبيقات الويب",
      description: "نظام لإدارة المواعيد في العيادات الطبية مع إشعارات للمرضى عبر البريد الإلكتروني والرسائل النصية.",
      author: "خالد علي",
      rating: 4.5
    },
    {
      id: 5,
      title: "تطبيق ريادة الأعمال",
      category: "إدارة الأعمال",
      description: "منصة لريادة الأعمال تربط بين المستثمرين وأصحاب الأفكار الابتكارية مع أدوات لمتابعة المشاريع.",
      author: "لطيفة أحمد",
      rating: 4.7
    },
    {
      id: 6,
      title: "لعبة تعليمية للأطفال",
      category: "الوسائط المتعددة",
      description: "لعبة تفاعلية تعليمية لتعليم الأطفال أساسيات الرياضيات واللغات باستخدام أنماط تعليم مبتكرة.",
      author: "يوسف محمود",
      rating: 4.3
    },
    {
      id: 7,
      title: "نظام المراقبة الذكية",
      category: "الأمن السيبراني",
      description: "نظام مراقبة يستخدم الذكاء الاصطناعي للكشف عن التهديدات الأمنية في الشبكات وأنظمة الحماية.",
      author: "رزان فهد",
      rating: 4.9
    }
  ];

  // آراء المشرفين
  const testimonials = [
    {
      id: 1,
      name: "د. سعاد الناصر",
      position: "أستاذة علوم الحاسوب",
      rating: 5,
      text: "المستوى المتميز لمشاريع هذا العام يفوق التوقعات، خاصة مشروع منصة التعليم الإلكتروني الذي يتميز بواجهة مستخدم رائعة وخوارزميات فعالة."
    },
    {
      id: 2,
      name: "د. خالد الوهيبي",
      position: "أستاذ هندسة البرمجيات",
      rating: 4.5,
      text: "التطور الملحوظ في جودة المشاريع يظهر الجهد الكبير الذي يبذله الطلاب، نظام إدارة المكتبات كان مثالاً رائعاً على التطبيق العملي للنظريات التي ندرسها."
    }
  ];

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
            هنا يتم عرض أفضل المشاريع الأكاديمية المتميزة التي تم تقييمها من قبل الأساتذة والمشرفين
          </p>
          <div className="hero-buttons">
            <a href="#" className="hero-btn primary-btn">تصفح المشاريع</a>
            
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
            <h3 className="stat-number">42</h3>
            <p className="stat-text">مشروع متميز</p>
          </div>
          
          <div className="stat-card-honor">
            <div className="stat-icon-honor">
              <FaUsers />
            </div>
            <h3 className="stat-number">128</h3>
            <p className="stat-text">طالب مشارك</p>
          </div>
          
          <div className="stat-card-honor">
            <div className="stat-icon-honor">
              <FaUniversity />
            </div>
            <h3 className="stat-number">3</h3>
            <p className="stat-text">اختصاصات</p>
          </div>
        </div>
      </section>
      
      {/* قسم المشاريع المميزة */}
      <section className="projects-section">
        <div className="section-title-honor">
          <h2>المشاريع المتميزة لهذا الفصل</h2>
        </div>
        
        {/* أفضل 3 مشاريع */}
        <div className="top-projects">
          {topProjects.map(project => (
            <div 
              key={project.id} 
              className="project-card-honor"
              style={{ borderLeft: `4px solid ${project.rank === 1 ? '#FFD700' : project.rank === 2 ? '#C0C0C0' : '#CD7F32'}` }}
            >
              <div className="project-content">
                <div className={`project-badge ${project.rank === 1 ? 'gold-badge' : project.rank === 2 ? 'silver-badge' : 'bronze-badge'}`}>
                  {project.rank === 1 ? <FaCrown /> : <FaMedal />}
                  {project.rank === 1 ? 'المركز الأول' : project.rank === 2 ? 'المركز الثاني' : 'المركز الثالث'}
                </div>
                <div className="project-header-honor">
                  <h3 className="project-title-honor">{project.title}</h3>
                  <span className="project-category">{project.category}</span>
                </div>
                <p className="project-description-honor">{project.description}</p>
                <div className="project-footer">
                  <div className="project-author">
                    <div className="author-avatar"></div>
                    <span className="author-name">{project.author}</span>
                  </div>
                  <div className="project-rating">
                    <span className="rating-value">{project.rating.toFixed(1)}</span>
                    <FaStar />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* جميع المشاريع */}
        <div className="all-projects-title">
          <h3>جميع المشاريع المتميزة</h3>
          <p>استكشف جميع المشاريع التي حصلت على تقييم ممتاز من المشرفين</p>
        </div>
        
        <div className="projects-grid">
          {allProjects.map(project => (
            <div key={project.id} className="small-project-card">
              <div className="small-project-content">
                <div className="small-project-header">
                  <h3 className="small-project-title-honor">{project.title}</h3>
                  <span className="small-project-category">{project.category}</span>
                </div>
                <p className="small-project-description">{project.description}</p>
                <div className="small-project-footer">
                  <div className="project-author">
                    <div className="small-author-avatar"></div>
                    <span className="small-author-name">{project.author}</span>
                  </div>
                  <div className="project-rating">
                    <span className="small-rating-value">{project.rating.toFixed(1)}</span>
                    <FaStar />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="load-more">
          <button className="load-more-btn">
            <FaArrowLeft />
            عرض المزيد من المشاريع
          </button>
        </div>
      </section>
      
     
      
     
    </div>
  );
};

export default HonorBoard;