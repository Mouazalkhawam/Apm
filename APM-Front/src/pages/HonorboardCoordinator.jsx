import React, { useState, useEffect, useRef } from 'react';
import './HonorboardCoordinator.css';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';
import { 
  faTachometerAlt, faProjectDiagram, faUsers, 
  faCalendarCheck, faFileAlt, faComments 
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

// Set base URL for API requests
const API_BASE_URL = 'http://localhost:8000'; // تأكد أن هذا مطابق لمسار Laravel

const SidebarWithRef = React.forwardRef((props, ref) => (
  <Sidebar ref={ref} {...props} />
));

const HonorboardCoordinator = () => {
  const [projects, setProjects] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    projectName: '',
    projectNote: '',
    projectId: ''
  });
  const sidebarRef = useRef(null);

  // Get auth token consistently
  const getAuthToken = () => {
    return localStorage.getItem('access_token');
  };

  useEffect(() => {
    const fetchAvailableProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getAuthToken();

        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`${API_BASE_URL}/api/honor-board/available-projects`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        let projectsData = [];
        if (response.data && Array.isArray(response.data)) {
          projectsData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          projectsData = response.data.data;
        }

        const filteredProjects = projectsData
          .filter(proj => proj && (proj.title || proj.name) && proj.projectid)
          .map(proj => ({
            projectid: proj.projectid,
            title: proj.title || proj.name || 'Untitled Project',
            description: proj.description || ''
          }));

        setAvailableProjects(filteredProjects);
      } catch (err) {
        console.error('Error fetching available projects:', err);
        setError('Failed to load available projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchHonorProjects = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}/api/honor-board`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const honorProjects = response.data?.data || [];

        const formatted = honorProjects.map(p => ({
          id: p.id,
          projectId: p.project?.projectid,
          name: p.project?.title,
          note: p.notes,
          date: new Date(p.featured_at).toLocaleDateString('ar-EG')
        }));

        setProjects(formatted);
      } catch (err) {
        console.error('Error fetching honor projects:', err);
      }
    };

    fetchAvailableProjects();
    fetchHonorProjects();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleProjectSelect = (e) => {
    const selectedProject = availableProjects.find(
      proj => proj.projectid.toString() === e.target.value
    );

    if (selectedProject) {
      setFormData({
        ...formData,
        projectId: selectedProject.projectid.toString(),
        projectName: selectedProject.title
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { projectId, projectNote } = formData;
    if (!projectId) {
      alert('يرجى اختيار مشروع');
      return;
    }

    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/honor-board`, // استخدام المسار الكامل مع API_BASE_URL
        {
          project_id: parseInt(projectId),
          notes: projectNote
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const newProject = {
          id: response.data.data.id,
          projectId: projectId,
          name: formData.projectName,
          note: projectNote,
          date: new Date().toLocaleDateString('ar-EG')
        };

        setProjects(prev => [...prev, newProject]);
        setFormData({
          projectName: '',
          projectNote: '',
          projectId: ''
        });
        
        alert('تمت إضافة المشروع إلى لوحة الشرف بنجاح');
      }
    } catch (err) {
      console.error('Error adding project:', err);
      if (err.response) {
        if (err.response.status === 409) {
          alert('هذا المشروع مضاف مسبقاً إلى لوحة الشرف');
        } else {
          alert(`فشل في إضافة المشروع. خطأ: ${err.response.status}`);
        }
      } else {
        alert('فشل في إضافة المشروع. يرجى التحقق من اتصال الشبكة');
      }
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;

    try {
      const token = getAuthToken();
      const response = await axios.delete(
        `${API_BASE_URL}/api/honor-board/${id}`, // استخدام المسار الكامل مع API_BASE_URL
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setProjects(prev => prev.filter(project => project.id !== id));
        alert('تم حذف المشروع بنجاح');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="dashboard-container-dash-sup">
      <SidebarWithRef 
        ref={sidebarRef}
        user={{
          name: "د.عفاف",
          role: "منسق المشاريع",
          image: "https://randomuser.me/api/portraits/women/44.jpg"
        }}
        navItems={[
          { icon: faTachometerAlt, text: "اللوحة الرئيسية", path: "/dashboard" },
          { icon: faProjectDiagram, text: "المشاريع", badge: 12, path: "/projects" },
          { icon: faUsers, text: "الطلاب", path:"/students" },
          { icon: faCalendarCheck, text: "المهام", badge: 5, alert: true, path: "/tasks" },
          { icon: faFileAlt, text: "التقارير", path: "/reports" },
          { icon: faComments, text: "المناقشات", badge: 3, path: "/discussions" }
        ]}
      />

      <div className="main-container">
        <div className="honorboard-coordinator">
          <TopNav />

          <div className="container-honor">
            <div className="dashboard-honor">
              <div className="add-project-honor">
                <h2 className="section-title-honor">إضافة مشروع متميز</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="form-group-honor">
                    <label htmlFor="projectSelect">اختر المشروع</label>
                    {loading ? (
                      <select id="projectSelect" disabled>
                        <option>جاري تحميل المشاريع...</option>
                      </select>
                    ) : (
                      <select
                        id="projectSelect"
                        required
                        value={formData.projectId}
                        onChange={handleProjectSelect}
                      >
                        <option value="">اختر مشروع من القائمة</option>
                        {availableProjects.map((project) => (
                          <option 
                            key={project.projectid} 
                            value={project.projectid}
                          >
                            {project.title} (ID: {project.projectid})
                          </option>
                        ))}
                      </select>
                    )}
                    <input
                      type="hidden"
                      id="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                    />
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
                  {projects.length === 0 ? (
                    <div className="empty-state">لا توجد مشاريع مضافة بعد</div>
                  ) : (
                    projects.map(project => (
                      <div className="project-card" key={project.id}>
                        <button 
                          className="delete-btn" 
                          onClick={() => deleteProject(project.id)}
                        >
                          ×
                        </button>
                        <h3 className="project-name">{project.name}</h3>
                        {project.projectId && (
                          <div className="project-id">رقم المشروع: {project.projectId}</div>
                        )}
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
      </div>
    </div>
  );
};

export default HonorboardCoordinator;