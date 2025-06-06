import React from 'react';
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
const SupervisorsManagement = () => {
  const supervisors = [
    {
      id: 1,
      name: "أحمد محمد",
      role: "المشرف الرئيسي",
      email: "ahmed@example.com",
      since: "منذ سنة",
      isMain: true
    },
    {
      id: 2,
      name: "سماء علي",
      role: "مشرف الجودة",
      email: "samaa@example.com",
      since: "منذ 5 أشهر",
      roleType: "quality"
    },
    {
      id: 3,
      name: "خالد عبدالله",
      role: "مشرف التطوير",
      email: "khaled@example.com",
      since: "منذ 3 أشهر",
      roleType: "development"
    }
  ];

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

  return (
    <div className="supervisors-management" dir="rtl">
         {/* Header Component */}
              <ProjectHeader 
                title="مشروع تطوير نظام إدارة المجموعات"
                description="هذا المشروع يهدف إلى تطوير نظام متكامل لإدارة مشاريع المجموعات في الجامعة، حيث يمكن توزيع المهام ومتابعة التقدم والإنجاز بشكل فعال."
                teamMembers={5}
                startDate="01/01/2023"
                endDate="15/06/2023"
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