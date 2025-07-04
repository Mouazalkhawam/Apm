import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell, faEnvelope, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import "./TopNav.css"

const TopNav = ({ 
  user = {
    name: "د.عفاف",
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  notifications = {
    bell: 3,
    envelope: 7
  },
  searchPlaceholder = "ابحث عن مشاريع، طلاب، مهام..."
}) => {
  return (
    <header className="top-nav-dash-super">
      <div className="top-nav-container-dash-super">
        {/* Search */}
        <div className="search-container-dash-super">
          <input type="text" placeholder={searchPlaceholder} className="search-input-dash-super" />
          <button className="search-button-dash">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
        
        {/* Notification & User */}
        <div className="notification-area">
          <button className="notification-button nav-svg">
            <FontAwesomeIcon icon={faBell} className="notification-icon" />
            {notifications.bell > 0 && (
              <span className="notification-badge">{notifications.bell}</span>
            )}
          </button>
          <button className="notification-button nav-svg">
            <FontAwesomeIcon icon={faEnvelope} className="notification-icon" />
            {notifications.envelope > 0 && (
              <span className="notification-badge blue">{notifications.envelope}</span>
            )}
          </button>
          <div className="divider"></div>
          <div className="user-area">
            <img src={user.image} alt="User" className="user-image" />
            <span className="user-name">{user.name}</span>
            <FontAwesomeIcon icon={faChevronDown} className="user-dropdown" />
          </div>
          
        </div>
      </div>
    </header>
  );
};

export default TopNav;