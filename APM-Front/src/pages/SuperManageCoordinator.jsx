import React, { useState, useEffect } from 'react';
import './SuperManageCoordinator.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
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

// المكون الرئيسي
const SuperManageCoordinator = () => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    image: '',
    role: ''
  });

  // جلب بيانات المستخدم
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get('/api/user');
        const userData = response.data;
        setUserInfo({
          name: userData.name,
          image: userData.profile_picture || 'https://randomuser.me/api/portraits/women/44.jpg',
          role: userData.role
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const { data: supervisors, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['supervisorsWithStudents'],
    queryFn: async () => {
      const response = await apiClient.get('/api/supervisors/students-names');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch supervisors data');
      }
      return response.data.data.map(item => ({
        name: item.supervisor_name,
        students: item.students,
        studentCount: item.students.length
      }));
    },
  });

  return (
    <div className="dashboard-container-dash-sup">
      <Sidebar user={userInfo} />
      <div className="main-container">
        <div className='supervisor-dashboard'>
          <TopNav user={userInfo} />

          <section className="supervisors-section">
            <div className="form-title">
              <h1 className='form-title'>المشرفون الأكاديميون</h1>
              <p>قائمة بالمشرفين الأكاديميين والطلاب المشرف عليهم</p>
            </div>

            {isLoading ? (
              <div className="loading">جاري تحميل البيانات...</div>
            ) : isError ? (
              <div className="error-message">
                <p>حدث خطأ في تحميل البيانات: {error.message}</p>
                <button onClick={() => refetch()} className="retry-btn">
                  إعادة المحاولة
                </button>
              </div>
            ) : (
              <div className="supervisors-container">
                {supervisors?.map((supervisor, index) => (
                  <div 
                    className="supervisor-card" 
                    key={index} 
                    style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                  >
                    <div className="supervisor-header">
                      <h3>{supervisor.name}</h3>
                      <span className="students-count">{supervisor.studentCount} طلاب</span>
                    </div>
                    <ul className="students-list">
                      {supervisor.students.map((student, studentIndex) => (
                        <li key={studentIndex}>
                          <FontAwesomeIcon icon={faUser} className="student-icon" />
                          {student}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

// تغليف التطبيق بـ QueryClientProvider
const App = () => (
  <QueryClientProvider client={queryClient}>
    <SuperManageCoordinator />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

export default App;