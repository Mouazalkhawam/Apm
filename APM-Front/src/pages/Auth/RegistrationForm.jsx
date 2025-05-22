import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faPlus, faUserGraduate, faSave, faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import './Registration.css';

const RegistrationForm = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        gpa: '0',
        agreeTerms: false
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

    useEffect(() => {
        updateGpaBar();
        fetchAvailableSkills();
    }, [formData.gpa]);

    const fetchAvailableSkills = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/all-skills');
            const data = await response.json();
            if (data.success) setAvailableSkills(data.data);
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
        const gpaInput = document.getElementById('gpa');
        const gpaProgress = document.getElementById('gpaProgress');
        const gpaValue = document.getElementById('gpaValue');
        
        let gpa = parseFloat(formData.gpa);
        if (isNaN(gpa) || gpa < 0) gpa = 0;
        if (gpa > 4) gpa = 4;
        
        const percentage = (gpa / 4) * 100;
        if (gpaProgress) gpaProgress.style.width = `${percentage}%`;
        if (gpaValue) gpaValue.textContent = gpa.toFixed(2);
        
        if (gpaProgress) {
            if (gpa >= 3.75) {
                gpaProgress.style.background = 'linear-gradient(90deg, #27ae60 0%, #2ecc71 100%)';
            } else if (gpa >= 2.75) {
                gpaProgress.style.background = 'linear-gradient(90deg, #f39c12 0%, #f1c40f 100%)';
            } else {
                gpaProgress.style.background = 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)';
            }
        }
    };
    const handleExperienceChange = (e) => {
        const { name, value } = e.target;
        setNewExperience(prev => ({ ...prev, [name]: value }));
    };

    const saveExperience = () => {
        if (experiences.length >= 5) return alert('الحد الأقصى 5 مشاريع');
        if (newExperience.title && newExperience.date && newExperience.description) {
            setExperiences(prev => [...prev, newExperience]);
            setNewExperience({ title: '', date: '', description: '' });
            setShowModal(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const form = new FormData();
            form.append('name', formData.name);
            form.append('email', formData.email);
            form.append('password', formData.password);
            form.append('password_confirmation', formData.confirmPassword);
            form.append('profile_picture', photoFile);

            const regResponse = await fetch('http://127.0.0.1:8000/api/register', {
                method: 'POST',
                body: form
            });
            
            if (!regResponse.ok) throw new Error('فشل التسجيل');
            
            const { access_token, user } = await regResponse.json();
            
            await updateProfile(access_token);
            await addSkills(access_token);
            
            setShowSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
            
        } catch (error) {
            alert(error.message);
        }
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            alert('كلمات المرور غير متطابقة!');
            return false;
        }
      /*  if (!formData.agreeTerms || !photoFile) {
            alert('الرجاء استكمال جميع الحقول المطلوبة');
            return false;
        }*/
        return true;
    };

    const updateProfile = async (token) => {
        const response = await fetch('http://127.0.0.1:8000/api/student/profile/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                gpa: formData.gpa,
                experience: JSON.stringify(experiences)
            })
        });
        if (!response.ok) throw new Error('فشل تحديث الملف');
    };

    const addSkills = async (token) => {
        for (const skill of skills) {
            const response = await fetch('http://127.0.0.1:8000/api/student/profile/skills/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ skill_id: skill.id })
            });
            if (!response.ok) console.error('فشل إضافة المهارة:', skill.name);
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
                                className="form-input"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="الاسم الثلاثي"
                            />
                        </div>

                        <div className="form-group half-width">
                            <label htmlFor="email" className="form-label">البريد الجامعي</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="example@university.edu.sa"
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
                                minLength="6"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                            />
                            <small className="form-note">8 أحرف على الأقل</small>
                        </div>

                        <div className="form-group half-width">
                            <label htmlFor="confirmPassword" className="form-label">تأكيد كلمة المرور</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className="form-input"
                                required
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="••••••••"
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