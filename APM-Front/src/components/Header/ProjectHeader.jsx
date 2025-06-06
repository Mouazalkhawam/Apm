import React from 'react';
import './ProjectHeader.css';

const ProjectHeader = ({ title, description, teamMembers, startDate, endDate }) => {
  return (
    <header className='project-header'>
      <div className="header-bg-project"></div>
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