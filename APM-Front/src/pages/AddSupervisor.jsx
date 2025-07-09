import React, { useState } from 'react';
import './AddSupervisor.css';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddSupervisor = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    profile_picture: null
  });

  const [passwordStrength, setPasswordStrength] = useState({
    width: '0%',
    color: '#e74c3c'
  });

  const [message, setMessage] = useState({
    text: '',
    type: '',
    show: false
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // إنشاء نسخة مخصصة من axios مع الإعدادات الأساسية
  const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    timeout: 10000,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  // إضافة interceptor لإرفاق التوكن تلقائياً
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, error => {
    return Promise.reject(error);
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    if (id === 'password') {
      updatePasswordStrength(value);
    }
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      profile_picture: e.target.files[0]
    });
  };

  const togglePasswordVisibility = (fieldId) => {
    const field = document.getElementById(fieldId);
    field.type = field.type === 'password' ? 'text' : 'password';
  };

  const updatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    let width = 0;
    let color = '#e74c3c';
    
    if (strength <= 1) {
      width = 25;
      color = '#e74c3c';
    } else if (strength <= 3) {
      width = 50;
      color = '#f39c12';
    } else if (strength <= 4) {
      width = 75;
      color = '#3498db';
    } else {
      width = 100;
      color = '#2ecc71';
    }
    
    setPasswordStrength({
      width: `${width}%`,
      color
    });
  };

  const showMessage = (text, type) => {
    setMessage({
      text,
      type,
      show: true
    });
    
    setTimeout(() => {
      setMessage(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      showMessage('كلمة المرور وتأكيدها غير متطابقين', 'danger');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      showMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'danger');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('password_confirmation', formData.confirmPassword);
      if (formData.profile_picture) {
        formDataToSend.append('profile_picture', formData.profile_picture);
      }

      const response = await api.post('/coordinator/create-supervisor', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        showMessage('تم إنشاء حساب المشرف بنجاح!', 'success');
        setFormData({
          name: '',
          phone: '',
          email: '',
          password: '',
          confirmPassword: '',
          profile_picture: null
        });
        setPasswordStrength({
          width: '0%',
          color: '#e74c3c'
        });
        
      }
    } catch (error) {
      console.error('Error creating supervisor:', error);
      let errorMessage = 'حدث خطأ أثناء إنشاء الحساب';
      
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'غير مصرح لك بإنشاء حسابات المشرفين';
        } else if (error.response.data.errors) {
          errorMessage = Object.values(error.response.data.errors).join(', ');
        }
      }
      
      showMessage(errorMessage, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container-dash-sup">
      <Sidebar />
      <div className="main-container">
        <div className='supervisor-dashboard'>
          <TopNav />

          <div className="container-add-sup">
            {message.show && (
              <div className={`alert alert-${message.type}`}>
                {message.text}
              </div>
            )}
            
            <form id="adminForm" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor="name">الاسم الكامل</label>
                    <input
                      type="text"
                      id="name"
                      className="form-controll"
                      required
                      placeholder="أدخل الاسم الكامل"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor="phone">رقم الهاتف</label>
                    <input
                      type="tel"
                      id="phone"
                      className="form-controll"
                      required
                      placeholder="أدخل رقم الهاتف"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">البريد الإلكتروني</label>
                <input
                  type="email"
                  id="email"
                  className="form-controll"
                  required
                  placeholder="أدخل البريد الإلكتروني"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group password-toggle">
                    <label htmlFor="password">كلمة المرور</label>
                    <input
                      type="password"
                      id="password"
                      className="form-controll"
                      required
                      placeholder="أدخل كلمة المرور"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <span 
                      className="toggle-password" 
                      onClick={() => togglePasswordVisibility('password')}
                    >
                      👁️
                    </span>
                    <div className="password-strength">
                      <div 
                        className="strength-meter" 
                        style={{
                          width: passwordStrength.width,
                          backgroundColor: passwordStrength.color
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group password-toggle">
                    <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      className="form-controll"
                      required
                      placeholder="أعد إدخال كلمة المرور"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <span 
                      className="toggle-password" 
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                    >
                      👁️
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <button 
                  type="submit" 
                  className="btn btn-block"
                  disabled={loading}
                >
                  {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSupervisor;