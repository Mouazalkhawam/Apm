import React, { useState, useEffect } from 'react';
import axios from 'axios';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { Arabic } from 'flatpickr/dist/l10n/ar.js';
import './AcademicPeriods.css';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNav from '../components/TopNav/TopNav';

const AcademicPeriods = () => {
  const [formData, setFormData] = useState({
    academicYear: '',
    firstTerm: { start: '', end: '' },
    secondTerm: { start: '', end: '' },
    summerTerm: { start: '', end: '' }
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    image: '',
    role: ''
  });
  const [academicPeriods, setAcademicPeriods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user data and academic periods
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        // Fetch user data
        const userResponse = await axios.get('http://localhost:8000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const userData = userResponse.data;
        setUserInfo({
          name: userData.name,
          image: userData.profile_picture || 'https://randomuser.me/api/portraits/women/44.jpg',
          role: userData.role
        });

        // Fetch academic periods
        const periodsResponse = await axios.get('http://localhost:8000/api/academic-periods', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setAcademicPeriods(periodsResponse.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const arabicLocale = {
      weekdays: {
        shorthand: ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
        longhand: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
      },
      months: {
        shorthand: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
        longhand: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
      },
      firstDayOfWeek: 6
    };

    flatpickr.localize(Arabic);
    const config = {
      locale: arabicLocale,
      dateFormat: "Y-m-d",
      allowInput: true
    };

    flatpickr("#firstTermStart", config);
    flatpickr("#firstTermEnd", config);
    flatpickr("#secondTermStart", config);
    flatpickr("#secondTermEnd", config);
    flatpickr("#summerTermStart", config);
    flatpickr("#summerTermEnd", config);

    return () => {
      document.querySelectorAll('.flatpickr-input').forEach(el => {
        el._flatpickr?.destroy();
      });
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const api = axios.create({
      baseURL: 'http://localhost:8000/api',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  
    const periods = [
      {
        name: 'الفصل الأول ' + new Date().getFullYear(),
        type: 'first_semester',
        start_date: formData.firstTerm.start,
        end_date: formData.firstTerm.end
      },
      {
        name: 'الفصل الثاني ' + new Date().getFullYear(),
        type: 'second_semester',
        start_date: formData.secondTerm.start,
        end_date: formData.secondTerm.end
      }
    ];
  
    if (formData.summerTerm.start && formData.summerTerm.end) {
      periods.push({
        name: 'الفصل الصيفي ' + new Date().getFullYear(),
        type: 'summer',
        start_date: formData.summerTerm.start,
        end_date: formData.summerTerm.end
      });
    }
  
    try {
      // إرسال البيانات مع التعامل مع الأخطاء المفصلة
      const responses = await Promise.all(
        periods.map(p => api.post('/academic-periods', p).catch(error => {
          // إذا كان هناك خطأ، نعيده كقيمة مرفوضة مع التفاصيل
          return Promise.reject({
            period: p,
            error: error.response?.data || error.message
          });
        }))
      );
  
      // إذا نجحت جميع الطلبات
      const response = await api.get('/academic-periods');
      setAcademicPeriods(response.data.data);
  
      setShowSuccess(true);
      setShowPreview(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('تفاصيل الخطأ:', error);
      
      let errorMessage = 'حدث خطأ أثناء الحفظ';
      
      if (error.period && error.error) {
        // خطأ مفصل لطلب معين
        const periodName = error.period.type === 'first_semester' ? 'الفصل الأول' :
                          error.period.type === 'second_semester' ? 'الفصل الثاني' : 'الفصل الصيفي';
        
        errorMessage = `خطأ في ${periodName}: `;
        
        if (error.error.errors) {
          // أخطاء التحقق من الصحة من Laravel
          Object.entries(error.error.errors).forEach(([field, messages]) => {
            errorMessage += `${messages.join(', ')} `;
          });
        } else if (error.error.message) {
          errorMessage += error.error.message;
        }
      } else if (error.response?.data?.errors) {
        // أخطاء التحقق من الصحة
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          errorMessage += `${field}: ${messages.join(', ')} `;
        });
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
  
      alert(errorMessage);
    }
  };
  const handleReset = () => {
    setFormData({
      academicYear: '',
      firstTerm: { start: '', end: '' },
      secondTerm: { start: '', end: '' },
      summerTerm: { start: '', end: '' }
    });
  };

  const formatGregorianDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      weekday: 'long'
    };
    
    const formattedDate = new Intl.DateTimeFormat('ar-EG', options).format(date);
    return formattedDate.replace(/،/g, '، ');
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getCurrentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    return `${year}/${year + 1}`;
  };

  return (
    <div className="dashboard-container-dash-sup">
      <Sidebar user={userInfo} />
      <div className="main-container">
        <div className='supervisor-dashboard'>
          <TopNav user={userInfo} />
          
          <div className="containerr">
            {!showPreview ? (
              <div className="form-containerr">
                <div className="form-header">
                  <h2>إعداد التقويم الأكاديمي</h2>
                </div>

                <form id="academicCalendarForm" className="form-content" onSubmit={handleSubmit}>
                  {/* الفصل الدراسي الأول */}
                  <div id="firstTermSection" className="term-section first-term">
                    <div className="term-header">
                      <h3 className="term-title">
                        <i className="fas fa-book-open"></i> الفصل الدراسي الأول
                      </h3>
                      <span className="term-badge">أساسي</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="date-input-group">
                        <label htmlFor="firstTermStart">تاريخ البداية</label>
                        <input
                          type="text"
                          id="firstTermStart"
                          className="flatpickr-input"
                          placeholder="اختر التاريخ"
                          name="firstTerm.start"
                          value={formData.firstTerm.start}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="date-input-group">
                        <label htmlFor="firstTermEnd">تاريخ النهاية</label>
                        <input
                          type="text"
                          id="firstTermEnd"
                          className="flatpickr-input"
                          placeholder="اختر التاريخ"
                          name="firstTerm.end"
                          value={formData.firstTerm.end}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* الفصل الدراسي الثاني */}
                  <div id="secondTermSection" className="term-section second-term">
                    <div className="term-header">
                      <h3 className="term-title">
                        <i className="fas fa-book"></i> الفصل الدراسي الثاني
                      </h3>
                      <span className="term-badge">أساسي</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="date-input-group">
                        <label htmlFor="secondTermStart">تاريخ البداية</label>
                        <input
                          type="text"
                          id="secondTermStart"
                          className="flatpickr-input"
                          placeholder="اختر التاريخ"
                          name="secondTerm.start"
                          value={formData.secondTerm.start}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="date-input-group">
                        <label htmlFor="secondTermEnd">تاريخ النهاية</label>
                        <input
                          type="text"
                          id="secondTermEnd"
                          className="flatpickr-input"
                          placeholder="اختر التاريخ"
                          name="secondTerm.end"
                          value={formData.secondTerm.end}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* الفصل الصيفي */}
                  <div id="summerTermSection" className="term-section summer-term">
                    <div className="term-header">
                      <h3 className="term-title">
                        <i className="fas fa-sun"></i> الفصل الصيفي
                      </h3>
                      <span className="term-badge">اختياري</span>
                    </div>

                    <div id="summerTermFields" className="grid grid-cols-2 gap-4">
                      <div className="date-input-group">
                        <label htmlFor="summerTermStart">تاريخ البداية</label>
                        <input
                          type="text"
                          id="summerTermStart"
                          className="flatpickr-input"
                          placeholder="اختر التاريخ"
                          name="summerTerm.start"
                          value={formData.summerTerm.start}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="date-input-group">
                        <label htmlFor="summerTermEnd">تاريخ النهاية</label>
                        <input
                          type="text"
                          id="summerTermEnd"
                          className="flatpickr-input"
                          placeholder="اختر التاريخ"
                          name="summerTerm.end"
                          value={formData.summerTerm.end}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  {showSuccess && (
                    <div id="successMessage" className="message success-message">
                      <strong>تم الحفظ بنجاح!</strong>
                      <span>تم حفظ التواريخ بنجاح في النظام.</span>
                    </div>
                  )}

                  <div className="btn-container">
                    <button type="button" className="btn btn-reset" onClick={handleReset}>
                      <i className="fas fa-undo"></i> إعادة تعيين
                    </button>
                    <button type="submit" className="btn btn-submit">
                      <i className="fas fa-save"></i> حفظ التقويم
                    </button>
                  </div>
                </form>

                {/* Display existing academic periods */}
                <div className="existing-periods">
                  <h3 className="existing-periods-title">الفصول الأكاديمية الحالية</h3>
                  {loading ? (
                    <p>جاري تحميل البيانات...</p>
                  ) : (
                    <div className="table-container">
                      <table className="academic-calendar-table">
                        <thead>
                          <tr>
                            <th>اسم الفصل</th>
                            <th>النوع</th>
                            <th>تاريخ البداية</th>
                            <th>تاريخ النهاية</th>
                            <th>الحالة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {academicPeriods.map(period => (
                            <tr key={period.id}>
                              <td>{period.name}</td>
                              <td>
                                {period.type === 'first_semester' && 'الفصل الأول'}
                                {period.type === 'second_semester' && 'الفصل الثاني'}
                                {period.type === 'summer' && 'الفصل الصيفي'}
                              </td>
                              <td>{formatGregorianDate(period.start_date)}</td>
                              <td>{formatGregorianDate(period.end_date)}</td>
                              <td>
                                {period.is_current ? (
                                  <span className="current-badge">حالي</span>
                                ) : (
                                  <span className="not-current-badge">غير حالي</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div id="calendarPreview" className="preview-container">
                <div className="preview-header">
                  <h2>عرض التقويم الأكاديمي</h2>
                  <button 
                    className="print-btn"
                    onClick={() => window.print()}
                  >
                    <i className="fas fa-print"></i> طباعة التقويم
                  </button>
                </div>
                <div className="preview-content">
                  <h3 id="previewYear" className="preview-title">
                    العام الأكاديمي: {getCurrentAcademicYear()}
                  </h3>

                  <div className="table-container">
                    <table className="academic-calendar-table">
                      <thead>
                        <tr>
                          <th>الفصل الدراسي</th>
                          <th>تاريخ البداية</th>
                          <th>تاريخ النهاية</th>
                          <th>المدة (أيام)</th>
                        </tr>
                      </thead>
                      <tbody id="previewContent">
                        <tr>
                          <td>الفصل الدراسي الأول</td>
                          <td>{formatGregorianDate(formData.firstTerm.start)}</td>
                          <td>{formatGregorianDate(formData.firstTerm.end)}</td>
                          <td>{calculateDays(formData.firstTerm.start, formData.firstTerm.end)} يوم</td>
                        </tr>
                        <tr>
                          <td>الفصل الدراسي الثاني</td>
                          <td>{formatGregorianDate(formData.secondTerm.start)}</td>
                          <td>{formatGregorianDate(formData.secondTerm.end)}</td>
                          <td>{calculateDays(formData.secondTerm.start, formData.secondTerm.end)} يوم</td>
                        </tr>
                        {formData.summerTerm.start && (
                          <tr>
                            <td>الفصل الصيفي</td>
                            <td>{formatGregorianDate(formData.summerTerm.start)}</td>
                            <td>{formatGregorianDate(formData.summerTerm.end)}</td>
                            <td>{calculateDays(formData.summerTerm.start, formData.summerTerm.end)} يوم</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="preview-summary">
                    <h4>ملخص العام الأكاديمي:</h4>
                    <ul>
                      <li>عدد الفصول: {formData.summerTerm.start ? '3' : '2'}</li>
                      <li>إجمالي أيام الدراسة: {
                        calculateDays(formData.firstTerm.start, formData.firstTerm.end) +
                        calculateDays(formData.secondTerm.start, formData.secondTerm.end) +
                        (formData.summerTerm.start ? calculateDays(formData.summerTerm.start, formData.summerTerm.end) : 0)
                      } يوم</li>
                      <li>تاريخ الإنشاء: {formatGregorianDate(new Date().toISOString())}</li>
                    </ul>
                  </div>

                  <div className="preview-actions">
                    <button
                      id="backToForm"
                      className="btn btn-back"
                      onClick={() => setShowPreview(false)}
                    >
                      <i className="fas fa-edit"></i> تعديل التواريخ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicPeriods;