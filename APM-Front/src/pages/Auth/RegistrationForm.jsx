import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faPlus, faUserGraduate, faSave, faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './Registration.css';

const RegistrationForm = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        gpa: '0',
        agreeTerms: false,
        universityNumber: '',
        major: '',
        academicYear: '1'
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [skills, setSkills] = useState([]);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newExperience, setNewExperience] = useState({
        title: '',
        date: '',
        description: ''
    });
    const [selectedSkillId, setSelectedSkillId] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [loadingSkills, setLoadingSkills] = useState(true);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        updateGpaBar();
        fetchAvailableSkills();
    }, [formData.gpa]);

    const fetchAvailableSkills = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/all-skills');
            if (response.data.success) {
                setAvailableSkills(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching skills:', error);
        } finally {
            setLoadingSkills(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => fileInputRef.current.click();

    const addSkill = () => {
        if (selectedSkillId && !skills.some(s => s.id == selectedSkillId)) {
            const skill = availableSkills.find(s => s.id == selectedSkillId);
            if (skill) setSkills(prev => [...prev, skill]);
        }
        setSelectedSkillId('');
    };

    const removeSkill = (index) => {
        const updatedSkills = [...skills];
        updatedSkills.splice(index, 1);
        setSkills(updatedSkills);
    };

    const updateGpaBar = () => {
        let gpa = parseFloat(formData.gpa) || 0;  // القيمة الافتراضية 0 إذا لم تُحدد
        gpa = Math.max(0, Math.min(gpa, 4));      // التأكد من أن المعدل بين 0 و 4
    
        const percentage = (gpa / 4) * 100;
        const gpaProgress = document.getElementById('gpaProgress');
        const gpaValue = document.getElementById('gpaValue');
        
        if (gpaProgress) {
            gpaProgress.style.width = `${percentage}%`;
            gpaProgress.style.background = gpa >= 3.75 ? 
                'linear-gradient(90deg, #27ae60 0%, #2ecc71 100%)' :
                gpa >= 2.75 ?
                'linear-gradient(90deg, #f39c12 0%, #f1c40f 100%)' :
                'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)';
        }
        if (gpaValue) gpaValue.textContent = gpa.toFixed(2);
    };

    const handleExperienceChange = (e) => {
        const { name, value } = e.target;
        setNewExperience(prev => ({ ...prev, [name]: value }));
    };

    const saveExperience = () => {
        if (experiences.length >= 5) {
            alert('الحد الأقصى 5 مشاريع');
            return;
        }
        if (newExperience.title && newExperience.date && newExperience.description) {
            setExperiences(prev => [...prev, newExperience]);
            setNewExperience({ title: '', date: '', description: '' });
            setShowModal(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
        }
        
        const requiredFields = ['name', 'email', 'phone', 'universityNumber', 'major'];
        requiredFields.forEach(field => {
            if (!formData[field]?.trim()) {
                newErrors[field] = 'هذا الحقل مطلوب';
            }
        });
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'البريد الإلكتروني غير صالح';
        }
        
        if (!formData.agreeTerms) {
            newErrors.agreeTerms = 'يجب الموافقة على الشروط والأحكام';
        }
        
        if (!photoFile) {
            newErrors.photo = 'يجب رفع صورة شخصية';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // تحقق من الصحة على العميل أولاً
        if (!validateForm()) return;
        
        try {
            // 1. إنشاء FormData وإعداد البيانات
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('email', formData.email.trim());
            formDataToSend.append('phone', formData.phone.trim() || ''); // nullable
            formDataToSend.append('password', formData.password);
            formDataToSend.append('password_confirmation', formData.confirmPassword);
            
            // إضافة الصورة إذا وجدت (nullable)
            if (photoFile) {
                // التحقق من نوع الصورة وحجمها
                const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
                if (!validTypes.includes(photoFile.type)) {
                    setErrors({...errors, photo: 'نوع الصورة غير مدعوم (يجب أن تكون jpeg,png,jpg,gif)'});
                    return;
                }
                
                if (photoFile.size > 2048 * 1024) { // 2048 KB
                    setErrors({...errors, photo: 'حجم الصورة كبير جداً (الحد الأقصى 2MB)'});
                    return;
                }
                
                formDataToSend.append('profile_picture', photoFile);
            }
    
            // 2. إرسال طلب التسجيل
            const regResponse = await axios.post('http://127.0.0.1:8000/api/register', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
    
            const { access_token, user } = regResponse.data;
    
            // 3. تحديث الملف الشخصي للطالب (إذا كان التسجيل ناجحاً)
            const profileResponse = await axios.put('http://127.0.0.1:8000/api/student/profile/update', {
                university_number: formData.universityNumber,
                major: formData.major,
                academic_year: formData.academicYear,
                gpa: formData.gpa,
                experience: JSON.stringify(experiences)
            }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            // 4. إضافة المهارات إذا وجدت
            if (skills.length > 0) {
                await Promise.all(skills.map(skill => 
                    axios.post('http://127.0.0.1:8000/api/student/profile/skills/add', 
                        { skill_id: skill.id },
                        { headers: { 'Authorization': `Bearer ${access_token}` } }
                    )
                  )  );
            }
    
            // 5. حفظ التوكن وإظهار رسالة النجاح
            localStorage.setItem('access_token', access_token);
            setShowSuccess(true);
            setTimeout(() => navigate('/dashboard'), 3000);
    
        } catch (error) {
            console.error('Registration error:', error);
            
            // معالجة أخطاء التحقق من الصحة من الخادم
            if (error.response?.status === 422) {
                console.log("Validation Errors:", error.response.data.errors);
                setErrors(error.response.data.errors); 
                const serverErrors = {};
                Object.entries(error.response.data.errors || {}).forEach(([field, messages]) => {
                    // تحويل أسماء الحقول إذا كانت مختلفة بين Frontend وBackend
                    const fieldName = field === 'profile_picture' ? 'photo' : field;
                    serverErrors[fieldName] = messages[0];
                });
                setErrors(serverErrors);
            } 
            else if (error.response?.data?.message) {
                alert(error.response.data.message);
            } 
            else {
                alert('حدث خطأ غير متوقع أثناء التسجيل. يرجى المحاولة لاحقاً.');
            }
        }
    };
    
    const updateStudentProfile = async (token) => {
        try {
            const profileData = {
                university_number: formData.universityNumber,
                major: formData.major,
                academic_year: formData.academicYear,
                gpa: formData.gpa,
                experience: JSON.stringify(experiences)
            };
            
            await axios.put('http://127.0.0.1:8000/api/student/profile/update', profileData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    };
    
    const addStudentSkills = async (token) => {
        try {
            const skillPromises = skills.map(skill => 
                axios.post('http://127.0.0.1:8000/api/student/profile/skills/add', 
                    { skill_id: skill.id },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                )
            );
            
            await Promise.all(skillPromises);
        } catch (error) {
            console.error('Error adding skills:', error);
            throw error;
        }
    };

    return (
        <div className="main-container">
            <div className="form-container">
                <div className="header-section-reg">
                    <h1 className="header-title">إنشاء حساب طالب جديد</h1>
                    <p className="header-description">املأ النموذج التالي لتسجيل حسابك في النظام</p>
                </div>

                <form id="registrationForm" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label htmlFor="name" className="form-label">الاسم الكامل</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className={`form-input ${errors.name ? 'error' : ''}`}
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="الاسم الثلاثي"
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>

                        <div className="form-group half-width">
                            <label htmlFor="email" className="form-label">البريد الجامعي</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={`form-input ${errors.email ? 'error' : ''}`}
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="example@university.edu.sa"
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>
                        
                        <div className="form-group half-width">
                            <label htmlFor="phone" className="form-label">رقم الجوال</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                className={`form-input ${errors.phone ? 'error' : ''}`}
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="05XXXXXXXX"
                            />
                            {errors.phone && <span className="error-message">{errors.phone}</span>}
                        </div>
                        
                        <div className="form-group half-width">
                            <label htmlFor="universityNumber" className="form-label">الرقم الجامعي</label>
                            <input
                                type="text"
                                id="universityNumber"
                                name="universityNumber"
                                className={`form-input ${errors.universityNumber ? 'error' : ''}`}
                                required
                                value={formData.universityNumber}
                                onChange={handleInputChange}
                                placeholder="الرقم الجامعي"
                            />
                            {errors.universityNumber && <span className="error-message">{errors.universityNumber}</span>}
                        </div>
                        
                        <div className="form-group half-width">
                            <label htmlFor="major" className="form-label">التخصص</label>
                            <input
                                type="text"
                                id="major"
                                name="major"
                                className={`form-input ${errors.major ? 'error' : ''}`}
                                required
                                value={formData.major}
                                onChange={handleInputChange}
                                placeholder="التخصص الدراسي"
                            />
                            {errors.major && <span className="error-message">{errors.major}</span>}
                        </div>

                        <div className="form-group half-width">
                            <label htmlFor="academicYear" className="form-label">السنة الدراسية</label>
                            <select
                                id="academicYear"
                                name="academicYear"
                                className="form-input"
                                required
                                value={formData.academicYear}
                                onChange={handleInputChange}
                            >
                                <option value="1">الأولى</option>
                                <option value="2">الثانية</option>
                                <option value="3">الثالثة</option>
                                <option value="4">الرابعة</option>
                                <option value="5">الخامسة</option>
                            </select>
                        </div>

                        <div className="form-group half-width">
                            <label htmlFor="password" className="form-label">كلمة المرور</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className={`form-input ${errors.password ? 'error' : ''}`}
                                required
                                minLength="6"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                            />
                            <small className="form-note">8 أحرف على الأقل</small>
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>

                        <div className="form-group half-width">
                            <label htmlFor="confirmPassword" className="form-label">تأكيد كلمة المرور</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                required
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">الصورة الشخصية</label>
                            <div className="photo-upload" onClick={triggerFileInput}>
                                {photoPreview ? (
                                    <img src={photoPreview} alt="صورة الطالب" className="photo-preview" />
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faUserCircle} className="photo-icon" />
                                        <p className="photo-text">انقر لرفع الصورة</p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    hidden
                                    onChange={handlePhotoUpload}
                                />
                            </div>
                            {errors.photo && <span className="error-message">{errors.photo}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">المهارات</label>
                            <div className="skills-container">
                                {skills.map((skill, index) => (
                                    <div key={skill.id} className="skill-tag">
                                        <span className="remove-skill" onClick={() => removeSkill(index)}>&times;</span>
                                        {skill.name}
                                    </div>
                                ))}
                            </div>
                            <div className="add-skill-container">
                                <select
                                    value={selectedSkillId}
                                    onChange={(e) => setSelectedSkillId(e.target.value)}
                                    className="form-input"
                                    disabled={loadingSkills}
                                >
                                    <option value="">{loadingSkills ? 'جاري التحميل...' : 'اختر مهارة'}</option>
                                    {availableSkills.map(skill => (
                                        <option key={skill.id} value={skill.id}>{skill.name}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    className="add-skill-btn"
                                    onClick={addSkill}
                                    disabled={!selectedSkillId}
                                >
                                    <FontAwesomeIcon icon={faPlus} /> إضافة
                                </button>
                            </div>
                            <small className="form-note">اختر من القائمة المنسدلة</small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">المعدل التراكمي</label>
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
                                    max="4"
                                    step="0.01"
                                    value={formData.gpa}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                />
                                <span className="gpa-value" id="gpaValue">0.00</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">الخبرات الأكاديمية</label>
                            <div id="experiencesContainer">
                                {experiences.map((exp, index) => (
                                    <div key={index} className="experience-item">
                                        <div className="experience-header">
                                            <span className="experience-title">{exp.title}</span>
                                            <span className="experience-date">{exp.date}</span>
                                        </div>
                                        <p className="experience-description">{exp.description}</p>
                                    </div>
                                ))}
                                <div className="add-experience-btn" onClick={() => setShowModal(true)}>
                                    <span>إضافة خبرة جديدة <FontAwesomeIcon icon={faPlus} className="add-icon" /></span>
                                </div>
                            </div>
                            <small className="form-note">الحد الأقصى 5 خبرات</small>
                        </div>

                        <div className="form-group terms-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="agreeTerms"
                                    checked={formData.agreeTerms}
                                    onChange={handleInputChange}
                                />
                                أوافق على <a href="/terms">الشروط والأحكام</a>
                            </label>
                            {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}
                        </div>

                        <button type="submit" className="submit-btn">
                            <FontAwesomeIcon icon={faUserGraduate} /> تسجيل الحساب
                        </button>
                    </div>
                </form>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <span className="close-modal" onClick={() => setShowModal(false)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </span>
                        <h2 className="modal-title">إضافة خبرة جديدة</h2>
                        <div className="form-group">
                            <input
                                type="text"
                                name="title"
                                className="form-input"
                                placeholder="عنوان الخبرة"
                                value={newExperience.title}
                                onChange={handleExperienceChange}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                name="date"
                                className="form-input"
                                placeholder="الفترة الزمنية"
                                value={newExperience.date}
                                onChange={handleExperienceChange}
                            />
                        </div>
                        <div className="form-group">
                            <textarea
                                name="description"
                                className="form-textarea"
                                rows="4"
                                placeholder="وصف الخبرة"
                                value={newExperience.description}
                                onChange={handleExperienceChange}
                            ></textarea>
                        </div>
                        <button className="save-experience-btn" onClick={saveExperience}>
                            <FontAwesomeIcon icon={faSave} /> حفظ
                        </button>
                    </div>
                </div>
            )}

            {showSuccess && (
                <div className="success-message">
                    <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
                    <h2 className="success-title">تم التسجيل بنجاح!</h2>
                    <p className="success-text">سيتم تحويلك لصفحة الدخول خلال 3 ثواني</p>
                    <button className="success-close-btn" onClick={() => navigate('/login')}>
                        تم
                    </button>
                </div>
            )}
        </div>
    );
};

export default RegistrationForm;