import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser,
  faCrown,
  faEnvelope,
  faCalendarAlt,
  faPen,
  faTrash,
  faPlus,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import './SupervisorsManagement.css';
import ProjectHeader from '../components/Header/ProjectHeader';
import axios from 'axios';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();

const SupervisorsManagement = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'academic',
    since: new Date().toISOString().split('T')[0]
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const groupId = localStorage.getItem('selectedGroupId');
        if (!groupId) {
          throw new Error('Group ID not found');
        }

        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `http://127.0.0.1:8000/api/groups/${groupId}/supervisors`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          const formattedSupervisors = response.data.data.map(supervisor => ({
            id: supervisor.supervisorId,
            name: supervisor.name,
            role: supervisor.role || "مشرف أكاديمي",
            email: supervisor.email,
            since: supervisor.since || new Date().toISOString().split('T')[0],
            isMain: supervisor.isMain || false,
            roleType: supervisor.roleType || 'academic'
          }));
          
          setSupervisors(formattedSupervisors);
        } else {
          throw new Error('Failed to fetch supervisors');
        }
      } catch (err) {
        setError(err.message || 'حدث خطأ أثناء جلب بيانات المشرفين');
        console.error('Error fetching supervisors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisors();
  }, []);

  const getRoleClass = (roleType) => {
    switch(roleType) {
      case "quality":
        return {
          text: "role-quality",
          bg: "bg-quality",
          border: "border-quality"
        };
      case "development":
        return {
          text: "role-development",
          bg: "bg-development",
          border: "border-development"
        };
      default:
        return {
          text: "role-academic",
          bg: "bg-academic",
          border: "border-academic"
        };
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'اسم المشرف مطلوب';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'البريد الإلكتروني غير صالح';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const groupId = localStorage.getItem('selectedGroupId');
      
      const response = await axios.post(
        `http://127.0.0.1:8000/api/groups/${groupId}/supervisors`,
        {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          since: formData.since
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        // Add the new supervisor to the list
        const newSupervisor = {
          id: response.data.supervisorId,
          name: formData.name,
          role: formData.role === 'quality' ? 'مشرف جودة' : 
               formData.role === 'development' ? 'مشرف تطوير' : 'مشرف أكاديمي',
          email: formData.email,
          since: formData.since,
          isMain: false,
          roleType: formData.role
        };
        
        setSupervisors(prev => [...prev, newSupervisor]);
        setShowAddModal(false);
        setFormData({
          name: '',
          email: '',
          role: 'academic',
          since: new Date().toISOString().split('T')[0]
        });
      } else {
        throw new Error(response.data.message || 'فشل في إضافة المشرف');
      }
    } catch (err) {
      console.error('Error adding supervisor:', err);
      setError(err.response?.data?.message || err.message || 'حدث خطأ أثناء إضافة المشرف');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="supervisors-management" dir="rtl">
        <ProjectHeader 
          title=" المشرفين على المشروع "
          description="جاري تحميل بيانات المشرفين..."
        />
        <main className="container">
          <div className="loading-spinner">جاري تحميل بيانات المشرفين...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="supervisors-management" dir="rtl">
        <ProjectHeader 
          title=" المشرفين على المشروع "
          description={error}
        />
        <main className="container">
          <div className="error-message">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="supervisors-management" dir="rtl">
      <ProjectHeader 
        title=" المشرفين على المشروع "
        description="إدارة المشرفين المسؤولين عن متابعة سير العمل في المشروع"
      />

      <main className="container">
        <div className="section-header">
          <button 
            className="add-supervisor-btn"
            onClick={() => setShowAddModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>إضافة مشرف جديد</span>
          </button>
          
          <div>
            <h2 className="section-title">قائمة المشرفين</h2>
            <p className="section-description">إدارة المشرفين المسؤولين عن متابعة سير العمل في المشروع</p>
          </div>
        </div>
        
        <div className="supervisors-grid">
          {supervisors.map(supervisor => (
            <div className="supervisor-card" key={supervisor.id}>
              {supervisor.isMain && (
                <div className="crown-badge">
                  <FontAwesomeIcon icon={faCrown} />
                </div>
              )}
              
              <div className="supervisor-content">
                <div className="supervisor-info">
                  <div className={`supervisor-avatar ${getRoleClass(supervisor.roleType).bg} ${getRoleClass(supervisor.roleType).border}`}>
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  
                  <h3 className="supervisor-name">{supervisor.name}</h3>
                  <p className={`supervisor-role ${getRoleClass(supervisor.roleType).text}`}>
                    {supervisor.role}
                  </p>
                  
                  <div className="supervisor-email">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span>{supervisor.email}</span>
                  </div>
                </div>
                
                <div className="supervisor-footer">
                  <span className="supervisor-date">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    {supervisor.since}
                  </span>
                  
                  <div className="supervisor-actions">
                    <button className={`action-btn edit-btn ${getRoleClass(supervisor.roleType).bg}`}>
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button className="action-btn delete-btn">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="add-new-card" onClick={() => setShowAddModal(true)}>
            <div className="add-new-content">
              <div className="add-icon">
                <FontAwesomeIcon icon={faPlus} />
              </div>
              <h3 className="add-title">إضافة مشرف جديد</h3>
              <p className="add-description">انقر لإضافة مشرف جديد للمشروع</p>
            </div>
          </div>
        </div>
      </main>

      {/* Add Supervisor Modal */}
      {showAddModal && (
        <div className="modal-overlay-profile">
          <div className="modal-content">
            <span 
              className="close-modal" 
              onClick={() => {
                setShowAddModal(false);
                setFormErrors({});
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </span>
            <h2 className="modal-title">إضافة مشرف جديد</h2>
            
            {error && (
              <div className="alert alert-danger">
                <FontAwesomeIcon icon={faTimes} /> {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>اسم المشرف *</label>
                <input 
                  type="text" 
                  className={`form-input-profile ${formErrors.name ? 'is-invalid' : ''}`}
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="أدخل اسم المشرف"
                />
                {formErrors.name && (
                  <div className="invalid-feedback">{formErrors.name}</div>
                )}
              </div>
          
              <button 
                className="btn-profile btn-primary-profile" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon icon={faPlus} spin /> جاري الإضافة...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlus} /> إضافة المشرف
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorsManagement;