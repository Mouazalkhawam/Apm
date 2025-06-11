import React from 'react';
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
      { icon: faProjectDiagram, text: "المشاريع", badge: 12, path: "/group-supervisor" },
      { icon: faUsers, text: "الطلاب", path: "/students" },
      { icon: faCalendarCheck, text: "جدولة الاجتماعات", badge: 5, alert: true, path: "/scheduling-supervisors-meetings" },
      { icon: faFileAlt, text: "التقارير", path: "/reports" },
      { icon: faComments, text: "المناقشات", badge: 3, path: "/discussions" }
    ],
    collapsed = false,
    onToggleCollapse = () => {},
    logoText = "أكاديمية المشاريع"
  }, ref) => {
  
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className={`sidebar-dash-super ${collapsed ? 'sidebar-collapsed' : ''}`} ref={ref}>
      {/* Logo - Show only arrow when collapsed */}
      <div className="sidebar-logo">
        {!collapsed && (
          <div className="logo-container">
            <FontAwesomeIcon icon={faGraduationCap} className="sidebar-logo-icon" />
            <span className="sidebar-text sidebar-logo-text">{logoText}</span>
          </div>
        )}
        <button className="sidebar-toggle" onClick={onToggleCollapse}>
          <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} />
        </button>
      </div>
      
      {/* User Profile - Hide when collapsed */}
      {!collapsed && (
        <div className="sidebar-profile-dash">
          <img src={user.image} alt="User" className="profile-image" />
          <div className="profile-info">
            <div className="sidebar-text profile-name-dashboard">{user.name}</div>
            <div className="sidebar-text profile-role">{user.role}</div>
          </div>
        </div>
      )}
      
      {/* Navigation - Hide text and badges when collapsed */}
      <nav className="sidebar-nav">
        <div>
          {navItems.map((item, index) => (
            <div 
              key={index} 
              className={`nav-link ${item.active ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <FontAwesomeIcon icon={item.icon} className="nav-icon" />
              {!collapsed && (
                <>
                  <span className="sidebar-text nav-text">{item.text}</span>
                  {item.badge && (
                    <span className={`nav-badge sidebar-text ${item.alert ? 'alert' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        
        {/* Settings - Hide text when collapsed */}
        {!collapsed && (
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