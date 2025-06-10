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
    // Initialize chart when component mounts
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

    // Cleanup chart when component unmounts
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
    <div className="dashboard-container">
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
        navItems={[
          { icon: faTachometerAlt, text: "اللوحة الرئيسية", active: true },
          { icon: faProjectDiagram, text: "المشاريع", badge: 12 },
          { icon: faUsers, text: "الطلاب" },
          { icon: faCalendarCheck, text: "المهام", badge: 5, alert: true },
          { icon: faFileAlt, text: "التقارير" },
          { icon: faComments, text: "المناقشات", badge: 3 }
        ]}
      />
      {/* Mobile Sidebar Toggle */}
      <button id="mobileSidebarToggle" className="mobile-sidebar-toggle" onClick={toggleMobileSidebar}>
        <FontAwesomeIcon icon={faBars} />
      </button>
      
      {/* Overlay */}
      <div id="overlay" className="overlay" ref={overlayRef} onClick={closeMobileSidebar}></div>
      
      {/* Main Content */}
      <div className="main-content">
        {/* Top Navigation */}
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
        
        {/* Main Content Area */}
        <main className="content-area">
          <div className="container">
            {/* Welcome Header */}
            <div className="welcome-header">
              <h1 className="welcome-title">مرحباً د. عفاف 👋</h1>
              <p className="welcome-subtitle">هذه نظرة عامة على مشاريعك وطلابك اليوم</p>
            </div>
            
            {/* Stats Cards */}
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
            
            {/* Charts and Projects */}
            <div className="main-grid">
              {/* Progress Chart */}
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
              
              {/* Recent Projects */}
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
            
            {/* Tasks and Students */}
            <div className="tasks-students-grid">
              {/* Upcoming Tasks */}
              <div className="tasks-card">
                <div className="tasks-header">
                  <h2 className="tasks-title">المهام القادمة</h2>
                  <a href="#" className="tasks-link">عرض الكل</a>
                </div>
                <div className="tasks-list">
                  <div className="task-item red">
                    <div className="task-header">
                      <div>
                        <h4 className="task-title">مراجعة مشروع الذكاء الاصطناعي</h4>
                        <p className="task-date">غداً 10:00 ص</p>
                      </div>
                      <button className="task-more">
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="task-item yellow">
                    <div className="task-header">
                      <div>
                        <h4 className="task-title">اجتماع مع فريق البحث</h4>
                        <p className="task-date">بعد غد 2:00 م</p>
                      </div>
                      <button className="task-more">
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="task-item green">
                    <div className="task-header">
                      <div>
                        <h4 className="task-title">تسليم الدرجات النهائية</h4>
                        <p className="task-date">الخميس 4:00 م</p>
                      </div>
                      <button className="task-more">
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="task-item blue">
                    <div className="task-header">
                      <div>
                        <h4 className="task-title">تقديم ورشة عمل</h4>
                        <p className="task-date">السبت 11:00 ص</p>
                      </div>
                      <button className="task-more">
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Students */}
              <div className="students-card">
                <div className="students-header">
                  <h2 className="students-title">أحدث الطلاب المسجلين</h2>
                  <a href="#" className="students-link">عرض الكل</a>
                </div>
                <div className="overflow-x-auto">
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>الطالب</th>
                        <th>المشروع</th>
                        <th>التقدم</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div className="student-cell">
                            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="" className="student-image" />
                            <div>
                              <div className="student-name">أحمد محمود</div>
                              <div className="student-degree">بكالوريوس حاسوب</div>
                            </div>
                          </div>
                        </td>
                        <td>تطبيق حجز مواعيد</td>
                        <td>
                          <div className="progress-container">
                            <div className="progress-bar">
                              <div className="progress-fill green" style={{width: '65%'}}></div>
                            </div>
                            <span className="progress-text">65%</span>
                          </div>
                        </td>
                        <td>
                          <span className="status-badge green">نشط</span>
                        </td>
                        <td>
                          <button className="action-button">
                            <FontAwesomeIcon icon={faEnvelope} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="student-cell">
                            <img src="https://randomuser.me/api/portraits/women/63.jpg" alt="" className="student-image" />
                            <div>
                              <div className="student-name">نورا عبدالله</div>
                              <div className="student-degree">ماجستير ذكاء اصطناعي</div>
                            </div>
                          </div>
                        </td>
                        <td>نظام توصية المقررات</td>
                        <td>
                          <div className="progress-container">
                            <div className="progress-bar">
                              <div className="progress-fill yellow" style={{width: '30%'}}></div>
                            </div>
                            <span className="progress-text">30%</span>
                          </div>
                        </td>
                        <td>
                          <span className="status-badge yellow">بحاجة لمتابعة</span>
                        </td>
                        <td>
                          <button className="action-button">
                            <FontAwesomeIcon icon={faEnvelope} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="student-cell">
                            <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="" className="student-image" />
                            <div>
                              <div className="student-name">محمد خالد</div>
                              <div className="student-degree">بكالوريوس شبكات</div>
                            </div>
                          </div>
                        </td>
                        <td>تحليل بيانات الطلاب</td>
                        <td>
                          <div className="progress-container">
                            <div className="progress-bar">
                              <div className="progress-fill blue" style={{width: '85%'}}></div>
                            </div>
                            <span className="progress-text">85%</span>
                          </div>
                        </td>
                        <td>
                          <span className="status-badge green">نشط</span>
                        </td>
                        <td>
                          <button className="action-button">
                            <FontAwesomeIcon icon={faEnvelope} />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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