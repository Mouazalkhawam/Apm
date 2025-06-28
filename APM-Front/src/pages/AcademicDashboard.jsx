import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav'
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
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const chartRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  let progressChart = null;

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
              rtl: true
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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    if (sidebarRef.current && overlayRef.current) {
      sidebarRef.current.classList.add('sidebar-open');
      overlayRef.current.classList.add('overlay-open');
    }
  };
  
  const closeMobileSidebar = () => {
    if (sidebarRef.current && overlayRef.current) {
      sidebarRef.current.classList.remove('sidebar-open');
      overlayRef.current.classList.remove('overlay-open');
    }
  };

  return (
    <div className="dashboard-container-dash">
      <SidebarWithRef 
        ref={sidebarRef}
        user={{
          name: "د.عفاف",
          role: "منسق المشاريع",
          image: "https://randomuser.me/api/portraits/women/44.jpg"
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        navItems={[
          { icon: faTachometerAlt, text: "اللوحة الرئيسية", active: true, path: "/dashboard" },
          { icon: faProjectDiagram, text: "المشاريع", badge: 12 },
          { icon: faUsers, text: "الطلاب", path:"/Supervisor-Management-Coordinator" },
          { icon: faCalendarCheck, text: "المهام", badge: 5, alert: true, path: "/TasksPage" },
          { icon: faFileAlt, text: "التقارير" },
          { icon: faComments, text: "المناقشات", badge: 3 }
        ]}
      />
      
      <div id="overlay" className="overlay" ref={overlayRef} onClick={closeMobileSidebar}></div>
      
      <div className="main-content-cord-dash">
     
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
        <main className="content-area">
          <div className="container-dash">
            <div className="welcome-header">
              <h1 className="welcome-title">مرحباً د. عفاف 👋</h1>
              <p className="welcome-subtitle">هذه نظرة عامة على مشاريعك وطلابك اليوم</p>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-info">
                  <p className="stat-desc">إجمالي المشاريع</p>
                  <h3 className="stat-value">24</h3>
                  <p className="stat-trend green"><FontAwesomeIcon icon={faArrowUp} /> 5 مشاريع جديدة هذا الفصل</p>
                </div>
                <div className="stat-icon-container">
                  <FontAwesomeIcon icon={faProjectDiagram} />
                </div>
              </div>
              
              <div className="stat-card green">
                <div className="stat-info">
                  <p className="stat-desc">الطلاب المسجلين</p>
                  <h3 className="stat-value">143</h3>
                  <p className="stat-trend green"><FontAwesomeIcon icon={faArrowUp} /> 12 طالب جديد هذا الشهر</p>
                </div>
                <div className="stat-icon-container">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
              </div>
              
              <div className="stat-card yellow">
                <div className="stat-info">
                  <p className="stat-desc">المهام المعلقة</p>
                  <h3 className="stat-value">8</h3>
                  <p className="stat-trend red"><FontAwesomeIcon icon={faExclamationCircle} /> 3 مهام تأخرت</p>
                </div>
                <div className="stat-icon-container">
                  <FontAwesomeIcon icon={faTasks} />
                </div>
              </div>
              
              <div className="stat-card purple">
                <div className="stat-info">
                  <p className="stat-desc">المناقشات الجديدة</p>
                  <h3 className="stat-value">7</h3>
                  <p className="stat-trend blue"><FontAwesomeIcon icon={faCommentAlt} /> 2 تحتاج إجابتك</p>
                </div>
                <div className="stat-icon-container">
                  <FontAwesomeIcon icon={faComments} />
                </div>
              </div>
            </div>
            
            <div className="main-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <h2 className="chart-title">تقدم المشاريع</h2>
                  <select className="chart-select">
                    <option>هذا الأسبوع</option>
                    <option>هذا الشهر</option>
                    <option>هذا الفصل</option>
                  </select>
                </div>
                <div className="chart-container">
                  <canvas id="progressChart" ref={chartRef}></canvas>
                </div>
              </div>
              
              <div className="projects-card">
                <div className="projects-header">
                  <h2 className="projects-title">أحدث المشاريع</h2>
                  <a href="#" className="projects-link">عرض الكل</a>
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