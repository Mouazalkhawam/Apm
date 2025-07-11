import React, { useRef, useState, useEffect } from 'react';
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
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const SidebarWithRef = React.forwardRef((props, ref) => (
  <Sidebar ref={ref} {...props} />
));

const ProposalsCoordinator = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const sidebarRef = useRef(null);
  const mainContentRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contentEffectClass, setContentEffectClass] = useState('');
  const [isMobile] = useState(window.innerWidth < 769);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get('http://localhost:8000/api/coordinator/proposals/pending', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.data.success) {
          setProposals(response.data.data);
        } else {
          throw new Error('Failed to fetch proposals');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

const handleViewProposal = (proposal) => {
  // حفظ فقط group ID في localStorage (إذا كان موجودًا)
  if (proposal.group?.id) {
    localStorage.setItem('selectedGroupId', proposal.group.id);
  }

  // الانتقال إلى صفحة تفاصيل المقترح
  navigate('/proposal');
};


  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleContentEffect = () => {
    if (!isMobile) {
      setContentEffectClass(prev => prev === 'content-effect' ? '' : 'content-effect');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>جاري تحميل المقترحات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>حدث خطأ أثناء جلب البيانات: {error}</p>
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
            
            <div className="projects-container-prop">
              {proposals.length > 0 ? (
                proposals.map(proposal => (
                  <div key={proposal.id} className="project-card-prop">
                    <div className="project-title-prop">{proposal.title}</div>
                    <button 
                       className="view-btn"
                       onClick={() => handleViewProposal(proposal)} // 👈 هون التعديل
                        >
                        عرض المقترح
                    </button>

                  </div>
                ))
              ) : (
                <div className="no-proposals">
                  لا توجد مقترحات بحاجة للمراجعة حالياً
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalsCoordinator;