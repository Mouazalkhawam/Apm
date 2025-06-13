import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8000/api/login", {
        email,
        password
      });

      const data = response.data;

      // حفظ بيانات المستخدم في التخزين المحلي
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user_role", data.user.role);
      localStorage.setItem("user_id", data.user.userId);
      localStorage.setItem("user_name", data.user.name);

      // توجيه المستخدم بناءً على دوره
      switch(data.user.role) {
        case 'student':
          navigate("/profile");
          break;
        case 'supervisor':
          navigate("/supervisors-dashboard");
          break;
        case 'admin':
          navigate("/admin-dashboard");
          break;
        default:
          navigate("/");
      }

    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "حدث خطأ أثناء تسجيل الدخول");
      } else if (err.request) {
        setError("لا يوجد اتصال بالخادم");
      } else {
        setError("حدث خطأ أثناء إعداد طلب تسجيل الدخول");
      }
    }
  };

  return (
    <div className="login-container">
      {/* الجزء الرسومي */}
      <div className="graphic-section gradient-bg">
        <div className="header-login">
          <h1>Academic Project Management</h1>
          <p>نظام إدارة المشاريع الأكاديمية</p>
        </div>

        <div className="illustration-container">
          <div className="illustration-bg"></div>
          <i className="fas fa-graduation-cap illustration-icon"></i>
        </div>

        <div className="features-container">
          <div className="feature-item" style={{ animationDelay: "0.4s" }}>
            <i className="fas fa-graduation-cap"></i>
            <p>إدارة كافة مشاريعك الأكاديمية في مكان واحد</p>
          </div>
          <div className="feature-item" style={{ animationDelay: "0.5s" }}>
            <i className="fas fa-users"></i>
            <p>تعاون مع زملائك وأساتذتك بسهولة</p>
          </div>
          <div className="feature-item" style={{ animationDelay: "0.6s" }}>
            <i className="fas fa-chart-line"></i>
            <p>تابع تقدم مشاريعك بتحليلات دقيقة</p>
          </div>
        </div>
      </div>

      {/* نموذج تسجيل الدخول */}
      <div className="form-section">
        <h2 className="form-title arabic-font">مرحباً بعودتك</h2>
        <p className="form-subtitle arabic-font">سجل دخولك للوصول إلى الملف الشخصي الخاص بك</p>
      

        <form onSubmit={handleLogin}>
          {error && <div className="error-message arabic-font">{error}</div>}

          <div className="form-group-log">
            <label htmlFor="email-ar" className="form-label arabic-font">
              البريد الإلكتروني أو الرقم الجامعي
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                id="email-ar"
                className="form-input-log"
                placeholder="ادخل بريدك الجامعي"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="input-icon">
                <i className="far fa-envelope"></i>
              </div>
            </div>
          </div>

          <div className="form-group-log">
            <label htmlFor="password-ar" className="form-label arabic-font">
              كلمة المرور
            </label>
            <div className="input-wrapper">
              <input
                type="password"
                id="password-ar"
                className="form-input-log"
                placeholder="ادخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="input-icon">
                <i className="fas fa-lock"></i>
              </div>
            </div>
          </div>

          <button type="submit" className="submit-btn arabic-font">
            تسجيل الدخول
          </button>
        </form>

        <div className="signup-link arabic-font">
          <span>ليس لديك حساب؟ </span>
          <a href="/register">سجل الآن</a>
        </div>

        <div className="forgot-password arabic-font">
          <a href="/forgot-password">نسيت كلمة المرور؟</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;