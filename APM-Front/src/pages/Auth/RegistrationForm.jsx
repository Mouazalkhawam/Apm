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
            type: 'text', // إضافة نوع افتراضي
            title: '',
            date: '',
            description: '',
            content: ''
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
                reader.onloadend = () => {
                    setPhotoPreview(reader.result);
                    // تأكيد أن الملف تم تعيينه
                    console.log('File selected:', file);
                };
                reader.readAsDataURL(file);
            } else {
                setPhotoFile(null);
                setPhotoPreview(null);
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
            let gpa = parseFloat(formData.gpa) || 0;
            gpa = Math.max(0, Math.min(gpa, 4));
        
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
                alert('الحد الأقصى 5 خبرات');
                return;
            }
            
            let newExp;
            
            if (newExperience.type === 'text') {
                if (!newExperience.title || !newExperience.description) {
                    alert('الرجاء إدخال العنوان والوصف');
                    return;
                }
                newExp = {
                    type: 'text',
                    content: JSON.stringify({
                        title: newExperience.title,
                        date: newExperience.date || 'بدون تاريخ',
                        description: newExperience.description
                    })
                };
            } 
            else if (newExperience.type === 'image') {
                if (!newExperience.content) {
                    alert('الرجاء اختيار صورة');
                    return;
                }
                newExp = {
                    type: 'image',
                    content: newExperience.content
                };
            }
            else if (newExperience.type === 'video') {
                if (!newExperience.content) {
                    alert('الرجاء إدخال رابط الفيديو');
                    return;
                }
                
                if (!newExperience.content.includes('youtube.com') && !newExperience.content.includes('youtu.be')) {
                    alert('يجب أن يكون الرابط من يوتيوب');
                    return;
                }
                
                newExp = {
                    type: 'video',
                    content: newExperience.content
                };
            }
            
            if (newExp) {
                setExperiences(prev => [...prev, newExp]);
                setNewExperience({ 
                    type: 'text',
                    title: '',
                    date: '',
                    description: '',
                    content: ''
                });
                setShowModal(false);
            }
        };

        const removeExperience = (index) => {
            const updatedExperiences = [...experiences];
            updatedExperiences.splice(index, 1);
            setExperiences(updatedExperiences);
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
            
            if (!validateForm()) return;
            
            try {
                const formDataToSend = new FormData();
                formDataToSend.append('name', formData.name.trim());
                formDataToSend.append('email', formData.email.trim());
                formDataToSend.append('phone', formData.phone.trim() || '');
                formDataToSend.append('password', formData.password);
                formDataToSend.append('password_confirmation', formData.confirmPassword);
                
                // إضافة الصورة مع اسم الملف
                if (photoFile) {
                    formDataToSend.append('profile_picture', photoFile, photoFile.name);
                }
        
                const regResponse = await axios.post('http://127.0.0.1:8000/api/register', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json'
                    }
                });
                const { access_token, user } = regResponse.data;
                console.log('Registration successful:', user);
        
                // 2. إعداد بيانات الخبرات
                const formattedExperiences = experiences.map(exp => ({
                    type: exp.type,
                    content: exp.content
                }));
        
                // 3. تحديث الملف الشخصي مع الخبرات
                await axios.put('http://127.0.0.1:8000/api/student/profile/update', {
                    university_number: formData.universityNumber,
                    major: formData.major,
                    academic_year: formData.academicYear,
                    gpa: formData.gpa,
                    experience: formattedExperiences
                }, {
                    headers: {
                        'Authorization': `Bearer ${access_token}`,
                        'Content-Type': 'application/json'
                    }
                });
        
                // 4. إضافة المهارات
                if (skills.length > 0) {
                    await Promise.all(skills.map(skill => 
                        axios.post('http://127.0.0.1:8000/api/student/profile/skills/add', 
                            { skill_id: skill.id },
                            { headers: { 'Authorization': `Bearer ${access_token}` } }
                        )
                    ));
                }
        
                localStorage.setItem('access_token', access_token);
                setShowSuccess(true);
                setTimeout(() => navigate('/profile'), 3000);
        
            } catch (error) {
                console.error('Registration error:', error);
                if (error.response?.status === 422) {
                    const serverErrors = {};
                    Object.entries(error.response.data.errors || {}).forEach(([field, messages]) => {
                        serverErrors[field] = messages[0];
                    });
                    setErrors(serverErrors);
                } 
                else {
                    alert(error.response?.data?.message || 'حدث خطأ غير متوقع');
                }
            }
        };

        return (
            <div className="main-container">
                <div className="form-container">
                    <div className="header-section-reg">
                        <h1 className="header-title">إنشاء حساب طالب جديد</h1>
                        <p className="header-description">املأ النموذج التالي لتسجيل حسابك في النظام</p>
                    </div>

                    <form id="registrationForm" onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="form-row">
                            {/* Personal Information Section */}
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
                                    placeholder="example@university.edu.sy"
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
                            
                            {/* Academic Information Section */}
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

                            {/* Security Section */}
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

                            {/* Profile Picture */}
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

                            {/* Skills Section */}
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

                            {/* GPA Section */}
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

                            {/* Experiences Section */}
                            <div className="form-group">
                                <label className="form-label">الخبرات الأكاديمية</label>
                                <div id="experiencesContainer">
                                    {experiences.map((exp, index) => {
                                        try {
                                            let content;
                                            let displayData;
                                            
                                            if (exp.type === 'text') {
                                                try {
                                                    content = typeof exp.content === 'string' ? JSON.parse(exp.content) : exp.content;
                                                    displayData = {
                                                        title: content.title || 'خبرة أكاديمية',
                                                        date: content.date || 'بدون تاريخ',
                                                        description: content.description || exp.content
                                                    };
                                                } catch (e) {
                                                    displayData = {
                                                        title: 'خبرة أكاديمية',
                                                        date: 'بدون تاريخ',
                                                        description: exp.content
                                                    };
                                                }
                                            } else {
                                                displayData = {
                                                    title: exp.type === 'image' ? 'صورة خبرة' : 'فيديو خبرة',
                                                    date: 'بدون تاريخ',
                                                    description: exp.type === 'image' ? 'صورة مرفوعة' : 'فيديو مرفوع'
                                                };
                                            }
                                            
                                            return (
                                                <div key={index} className="experience-item">
                                                    <div className="experience-header">
                                                        <span className="experience-title">{displayData.title}</span>
                                                        <span className="experience-date">{displayData.date}</span>
                                                        <button 
                                                            className="remove-experience-btn"
                                                            onClick={() => removeExperience(index)}
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </button>
                                                    </div>
                                                    <p className="experience-description">{displayData.description}</p>
                                                </div>
                                            );
                                        } catch (e) {
                                            console.error('Error displaying experience:', e);
                                            return null;
                                        }
                                    })}
                                    {experiences.length < 5 && (
                                        <div className="add-experience-btn" onClick={() => setShowModal(true)}>
                                            <span>إضافة خبرة جديدة <FontAwesomeIcon icon={faPlus} className="add-icon" /></span>
                                        </div>
                                    )}
                                </div>
                                <small className="form-note">الحد الأقصى 5 خبرات ({5 - experiences.length} متبقية)</small>
                            </div>

                            {/* Terms and Conditions */}
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

                            {/* Submit Button */}
                            <button type="submit" className="submit-btn">
                                <FontAwesomeIcon icon={faUserGraduate} /> تسجيل الحساب
                            </button>
                        </div>
                    </form>
                </div>

                {/* Experience Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <span className="close-modal" onClick={() => setShowModal(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </span>
                            <h2 className="modal-title">إضافة خبرة جديدة</h2>
                            
                            {/* نوع الخبرة */}
                            <div className="form-group">
                                <label className="form-label">نوع الخبرة</label>
                                <select 
                                    className="form-input"
                                    value={newExperience.type || 'text'}
                                    onChange={(e) => setNewExperience({...newExperience, type: e.target.value})}
                                >
                                    <option value="text">نص</option>
                                    <option value="image">صورة</option>
                                    <option value="video">فيديو</option>
                                </select>
                            </div>
                            
                            {/* حقول النص */}
                            {newExperience.type === 'text' && (
                                <>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="title"
                                            className="form-input"
                                            placeholder="عنوان الخبرة"
                                            value={newExperience.title || ''}
                                            onChange={handleExperienceChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="date"
                                            className="form-input"
                                            placeholder="الفترة الزمنية"
                                            value={newExperience.date || ''}
                                            onChange={handleExperienceChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <textarea
                                            name="description"
                                            className="form-textarea"
                                            rows="4"
                                            placeholder="وصف الخبرة"
                                            value={newExperience.description || ''}
                                            onChange={handleExperienceChange}
                                        ></textarea>
                                    </div>
                                </>
                            )}
                            
                            {/* حقل الصورة */}
                            {newExperience.type === 'image' && (
                                <div className="form-group">
                                    <label className="form-label">رفع صورة</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    setNewExperience({
                                                        ...newExperience,
                                                        content: event.target.result
                                                    });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    {newExperience.content && (
                                        <div className="image-preview">
                                            <img 
                                                src={newExperience.content} 
                                                alt="معاينة الصورة" 
                                                className="preview-image"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* حقل الفيديو */}
                            {newExperience.type === 'video' && (
                                <div className="form-group">
                                    <label className="form-label">رابط الفيديو (يوتيوب فقط)</label>
                                    <input
                                        type="text"
                                        name="content"
                                        className="form-input"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={newExperience.content || ''}
                                        onChange={(e) => setNewExperience({
                                            ...newExperience,
                                            content: e.target.value
                                        })}
                                    />
                                    <small className="form-note">يجب أن يكون الرابط من يوتيوب</small>
                                </div>
                            )}
                            
                            <button 
                                className="save-experience-btn" 
                                onClick={saveExperience}
                                disabled={
                                    (newExperience.type === 'text' && (!newExperience.title || !newExperience.description)) ||
                                    (newExperience.type === 'image' && !newExperience.content) ||
                                    (newExperience.type === 'video' && !newExperience.content)
                                }
                            >
                                <FontAwesomeIcon icon={faSave} /> حفظ
                            </button>
                        </div>
                    </div>
                )}

                {/* Success Message */}
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