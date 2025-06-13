import React, { useState, useEffect } from 'react';
import './SupervisorsProject.css';
import TopNav from "../components/TopNav/TopNav";
import Sidebar from "../components/Sidebar/Sidebar";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SupervisorsProject = () => {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [filters, setFilters] = useState({
        type: '',
        semester: '',
        progress: ''
    });

    const navigate = useNavigate();

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
        localStorage.setItem('group_id', groupId);
        navigate('/group-supervisor');
    };

    return (
        <div className="dashboard-container-dash">
            <Sidebar />
            <div className="supervisors-project">
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
    );
};

export default SupervisorsProject;