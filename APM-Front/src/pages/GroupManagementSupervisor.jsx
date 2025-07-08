import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef } from 'react';
import { 
  faTachometerAlt, faProjectDiagram, faUsers, 
  faCalendarCheck, faFileAlt, faComments, faUserFriends,
  faChevronLeft, faBars, faSearch, faBell, faChartBar,
  faEnvelope, faEllipsisV, faLaptopCode, faCalendarAlt,
  faMobileAlt, faChartLine, faRobot, 
  faArrowUp, faExclamationCircle, faCommentAlt,
  faTasks, faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './GroupProjectManagement.css';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';
import axios from 'axios'; // أضف هذا الاستيراد

const SidebarWithRef = React.forwardRef((props, ref) => (
  <Sidebar ref={ref} {...props} />
));

const GroupManagementSupervisor = () => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [pendingTasksCount, setPendingTasksCount] = useState(0); // أضف هذا السطر
  const [activeStudentsCount, setActiveStudentsCount] = useState(0); // أضف هذا السطر
  const [averageGrade, setAverageGrade] = useState(0); // أضف هذا السطر
  const [loading, setLoading] = useState(true); // أضف هذا السطر
  const [error, setError] = useState(null); // أضف هذا السطر
  const [supervisorInfo, setSupervisorInfo] = useState({
    name: '',
    image: null // غيرت إلى null بدلاً من سلسلة فارغة
  });

  useEffect(() => {
    const cards = document.querySelectorAll('.group-nav-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${0.1 + (index * 0.1)}s`;
    });
  }, []);
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          throw new Error('لم يتم العثور على token في localStorage');
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        const checkResponse = await axios.get('http://127.0.0.1:8000/api/check-supervisor', config);
        
        if (!checkResponse.data.is_supervisor) {
          throw new Error('المستخدم الحالي ليس مشرفًا');
        }

        setSupervisorInfo({
          name: checkResponse.data.name,
          image: checkResponse.data.profile_picture || null // استخدم null بدلاً من السلسلة الفارغة
        });

        const supervisorId = checkResponse.data.supervisor_id;

        const projectsResponse = await axios.get(
          `http://127.0.0.1:8000/api/supervisors/${supervisorId}/active-projects-count`, 
          config
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

  if (loading) {
    return <div className="loading-container">جاري التحميل...</div>;
  }

  if (error) {
    return <div className="error-container">حدث خطأ: {error}</div>;
  }

  return ( 
    <div className="dashboard-container-dash-sup">
      <SidebarWithRef 
        ref={sidebarRef}
        user={{
          name: supervisorInfo.name || "د.عفاف",
          role: "مشرف",
          image: supervisorInfo.image
        }}
        navItems={[
          { icon: faTachometerAlt, text: "اللوحة الرئيسية", path: "/supervisors-dashboard" },
          { icon: faProjectDiagram, text: "المشاريع", active: true, badge: activeProjectsCount, path: "/supervisor-project" },
          { icon: faUsers, text: "الطلاب", path:"/students" },
          { icon: faCalendarCheck, text: "المهام", badge: pendingTasksCount, alert: true, path: "/tasks" },
          { icon: faFileAlt, text: "التقارير", path: "/reports" },
          { icon: faComments, text: "جدولة الاجتماعات", badge: 3, path: "/scheduling-supervisors-meetings" }
        ]}
      />
        <div className="main-container">
        <div className='supervisor-dashboard'>
      <TopNav/>
      {/* Navigation Cards Section */}
      <div className="group-nav-grid">
        {/* Proposal Card */}
        <div className="group-nav-card group-card-purple" style={{ animationDelay: '0.1s' }}>
          <div className="group-nav-card-content">
            <div className="group-icon-container">
              <FontAwesomeIcon icon={faFileAlt} className="group-nav-icon" />
            </div>
            <h3 className="group-nav-title">عرض المقترح</h3>
            <p className="group-nav-desc">عرض الوثيقة الكاملة للمقترح البحثي</p>
            <button 
              className="group-nav-button"
              onClick={() => navigate('/proposal')}
            >
              عرض المقترح
            </button>
          </div>
        </div>
        
        {/* Supervisors Card */}
        <div className="group-nav-card group-card-blue" style={{ animationDelay: '0.2s' }}>
          <div className="group-nav-card-content">
            <div className="group-icon-container">
              <FontAwesomeIcon icon={faUsers} className="group-nav-icon" />
            </div>
            <h3 className="group-nav-title">عرض المشرفون</h3>
            <p className="group-nav-desc">قائمة بالمشرفين على المشروع ومعلومات الاتصال بهم</p>
            <button 
              className="group-nav-button"
              onClick={() => navigate('/supervisors-management')}
            >
              عرض المشرفون
            </button>
          </div>
        </div>
        
       {/* Team Members Card */}
<div className="group-nav-card group-card-green" style={{ animationDelay: '0.3s' }}>
  <div className="group-nav-card-content">
    <div className="group-icon-container">
      <FontAwesomeIcon icon={faUserFriends} className="group-nav-icon" />
    </div>
    <h3 className="group-nav-title">أعضاء المجموعة</h3>
    <p className="group-nav-desc">عرض قائمة أعضاء المجموعة وتخصصاتهم ومهامهم</p>
    <button 
      className="group-nav-button"
      onClick={() => navigate('/team-members')}
    >
      عرض المجموعة
    </button>
  </div>
</div>
        
        {/* Project Progress Card */}
        <div className="group-nav-card group-card-yellow" style={{ animationDelay: '0.4s' }}>
          <div className="group-nav-card-content">
            <div className="group-icon-container">
              <FontAwesomeIcon icon={faChartBar} className="group-nav-icon" />
            </div>
            <h3 className="group-nav-title">تقييم فريق المشروع </h3>
            <p className="group-nav-desc"> تقييم كافة أعضاء الفريق والمشرفين المسؤولين عن متابعة تقديم العمل</p>
            <button 
              className="group-nav-button"
              onClick={() => navigate('/student-evaluation')}
            >
              عرض التقييم
            </button>
          </div>
        </div>
        
        {/* Stages & Tasks Card */}
        <div className="group-nav-card group-card-red" style={{ animationDelay: '0.5s' }}>
          <div className="group-nav-card-content">
            <div className="group-icon-container">
              <FontAwesomeIcon icon={faTasks} className="group-nav-icon" />
            </div>
            <h3 className="group-nav-title">المراحل والمهام</h3>
            <p className="group-nav-desc">عرض جميع مراحل المشروع والمهام المطلوبة</p>
            <button 
              className="group-nav-button"
              onClick={() => navigate('/student-project-management')}
            >
              عرض المراحل
            </button>
          </div>
        </div>
        
        {/* Meetings Schedule Card */}
        <div className="group-nav-card group-card-indigo" style={{ animationDelay: '0.6s' }}>
          <div className="group-nav-card-content">
            <div className="group-icon-container">
              <FontAwesomeIcon icon={faCalendarAlt} className="group-nav-icon" />
            </div>
            <h3 className="group-nav-title">جدولة الاجتماعات</h3>
            <p className="group-nav-desc">جدولة مواعيد الاجتماعات مع المشرف</p>
            <button 
              className="group-nav-button"
              onClick={() => navigate('/scheduling-student-meetings')}
            >
              عرض الجدول
            </button>
          </div>
        </div>
        
        {/* Discussions Schedule Card */}
        <div className="group-nav-card group-card-pink" style={{ animationDelay: '0.7s' }}>
          <div className="group-nav-card-content">
            <div className="group-icon-container">
              <FontAwesomeIcon icon={faComments} className="group-nav-icon" />
            </div>
            <h3 className="group-nav-title">المناقشات</h3>
            <p className="group-nav-desc">مواعيد المناقشات المرحلية والنهائية</p>
            <button 
              className="group-nav-button"
               onClick={() => navigate('/discussion-student')}
            >
              عرض المواعيد
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
};

export default GroupManagementSupervisor;