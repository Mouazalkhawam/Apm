import React, { useEffect, useRef, useState } from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './CoordinatorsProject.css';
import TopNav from "../components/TopNav/TopNav";
import Sidebar from "../components/Sidebar/Sidebar";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, faTachometerAlt, faProjectDiagram, faUsers, 
  faCalendarCheck, faFileAlt, faComments, faSyncAlt,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

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

const CoordinatorsProject = () => {
    const sidebarRef = useRef(null);
    const overlayRef = useRef(null);
    const mainContentRef = useRef(null);
    
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [contentEffectClass, setContentEffectClass] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
    
    const [filters, setFilters] = useState({
        type: '',
        semester: '',
        progress: ''
    });
    
    const navigate = useNavigate();

    // استعلامات React Query
    const { data: userInfo } = useQuery({
        queryKey: ['userInfo'],
        queryFn: async () => {
            const response = await apiClient.get('/api/user');
            return {
                name: response.data.name,
                image: response.data.profile_picture || 'https://randomuser.me/api/portraits/women/44.jpg'
            };
        }
    });

    const { 
        data: projectsData, 
        isLoading: projectsLoading, 
        error: projectsError,
        refetch: refetchProjects
    } = useQuery({
        queryKey: ['coordinatorProjects'],
        queryFn: async () => {
            const response = await apiClient.get('/api/coordinator/current-projects');
            if (!response.data.success) {
                throw new Error('Failed to fetch projects');
            }
            
            return {
                projects: response.data.data.map(project => ({
                    id: project.project_id,
                    name: project.title,
                    description: project.description,
                    type: project.type,
                    semester: `${project.start_date} إلى ${project.end_date}`,
                    progress: Math.floor(Math.random() * 101),
                    students: `${project.group?.students_count || 0} طلاب`,
                    groupId: project.group?.id || null
                })),
                stats: {
                    activeProjects: response.data.count || 0,
                    pendingTasks: 14,
                    activeStudents: 23,
                    averageGrade: 88
                }
            };
        }
    });

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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const filterProjects = () => {
        if (!projectsData?.projects) return [];
        
        let filtered = [...projectsData.projects];
        if (filters.type) {
            filtered = filtered.filter(project => project.type === filters.type);
        }
        if (filters.semester) {
            filtered = filtered.filter(project => project.semester.includes(filters.semester));
        }
        return filtered;
    };

    const filteredProjects = filterProjects();

    const getProgressColor = (progress) => {
        if (progress < 30) return '#f53e3e';
        if (progress < 70) return '#ed8936';
        if (progress < 90) return '#48bb78';
        return '#38b2ac';
    };

    const viewProjectDetails = (groupId) => {
        if (groupId) {
            localStorage.setItem('selectedGroupId', groupId);
            navigate('/group-supervisor');
        }
    };

    if (projectsError) {
        return (
            <div className="error-container">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                حدث خطأ: {projectsError.message}
                <button onClick={() => refetchProjects()} className="retry-btn">
                    <FontAwesomeIcon icon={faSyncAlt} />
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard-container-dash">
            <SidebarWithRef 
                ref={sidebarRef}
                user={{
                    name: userInfo?.name || "مستخدم",
                    role: "مستخدم",
                    image: userInfo?.image
                }}
            />
            
            <div id="overlay" className="overlay" ref={overlayRef} onClick={closeMobileSidebar}></div>
            
            <div className={`main-content-cord-dash ${!isMobile ? contentEffectClass : ''}`} ref={mainContentRef}>
                <div className='nav-top-dash'>
                    <TopNav 
                        user={{
                            name: userInfo?.name || "مستخدم",
                            image: userInfo?.image
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
                
                <div className='supervisor-dashboard'>
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
                    
                    {projectsLoading ? (
                        <div className="loading-container">
                            <FontAwesomeIcon icon={faSyncAlt} spin />
                            جاري تحميل المشاريع...
                        </div>
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    );
};

// تغليف التطبيق بـ QueryClientProvider
const App = () => (
    <QueryClientProvider client={queryClient}>
        <CoordinatorsProject />
        <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
);

export default App;