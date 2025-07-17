import React, { useRef, useState } from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useNavigate } from 'react-router-dom';
import './ProposalsCoordinator.css';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTachometerAlt, 
  faProjectDiagram, 
  faUsers,
  faCalendarCheck,
  faFileAlt,
  faComments,
  faUserCircle,
  faSpinner,
  faSyncAlt,
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
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
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

const ProposalsCoordinator = () => {
  const sidebarRef = useRef(null);
  const mainContentRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contentEffectClass, setContentEffectClass] = useState('');
  const [isMobile] = useState(window.innerWidth < 769);
  const navigate = useNavigate();

  // استعلام React Query لجلب المقترحات
  const { 
    data: proposals, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['coordinatorProposals'],
    queryFn: async () => {
      const response = await apiClient.get('/api/coordinator/proposals/pending');
      if (!response.data.success) {
        throw new Error('Failed to fetch proposals');
      }
      return response.data.data;
    }
  });

  const handleViewProposal = (proposal) => {
    if (proposal.group && proposal.group.id) {
      localStorage.setItem('selectedGroupId', proposal.group.id.toString());
      localStorage.setItem('selectedProposalData', JSON.stringify(proposal));
      navigate('/proposal');
    } else {
      console.error('Group ID is missing in the proposal data');
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleContentEffect = () => {
    if (!isMobile) {
      setContentEffectClass(prev => prev === 'content-effect' ? '' : 'content-effect');
    }
  };

  if (isError) {
    return (
      <div className="error-container">
        <FontAwesomeIcon icon={faExclamationTriangle} />
        <p>حدث خطأ أثناء جلب البيانات: {error.message}</p>
        <button className="retry-btn" onClick={() => refetch()}>
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
          name: "مستخدم",
          role: "منسق المشاريع",
          image: null
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        onToggleEffect={toggleContentEffect}
        navItems={[
          { icon: faTachometerAlt, text: "اللوحة الرئيسية", active: true, path: "/dashboard" },
          { icon: faProjectDiagram, text: "المشاريع", path: "/projects" },
          { icon: faUsers, text: "الطلاب", path:"/students" },
          { icon: faCalendarCheck, text: "المهام", path: "/tasks" },
          { icon: faFileAlt, text: "التقارير", path: "/reports" },
          { icon: faComments, text: "المناقشات", path: "/discussions" }
        ]}
      />
      
      <div className={`main-container ${!isMobile ? contentEffectClass : ''}`} ref={mainContentRef}>
        <div className="supervisor-dashboard">
          <div className='nav-top-dash'>
            <TopNav 
              user={{
                name: "مستخدم",
                image: null
              }}
              notifications={{
                bell: 0,
                envelope: 0
              }}
              searchPlaceholder="ابحث عن مشاريع، طلاب، مهام..."
              userIcon={faUserCircle}
            />
          </div>

          <div className="proposals-container-prop">
            <div className="header-prop">
              <h1 className="header-title-prop">مقترحات المشاريع</h1>
              <p className="header-subtitle-prop">عرض قائمة بمقترحات المشاريع المقدمة</p>
            </div>
            
            {isLoading ? (
              <div className="loading-container">
                <FontAwesomeIcon icon={faSpinner} spin />
                <p>جاري تحميل المقترحات...</p>
              </div>
            ) : (
              <div className="projects-container-prop">
                {proposals && proposals.length > 0 ? (
                  proposals.map(proposal => (
                    <div key={proposal.id} className="project-card-prop">
                      <div className="project-info">
                        <div className="project-title-prop">{proposal.title}</div>
                        <div className="project-meta">
                          <span className={`status-badge ${proposal.status}`}>
                            {proposal.status_name}
                          </span>
                          <span className="project-type">
                            {proposal.project_type_name}
                          </span>
                        </div>
                      </div>
                      <button 
                        className="view-btn"
                        onClick={() => handleViewProposal(proposal)}
                      >
                        عرض المقترح
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="no-proposals">
                    <p>لا توجد مقترحات بحاجة للمراجعة حالياً</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// تغليف التطبيق بـ QueryClientProvider
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ProposalsCoordinator />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

export default App;