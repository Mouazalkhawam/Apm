import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, faSearch, faBell, faEnvelope, 
  faEllipsisV, faLaptopCode, faMobileAlt,
  faChartLine, faRobot, faArrowUp, 
  faExclamationCircle, faCommentAlt,
  faTasks, faChevronDown, faTachometerAlt,
  faProjectDiagram, faUsers, faCalendarCheck,
  faFileAlt, faComments
} from '@fortawesome/free-solid-svg-icons';
import Chart from 'chart.js/auto';
import './AcademicDashboard.css';

const SidebarWithRef = React.forwardRef((props, ref) => (
  <Sidebar ref={ref} {...props} />
));

const AcademicDashboard = () => {
  // Refs
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const chartRef = useRef(null);
  const mainContentRef = useRef(null);
  
  // States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contentEffectClass, setContentEffectClass] = useState('');
  const [activeTimeRange, setActiveTimeRange] = useState('هذا الأسبوع');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
  
  // Chart instance
  let progressChart = null;

  // Initialize chart
  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['مشروع الذكاء الاصطناعي', 'تطبيق حجز مواعيد', 'تحليل البيانات', 'نظام المخابر', 'نظام التوصية'],
          datasets: [
            {
              label: 'التقدم المخطط',
              data: [80, 60, 90, 70, 45],
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              borderColor: 'rgba(99, 102, 241, 1)',
              borderWidth: 1
            },
            {
              label: 'التقدم الفعلي',
              data: [65, 40, 85, 50, 30],
              backgroundColor: 'rgba(79, 70, 229, 0.7)',
              borderColor: 'rgba(79, 70, 229, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              stacked: false,
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              rtl: true,
              labels: {
                usePointStyle: true,
                padding: 20
              }
            }
          }
        }
      });
    }

    return () => {
      if (progressChart) {
        progressChart.destroy();
      }
    };
  }, []);

  // Handle window resize and remove content-effect when mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 769;
      setIsMobile(mobile);
      
      // Remove content-effect class when switching to mobile
      if (mobile && contentEffectClass === 'content-effect') {
        setContentEffectClass('');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [contentEffectClass]);

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Toggle content effect - only if not mobile
  const toggleContentEffect = () => {
    if (!isMobile) {
      setContentEffectClass(prev => prev === 'content-effect' ? '' : 'content-effect');
    }
  };

  // Mobile sidebar handlers
  const toggleMobileSidebar = () => {
    sidebarRef.current?.classList.add('sidebar-open');
    overlayRef.current?.classList.add('overlay-open');
  };
  
  const closeMobileSidebar = () => {
    sidebarRef.current?.classList.remove('sidebar-open');
    overlayRef.current?.classList.remove('overlay-open');
  };

  // Handle time range change
  const handleTimeRangeChange = (e) => {
    setActiveTimeRange(e.target.value);
    // Here you would typically update chart data based on selected range
  };

  return (
    <div className="dashboard-container-dash">
      {/* Sidebar Component */}
      <SidebarWithRef 
        ref={sidebarRef}
        user={{
          name: "د.عفاف",
          role: "منسق المشاريع",
          image: "https://randomuser.me/api/portraits/women/44.jpg"
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        onToggleEffect={toggleContentEffect}
        navItems={[
          { icon: faTachometerAlt, text: "اللوحة الرئيسية", active: true, path: "/dashboard" },
          { icon: faProjectDiagram, text: "المشاريع", badge: 12, path: "/projects" },
          { icon: faUsers, text: "الطلاب", path:"/students" },
          { icon: faCalendarCheck, text: "المهام", badge: 5, alert: true, path: "/tasks" },
          { icon: faFileAlt, text: "التقارير", path: "/reports" },
          { icon: faComments, text: "المناقشات", badge: 3, path: "/discussions" }
        ]}
      />
      
      {/* Overlay for mobile sidebar */}
      <div id="overlay" className="overlay" ref={overlayRef} onClick={closeMobileSidebar}></div>
      
      {/* Main Content Area */}
      <div className={`main-content-cord-dash ${!isMobile ? contentEffectClass : ''}`} ref={mainContentRef}>
        {/* Top Navigation */}
        <div className='nav-top-dash'>
          <TopNav 
            user={{
              name: "د.عفاف",
              image: "https://randomuser.me/api/portraits/women/44.jpg"
            }}
            notifications={{
              bell: 3,
              envelope: 7
            }}
            searchPlaceholder="ابحث عن مشاريع، طلاب، مهام..."
          />
          <button id="mobileSidebarToggle" className="mobile-sidebar-toggle" onClick={toggleMobileSidebar}>
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
        
        {/* Dashboard Content */}
        <main className="content-area">
          <div className="container-dash">
            {/* Welcome Header */}
            <div className="welcome-header">
              <h1 className="welcome-title">مرحباً د. عفاف 👋</h1>
              <p className="welcome-subtitle">هذه نظرة عامة على مشاريعك وطلابك اليوم</p>
            </div>
            
            {/* Stats Cards Grid */}
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-info">
                  <p className="stat-desc">إجمالي المشاريع</p>
                  <h3 className="stat-value">24</h3>
                  <p className="stat-trend green">
                    <FontAwesomeIcon icon={faArrowUp} /> 5 مشاريع جديدة هذا الفصل
                  </p>
                </div>
                <div className="stat-icon-container">
                  <FontAwesomeIcon icon={faProjectDiagram} />
                </div>
              </div>
              
              <div className="stat-card green">
                <div className="stat-info">
                  <p className="stat-desc">الطلاب المسجلين</p>
                  <h3 className="stat-value">143</h3>
                  <p className="stat-trend green">
                    <FontAwesomeIcon icon={faArrowUp} /> 12 طالب جديد هذا الشهر
                  </p>
                </div>
                <div className="stat-icon-container">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
              </div>
              
              <div className="stat-card yellow">
                <div className="stat-info">
                  <p className="stat-desc">المهام المعلقة</p>
                  <h3 className="stat-value">8</h3>
                  <p className="stat-trend red">
                    <FontAwesomeIcon icon={faExclamationCircle} /> 3 مهام تأخرت
                  </p>
                </div>
                <div className="stat-icon-container">
                  <FontAwesomeIcon icon={faTasks} />
                </div>
              </div>
              
              <div className="stat-card purple">
                <div className="stat-info">
                  <p className="stat-desc">المناقشات الجديدة</p>
                  <h3 className="stat-value">7</h3>
                  <p className="stat-trend blue">
                    <FontAwesomeIcon icon={faCommentAlt} /> 2 تحتاج إجابتك
                  </p>
                </div>
                <div className="stat-icon-container">
                  <FontAwesomeIcon icon={faComments} />
                </div>
              </div>
            </div>
            
            {/* Main Content Grid */}
            <div className="main-grid">
              {/* Progress Chart Card */}
              <div className="chart-card">
                <div className="chart-header">
                  <h2 className="chart-title">تقدم المشاريع</h2>
                  <select 
                    className="chart-select" 
                    value={activeTimeRange}
                    onChange={handleTimeRangeChange}
                  >
                    <option>هذا الأسبوع</option>
                    <option>هذا الشهر</option>
                    <option>هذا الفصل</option>
                  </select>
                </div>
                <div className="chart-container">
                  <canvas id="progressChart" ref={chartRef}></canvas>
                </div>
              </div>
              
              {/* Projects List Card */}
              <div className="projects-card">
                <div className="projects-header">
                  <h2 className="projects-title">أحدث المشاريع</h2>
                  <a href="/projects" className="projects-link">عرض الكل</a>
                </div>
                <div className="projects-list">
                  <div className="project-item">
                    <div className="project-icon-container">
                      <FontAwesomeIcon icon={faLaptopCode} />
                    </div>
                    <div className="project-info">
                      <h4>نظام إدارة المخابر</h4>
                      <p>3 طلاب · 75% مكتمل</p>
                    </div>
                  </div>
                  
                  <div className="project-item green">
                    <div className="project-icon-container">
                      <FontAwesomeIcon icon={faMobileAlt} />
                    </div>
                    <div className="project-info">
                      <h4>تطبيق حجز مواعيد</h4>
                      <p>2 طلاب · 40% مكتمل</p>
                    </div>
                  </div>
                  
                  <div className="project-item purple">
                    <div className="project-icon-container">
                      <FontAwesomeIcon icon={faChartLine} />
                    </div>
                    <div className="project-info">
                      <h4>تحليل بيانات الطلاب</h4>
                      <p>4 طلاب · 90% مكتمل</p>
                    </div>
                  </div>
                  
                  <div className="project-item yellow">
                    <div className="project-icon-container">
                      <FontAwesomeIcon icon={faRobot} />
                    </div>
                    <div className="project-info">
                      <h4>نظام توصية المقررات</h4>
                      <p>5 طلاب · 30% مكتمل</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AcademicDashboard;