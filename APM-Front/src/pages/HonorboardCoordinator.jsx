import React, { useState, useRef } from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';
import './HonorboardCoordinator.css';
import axios from 'axios';

// إنشاء QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 دقائق
      cacheTime: 15 * 60 * 1000, // 15 دقيقة
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// تهيئة axios
const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// إضافة interceptor للتحقق من الصلاحية
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const SidebarWithRef = React.forwardRef((props, ref) => (
  <Sidebar ref={ref} {...props} />
));

const HonorboardCoordinator = () => {
  const [formData, setFormData] = useState({
    projectName: '',
    projectNote: '',
    projectId: ''
  });
  const sidebarRef = useRef(null);

  // استعلامات React Query
  const { data: userInfo } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      const response = await apiClient.get('/api/user');
      return {
        name: response.data.name,
        image: response.data.profile_picture || 'https://randomuser.me/api/portraits/women/44.jpg',
        role: response.data.role
      };
    }
  });

  const { 
    data: availableProjects, 
    isLoading: projectsLoading, 
    error: projectsError 
  } = useQuery({
    queryKey: ['availableProjects'],
    queryFn: async () => {
      const [currentProjectsRes, honorProjectsRes] = await Promise.all([
        apiClient.get('/api/coordinator/current-projects'),
        apiClient.get('/api/honor-board')
      ]);

      const projectsData = currentProjectsRes.data?.data || [];
      const honorProjects = honorProjectsRes.data?.data || [];
      const honorProjectIds = honorProjects.map(p => p.project?.projectid);

      return projectsData
        .filter(proj => 
          proj && 
          proj.title && 
          proj.project_id &&
          !honorProjectIds.includes(proj.project_id)
        )
        .map(proj => ({
          projectid: proj.project_id,
          title: proj.title,
          description: proj.description || '',
          type: proj.type || 'semester',
          status: proj.status || 'active'
        }));
    }
  });

  const { 
    data: honorProjects, 
    isLoading: honorLoading,
    error: honorError,
    refetch: refetchHonorProjects
  } = useQuery({
    queryKey: ['honorProjects'],
    queryFn: async () => {
      const response = await apiClient.get('/api/honor-board');
      return (response.data?.data || []).map(p => ({
        id: p.id,
        projectId: p.project?.projectid,
        name: p.project?.title,
        note: p.notes,
        date: new Date(p.featured_at).toLocaleDateString('ar-EG')
      }));
    }
  });

  // طفرات React Query
  const addProjectMutation = useMutation({
    mutationFn: async ({ projectId, projectNote }) => {
      return await apiClient.post('/api/honor-board', {
        project_id: parseInt(projectId),
        notes: projectNote
      });
    },
    onSuccess: (response) => {
      if (response.data.success) {
        const newProject = {
          id: response.data.data.id,
          projectId: formData.projectId,
          name: formData.projectName,
          note: formData.projectNote,
          date: new Date().toLocaleDateString('ar-EG')
        };

        queryClient.setQueryData(['honorProjects'], (oldData) => [...(oldData || []), newProject]);
        setFormData({
          projectName: '',
          projectNote: '',
          projectId: ''
        });
        
        alert('تمت إضافة المشروع إلى لوحة الشرف بنجاح');
      }
    },
    onError: (error) => {
      if (error.response) {
        if (error.response.status === 409) {
          alert('هذا المشروع مضاف مسبقاً إلى لوحة الشرف');
        } else {
          alert(`فشل في إضافة المشروع. خطأ: ${error.response.status}`);
        }
      } else {
        alert('فشل في إضافة المشروع. يرجى التحقق من اتصال الشبكة');
      }
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id) => {
      return await apiClient.delete(`/api/honor-board/${id}`);
    },
    onSuccess: (response, id) => {
      if (response.data.success) {
        queryClient.setQueryData(['honorProjects'], (oldData) => 
          (oldData || []).filter(project => project.id !== id)
        );
        alert('تم حذف المشروع بنجاح');
      }
    },
    onError: () => {
      alert('حدث خطأ أثناء الحذف');
    }
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleProjectSelect = (e) => {
    const selectedProject = availableProjects?.find(
      proj => proj.projectid.toString() === e.target.value
    );

    if (selectedProject) {
      setFormData({
        ...formData,
        projectId: selectedProject.projectid.toString(),
        projectName: selectedProject.title,
        projectDescription: selectedProject.description
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { projectId, projectNote } = formData;
    if (!projectId) {
      alert('يرجى اختيار مشروع');
      return;
    }

    addProjectMutation.mutate({ projectId, projectNote });
  };

  const deleteProject = (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;
    deleteProjectMutation.mutate(id);
  };

  return (
    <div className="dashboard-container-dash-sup">
      <SidebarWithRef 
        ref={sidebarRef}
        user={{
          name: userInfo?.name || "مستخدم",
          role: userInfo?.role || "مستخدم",
          image: userInfo?.image
        }}
      />
      <div className="main-container">
        <div className='supervisor-dashboard'>
          <TopNav 
            user={{
              name: userInfo?.name || "مستخدم",
              image: userInfo?.image
            }}
          />

          <div className="container-honor">
            <div className="dashboard-honor">
              <div className="add-project-honor">
                <h2 className="section-title-honor">إضافة مشروع متميز</h2>
                {projectsError && <div className="error-message">فشل في تحميل مشاريع الفصل الحالي. يرجى المحاولة لاحقاً.</div>}
                <form onSubmit={handleSubmit}>
                  <div className="form-group-honor">
                    <label htmlFor="projectSelect">اختر المشروع</label>
                    {projectsLoading ? (
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
                        {availableProjects?.map((project) => (
                          <option 
                            key={project.projectid} 
                            value={project.projectid}
                          >
                            {project.title} 
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

                  <button 
                    type="submit" 
                    className="btn"
                    disabled={addProjectMutation.isPending}
                  >
                    {addProjectMutation.isPending ? 'جاري الحفظ...' : 'حفظ المشروع'}
                  </button>
                </form>
              </div>

              <div className="projects-list">
                <h2 className="section-title">قائمة المشاريع المتميزة</h2>
                <div className="projects-container">
                  {honorLoading ? (
                    <div className="empty-state">جاري تحميل المشاريع...</div>
                  ) : honorError ? (
                    <div className="empty-state">فشل في تحميل المشاريع المتميزة</div>
                  ) : honorProjects?.length === 0 ? (
                    <div className="empty-state">لا توجد مشاريع مضافة بعد</div>
                  ) : (
                    honorProjects?.map(project => (
                      <div className="project-card" key={project.id}>
                        <button 
                          className="delete-btn" 
                          onClick={() => deleteProject(project.id)}
                          disabled={deleteProjectMutation.isPending}
                        >
                          ×
                        </button>
                        <h3 className="project-name">{project.name}</h3>
                       
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

// تغليف التطبيق بـ QueryClientProvider
const App = () => (
  <QueryClientProvider client={queryClient}>
    <HonorboardCoordinator />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

export default App;