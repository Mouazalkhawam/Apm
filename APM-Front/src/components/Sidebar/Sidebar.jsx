import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap, faChevronRight, faChevronLeft, 
  faTachometerAlt, faProjectDiagram, faUsers, faCalendarCheck,
  faFileAlt, faComments, faCog, faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import "./Sidebar.css";
import { useNavigate } from 'react-router-dom';

const Sidebar = React.forwardRef(({ 
    user = {
      name: "د.عفاف",
      role: "منسق المشاريع",
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    navItems = [
      { icon: faTachometerAlt, text: "اللوحة الرئيسية", active: true, path: "/supervisors-dashboard" },
      { icon: faProjectDiagram, text: "المشاريع", badge: 12, path: "/supervisor-project" },
      { icon: faUsers, text: "الطلاب", path: "/students" },
      { icon: faCalendarCheck, text: "جدولة الاجتماعات", badge: 5, alert: true, path: "/scheduling-supervisors-meetings" },
      { icon: faFileAlt, text: "التقارير", path: "/reports" },
      { icon: faComments, text: "المناقشات", badge: 3, path: "/discussions" }
    ],
    collapsed = false,
    onToggleCollapse = () => {},
    onToggleEffect = () => {},
    logoText = "أكاديمية المشاريع"
  }, ref) => {
  
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 769;
      setIsMobile(mobile);
      
      // Auto-expand sidebar when switching to mobile view
      if (mobile && collapsed) {
        onToggleCollapse();
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Initial check on component mount
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [collapsed, onToggleCollapse]);

  const handleNavigation = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (isMobile) {
      ref.current?.classList.remove('sidebar-open');
      document.getElementById('overlay')?.classList.remove('overlay-open');
    }
  };

  const handleToggleClick = () => {
    if (!isMobile) {
      onToggleCollapse();
      onToggleEffect();
    }
  };

  // Determine if we should show collapsed content
  const shouldShowContent = !collapsed || isMobile;

  return (
    <div 
      className={`sidebar-dash-super ${!isMobile && collapsed ? 'sidebar-collapsed' : ''}`} 
      ref={ref}
      style={isMobile ? { width: '250px' } : {}}
    >
      <div className="sidebar-logo-dash">
        {shouldShowContent && (
          <div className="logo-container">
            <FontAwesomeIcon icon={faGraduationCap} className="sidebar-logo-icon" />
            <span className="sidebar-text sidebar-logo-text">{logoText}</span>
          </div>
        )}
        {!isMobile && (
          <button className="sidebar-toggle" onClick={handleToggleClick}>
            <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} />
          </button>
        )}
      </div>
      
      {shouldShowContent && (
        <div className="sidebar-profile-dash">
          <img src={user.image} alt="User" className="profile-image" />
          <div className="profile-info">
            <div className="sidebar-text profile-name-dashboard">{user.name}</div>
            <div className="sidebar-text profile-role">{user.role}</div>
          </div>
        </div>
      )}
      
      <nav className="sidebar-nav-dash">
        <div>
          {navItems.map((item, index) => (
            <div 
              key={index} 
              className={`nav-link ${item.active ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <FontAwesomeIcon icon={item.icon} className="nav-icon" />
              {shouldShowContent && (
                <>
                  <span className="sidebar-text nav-text">{item.text}</span>
                  {item.badge && (
                    <span className={`nav-badge-dash sidebar-text ${item.alert ? 'alert-dash' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        
        {shouldShowContent && (
          <div className="sidebar-settings">
            <div 
              className="nav-link"
              onClick={() => handleNavigation('/settings')}
            >
              <FontAwesomeIcon icon={faCog} className="nav-icon" />
              <span className="sidebar-text nav-text">الإعدادات</span>
            </div>
            <div 
              className="nav-link"
              onClick={() => handleNavigation('/logout')}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
              <span className="sidebar-text nav-text">تسجيل الخروج</span>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
});

export default Sidebar;