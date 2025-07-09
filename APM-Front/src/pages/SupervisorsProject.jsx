import React, { useEffect, useRef, useState } from 'react';
import './SupervisorsProject.css';
import TopNav from "../components/TopNav/TopNav";
import Sidebar from "../components/Sidebar/Sidebar";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, faTachometerAlt, faProjectDiagram, faUsers, 
  faCalendarCheck, faFileAlt, faComments, faSyncAlt,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

// إنشاء مثيل مخصص لـ axios مع إعدادات افتراضية
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Interceptor لإضافة التوكن تلقائياً إلى كل طلب
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor للتعامل مع الأخطاء العامة
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

const SupervisorsProject = () => {
    // Refs
    const sidebarRef = useRef(null);
    const overlayRef = useRef(null);
    const mainContentRef = useRef(null);
    
    // States للسايدبار والمحتوى
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [contentEffectClass, setContentEffectClass] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
    
    // States للبيانات
    const [activeProjectsCount, setActiveProjectsCount] = useState(0);
    const [pendingTasksCount, setPendingTasksCount] = useState(0);
    const [activeStudentsCount, setActiveStudentsCount] = useState(0);
    const [averageGrade, setAverageGrade] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [filters, setFilters] = useState({
        type: '',
        semester: '',
        progress: ''
    });
    const [supervisorInfo, setSupervisorInfo] = useState({
        name: '',
        image: ''
    });
    const navigate = useNavigate();

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const token = localStorage.getItem('access_token');
                
                if (!token) {
                    throw new Error('لم يتم العثور على token في localStorage');
                }

                const checkResponse = await apiClient.get('/api/check-supervisor');
                
                if (!checkResponse.data.is_supervisor) {
                    throw new Error('المستخدم الحالي ليس مشرفًا');
                }

                setSupervisorInfo({
                    name: checkResponse.data.name,
                    image: checkResponse.data.profile_picture || 'https://randomuser.me/api/portraits/women/44.jpg'
                });

                const supervisorId = checkResponse.data.supervisor_id;

                const projectsResponse = await apiClient.get(
                    `/api/supervisors/${supervisorId}/active-projects-count`
                );
                setActiveProjectsCount(projectsResponse.data.active_projects_count);

                setPendingTasksCount(14);
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

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await apiClient.get('/api/supervisor/projects');
                if (response.data.success) {
                    const mappedProjects = response.data.data.map(project => ({
                        id: project.project_id,
                        name: project.title,
                        description: project.description,
                        type: project.type,
                        semester: `${project.start_date} إلى ${project.end_date}`,
                        progress: Math.floor(Math.random() * 101),
                        students: `${project.group.students_count} طلاب`,
                        groupId: project.group.id
                    }));
                    setProjects(mappedProjects);
                    setFilteredProjects(mappedProjects);
                }
            } catch (error) {
                console.error('خطأ في جلب المشاريع:', error);
                setError('حدث خطأ أثناء جلب بيانات المشاريع');
            }
        };
        fetchProjects();
    }, []);

    useEffect(() => {
        filterProjects();
    }, [filters, projects]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const filterProjects = () => {
        let filtered = [...projects];
        if (filters.type) {
            filtered = filtered.filter(project => project.type === filters.type);
        }
        if (filters.semester) {
            filtered = filtered.filter(project => project.semester.includes(filters.semester));
        }
        setFilteredProjects(filtered);
    };

    const getProgressColor = (progress) => {
        if (progress < 30) return '#f53e3e';
        if (progress < 70) return '#ed8936';
        if (progress < 90) return '#48bb78';
        return '#38b2ac';
    };

    const viewProjectDetails = (groupId) => {
        localStorage.setItem('selectedGroupId', groupId);
        navigate('/group-supervisor');
    };

    if (loading) {
        return <div className="loading-container">جاري التحميل...</div>;
    }

    if (error) {
        return <div className="error-container">حدث خطأ: {error}</div>;
    }

    return (
        <div className="dashboard-container-dash">
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
                  { icon: faTachometerAlt, text: "اللوحة الرئيسية", path: "/supervisors-dashboard" },
                  { icon: faProjectDiagram, text: "المشاريع", active: true, badge: activeProjectsCount, path: "/supervisor-project" },
                  { icon: faUsers, text: "الطلاب", path:"/students" },
                  { icon: faCalendarCheck, text: "المهام", badge: pendingTasksCount, alert: true, path: "/tasks" },
                  { icon: faFileAlt, text: "التقارير", path: "/reports" },
                  { icon: faComments, text: "جدولة الاجتماعات", badge: 3, path: "/scheduling-supervisors-meetings" }
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
                
                {/* Main Content */}
                
                    <div className='sup-projects-container'>
                    <section className="filter-section">
                        <div className="filter-container">
                            <div className="filter-item">
                                <label htmlFor="type-filter" className="filter-label">نوع المشروع:</label>
                                <select
                                    id="type-filter"
                                    className="filter-select"
                                    name="type"
                                    value={filters.type}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">جميع الأنواع</option>
                                    <option value="semester">مشاريع فصلية</option>
                                    <option value="final">مشاريع نهائية</option>
                                    <option value="research">مشاريع بحثية</option>
                                </select>
                            </div>
                            <div className="filter-item">
                                <label htmlFor="semester-filter" className="filter-label">التاريخ:</label>
                                <input
                                    type="text"
                                    id="semester-filter"
                                    name="semester"
                                    className="filter-select"
                                    placeholder="مثلاً: 2024"
                                    value={filters.semester}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                    </section>
                    <div className="projects-grid" id="projectsContainer">
                        {filteredProjects.length === 0 ? (
                            <div className="no-projects-message">
                                <p>لا توجد مشاريع مطابقة لمعايير البحث</p>
                            </div>
                        ) : (
                            filteredProjects.map(project => (
                                <div className="project-card" key={project.id}>
                                    <div className="project-content">
                                        <h3 className="project-name">{project.name}</h3>
                                        <div className="project-meta">
                                            <div className="meta-item-pro type">{project.type}</div>
                                            <div className="meta-item-pro semester">{project.semester}</div>
                                            <div className="meta-item-pro">{project.students}</div>
                                        </div>
                                        <div className="project-description-pro">{project.description}</div>
                                        <div className="progress-container-pro">
                                            <div className="progress-info">
                                                <span>التقدم</span>
                                                <span>{project.progress}%</span>
                                            </div>
                                            <div className="progress-bar-pro">
                                                <div
                                                    className="progress-fill-pro"
                                                    style={{
                                                        width: `${project.progress}%`,
                                                        background: getProgressColor(project.progress)
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="project-actions">
                                            <button
                                                className="action-btn-pro"
                                                onClick={() => viewProjectDetails(project.groupId)}
                                            >
                                                <span>عرض التفاصيل</span>
                                            </button>
                                            <button
                                                className="action-btn-pro primary"
                                                onClick={() => alert(`فتح المشروع رقم ${project.id}`)}
                                            >
                                                <span>فتح المشروع</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    </div>
                
            </div>
        </div>
    );
};

export default SupervisorsProject;  