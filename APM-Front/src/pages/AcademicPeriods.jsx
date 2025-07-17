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

  // جلب بيانات المستخدم
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
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

  useEffect(() => {
    const arabicLocale = {
      weekdays: {
        shorthand: ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
        longhand: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
      },
      months: {
        shorthand: ["محرم", "صفر", "ربيع أول", "ربيع ثاني", "جمادى أول", "جمادى ثاني", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"],
        longhand: ["محرم", "صفر", "ربيع الأول", "ربيع الثاني", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"]
      },
      firstDayOfWeek: 6
    };

    flatpickr.localize(Arabic);
    const config = {
      locale: arabicLocale,
      dateFormat: "Y-m-d",
      hijri: true,
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
        Authorization: `Bearer ${token}`
      }
    });

    const periods = [
      {
        name: 'first_semester',
        type: 'first_semester',
        start_date: formData.firstTerm.start,
        end_date: formData.firstTerm.end
      },
      {
        name: 'second_semester',
        type: 'second_semester',
        start_date: formData.secondTerm.start,
        end_date: formData.secondTerm.end
      }
    ];

    if (formData.summerTerm.start && formData.summerTerm.end) {
      periods.push({
        name: 'summer',
        type: 'summer',
        start_date: formData.summerTerm.start,
        end_date: formData.summerTerm.end
      });
    }

    try {
      await Promise.all(periods.map(p => api.post('/academic-periods', p)));

      setShowSuccess(true);
      setShowPreview(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء الحفظ');
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

  const formatHijriDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric', calendar: 'islamic' };
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', options).format(date);
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
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

                    <div className="grid grid-cols-2">
                      <div>
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
                      <div>
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

                    <div className="grid grid-cols-2">
                      <div>
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
                      <div>
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
                      <span className="term-badge">أساسي</span>
                    </div>

                    <div id="summerTermFields" className="grid grid-cols-2">
                      <div>
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
                      <div>
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
              </div>
            ) : (
              <div id="calendarPreview" className="preview-container">
                <div className="preview-header">
                  <h2>عرض التقويم الأكاديمي</h2>
                </div>
                <div className="preview-content">
                  <h3 id="previewYear" className="preview-title">
                    العام الجامعي: {formData.academicYear}
                  </h3>

                  <div className="table-container">
                    <table>
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
                          <td>الفصل الأول</td>
                          <td>{formatHijriDate(formData.firstTerm.start)}</td>
                          <td>{formatHijriDate(formData.firstTerm.end)}</td>
                          <td>{calculateDays(formData.firstTerm.start, formData.firstTerm.end)} يوم</td>
                        </tr>
                        <tr>
                          <td>الفصل الثاني</td>
                          <td>{formatHijriDate(formData.secondTerm.start)}</td>
                          <td>{formatHijriDate(formData.secondTerm.end)}</td>
                          <td>{calculateDays(formData.secondTerm.start, formData.secondTerm.end)} يوم</td>
                        </tr>
                        {formData.summerTerm.start && (
                          <tr>
                            <td>الفصل الصيفي</td>
                            <td>{formatHijriDate(formData.summerTerm.start)}</td>
                            <td>{formatHijriDate(formData.summerTerm.end)}</td>
                            <td>{calculateDays(formData.summerTerm.start, formData.summerTerm.end)} يوم</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <button
                    id="backToForm"
                    className="btn btn-back"
                    onClick={() => setShowPreview(false)}
                  >
                    <i className="fas fa-edit"></i> تعديل التواريخ
                  </button>
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