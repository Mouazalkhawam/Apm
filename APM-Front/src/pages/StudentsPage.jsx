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

const StudentsPage = () => {
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
          { icon: faUsers, text: "الطلاب", path:"/Supervisor-Management-Coordinator", active: true },
          { icon: faCalendarCheck, text: "المهام", badge: 5, alert: true, path: "/TasksPage" },
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
              <h1 className="welcome-title">الطلاب</h1>
              <p className="welcome-subtitle">إدارة الطلاب والمشاريع</p>
            </div>
            
            <div className="tasks-students-grid">
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

export default StudentsPage;