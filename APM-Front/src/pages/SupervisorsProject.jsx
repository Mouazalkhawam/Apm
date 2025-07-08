import React, { useEffect, useRef, useState } from 'react';
import './SupervisorsProject.css';
import TopNav from "../components/TopNav/TopNav";
import Sidebar from "../components/Sidebar/Sidebar";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  faTachometerAlt, faProjectDiagram, faUsers, 
  faCalendarCheck, faFileAlt, faComments,
} from '@fortawesome/free-solid-svg-icons';

const SidebarWithRef = React.forwardRef((props, ref) => (
  <Sidebar ref={ref} {...props} />
));

const SupervisorsProject = () => {
    const sidebarRef = useRef(null);
    const [activeProjectsCount, setActiveProjectsCount] = useState(0);
    const [pendingTasksCount, setPendingTasksCount] = useState(0);
    const [activeStudentsCount, setActiveStudentsCount] = useState(0);
    const [averageGrade, setAverageGrade] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [filters, setFilters] = useState({
        type: '',
        semester: '',
        progress: ''
    });
    const [supervisorInfo, setSupervisorInfo] = useState({
        name: '',
        image: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const token = localStorage.getItem('access_token');
                
                if (!token) {
                    throw new Error('لم يتم العثور على token في localStorage');
                }

                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                };

                const checkResponse = await axios.get('http://127.0.0.1:8000/api/check-supervisor', config);
                
                if (!checkResponse.data.is_supervisor) {
                    throw new Error('المستخدم الحالي ليس مشرفًا');
                }

                setSupervisorInfo({
                    name: checkResponse.data.name,
                    image: checkResponse.data.profile_picture || 'https://randomuser.me/api/portraits/women/44.jpg'
                });

                const supervisorId = checkResponse.data.supervisor_id;

                const projectsResponse = await axios.get(
                    `http://127.0.0.1:8000/api/supervisors/${supervisorId}/active-projects-count`, 
                    config
                );
                setActiveProjectsCount(projectsResponse.data.active_projects_count);

                setPendingTasksCount(14);
                setActiveStudentsCount(23);
                setAverageGrade(88);

            } catch (err) {
                console.error('حدث خطأ أثناء جلب البيانات:', err);
                setError(err.message || 'حدث خطأ أثناء جلب البيانات');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await axios.get('http://127.0.0.1:8000/api/supervisor/projects', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.data.success) {
                    const mappedProjects = response.data.data.map(project => ({
                        id: project.project_id,
                        name: project.title,
                        description: project.description,
                        type: project.type,
                        semester: `${project.start_date} إلى ${project.end_date}`,
                        progress: Math.floor(Math.random() * 101),
                        students: `${project.group.students_count} طلاب`,
                        groupId: project.group.id
                    }));
                    setProjects(mappedProjects);
                    setFilteredProjects(mappedProjects);
                }
            } catch (error) {
                console.error('خطأ في جلب المشاريع:', error);
                setError('حدث خطأ أثناء جلب بيانات المشاريع');
            }
        };
        fetchProjects();
    }, []);

    useEffect(() => {
        filterProjects();
    }, [filters, projects]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const filterProjects = () => {
        let filtered = [...projects];
        if (filters.type) {
            filtered = filtered.filter(project => project.type === filters.type);
        }
        if (filters.semester) {
            filtered = filtered.filter(project => project.semester.includes(filters.semester));
        }
        setFilteredProjects(filtered);
    };

    const getProgressColor = (progress) => {
        if (progress < 30) return '#f53e3e';
        if (progress < 70) return '#ed8936';
        if (progress < 90) return '#48bb78';
        return '#38b2ac';
    };

    const viewProjectDetails = (groupId) => {
        localStorage.setItem('selectedGroupId', groupId);
        navigate('/group-supervisor');
    };

    if (loading) {
        return <div className="loading-container">جاري التحميل...</div>;
    }

    if (error) {
        return <div className="error-container">حدث خطأ: {error}</div>;
    }

    return (
        <div className="dashboard-container-dash-sup">
            <SidebarWithRef 
                ref={sidebarRef}
                user={{
                  name: supervisorInfo.name || "د.عفاف",
                  role: "مشرف",
                  image: supervisorInfo.image
                }}
                navItems={[
                  { icon: faTachometerAlt, text: "اللوحة الرئيسية", path: "/supervisors-dashboard" },
                  { icon: faProjectDiagram, text: "المشاريع", active: true, badge: activeProjectsCount, path: "/supervisor-project" },
                  { icon: faUsers, text: "الطلاب", path:"/students" },
                  { icon: faCalendarCheck, text: "المهام", badge: pendingTasksCount, alert: true, path: "/tasks" },
                  { icon: faFileAlt, text: "التقارير", path: "/reports" },
                  { icon: faComments, text: "جدولة الاجتماعات", badge: 3, path: "/scheduling-supervisors-meetings" }
                ]}
              />
              
            <div className="main-container">
                <div className='supervisor-dashboard'>
                <TopNav />
                <section className="filter-section">
                    <div className="filter-container">
                        <div className="filter-item">
                            <label htmlFor="type-filter" className="filter-label">نوع المشروع:</label>
                            <select
                                id="type-filter"
                                className="filter-select"
                                name="type"
                                value={filters.type}
                                onChange={handleFilterChange}
                            >
                                <option value="">جميع الأنواع</option>
                                <option value="semester">مشاريع فصلية</option>
                                <option value="final">مشاريع نهائية</option>
                                <option value="research">مشاريع بحثية</option>
                            </select>
                        </div>
                        <div className="filter-item">
                            <label htmlFor="semester-filter" className="filter-label">التاريخ:</label>
                            <input
                                type="text"
                                id="semester-filter"
                                name="semester"
                                className="filter-select"
                                placeholder="مثلاً: 2024"
                                value={filters.semester}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>
                </section>
                <div className="projects-grid" id="projectsContainer">
                    {filteredProjects.length === 0 ? (
                        <div className="no-projects-message">
                            <p>لا توجد مشاريع مطابقة لمعايير البحث</p>
                        </div>
                    ) : (
                        filteredProjects.map(project => (
                            <div className="project-card" key={project.id}>
                                <div className="project-content">
                                    <h3 className="project-name">{project.name}</h3>
                                    <div className="project-meta">
                                        <div className="meta-item-pro type">{project.type}</div>
                                        <div className="meta-item-pro semester">{project.semester}</div>
                                        <div className="meta-item-pro">{project.students}</div>
                                    </div>
                                    <div className="project-description-pro">{project.description}</div>
                                    <div className="progress-container-pro">
                                        <div className="progress-info">
                                            <span>التقدم</span>
                                            <span>{project.progress}%</span>
                                        </div>
                                        <div className="progress-bar-pro">
                                            <div
                                                className="progress-fill-pro"
                                                style={{
                                                    width: `${project.progress}%`,
                                                    background: getProgressColor(project.progress)
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="project-actions">
                                        <button
                                            className="action-btn-pro"
                                            onClick={() => viewProjectDetails(project.groupId)}
                                        >
                                            <span>عرض التفاصيل</span>
                                        </button>
                                        <button
                                            className="action-btn-pro primary"
                                            onClick={() => alert(`فتح المشروع رقم ${project.id}`)}
                                        >
                                            <span>فتح المشروع</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
        </div>
    );
};

export default SupervisorsProject;