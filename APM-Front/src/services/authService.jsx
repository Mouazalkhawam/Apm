import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // تأكد من تطابق عنوان API الخاص بك

const authService = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password
      });
      
      if (response.data.access_token) {
        // حفظ التوكن في localStorage أو cookies
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },
  
  logout: async () => {
    try {
      const response = await axios.post(`${API_URL}/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },
  
  refreshToken: async () => {
    try {
      const response = await axios.post(`${API_URL}/refresh`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('refresh_token')}`
        }
      });
      localStorage.setItem('access_token', response.data.access_token);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
};

export default authService;