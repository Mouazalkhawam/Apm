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
  faExclamationTriangle, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import './AcademicDashboard.css';

const SidebarWithRef = React.forwardRef((props, ref) => (
  <Sidebar ref={ref} {...props} />
));

const TasksPage = () => {
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const mainContentRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contentEffectClass, setContentEffectClass] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState('');

  // Get access token from localStorage when component mounts
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setAccessToken(token);
    } else {
      setError('لم يتم العثور على رمز الوصول. يرجى تسجيل الدخول مرة أخرى.');
      setLoading(false);
    }
  }, []);

  // Fetch coordinator tasks
  useEffect(() => {
    if (!accessToken) return;

    const fetchTasks = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/pending-tasks/coordinator', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
          }
          throw new Error('فشل في جلب البيانات من الخادم');
        }

        const data = await response.json();
        if (data.success) {
          setPendingTasks(data.data);
        } else {
          setError(data.message || 'حدث خطأ غير متوقع');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [accessToken]);

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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleContentEffect = () => {
    if (!isMobile) {
      setContentEffectClass(prev => prev === 'content-effect' ? '' : 'content-effect');
    }
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

  // Function to get task icon based on type
  const getTaskIcon = (type) => {
    switch (type) {
      case 'proposal_approval':
        return <FontAwesomeIcon icon={faFileAlt} className="task-type-icon proposal" />;
      case 'resource_approval':
        return <FontAwesomeIcon icon={faProjectDiagram} className="task-type-icon resource" />;
      default:
        return <FontAwesomeIcon icon={faTasks} className="task-type-icon default" />;
    }
  };

  // Function to get task color based on type
  const getTaskColor = (type) => {
    switch (type) {
      case 'proposal_approval':
        return 'blue';
      case 'resource_approval':
        return 'green';
      default:
        return 'yellow';
    }
  };

  // Function to format task type for display
  const formatTaskType = (type) => {
    switch (type) {
      case 'proposal_approval':
        return 'موافقة على مقترح مشروع';
      case 'resource_approval':
        return 'موافقة على مورد';
      default:
        return type;
    }
  };

  // Function to handle task approval
  const handleTaskApproval = async (taskId, type) => {
    if (!accessToken) {
      setError('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }

    try {
      const endpoint = type === 'proposal_approval' 
        ? 'approve-proposal' 
        : 'approve-resource';
      
      const response = await fetch(`http://127.0.0.1:8000/api/${endpoint}/${taskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('فشل في تنفيذ العملية');
      }

      const data = await response.json();
      if (data.success) {
        // Update the tasks list by removing the approved task
        setPendingTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      } else {
        setError(data.message || 'حدث خطأ أثناء الموافقة على المهمة');
      }
    } catch (err) {
      setError(err.message);
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
        onToggleEffect={toggleContentEffect}
        navItems={[
          { icon: faTachometerAlt, text: "اللوحة الرئيسية", path: "/AcademicDashboard" },
          { icon: faProjectDiagram, text: "المشاريع", badge: 12 },
          { icon: faUsers, text: "الطلاب", path:"/Supervisor-Management-Coordinator" },
          { icon: faCalendarCheck, text: "المهام", badge: 5, alert: true, active: true, path: "/TasksPage" },
          { icon: faFileAlt, text: "التقارير" },
          { icon: faComments, text: "المناقشات", badge: 3 }
        ]}
      />
      <button id="mobileSidebarToggle" className="mobile-sidebar-toggle" onClick={toggleMobileSidebar}>
        <FontAwesomeIcon icon={faBars} />
      </button>
      
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
        </div>
        
        <main className="content-area">
          <div className="container-dash">
            <div className="welcome-header">
              <h1 className="welcome-title">المهام</h1>
              <p className="welcome-subtitle">إدارة المهام والمتابعات</p>
            </div>
            
            {loading ? (
              <div className="loading-container">
                <FontAwesomeIcon icon={faSyncAlt} spin className="loading-icon" />
                <p>جاري تحميل المهام...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
                <p className="error-message">{error}</p>
                {error.includes('انتهت صلاحية الجلسة') && (
                  <button 
                    className="login-redirect-button"
                    onClick={() => window.location.href = '/login'}
                  >
                    العودة إلى صفحة تسجيل الدخول
                  </button>
                )}
              </div>
            ) : (
              <div className="tasks-students-grid">
                <div className="tasks-card">
                  <div className="tasks-header">
                    <h2 className="tasks-title">المهام المعلقة</h2>
                    <span className="tasks-count">{pendingTasks.length}</span>
                  </div>
                  <div className="tasks-list">
                    {pendingTasks.length > 0 ? (
                      pendingTasks.map((task) => (
                        <div key={task.id} className={`task-item ${getTaskColor(task.type)}`}>
                          <div className="task-header">
                            <div className="task-icon-container">
                              {getTaskIcon(task.type)}
                            </div>
                            <div className="task-details">
                              <h4 className="task-title">{formatTaskType(task.type)}</h4>
                              <p className="task-date">
                                {new Date(task.created_at).toLocaleDateString('ar-SA')}
                              </p>
                              {task.type === 'proposal_approval' && task.proposal && (
                                <div className="task-extra-info">
                                  <span>المقترح: {task.proposal.title}</span>
                                  <span>المجموعة: {task.proposal.group.name}</span>
                                </div>
                              )}
                              {task.type === 'resource_approval' && task.resource && (
                                <div className="task-extra-info">
                                  <span>المورد: {task.resource.title}</span>
                                  <span>النوع: {task.resource.type}</span>
                                </div>
                              )}
                            </div>
                            <div className="task-actions">
                              <button 
                                className="task-approve-button"
                                onClick={() => handleTaskApproval(task.id, task.type)}
                              >
                                موافقة
                              </button>
                              <button className="task-more">
                                <FontAwesomeIcon icon={faEllipsisV} />
                              </button>
                            </div>
                          </div>
                          {task.notes && (
                            <div className="task-notes">
                              <FontAwesomeIcon icon={faCommentAlt} />
                              <span>{task.notes}</span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="no-tasks">
                        <FontAwesomeIcon icon={faCheckCircle} className="no-tasks-icon" />
                        <p>لا توجد مهام معلقة حالياً</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="completed-tasks-card">
                  <div className="tasks-header">
                    <h2 className="tasks-title">المهام المكتملة</h2>
                    <a href="#" className="tasks-link">عرض الكل</a>
                  </div>
                  <div className="tasks-list">
                    <div className="task-item completed">
                      <div className="task-header">
                        <div>
                          <h4 className="task-title">مراجعة مقترحات المشاريع</h4>
                          <p className="task-date">تمت 12 يونيو</p>
                        </div>
                        <button className="task-more">
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="task-item completed">
                      <div className="task-header">
                        <div>
                          <h4 className="task-title">اجتماع مع لجنة المناقشة</h4>
                          <p className="task-date">تم 8 يونيو</p>
                        </div>
                        <button className="task-more">
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TasksPage;