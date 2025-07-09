import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap, faChevronRight, faChevronLeft, 
  faTachometerAlt, faProjectDiagram, faUsers, faCalendarCheck,
  faFileAlt, faComments, faCog, faSignOutAlt,
  faUserPlus, faChalkboardTeacher, faTrophy
} from '@fortawesome/free-solid-svg-icons';
import "./Sidebar.css";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Sidebar = React.forwardRef(({ 
    user = {
      name: "د.عفاف",
      role: "منسق المشاريع",
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    collapsed = false,
    onToggleCollapse = () => {},
    onToggleEffect = () => {},
    logoText = "أكاديمية المشاريع"
  }, ref) => {
  
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    profile_picture: null
  });
  const [loading, setLoading] = useState(false);
  const [navItems, setNavItems] = useState([]);

  // تحديد عناصر القائمة بناءً على دور المستخدم
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/user', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Accept': 'application/json',
          }
        });
        
        const userData = response.data;
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          password: '',
          password_confirmation: '',
          profile_picture: null
        });

        // تحديث صورة المستخدم إذا كانت متوفرة
        if (userData.profile_picture) {
          user.image = userData.profile_picture;
        }

        // تحديد عناصر القائمة بناءً على الدور
        if (userData.role === 'supervisor') {
          setNavItems([
            { icon: faTachometerAlt, text: "اللوحة الرئيسية", active: true, path: "/supervisors-dashboard" },
            { icon: faProjectDiagram, text: "المشاريع", badge: 12, path: "/supervisor-project" },
            { icon: faUsers, text: "الطلاب", path: "/students" },
            { icon: faCalendarCheck, text: "جدولة الاجتماعات", badge: 5, alert: true, path: "/scheduling-supervisors-meetings" },
            /* { icon: faFileAlt, text: "التقارير", path: "/reports" }, */
            /* { icon: faComments, text: "المناقشات", badge: 3, path: "/discussions" } */
          ]);
        } else if (userData.role === 'coordinator') {
          setNavItems([
            { icon: faTachometerAlt, text: "اللوحة الرئيسية", active: true, path: "/dashboard" },
            { icon: faProjectDiagram, text: "المشاريع", badge: 12, path: "/coordinator-project" },
            { icon: faUsers, text: "الطلاب", path: "/students" },
            { icon: faUserPlus, text: "إضافة مشرف", path: "/add-supervisor" },
            { icon: faUsers, text: "المشرفون", path: "/Supervisor-Management-Coordinator" },
            { icon: faChalkboardTeacher, text: "إدارة الفصول", path: "/academic-periods" },
            { icon: faTrophy, text: "لوحة الشرف", path: "/honorboard-coordinator" },
            { icon: faComments, text: "المناقشات", badge: 3, path: "/discussions-coordinator" }
          ]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('حدث خطأ أثناء جلب بيانات المستخدم');
      }
    };

    fetchUserData();
  }, []);

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

  const handleSettingsClick = async () => {
    setShowSettingsModal(true);
  };

  const handleCloseModal = () => {
    setShowSettingsModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      profile_picture: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      if (formData.password) {
        formDataToSend.append('password', formData.password);
        formDataToSend.append('password_confirmation', formData.password_confirmation);
      }
      if (formData.profile_picture) {
        formDataToSend.append('profile_picture', formData.profile_picture);
      }
      formDataToSend.append('_method', 'PUT');
      
      const response = await axios.post('http://127.0.0.1:8000/api/profile/update', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.success) {
        alert('تم تحديث الحساب بنجاح!');
        setShowSettingsModal(false);
        // Refresh the page to update user data
        window.location.reload();
      } else {
        alert(response.data.message || 'حدث خطأ أثناء تحديث الحساب');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ أثناء الاتصال بالخادم');
    }
  };

  // Determine if we should show collapsed content
  const shouldShowContent = !collapsed || isMobile;

  return (
    <>
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
                onClick={handleSettingsClick}
              >
                <FontAwesomeIcon icon={faCog} className="nav-icon" />
                <span className="sidebar-text nav-text">الإعدادات</span>
              </div>
              <div 
                className="nav-link"
                onClick={() => {
                  localStorage.removeItem('access_token');
                  navigate('/login');
                }}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
                <span className="sidebar-text nav-text">تسجيل الخروج</span>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay active">
          <div className="settings-modal">
            <div className="modal-header-settings">
              <h3>تعديل معلومات الحساب</h3>
              <button onClick={handleCloseModal} className="close-modal">&times;</button>
            </div>
            {loading ? (
              <div className="loading-spinner">جاري تحميل البيانات...</div>
            ) : (
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="form-group">
                  <label>الاسم الكامل</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>رقم الهاتف</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>كلمة المرور الجديدة (اختياري)</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="اتركه فارغاً إذا لم ترغب في التغيير"
                  />
                </div>
                
                <div className="form-group">
                  <label>تأكيد كلمة المرور الجديدة</label>
                  <input 
                    type="password" 
                    name="password_confirmation" 
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    placeholder="اتركه فارغاً إذا لم ترغب في التغيير"
                  />
                </div>
                
                <div className="form-group">
                  <label>صورة الملف الشخصي</label>
                  <input 
                    type="file" 
                    name="profile_picture"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  {user.image && (
                    <div className="current-image-preview">
                      <p>الصورة الحالية:</p>
                      <img src={user.image} alt="Current Profile" className="profile-preview" />
                    </div>
                  )}
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={handleCloseModal}>إلغاء</button>
                  <button type="submit" className="save-btn">حفظ التغييرات</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
});

export default Sidebar;