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
  faFileAlt, faComments, faSyncAlt,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import Chart from 'chart.js/auto';
import axios from 'axios';
import './AcademicDashboard.css';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const SidebarWithRef = React.forwardRef((props, ref) => (
  <Sidebar ref={ref} {...props} />
));

const AcademicDashboard = () => {
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const chartRef = useRef(null);
  const mainContentRef = useRef(null);
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contentEffectClass, setContentEffectClass] = useState('');
  const [activeTimeRange, setActiveTimeRange] = useState('هذا الأسبوع');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    graduationProjects: 0,
    semesterProjects: 0,
    pendingTasks: 0,
    newDiscussions: 0
  });
  
  const [latestProjects, setLatestProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(null);
  const [projectsProgress, setProjectsProgress] = useState([]);
  const [chartData, setChartData] = useState(null);

  const fetchCurrentMonthDiscussions = async () => {
    try {
      const response = await apiClient.get('/api/discussions/current-month-count');
      if (response.data && response.data.success) {
        return response.data.data.count;
      }
      throw new Error('Failed to fetch discussions count');
    } catch (error) {
      console.error('Error fetching discussions count:', error);
      return 0;
    }
  };

  const fetchLatestProjects = async () => {
    try {
      setProjectsLoading(true);
      setProjectsError(null);
      
      const response = await apiClient.get('/api/projects/latest');
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to fetch latest projects');
      }
      
      setLatestProjects(response.data.data);
    } catch (error) {
      setProjectsError(error.message || 'حدث خطأ أثناء جلب أحدث المشاريع');
      console.error('Error fetching latest projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchProjectsProgress = async () => {
    try {
      const response = await apiClient.get('/api/projects/current-semester-with-progress');
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to fetch projects progress');
      }
      
      setProjectsProgress(response.data.data.projects);
      prepareChartData(response.data.data.projects);
    } catch (error) {
      console.error('Error fetching projects progress:', error);
    }
  };

  const prepareChartData = (projects) => {
    // نأخذ أول 5 مشاريع للعرض في الرسم البياني
    const displayedProjects = projects.slice(0, 5);
    
    const labels = displayedProjects.map(project => project.title);
    const plannedData = displayedProjects.map(project => {
      if (activeTimeRange === 'هذا الأسبوع') {
        return project.progress.weekly.planned;
      } else if (activeTimeRange === 'هذا الشهر') {
        return project.progress.monthly.planned;
      } else {
        return 100; // التقدم المخطط الكلي هو 100%
      }
    });
    
    const actualData = displayedProjects.map(project => {
      if (activeTimeRange === 'هذا الأسبوع') {
        return project.progress.weekly.actual;
      } else if (activeTimeRange === 'هذا الشهر') {
        return project.progress.monthly.actual;
      } else {
        return project.progress.total.percentage;
      }
    });
    
    setChartData({
      labels,
      plannedData,
      actualData
    });
  };

  useEffect(() => {
    if (chartRef.current && chartData) {
      const ctx = chartRef.current.getContext('2d');
      
      // تدمير الرسم البياني القديم إذا كان موجوداً
      if (ctx.chart) {
        ctx.chart.destroy();
      }
      
      const newChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: 'التقدم المخطط',
              data: chartData.plannedData,
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              borderColor: 'rgba(99, 102, 241, 1)',
              borderWidth: 1
            },
            {
              label: 'التقدم الفعلي',
              data: chartData.actualData,
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
      
      // حفظ المرجع للرسم البياني الجديد
      ctx.chart = newChart;
    }
  }, [chartData]);

  useEffect(() => {
    if (projectsProgress.length > 0) {
      prepareChartData(projectsProgress);
    }
  }, [activeTimeRange]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const gradResponse = await apiClient.get('/api/projects/current-graduation');
        const gradCount = gradResponse.data.count;
        
        const semesterResponse = await apiClient.get('/api/projects/current-semester');
        const semesterCount = semesterResponse.data.count;
        
        const tasksCount = 0;
        
        const discussionsCount = await fetchCurrentMonthDiscussions();
        
        setStats({
          graduationProjects: gradCount,
          semesterProjects: semesterCount,
          pendingTasks: tasksCount,
          newDiscussions: discussionsCount
        });
        
      } catch (error) {
        console.error('Error fetching stats:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
    fetchLatestProjects();
    fetchProjectsProgress();
  }, []);

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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleContentEffect = () => {
    if (!isMobile) {
      setContentEffectClass(prev => prev === 'content-effect' ? '' : 'content-effect');
    }
  };

  const toggleMobileSidebar = () => {
    sidebarRef.current?.classList.add('sidebar-open');
    overlayRef.current?.classList.add('overlay-open');
  };
  
  const closeMobileSidebar = () => {
    sidebarRef.current?.classList.remove('sidebar-open');
    overlayRef.current?.classList.remove('overlay-open');
  };

  const handleTimeRangeChange = (e) => {
    setActiveTimeRange(e.target.value);
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'قيد الانتظار',
      'in_progress': 'قيد التنفيذ',
      'completed': 'مكتمل',
      'rejected': 'مرفوض'
    };
    
    return statusMap[status] || status;
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
        onToggleEffect={toggleContentEffect}
        navItems={[
          { icon: faTachometerAlt, text: "اللوحة الرئيسية", active: true, path: "/dashboard" },
          { icon: faProjectDiagram, text: "المشاريع", badge: stats.graduationProjects + stats.semesterProjects, path: "/projects" },
          { icon: faUsers, text: "الطلاب", path:"/students" },
          { icon: faCalendarCheck, text: "المهام", badge: stats.pendingTasks, alert: true, path: "/tasks" },
          { icon: faFileAlt, text: "التقارير", path: "/reports" },
          { icon: faComments, text: "المناقشات", badge: stats.newDiscussions, path: "/discussions" }
        ]}
      />
      
      <div id="overlay" className="overlay" ref={overlayRef} onClick={closeMobileSidebar}></div>
      
      <div className={`main-content-cord-dash ${!isMobile ? contentEffectClass : ''}`} ref={mainContentRef}>
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
            
            {loading ? (
              <div className="loading-stats">
                <FontAwesomeIcon icon={faSyncAlt} spin />
                جاري تحميل الإحصائيات...
              </div>
            ) : (
              <div className="stats-grid">
                <div className="stat-card blue">
                  <div className="stat-info">
                    <p className="stat-desc">إجمالي مشاريع التخرج</p>
                    <h3 className="stat-value">{stats.graduationProjects}</h3>
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
                    <p className="stat-desc">إجمالي المشاريع الفصلية</p>
                    <h3 className="stat-value">{stats.semesterProjects}</h3>
                    <p className="stat-trend green">
                      <FontAwesomeIcon icon={faArrowUp} /> 12 مشروع جديد هذا الشهر
                    </p>
                  </div>
                  <div className="stat-icon-container">
                    <FontAwesomeIcon icon={faUsers} />
                  </div>
                </div>
                
                <div className="stat-card yellow">
                  <div className="stat-info">
                    <p className="stat-desc">المهام المعلقة</p>
                    <h3 className="stat-value">{stats.pendingTasks}</h3>
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
                    <p className="stat-desc">المناقشات خلال الشهر الجاري</p>
                    <h3 className="stat-value">{stats.newDiscussions}</h3>
                    <p className="stat-trend blue">
                      <FontAwesomeIcon icon={faCommentAlt} /> 2 تحتاج إجابتك
                    </p>
                  </div>
                  <div className="stat-icon-container">
                    <FontAwesomeIcon icon={faComments} />
                  </div>
                </div>
              </div>
            )}
            
            <div className="main-grid">
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
                  {projectsProgress.length > 0 ? (
                    <canvas id="progressChart" ref={chartRef}></canvas>
                  ) : (
                    <div className="chart-loading">
                      <FontAwesomeIcon icon={faSyncAlt} spin />
                      جاري تحميل بيانات التقدم...
                    </div>
                  )}
                </div>
              </div>
              
              <div className="projects-card">
                <div className="projects-header">
                  <h2 className="projects-title">أحدث المشاريع</h2>
                  <a href="/projects" className="projects-link">عرض الكل</a>
                </div>
                
                {projectsLoading ? (
                  <div className="loading-projects">
                    <FontAwesomeIcon icon={faSyncAlt} spin />
                    جاري تحميل المشاريع...
                  </div>
                ) : projectsError ? (
                  <div className="projects-error">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    {projectsError}
                    <button 
                      onClick={fetchLatestProjects}
                      className="retry-btn"
                    >
                      <FontAwesomeIcon icon={faSyncAlt} />
                      إعادة المحاولة
                    </button>
                  </div>
                ) : (
                  <div className="projects-list-dash">
                    {latestProjects.map((project, index) => {
                      const colors = ['', 'green', 'purple', 'yellow'];
                      const colorClass = colors[index % colors.length];
                      
                      let projectIcon = faLaptopCode;
                      if (project.type === 'graduation') {
                        projectIcon = faProjectDiagram;
                      } else if (project.type === 'semester') {
                        projectIcon = faTasks;
                      }
                      
                      return (
                        <div className={`project-item ${colorClass}`} key={project.project_id}>
                          <div className="project-icon-container">
                            <FontAwesomeIcon icon={projectIcon} />
                          </div>
                          <div className="project-info">
                            <h4>{project.title}</h4>
                            <p>
                              {project.students_count} طالب · 
                              الحالة: {getStatusText(project.status)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AcademicDashboard;