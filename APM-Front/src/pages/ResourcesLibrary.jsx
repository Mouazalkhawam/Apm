import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faEdit, faTrash, faLink, 
  faFilePdf, faTimes, faCloudUploadAlt,
  faFolderOpen
} from '@fortawesome/free-solid-svg-icons';
import './ResourcesLibrary.css';

const ResourcesLibrary = () => {
  
  const [resources, setResources] = useState([
    {
      id: '1',
      title: 'دليل لغة JavaScript',
      type: 'library',
      description: 'دليل شامل لتعلم لغة JavaScript من الصفر حتى الإحتراف مع أمثلة عملية وتطبيقات حقيقية.',
      url: 'https://example.com/js-guide',
      file: null
    },
    {
      id: '2',
      title: 'أساسيات تصميم الويب',
      type: 'article',
      description: 'مقالة شاملة تشرح أساسيات تصميم الويب الحديث باستخدام HTML5 و CSS3 مع أفضل الممارسات.',
      url: '',
      file: 'web-design-basics.pdf'
    },
    {
      id: '3',
      title: 'مرجع MongoDB',
      type: 'reference',
      description: 'مرجع شامل لأوامر MongoDB مع شرح مفصل لجميع العمليات الأساسية والمتقدمة في قواعد بيانات NoSQL.',
      url: 'https://example.com/mongodb-ref',
      file: 'mongodb-cheatsheet.pdf'
    }
  ]);

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('إضافة مورد جديد');
  const [currentResource, setCurrentResource] = useState({
    id: '',
    title: '',
    type: '',
    description: '',
    url: '',
    file: null
  });
  const [fileName, setFileName] = useState('');

  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResources, setFilteredResources] = useState(resources);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredResources(resources);
    } else {
      const filtered = resources.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredResources(filtered);
    }
  }, [searchTerm, resources]);

  // Open modal for adding new resource
  const openAddModal = () => {
    setModalTitle('إضافة مورد جديد');
    setCurrentResource({
      id: '',
      title: '',
      type: '',
      description: '',
      url: '',
      file: null
    });
    setFileName('');
    setIsModalOpen(true);
  };

  // Open modal for editing resource
  const openEditModal = (resource) => {
    setModalTitle('تعديل المورد');
    setCurrentResource({
      ...resource,
      file: null // Reset file input, we'll handle file display separately
    });
    setFileName(resource.file ? `الملف الحالي: ${resource.file}` : '');
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileName(`تم تحديد الملف: ${e.target.files[0].name}`);
      setCurrentResource({
        ...currentResource,
        file: e.target.files[0]
      });
    } else {
      setFileName('');
      setCurrentResource({
        ...currentResource,
        file: null
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentResource.id) {
      // Update existing resource
      setResources(resources.map(resource => 
        resource.id === currentResource.id ? currentResource : resource
      ));
    } else {
      // Add new resource
      const newResource = {
        ...currentResource,
        id: Date.now().toString()
      };
      setResources([...resources, newResource]);
    }
    
    closeModal();
  };

  // Handle resource deletion
  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المورد؟')) {
      setResources(resources.filter(resource => resource.id !== id));
    }
  };

  // Get type display text and class
  const getTypeInfo = (type) => {
    switch (type) {
      case 'article':
        return { text: 'مقالة', class: 'resources-library-resource-type-article' };
      case 'reference':
        return { text: 'مرجع', class: 'resources-library-resource-type-reference' };
      case 'library':
        return { text: 'مكتبة برمجية', class: 'resources-library-resource-type-library' };
      default:
        return { text: '', class: '' };
    }
  };

  return (
    <div className="resources-library-ar">
      {/* Header */}
      <header className="resources-library-header">
        <div className="resources-library-container resources-library-header-container">
          <h1 className="resources-library-header-title"> مكتبة الموارد</h1>
          <div className="resources-library-user-info">مرحبًا بك</div>
        </div>
      </header>
      
      {/* Main Container */}
      <div className="resources-library-container resources-library-main-content">
        {/* Search Section */}
        <section className="resources-library-search-section">
          <form 
            className="resources-library-search-form" 
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input 
              type="text" 
              className="resources-library-search-input" 
              placeholder="ابحث عن الموارد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">
              بحث
            </button>
          </form>
          <div className="resources-library-search-results-info">
            {filteredResources.length} مورد متاح
          </div>
        </section>
        
        {/* Resources Section */}
        <section className="resources-library-resources-section">
          <div className="resources-library-section-header">
            <h2 className="resources-library-section-title">جميع الموارد</h2>
            <button 
              className="resources-library-add-resource-btn"
              onClick={openAddModal}
            >
              <FontAwesomeIcon icon={faPlus} /> إضافة مورد جديد
            </button>
          </div>
          
          {/* Resources Grid */}
          <div className="resources-library-resources-grid">
            {filteredResources.length > 0 ? (
              filteredResources.map(resource => (
                <div 
                  key={resource.id} 
                  className="resources-library-resource-card"
                >
                  <div className="resources-library-card-header">
                    <h3 className="resources-library-resource-title">{resource.title}</h3>
                    <span className={`resources-library-resource-type ${getTypeInfo(resource.type).class}`}>
                      {getTypeInfo(resource.type).text}
                    </span>
                  </div>
                  <div className="resources-library-card-body">
                    <p className="resources-library-resource-description">
                      {resource.description}
                    </p>
                    {resource.url && (
                      <a 
                        href={resource.url} 
                        className="resources-library-resource-link"
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={faLink} /> {resource.url}
                      </a>
                    )}
                    {resource.file && (
                      <div className="resources-library-resource-file">
                        <FontAwesomeIcon icon={faFilePdf} /> {resource.file}
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
                      onClick={() => handleDelete(resource.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} /> حذف
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="resources-library-empty-state" style={{ display: 'block' }}>
                <FontAwesomeIcon icon={faFolderOpen} />
                <p>لا توجد موارد متاحة حاليًا. اضغط على زر "إضافة مورد جديد" لإنشاء أول مورد لك.</p>
              </div>
            )}
          </div>
        </section>
      </div>
      
      {/* Add/Edit Resource Modal */}
      <div 
        className={`resources-library-modal-overlay ${isModalOpen ? 'active' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeModal();
          }
        }}
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
              <input 
                type="hidden" 
                value={currentResource.id}
              />
            </div>
            
            <div className="resources-library-form-group">
              <label 
                htmlFor="resourceTitle" 
                className="resources-library-form-label"
              >
                عنوان المورد
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
                نوع المورد
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
                <option value="library">مكتبة برمجية</option>
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
              />
            </div>
            
            <div className="resources-library-form-group">
              <label 
                htmlFor="resourceUrl" 
                className="resources-library-form-label"
              >
                رابط المورد (اختياري)
              </label>
              <input 
                type="url" 
                id="resourceUrl" 
                className="resources-library-form-input"
                value={currentResource.url}
                onChange={(e) => setCurrentResource({
                  ...currentResource,
                  url: e.target.value
                })}
              />
            </div>
            
            <div className="resources-library-form-group">
              <label className="resources-library-form-label">
                رفع ملف (اختياري)
              </label>
              <label 
                htmlFor="resourceFile" 
                className="resources-library-file-input-label"
              >
                <FontAwesomeIcon icon={faCloudUploadAlt} />
                <p>اضغط لرفع ملف أو اسحب وأسقط الملف هنا</p>
                <p className="text-xs">الحجم الأقصى: 5MB</p>
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
            
            <div className="resources-library-modal-footer">
              <button 
                type="button" 
                className="resources-library-btn-cancel"
                onClick={closeModal}
              >
                إلغاء
              </button>
              <button 
                type="submit" 
                className="resources-library-btn-submit"
              >
                حفظ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResourcesLibrary;