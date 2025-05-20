import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaGraduationCap,
  FaCheckCircle,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaGoogle
} from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import axios from '../../config/axios';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext); // ✅ استخدم login بدلًا من setAuth
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.group('%c🔐 عملية تسجيل الدخول', 'color: #2196F3; font-weight: bold');
      console.log('📤 إرسال بيانات:', {
        email: formData.email,
        rememberMe: formData.rememberMe,
        time: new Date().toLocaleTimeString()
      });

      if (!formData.email || !formData.password) {
        throw new Error('يجب ملء جميع الحقول');
      }

      const response = await axios.post('/login', {
        email: formData.email,
        password: formData.password
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 استجابة الخادم:', response.data);

      const { access_token, refresh_token, user, message } = response.data;

      if (!access_token || !user || !user.email) {
        console.warn('⚠️ تحذير: بيانات ناقصة في الاستجابة', response.data);
        throw new Error(message || 'بيانات المصادقة غير مكتملة');
      }

      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        console.log('🔐 تم تفعيل "تذكرني"');
      }

      // ✅ استخدم login لتحديث الحالة وتخزين البيانات
      login(access_token, refresh_token, user);

      setTimeout(() => {
        console.log('➡️ توجيه إلى لوحة التحكم');
        navigate('/dashboard', { replace: true });
      }, 100);

    } catch (err) {
      const errorDetails = {
        name: err.name,
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        time: new Date().toLocaleTimeString()
      };

      console.group('%c❌ فشل المصادقة', 'color: #F44336; font-weight: bold');
      console.error('📌 الخطأ:', errorDetails.message);
      console.table({
        '📧 البريد': formData.email,
        '🕒 الوقت': errorDetails.time,
        '🧾 التفاصيل': JSON.stringify(errorDetails.data || 'لا يوجد تفاصيل إضافية')
      });
      console.groupEnd();

      setError(errorDetails.message || 'حدث خطأ غير متوقع');

    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  return (
    <div className="login-card">
      <div className="header-section">
        <div className="logo-container">
          <FaGraduationCap className="graduation-icon" />
        </div>
        <h1 className="system-title">نظام إدارة المشاريع</h1>
        <p className="system-description">منصة متكاملة لإدارة المشاريع الأكاديمية والبحثية</p>
        <div className="features-section">
          <h3 className="features-title">مميزات النظام:</h3>
          <ul className="features-list">
            <li>
              <FaCheckCircle className="feature-icon" />
              <span>إدارة المشاريع البحثية</span>
            </li>
            <li>
              <FaCheckCircle className="feature-icon" />
              <span>متابعة المهام الأكاديمية</span>
            </li>
            <li>
              <FaCheckCircle className="feature-icon" />
              <span>تواصل بين أعضاء الفريق</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="form-section">
        <div className="form-header">
          <h2 className="form-title">تسجيل الدخول</h2>
          <p className="form-subtitle">أدخل بياناتك للوصول إلى حسابك</p>
        </div>

        {error && (
          <div className="error-message">
            <p>⛔ {error}</p>
            <small>يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني</small>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email" className="input-label">البريد الإلكتروني</label>
            <div className="input-container">
              <input
                type="email"
                id="email"
                className="input-field"
                placeholder="example@university.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="username"
              />
              <FaEnvelope className="input-icon" />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">كلمة المرور</label>
            <div className="input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="input-field"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                autoComplete="current-password"
              />
              {showPassword ? (
                <FaEye
                  className="password-toggle"
                  onClick={() => setShowPassword(false)}
                  title="إخفاء كلمة المرور"
                />
              ) : (
                <FaEyeSlash
                  className="password-toggle"
                  onClick={() => setShowPassword(true)}
                  title="إظهار كلمة المرور"
                />
              )}
              <FaLock className="input-icon" />
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              />
              <span>تذكرني على هذا الجهاز</span>
            </label>
            <a href="/forgot-password" className="forgot-password">نسيت كلمة المرور؟</a>
          </div>

          <button
            type="submit"
            className="btn-login"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                جاري المعالجة...
              </>
            ) : 'تسجيل الدخول'}
          </button>

          <div className="divider">
            <span>أو</span>
          </div>

          <button
            type="button"
            className="btn-google"
            onClick={() => console.log('جاري التكامل مع Google')}
          >
            <FaGoogle className="google-icon" />
            تسجيل الدخول باستخدام Google
          </button>

          <p className="register-link">
            ليس لديك حساب؟ <a href="/register">سجل الآن</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
