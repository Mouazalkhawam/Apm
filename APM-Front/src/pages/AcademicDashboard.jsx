import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
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

// إنشاء QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 دقائق
      cacheTime: 15 * 60 * 1000, // 15 دقيقة
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// تهيئة axios
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// إضافة interceptor للتحقق من الصلاحية
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

// مكون Sidebar مع forwardRef
const SidebarWithRef = React.forwardRef((props, ref) => (
  <Sidebar ref={ref} {...props} />
));

// المكون الرئيسي للوحة التحكم
const AcademicDashboard = () => {
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const chartRef = useRef(null);
  const mainContentRef = useRef(null);
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contentEffectClass, setContentEffectClass] = useState('');
  const [activeTimeRange, setActiveTimeRange] = useState('هذا الأسبوع');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);

  // استعلامات React Query
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const [gradResponse, semesterResponse, discussionsResponse] = await Promise.all([
        apiClient.get('/api/projects/current-graduation'),
        apiClient.get('/api/projects/current-semester'),
        apiClient.get('/api/discussions/current-month-count')
      ]);
      
      return {
        graduationProjects: gradResponse.data.count || 0,
        semesterProjects: semesterResponse.data.count || 0,
        pendingTasks: 0, // يمكن استبدالها بطلب API حقيقي
        newDiscussions: discussionsResponse.data.data?.count || 0
      };
    }
  });

  const { data: latestProjects, isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useQuery({
    queryKey: ['latestProjects'],
    queryFn: async () => {
      const response = await apiClient.get('/api/projects/latest');
      if (!response.data || !response.data.success) {
        throw new Error('Failed to fetch latest projects');
      }
      return response.data.data;
    }
  });

  const { data: projectsProgress, isLoading: progressLoading, error: progressError } = useQuery({
    queryKey: ['projectsProgress'],
    queryFn: async () => {
      const response = await apiClient.get('/api/projects/current-semester-with-progress');
      if (!response.data || !response.data.success) {
        throw new Error('Failed to fetch projects progress');
      }
      return response.data.data.projects;
    }
  });

  // إعداد بيانات الرسم البياني
  const [chartData, setChartData] = useState(null);

  const prepareChartData = (projects) => {
    const displayedProjects = projects.slice(0, 5);
    
    const labels = displayedProjects.map(project => project.title);
    const plannedData = displayedProjects.map(project => {
      if (activeTimeRange === 'هذا الأسبوع') {
        return project.progress.weekly.planned;
      } else if (activeTimeRange === 'هذا الشهر') {
        return project.progress.monthly.planned;
      } else {
        return 100;
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

  // تأثيرات الرسم البياني
  useEffect(() => {
    if (chartRef.current && chartData) {
      const ctx = chartRef.current.getContext('2d');
      
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
      
      ctx.chart = newChart;
    }
  }, [chartData]);

  useEffect(() => {
    if (projectsProgress && projectsProgress.length > 0) {
      prepareChartData(projectsProgress);
    }
  }, [projectsProgress, activeTimeRange]);

  // تأثيرات responsive
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

  // دوال التحكم في القائمة الجانبية
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
          { 
            icon: faProjectDiagram, 
            text: "المشاريع", 
            badge: stats ? (stats.graduationProjects + stats.semesterProjects) : 0, 
            path: "/projects" 
          },
          { icon: faUsers, text: "الطلاب", path:"/students" },
          { 
            icon: faCalendarCheck, 
            text: "المهام", 
            badge: stats?.pendingTasks || 0, 
            alert: true, 
            path: "/tasks" 
          },
          { icon: faFileAlt, text: "التقارير", path: "/reports" },
          { 
            icon: faComments, 
            text: "المناقشات", 
            badge: stats?.newDiscussions || 0, 
            path: "/discussions" 
          }
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
            
            {statsLoading || !stats ? (
              <div className="loading-stats">
                <FontAwesomeIcon icon={faSyncAlt} spin />
                جاري تحميل الإحصائيات...
              </div>
            ) : statsError ? (
              <div className="error-message">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                فشل في تحميل الإحصائيات
                <button onClick={() => queryClient.refetchQueries(['dashboardStats'])} className="retry-btn">
                  <FontAwesomeIcon icon={faSyncAlt} />
                  إعادة المحاولة
                </button>
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
                  {progressLoading || !projectsProgress ? (
                    <div className="chart-loading">
                      <FontAwesomeIcon icon={faSyncAlt} spin />
                      جاري تحميل بيانات التقدم...
                    </div>
                  ) : progressError ? (
                    <div className="chart-error">
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      فشل في تحميل بيانات التقدم
                    </div>
                  ) : (
                    <canvas id="progressChart" ref={chartRef}></canvas>
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
                    فشل في تحميل المشاريع
                    <button 
                      onClick={() => refetchProjects()}
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

// تغليف التطبيق بـ QueryClientProvider
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AcademicDashboard />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

export default App;