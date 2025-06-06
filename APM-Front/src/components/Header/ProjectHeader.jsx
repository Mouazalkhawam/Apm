import React from 'react';
import './ProjectHeader.css';

const ProjectHeader = ({ title, description, teamMembers, startDate, endDate }) => {
  return (
    <header className='project-header'>
      <div className="header-bg"></div>
      <div className="header-content">
        <h1 className="project-title">{title}</h1>
        <p className="project-description">
          {description}
        </p>
        <div className="project-meta">
          <div className="meta-item">
            <i className="fas fa-users"></i> فريق العمل: {teamMembers} أعضاء
          </div>
          <div className="meta-item">
            <i className="fas fa-calendar-alt"></i> بداية المشروع: {startDate}
          </div>
          <div className="meta-item">
            <i className="fas fa-hourglass-half"></i> التسليم النهائي: {endDate}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProjectHeader;