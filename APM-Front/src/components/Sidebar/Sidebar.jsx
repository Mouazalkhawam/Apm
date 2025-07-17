import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap, faChevronRight, faChevronLeft, 
  faTachometerAlt, faProjectDiagram, faUsers, faCalendarCheck,
  faFileAlt, faComments, faCog, faSignOutAlt,
  faUserPlus, faChalkboardTeacher, faTrophy
} from '@fortawesome/free-solid-svg-icons';
import "./Sidebar.css";
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
  const location = useLocation();
  const queryClient = useQueryClient();
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

  // Fetch user data with React Query
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['sidebarUser'],
    queryFn: async () => {
      const response = await apiClient.get('/api/user');
      return response.data;
    },
    onSuccess: (data) => {
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        password: '',
        password_confirmation: '',
        profile_picture: null
      });
    },
    onError: (error) => {
      console.error('Error fetching user data:', error);
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (formDataToSend) => {
      const response = await apiClient.post(
        '/api/profile/update', 
        formDataToSend
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        alert('تم تحديث الحساب بنجاح!');
        setShowSettingsModal(false);
        queryClient.invalidateQueries(['sidebarUser']);
      } else {
        alert(data.message || 'حدث خطأ أثناء تحديث الحساب');
      }
    },
    onError: (error) => {
      console.error('Error:', error);
      alert('حدث خطأ أثناء الاتصال بالخادم');
    }
  });

  // Determine navigation items based on user role
  const [navItems, setNavItems] = useState([]);

  useEffect(() => {
    if (userData?.role === 'supervisor') {
      setNavItems([
        { icon: faTachometerAlt, text: "اللوحة الرئيسية", path: "/supervisors-dashboard" },
        { icon: faProjectDiagram, text: "المشاريع", badge: 12, path: "/supervisor-project" },
        { icon: faUsers, text: "الطلاب", path: "/students" },
        { icon: faCalendarCheck, text: "جدولة الاجتماعات", badge: 5, alert: true, path: "/scheduling-supervisors-meetings" },
      ]);
    } else if (userData?.role === 'coordinator') {
      setNavItems([
        { icon: faTachometerAlt, text: "اللوحة الرئيسية", path: "/dashboard" },
        { icon: faProjectDiagram, text: "المشاريع", badge: 12, path: "/coordinator-project" },
        { icon: faComments, text: " المقترحات الجديدة", path: "/proposals-coordinator" },
        { icon: faUsers, text: "الطلاب", path: "/students" },
        { icon: faUserPlus, text: "إضافة مشرف", path: "/add-supervisor" },
        { icon: faUsers, text: "المشرفون", path: "/Supervisor-Management-Coordinator" },
        { icon: faChalkboardTeacher, text: "إدارة الفصول", path: "/academic-periods" },
        { icon: faTrophy, text: "لوحة الشرف", path: "/honorboard-coordinator" },
        { icon: faComments, text: "المناقشات",  path: "/discussions-coordinator" },
        { icon: faComments, text: "إدارة مكتبة الموارد", path: "/resources-librar-coordinator" }
      ]);
    }
  }, [userData]);

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 769;
      setIsMobile(mobile);
      
      if (mobile && collapsed) {
        onToggleCollapse();
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [collapsed, onToggleCollapse]);

  // Check if current path matches item path
  const isActive = (path) => {
    return location.pathname === path || 
           location.pathname.startsWith(path + '/');
  };

  const handleNavigation = (path) => {
    navigate(path);
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

  const handleSettingsClick = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
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
    
    updateProfileMutation.mutate(formDataToSend);
  };

  // Determine if we should show collapsed content
  const shouldShowContent = !collapsed || isMobile;

  // Update user info when data is loaded
  const currentUser = userData ? {
    name: userData.name || user.name,
    role: userData.role || user.role,
    image: userData.profile_picture || user.image
  } : user;

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
            <img 
              src={currentUser.image} 
              alt="User" 
              className="profile-image" 
              onError={(e) => {
                e.target.src = 'https://randomuser.me/api/portraits/women/44.jpg';
              }}
            />
            <div className="profile-info">
              <div className="sidebar-text profile-name-dashboard">{currentUser.name}</div>
              <div className="sidebar-text profile-role">{currentUser.role}</div>
            </div>
          </div>
        )}
        
        <nav className="sidebar-nav-dash">
          <div>
            {navItems.map((item, index) => (
              <div 
                key={index} 
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
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
                className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
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
            {userLoading ? (
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
                  {currentUser.image && (
                    <div className="current-image-preview">
                      <p>الصورة الحالية:</p>
                      <img 
                        src={currentUser.image} 
                        alt="Current Profile" 
                        className="profile-preview"
                        onError={(e) => {
                          e.target.src = 'https://randomuser.me/api/portraits/women/44.jpg';
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={handleCloseModal}
                    disabled={updateProfileMutation.isLoading}
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit" 
                    className="save-btn"
                    disabled={updateProfileMutation.isLoading}
                  >
                    {updateProfileMutation.isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </button>
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