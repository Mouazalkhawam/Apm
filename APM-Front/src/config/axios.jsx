
import axios from 'axios';

const axiosInstance = axios.create({
  // استبدل process.env بـ import.meta.env
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});
// إضافة interceptor للطلبات
axiosInstance.interceptors.request.use(
  (config) => {
    // إضافة التوكن إلى header إذا كان موجوداً
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// إضافة interceptor للردود
axiosInstance.interceptors.response.use(
  (response) => {
    // أي رد ناجح
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // إذا كان الخطأ 401 (غير مصرح) ولم يتم إعادة المحاولة بعد
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // محاولة تجديد التوكن
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(
          `${axiosInstance.defaults.baseURL}/refresh`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${refreshToken}`
            }
          }
        );
        
        // حفظ التوكن الجديد
        const newAccessToken = response.data.access_token;
        localStorage.setItem('access_token', newAccessToken);
        
        // تحديث header الطلب الأصلي
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // إعادة الطلب الأصلي مع التوكن الجديد
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // إذا فشل تجديد التوكن، نقوم بتسجيل الخروج
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // توجيه المستخدم لصفحة تسجيل الدخول
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // لأي خطأ آخر
    return Promise.reject(error);
  }
);

export default axiosInstance;