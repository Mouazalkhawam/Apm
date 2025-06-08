import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser,
  faCrown,
  faEnvelope,
  faCalendarAlt,
  faPen,
  faTrash,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import './SupervisorsManagement.css';
import ProjectHeader from '../components/Header/ProjectHeader';
import axios from 'axios';

const SupervisorsManagement = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          // تحويل البيانات الواردة من API إلى الشكل المتوقع في الكومبوننت
          const formattedSupervisors = response.data.data.map(supervisor => ({
            id: supervisor.supervisorId,
            name: supervisor.name,
            role: "مشرف أكاديمي", // يمكنك تعديل هذا حسب احتياجاتك
            email: supervisor.email,
            since: supervisor.since,
            isMain: false // يمكنك تحديد المشرف الرئيسي إذا كان متاحاً في API
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
          text: "",
          bg: "",
          border: ""
        };
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
      {/* Header Component */}
      <ProjectHeader 
        title=" المشرفين على المشروع "
        description="إدارة المشرفين المسؤولين عن متابعة سير العمل في المشروع"
      />

      <main className="container">
        {/* Supervisors Section Header */}
        <div className="section-header">
          <button className="add-supervisor-btn">
            <FontAwesomeIcon icon={faPlus} />
            <span>إضافة مشرف جديد</span>
          </button>
          
          <div>
            <h2 className="section-title">قائمة المشرفين</h2>
            <p className="section-description">إدارة المشرفين المسؤولين عن متابعة سير العمل في المشروع</p>
          </div>
        </div>
        
        {/* Supervisors Grid */}
        <div className="supervisors-grid">
          {/* Existing Supervisors */}
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
          
          {/* Add Supervisor Card */}
          <div className="add-new-card">
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
    </div>
  );
};

export default SupervisorsManagement;