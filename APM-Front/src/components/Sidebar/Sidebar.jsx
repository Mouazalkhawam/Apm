import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap, faChevronRight, faChevronLeft, 
  faTachometerAlt, faProjectDiagram, faUsers, faCalendarCheck,
  faFileAlt, faComments, faCog, faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import "./Sidebar.css";

const Sidebar = React.forwardRef(({ 
    user = {
      name: "د.عفاف",
      role: "منسق المشاريع",
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    navItems = [
      { icon: faTachometerAlt, text: "اللوحة الرئيسية", active: true },
      { icon: faProjectDiagram, text: "المشاريع", badge: 12 },
      { icon: faUsers, text: "الطلاب" },
      { icon: faCalendarCheck, text: "المهام", badge: 5, alert: true },
      { icon: faFileAlt, text: "التقارير" },
      { icon: faComments, text: "المناقشات", badge: 3 }
    ],
    collapsed = false,
    onToggleCollapse = () => {},
    logoText = "أكاديمية المشاريع"
  }, ref) => {
  return (
    <div className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`} ref={ref}>
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
        <div className="sidebar-profile">
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
            <a href="#" key={index} className={`nav-link ${item.active ? 'active' : ''}`}>
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
            </a>
          ))}
        </div>
        
        {/* Settings - Hide text when collapsed */}
        {!collapsed && (
          <div className="sidebar-settings">
            <a href="#" className="nav-link">
              <FontAwesomeIcon icon={faCog} className="nav-icon" />
              <span className="sidebar-text nav-text">الإعدادات</span>
            </a>
            <a href="#" className="nav-link">
              <FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
              <span className="sidebar-text nav-text">تسجيل الخروج</span>
            </a>
          </div>
        )}
      </nav>
    </div>
  );
});

export default Sidebar;