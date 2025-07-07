import React, { useState, useEffect } from 'react';
import './HonorboardCoordinator.css';

const HonorboardCoordinator = () => {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    projectName: '',
    projectPosition: '',
    projectNote: ''
  });

  // Load projects from localStorage on component mount
  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem('projects')) || [];
    setProjects(savedProjects);
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const { projectName, projectPosition } = formData;
    
    if (!projectName || !projectPosition) {
      alert('الرجاء إدخال اسم المشروع وتحديد المركز');
      return;
    }
    
    const newProject = {
      id: Date.now(),
      name: projectName,
      position: projectPosition,
      note: formData.projectNote,
      date: new Date().toLocaleDateString('ar-EG')
    };
    
    setProjects(prev => [...prev, newProject]);
    setFormData({
      projectName: '',
      projectPosition: '',
      projectNote: ''
    });
  };

  const deleteProject = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      setProjects(prev => prev.filter(project => project.id !== id));
    }
  };

  const getPositionText = (position) => {
    switch(position) {
      case '1': return 'المركز الأول';
      case '2': return 'المركز الثاني';
      case '3': return 'المركز الثالث';
      default: return 'مشروع متميز';
    }
  };

  const getPositionClass = (position) => {
    switch(position) {
      case '1': return 'position-1';
      case '2': return 'position-2';
      case '3': return 'position-3';
      default: return 'position-other';
    }
  };

  // Sort projects by position
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.position === '1') return -1;
    if (b.position === '1') return 1;
    if (a.position === '2') return -1;
    if (b.position === '2') return 1;
    if (a.position === '3') return -1;
    if (b.position === '3') return 1;
    return 0;
  });

  return (
    <div>

      
      <div className="container-honor">
        <div className="dashboard-honor">
          <div className="add-project-honor">
            <h2 className="section-title-honor">إضافة مشروع متميز</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group-honor">
                <label htmlFor="projectName">اسم المشروع</label>
                <input 
                  type="text" 
                  id="projectName" 
                  required 
                  placeholder="أدخل اسم المشروع"
                  value={formData.projectName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="projectPosition">المركز</label>
                <select 
                  id="projectPosition" 
                  required
                  value={formData.projectPosition}
                  onChange={handleInputChange}
                >
                  <option value="">اختر المركز</option>
                  <option value="1">المركز الأول</option>
                  <option value="2">المركز الثاني</option>
                  <option value="3">المركز الثالث</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="projectNote">ملاحظة المشرف</label>
                <textarea 
                  id="projectNote" 
                  placeholder="أدخل ملاحظة عن المشروع"
                  value={formData.projectNote}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              
              <button type="submit" className="btn">حفظ المشروع</button>
            </form>
          </div>
          
          <div className="projects-list">
            <h2 className="section-title">قائمة المشاريع المتميزة</h2>
            <div className="projects-container">
              {sortedProjects.length === 0 ? (
                <div className="empty-state">لا توجد مشاريع مضافة بعد</div>
              ) : (
                sortedProjects.map(project => (
                  <div className="project-card" key={project.id}>
                    <button 
                      className="delete-btn" 
                      onClick={() => deleteProject(project.id)}
                    >
                      ×
                    </button>
                    <h3 className="project-name">{project.name}</h3>
                    <span className={`project-position ${getPositionClass(project.position)}`}>
                      {getPositionText(project.position)}
                    </span>
                    {project.note && <p className="project-note">{project.note}</p>}
                    <div className="project-date">تم الإضافة: {project.date}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HonorboardCoordinator;