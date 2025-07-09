import React, { useState } from 'react';
import './AddSupervisor.css';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';

const AddSupervisor = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
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

  const togglePasswordVisibility = (fieldId) => {
    const field = document.getElementById(fieldId);
    if (field.type === 'password') {
      field.type = 'text';
    } else {
      field.type = 'password';
    }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showMessage('كلمة المرور وتأكيدها غير متطابقين', 'danger');
      return;
    }
    
    if (formData.password.length < 8) {
      showMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'danger');
      return;
    }
    
    showMessage('تم إنشاء حساب المشرف بنجاح!', 'success');
    
    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ''
    });
    setPasswordStrength({
      width: '0%',
      color: '#e74c3c'
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
              <label htmlFor="confirm-password">تأكيد كلمة المرور</label>
              <input
                type="password"
                id="confirm-password"
                className="form-controll"
                required
                placeholder="أعد إدخال كلمة المرور"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <span 
                className="toggle-password" 
                onClick={() => togglePasswordVisibility('confirm-password')}
              >
                👁️
              </span>
            </div>
          </div>
        </div>
        
        
        <div className="form-group">
          <button type="submit" className="btn btn-block">
            إنشاء الحساب
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