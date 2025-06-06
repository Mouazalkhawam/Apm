import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectHeader.css';

const ProjectHeader = ({ 
  title, 
  description, 
  teamMembers, 
  startDate, 
  endDate,
  customBackAction, // دالة مخصصة للرجوع
  backRoute // مسار مخصص للرجوع
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (customBackAction) {
      customBackAction(); // إذا وجدت دالة مخصصة، استخدمها
    } else if (backRoute) {
      navigate(backRoute); // إذا وجد مسار مخصص، اذهب إليه
    } else {
      navigate(-1); // افتراضيًا: العودة للصفحة السابقة
    }
  };


  return (
    <header className='project-header'>
      <div className="header-bg-project"></div>
      <button className="back-button-project" onClick={handleGoBack}>
        <i className="fas fa-arrow-right"></i> رجوع
      </button>
      <div className="header-content-project">
        <h1 className="project-title-project">{title}</h1>
        <p className="project-description-project">
          {description}
        </p>
        <div className="project-meta-project">
          <div className="meta-item-project">
            <i className="fas fa-users"></i> فريق العمل: {teamMembers} أعضاء
          </div>
          <div className="meta-item-project">
            <i className="fas fa-calendar-alt"></i> بداية المشروع: {startDate}
          </div>
          <div className="meta-item-project">
            <i className="fas fa-hourglass-half"></i> التسليم النهائي: {endDate}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProjectHeader;