import React, { useState } from "react";
import "./LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "حدث خطأ أثناء تسجيل الدخول");
      } else {
        // حفظ التوكن في التخزين المحلي
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        alert("تم تسجيل الدخول بنجاح!");

        // توجيه المستخدم إلى لوحة التحكم
        window.location.href = "/profile";
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم");
    }
  };

  return (
    <div className="login-container">
      {/* الجزء الرسومي */}
      <div className="graphic-section gradient-bg">
        <div className="header">
          <h1>Academic Project Hub</h1>
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
        <p className="form-subtitle arabic-font">سجل دخولك للوصول إلى لوحة التحكم</p>

        <form onSubmit={handleLogin}>
          {error && <div className="error-message arabic-font">{error}</div>}

          <div className="form-group">
            <label htmlFor="email-ar" className="form-label arabic-font">
              البريد الإلكتروني أو الرقم الجامعي
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                id="email-ar"
                className="form-input"
                placeholder="ادخل بريدك الجامعي"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="input-icon">
                <i className="far fa-envelope"></i>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password-ar" className="form-label arabic-font">
              كلمة المرور
            </label>
            <div className="input-wrapper">
              <input
                type="password"
                id="password-ar"
                className="form-input"
                placeholder="ادخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="input-icon">
                <i className="fas fa-lock"></i>
              </div>
            </div>
            <div className="forgot-link">
              <a href="#" className="arabic-font">هل نسيت كلمة المرور؟</a>
            </div>
          </div>

          <div className="remember-me">
            <div className="checkbox-wrapper">
              <input type="checkbox" id="remember-ar" className="form-checkbox" />
              <label htmlFor="remember-ar" className="checkbox-label arabic-font">
                تذكرني
              </label>
            </div>
          </div>

          <button type="submit" className="submit-btn arabic-font">
            تسجيل الدخول
          </button>
        </form>

        <div className="signup-link arabic-font">
          <span>ليس لديك حساب؟ </span>
          <a href="#">سجل الآن</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
