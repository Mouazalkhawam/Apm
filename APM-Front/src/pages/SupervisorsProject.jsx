import React, { useState, useEffect } from 'react';
import './SupervisorsProject.css';
import TopNav from "../components/TopNav/TopNav";
import Sidebar from "../components/Sidebar/Sidebar";

const SupervisorsProject = () => {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [filters, setFilters] = useState({
        type: '',
        semester: '',
        progress: ''
    });

    useEffect(() => {
        // Simulate loading data
        const projectsData = [
            {
                id: 1,
                name: "نظام إدارة المكتبات الجامعية",
                type: "تخرج",
                semester: "الثاني 1444",
                progress: 87,
                students: "أحمد محمد، سارة الخالد، علي حسن",
                description: "نظام متكامل لإدارة المكتبات الجامعية يتضمن إعارة الكتب وحجزها وإدارة المخزون."
            },
            {
                id: 2,
                name: "تطبيق تعليم اللغة العربية",
                type: "بحثي",
                semester: "الأول 1445",
                progress: 45,
                students: "لمى عبدالله، خالد علي، نورة أحمد",
                description: "تطبيق يساعد غير الناطقين بالعربية على تعلم اللغة باستخدام الذكاء الاصطناعي."
            },
            {
                id: 3,
                name: "منصة إدارة المشاريع الطلابية",
                type: "مقرر",
                semester: "الثاني 1444",
                progress: 95,
                students: "مريم الكندري، فيصل ناصر، هدى مبارك",
                description: "منصة لإدارة مشاريع الطلاب من بدايتها حتى تسليمها مع متابعة المهام."
            },
            {
                id: 4,
                name: "روبوت للتعقيم الذاتي",
                type: "ابتكار",
                semester: "الأول 1445",
                progress: 32,
                students: "ياسر محمد، عبدالله سليمان، أحمد الفهد",
                description: "روبوت يعمل بالذكاء الاصطناعي للتنقل والتعقيم الذاتي في المنشآت الطبية."
            },
            {
                id: 5,
                name: "تحليل بيانات الوسائل التعليمية",
                type: "بحثي",
                semester: "الثاني 1445",
                progress: 68,
                students: "ناصر أحمد، سلمى عبدالرحمن، محمد السعد",
                description: "دراسة تحليلية لأثر الوسائل التعليمية الإلكترونية على التحصيل الدراسي."
            },
            {
                id: 6,
                name: "تطبيق حجز المواعيد الطبية",
                type: "تخرج",
                semester: "الأول 1444",
                progress: 100,
                students: "عبدالعزيز خالد، نورهان فارس، راشد الزهراني",
                description: "تطبيق موبايل لحجز المواعيد الطبية ومراقبة الحالات الصحية للمرضى."
            }
        ];

        setProjects(projectsData);
        setFilteredProjects(projectsData);
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

        // Apply type filter
        if (filters.type) {
            filtered = filtered.filter(
                project => project.type === filters.type
            );
        }

        // Apply semester filter
        if (filters.semester) {
            filtered = filtered.filter(
                project => project.semester === filters.semester
            );
        }

        // Apply progress filter
        if (filters.progress) {
            if (filters.progress === '100') {
                filtered = filtered.filter(
                    project => project.progress === 100
                );
            } else if (filters.progress === '75-99') {
                filtered = filtered.filter(
                    project => project.progress >= 75 && project.progress < 100
                );
            } else if (filters.progress === '50-74') {
                filtered = filtered.filter(
                    project => project.progress >= 50 && project.progress < 75
                );
            } else if (filters.progress === '1-49') {
                filtered = filtered.filter(
                    project => project.progress > 0 && project.progress < 50
                );
            }
        }

        setFilteredProjects(filtered);
    };

    const getProgressColor = (progress) => {
        if (progress < 30) {
            return '#f53e3e';
        } else if (progress < 70) {
            return '#ed8936';
        } else if (progress < 90) {
            return '#48bb78';
        } else {
            return '#38b2ac';
        }
    };

    const viewProjectDetails = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            alert(`تفاصيل المشروع:\n\nالاسم: ${project.name}\nالنوع: ${project.type}\nالفصل: ${project.semester}\nالتقدم: ${project.progress}%\nالطلاب: ${project.students}\n\nالوصف: ${project.description}`);
        }
    };

    const openProject = (projectId) => {
        alert(`تم فتح المشروع رقم ${projectId} (هذه وظيفة محاكاة)`);
    };

    return (
           <div className="dashboard-container-dash">
        
         <Sidebar />
        <div className="supervisors-project">
     
<TopNav/>
            {/* Filter Section */}
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
                            <option value="تخرج">مشاريع التخرج</option>
                            <option value="بحثي">مشاريع بحثية</option>
                            <option value="مقرر">مشاريع المقررات</option>
                            <option value="ابتكار">مشاريع الابتكار</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <label htmlFor="semester-filter" className="filter-label">الفصل الدراسي:</label>
                        <select 
                            id="semester-filter" 
                            className="filter-select"
                            name="semester"
                            value={filters.semester}
                            onChange={handleFilterChange}
                        >
                            <option value="">جميع الفصول</option>
                            <option value="الأول 1444">الفصل الأول 1444</option>
                            <option value="الثاني 1444">الفصل الثاني 1444</option>
                            <option value="الأول 1445">الفصل الأول 1445</option>
                            <option value="الثاني 1445">الفصل الثاني 1445</option>
                        </select>
                    </div>
                 
                </div>
            </section>

            {/* Projects Grid */}
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
                                    <div className="meta-item-pro">{project.students.split('،')[0]} +{project.students.split('،').length - 1}</div>
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
                                        onClick={() => viewProjectDetails(project.id)}
                                    >
                                        <span>عرض التفاصيل</span>
                                    </button>
                                    <button 
                                        className="action-btn-pro primary" 
                                        onClick={() => openProject(project.id)}
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