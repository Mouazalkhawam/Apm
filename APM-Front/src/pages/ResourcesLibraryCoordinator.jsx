import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faEdit, faTrash, faLink, 
  faFilePdf, faTimes, faCloudUploadAlt,
  faFolderOpen, faSpinner, faExclamationCircle, faUsers, faCalendarCheck, faFileAlt,
  faCheckCircle, faSearch, faProjectDiagram, faEnvelope, faTachometerAlt, faComments, faBars,
  faCheck, faBan, faClock
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';
import './ResourcesLibrary.css';

const SidebarWithRef = React.forwardRef((props, ref) => (
  <Sidebar ref={ref} {...props} />
));

const ResourcesLibraryCoordinator = () => {
  // Refs
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  
  // States
  const [approvedResources, setApprovedResources] = useState([]);
  const [pendingResources, setPendingResources] = useState([]);
  const [activeTab, setActiveTab] = useState('approved');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('إضافة مورد جديد');
  const [currentResource, setCurrentResource] = useState({
    title: '',
    type: '',
    description: '',
    link: '',
    file: null
  });
  const [resourceToApprove, setResourceToApprove] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [coordinatorInfo, setCoordinatorInfo] = useState({
    name: '',
    image: ''
  });

  // Fetch data from API
  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('لم يتم العثور على رمز الوصول. يرجى تسجيل الدخول مرة أخرى.');
      }

      // Fetch coordinator info
      const userResponse = await fetch('http://127.0.0.1:8000/api/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('فشل في جلب بيانات المستخدم');
      }

      const userData = await userResponse.json();
      setCoordinatorInfo({
        name: userData.name,
        image: userData.profile_picture || 'https://randomuser.me/api/portraits/women/44.jpg'
      });

      // Fetch approved and pending resources in parallel
      const [approvedResponse, pendingResponse] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/resources/approved', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('http://127.0.0.1:8000/api/resources/pending', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (!approvedResponse.ok) {
        throw new Error('فشل في جلب الموارد المعتمدة');
      }

      if (!pendingResponse.ok) {
        throw new Error('فشل في جلب الموارد المعلقة');
      }

      const approvedData = await approvedResponse.json();
      const pendingData = await pendingResponse.json();

      // Handle both array and paginated responses
      const getResourcesArray = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data.data?.data)) return data.data.data;
        return [];
      };

      setApprovedResources(getResourcesArray(approvedData));
      setPendingResources(getResourcesArray(pendingData));

    } catch (err) {
      setError(err.message);
      setApprovedResources([]);
      setPendingResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Filter resources based on search term
  const filteredApprovedResources = approvedResources.filter(resource =>
    resource?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    resource?.description?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const filteredPendingResources = pendingResources.filter(resource =>
    resource?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    resource?.description?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Mobile sidebar handlers
  const toggleMobileSidebar = () => {
    sidebarRef.current?.classList.add('sidebar-open');
    overlayRef.current?.classList.add('overlay-open');
  };
  
  const closeMobileSidebar = () => {
    sidebarRef.current?.classList.remove('sidebar-open');
    overlayRef.current?.classList.remove('overlay-open');
  };

  // Open modal for adding new resource
  const openAddModal = () => {
    setModalTitle('إضافة مورد جديد');
    setCurrentResource({
      title: '',
      type: '',
      description: '',
      link: '',
      file: null
    });
    setFileName('');
    setError(null);
    setSuccessMessage('');
    setIsModalOpen(true);
  };

  // Open modal for editing resource
  const openEditModal = (resource) => {
    setModalTitle('تعديل المورد');
    setCurrentResource({
      title: resource.title,
      type: resource.type,
      description: resource.description,
      link: resource.link,
      file: null,
      id: resource.resourceId
    });
    setFileName(resource.filePath ? `الملف الحالي: ${resource.filePath.split('/').pop()}` : '');
    setError(null);
    setSuccessMessage('');
    setIsModalOpen(true);
  };

  // Open approval modal
  const openApprovalModal = (resource) => {
    setResourceToApprove(resource);
    setApprovalNotes('');
    setError(null);
    setSuccessMessage('');
    setIsApprovalModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setUploadProgress(0);
  };

  // Close approval modal
  const closeApprovalModal = () => {
    setIsApprovalModalOpen(false);
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('حجم الملف يجب أن يكون أقل من 5MB');
        return;
      }
      setFileName(`تم تحديد الملف: ${file.name}`);
      setCurrentResource({
        ...currentResource,
        file: file
      });
      setError(null);
    } else {
      setFileName('');
      setCurrentResource({
        ...currentResource,
        file: null
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    setUploadProgress(0);

    if (!currentResource.title || !currentResource.type) {
      setError('العنوان ونوع المورد مطلوبان');
      return;
    }

    const formData = new FormData();
    formData.append('title', currentResource.title);
    formData.append('type', currentResource.type);
    formData.append('description', currentResource.description || '');
    formData.append('link', currentResource.link || '');
    if (currentResource.file) {
      formData.append('file', currentResource.file);
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
      }

      let url = 'http://127.0.0.1:8000/api/resources';
      let method = 'POST';

      if (currentResource.id) {
        url = `http://127.0.0.1:8000/api/resources/${currentResource.id}`;
        method = 'POST';
      }

      const xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          fetchResources(); // Refresh data
          setSuccessMessage(currentResource.id ? 'تم تحديث المورد بنجاح' : 'تم إضافة المورد بنجاح');
          setTimeout(() => {
            closeModal();
          }, 1500);
        } else {
          const errorResponse = JSON.parse(xhr.responseText);
          setError(errorResponse.message || 'حدث خطأ أثناء حفظ المورد');
        }
      };

      xhr.onerror = () => {
        setError('حدث خطأ في الاتصال بالخادم');
      };

      xhr.send(formData);

    } catch (err) {
      setError(err.message);
    }
  };

  // Handle resource approval/rejection
  const handleResourceApproval = async (status) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
      }

      const response = await fetch(`http://127.0.0.1:8000/api/resources/${resourceToApprove.resourceId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: status,
          notes: approvalNotes
        })
      });

      if (!response.ok) {
        throw new Error('فشل في تحديث حالة المورد');
      }

      await fetchResources(); // Refresh data
      setSuccessMessage(`تم ${status === 'approved' ? 'الموافقة على' : 'رفض'} المورد بنجاح`);
      setTimeout(() => {
        closeApprovalModal();
      }, 1500);

    } catch (err) {
      setError(err.message);
    }
  };

  // Handle resource deletion
  const handleDelete = async (resourceId) => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا المورد؟')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
      }

      const response = await fetch(`http://127.0.0.1:8000/api/resources/${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('فشل في حذف المورد');
      }

      await fetchResources(); // Refresh data
      setSuccessMessage('تم حذف المورد بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Get type display text and class
  const getTypeInfo = (type) => {
    switch (type) {
      case 'article':
        return { text: 'مقالة', class: 'resources-library-resource-type-article' };
      case 'reference':
        return { text: 'مرجع', class: 'resources-library-resource-type-reference' };
      case 'tool':
        return { text: 'أداة', class: 'resources-library-resource-type-tool' };
      default:
        return { text: type, class: '' };
    }
  };

  // Get status display text and class
  const getStatusInfo = (status) => {
    switch (status) {
      case 'approved':
        return { text: 'معتمد', class: 'resources-library-resource-status-approved' };
      case 'pending':
        return { text: 'بانتظار الموافقة', class: 'resources-library-resource-status-pending' };
      case 'rejected':
        return { text: 'مرفوض', class: 'resources-library-resource-status-rejected' };
      default:
        return { text: status, class: '' };
    }
  };

  if (error && !approvedResources.length && !pendingResources.length) {
    return (
      <div className="dashboard-error">
        <FontAwesomeIcon icon={faExclamationCircle} className="error-icon" />
        <p className="error-message">{error}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container-dash-sup">
      {/* Sidebar Component */}
      <SidebarWithRef 
        ref={sidebarRef}
        user={{
          name: coordinatorInfo.name || "المنسق",
          role: "منسق",
          image: coordinatorInfo.image
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        navItems={[
          { icon: faTachometerAlt, text: "اللوحة الرئيسية", path: "/dashboard" },
          { icon: faProjectDiagram, text: "المشاريع", path: "/projects" },
          { icon: faUsers, text: "الطلاب", path: "/students" },
          { icon: faCalendarCheck, text: "المهام", path: "/tasks" },
          { icon: faFileAlt, text: "مكتبة الموارد", active: true, path: "/resources" },
          { icon: faComments, text: "الاجتماعات", path: "/meetings" }
        ]}
      />
      
      {/* Overlay for mobile sidebar */}
      <div id="overlay" className="overlay" ref={overlayRef} onClick={closeMobileSidebar}></div>
      
      {/* Main Content Area */}
      <div className="main-container">
        <div className="supervisor-dashboard">
          {/* Top Navigation */}
          <div className='nav-top-dash'>
            <TopNav 
              user={{
                name: coordinatorInfo.name || "المنسق",
                image: coordinatorInfo.image
              }}
              notifications={{
                bell: 3,
                envelope: 7
              }}
              searchPlaceholder="ابحث في الموارد..."
              onSearch={(term) => setSearchTerm(term)}
            />
            <div className='container-honor'>
            <button id="mobileSidebarToggle" className="mobile-sidebar-toggle" onClick={toggleMobileSidebar}>
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
          
          {/* Success Message */}
          {successMessage && (
            <div className="resources-library-success-message">
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>{successMessage}</span>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="resources-library-error-message">
              <FontAwesomeIcon icon={faExclamationCircle} />
              <span>{error}</span>
              {error.includes('انتهت صلاحية الجلسة') && (
                <button 
                  className="resources-library-login-redirect"
                  onClick={() => window.location.href = '/login'}
                >
                  تسجيل الدخول
                </button>
              )}
            </div>
          )}
          
          {/* Main Content */}
          <main className="resources-library-main-content">
            <div className="resources-library-section-header">
              <h1 className="resources-library-title">مكتبة الموارد</h1>
              <button 
                className="resources-library-add-resource-btn"
                onClick={openAddModal}
              >
                <FontAwesomeIcon icon={faPlus} /> إضافة مورد جديد
              </button>
            </div>
            
            {/* Tabs */}
            <div className="resources-library-tabs">
              <button 
                className={`resources-library-tab ${activeTab === 'approved' ? 'active' : ''}`}
                onClick={() => setActiveTab('approved')}
              >
                الموارد المعتمدة
              </button>
              <button 
                className={`resources-library-tab ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                الموارد المعلقة
                {pendingResources.length > 0 && (
                  <span className="resources-library-pending-count">
                    {pendingResources.length}
                  </span>
                )}
              </button>
            </div>
            
            {/* Search Section */}
            <section className="resources-library-search-section">
              <div className="resources-library-search-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input 
                  type="text" 
                  className="resources-library-search-input" 
                  placeholder="ابحث عن الموارد..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="resources-library-search-results-info">
                {activeTab === 'approved' 
                  ? `${filteredApprovedResources.length} مورد معتمد` 
                  : `${filteredPendingResources.length} مورد معلق`}
              </div>
            </section>
            
            {/* Resources Grid */}
            <div className="resources-library-resources-grid">
              {activeTab === 'approved' ? (
                filteredApprovedResources.length > 0 ? (
                  filteredApprovedResources.map(resource => (
                    <div 
                      key={resource.resourceId} 
                      className="resources-library-resource-card"
                    >
                      <div className="resources-library-card-header">
                        <h3 className="resources-library-resource-title">{resource.title}</h3>
                        <div className="resources-library-resource-meta">
                          <span className={`resources-library-resource-type ${getTypeInfo(resource.type).class}`}>
                            {getTypeInfo(resource.type).text}
                          </span>
                          <span className={`resources-library-resource-status ${getStatusInfo(resource.status).class}`}>
                            {getStatusInfo(resource.status).text}
                          </span>
                        </div>
                      </div>
                      <div className="resources-library-card-body">
                        <p className="resources-library-resource-description">
                          {resource.description}
                        </p>
                        {resource.link && (
                          <a 
                            href={resource.link} 
                            className="resources-library-resource-link"
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <FontAwesomeIcon icon={faLink} /> {resource.link}
                          </a>
                        )}
                        {resource.filePath && (
                          <div className="resources-library-resource-file">
                            <FontAwesomeIcon icon={faFilePdf} /> 
                            <a 
                              href={`http://127.0.0.1:8000/storage/${resource.filePath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {resource.filePath.split('/').pop()}
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="resources-library-card-footer">
                        <button 
                          className="resources-library-edit-btn"
                          onClick={() => openEditModal(resource)}
                        >
                          <FontAwesomeIcon icon={faEdit} /> تعديل
                        </button>
                        <button 
                          className="resources-library-delete-btn"
                          onClick={() => handleDelete(resource.resourceId)}
                        >
                          <FontAwesomeIcon icon={faTrash} /> حذف
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="resources-library-empty-state">
                    <FontAwesomeIcon icon={faFolderOpen} size="3x" />
                    <p>لا توجد موارد معتمدة حاليًا</p>
                    <button 
                      className="resources-library-add-resource-btn"
                      onClick={openAddModal}
                    >
                      <FontAwesomeIcon icon={faPlus} /> إضافة مورد جديد
                    </button>
                  </div>
                )
              ) : (
                filteredPendingResources.length > 0 ? (
                  filteredPendingResources.map(resource => (
                    <div 
                      key={resource.resourceId} 
                      className="resources-library-resource-card"
                    >
                      <div className="resources-library-card-header">
                        <h3 className="resources-library-resource-title">{resource.title}</h3>
                        <div className="resources-library-resource-meta">
                          <span className={`resources-library-resource-type ${getTypeInfo(resource.type).class}`}>
                            {getTypeInfo(resource.type).text}
                          </span>
                          <span className={`resources-library-resource-status ${getStatusInfo(resource.status).class}`}>
                            <FontAwesomeIcon icon={faClock} /> {getStatusInfo(resource.status).text}
                          </span>
                        </div>
                      </div>
                      <div className="resources-library-card-body">
                        <p className="resources-library-resource-description">
                          {resource.description}
                        </p>
                        {resource.link && (
                          <a 
                            href={resource.link} 
                            className="resources-library-resource-link"
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <FontAwesomeIcon icon={faLink} /> {resource.link}
                          </a>
                        )}
                        {resource.filePath && (
                          <div className="resources-library-resource-file">
                            <FontAwesomeIcon icon={faFilePdf} /> 
                            <a 
                              href={`http://127.0.0.1:8000/storage/${resource.filePath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {resource.filePath.split('/').pop()}
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="resources-library-card-footer">
                        <button 
                          className="resources-library-approve-btn"
                          onClick={() => openApprovalModal(resource)}
                        >
                          <FontAwesomeIcon icon={faCheck} /> مراجعة
                        </button>
                        <button 
                          className="resources-library-delete-btn"
                          onClick={() => handleDelete(resource.resourceId)}
                        >
                          <FontAwesomeIcon icon={faTrash} /> حذف
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="resources-library-empty-state">
                    <FontAwesomeIcon icon={faFolderOpen} size="3x" />
                    <p>لا توجد موارد معلقة حاليًا</p>
                  </div>
                )
              )}
            </div>
          </main>
        </div>
      </div>
      
      {/* Add/Edit Resource Modal */}
      <div 
        className={`resources-library-modal-overlay ${isModalOpen ? 'active' : ''}`}
        onClick={(e) => e.target === e.currentTarget && closeModal()}
      >
        <div className="resources-library-modal-content">
          <div className="resources-library-modal-header">
            <h3 className="resources-library-modal-title">{modalTitle}</h3>
            <button 
              className="resources-library-close-modal-btn"
              onClick={closeModal}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          
          <form 
            className="resources-library-resource-form"
            onSubmit={handleSubmit}
          >
            <div className="resources-library-form-group">
              <label 
                htmlFor="resourceTitle" 
                className="resources-library-form-label"
              >
                عنوان المورد *
              </label>
              <input 
                type="text" 
                id="resourceTitle" 
                className="resources-library-form-input"
                value={currentResource.title}
                onChange={(e) => setCurrentResource({
                  ...currentResource,
                  title: e.target.value
                })}
                required
              />
            </div>
            
            <div className="resources-library-form-group">
              <label 
                htmlFor="resourceType" 
                className="resources-library-form-label"
              >
                نوع المورد *
              </label>
              <select 
                id="resourceType" 
                className="resources-library-form-select"
                value={currentResource.type}
                onChange={(e) => setCurrentResource({
                  ...currentResource,
                  type: e.target.value
                })}
                required
              >
                <option value="">اختر نوع المورد</option>
                <option value="article">مقالة</option>
                <option value="reference">مرجع</option>
                <option value="tool">أداة</option>
              </select>
            </div>
            
            <div className="resources-library-form-group">
              <label 
                htmlFor="resourceDescription" 
                className="resources-library-form-label"
              >
                الوصف (اختياري)
              </label>
              <textarea 
                id="resourceDescription" 
                className="resources-library-form-textarea"
                value={currentResource.description}
                onChange={(e) => setCurrentResource({
                  ...currentResource,
                  description: e.target.value
                })}
                rows="3"
              />
            </div>
            
            <div className="resources-library-form-group">
              <label 
                htmlFor="resourceLink" 
                className="resources-library-form-label"
              >
                رابط المورد (اختياري)
              </label>
              <input 
                type="url" 
                id="resourceLink" 
                className="resources-library-form-input"
                value={currentResource.link}
                onChange={(e) => setCurrentResource({
                  ...currentResource,
                  link: e.target.value
                })}
                placeholder="https://example.com"
              />
            </div>
            
            <div className="resources-library-form-group">
              <label className="resources-library-form-label">
                رفع ملف (اختياري - الحد الأقصى 5MB)
              </label>
              <label 
                htmlFor="resourceFile" 
                className="resources-library-file-input-label"
              >
                <FontAwesomeIcon icon={faCloudUploadAlt} />
                <span>اضغط لرفع ملف أو اسحب وأسقط الملف هنا</span>
              </label>
              <input 
                type="file" 
                id="resourceFile" 
                className="resources-library-file-input"
                onChange={handleFileChange}
              />
              <div className="resources-library-file-name-display">
                {fileName}
              </div>
            </div>
            
            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="resources-library-upload-progress">
                <div 
                  className="resources-library-upload-progress-bar"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <span>{uploadProgress}%</span>
              </div>
            )}
            
            {/* Success Message */}
            {successMessage && (
              <div className="resources-library-form-success">
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>{successMessage}</span>
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="resources-library-form-error">
                <FontAwesomeIcon icon={faExclamationCircle} />
                <span>{error}</span>
              </div>
            )}
            
            <div className="resources-library-modal-footer">
              <button 
                type="button" 
                className="resources-library-btn-cancel"
                onClick={closeModal}
                disabled={uploadProgress > 0 && uploadProgress < 100}
              >
                إلغاء
              </button>
              <button 
                type="submit" 
                className="resources-library-btn-submit"
                disabled={uploadProgress > 0 && uploadProgress < 100}
              >
                {uploadProgress > 0 && uploadProgress < 100 ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin /> جاري الحفظ...
                  </>
                ) : (
                  'حفظ'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Resource Approval Modal */}
      <div 
        className={`resources-library-modal-overlay ${isApprovalModalOpen ? 'active' : ''}`}
        onClick={(e) => e.target === e.currentTarget && closeApprovalModal()}
      >
        <div className="resources-library-modal-content">
          <div className="resources-library-modal-header">
            <h3 className="resources-library-modal-title">مراجعة المورد</h3>
            <button 
              className="resources-library-close-modal-btn"
              onClick={closeApprovalModal}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          
          <div className="resources-library-approval-content">
            <div className="resources-library-approval-resource-info">
              <h4>{resourceToApprove?.title}</h4>
              <p>{resourceToApprove?.description}</p>
              
              <div className="resources-library-approval-meta">
                <span className={`resources-library-resource-type ${getTypeInfo(resourceToApprove?.type).class}`}>
                  {getTypeInfo(resourceToApprove?.type).text}
                </span>
                <span className="resources-library-approval-creator">
                  مقدم من: {resourceToApprove?.creator?.name}
                </span>
              </div>
              
              {resourceToApprove?.link && (
                <a 
                  href={resourceToApprove.link} 
                  className="resources-library-resource-link"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faLink} /> {resourceToApprove.link}
                </a>
              )}
              
              {resourceToApprove?.filePath && (
                <div className="resources-library-resource-file">
                  <FontAwesomeIcon icon={faFilePdf} /> 
                  <a 
                    href={`http://127.0.0.1:8000/storage/${resourceToApprove.filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resourceToApprove.filePath.split('/').pop()}
                  </a>
                </div>
              )}
            </div>
            
            <div className="resources-library-form-group">
              <label 
                htmlFor="approvalNotes" 
                className="resources-library-form-label"
              >
                ملاحظات (اختياري)
              </label>
              <textarea 
                id="approvalNotes" 
                className="resources-library-form-textarea"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows="3"
                placeholder="أضف ملاحظاتك حول المورد..."
              />
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="resources-library-form-error">
                <FontAwesomeIcon icon={faExclamationCircle} />
                <span>{error}</span>
              </div>
            )}
            
            {/* Success Message */}
            {successMessage && (
              <div className="resources-library-form-success">
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>{successMessage}</span>
              </div>
            )}
            
            <div className="resources-library-approval-footer">
              <button 
                type="button" 
                className="resources-library-btn-reject"
                onClick={() => handleResourceApproval('rejected')}
                disabled={!!successMessage}
              >
                <FontAwesomeIcon icon={faBan} /> رفض
              </button>
              <button 
                type="button" 
                className="resources-library-btn-approve"
                onClick={() => handleResourceApproval('approved')}
                disabled={!!successMessage}
              >
                <FontAwesomeIcon icon={faCheck} /> قبول
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ResourcesLibraryCoordinator;