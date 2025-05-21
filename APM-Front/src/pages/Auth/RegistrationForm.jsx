import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faPlus, faUserGraduate, faSave, faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import './Registration.css';

const RegistrationForm = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        universityId: '',
        college: '',
        major: '',
        year: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        gpa: '0',
        agreeTerms: false
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [skills, setSkills] = useState(['HTML/CSS', 'JavaScript', 'Python', 'إدارة المشاريع', 'التفكير النقدي']);
    const [experiences, setExperiences] = useState([
        {
            title: 'مشروع التخرج',
            date: '2022 - 2023',
            description: 'تصميم وتنفيذ نظام إدارة المشاريع الأكاديمية باستخدام تقنيات الويب الحديثة'
        }
    ]);
    const [showModal, setShowModal] = useState(false);
    const [newExperience, setNewExperience] = useState({
        title: '',
        date: '',
        description: ''
    });
    const [newSkill, setNewSkill] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // Initialize GPA bar
    useEffect(() => {
        updateGpaBar();
    }, [formData.gpa]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const addSkill = () => {
        if (newSkill.trim()) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const removeSkill = (index) => {
        const updatedSkills = [...skills];
        updatedSkills.splice(index, 1);
        setSkills(updatedSkills);
    };

    const updateGpaBar = () => {
        const gpaInput = document.getElementById('gpa');
        const gpaProgress = document.getElementById('gpaProgress');
        const gpaValue = document.getElementById('gpaValue');
        
        let gpa = parseFloat(formData.gpa);
        if (isNaN(gpa) || gpa < 0) gpa = 0;
        if (gpa > 5) gpa = 5;
        
        const percentage = (gpa / 5) * 100;
        if (gpaProgress) gpaProgress.style.width = `${percentage}%`;
        if (gpaValue) gpaValue.textContent = gpa.toFixed(2);
        
        // Change color based on GPA
        if (gpaProgress) {
            if (gpa >= 4.5) {
                gpaProgress.style.background = 'linear-gradient(90deg, #27ae60 0%, #2ecc71 100%)';
            } else if (gpa >= 3.5) {
                gpaProgress.style.background = 'linear-gradient(90deg, #f39c12 0%, #f1c40f 100%)';
            } else {
                gpaProgress.style.background = 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)';
            }
        }
    };

    const handleExperienceChange = (e) => {
        const { name, value } = e.target;
        setNewExperience({
            ...newExperience,
            [name]: value
        });
    };

    const saveExperience = () => {
        if (newExperience.title && newExperience.date && newExperience.description) {
            setExperiences([...experiences, newExperience]);
            setNewExperience({ title: '', date: '', description: '' });
            setShowModal(false);
            showSuccessMessage('تم إضافة الخبرة بنجاح!');
        } else {
            alert('الرجاء ملئ جميع الحقول المطلوبة');
        }
    };

    const showSuccessMessage = (message) => {
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
        }, 3000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            alert('كلمات المرور غير متطابقة!');
            return;
        }
        
        if (formData.password.length < 8) {
            alert('يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل');
            return;
        }
        
        // Check if terms are agreed
        if (!formData.agreeTerms) {
            alert('يجب الموافقة على شروط وأحكام استخدام النظام');
            return;
        }
        
        // Check if photo is uploaded
        if (!photoPreview) {
            alert('الرجاء رفع صورة شخصية');
            return;
        }
        
        // Check experiences count (max 5)
        if (experiences.length > 5) {
            alert('يمكنك إضافة ما يصل إلى 5 مشروعات أكاديمية فقط');
            return;
        }
        
        // Prepare data for submission
        const submissionData = {
            ...formData,
            photo: photoPreview,
            skills,
            experiences
        };
        
        console.log('Form Data:', submissionData);
        
        // Show success message and reset form
        setShowSuccess(true);
        setFormData({
            firstName: '',
            lastName: '',
            universityId: '',
            college: '',
            major: '',
            year: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            gpa: '0',
            agreeTerms: false
        });
        setPhotoPreview(null);
        setSkills([]);
        setExperiences([]);
        
        // Redirect after 3 seconds
        setTimeout(() => {
            navigate('/login');
        }, 3000);
    };

    return (
        <div className="main-container">
            <div className="form-container">
                <div className="header-section">
                    <h1 className="header-title">إنشاء حساب طالب جديد</h1>
                    <p className="header-description">املأ النموذج التالي لتسجيل حسابك في نظام إدارة المشاريع الأكاديمية وابدأ رحلتك التعليمية</p>
                </div>
                
                <form id="registrationForm" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label htmlFor="firstName" className="form-label">الاسم الأول</label>
                            <input 
                                type="text" 
                                id="firstName" 
                                name="firstName" 
                                className="form-input" 
                                required 
                                placeholder="ادخل اسمك الأول"
                                value={formData.firstName}
                                onChange={handleInputChange}
                            />
                        </div>
                        
                        <div className="form-group half-width">
                            <label htmlFor="lastName" className="form-label">اسم العائلة</label>
                            <input 
                                type="text" 
                                id="lastName" 
                                name="lastName" 
                                className="form-input" 
                                required 
                                placeholder="ادخل اسم العائلة"
                                value={formData.lastName}
                                onChange={handleInputChange}
                            />
                        </div>
                        
                        <div className="form-group half-width">
                            <label htmlFor="universityId" className="form-label">الرقم الجامعي</label>
                            <input 
                                type="text" 
                                id="universityId" 
                                name="universityId" 
                                className="form-input" 
                                required 
                                placeholder="ادخل رقمك الجامعي"
                                value={formData.universityId}
                                onChange={handleInputChange}
                            />
                        </div>
                        
                        <div className="form-group half-width">
                            <label htmlFor="college" className="form-label">الكلية</label>
                            <select 
                                id="college" 
                                name="college" 
                                className="form-select" 
                                required
                                value={formData.college}
                                onChange={handleInputChange}
                            >
                                <option value="">اختر الكلية</option>
                                <option value="engineering">كلية الهندسة</option>
                                <option value="medicine">كلية الطب</option>
                                <option value="science">كلية العلوم</option>
                                <option value="arts">كلية الآداب</option>
                                <option value="business">كلية إدارة الأعمال</option>
                            </select>
                        </div>
                        
                        <div className="form-group half-width">
                            <label htmlFor="major" className="form-label">التخصص</label>
                            <input 
                                type="text" 
                                id="major" 
                                name="major" 
                                className="form-input" 
                                required 
                                placeholder="ادخل تخصصك"
                                value={formData.major}
                                onChange={handleInputChange}
                            />
                        </div>
                        
                        <div className="form-group half-width">
                            <label htmlFor="year" className="form-label">السنة الدراسية</label>
                            <select 
                                id="year" 
                                name="year" 
                                className="form-select" 
                                required
                                value={formData.year}
                                onChange={handleInputChange}
                            >
                                <option value="">اختر السنة</option>
                                <option value="1">الأولى</option>
                                <option value="2">الثانية</option>
                                <option value="3">الثالثة</option>
                                <option value="4">الرابعة</option>
                                <option value="5">الخامسة</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">البريد الإلكتروني الجامعي</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                className="form-input" 
                                required 
                                placeholder="ادخل بريدك الجامعي"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        
                        <div className="form-group half-width">
                            <label htmlFor="password" className="form-label">كلمة المرور</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                className="form-input" 
                                required 
                                placeholder="******"
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                            <small className="form-note">يجب أن تحتوي على 8 أحرف على الأقل</small>
                        </div>
                        
                        <div className="form-group half-width">
                            <label htmlFor="confirmPassword" className="form-label">تأكيد كلمة المرور</label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                name="confirmPassword" 
                                className="form-input" 
                                required 
                                placeholder="******"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="phone" className="form-label">رقم الجوال</label>
                            <input 
                                type="tel" 
                                id="phone" 
                                name="phone" 
                                className="form-input" 
                                required 
                                placeholder="ادخل رقم جوالك"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">الصورة الشخصية</label>
                            <div className="photo-upload" onClick={triggerFileInput}>
                                {photoPreview ? (
                                    <img src={photoPreview} alt="صورة الطالب" className="photo-preview" />
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faUserCircle} className="photo-icon" />
                                        <p className="photo-text">انقر لرفع صورة شخصية</p>
                                    </>
                                )}
                                <input 
                                    type="file" 
                                    id="photoInput" 
                                    ref={fileInputRef}
                                    accept="image/*" 
                                    style={{ display: 'none' }}
                                    onChange={handlePhotoUpload}
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">المهارات</label>
                            <div className="skills-container">
                                {skills.map((skill, index) => (
                                    <div key={index} className="skill-tag">
                                        <span className="remove-skill" onClick={() => removeSkill(index)}>&times;</span>
                                        {skill}
                                    </div>
                                ))}
                            </div>
                            <div className="add-skill-container">
                                <input 
                                    type="text" 
                                    id="newSkill" 
                                    className="add-skill-input form-input" 
                                    placeholder="أضف مهارة جديدة..."
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                />
                                <button 
                                    type="button" 
                                    id="addSkillBtn" 
                                    className="add-skill-btn"
                                    onClick={addSkill}
                                >
                                    <FontAwesomeIcon icon={faPlus} /> إضافة
                                </button>
                            </div>
                            <small className="form-note">اضف مهاراتك التقنية والأكاديمية</small>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">المعدل التراكمي (GPA)</label>
                            <div className="gpa-container">
                                <div className="gpa-bar">
                                    <div className="gpa-progress" id="gpaProgress"></div>
                                </div>
                                <input 
                                    type="number" 
                                    id="gpa" 
                                    name="gpa" 
                                    className="gpa-input form-input" 
                                    min="0" 
                                    max="5" 
                                    step="0.01" 
                                    value={formData.gpa}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                />
                                <span className="gpa-value" id="gpaValue">0.00</span>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">الخبرات والمشاريع السابقة</label>
                            <div id="experiencesContainer">
                                {experiences.map((exp, index) => (
                                    <div key={index} className="experience-item">
                                        <div className="experience-header">
                                            <span className="experience-title">{exp.title}</span>
                                            <span className="experience-date">{exp.date}</span>
                                        </div>
                                        <p className="experience-description">
                                            {exp.description}
                                        </p>
                                    </div>
                                ))}
                                <div 
                                    className="add-experience-btn" 
                                    id="addExperienceBtn"
                                    onClick={() => setShowModal(true)}
                                >
                                    <span>إضافة خبرة جديدة <FontAwesomeIcon icon={faPlus} className="add-icon" /></span>
                                </div>
                            </div>
                            <small className="form-note">يمكنك إضافة ما يصل إلى 5 مشروعات أكاديمية</small>
                        </div>
                        
                        <div className="terms-container">
                            <input 
                                type="checkbox" 
                                id="agreeTerms" 
                                name="agreeTerms" 
                                className="terms-checkbox" 
                                required
                                checked={formData.agreeTerms}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="agreeTerms" className="terms-label">أوافق على <a href="#" target="_blank" className="terms-link">شروط وأحكام</a> استخدام النظام</label>
                        </div>
                        
                        <button type="submit" className="submit-btn">
                            تسجيل الحساب <FontAwesomeIcon icon={faUserGraduate} className="submit-icon" />
                        </button>
                    </div>
                </form>
            </div>
            
      
      {/* Experience Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-modal" onClick={closeExperienceModal}>
              <FontAwesomeIcon icon={faTimes} />
            </span>
            <h2 className="modal-title">إضافة خبرة جديدة</h2>
            <div className="form-group">
              <label htmlFor="expTitle" className="form-label">عنوان الخبرة/المشروع</label>
              <input
                type="text"
                id="expTitle"
                name="title"
                className="form-input"
                required
                placeholder="مثال: مشروع التخرج"
                value={newExperience.title}
                onChange={handleExperienceChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="expDate" className="form-label">الفترة الزمنية</label>
              <input
                type="text"
                id="expDate"
                name="date"
                className="form-input"
                placeholder="مثال: 2021 - 2022"
                required
                value={newExperience.date}
                onChange={handleExperienceChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="expDescription" className="form-label">وصف الخبرة/المشروع</label>
              <textarea
                id="expDescription"
                name="description"
                className="form-textarea"
                rows="4"
                required
                placeholder="وصف مختصر للمشروع وأهدافه والنتائج المتحققة..."
                value={newExperience.description}
                onChange={handleExperienceChange}
              ></textarea>
            </div>
            <button type="button" className="save-experience-btn" onClick={saveExperience}>
              حفظ الخبرة <FontAwesomeIcon icon={faSave} />
            </button>
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {showSuccess && (
        <div className="success-message">
          <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
          <h2 className="success-title">تم إنشاء الحساب بنجاح!</h2>
          <p className="success-text">سيتم مراجعة بياناتك من قبل المسؤول وتفعيل الحساب خلال 24 ساعة</p>
          <button className="success-close-btn" onClick={() => {
            setShowSuccess(false);
            navigate('/login');
          }}>
            تم
          </button>
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;