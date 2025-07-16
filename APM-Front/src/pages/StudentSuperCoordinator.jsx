import React, { useRef } from 'react';
import './StudentSuperCoordinator.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap, 
  faSearch, 
  faMedal, 
  faStar, 
  faUserClock, 
  faChalkboardTeacher, 
  faArrowLeft, 
  faEye, 
  faCommentAlt, 
  faBell,
  faArrowUp,
  faArrowDown,
  faBars,
  faEnvelope,
  faTachometerAlt,
  faProjectDiagram,
  faUsers,
  faCalendarCheck,
  faFileAlt,
  faComments
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';

const SidebarWithRef = React.forwardRef((props, ref) => (
  <Sidebar ref={ref} {...props} />
));

const StudentSuperCoordinator = () => {
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  
  const toggleMobileSidebar = () => {
    sidebarRef.current?.classList.add('sidebar-open');
    overlayRef.current?.classList.add('overlay-open');
  };
  
  const closeMobileSidebar = () => {
    sidebarRef.current?.classList.remove('sidebar-open');
    overlayRef.current?.classList.remove('overlay-open');
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
        collapsed={false}
        navItems={[
          { icon: faTachometerAlt, text: "اللوحة الرئيسية", active: true, path: "/dashboard" },
          { icon: faProjectDiagram, text: "المشاريع", badge: 14, path: "/projects" },
          { icon: faUsers, text: "الطلاب", path:"/students" },
          { icon: faCalendarCheck, text: "المهام", badge: 5, alert: true, path: "/tasks" },
          { icon: faFileAlt, text: "التقارير", path: "/reports" },
          { icon: faComments, text: "المناقشات", badge: 3, path: "/discussions" }
        ]}
      />
      
      <div id="overlay" className="overlay" ref={overlayRef} onClick={closeMobileSidebar}></div>
      
      <div className="main-content-cord-dash">
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
        
        <div className="app-container">
          {/* Main Content */}
          <div className="main-container">
            <main>
              {/* Stats Cards */}
              <div className="stats-grid">
                {/* Outstanding Projects */}
                <div className="stat-cardd stat-cardd-1 cardd-hover">
                  <div className="stat-content">
                    <div className="stat-text">
                      <h3>المشاريع المتميزة</h3>
                      <p>14</p>
                    </div>
                    <div className="stat-icon stat-icon-1">
                      <FontAwesomeIcon icon={faMedal} />
                    </div>
                  </div>
                  <div className="stat-trend trend-up">
                    <FontAwesomeIcon icon={faArrowUp} /> 12% عن الشهر الماضي
                  </div>
                </div>
                
                {/* Outstanding Students */}
                <div className="stat-cardd stat-cardd-2 cardd-hover">
                  <div className="stat-content">
                    <div className="stat-text">
                      <h3>الطلاب المتميزون</h3>
                      <p>23</p>
                    </div>
                    <div className="stat-icon stat-icon-2">
                      <FontAwesomeIcon icon={faStar} />
                    </div>
                  </div>
                  <div className="stat-trend trend-up">
                    <FontAwesomeIcon icon={faArrowUp} /> 8% عن الشهر الماضي
                  </div>
                </div>
                
                {/* Students Needing Follow-up */}
                <div className="stat-cardd stat-cardd-3 cardd-hover">
                  <div className="stat-content">
                    <div className="stat-text">
                      <h3>طلاب بحاجة متابعة</h3>
                      <p>17</p>
                    </div>
                    <div className="stat-icon stat-icon-3">
                      <FontAwesomeIcon icon={faUserClock} />
                    </div>
                  </div>
                  <div className="stat-trend trend-down">
                    <FontAwesomeIcon icon={faArrowDown} /> 3% عن الشهر الماضي
                  </div>
                </div>
                
                {/* Total Supervisors */}
                <div className="stat-cardd stat-cardd-4 cardd-hover">
                  <div className="stat-content">
                    <div className="stat-text">
                      <h3>إجمالي المشرفين</h3>
                      <p>34</p>
                    </div>
                    <div className="stat-icon stat-icon-4">
                      <FontAwesomeIcon icon={faChalkboardTeacher} />
                    </div>
                  </div>
                  <div className="stat-trend trend-up">
                    <FontAwesomeIcon icon={faArrowUp} /> 5% عن الشهر الماضي
                  </div>
                </div>
              </div>

              {/* Outstanding Students Section */}
              <div className="section-container">
                <div className="section-headerstd">
                  <h2 className="section-title">الطلاب المتميزون</h2>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ borderTopRightRadius: '0.5rem', textAlign: 'right' }}>الاسم</th>
                        <th>الرقم الجامعي</th>
                        <th>المعدل</th>
                        <th>المشروع</th>
                        <th style={{ borderTopLeftRadius: '0.5rem' }}>المشرف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Student 1 */}
                      <tr>
                        <td>
                          <div className="student-info">
                            <p>عبدالله محمد</p>
                            <p>علوم حاسب</p>
                          </div>
                        </td>
                        <td>443212345</td>
                        <td>
                          <span className="gpa-badge gpa-high">4.8</span>
                        </td>
                        <td>النظام الذكي لإدارة المشاريع</td>
                        <td>
                          <div className="supervisor-display">
                            <span>أ. أحمد علي</span>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Student 2 */}
                      <tr>
                        <td>
                          <div className="student-info">
                            <p>سارة عبدالعزيز</p>
                            <p>هندسة برمجيات</p>
                          </div>
                        </td>
                        <td>443212346</td>
                        <td>
                          <span className="gpa-badge gpa-high">4.7</span>
                        </td>
                        <td>تطبيق إدارة المهام</td>
                        <td>
                          <div className="supervisor-display">
                            <span>د. خالد سعيد</span>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Student 3 */}
                      <tr>
                        <td>
                          <div className="student-info">
                            <p>محمد حسن</p>
                            <p>ذكاء اصطناعي</p>
                          </div>
                        </td>
                        <td>443212347</td>
                        <td>
                          <span className="gpa-badge gpa-high">4.9</span>
                        </td>
                        <td>روبوت المساعدة التعليمية</td>
                        <td>
                          <div className="supervisor-display">
                            <span>د. نادية محمد</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Students Needing Follow-up Section */}
              <div className="section-container">
                <div className="section-header">
                  <h2 className="section-title">طلاب بحاجة متابعة</h2>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ borderTopRightRadius: '0.5rem', textAlign: 'right' }}>الاسم</th>
                        <th>الرقم الجامعي</th>
                        <th>المعدل</th>
                        <th>المشروع</th>
                        <th style={{ borderTopLeftRadius: '0.5rem' }}>المشرف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Student 1 */}
                      <tr>
                        <td>
                          <div className="student-info">
                            <p>خالد أحمد</p>
                            <p>علوم حاسب</p>
                          </div>
                        </td>
                        <td>443212348</td>
                        <td>
                          <span className="gpa-badge gpa-low">2.8</span>
                        </td>
                        <td>تطبيق إدارة المصروفات</td>
                        <td>
                          <div className="supervisor-display">
                            <span>أ. سامي محمد</span>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Student 2 */}
                      <tr>
                        <td>
                          <div className="student-info">
                            <p>نورة خالد</p>
                            <p>هندسة برمجيات</p>
                          </div>
                        </td>
                        <td>443212349</td>
                        <td>
                          <span className="gpa-badge gpa-low">2.5</span>
                        </td>
                        <td>موقع تجارة إلكترونية</td>
                        <td>
                          <div className="supervisor-display">
                            <span>د. هيا عبدالله</span>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Student 3 */}
                      <tr>
                        <td>
                          <div className="student-info">
                            <p>فهد سعد</p>
                            <p>هندسة الحاسب</p>
                          </div>
                        </td>
                        <td>443212350</td>
                        <td>
                          <span className="gpa-badge gpa-low">2.3</span>
                        </td>
                        <td>منصة التعليم الإلكتروني</td>
                        <td>
                          <div className="supervisor-display">
                            <span>د. وليد أحمد</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Followed Supervisors Section */}
              <div className="section-container">
                <div className="section-header">
                  <h2 className="section-title">المشرفون المتابَعة مشاريعهم</h2>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>الاسم</th>
                        <th>التخصص</th>
                        <th>عدد الطلاب</th>
                        <th>آخر متابعة</th>
                        <th>حالة المتابعة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Supervisor 1 */}
                      <tr>
                        <td>أ. أحمد علي</td>
                        <td>علوم الحاسب</td>
                        <td>
                          <span className="gpa-badge gpa-high">٤ طلاب</span>
                        </td>
                        <td>اليوم 10:45 ص</td>
                        <td>
                          <span className="status-badge status-active">متابع</span>
                        </td>
                      </tr>
                      
                      {/* Supervisor 2 */}
                      <tr>
                        <td>د. نادية محمد</td>
                        <td>ذكاء اصطناعي</td>
                        <td>
                          <span className="gpa-badge gpa-high">٦ طلاب</span>
                        </td>
                        <td>منذ يومين</td>
                        <td>
                          <span className="status-badge status-active">متابع</span>
                        </td>
                      </tr>
                      
                      {/* Supervisor 3 */}
                      <tr>
                        <td>د. منى حسن</td>
                        <td>أمن المعلومات</td>
                        <td>
                          <span className="gpa-badge gpa-high">٥ طلاب</span>
                        </td>
                        <td>منذ ٤ أيام</td>
                        <td>
                          <span className="status-badge status-active">متابع</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Unfollowed Supervisors Section */}
              <div className="section-container">
                <div className="section-header">
                  <h2 className="section-title">المشرفون غير المتابَعة مشاريعهم</h2>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>الاسم</th>
                        <th>التخصص</th>
                        <th>عدد الطلاب</th>
                        <th>آخر متابعة</th>
                        <th>حالة المتابعة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Supervisor 1 */}
                      <tr>
                        <td>د. خالد سعيد</td>
                        <td>هندسة البرمجيات</td>
                        <td>
                          <span className="gpa-badge gpa-high">٣ طلاب</span>
                        </td>
                        <td>منذ ٣ أسابيع</td>
                        <td>
                          <span className="status-badge status-inactive">غير متابع</span>
                        </td>
                      </tr>
                      
                      {/* Supervisor 2 */}
                      <tr>
                        <td>أ. سامي محمد</td>
                        <td>الشبكات</td>
                        <td>
                          <span className="gpa-badge gpa-high">طالبان</span>
                        </td>
                        <td>منذ شهر</td>
                        <td>
                          <span className="status-badge status-inactive">غير متابع</span>
                        </td>
                      </tr>
                      
                      {/* Supervisor 3 */}
                      <tr>
                        <td>د. إيمان عبدالرحمن</td>
                        <td>قواعد البيانات</td>
                        <td>
                          <span className="gpa-badge gpa-high">٤ طلاب</span>
                        </td>
                        <td>منذ أسبوعين</td>
                        <td>
                          <span className="status-badge status-inactive">غير متابع</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSuperCoordinator;