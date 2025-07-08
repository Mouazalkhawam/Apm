import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTachometerAlt, faProjectDiagram, faUsers, 
  faCalendarCheck, faFileAlt, faComments,
  faChevronLeft, faBars, faSearch, faBell, 
  faEnvelope, faEllipsisV, faLaptopCode, 
  faMobileAlt, faChartLine, faRobot, 
  faArrowUp, faExclamationCircle, faCommentAlt,
  faTasks, faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import './SupervisorDashboard.css';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';
import axios from 'axios';

const SidebarWithRef = React.forwardRef((props, ref) => (
  <Sidebar ref={ref} {...props} />
));

const SupervisorDashboard = () => {
  const sidebarRef = useRef(null);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // الحصول على التوكن من localStorage
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          throw new Error('لم يتم العثور على token في localStorage');
        }

        // تكوين رأس الطلب
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

        // تحديث معلومات المشرف
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

        // 3. جلب البيانات الأخرى (يمكنك استبدالها بطلبات API فعلية)
        setPendingTasksCount(14); // يمكن استبدالها بطلب API
        setActiveStudentsCount(23); // يمكن استبدالها بطلب API
        setAverageGrade(88); // يمكن استبدالها بطلب API

      } catch (err) {
        console.error('حدث خطأ أثناء جلب البيانات:', err);
        setError(err.message || 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        navItems={[
          { icon: faTachometerAlt, text: "اللوحة الرئيسية", active: true, path: "/dashboard" },
          { icon: faProjectDiagram, text: "المشاريع", badge: activeProjectsCount, path: "/projects" },
          { icon: faUsers, text: "الطلاب", path:"/students" },
          { icon: faCalendarCheck, text: "المهام", badge: pendingTasksCount, alert: true, path: "/tasks" },
          { icon: faFileAlt, text: "التقارير", path: "/reports" },
          { icon: faComments, text: "المناقشات", badge: 3, path: "/discussions" }
        ]}
      />
      
      <div className="main-container">
        <div className="supervisor-dashboard">
          <TopNav />
          <main className="main-content-supervisor">
            <h1 className="page-title">نظرة عامة</h1>
            
            <div className="stats-container-dash-super">
              <div className="stat-card-dash-super">
                <h3>المشاريع النشطة</h3>
                <div className="value">{activeProjectsCount}</div>
                <div className="subtext">+2 عن الشهر الماضي</div>
              </div>
              
              <div className="stat-card-dash-super">
                <h3>المهام المعلقة</h3>
                <div className="value">{pendingTasksCount}</div>
                <div className="subtext">3 منها متأخرة</div>
              </div>
              
              <div className="stat-card-dash-super">
                <h3>الطلاب النشطين</h3>
                <div className="value">{activeStudentsCount}</div>
                <div className="subtext">من أصل 28 طالب</div>
              </div>
              
              <div className="stat-card-dash-super">
                <h3>إجمالي الدرجات</h3>
                <div className="value">{averageGrade}%</div>
                <div className="subtext">متوسط أداء الطلاب</div>
              </div>
            </div>
            
            <section className="projects-section">
              <div className="section-header-dash-super">
                <h2 className="section-title">المشاريع المشرف عليها</h2>
                <a href="/projects" className="view-all">عرض الكل</a>
              </div>
              
              <div className="projects-grid-dash-super">
                <div className="project-card-dash-super">
                  <h3 className="project-title-dash-super">نظام إدارة المشاريع</h3>
                  <div className="project-meta">
                    <span>4 طلاب</span>
                    <span>تاريخ التسليم: 15 يونيو</span>
                  </div>
                  <div className="progress-bar-dash-super">
                    <div className="progress" style={{width: '75%'}}></div>
                  </div>
                </div>
                
                <div className="project-card-dash-super">
                  <h3 className="project-title-dash-supe">تطبيق الجوال التعليمي</h3>
                  <div className="project-meta">
                    <span>3 طلاب</span>
                    <span>تاريخ التسليم: 22 يونيو</span>
                  </div>
                  <div className="progress-bar-dash-super">
                    <div className="progress" style={{width: '45%'}}></div>
                  </div>
                </div>
                
                <div className="project-card-dash-super">
                  <h3 className="project-title-dash-supe">موقع التجارة الإلكترونية</h3>
                  <div className="project-meta">
                    <span>5 طلاب</span>
                    <span>تاريخ التسليم: 30 يونيو</span>
                  </div>
                  <div className="progress-bar-dash-super">
                    <div className="progress" style={{width: '30%'}}></div>
                  </div>
                </div>
              </div>
            </section>
            
            <section className="tasks-section">
              <div className="section-header-dash-super">
                <h2 className="section-title">المهام المعلقة</h2>
                <a href="/tasks" className="view-all">عرض الكل</a>
              </div>
              
              <ul className="tasks-list">
                <li className="task-item-dash-super">
                  <div className="task-info">
                    <h4 className="task-title-dash-super">مراجعة كود نظام المشاريع</h4>
                    <span className="task-project">نظام إدارة المشاريع</span>
                  </div>
                  <span className="task-due">غدًا</span>
                  <span className="task-status status-pending">في الانتظار</span>
                </li>
                
                <li className="task-item-dash-super">
                  <div className="task-info">
                    <h4 className="task-title-dash-super">تقديم ملاحظات على التصميم</h4>
                    <span className="task-project">تطبيق الجوال التعليمي</span>
                  </div>
                  <span className="task-due">3 أيام</span>
                  <span className="task-status status-pending">في الانتظار</span>
                </li>
                
                <li className="task-item-dash-super">
                  <div className="task-info">
                    <h4 className="task-title-dash-super">تقييم اختبار الوحدة</h4>
                    <span className="task-project">موقع التجارة الإلكترونية</span>
                  </div>
                  <span className="task-due">متأخر 2 أيام</span>
                  <span className="task-status status-overdue">متأخر</span>
                </li>
                
                <li className="task-item-dash-super">
                  <div className="task-info">
                    <h4 className="task-title-dash-super">مقابلة الفريق</h4>
                    <span className="task-project">نظام إدارة المشاريع</span>
                  </div>
                  <span className="task-due">5 أيام</span>
                  <span className="task-status status-pending">في الانتظار</span>
                </li>
              </ul>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;