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
import './AcademicDashboard.css';

const SidebarWithRef = React.forwardRef((props, ref) => (
  <Sidebar ref={ref} {...props} />
));

const TasksPage = () => {
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      
      <div className="main-content-cord">
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
        
        <main className="content-area">
          <div className="containerr">
            <div className="welcome-header">
              <h1 className="welcome-title">المهام</h1>
              <p className="welcome-subtitle">إدارة المهام والمتابعات</p>
            </div>
            
            <div className="tasks-students-grid">
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TasksPage;