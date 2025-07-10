import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTachometerAlt, faProjectDiagram, faUsers, 
  faCalendarCheck, faFileAlt, faComments,
  faBars, faChevronLeft, faSearch, faBell, 
  faEnvelope, faEllipsisV, faLaptopCode, 
  faMobileAlt, faChartLine, faRobot, 
  faArrowUp, faExclamationCircle, faCommentAlt,
  faTasks, faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import './SupervisorDashboard.css';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';
import axios from 'axios';
import Chart from 'chart.js/auto';

const SidebarWithRef = React.forwardRef((props, ref) => (
  <Sidebar ref={ref} {...props} />
));

const SupervisorDashboard = () => {
  // Refs
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const chartRef = useRef(null);
  const mainContentRef = useRef(null);
  
  // States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contentEffectClass, setContentEffectClass] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);
  const [averageGrade, setAverageGrade] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supervisorInfo, setSupervisorInfo] = useState({
    name: '',
    image: ''
  });
  const [pendingTasks, setPendingTasks] = useState([]);

  // Initialize chart
  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      const progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['نظام إدارة المشاريع', 'تطبيق الجوال التعليمي', 'موقع التجارة الإلكترونية', 'نظام التوصية', 'تحليل البيانات'],
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
              data: [75, 45, 30, 50, 40],
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

      return () => {
        if (progressChart) {
          progressChart.destroy();
        }
      };
    }
  }, []);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          throw new Error('لم يتم العثور على token في localStorage');
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        // 1. جلب معلومات المشرف
        const checkResponse = await axios.get('http://127.0.0.1:8000/api/check-supervisor', config);
        
        if (!checkResponse.data.is_supervisor) {
          throw new Error('المستخدم الحالي ليس مشرفًا');
        }

        setSupervisorInfo({
          name: checkResponse.data.name,
          image: checkResponse.data.profile_picture || 'https://randomuser.me/api/portraits/women/44.jpg'
        });

        const supervisorId = checkResponse.data.supervisor_id;

        // 2. جلب عدد المشاريع النشطة
        const projectsResponse = await axios.get(
          `http://127.0.0.1:8000/api/supervisors/${supervisorId}/active-projects-count`, 
          config
        );
        setActiveProjectsCount(projectsResponse.data.active_projects_count);

        // 3. جلب المهام المعلقة
        const pendingTasksResponse = await axios.get(
          'http://127.0.0.1:8000/api/pending-tasks',
          config
        );
        
        setPendingTasks(pendingTasksResponse.data.data.tasks);
        setPendingTasksCount(pendingTasksResponse.data.data.pending_tasks_count);

        // 4. جلب البيانات الأخرى
        setActiveStudentsCount(23);
        setAverageGrade(88);

      } catch (err) {
        console.error('حدث خطأ أثناء جلب البيانات:', err);
        setError(err.message || 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle window resize and remove content-effect when mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 769;
      setIsMobile(mobile);
      
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

  // Function to format task due date
  const formatDueDate = (createdAt) => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays === 0) {
      return 'اليوم';
    } else if (diffDays === 1) {
      return 'غدًا';
    } else if (diffDays > 1 && diffDays <= 7) {
      return `${diffDays} أيام`;
    } else {
      return new Date(createdAt).toLocaleDateString('ar-EG');
    }
  };

  // Function to get task status
  const getTaskStatus = (status) => {
    switch(status) {
      case 'pending':
        return 'في الانتظار';
      case 'approved':
        return 'مقبولة';
      case 'rejected':
        return 'مرفوضة';
      case 'overdue':
        return 'متأخرة';
      default:
        return 'غير معروف';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <FontAwesomeIcon icon={faExclamationCircle} className="error-icon" />
        <p className="error-message">{error}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container-dash-sup">
      {/* Sidebar Component */}
      <SidebarWithRef 
        ref={sidebarRef}
        user={{
          name: supervisorInfo.name || "د.عفاف",
          role: "مشرف",
          image: supervisorInfo.image
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        onToggleEffect={toggleContentEffect}
        navItems={[
          { icon: faTachometerAlt, text: "اللوحة الرئيسية", active: true, path: "/supervisors-dashboard" },
          { icon: faProjectDiagram, text: "المشاريع", badge: activeProjectsCount, path: "/supervisor-project" },
          { icon: faUsers, text: "الطلاب", path:"/students" },
          { icon: faCalendarCheck, text: "المهام", badge: pendingTasksCount, alert: true, path: "/tasks" },
          { icon: faFileAlt, text: "التقارير", path: "/reports" },
          { icon: faComments, text: "جدولة الاجتماعات", badge: 3, path: "/scheduling-supervisors-meetings" }
        ]}
      />
      
      {/* Overlay for mobile sidebar */}
      <div id="overlay" className="overlay" ref={overlayRef} onClick={closeMobileSidebar}></div>
      
      {/* Main Content Area */}
      <div className={`main-container ${!isMobile ? contentEffectClass : ''}`} ref={mainContentRef}>
        <div className="supervisor-dashboard">
          {/* Top Navigation */}
          <div className='nav-top-dash'>
            <TopNav 
              user={{
                name: supervisorInfo.name || "د.عفاف",
                image: supervisorInfo.image
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
          
          <main className="main-content-supervisor">
            <h1 className="page-title">مرحباً {supervisorInfo.name || "د.عفاف"} 👋</h1>
            <p className="welcome-subtitle">هذه نظرة عامة على مشاريعك وطلابك اليوم</p>
            
            <div className="stats-container-dash-super">
              <div className="stat-card-dash-super blue">
                <div className="stat-info">
                  <p className="stat-desc">المشاريع النشطة</p>
                  <h3 className="stat-value">{activeProjectsCount}</h3>
                  <p className="stat-trend green">
                    <FontAwesomeIcon icon={faArrowUp} /> 2 عن الشهر الماضي
                  </p>
                </div>
                <div className="stat-icon-container">
                  <FontAwesomeIcon icon={faProjectDiagram} />
                </div>
              </div>
              
              <div className="stat-card-dash-super yellow">
                <div className="stat-info">
                  <p className="stat-desc">المهام المعلقة</p>
                  <h3 className="stat-value">{pendingTasksCount}</h3>
                  <p className="stat-trend red">
                    <FontAwesomeIcon icon={faExclamationCircle} /> 3 متأخرة
                  </p>
                </div>
                <div className="stat-icon-container">
                  <FontAwesomeIcon icon={faTasks} />
                </div>
              </div>
              
              <div className="stat-card-dash-super green">
                <div className="stat-info">
                  <p className="stat-desc">الطلاب النشطين</p>
                  <h3 className="stat-value">{activeStudentsCount}</h3>
                  <p className="stat-trend green">
                    <FontAwesomeIcon icon={faArrowUp} /> من أصل 28 طالب
                  </p>
                </div>
                <div className="stat-icon-container">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
              </div>
              
              <div className="stat-card-dash-super purple">
                <div className="stat-info">
                  <p className="stat-desc">إجمالي الدرجات</p>
                  <h3 className="stat-value">{averageGrade}%</h3>
                  <p className="stat-trend blue">
                    <FontAwesomeIcon icon={faChartLine} /> متوسط أداء الطلاب
                  </p>
                </div>
                <div className="stat-icon-container">
                  <FontAwesomeIcon icon={faFileAlt} />
                </div>
              </div>
            </div>
            
            {/* Progress Chart Section */}
            <section className="chart-section">
              <div className="section-header-dash-super">
                <h2 className="section-title">تقدم المشاريع</h2>
                <div className="chart-actions">
                  <select className="chart-select">
                    <option>هذا الأسبوع</option>
                    <option>هذا الشهر</option>
                    <option>هذا الفصل</option>
                  </select>
                </div>
              </div>
              <div className="chart-container">
                <canvas id="progressChart" ref={chartRef}></canvas>
              </div>
            </section>
            
            <div className="projects-tasks-grid">
              {/* Projects Section */}
              <section className="projects-section">
                <div className="section-header-dash-super">
                  <h2 className="section-title">المشاريع المشرف عليها</h2>
                  <a href="/projects" className="view-all">عرض الكل</a>
                </div>
                
                <div className="projects-grid-dash-super">
                  <div className="project-card-dash-super">
                    <div className="project-icon-container">
                      <FontAwesomeIcon icon={faLaptopCode} />
                    </div>
                    <div className="project-info">
                      <h3 className="project-title-dash-super">نظام إدارة المشاريع</h3>
                      <div className="project-meta">
                        <span>4 طلاب</span>
                        <span>تاريخ التسليم: 15 يونيو</span>
                      </div>
                      <div className="progress-bar-dash-super">
                        <div className="progress" style={{width: '75%'}}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="project-card-dash-super">
                    <div className="project-icon-container">
                      <FontAwesomeIcon icon={faMobileAlt} />
                    </div>
                    <div className="project-info">
                      <h3 className="project-title-dash-super">تطبيق الجوال التعليمي</h3>
                      <div className="project-meta">
                        <span>3 طلاب</span>
                        <span>تاريخ التسليم: 22 يونيو</span>
                      </div>
                      <div className="progress-bar-dash-super">
                        <div className="progress" style={{width: '45%'}}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="project-card-dash-super">
                    <div className="project-icon-container">
                      <FontAwesomeIcon icon={faRobot} />
                    </div>
                    <div className="project-info">
                      <h3 className="project-title-dash-super">نظام التوصية</h3>
                      <div className="project-meta">
                        <span>5 طلاب</span>
                        <span>تاريخ التسليم: 30 يونيو</span>
                      </div>
                      <div className="progress-bar-dash-super">
                        <div className="progress" style={{width: '30%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* Tasks Section */}
              <section className="tasks-section">
                <div className="section-header-dash-super">
                  <h2 className="section-title">المهام المعلقة</h2>
                  <a href="/tasks" className="view-all">عرض الكل</a>
                </div>
                
                <ul className="tasks-list">
                  {pendingTasks.length > 0 ? (
                    pendingTasks.map((task, index) => (
                      <li className="task-item-dash-super" key={index}>
                        <div className="task-icon">
                          {task.type === 'membership' && <FontAwesomeIcon icon={faUsers} />}
                          {task.type === 'task_evaluation' && <FontAwesomeIcon icon={faFileAlt} />}
                          {task.type === 'stage_evaluation' && <FontAwesomeIcon icon={faTasks} />}
                        </div>
                        <div className="task-info">
                          <h4 className="task-title-dash-super">
                            {task.type === 'membership' && 'طلب عضوية مجموعة'}
                            {task.type === 'task_evaluation' && 'تقييم مهمة: ' + (task.task_data?.title || '')}
                            {task.type === 'stage_evaluation' && 'تقييم مرحلة'}
                          </h4>
                          <span className="task-project">
                            {task.group_data?.group_name || 'غير محدد'}
                          </span>
                        </div>
                        <span className="task-due">{formatDueDate(task.created_at)}</span>
                        <span className={`task-status status-${task.status}`}>
                          {getTaskStatus(task.status)}
                        </span>
                      </li>
                    ))
                  ) : (
                    <div className="no-tasks-message">
                      <p>لا توجد مهام معلقة حالياً</p>
                    </div>
                  )}
                </ul>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;